"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import { X, RefreshCw, FolderDown, CheckSquare, Square, Pencil, FileIcon } from "lucide-react";
import { getFolders, getDriveFiles, syncDriveFiles } from "@/lib/api";
import { getFileIcon } from "@/lib/utils";
import { CustomSelect } from "./CustomSelect";
import { useQueryClient } from "@tanstack/react-query";

interface SyncDriveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SyncDriveDialog({ open, onOpenChange }: SyncDriveDialogProps) {
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState("root");
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const queryClient = useQueryClient();

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    if (open) {
      getFolders().then(res => {
        if (res.data) setFolders(res.data);
      }).catch(e => console.error(e));
      setDriveFiles([]);
      setSelectedFiles(new Set());
    }
  }, [open]);

  const handleFetchFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await getDriveFiles(selectedFolder);
      if (res.data) {
        // add editable name property
        const filesWithNames = res.data.map((f: any) => ({ ...f, fileName: f.name }));
        setDriveFiles(filesWithNames);
      }
    } catch (e) {
      console.error(e);
      alert("Gagal memuat file dari Drive.");
    } finally {
      setLoadingFiles(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === driveFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(driveFiles.map(f => f.id)));
    }
  };

  const toggleFile = (id: string) => {
    const newSet = new Set(selectedFiles);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedFiles(newSet);
  };

  const handleNameChange = (id: string, newName: string) => {
    setDriveFiles(files => files.map(f => f.id === id ? { ...f, fileName: newName } : f));
  };

  const handleSync = async () => {
    if (selectedFiles.size === 0) return;
    setIsSyncing(true);
    
    const filesToSync = driveFiles
      .filter(f => selectedFiles.has(f.id))
      .map(f => ({
        driveFileId: f.id,
        fileName: f.fileName,
        mimeType: f.mimeType,
        size: f.size
      }));

    try {
      await syncDriveFiles({ folderId: selectedFolder, filesToSync });
      queryClient.invalidateQueries({ queryKey: ["files"] });
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      alert("Gagal melakukan sinkronisasi.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl rounded-2xl duration-200 animate-in fade-in-0 zoom-in-95">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-zinc-400" />
              Sinkronisasi dari Google Drive
            </Dialog.Title>
            <Dialog.Description className="text-sm text-zinc-400">
              Pilih folder dan file yang sudah ada di Google Drive Anda untuk ditampilkan di Stashly tanpa perlu upload ulang.
            </Dialog.Description>
          </div>

          <div className="space-y-4 py-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <CustomSelect
                value={selectedFolder}
                onChange={(val) => setSelectedFolder(val)}
                options={[
                  { value: "root", label: "📁 Root (Halaman Depan)" },
                  ...folders.map(folder => ({ value: folder.id, label: `📁 ${folder.name}` }))
                ]}
                className="flex-1 min-w-0"
              />
              <button
                onClick={handleFetchFiles}
                disabled={loadingFiles}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loadingFiles ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FolderDown className="w-4 h-4" />}
                Muat File
              </button>
            </div>

            {driveFiles.length > 0 && (
              <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]">
                <div className="p-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                  <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors">
                    {selectedFiles.size === driveFiles.length ? <CheckSquare className="w-4 h-4 text-white" /> : <Square className="w-4 h-4" />}
                    Pilih Semua ({driveFiles.length})
                  </button>
                  <span className="text-sm text-zinc-400">{selectedFiles.size} dipilih</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2 space-y-2">
                  {driveFiles.map(file => (
                    <div key={file.id} className="flex items-center gap-3 p-2 hover:bg-white/[0.03] rounded-lg group">
                      <button onClick={() => toggleFile(file.id)}>
                        {selectedFiles.has(file.id) ? (
                          <CheckSquare className="w-5 h-5 text-white" />
                        ) : (
                          <Square className="w-5 h-5 text-zinc-500" />
                        )}
                      </button>
                      {file.thumbnailLink ? (
                        <button onClick={() => setPreviewFile(file)} className="block hover:opacity-80 transition-opacity" title="Klik untuk pratinjau">
                          <img src={file.thumbnailLink} referrerPolicy="no-referrer" className="w-10 h-10 rounded object-cover bg-white/10" />
                        </button>
                      ) : (
                        <button onClick={() => setPreviewFile(file)} className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-xs text-zinc-500 hover:bg-white/10 transition-colors" title="Klik untuk pratinjau">
                          ?
                        </button>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input 
                            value={file.fileName}
                            onChange={(e) => handleNameChange(file.id, e.target.value)}
                            className="bg-transparent text-sm text-zinc-200 focus:outline-none focus:border-b focus:border-white/30 px-1 w-full"
                          />
                          <Pencil className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-zinc-500 px-1">{file.mimeType}</p>
                          {file.webViewLink && (
                            <button onClick={() => setPreviewFile(file)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 bg-blue-400/10 px-1.5 py-0.5 rounded">
                              Lihat Preview
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {driveFiles.length === 0 && !loadingFiles && (
              <div className="text-center py-8 text-zinc-500 text-sm border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                Pilih folder dan klik "Muat File" untuk melihat isinya.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Batal
              </button>
            </Dialog.Close>
            <button 
              onClick={handleSync}
              disabled={selectedFiles.size === 0 || isSyncing}
              className="px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-md text-sm font-medium transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSyncing && <RefreshCw className="w-4 h-4 animate-spin" />}
              {isSyncing ? "Menyinkronkan..." : "Sinkronkan Terpilih"}
            </button>
          </div>
          
          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none">
            <X className="h-4 w-4 text-zinc-400 hover:text-white" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>

      {/* Nested Preview Dialog */}
      <Dialog.Root open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed inset-4 sm:inset-10 z-[100] border border-white/10 bg-zinc-950 p-0 shadow-2xl flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-xl overflow-hidden">
             <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/50">
                <h2 className="text-white font-medium truncate pr-4">{previewFile?.fileName}</h2>
                <button onClick={() => setPreviewFile(null)} className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5" />
                </button>
             </div>
             <div className="flex-1 overflow-auto flex items-center justify-center relative p-4 sm:p-8 bg-[#050505]">
                {previewFile && (() => {
                  const iconType = getFileIcon(previewFile.mimeType);
                  const streamUrl = `${apiBase}/files/drive-stream/${previewFile.id}?mimeType=${encodeURIComponent(previewFile.mimeType)}&fileName=${encodeURIComponent(previewFile.fileName)}`;
                  
                  if (iconType === 'image') {
                    return <img src={streamUrl} alt={previewFile.fileName} className="max-w-full max-h-full object-contain" />;
                  } else if (iconType === 'video') {
                    return <video src={streamUrl} controls autoPlay className="max-w-full max-h-full rounded-lg" />;
                  } else if (iconType === 'pdf') {
                    return <iframe src={streamUrl} className="w-full h-full rounded border-0 bg-white" />;
                  } else {
                    return (
                      <div className="text-center">
                        <FileIcon className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
                        <p className="text-zinc-300">File ini tidak dapat dipreview secara langsung di dalam aplikasi.</p>
                        <button onClick={() => window.open(previewFile.webViewLink || previewFile.webContentLink || '', '_blank')} className="mt-4 px-4 py-2 bg-white text-black font-medium hover:bg-zinc-200 rounded-md transition-colors">
                          Buka di Google Drive
                        </button>
                      </div>
                    );
                  }
                })()}
             </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </Dialog.Root>
  );
}
