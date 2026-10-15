import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ShareDialog } from '../../components/ShareDialog';
import { FILE_ID, jsonResponse, ownerFile, renderWithQuery } from './testUtils';

afterEach(() => vi.unstubAllGlobals());

const lastBody = (fetchMock: ReturnType<typeof vi.fn>) => JSON.parse(fetchMock.mock.calls.at(-1)![1].body);

describe('ShareDialog', () => {
  it('menyimpan password ke backend (bukan sekadar menutup dialog)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { success: true, data: ownerFile({ hasPassword: true }) }));
    vi.stubGlobal('fetch', fetchMock);

    renderWithQuery(<ShareDialog open onOpenChange={() => {}} file={ownerFile()} />);
    fireEvent.change(screen.getByLabelText(/Kata Sandi/), { target: { value: 'rahasia123' } });
    fireEvent.click(screen.getByText('Simpan'));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`http://localhost:3001/files/${FILE_ID}/share`);
    expect(init.method).toBe('PUT');
    expect(lastBody(fetchMock)).toEqual({ password: 'rahasia123' });
    expect(await screen.findByText('Pengaturan berbagi tersimpan.')).toBeDefined();
  });

  it('menolak password terlalu pendek tanpa request', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    renderWithQuery(<ShareDialog open onOpenChange={() => {}} file={ownerFile()} />);
    fireEvent.change(screen.getByLabelText(/Kata Sandi/), { target: { value: 'abc' } });
    fireEvent.click(screen.getByText('Simpan'));
    expect(screen.getByRole('alert').textContent).toContain('minimal 4');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('bisa menghapus password yang sudah ada', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { success: true, data: ownerFile() }));
    vi.stubGlobal('fetch', fetchMock);
    renderWithQuery(<ShareDialog open onOpenChange={() => {}} file={ownerFile({ hasPassword: true })} />);
    fireEvent.click(screen.getByText('Hapus'));
    fireEvent.click(screen.getByText('Simpan'));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(lastBody(fetchMock)).toEqual({ password: null });
  });

  it('menjadikan file privat dan menampilkan error dari backend', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(400, { success: false, message: 'Tanggal kedaluwarsa harus di masa depan' }));
    vi.stubGlobal('fetch', fetchMock);
    renderWithQuery(<ShareDialog open onOpenChange={() => {}} file={ownerFile()} />);
    fireEvent.click(screen.getByRole('radio', { name: /Privat/ }));
    fireEvent.click(screen.getByText('Simpan'));
    expect(await screen.findByText('Tanggal kedaluwarsa harus di masa depan')).toBeDefined();
    expect(lastBody(fetchMock)).toEqual({ isPublic: false });
  });
});
