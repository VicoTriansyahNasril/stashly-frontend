// Satu-satunya sumber URL backend. Wajib diset di production (NEXT_PUBLIC_API_URL).
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

export const MAX_UPLOAD_SIZE = 50 * 1024 * 1024; // 50MB, sama dengan batas backend

export const ALLOWED_UPLOAD_TYPES: Record<string, string[]> = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'application/vnd.android.package-archive': ['.apk'],
};

// Harus sama dengan aturan username di backend (src/lib/validation.ts)
export const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9_-]{1,28})[a-z0-9]$/;

// Google Picker: API key (dibatasi ke Picker API + domain Anda) dan nomor project Google Cloud.
export const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
export const GOOGLE_APP_ID = process.env.NEXT_PUBLIC_GOOGLE_APP_ID || '';
export const isDrivePickerConfigured = Boolean(GOOGLE_API_KEY && GOOGLE_APP_ID);

// Kontak yang ditampilkan di halaman Kebijakan Privasi & Ketentuan (wajib untuk verifikasi Google).
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || '';
