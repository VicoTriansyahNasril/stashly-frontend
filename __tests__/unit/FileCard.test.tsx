import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FileCard } from '../../components/FileCard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({ data: { user: { id: 'user-1' } }, status: 'authenticated' }))
}));

// Mock dependencies
const queryClient = new QueryClient();

const mockFile = {
  id: 'file-123',
  userId: 'user-1',
  folderId: null,
  driveFileId: 'drive-123',
  fileName: 'test-document.pdf',
  fileType: 'application/pdf',
  fileSize: 1048576, // 1MB
  isPublic: false,
  password: null,
  expiresAt: null,
  webContentLink: null,
  webViewLink: null,
  uploadedAt: new Date().toISOString(),
  deletedAt: null,
};

describe('FileCard Component', () => {
  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('renders file name correctly', () => {
    renderWithProviders(<FileCard file={mockFile} />);
    expect(screen.getByText('test-document.pdf')).toBeDefined();
  });

  it('renders correctly formatted file size', () => {
    renderWithProviders(<FileCard file={mockFile} />);
    expect(screen.getByText('1 MB')).toBeDefined();
  });

  it('shows trash buttons in trash mode', () => {
    const trashFile = { ...mockFile, deletedAt: new Date().toISOString() };
    renderWithProviders(<FileCard file={trashFile} />);
    // Pulihkan and Hapus Permanen should exist
    expect(screen.getByTitle('Pulihkan')).toBeDefined();
    expect(screen.getByTitle('Hapus Permanen')).toBeDefined();
    // Normal actions should not exist
    expect(screen.queryByTitle('Hapus')).toBeNull();
  });
});
