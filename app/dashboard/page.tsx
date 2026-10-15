"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ExternalLink } from "lucide-react";
import { OwnerFileGrid } from "@/components/FileGrid";
import { UploadDropzone } from "@/components/UploadDropzone";
import { Navbar } from "@/components/Navbar";
import { DriveImportButton } from "@/components/DriveImportButton";
import { TourGuide } from "@/components/TourGuide";
import { StorageUsage } from "@/components/StorageUsage";
import { useUserSettings } from "@/hooks/useUserSettings";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: settings } = useUserSettings();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#000000] text-zinc-300 flex items-center justify-center" role="status">
        Memuat dashboard...
      </div>
    );
  }

  if (!session?.user) return null;

  const fallbackUsername = session.user.name?.replace(/\s+/g, "").toLowerCase();
  const publicUsername = settings?.username || fallbackUsername;

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-300 font-sans selection:bg-zinc-800 pb-12">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 mt-12 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">Dashboard</h1>
            <p className="text-zinc-400 mt-2">Kelola file dan simpan otomatis ke Google Drive Anda.</p>
            {settings && <StorageUsage used={settings.storageUsed} limit={settings.storageLimit} />}
          </div>
          {publicUsername && (
            <Link
              href={`/${encodeURIComponent(publicUsername)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tour-public inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium bg-white text-black hover:bg-zinc-200 rounded-md transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Lihat Halaman Publik
              <ExternalLink className="w-4 h-4 opacity-70" />
            </Link>
          )}
        </div>

        <div className="mb-12 tour-upload">
          <UploadDropzone />
        </div>

        <div>
          <div className="flex items-start justify-between gap-4 mb-6 border-b border-white/[0.08] pb-4">
            <h2 className="text-lg font-medium text-white pt-2">Semua File</h2>
            <DriveImportButton />
          </div>
          <OwnerFileGrid />
        </div>
      </main>

      <TourGuide />
    </div>
  );
}
