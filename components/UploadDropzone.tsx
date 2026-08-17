"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadFile } from "../lib/api";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function UploadDropzone() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("File melebihi batas maksimal 50MB");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      await uploadFile(file);
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['files'] });
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah file");
    } finally {
      setUploading(false);
    }
  }, [queryClient]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
    disabled: uploading,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'application/pdf': ['.pdf'],
      'application/vnd.android.package-archive': ['.apk']
    }
  });

  return (
    <div className="w-full max-w-2xl">
      <div 
        {...getRootProps()} 
        className={`border border-dashed rounded-xl p-10 text-center transition-all bg-white/[0.01]
          ${uploading ? 'opacity-50 cursor-not-allowed border-white/5' : 'cursor-pointer'}
          ${isDragActive && !uploading ? 'border-zinc-300 bg-white/[0.03]' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-3 rounded-lg border ${isDragActive ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10'}`}>
            <UploadCloud className={`h-6 w-6 ${isDragActive ? 'text-zinc-100' : 'text-zinc-400'}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-300 mb-1">
              {isDragActive ? "Lepaskan file di sini..." : "Klik atau seret file ke area ini"}
            </p>
            <p className="text-xs text-zinc-600">
              Mendukung JPG, PNG, WEBP, PDF, APK hingga 50MB
            </p>
          </div>
        </div>
      </div>

      {uploading && (
        <div className="mt-4 p-3 rounded-lg bg-white/[0.02] border border-white/10 text-zinc-300 flex items-center justify-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
          <span>Mengunggah file ke Google Drive...</span>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-2 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Upload gagal</p>
            <p className="text-xs mt-0.5 opacity-80">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4" />
          <span className="font-medium">File berhasil diunggah dan disimpan.</span>
        </div>
      )}
    </div>
  );
}
