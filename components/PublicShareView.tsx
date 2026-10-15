"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, Download, Eye, Loader2, Lock } from "lucide-react";
import { ApiError, fileUrls, getPublicFile, unlockFile } from "@/lib/api";
import { formatFileSize } from "@/lib/utils";
import { FilePreviewDialog } from "./FilePreviewDialog";
import { FileThumbnail } from "./FileThumbnail";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const errorTitle = (error: unknown) => {
  if (error instanceof ApiError && error.status === 410) return "Tautan Kedaluwarsa";
  if (error instanceof ApiError && error.status === 404) return "File Tidak Ditemukan";
  return "Gagal Memuat File";
};

export function PublicShareView({ fileId }: { fileId: string }) {
  const validId = UUID_PATTERN.test(fileId);
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { data: file, isLoading, error } = useQuery({
    queryKey: ["public-file", fileId],
    queryFn: () => getPublicFile(fileId),
    enabled: validId,
    retry: false,
  });

  const unlock = useMutation({
    mutationFn: () => unlockFile(fileId, password),
    onSuccess: (result) => {
      setToken(result.token);
      setPassword("");
    },
  });

  if (!validId || error) {
    return (
      <div className="bg-zinc-950 border border-red-500/30 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">{validId ? errorTitle(error) : "Tautan Tidak Valid"}</h1>
        <p className="text-zinc-400">
          {validId && error instanceof Error ? error.message : "Periksa kembali tautan yang Anda terima."}
        </p>
      </div>
    );
  }

  if (isLoading || !file) {
    return (
      <div className="flex flex-col items-center text-zinc-400" role="status">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Memuat informasi file...</p>
      </div>
    );
  }

  const locked = file.hasPassword && !token;
  const streamOptions = token ? { token } : {};

  const handleUnlock = (event: FormEvent) => {
    event.preventDefault();
    if (password) unlock.mutate();
  };

  return (
    <div className="bg-white/[0.02] border border-white/10 p-8 rounded-2xl max-w-md w-full shadow-2xl backdrop-blur-sm animate-in fade-in zoom-in-95">
      <div className="text-center mb-6">
        <div className="w-24 h-24 mx-auto bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20 overflow-hidden">
          <FileThumbnail
            fileType={file.fileType}
            fileName={file.fileName}
            src={file.hasPassword ? null : fileUrls.publicThumbnail(file.id)}
            locked={locked}
          />
        </div>
        <h1 className="text-xl font-semibold text-white truncate px-4" title={file.fileName}>
          {file.fileName}
        </h1>
        <p className="text-zinc-400 text-sm mt-1">{formatFileSize(file.fileSize)} • Dibagikan via Stashly</p>
        {file.expiresAt && (
          <p className="text-xs text-zinc-500 mt-1">
            Tersedia hingga {new Date(file.expiresAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        )}
      </div>

      {locked ? (
        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="bg-black/40 border border-white/10 p-4 rounded-xl">
            <label htmlFor="unlock-password" className="text-xs font-medium text-zinc-400 flex items-center gap-1.5 mb-2">
              <Lock className="w-3.5 h-3.5" /> File Dilindungi Kata Sandi
            </label>
            <input
              id="unlock-password"
              type="password"
              autoComplete="off"
              placeholder="Masukkan kata sandi..."
              value={password}
              maxLength={128}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            {unlock.error && (
              <p role="alert" className="text-xs text-red-400 mt-2">
                {unlock.error.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={unlock.isPending || !password}
            className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {unlock.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Buka File
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          {/* Unduhan langsung lewat navigasi browser: tidak menampung seluruh file di memori. */}
          <a
            href={fileUrls.publicStream(file.id, { ...streamOptions, download: true })}
            className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
          >
            <Download className="w-4 h-4" /> Unduh File
          </a>
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="w-full h-11 border border-white/10 hover:bg-white/5 text-zinc-200 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
          >
            <Eye className="w-4 h-4" /> Pratinjau
          </button>
          {token && <p className="text-xs text-zinc-500 text-center">Akses berlaku selama 10 menit.</p>}
        </div>
      )}

      {!locked && (
        <FilePreviewDialog
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          fileName={file.fileName}
          fileType={file.fileType}
          src={fileUrls.publicStream(file.id, streamOptions)}
          downloadHref={fileUrls.publicStream(file.id, { ...streamOptions, download: true })}
        />
      )}
    </div>
  );
}
