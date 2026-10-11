"use client";

import { useState, useEffect } from "react";
import { formatFileSize, getFileIcon, formatDate } from "../lib/utils";
import { FileIcon, ImageIcon, FileTextIcon, PackageIcon, Download, Lock, AlertCircle, Loader2 } from "lucide-react";

export function PublicShareView({ fileId }: { fileId: string }) {
  const [fileData, setFileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [password, setPassword] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await fetch(`http://localhost:3001/files/public/${fileId}`);
        const data = await res.json();
        
        if (!data.success) {
          setError(data.error || "File tidak ditemukan atau bukan publik");
          return;
        }
        
        setFileData(data.data);
      } catch (err: any) {
        setError("Gagal menghubungi server");
      } finally {
        setLoading(false);
      }
    };
    fetchMetadata();
  }, [fileId]);

  const handleDownload = async () => {
    if (!fileData) return;
    setDownloading(true);
    
    try {
      const url = new URL(`http://localhost:3001/files/public/${fileId}/stream`);
      if (fileData.hasPassword && password) {
        url.searchParams.append('password', password);
      }
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Gagal mengunduh file");
      }

      // Trigger download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileData.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      a.remove();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Memuat informasi file...</p>
      </div>
    );
  }

  if (error || !fileData) {
    return (
      <div className="bg-zinc-950 border border-red-500/30 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Akses Ditolak</h2>
        <p className="text-zinc-400">{error}</p>
      </div>
    );
  }

  const iconName = getFileIcon(fileData.fileType);
  const isExpired = fileData.expiresAt && new Date(fileData.expiresAt) < new Date();

  return (
    <div className="bg-white/[0.02] border border-white/10 p-8 rounded-2xl max-w-md w-full shadow-2xl backdrop-blur-sm animate-in fade-in zoom-in-95">
      <div className="text-center mb-6">
        <div className="w-20 h-20 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20 shadow-inner">
          {iconName === 'image' && <ImageIcon className="w-10 h-10 text-blue-400" />}
          {iconName === 'pdf' && <FileTextIcon className="w-10 h-10 text-blue-400" />}
          {iconName === 'apk' && <PackageIcon className="w-10 h-10 text-blue-400" />}
          {iconName === 'file' && <FileIcon className="w-10 h-10 text-blue-400" />}
        </div>
        <h1 className="text-xl font-semibold text-white truncate px-4" title={fileData.fileName}>
          {fileData.fileName}
        </h1>
        <p className="text-zinc-400 text-sm mt-1">{formatFileSize(fileData.fileSize)} • Dibagikan via Stashly</p>
      </div>

      {isExpired ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm text-center">
          Tautan file ini sudah kedaluwarsa dan tidak dapat diunduh lagi.
        </div>
      ) : (
        <div className="space-y-4">
          {fileData.hasPassword && (
            <div className="bg-black/40 border border-white/10 p-4 rounded-xl">
              <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5 mb-2">
                <Lock className="w-3.5 h-3.5" /> File Dilindungi Kata Sandi
              </label>
              <input
                type="password"
                placeholder="Masukkan kata sandi..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          )}

          <button
            onClick={handleDownload}
            disabled={downloading || (fileData.hasPassword && !password)}
            className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {downloading ? "Mengunduh..." : "Unduh File"}
          </button>
        </div>
      )}
    </div>
  );
}
