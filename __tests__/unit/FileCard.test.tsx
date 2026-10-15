import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FileCard } from '../../components/FileCard';
import { PublicFileCard } from '../../components/PublicFileCard';
import { FILE_ID, ownerFile, renderWithQuery } from './testUtils';

describe('FileCard (pemilik)', () => {
  it('menampilkan nama dan ukuran file', () => {
    renderWithQuery(<FileCard file={ownerFile()} />);
    expect(screen.getByText('test-document.pdf')).toBeDefined();
    expect(screen.getByText('1 MB')).toBeDefined();
  });

  it('tombol unduh mengarah ke endpoint stream milik pemilik (bukan link Drive)', () => {
    renderWithQuery(<FileCard file={ownerFile()} />);
    const link = screen.getByLabelText('Unduh') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe(`http://localhost:3001/files/${FILE_ID}/stream?download=1`);
  });

  it('menampilkan badge status privat / password', () => {
    const { unmount } = renderWithQuery(<FileCard file={ownerFile({ isPublic: false })} />);
    expect(screen.getByText('Privat')).toBeDefined();
    unmount();
    renderWithQuery(<FileCard file={ownerFile({ hasPassword: true })} />);
    expect(screen.getByText('Password')).toBeDefined();
  });

  it('mode tong sampah hanya menampilkan pulihkan & hapus permanen', () => {
    renderWithQuery(<FileCard file={ownerFile({ deletedAt: new Date().toISOString() })} />);
    expect(screen.getByTitle('Pulihkan')).toBeDefined();
    expect(screen.getByTitle('Hapus Permanen')).toBeDefined();
    expect(screen.queryByTitle('Hapus')).toBeNull();
    expect(screen.queryByTitle('Bagikan')).toBeNull();
  });
});

describe('PublicFileCard', () => {
  const publicFile = {
    id: FILE_ID,
    fileName: 'rahasia.pdf',
    fileType: 'application/pdf',
    fileSize: 2048,
    uploadedAt: new Date().toISOString(),
    expiresAt: null,
    hasPassword: false,
  };

  it('file berpassword diarahkan ke halaman share, tanpa tombol unduh langsung', () => {
    renderWithQuery(<PublicFileCard file={{ ...publicFile, hasPassword: true }} />);
    const link = screen.getByText('Buka dengan password').closest('a')!;
    expect(link.getAttribute('href')).toBe(`/s/${FILE_ID}`);
    expect(screen.queryByLabelText('Unduh')).toBeNull();
  });

  it('file tanpa password diunduh lewat endpoint publik backend', () => {
    renderWithQuery(<PublicFileCard file={publicFile} />);
    const link = screen.getByLabelText('Unduh') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe(`http://localhost:3001/files/public/${FILE_ID}/stream?download=1`);
  });
});
