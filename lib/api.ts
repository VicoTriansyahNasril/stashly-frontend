import axios from 'axios';
import { StashlyFile } from '../types/file';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Update getFiles to support pagination, search, sort
export async function getFiles(
  page: number = 1,
  limit: number = 50,
  search: string = '',
  type: string = '',
  sort: string = 'newest'
): Promise<{ data: { files: StashlyFile[], pagination: any } }> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search,
    type,
    sort
  });
  
  const res = await fetch(`${API_URL}/files/list?${params.toString()}`, {
    credentials: 'include'
  });
  if (!res.ok) {
    throw new Error('Failed to fetch files');
  }
  return res.json();
}

export async function getPublicFiles(username: string): Promise<{ data: StashlyFile[] }> {
  const res = await fetch(`${API_URL}/files/public?username=${encodeURIComponent(username)}`, {
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error('Failed to fetch public files');
  }
  return res.json();
}

// Upload with Axios for Progress Bar
export async function uploadFile(
  file: File, 
  isPublic: boolean = true, 
  folderId?: string,
  onProgress?: (progress: number) => void
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('isPublic', String(isPublic));
  if (folderId) {
    formData.append('folderId', folderId);
  }

  try {
    const res = await axios.post(`${API_URL}/files/upload`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to upload file');
  }
}

// Soft delete
export async function deleteFile(id: string) {
  const res = await fetch(`${API_URL}/files/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete file');
  return res.json();
}

// Trash
export async function getTrashFiles(): Promise<{ data: StashlyFile[] }> {
  const res = await fetch(`${API_URL}/files/trash`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch trash files');
  return res.json();
}

export async function restoreFile(id: string) {
  const res = await fetch(`${API_URL}/files/${id}/restore`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to restore file');
  return res.json();
}

export async function forceDeleteFile(id: string) {
  const res = await fetch(`${API_URL}/files/${id}/force`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to permanently delete file');
  return res.json();
}

export async function renameFile(id: string, fileName: string) {
  const res = await fetch(`${API_URL}/files/${id}/rename`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to rename file');
  return res.json();
}

// Unlock public file
export async function unlockFile(id: string, password: string) {
  const res = await fetch(`${API_URL}/files/${id}/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if (!res.ok) {
     const data = await res.json();
     throw new Error(data.message || 'Incorrect password');
  }
  return res.json();
}

export interface DriveFolder {
  id: string;
  name: string;
}

export async function getFolders(): Promise<{ data: DriveFolder[] }> {
  const res = await fetch(`${API_URL}/folders`, {
    credentials: 'include'
  });
  if (!res.ok) {
    throw new Error('Failed to fetch folders');
  }
  return res.json();
}

export async function createFolder(name: string): Promise<{ data: DriveFolder }> {
  const res = await fetch(`${API_URL}/folders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create folder');
  }
  return res.json();
}

export async function getUserSettings() {
  const res = await fetch(`${API_URL}/users/me`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch user settings');
  return res.json();
}

export async function updateUserSettings(data: { username?: string; theme?: string; layoutStyle?: string }) {
  const res = await fetch(`${API_URL}/users/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update settings');
  }
  return res.json();
}

export async function updateFilePosition(id: string, posX: number, posY: number) {
  const res = await fetch(`${API_URL}/files/${id}/position`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ posX, posY })
  });
  if (!res.ok) throw new Error('Failed to update file position');
  return res.json();
}

export async function updateFolderPosition(id: string, posX: number, posY: number) {
  const res = await fetch(`${API_URL}/folders/${id}/position`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ posX, posY })
  });
  if (!res.ok) throw new Error('Failed to update folder position');
  return res.json();
}

export async function getDriveFiles(folderId: string) {
  const res = await fetch(`${API_URL}/files/drive-files?folderId=${folderId}`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch drive files');
  return res.json();
}

export async function syncDriveFiles(data: { folderId: string, filesToSync: any[] }) {
  const res = await fetch(`${API_URL}/files/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to sync files');
  return res.json();
}
