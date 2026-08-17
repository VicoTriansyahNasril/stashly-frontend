"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { uploadFile } from "../lib/api";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_TYPES = {
  'image/png': [],
  'image/jpeg': [],
  'image/webp': [],
  'application/pdf': [],
  'application/vnd.android.package-archive': []
};

export function UploadDropzone() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    setSuccess(false);

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File size exceeds 50MB limit');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type');
      } else {
        setError('File rejected');
      }
      return;
    }

    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);

    try {
      await uploadFile(file);
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['files'] });
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [queryClient]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    accept: ACCEPTED_TYPES,
    multiple: false
  });

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <UploadCloud className={`h-12 w-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          <div>
            <p className="text-lg font-medium text-slate-700">
              {isDragActive ? "Lepaskan file di sini..." : "Tarik & lepas file kamu di sini, atau klik untuk mencari"}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Mendukung file: JPG, PNG, WEBP, PDF, dan APK (Maksimal 50MB)
            </p>
          </div>
        </div>
      </div>

      {uploading && (
        <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center gap-3 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-medium">Sedang mengunggah file kamu... mohon tunggu sebentar ya.</span>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 flex items-start gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Waduh, gagal mengunggah file!</p>
            <p className="text-sm mt-0.5 opacity-90">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Hore, file kamu berhasil diunggah dan sudah bisa dibagikan!</span>
        </div>
      )}
    </div>
  );
}
