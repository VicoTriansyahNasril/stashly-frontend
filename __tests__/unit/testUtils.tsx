import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { StashlyFile } from '../../types/file';

export const renderWithQuery = (ui: ReactNode) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

export const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const FILE_ID = '11111111-1111-4111-8111-111111111111';

export const ownerFile = (overrides: Partial<StashlyFile> = {}): StashlyFile => ({
  id: FILE_ID,
  folderId: null,
  driveFileId: 'drive-123',
  fileName: 'test-document.pdf',
  fileType: 'application/pdf',
  fileSize: 1048576,
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
