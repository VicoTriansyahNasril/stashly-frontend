# Stashly Frontend

Frontend untuk aplikasi Stashly — antarmuka pengguna untuk manajemen file dan folder.

## Tech Stack
- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui, Radix UI, Lucide React
- **Data Fetching & State**: TanStack Query (React Query)
- **Form & Validasi**: React Hook Form + Zod
- **Autentikasi**: NextAuth.js (v4) dengan Google Provider
- **Database (Auth)**: Drizzle ORM (PostgreSQL) dengan `@auth/drizzle-adapter`

## Fitur Utama
- **Autentikasi**: Login menggunakan akun Google.
- **Manajemen File**: Tampilan antarmuka yang modern, dukungan drag-and-drop upload menggunakan `react-dropzone`.
- **Integrasi API**: Terhubung secara dinamis dengan backend Hono.

## Cara Install
```bash
npm install
```

## Cara Setup Environment
1. Copy `.env.local.example` ke `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Isi variabel di `.env.local`:
   - `NEXT_PUBLIC_API_URL`: URL dari backend (contoh: `http://localhost:3001`)
   - `DATABASE_URL`: URL koneksi PostgreSQL untuk menyimpan sesi & user NextAuth
   - `NEXTAUTH_URL`: URL aplikasi Next.js (contoh: `http://localhost:3000`)
   - `NEXTAUTH_SECRET`: Secret key acak untuk enkripsi session (bisa dibuat menggunakan command: `openssl rand -base64 32`)
   - `GOOGLE_CLIENT_ID`: Client ID dari kredensial Google Cloud Console
   - `GOOGLE_CLIENT_SECRET`: Client Secret dari kredensial Google Cloud Console

## Cara Menjalankan

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm run build
npm start
```

## Linting
```bash
npm run lint
```
