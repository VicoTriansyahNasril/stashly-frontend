"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Copy, Link as LinkIcon, Check, KeyRound, Calendar } from "lucide-react";
import { StashlyFile } from "../types/file";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: StashlyFile;
  publicUrl: string;
}

export function ShareDialog({ open, onOpenChange, file, publicUrl }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState("");
  const [expires, setExpires] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    // In real app, call API to update password and expiresAt
    // await updateFileSettings(file.id, { password, expiresAt: expires });
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-950 border border-white/10 p-6 rounded-2xl shadow-2xl z-50 animate-in zoom-in-95 duration-200">
          <Dialog.Title className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-blue-400" /> Bagikan File
          </Dialog.Title>
          <Dialog.Description className="text-sm text-zinc-400 mb-6">
            Atur keamanan tautan publik untuk <strong className="text-zinc-200">{file.fileName}</strong>.
          </Dialog.Description>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5 mb-1.5">
                <KeyRound className="w-3.5 h-3.5" /> Kata Sandi (Opsional)
              </label>
              <input 
                type="password" 
                placeholder="Biarkan kosong jika publik" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5" /> Batas Waktu / Kedaluwarsa (Opsional)
              </label>
              <input 
                type="datetime-local" 
                value={expires}
                onChange={(e) => setExpires(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
                Tautan Publik
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-400 truncate select-all">
                  {publicUrl}
                </div>
                <button 
                  onClick={handleCopy}
                  className="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                  title="Salin Tautan"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button 
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Tutup
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-900/20 transition-all"
            >
              Simpan & Bagikan
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
