"use client";

import { useState, useEffect } from "react";
import { Settings, X, Loader2 } from "lucide-react";
import { getUserSettings, updateUserSettings } from "../lib/api";
import { CustomSelect } from "./CustomSelect";

export function SettingsDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [username, setUsername] = useState("");
  const [layoutStyle, setLayoutStyle] = useState("grid");
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open]);

  const loadSettings = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await getUserSettings();
      const data = res.data;
      if (data) {
        setUsername(data.username || "");
        setLayoutStyle(data.layoutStyle || "grid");
      }
    } catch (error) {
      console.error("Failed to load settings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateUserSettings({
        username: username.trim() || undefined,
        layoutStyle
      });
      setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' });
      
      // We can reload the page to apply theme/layout globally for now
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal menyimpan pengaturan' });
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      
      <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-zinc-400" />
            <h2 className="text-lg font-medium text-zinc-200">Pengaturan</h2>
          </div>
          <button onClick={() => onOpenChange(false)} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
            </div>
          ) : (
            <>
              {/* Username */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Username</label>
                <p className="text-xs text-zinc-500 mb-2">Digunakan untuk URL halaman publik Anda (contoh: /username)</p>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username unik"
                  className="w-full h-10 bg-black/50 border border-white/10 rounded-md px-3 text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>



              {/* Layout */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Tata Letak (File)</label>
                <CustomSelect
                  value={layoutStyle}
                  onChange={(val) => setLayoutStyle(val)}
                  options={[
                    { value: "grid", label: "Grid (Kotak-kotak)" },
                    { value: "list", label: "List (Baris memanjang)" },
                    { value: "canvas", label: "Canvas (Bebas / Drag & Drop)" }
                  ]}
                  className="w-full"
                />
              </div>

              {message && (
                <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {message.text}
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-white/[0.02]">
          <button 
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={handleSave}
            disabled={loading || saving}
            className="px-4 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
}
