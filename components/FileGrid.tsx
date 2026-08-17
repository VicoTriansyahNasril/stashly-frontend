"use client";

import { useFiles } from "../hooks/useFiles";
import { FileCard } from "./FileCard";
import { FileGridSkeleton } from "./FileGridSkeleton";
import { CloudOff } from "lucide-react";

interface FileGridProps {
  isAdmin?: boolean;
  username?: string;
}

export function FileGrid({ isAdmin = false, username }: FileGridProps) {
  const { data, isLoading, isError, error } = useFiles(username);

  if (isLoading) {
    return <FileGridSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white/[0.01] border border-white/5 rounded-xl">
        <p className="text-red-400 font-medium mb-2">Gagal memuat file</p>
        <p className="text-zinc-500 text-sm">{error?.message || "Silakan coba lagi nanti"}</p>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <CloudOff className="w-6 h-6 text-zinc-600" />
        </div>
        <p className="text-zinc-400 font-medium">Belum ada file.</p>
        <p className="text-zinc-600 text-sm mt-1">File yang diunggah akan muncul di sini.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {data.data.map((file) => (
        <FileCard key={file.id} file={file} isAdmin={isAdmin} />
      ))}
    </div>
  );
}
