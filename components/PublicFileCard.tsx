"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Download, Eye, KeyRound, Link as LinkIcon } from "lucide-react";
import { fileUrls } from "@/lib/api";
import { formatDate, formatFileSize } from "@/lib/utils";
import type { PublicFile } from "@/types/file";
import { FilePreviewDialog } from "./FilePreviewDialog";
import { FileThumbnail } from "./FileThumbnail";

const actionButton =
  "flex-1 inline-flex items-center justify-center gap-1.5 h-9 text-xs font-medium rounded-md transition-colors";

/** Kartu file pada halaman profil publik. File berpassword diarahkan ke halaman share untuk membuka kunci. */
export function PublicFileCard({ file }: { file: PublicFile }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const sharePath = `/s/${file.id}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${sharePath}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard tidak tersedia (mis. bukan HTTPS); pengguna masih bisa membuka halaman share.
    }
  };

  return (
    <div className="group rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.05] hover:border-white/20 transition-all flex flex-col h-full">
      <div className="flex items-center justify-center h-[160px] sm:h-[200px] border-b border-white/[0.05] overflow-hidden">
        <FileThumbnail
          fileType={file.fileType}
          fileName={file.fileName}
          src={file.hasPassword ? null : fileUrls.publicThumbnail(file.id)}
          locked={file.hasPassword}
        />
      </div>
      <div className="p-4 flex flex-col flex-grow bg-black/40">
        <div className="mb-4">
          <h3 className="font-medium text-sm text-zinc-200 truncate" title={file.fileName}>
            {file.fileName}
          </h3>
          <div className="flex justify-between items-center w-full mt-1.5">
            <p className="text-xs text-zinc-500 font-medium">{formatFileSize(file.fileSize)}</p>
            <p className="text-[10px] text-zinc-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded">
              {formatDate(file.uploadedAt)}
            </p>
          </div>
        </div>

        <div className="flex w-full gap-1.5 mt-auto pt-3 border-t border-white/[0.05]">
          {file.hasPassword ? (
            <Link href={sharePath} className={`${actionButton} bg-amber-500/10 hover:bg-amber-500/20 text-amber-300`}>
              <KeyRound className="w-4 h-4" /> Buka dengan password
            </Link>
          ) : (
            <>
              <button
                onClick={() => setIsPreviewOpen(true)}
                className={`${actionButton} bg-white/[0.03] hover:bg-white/10 text-zinc-300`}
                title="Preview"
                aria-label="Pratinjau"
              >
                <Eye className="w-4 h-4" />
              </button>
              <a
                href={fileUrls.publicStream(file.id, { download: true })}
                className={`${actionButton} bg-white/[0.03] hover:bg-white/10 text-zinc-300`}
                title="Unduh"
                aria-label="Unduh"
              >
                <Download className="w-4 h-4" />
              </a>
            </>
          )}
          <button
            onClick={copyLink}
            className={`${actionButton} bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 max-w-12`}
            title="Salin tautan"
            aria-label="Salin tautan"
          >
            {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!file.hasPassword && (
        <FilePreviewDialog
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          fileName={file.fileName}
          fileType={file.fileType}
          src={fileUrls.publicStream(file.id)}
          downloadHref={fileUrls.publicStream(file.id, { download: true })}
        />
      )}
    </div>
  );
}
