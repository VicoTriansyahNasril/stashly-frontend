"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Check, Copy, Globe, KeyRound, Link as LinkIcon, Loader2, Lock, X } from "lucide-react";
import { updateShareSettings, type ShareSettings } from "@/lib/api";
import type { StashlyFile } from "@/types/file";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: StashlyFile;
}

/** ISO → nilai input datetime-local (zona waktu lokal). */
const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

const minLocalInput = () => toLocalInput(new Date(Date.now() + 60_000).toISOString());

export function ShareDialog({ open, onOpenChange, file }: ShareDialogProps) {
  const [isPublic, setIsPublic] = useState(file.isPublic);
  const [passwordMode, setPasswordMode] = useState<"keep" | "set" | "remove">(file.hasPassword ? "keep" : "remove");
  const [password, setPassword] = useState("");
  const [expires, setExpires] = useState(toLocalInput(file.expiresAt));
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const queryClient = useQueryClient();
  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/s/${file.id}` : `/s/${file.id}`;

  const mutation = useMutation({
    mutationFn: (settings: ShareSettings) => updateShareSettings(file.id, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      setSaved(true);
      setPassword("");
      setTimeout(() => onOpenChange(false), 800);
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Gagal menyalin tautan. Salin secara manual dari kotak di atas.");
    }
  };

  const handleSave = () => {
    setError(null);
    const settings: ShareSettings = {};

    if (isPublic !== file.isPublic) settings.isPublic = isPublic;

    if (passwordMode === "set") {
      if (password.length < 4) return setError("Password minimal 4 karakter.");
      settings.password = password;
    } else if (passwordMode === "remove" && file.hasPassword) {
      settings.password = null;
    }

    const currentExpiry = toLocalInput(file.expiresAt);
    if (expires !== currentExpiry) {
      if (expires) {
        const date = new Date(expires);
        if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
          return setError("Batas waktu harus di masa depan.");
        }
        settings.expiresAt = date.toISOString();
      } else {
        settings.expiresAt = null;
      }
    }

    if (Object.keys(settings).length === 0) return onOpenChange(false);
    mutation.mutate(settings);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-y-auto bg-zinc-950 border border-white/10 p-6 rounded-2xl shadow-2xl z-50 animate-in zoom-in-95 duration-200">
          <Dialog.Title className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-blue-400" /> Bagikan File
          </Dialog.Title>
          <Dialog.Description className="text-sm text-zinc-400 mb-6">
            Atur siapa yang bisa mengakses <strong className="text-zinc-200 break-all">{file.fileName}</strong>.
          </Dialog.Description>

          <div className="space-y-5">
            {/* Visibilitas */}
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Visibilitas file">
              {[
                { value: true, label: "Publik", hint: "Siapa pun dengan tautan", Icon: Globe },
                { value: false, label: "Privat", hint: "Hanya Anda", Icon: Lock },
              ].map(({ value, label, hint, Icon }) => (
                <button
                  key={label}
                  type="button"
                  role="radio"
                  aria-checked={isPublic === value}
                  onClick={() => setIsPublic(value)}
                  className={`text-left rounded-lg border px-3 py-2.5 transition-colors ${
                    isPublic === value ? "border-blue-500/50 bg-blue-500/10" : "border-white/10 hover:bg-white/[0.03]"
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-200">
                    <Icon className="w-4 h-4" /> {label}
                  </span>
                  <span className="text-xs text-zinc-500">{hint}</span>
                </button>
              ))}
            </div>

            {isPublic && (
              <>
                {/* Password */}
                <div>
                  <label htmlFor="share-password" className="text-xs font-medium text-zinc-400 flex items-center gap-1.5 mb-1.5">
                    <KeyRound className="w-3.5 h-3.5" /> Kata Sandi (Opsional)
                  </label>
                  {passwordMode === "keep" ? (
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                      <span className="text-sm text-amber-200">Tautan dilindungi password</span>
                      <div className="flex gap-2 text-xs">
                        <button type="button" onClick={() => setPasswordMode("set")} className="text-zinc-300 hover:text-white">
                          Ganti
                        </button>
                        <button type="button" onClick={() => setPasswordMode("remove")} className="text-red-400 hover:text-red-300">
                          Hapus
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        id="share-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder={file.hasPassword && passwordMode === "remove" ? "Password akan dihapus" : "Biarkan kosong jika tanpa password"}
                        value={password}
                        maxLength={128}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setPasswordMode(e.target.value ? "set" : "remove");
                        }}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50"
                      />
                      {file.hasPassword && (
                        <button
                          type="button"
                          onClick={() => {
                            setPassword("");
                            setPasswordMode("keep");
                          }}
                          className="px-3 text-xs text-zinc-400 hover:text-white border border-white/10 rounded-lg"
                        >
                          Batal
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Kedaluwarsa */}
                <div>
                  <label htmlFor="share-expires" className="text-xs font-medium text-zinc-400 flex items-center gap-1.5 mb-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Batas Waktu / Kedaluwarsa (Opsional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="share-expires"
                      type="datetime-local"
                      value={expires}
                      min={minLocalInput()}
                      onChange={(e) => setExpires(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 [color-scheme:dark]"
                    />
                    {expires && (
                      <button
                        type="button"
                        onClick={() => setExpires("")}
                        className="px-2 text-zinc-400 hover:text-white border border-white/10 rounded-lg"
                        aria-label="Hapus batas waktu"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Tautan */}
                <div>
                  <span className="text-xs font-medium text-zinc-400 mb-1.5 block">Tautan Publik</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-400 truncate select-all">
                      {publicUrl}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                      title="Salin Tautan"
                      aria-label="Salin tautan"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {!file.isPublic && (
                    <p className="text-xs text-zinc-500 mt-1.5">Tautan aktif setelah Anda menyimpan perubahan.</p>
                  )}
                </div>
              </>
            )}

            {error && (
              <p role="alert" className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {saved && (
              <p role="status" className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                Pengaturan berbagi tersimpan.
              </p>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Dialog.Close className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">Tutup</Dialog.Close>
            <button
              type="button"
              onClick={handleSave}
              disabled={mutation.isPending || saved}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Simpan
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
