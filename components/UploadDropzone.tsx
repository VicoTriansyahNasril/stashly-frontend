"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { uploadFile, createFolder } from "@/lib/api";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_SIZE } from "@/lib/config";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, FolderOpen, Plus, File as FileIcon, HardDrive } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useFolders } from "@/hooks/useFolders";
import { useDrivePicker } from "@/hooks/useDrivePicker";

const errorMessage = (err: unknown, fallback: string) => (err instanceof Error && err.message ? err.message : fallback);

const validateFileName = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return "Nama file tidak boleh kosong";
  if (trimmed.length > 255) return "Nama file maksimal 255 karakter";
  if (/[\\/\u0000-\u001f]/.test(trimmed)) return "Nama file tidak boleh mengandung / atau \\";
  return null;
};

export function UploadDropzone() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  // Folder states
  const { data: foldersData, isLoading: isLoadingFolders } = useFolders();
  const [selectedFolder, setSelectedFolder] = useState<string>("root");
  // Folder yang baru dipilih lewat Google Picker (agar namanya langsung tampil)
  const [pickedFolder, setPickedFolder] = useState<{ id: string; name: string } | null>(null);
  const folderPicker = useDrivePicker();
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolderLoading, setCreatingFolderLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchFolderQuery, setSearchFolderQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewName, setPreviewName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const filteredFolders = (foldersData ?? []).filter((folder) =>
    folder.name.toLowerCase().includes(searchFolderQuery.toLowerCase())
  );

  // Bebaskan object URL preview saat diganti/komponen dilepas (mencegah memory leak)
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handlePickFolder = async () => {
    setIsDropdownOpen(false);
    const [folder] = await folderPicker.pick({ mode: "folder" });
    if (!folder) return;
    setPickedFolder({ id: folder.id, name: folder.name });
    setSelectedFolder(folder.id);
    queryClient.invalidateQueries({ queryKey: ["folders"] });
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreatingFolderLoading(true);
    setError(null);
    try {
      const folder = await createFolder(newFolderName.trim());
      await queryClient.invalidateQueries({ queryKey: ['folders'] });
      setSelectedFolder(folder.id);
      setIsCreatingFolder(false);
      setNewFolderName("");
    } catch (err) {
      setError(errorMessage(err, "Gagal membuat folder"));
    } finally {
      setCreatingFolderLoading(false);
    }
  };

  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[], rejections: FileRejection[]) => {
    const rejectionCode = rejections[0]?.errors[0]?.code;
    if (rejectionCode) {
      setError(
        rejectionCode === "file-too-large"
          ? "File melebihi batas maksimal 50MB"
          : rejectionCode === "file-invalid-type"
            ? "Tipe file tidak didukung. Gunakan JPG, PNG, WEBP, PDF, atau APK."
            : "File tidak dapat diunggah"
      );
      return;
    }
    const file = acceptedFiles[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewName(file.name);
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
    setError(null);
    setSuccess(false);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    const nameError = validateFileName(previewName);
    if (nameError) {
      setError(nameError);
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(false);

    try {
      let finalFile = selectedFile;
      const finalName = previewName.trim();
      if (finalName !== selectedFile.name) {
        finalFile = new File([selectedFile], finalName, { type: selectedFile.type });
      }

      await uploadFile(finalFile, {
        folderId: selectedFolder === "root" ? undefined : selectedFolder,
        onProgress: setUploadProgress,
      });
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });

      setSelectedFile(null);
      setPreviewUrl(null);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(errorMessage(err, "Gagal mengunggah file"));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancelPreview = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPreviewName("");
    setError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
    disabled: uploading,
    maxSize: MAX_UPLOAD_SIZE,
    accept: ALLOWED_UPLOAD_TYPES,
  });

  return (
    <div className="w-full max-w-2xl">
      {/* Folder Selection Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 bg-white/[0.02] p-3 rounded-lg border border-white/[0.05]">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-zinc-400" />
          <span className="text-sm text-zinc-300 font-medium">Simpan ke:</span>
        </div>
        
        {isCreatingFolder ? (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Nama folder..."
              aria-label="Nama folder baru"
              maxLength={255}
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              disabled={creatingFolderLoading}
              autoFocus
              className="h-8 bg-black/50 border border-white/10 rounded-md px-3 text-sm text-white focus:outline-none focus:border-white/30 w-full sm:w-40"
            />
            <button 
              onClick={handleCreateFolder}
              disabled={creatingFolderLoading || !newFolderName.trim()}
              className="h-8 px-3 text-xs font-medium bg-white text-black rounded hover:bg-zinc-200 disabled:opacity-50"
            >
              {creatingFolderLoading ? "..." : "Buat"}
            </button>
            <button 
              onClick={() => { setIsCreatingFolder(false); setNewFolderName(""); }}
              disabled={creatingFolderLoading}
              className="h-8 px-3 text-xs font-medium bg-transparent border border-white/10 text-zinc-300 rounded hover:bg-white/10"
            >
              Batal
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-48">
              <div
                onClick={() => {
                  if (!isLoadingFolders && !uploading) {
                    setIsDropdownOpen(!isDropdownOpen);
                    setSearchFolderQuery("");
                  }
                }}
                className={`h-8 bg-black/50 border border-white/10 rounded-md px-3 text-sm text-zinc-200 flex items-center justify-between cursor-pointer ${isLoadingFolders || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/30'}`}
              >
                <span className="truncate">
                  {selectedFolder === "root" 
                    ? "Root (Halaman Depan)" 
                    : foldersData?.find((f) => f.id === selectedFolder)?.name ||
                      (pickedFolder?.id === selectedFolder ? pickedFolder.name : "Pilih folder...")}
                </span>
                <span className="text-zinc-500 text-[10px]">▼</span>
              </div>
              
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 w-full sm:w-64 bg-zinc-900 border border-white/10 rounded-md shadow-xl z-40 overflow-hidden flex flex-col max-h-[300px]">
                    <div className="p-2 border-b border-white/5 sticky top-0 bg-zinc-900">
                      <input
                        type="text"
                        placeholder="Cari folder..."
                        value={searchFolderQuery}
                        onChange={(e) => setSearchFolderQuery(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-white/30"
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto p-1 flex-1">
                      <div 
                        onClick={() => { setSelectedFolder("root"); setIsDropdownOpen(false); }}
                        className={`px-2 py-1.5 text-sm rounded cursor-pointer flex items-center gap-2 ${selectedFolder === "root" ? 'bg-white/10 text-white' : 'text-zinc-300 hover:bg-white/5'}`}
                      >
                        📁 Root (Halaman Depan)
                      </div>
                      {filteredFolders.map((folder) => (
                        <div
                          key={folder.id}
                          onClick={() => { setSelectedFolder(folder.id); setIsDropdownOpen(false); }}
                          className={`px-2 py-1.5 text-sm rounded cursor-pointer flex items-center gap-2 ${selectedFolder === folder.id ? 'bg-white/10 text-white' : 'text-zinc-300 hover:bg-white/5'}`}
                        >
                          📁 {folder.name}
                        </div>
                      ))}
                      {filteredFolders.length === 0 && searchFolderQuery && (
                        <div className="px-2 py-3 text-xs text-center text-zinc-500">
                          Folder tidak ditemukan
                        </div>
                      )}
                      {folderPicker.isConfigured && (
                        <button
                          type="button"
                          onClick={handlePickFolder}
                          className="mt-1 w-full px-2 py-1.5 text-sm rounded flex items-center gap-2 text-blue-300 hover:bg-white/5 border-t border-white/5"
                        >
                          <HardDrive className="w-3.5 h-3.5" /> Pilih folder lain dari Google Drive…
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => setIsCreatingFolder(true)}
              disabled={uploading}
              className="h-8 px-3 text-xs font-medium bg-white/10 text-white rounded hover:bg-white/20 transition-colors flex items-center gap-1 whitespace-nowrap"
              title="Buat folder baru"
            >
              <Plus className="w-3.5 h-3.5" /> Baru
            </button>
          </div>
        )}
      </div>

      {/* Dropzone Area */}
      {selectedFile ? (
        <div className="border border-white/10 rounded-xl p-6 bg-zinc-950/50 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-32 h-32 flex-shrink-0 bg-black/50 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- blob URL lokal
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-zinc-500">
                  <FileIcon className="w-10 h-10 mb-2" />
                  <span className="text-xs uppercase">{selectedFile.type.split('/')[1] || 'FILE'}</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 w-full space-y-4">
              <div>
                <label htmlFor="upload-file-name" className="text-xs text-zinc-400 font-medium mb-1.5 block">Nama File</label>
                <input
                  id="upload-file-name"
                  type="text"
                  maxLength={255}
                  value={previewName}
                  onChange={(e) => setPreviewName(e.target.value)}
                  disabled={uploading}
                  className="w-full h-10 bg-black/50 border border-white/10 rounded-md px-3 text-sm text-white focus:outline-none focus:border-white/30"
                />
                <p className="text-xs text-zinc-500 mt-1.5">
                  Ukuran: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleCancelPreview}
                  disabled={uploading}
                  className="flex-1 h-10 rounded-md border border-white/10 text-sm font-medium text-zinc-300 hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={uploading || !previewName.trim()}
                  className="flex-1 h-10 rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UploadCloud className="w-4 h-4" />
                  )}
                  {uploading ? 'Mengunggah...' : 'Upload Sekarang'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all bg-zinc-950/50 backdrop-blur-sm
            ${uploading ? 'opacity-50 cursor-not-allowed border-white/5' : 'cursor-pointer'}
            ${isDragActive && !uploading ? 'border-white/40 bg-white/[0.04] shadow-[0_0_30px_rgba(255,255,255,0.05)]' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className={`p-4 rounded-full border transition-all duration-300 ${isDragActive ? 'bg-white/10 border-white/30 scale-110' : 'bg-white/5 border-white/10'}`}>
              <UploadCloud className={`h-8 w-8 transition-colors ${isDragActive ? 'text-white' : 'text-zinc-400'}`} />
            </div>
            <div>
              <p className="text-base font-medium text-zinc-200 mb-1.5">
                {isDragActive ? "Lepaskan file di sini..." : "Klik atau seret file ke area ini"}
              </p>
              <p className="text-xs text-zinc-500">
                Mendukung JPG, PNG, WEBP, PDF, APK hingga 50MB
              </p>
            </div>
          </div>
        </div>
      )}

      {uploading && (
        <div className="mt-4 p-4 rounded-lg bg-white/[0.03] border border-white/10 text-zinc-300 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-2 text-sm">
             <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                <span>Mengunggah file ke {selectedFolder === "root" ? "Google Drive..." : "Folder..."}</span>
             </div>
             <span className="font-medium text-white">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-black/50 rounded-full h-1.5 overflow-hidden">
             <div 
               className="bg-white h-1.5 rounded-full transition-all duration-300 ease-out" 
               style={{ width: `${uploadProgress}%` }}
             ></div>
          </div>
        </div>
      )}

      {folderPicker.error && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {folderPicker.error}
        </p>
      )}

      {error && (
        <div className="mt-4 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 text-sm animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-300">Gagal</p>
            <p className="text-xs mt-0.5 opacity-90">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-4 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3 text-sm animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">File berhasil diunggah dan disimpan.</span>
        </div>
      )}
    </div>
  );
}
