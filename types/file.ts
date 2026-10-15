/** File milik pengguna yang sedang login (dashboard/trash). */
export interface StashlyFile {
  id: string;
  folderId: string | null;
  driveFileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  isPublic: boolean;
  hasPassword: boolean;
  expiresAt: string | null;
  webViewLink: string | null;
  posX: number;
  posY: number;
  uploadedAt: string;
  deletedAt: string | null;
}

/** File yang dibagikan ke publik — backend sengaja hanya mengirim field ini. */
export interface PublicFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  expiresAt: string | null;
  hasPassword: boolean;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  files: T[];
  pagination: Pagination;
}

export type LayoutStyle = 'grid' | 'list' | 'canvas';

export interface UserSettings {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  username: string | null;
  storageUsed: number;
  storageLimit: number;
  layoutStyle: LayoutStyle | null;
}

export interface DriveFolder {
  id: string;
  name: string;
}

export type FileSort = 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'size_desc';
export type FileTypeFilter = '' | 'image' | 'video' | 'pdf';
