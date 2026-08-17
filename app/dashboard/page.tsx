"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FileGrid } from "@/components/FileGrid";
import { UploadDropzone } from "@/components/UploadDropzone";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="min-h-screen bg-[#000000] text-zinc-300 flex items-center justify-center">Memuat dashboard...</div>;
  }

  if (!session?.user) return null;

  const publicUrlPath = `/${session.user.name?.replace(/\s+/g, '').toLowerCase() || 'public'}`;

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-300 font-sans selection:bg-zinc-800 pb-12">
      <Navbar />

      <main className="container mx-auto px-6 mt-12 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">Dashboard Anda</h2>
            <p className="text-sm text-zinc-500 mt-1">Kelola file dan unggah ke Google Drive Anda.</p>
          </div>
          <Link 
            href={publicUrlPath} 
            target="_blank"
            className="inline-flex items-center gap-2 h-9 px-4 text-xs font-medium bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-md transition-colors"
          >
            Lihat Halaman Publik
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="mb-12">
          <UploadDropzone />
        </div>

        <div>
          <div className="flex items-center justify-between mb-6 border-b border-white/[0.08] pb-4">
            <h3 className="text-lg font-medium text-white">Semua File</h3>
          </div>
          <FileGrid isAdmin={true} />
        </div>
      </main>
    </div>
  );
}
