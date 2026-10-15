import { test, expect, type Page } from '@playwright/test';

const FILE_ID = '11111111-1111-4111-8111-111111111111';

const ownerFile = (overrides: Record<string, unknown> = {}) => ({
  id: FILE_ID,
  folderId: null,
  driveFileId: 'drive-1',
  fileName: 'document.pdf',
  fileType: 'application/pdf',
  fileSize: 102400,
  isPublic: true,
  hasPassword: false,
  expiresAt: null,
  webViewLink: null,
  posX: 0,
  posY: 0,
  uploadedAt: new Date().toISOString(),
  deletedAt: null,
  ...overrides,
});

const json = (body: unknown, status = 200) => ({ status, contentType: 'application/json', body: JSON.stringify(body) });

const mockSession = async (page: Page) => {
  await page.route('**/api/auth/session', (route) =>
    route.fulfill(
      json({
        user: { name: 'Test User', email: 'testuser@gmail.com', image: null, id: 'mock-user-id' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }),
    ),
  );
  await page.route('**/users/me', (route) =>
    route.fulfill(
      json({
        success: true,
        data: { id: 'mock-user-id', name: 'Test User', email: 'testuser@gmail.com', image: null, username: 'testuser', storageUsed: 1024, storageLimit: 5368709120, layoutStyle: 'grid' },
      }),
    ),
  );
  await page.route('**/folders', (route) => route.fulfill(json({ success: true, data: [] })));
  // Tur onboarding tidak relevan untuk test
  await page.addInitScript(() => localStorage.setItem('stashly_has_seen_tour', 'true'));
};

test.describe('Stashly End-to-End', () => {
  test('landing page tampil', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Bagikan file secara profesional');
  });

  test('halaman kebijakan privasi & ketentuan dapat diakses dari footer (syarat verifikasi Google)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Privasi' }).click();
    // Dev server mengompilasi halaman saat pertama dibuka, jadi beri waktu lebih.
    await page.waitForURL('**/privacy', { timeout: 30_000 });
    await expect(page.locator('h1')).toContainText('Kebijakan Privasi', { timeout: 15_000 });
    await expect(page.getByText('Penggunaan Terbatas (Limited Use)', { exact: false })).toBeVisible();
    await page.goto('/terms');
    await expect(page.locator('h1')).toContainText('Ketentuan Layanan');
  });

  test('dashboard menampilkan tombol impor dari Google Drive', async ({ page }) => {
    await mockSession(page);
    await page.route('**/files/list*', (route) =>
      route.fulfill(json({ success: true, data: { files: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 1 } } })),
    );
    await page.goto('/dashboard');
    await expect(page.getByRole('button', { name: /Impor dari Google Drive/ })).toBeVisible();
  });

  test('dashboard menampilkan file dari API', async ({ page }) => {
    await mockSession(page);
    await page.route('**/files/list*', (route) =>
      route.fulfill(json({ success: true, data: { files: [ownerFile()], pagination: { page: 1, limit: 12, total: 1, totalPages: 1 } } })),
    );

    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.getByPlaceholder('Cari file...')).toBeVisible();
    await expect(page.locator('text=document.pdf')).toBeVisible();
  });

  test('halaman tong sampah', async ({ page }) => {
    await mockSession(page);
    await page.route('**/files/trash', (route) =>
      route.fulfill(json({ success: true, data: [ownerFile({ fileName: 'old-image.png', fileType: 'image/png', deletedAt: new Date().toISOString() })] })),
    );

    await page.goto('/dashboard/trash');
    await expect(page.locator('h1')).toContainText('Tong Sampah');
    await expect(page.locator('text=old-image.png')).toBeVisible();
    await expect(page.locator('button[title="Pulihkan"]')).toBeVisible();
    await expect(page.locator('button[title="Hapus Permanen"]')).toBeVisible();
  });

  test('halaman share: tautan kedaluwarsa menampilkan pesan, bukan crash', async ({ page }) => {
    await page.route(`**/files/public/${FILE_ID}`, (route) =>
      route.fulfill(json({ success: false, message: 'Tautan file ini sudah kedaluwarsa', error: { code: 410 } }, 410)),
    );
    await page.goto(`/s/${FILE_ID}`);
    await expect(page.locator('h1')).toContainText('Tautan Kedaluwarsa');
  });

  test('halaman share: file berpassword dibuka lewat form', async ({ page }) => {
    await page.route(`**/files/public/${FILE_ID}`, (route) =>
      route.fulfill(json({ success: true, data: { id: FILE_ID, fileName: 'rahasia.pdf', fileType: 'application/pdf', fileSize: 10, uploadedAt: new Date().toISOString(), expiresAt: null, hasPassword: true } })),
    );
    await page.route(`**/files/public/${FILE_ID}/unlock`, (route) =>
      route.fulfill(json({ success: true, data: { token: '999.sig', expiresIn: 600 } })),
    );

    await page.goto(`/s/${FILE_ID}`);
    await page.getByLabel(/Dilindungi Kata Sandi/).fill('rahasia');
    await page.getByRole('button', { name: 'Buka File' }).click();
    await expect(page.getByRole('link', { name: 'Unduh File' })).toHaveAttribute('href', /token=999\.sig/);
  });
});
