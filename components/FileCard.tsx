"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Clock, Download, Edit2, Eye, EyeOff, KeyRound, Link as LinkIcon, Trash2, X } from "lucide-react";
import { deleteFile, fileUrls, forceDeleteFile, renameFile, restoreFile } from "@/lib/api";
import { formatDate, formatFileSize } from "@/lib/utils";
import type { StashlyFile } from "@/types/file";
import { ShareDialog } from "./ShareDialog";
import { ConfirmDialog, AlertDialog } from "./CustomDialog";
import { FilePreviewDialog } from "./FilePreviewDialog";
import { FileThumbnail } from "./FileThumbnail";

interface FileCardProps {
  file: StashlyFile;
}

const actionButton =
  "flex-1 inline-flex items-center justify-center h-9 text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

/** Kartu file untuk pemilik (dashboard & tong sampah). */
export function FileCard({ file }: FileCardProps) {
  const [dialog, setDialog] = useState<null | "share" | "delete" | "restore" | "force" | "preview">(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(file.fileName);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["files"] });
    queryClient.invalidateQueries({ queryKey: ["trash"] });
    queryClient.invalidateQueries({ queryKey: ["me"] });
  };
  const onError = (error: Error) => setErrorMessage(error.message);

  const deleteMutation = useMutation({ mutationFn: deleteFile, onSuccess: refresh, onError });
  const restoreMutation = useMutation({ mutationFn: restoreFile, onSuccess: refresh, onError });
  const forceDeleteMutation = useMutation({ mutationFn: forceDeleteFile, onSuccess: refresh, onError });
  const renameMutation = useMutation({
    mutationFn: (name: string) => renameFile(file.id, name),
    onSuccess: () => {
      setIsEditingName(false);
      refresh();
    },
    onError,
  });

  const isTrash = !!file.deletedAt;
  const isExpired = !!file.expiresAt && new Date(file.expiresAt).getTime() <= Date.now();

  const cancelRename = () => {
    setIsEditingName(false);
    setNewName(file.fileName);
  };

  const submitRename = () => {
    const name = newName.trim();
    if (!name || name === file.fileName) return cancelRename();
    renameMutation.mutate(name);
  };

  return (
    <div className="group rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.05] hover:border-white/20 transition-all flex flex-col h-full relative">
      <div
        className={`flex items-center justify-center h-[160px] sm:h-[200px] relative border-b border-white/[0.05] overflow-hidden ${isTrash ? "opacity-50 grayscale" : ""}`}
      >
        <FileThumbnail fileType={file.fileType} fileName={file.fileName} src={fileUrls.ownerThumbnail(file.id)} />

        {!isTrash && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {!file.isPublic && (
              <span className="inline-flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-zinc-300">
                <EyeOff className="w-3 h-3" /> Privat
              </span>
            )}
            {file.isPublic && file.hasPassword && (
              <span className="inline-flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-amber-300">
                <KeyRound className="w-3 h-3" /> Password
              </span>
            )}
            {file.isPublic && file.expiresAt && (
              <span
                className={`inline-flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] ${isExpired ? "text-red-300" : "text-sky-300"}`}
              >
                <Clock className="w-3 h-3" /> {isExpired ? "Kedaluwarsa" : "Berbatas waktu"}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow relative z-10 bg-black/40 backdrop-blur-sm">
        <div className="mb-4">
          <div className="flex items-center justify-between w-full group/title">
            {isEditingName ? (
              <div className="flex items-center w-full bg-black/50 border border-white/20 rounded-md px-2 py-1">
                <input
                  type="text"
                  value={newName}
                  maxLength={255}
                  aria-label="Nama file baru"
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitRename();
                    else if (e.key === "Escape") cancelRename();
                  }}
                  className="w-full bg-transparent text-sm text-zinc-200 outline-none"
                  autoFocus
                />
                <button
                  onClick={submitRename}
                  disabled={renameMutation.isPending}
                  className="ml-1 text-emerald-400 hover:text-emerald-300"
                  aria-label="Simpan nama"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={cancelRename} className="ml-1 text-zinc-400 hover:text-white" aria-label="Batal ganti nama">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-medium text-sm text-zinc-200 truncate pr-2" title={file.fileName}>
                  {file.fileName}
                </h3>
                {!isTrash && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="opacity-100 sm:opacity-0 sm:group-hover/title:opacity-100 focus:opacity-100 text-zinc-400 hover:text-white transition-opacity p-1 flex-shrink-0"
                    title="Ganti nama"
                    aria-label="Ganti nama file"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </>
            )}
          </div>
          <div className="flex justify-between items-center w-full mt-1.5">
            <p className="text-xs text-zinc-500 font-medium">{formatFileSize(file.fileSize)}</p>
            <p className="text-[10px] text-zinc-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded">
              {formatDate(isTrash ? file.deletedAt! : file.uploadedAt)}
            </p>
          </div>
        </div>

        <div className="flex w-full gap-1.5 mt-auto pt-3 border-t border-white/[0.05]">
          {isTrash ? (
            <>
              <button
                onClick={() => setDialog("restore")}
                disabled={restoreMutation.isPending}
                className={`${actionButton} bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400`}
                title="Pulihkan"
              >
                Pulihkan
              </button>
              <button
                onClick={() => setDialog("force")}
                disabled={forceDeleteMutation.isPending}
                className={`${actionButton} bg-red-500/10 hover:bg-red-500/20 text-red-400`}
                title="Hapus Permanen"
                aria-label="Hapus permanen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setDialog("preview")}
                className={`${actionButton} bg-white/[0.03] hover:bg-white/10 text-zinc-300`}
                title="Preview"
                aria-label="Pratinjau"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDialog("share")}
                className={`${actionButton} bg-blue-500/10 hover:bg-blue-500/20 text-blue-400`}
                title="Bagikan"
                aria-label="Bagikan"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <a
                href={fileUrls.ownerStream(file.id, true)}
                className={`${actionButton} bg-white/[0.03] hover:bg-white/10 text-zinc-300`}
                title="Unduh"
                aria-label="Unduh"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => setDialog("delete")}
                disabled={deleteMutation.isPending}
                className={`${actionButton} bg-red-500/10 hover:bg-red-500/20 text-red-400`}
                title="Hapus"
                aria-label="Pindahkan ke tong sampah"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {dialog === "share" && <ShareDialog open onOpenChange={(open) => !open && setDialog(null)} file={file} />}

      <ConfirmDialog
        open={dialog === "delete"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Pindahkan ke Tong Sampah"
        description="File ini akan disembunyikan dan tautan publiknya berhenti berfungsi. Anda dapat memulihkannya atau menghapusnya permanen dari Tong Sampah."
        confirmText="Pindahkan"
        isDestructive
        onConfirm={() => deleteMutation.mutate(file.id)}
      />

      <ConfirmDialog
        open={dialog === "force"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Hapus Permanen"
        description="File ini akan dihapus permanen dari Stashly dan Google Drive Anda. Tindakan ini tidak dapat dibatalkan!"
        confirmText="Hapus Permanen"
        isDestructive
        onConfirm={() => forceDeleteMutation.mutate(file.id)}
      />

      <ConfirmDialog
        open={dialog === "restore"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Pulihkan File"
        description="File ini akan dipulihkan dan terlihat kembali di daftar utama Anda."
        confirmText="Pulihkan"
        onConfirm={() => restoreMutation.mutate(file.id)}
      />

      <AlertDialog
        open={!!errorMessage}
        onOpenChange={(open) => !open && setErrorMessage(null)}
        title="Terjadi Kesalahan"
        description={errorMessage ?? ""}
      />

      {!isTrash && (
        <FilePreviewDialog
          open={dialog === "preview"}
          onOpenChange={(open) => !open && setDialog(null)}
          fileName={file.fileName}
          fileType={file.fileType}
          src={fileUrls.ownerStream(file.id)}
          downloadHref={fileUrls.ownerStream(file.id, true)}
        />
      )}
    </div>
  );
}
