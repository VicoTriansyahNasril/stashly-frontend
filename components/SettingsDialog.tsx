"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Settings, X } from "lucide-react";
import { updateUserSettings } from "@/lib/api";
import { USERNAME_PATTERN } from "@/lib/config";
import { useUserSettings } from "@/hooks/useUserSettings";
import type { LayoutStyle, UserSettings } from "@/types/file";
import { CustomSelect } from "./CustomSelect";

const validateUsername = (value: string) => {
  if (!value) return null;
  if (!USERNAME_PATTERN.test(value)) {
    return "3-30 karakter: huruf kecil, angka, - atau _, tidak diawali/diakhiri simbol.";
  }
  return null;
};

function SettingsForm({ settings, onDone }: { settings: UserSettings; onDone: () => void }) {
  const [username, setUsername] = useState(settings.username ?? "");
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>(settings.layoutStyle ?? "grid");
  const queryClient = useQueryClient();

  const normalized = username.trim().toLowerCase();
  const usernameError = validateUsername(normalized);

  const mutation = useMutation({
    mutationFn: () =>
      updateUserSettings({
        username: normalized === (settings.username ?? "") ? undefined : normalized || null,
        layoutStyle: layoutStyle === settings.layoutStyle ? undefined : layoutStyle,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["me"], updated);
      onDone();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!usernameError) mutation.mutate();
      }}
    >
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label htmlFor="settings-username" className="text-sm font-medium text-zinc-300">
            Username
          </label>
          <p id="settings-username-hint" className="text-xs text-zinc-500">
            Digunakan untuk URL halaman publik Anda (contoh: /{normalized || "username"})
          </p>
          <input
            id="settings-username"
            type="text"
            value={username}
            maxLength={30}
            autoComplete="off"
            aria-invalid={!!usernameError}
            aria-describedby="settings-username-hint"
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Masukkan username unik"
            className="w-full h-10 bg-black/50 border border-white/10 rounded-md px-3 text-sm text-white focus:outline-none focus:border-white/30 aria-[invalid=true]:border-red-500/50"
          />
          {usernameError && <p className="text-xs text-red-400">{usernameError}</p>}
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium text-zinc-300">Tata Letak (File)</span>
          <CustomSelect
            value={layoutStyle}
            onChange={(val) => setLayoutStyle(val as LayoutStyle)}
            options={[
              { value: "grid", label: "Grid (Kotak-kotak)" },
              { value: "list", label: "List (Baris memanjang)" },
              { value: "canvas", label: "Canvas (Bebas / Drag & Drop)" },
            ]}
            className="w-full"
          />
        </div>

        {mutation.error && (
          <p role="alert" className="p-3 rounded-md text-sm bg-red-500/10 text-red-400 border border-red-500/20">
            {mutation.error.message}
          </p>
        )}
      </div>

      <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-white/[0.02]">
        <Dialog.Close type="button" className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors">
          Batal
        </Dialog.Close>
        <button
          type="submit"
          disabled={mutation.isPending || !!usernameError}
          className="px-4 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {mutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}

export function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: settings, isLoading, error } = useUserSettings();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-[calc(100%-2rem)] max-w-md bg-zinc-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <Dialog.Title className="flex items-center gap-2 text-lg font-medium text-zinc-200">
              <Settings className="w-5 h-5 text-zinc-400" /> Pengaturan
            </Dialog.Title>
            <Dialog.Description className="sr-only">Atur username dan tata letak file</Dialog.Description>
            <Dialog.Close className="text-zinc-500 hover:text-white transition-colors" aria-label="Tutup">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12" role="status">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
            </div>
          ) : error || !settings ? (
            <p role="alert" className="p-6 text-sm text-red-400">
              {error?.message ?? "Gagal memuat pengaturan."}
            </p>
          ) : (
            // key: form di-reset dengan data terbaru setiap kali dialog dibuka
            open && <SettingsForm key={String(open)} settings={settings} onDone={() => onOpenChange(false)} />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
