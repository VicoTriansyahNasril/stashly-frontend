"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, CloudOff } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { FileCard } from "@/components/FileCard";
import { FileGridSkeleton } from "@/components/FileGridSkeleton";
import { useTrashFiles } from "@/hooks/useTrashFiles";

export default function TrashPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: files = [], isLoading, isError, error } = useTrashFiles(status === "authenticated");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
  }, [status, router]);

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="min-h-screen bg-[#000000] text-zinc-300 font-sans">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 mt-12 max-w-6xl">
          <FileGridSkeleton />
        </main>
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-300 font-sans selection:bg-zinc-800 pb-12">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 mt-12 max-w-6xl">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Dashboard
          </Link>
          <h1 className="text-3xl font-semibold text-white tracking-tight">Tong Sampah</h1>
          <p className="text-zinc-400 mt-2">
            File di sini dapat dipulihkan atau dihapus permanen. File akan otomatis terhapus setelah 30 hari.
          </p>
        </div>

        {isError ? (
          <div role="alert" className="flex flex-col items-center justify-center py-20 text-center bg-white/[0.01] border border-white/5 rounded-xl">
            <p className="text-red-400 font-medium mb-2">Gagal memuat file</p>
            <p className="text-zinc-500 text-sm">{error.message}</p>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <div className="w-16 h-16 bg-white/[0.03] border border-white/5 rounded-full flex items-center justify-center mb-5">
              <CloudOff className="w-7 h-7 text-zinc-500" />
            </div>
            <p className="text-zinc-300 font-medium text-lg">Tong sampah kosong</p>
            <p className="text-zinc-500 text-sm mt-1.5 max-w-sm">File yang Anda hapus akan muncul di sini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {files.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
