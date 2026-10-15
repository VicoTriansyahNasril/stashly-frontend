import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PublicShareView } from '../../components/PublicShareView';
import { FILE_ID, jsonResponse, renderWithQuery } from './testUtils';

const metadata = {
  id: FILE_ID,
  fileName: 'laporan.pdf',
  fileType: 'application/pdf',
  fileSize: 4096,
  uploadedAt: '2026-01-01T00:00:00.000Z',
  expiresAt: null,
  hasPassword: false,
};

afterEach(() => vi.unstubAllGlobals());

describe('PublicShareView', () => {
  it('ID tidak valid langsung ditolak tanpa request ke server', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    renderWithQuery(<PublicShareView fileId="../../etc" />);
    expect(screen.getByText('Tautan Tidak Valid')).toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('error dari backend dirender sebagai teks (tidak crash karena objek)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(410, { success: false, message: 'Tautan file ini sudah kedaluwarsa', error: { code: 410 } })),
    );
    renderWithQuery(<PublicShareView fileId={FILE_ID} />);
    expect(await screen.findByText('Tautan Kedaluwarsa')).toBeDefined();
    expect(screen.getByText('Tautan file ini sudah kedaluwarsa')).toBeDefined();
  });

  it('memakai NEXT_PUBLIC_API_URL / default, bukan URL hardcode', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { success: true, data: metadata }));
    vi.stubGlobal('fetch', fetchMock);
    renderWithQuery(<PublicShareView fileId={FILE_ID} />);
    await screen.findByText('laporan.pdf');
    expect(fetchMock.mock.calls[0][0]).toBe(`http://localhost:3001/files/public/${FILE_ID}`);
  });

  it('file tanpa password: unduhan berupa link langsung (tidak di-buffer ke memori)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, { success: true, data: metadata })));
    renderWithQuery(<PublicShareView fileId={FILE_ID} />);
    const link = (await screen.findByText('Unduh File')).closest('a')!;
    expect(link.getAttribute('href')).toBe(`http://localhost:3001/files/public/${FILE_ID}/stream?download=1`);
  });

  it('file berpassword: password dikirim lewat body POST, lalu token dipakai di URL unduhan', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { success: true, data: { ...metadata, hasPassword: true } }))
      .mockResolvedValueOnce(jsonResponse(403, { success: false, message: 'Password salah' }))
      .mockResolvedValueOnce(jsonResponse(200, { success: true, data: { token: '123.abc', expiresIn: 600 } }));
    vi.stubGlobal('fetch', fetchMock);

    renderWithQuery(<PublicShareView fileId={FILE_ID} />);
    const input = await screen.findByLabelText(/Dilindungi Kata Sandi/);
    expect(screen.queryByText('Unduh File')).toBeNull();

    fireEvent.change(input, { target: { value: 'salah' } });
    fireEvent.click(screen.getByText('Buka File'));
    expect(await screen.findByText('Password salah')).toBeDefined();

    fireEvent.change(input, { target: { value: 'rahasia' } });
    fireEvent.click(screen.getByText('Buka File'));

    const link = (await screen.findByText('Unduh File')).closest('a')!;
    expect(link.getAttribute('href')).toBe(`http://localhost:3001/files/public/${FILE_ID}/stream?download=1&token=123.abc`);

    const [url, init] = fetchMock.mock.calls[2];
    expect(url).toBe(`http://localhost:3001/files/public/${FILE_ID}/unlock`);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ password: 'rahasia' });
    expect(String(url)).not.toContain('rahasia');
  });

  it('gagal koneksi menampilkan pesan yang jelas', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    renderWithQuery(<PublicShareView fileId={FILE_ID} />);
    await waitFor(() => expect(screen.getByText(/Tidak dapat terhubung ke server/)).toBeDefined());
  });
});
