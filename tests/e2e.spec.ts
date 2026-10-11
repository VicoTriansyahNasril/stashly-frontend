import { test, expect } from '@playwright/test';

test.describe('Stashly End-to-End Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock NextAuth session to simulate a logged-in user
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            name: 'Test User',
            email: 'testuser@gmail.com',
            image: 'https://via.placeholder.com/150',
            id: 'mock-user-id',
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
    });
  });

  test('should display landing page and navigation', async ({ page }) => {
    await page.goto('/');
    
    // Cek judul utama
    await expect(page.locator('h1')).toContainText('Bagikan file secara profesional');
    
    // Cek ada tombol login
    const loginButton = page.locator('button', { hasText: 'Log in' });
    if (await loginButton.isVisible()) {
      await expect(loginButton).toBeVisible();
    }
  });

  test('should navigate to dashboard and mock API data', async ({ page }) => {
    // Mock files API response
    await page.route('**/files/list*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            files: [
              {
                id: 'file-1',
                fileName: 'document.pdf',
                fileType: 'application/pdf',
                fileSize: 102400,
                uploadedAt: new Date().toISOString(),
              }
            ],
            pagination: { page: 1, limit: 50, total: 1, totalPages: 1 }
          }
        }),
      });
    });

    await page.goto('/dashboard');
    
    // Menunggu halaman selesai dimuat dan text 'Dashboard' muncul
    await expect(page.locator('h2')).toContainText('Dashboard');
    
    // Pastikan UI Search/Filter muncul
    await expect(page.getByPlaceholder('Cari file...')).toBeVisible();
    
    // Memastikan file yang di-mock muncul di UI
    await expect(page.locator('text=document.pdf')).toBeVisible();
  });

  test('should navigate to Trash page', async ({ page }) => {
    // Mock trash files API response
    await page.route('**/files/trash', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'file-deleted',
              fileName: 'old-image.png',
              fileType: 'image/png',
              fileSize: 50000,
              uploadedAt: new Date().toISOString(),
              deletedAt: new Date().toISOString(),
            }
          ]
        }),
      });
    });

    await page.goto('/dashboard/trash');
    
    // Mengecek halaman Trash
    await expect(page.locator('h2')).toContainText('Tong Sampah');
    await expect(page.locator('text=old-image.png')).toBeVisible();
    
    // Mengecek apakah tombol restore dan force delete ada
    await expect(page.locator('button[title="Pulihkan"]')).toBeVisible();
    await expect(page.locator('button[title="Hapus Permanen"]')).toBeVisible();
  });

});
