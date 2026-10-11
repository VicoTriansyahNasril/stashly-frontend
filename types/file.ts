export interface StashlyFile {
  id: string;
  driveFileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  isPublic: boolean;
  webContentLink?: string | null;
  webViewLink?: string | null;
  uploadedAt: string;
  deletedAt?: string | null;
}
