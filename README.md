# Stashly Frontend

Antarmuka web Stashly — unggah dan bagikan file yang disimpan di **Google Drive milik Anda sendiri**, dengan
halaman publik `/username`, tautan share berpassword atau berbatas waktu, dan impor file dari Google Drive.

Backend: [stashly-backend](https://github.com/VicoTriansyahNasril/stashly-backend)

## Tech Stack
- **Framework**: Next.js 15 (App Router, TypeScript), React 19
- **Styling**: Tailwind CSS v4, Radix UI, Lucide React
- **Data**: TanStack Query
- **Autentikasi**: NextAuth.js v4 (Google) + Drizzle adapter (PostgreSQL, sesi database)
- **Google Drive**: OAuth scope `drive.file` + Google Picker
- **Test**: Vitest + Testing Library (unit), Playwright (E2E)

## Fitur
- Login dengan Google; file tersimpan di Google Drive pengguna masing-masing.
- Upload dengan drag & drop, progress bar, dan pilihan folder (termasuk memilih folder lewat Google Picker).
- **Impor dari Google Drive** lewat Google Picker: pengguna memilih sendiri file yang boleh diakses Stashly.
- Berbagi file: publik/privat, password, batas waktu, dan halaman share `/s/[id]`.
- Halaman publik `/username`, tong sampah (auto-hapus 30 hari), rename, pencarian, filter, layout grid/list/canvas.
- Halaman `/privacy` dan `/terms` (dibutuhkan untuk verifikasi Google OAuth).

## Instalasi
```bash
npm install
cp .env.example .env   # lalu isi nilainya
```
Daftar variabel lengkap beserta penjelasannya ada di [`.env.example`](.env.example).

## Setup Google Cloud
Gunakan project Google Cloud yang sama dengan backend.

1. **APIs & Services → Library**: aktifkan **Google Drive API** dan **Google Picker API**.
2. **Google Auth Platform → Clients** (OAuth client tipe *Web application*):
   - Authorized JavaScript origins: `http://localhost:3000` (dan domain production)
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` (dan versi production)
   - Isi `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET`.
3. **Google Auth Platform → Data Access**: scope `openid`, `email`, `profile`, dan
   `https://www.googleapis.com/auth/drive.file`. Jangan gunakan scope `drive` penuh.
4. **APIs & Services → Credentials → Create credentials → API key**:
   - API restrictions: **Google Picker API**
   - Application restrictions: **HTTP referrers** → `http://localhost:3000/*` dan `https://domain-anda/*`
   - Isi `NEXT_PUBLIC_GOOGLE_API_KEY`. Perubahan key bisa butuh beberapa menit untuk berlaku.
5. `NEXT_PUBLIC_GOOGLE_APP_ID` = **project number** (angka) project tersebut.
6. **Google Auth Platform → Audience**:
   - Selama status *Testing*, tambahkan akun penguji di **Test users** (sesi login kedaluwarsa setiap 7 hari).
   - Untuk publik: lengkapi **Branding** (homepage, `/privacy`, `/terms`, authorized domain yang terverifikasi di
     Google Search Console), lalu **Publish app**. Karena hanya memakai scope `drive.file`, tidak perlu audit CASA.

> **Brave / pemblokir cookie:** Google Picker berjalan di iframe `docs.google.com` dan butuh cookie login Google.
> Jika Picker meminta login ulang, matikan Shields atau izinkan cookie pihak ketiga untuk situs ini.

> Pengguna yang login sebelum scope diganti ke `drive.file` perlu **logout lalu login ulang**.

## Menjalankan
Pastikan backend sudah berjalan (default `http://localhost:3001`).
```bash
npm run dev          # http://localhost:3000
npm run build && npm start   # production
```

## Test & Kualitas Kode
```bash
npm run test:unit    # Vitest
npm run test:e2e     # Playwright (otomatis menjalankan dev server)
npm run lint
npx tsc --noEmit
```

## Keamanan
- Security headers di `next.config.ts`: CSP (hanya mengizinkan API Stashly dan domain Google yang diperlukan),
  `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, dan HSTS di production.
- Token Google Picker diambil dari backend, sudah dibatasi ke `drive.file`, dan hanya disimpan di memori.
- Password tautan dikirim lewat body POST; unduhan file berpassword memakai token sementara dari backend.

## Catatan Deployment
Backend memverifikasi cookie sesi NextAuth, sehingga frontend dan backend harus dapat berbagi cookie
(subdomain dari domain yang sama, atau backend diproksikan lewat frontend). Lihat README backend.
