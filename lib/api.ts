import { StashlyFile } from '../types/file';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function getFiles(): Promise<{ data: StashlyFile[] }> {
  const res = await fetch(`${API_URL}/files/list`);
  if (!res.ok) {
    throw new Error('Failed to fetch files');
  }
  return res.json();
}

export async function uploadFile(file: File, isPublic: boolean = true) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('isPublic', String(isPublic));

  const res = await fetch(`${API_URL}/files/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to upload file');
  }

  return res.json();
}

export async function deleteFile(id: string) {
  const res = await fetch(`${API_URL}/files/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete file');
  }

  return res.json();
}
