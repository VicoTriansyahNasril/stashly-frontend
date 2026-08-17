# Stashly Frontend

Frontend untuk aplikasi Stashly.

## Tech Stack
- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Data Fetching**: TanStack Query
- **Validasi**: Zod + React Hook Form

## Cara Install
```bash
npm install
```

## Cara Setup Environment
1. Copy `.env.local.example` ke `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Isi URL backend di `.env.local`:
   - `NEXT_PUBLIC_API_URL`: URL dari backend (contoh: http://localhost:3001)

## Cara Menjalankan
```bash
npm run dev
```
