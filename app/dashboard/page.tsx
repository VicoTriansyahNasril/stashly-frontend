"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FileGrid } from "@/components/FileGrid";
import { UploadDropzone } from "@/components/UploadDropzone";
import { Navbar } from "@/components/Navbar";
import { SyncDriveDialog } from "@/components/SyncDriveDialog";
import { TourGuide } from "@/components/TourGuide";
import Link from "next/link";
import { ExternalLink, RefreshCw } from "lucide-react";
import { getUserSettings } from "@/lib/api";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [customUsername, setCustomUsername] = useState<string | null>(null);
  const [isSyncOpen, setIsSyncOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      getUserSettings().then(res => {
        if (res.data?.username) {
          setCustomUsername(res.data.username);
        }
      }).catch(e => console.error(e));
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="min-h-screen bg-[#000000] text-zinc-300 flex items-center justify-center">Memuat dashboard...</div>;
  }

  if (!session?.user) return null;

  const publicUrlPath = `/${customUsername || session.user.name?.replace(/\s+/g, '').toLowerCase() || 'public'}`;

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-300 font-sans selection:bg-zinc-800 pb-12">
      <Navbar />

      <main className="container mx-auto px-6 mt-12 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-white tracking-tight">Dashboard</h2>
            <p className="text-zinc-400 mt-2">Kelola file dan simpan otomatis ke Google Drive Anda.</p>
          </div>
          <Link 
            href={publicUrlPath} 
            target="_blank"
            className="tour-public inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium bg-white text-black hover:bg-zinc-200 rounded-md transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            Lihat Halaman Publik
            <ExternalLink className="w-4 h-4 opacity-70" />
          </Link>
        </div>

        <div className="mb-12 tour-upload">
          <UploadDropzone />
        </div>

        <div>
          <div className="flex items-center justify-between mb-6 border-b border-white/[0.08] pb-4">
            <h3 className="text-lg font-medium text-white">Semua File</h3>
            <button
              onClick={() => setIsSyncOpen(true)}
              className="tour-sync px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Sinkronisasi Drive
            </button>
          </div>
          <FileGrid isAdmin={true} />
        </div>
      </main>

      <SyncDriveDialog open={isSyncOpen} onOpenChange={setIsSyncOpen} />
      <TourGuide />
    </div>
  );
}
