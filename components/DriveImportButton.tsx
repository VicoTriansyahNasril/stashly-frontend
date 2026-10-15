"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HardDriveDownload, Loader2, X } from "lucide-react";
import { syncDriveFiles } from "@/lib/api";
import { useDrivePicker } from "@/hooks/useDrivePicker";

const GOOGLE_APPS_PREFIX = "application/vnd.google-apps.";

/**
 * Impor file yang sudah ada di Google Drive pengguna. Pengguna memilih file sendiri lewat
 * Google Picker — hanya file yang dipilih yang bisa diakses Stashly (scope drive.file).
 */
export function DriveImportButton() {
  const queryClient = useQueryClient();
  const { pick, isOpening, error: pickerError, clearError } = useDrivePicker();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const importMutation = useMutation({
    mutationFn: (driveFileIds: string[]) => syncDriveFiles({ driveFileIds }),
    onSuccess: ({ files, skipped }) => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setMessage({
        type: "success",
        text:
          files.length > 0
            ? `${files.length} file diimpor${skipped ? `, ${skipped} dilewati (sudah ada atau tidak didukung)` : ""}. File hasil impor bersifat privat sampai Anda membagikannya.`
            : "Tidak ada file baru — file yang dipilih sudah ada di Stashly atau tidak didukung.",
      });
    },
    onError: (err: Error) => setMessage({ type: "error", text: err.message }),
  });

  const handleImport = async () => {
    setMessage(null);
    clearError();
    const picked = await pick({ mode: "files" });
    const importable = picked.filter((item) => !item.mimeType.startsWith(GOOGLE_APPS_PREFIX));
    if (picked.length > 0 && importable.length === 0) {
      setMessage({ type: "error", text: "Google Docs/Sheets/Slides dan folder belum bisa diimpor. Pilih file biasa." });
      return;
    }
    if (importable.length > 0) importMutation.mutate(importable.map((item) => item.id));
  };

  const busy = isOpening || importMutation.isPending;
  const shown = pickerError ? { type: "error" as const, text: pickerError } : message;

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleImport}
        disabled={busy}
        className="tour-sync px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <HardDriveDownload className="w-4 h-4" />}
        <span className="hidden sm:inline">{importMutation.isPending ? "Mengimpor..." : "Impor dari Google Drive"}</span>
        <span className="sm:hidden">Impor</span>
      </button>
      {shown && (
        <div
          role={shown.type === "error" ? "alert" : "status"}
          className={`max-w-md flex items-start gap-2 text-xs rounded-lg px-3 py-2 border ${
            shown.type === "error"
              ? "text-red-400 bg-red-500/10 border-red-500/20"
              : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
          }`}
        >
          <span className="flex-1">{shown.text}</span>
          <button
            onClick={() => {
              setMessage(null);
              clearError();
            }}
            aria-label="Tutup pesan"
            className="opacity-70 hover:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
