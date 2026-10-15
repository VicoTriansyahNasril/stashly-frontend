"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Download, FileIcon, X } from "lucide-react";
import { getFileIcon } from "@/lib/utils";

interface FilePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  fileType: string;
  src: string;
  downloadHref?: string;
}

export function FilePreviewDialog({ open, onOpenChange, fileName, fileType, src, downloadHref }: FilePreviewDialogProps) {
  const kind = getFileIcon(fileType);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed inset-4 sm:inset-10 z-[100] border border-white/10 bg-zinc-950 p-0 shadow-2xl flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-xl overflow-hidden">
          <div className="flex justify-between items-center gap-2 p-4 border-b border-white/10 bg-black/50">
            <DialogPrimitive.Title className="text-white font-medium truncate">{fileName}</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">Pratinjau file {fileName}</DialogPrimitive.Description>
            <div className="flex items-center gap-1 shrink-0">
              {downloadHref && (
                <a
                  href={downloadHref}
                  className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                  title="Unduh"
                  aria-label="Unduh file"
                >
                  <Download className="w-5 h-5" />
                </a>
              )}
              <DialogPrimitive.Close
                className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Tutup pratinjau"
              >
                <X className="w-5 h-5" />
              </DialogPrimitive.Close>
            </div>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center relative p-4 sm:p-8 bg-[#050505]">
            {open && kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element -- konten dinamis dari API
              <img src={src} alt={fileName} className="max-w-full max-h-full object-contain" />
            ) : open && kind === "video" ? (
              <video src={src} controls className="max-w-full max-h-full rounded-lg" />
            ) : open && kind === "pdf" ? (
              <iframe src={src} title={fileName} className="w-full h-full rounded border-0 bg-white" />
            ) : (
              <div className="text-center">
                <FileIcon className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
                <p className="text-zinc-300">File ini tidak dapat dipratinjau langsung.</p>
                {downloadHref && (
                  <a
                    href={downloadHref}
                    className="inline-flex mt-4 px-4 py-2 rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200"
                  >
                    Unduh File
                  </a>
                )}
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
