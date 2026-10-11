"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useTrashFiles } from "@/hooks/useTrashFiles";
import { FileCard } from "@/components/FileCard";
import { CloudOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FileGridSkeleton } from "@/components/FileGridSkeleton";

export default function TrashPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data, isLoading, isError, error } = useTrashFiles();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] text-zinc-300 font-sans">
        <Navbar />
        <main className="container mx-auto px-6 mt-12 max-w-6xl">
           <FileGridSkeleton />
        </main>
      </div>
    );
  }

  if (!session?.user) return null;

  const files = data?.data || [];

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-300 font-sans selection:bg-zinc-800 pb-12">
      <Navbar />

      <main className="container mx-auto px-6 mt-12 max-w-6xl">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Dashboard
          </Link>
          <h2 className="text-3xl font-semibold text-white tracking-tight">Tong Sampah</h2>
          <p className="text-zinc-400 mt-2">File yang ada di sini dapat dipulihkan atau dihapus permanen. File akan otomatis terhapus setelah 30 hari.</p>
        </div>

        {isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/[0.01] border border-white/5 rounded-xl">
            <p className="text-red-400 font-medium mb-2">Gagal memuat file</p>
            <p className="text-zinc-500 text-sm">{error?.message || "Silakan coba lagi nanti"}</p>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {files.map((file: any) => (
              <FileCard key={file.id} file={file} isAdmin={true} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
