import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { jsonResponse, renderWithQuery } from './testUtils';

vi.mock('../../lib/config', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../lib/config')>()),
  isDrivePickerConfigured: true,
}));

const openDrivePicker = vi.fn();
vi.mock('../../lib/googlePicker', () => ({ openDrivePicker: (...args: unknown[]) => openDrivePicker(...args) }));

const { DriveImportButton } = await import('../../components/DriveImportButton');

const tokenResponse = () =>
  jsonResponse(200, { success: true, data: { accessToken: 'ya29.picker', expiresAt: Date.now() + 3600_000 } });

describe('DriveImportButton', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    openDrivePicker.mockReset();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('mengambil token drive.file dari backend lalu mengimpor hanya ID file yang dipilih', async () => {
    fetchMock
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(jsonResponse(201, { success: true, data: { files: [{ id: 'x' }], skipped: 0 } }));
    openDrivePicker.mockResolvedValue([
      { id: 'pdf_1', name: 'a.pdf', mimeType: 'application/pdf', parentId: null },
      { id: 'doc_1', name: 'Doc', mimeType: 'application/vnd.google-apps.document', parentId: null },
    ]);

    renderWithQuery(<DriveImportButton />);
    fireEvent.click(screen.getByRole('button', { name: /Impor/ }));

    expect(await screen.findByText(/1 file diimpor/)).toBeDefined();
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:3001/users/drive-token');
    expect(openDrivePicker).toHaveBeenCalledWith({ mode: 'files', accessToken: 'ya29.picker' });
    const [syncUrl, syncInit] = fetchMock.mock.calls[1];
    expect(syncUrl).toBe('http://localhost:3001/files/sync');
    expect(JSON.parse(syncInit.body)).toEqual({ driveFileIds: ['pdf_1'] });
  });

  it('dibatalkan → tidak ada request impor', async () => {
    fetchMock.mockResolvedValueOnce(tokenResponse());
    openDrivePicker.mockResolvedValue([]);
    renderWithQuery(<DriveImportButton />);
    fireEvent.click(screen.getByRole('button', { name: /Impor/ }));
    await waitFor(() => expect(openDrivePicker).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('izin lama (perlu login ulang) ditampilkan sebagai pesan yang jelas', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(401, { success: false, message: 'Izin Google Drive perlu diperbarui. Silakan logout lalu login kembali.' }),
    );
    renderWithQuery(<DriveImportButton />);
    fireEvent.click(screen.getByRole('button', { name: /Impor/ }));
    expect(await screen.findByRole('alert')).toBeDefined();
    expect(screen.getByRole('alert').textContent).toContain('login kembali');
    expect(openDrivePicker).not.toHaveBeenCalled();
  });

  it('hanya memilih Google Docs → pesan tidak didukung, tanpa impor', async () => {
    fetchMock.mockResolvedValueOnce(tokenResponse());
    openDrivePicker.mockResolvedValue([{ id: 'd', name: 'Doc', mimeType: 'application/vnd.google-apps.document', parentId: null }]);
    renderWithQuery(<DriveImportButton />);
    fireEvent.click(screen.getByRole('button', { name: /Impor/ }));
    expect(await screen.findByText(/belum bisa diimpor/)).toBeDefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
