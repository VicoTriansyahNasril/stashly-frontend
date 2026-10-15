import axios from 'axios';
import { API_URL } from './config';
import type {
  DriveFolder,
  FileSort,
  FileTypeFilter,
  LayoutStyle,
  Paginated,
  PublicFile,
  StashlyFile,
  UserSettings,
} from '../types/file';

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiEnvelope<T> = { success: boolean; message: string; data: T };

/** Ambil pesan error dari body backend; selalu string (aman dirender). */
const errorMessageFrom = (body: unknown, fallback: string): string => {
  if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string' && body.message) {
    return body.message;
  }
  return fallback;
};

async function request<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      credentials: 'include',
      ...rest,
      headers: json !== undefined ? { 'Content-Type': 'application/json', ...headers } : headers,
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server. Periksa koneksi Anda.', 0);
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const fallback = res.status === 429 ? 'Terlalu banyak permintaan, coba lagi sebentar lagi.' : 'Terjadi kesalahan, silakan coba lagi.';
    throw new ApiError(errorMessageFrom(body, fallback), res.status);
  }
  return (body as ApiEnvelope<T>).data;
}

const query = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const str = search.toString();
  return str ? `?${str}` : '';
};

// ───────────── File milik pengguna ─────────────

export const getFiles = (params: { page: number; limit: number; search: string; type: FileTypeFilter; sort: FileSort }) =>
  request<Paginated<StashlyFile>>(`/files/list${query(params)}`);

export const getTrashFiles = () => request<StashlyFile[]>('/files/trash');

export async function uploadFile(
  file: File,
  options: { folderId?: string; onProgress?: (percent: number) => void } = {},
): Promise<StashlyFile> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('isPublic', 'true');
  if (options.folderId) formData.append('folderId', options.folderId);

  try {
    const res = await axios.post<ApiEnvelope<StashlyFile>>(`${API_URL}/files/upload`, formData, {
      withCredentials: true,
      onUploadProgress: (event) => {
        if (event.total && options.onProgress) options.onProgress(Math.round((event.loaded * 100) / event.total));
      },
    });
    return res.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) throw new ApiError('Tidak dapat terhubung ke server. Periksa koneksi Anda.', 0);
      throw new ApiError(errorMessageFrom(error.response.data, 'Gagal mengunggah file'), error.response.status);
    }
    throw error;
  }
}

export const deleteFile = (id: string) => request<null>(`/files/${id}`, { method: 'DELETE' });
export const restoreFile = (id: string) => request<null>(`/files/${id}/restore`, { method: 'POST' });
export const forceDeleteFile = (id: string) => request<null>(`/files/${id}/force`, { method: 'DELETE' });

export const renameFile = (id: string, fileName: string) =>
  request<StashlyFile>(`/files/${id}/rename`, { method: 'PUT', json: { fileName } });

export const updateFilePosition = (id: string, posX: number, posY: number) =>
  request<StashlyFile>(`/files/${id}/position`, { method: 'PUT', json: { posX, posY } });

export type ShareSettings = {
  isPublic?: boolean;
  /** undefined = tidak diubah, null = hapus password */
  password?: string | null;
  /** ISO string; null = tanpa batas waktu */
  expiresAt?: string | null;
};

export const updateShareSettings = (id: string, settings: ShareSettings) =>
  request<StashlyFile>(`/files/${id}/share`, { method: 'PUT', json: settings });

// ───────────── Publik ─────────────

export const getPublicFiles = (username: string, page: number, limit: number) =>
  request<Paginated<PublicFile>>(`/files/public${query({ username, page, limit })}`, { credentials: 'omit' });

export const getPublicFile = (id: string) =>
  request<PublicFile>(`/files/public/${encodeURIComponent(id)}`, { credentials: 'omit' });

export const unlockFile = (id: string, password: string) =>
  request<{ token: string; expiresIn: number }>(`/files/public/${encodeURIComponent(id)}/unlock`, {
    method: 'POST',
    json: { password },
    credentials: 'omit',
  });

// ───────────── URL konten file ─────────────

export const fileUrls = {
  /** Stream file milik sendiri (butuh cookie sesi). */
  ownerStream: (id: string, download = false) => `${API_URL}/files/${id}/stream${download ? '?download=1' : ''}`,
  ownerThumbnail: (id: string) => `${API_URL}/files/${id}/thumbnail`,
  publicStream: (id: string, options: { download?: boolean; token?: string } = {}) =>
    `${API_URL}/files/public/${id}/stream${query({ download: options.download ? 1 : undefined, token: options.token })}`,
  publicThumbnail: (id: string) => `${API_URL}/files/public/${id}/thumbnail`,
};

// ───────────── Folder & Drive ─────────────

export const getFolders = () => request<DriveFolder[]>('/folders');

export const createFolder = (name: string) => request<DriveFolder>('/folders', { method: 'POST', json: { name } });

/** Impor file yang dipilih pengguna lewat Google Picker. */
export const syncDriveFiles = (data: { driveFileIds: string[] }) =>
  request<{ files: StashlyFile[]; skipped: number }>('/files/sync', { method: 'POST', json: data });

// ───────────── Pengguna ─────────────

/** Access token `drive.file` berumur pendek, khusus untuk Google Picker. */
export const getDriveToken = () =>
  request<{ accessToken: string; expiresAt: number }>("/users/drive-token", { cache: "no-store" });

export const getUserSettings = () => request<UserSettings>('/users/me');

export const updateUserSettings = (data: { username?: string | null; layoutStyle?: LayoutStyle }) =>
  request<UserSettings>('/users/settings', { method: 'PUT', json: data });
