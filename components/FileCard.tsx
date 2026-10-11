import { Card, CardContent, CardFooter } from "./ui/card";
import { formatFileSize, getFileIcon, formatDate } from "../lib/utils";
import { StashlyFile } from "../types/file";
import { FileIcon, ImageIcon, FileTextIcon, PackageIcon, Download, Eye, Trash2, Link as LinkIcon, X, Edit2, Check } from "lucide-react";
import { Button } from "./ui/button";
import { deleteFile, restoreFile, forceDeleteFile, renameFile } from "../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { ShareDialog } from "./ShareDialog";
import { ConfirmDialog, AlertDialog } from "./CustomDialog";
import { useState, useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface FileCardProps {
  file: StashlyFile;
  isAdmin?: boolean;
}

export function FileCard({ file, isAdmin = false }: FileCardProps) {
  const { data: session } = useSession();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [isForceDeleteOpen, setIsForceDeleteOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(file.fileName);
  const [alertInfo, setAlertInfo] = useState({ open: false, title: "", description: "" });
  
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: deleteFile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['files'] })
  });

  const restoreMutation = useMutation({
    mutationFn: restoreFile,
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['trash'] });
       queryClient.invalidateQueries({ queryKey: ['files'] });
    }
  });

  const forceDeleteMutation = useMutation({
    mutationFn: forceDeleteFile,
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['trash'] });
       queryClient.invalidateQueries({ queryKey: ['files'] });
    }
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string, name: string }) => renameFile(id, name),
    onSuccess: () => {
       setIsEditingName(false);
       queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (err: any) => {
       setAlertInfo({ open: true, title: "Gagal Mengubah Nama", description: err.message });
    }
  });

  const handleRenameSubmit = () => {
    if (newName.trim() === "" || newName.trim() === file.fileName) {
      setIsEditingName(false);
      setNewName(file.fileName);
      return;
    }
    renameMutation.mutate({ id: file.id, name: newName });
  };

  const isTrash = !!file.deletedAt;

  const handleDelete = () => setIsDeleteOpen(true);
  const handleRestore = () => setIsRestoreOpen(true);
  const handleForceDelete = () => setIsForceDeleteOpen(true);

  const iconType = getFileIcon(file.fileType);

  const renderIcon = () => {
    switch (iconType) {
      case 'image':
        return (
          <div className="w-full h-full absolute inset-0">
            <img 
              src={file.isPublic ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/files/public/${file.id}/stream` : `https://drive.google.com/uc?export=view&id=${file.driveFileId}`} 
              alt={file.fileName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.parentElement?.nextElementSibling) {
                  (e.currentTarget.parentElement.nextElementSibling as HTMLElement).style.display = 'flex';
                }
              }}
            />
          </div>
        );
      case 'pdf': return <FileTextIcon className="h-8 w-8 text-zinc-400 group-hover:text-zinc-200 transition-colors" />;
      case 'apk': return <PackageIcon className="h-8 w-8 text-zinc-400 group-hover:text-zinc-200 transition-colors" />;
      default: return <FileIcon className="h-8 w-8 text-zinc-400 group-hover:text-zinc-200 transition-colors" />;
    }
  };

  const handleDownload = () => {
    if (file.webContentLink) window.open(file.webContentLink, '_blank');
    else setAlertInfo({ open: true, title: "Gagal Mengunduh", description: "Link download tidak tersedia." });
  };

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const streamUrl = file.isPublic 
    ? `${apiBase}/files/public/${file.id}/stream`
    : `${apiBase}/files/${file.id}/stream`;

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  return (
    <div className="group rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.05] hover:border-white/20 transition-all flex flex-col h-full relative">
      <div className={`p-6 flex flex-col items-center justify-center min-h-[160px] sm:min-h-[200px] relative border-b border-white/[0.05] overflow-hidden ${isTrash ? 'opacity-50 grayscale' : ''}`}>
        {renderIcon()}
        {iconType === 'image' && (
          <div className="hidden items-center justify-center absolute inset-0 bg-black/50">
             <ImageIcon className="h-8 w-8 text-zinc-400" />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow relative z-10 bg-black/40 backdrop-blur-sm">
        <div className="mb-4">
          <div className="flex items-center justify-between w-full group/title">
            {isEditingName ? (
              <div className="flex items-center w-full bg-black/50 border border-white/20 rounded-md px-2 py-1">
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSubmit(); else if (e.key === 'Escape') { setIsEditingName(false); setNewName(file.fileName); } }}
                  className="w-full bg-transparent text-sm text-zinc-200 outline-none"
                  autoFocus
                />
                <button onClick={handleRenameSubmit} disabled={renameMutation.isPending} className="ml-1 text-emerald-400 hover:text-emerald-300">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-medium text-sm text-zinc-200 truncate pr-2" title={file.fileName}>
                  {file.fileName}
                </h3>
                {isAdmin && !isTrash && (
                  <button onClick={() => setIsEditingName(true)} className="opacity-0 group-hover/title:opacity-100 text-zinc-400 hover:text-white transition-opacity p-1 flex-shrink-0">
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </>
            )}
          </div>
          <div className="flex justify-between items-center w-full mt-1.5">
            <p className="text-xs text-zinc-500 font-medium">{formatFileSize(file.fileSize)}</p>
            <p className="text-[10px] text-zinc-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded">
              {formatDate((isTrash ? file.deletedAt : file.uploadedAt) as string)}
            </p>
          </div>
        </div>
        
        <div className="flex w-full gap-1.5 mt-auto pt-3 border-t border-white/[0.05]">
          {isTrash ? (
            <>
               <button onClick={handleRestore} disabled={restoreMutation.isPending} className="flex-1 inline-flex items-center justify-center h-9 text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-md transition-colors" title="Pulihkan">
                 Pulihkan
               </button>
               <button onClick={handleForceDelete} disabled={forceDeleteMutation.isPending} className="flex-1 inline-flex items-center justify-center h-9 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md transition-colors" title="Hapus Permanen">
                 <Trash2 className="w-4 h-4" />
               </button>
            </>
          ) : (
            <>
              <button onClick={handlePreview} disabled={!file.webViewLink} className="flex-1 inline-flex items-center justify-center h-9 text-xs font-medium bg-white/[0.03] hover:bg-white/10 text-zinc-300 rounded-md disabled:opacity-50 transition-colors" title="Preview">
                <Eye className="w-4 h-4" />
              </button>
              <button onClick={() => setIsShareOpen(true)} className="flex-1 inline-flex items-center justify-center h-9 text-xs font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-md transition-colors" title="Bagikan">
                <LinkIcon className="w-4 h-4" />
              </button>
              <button onClick={handleDownload} disabled={!file.webContentLink} className="flex-1 inline-flex items-center justify-center h-9 text-xs font-medium bg-white/[0.03] hover:bg-white/10 text-zinc-300 rounded-md disabled:opacity-50 transition-colors" title="Unduh">
                <Download className="w-4 h-4" />
              </button>
              {isAdmin && (
                <button onClick={handleDelete} disabled={deleteMutation.isPending} className="flex-1 inline-flex items-center justify-center h-9 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md transition-colors" title="Hapus">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <ShareDialog 
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        file={file}
        publicUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/s/${file.id}`}
      />

      <ConfirmDialog 
        open={isDeleteOpen} onOpenChange={setIsDeleteOpen}
        title="Pindahkan ke Tong Sampah"
        description="File ini akan disembunyikan sementara. Anda dapat memulihkannya atau menghapusnya secara permanen dari Tong Sampah."
        confirmText="Pindahkan"
        isDestructive={true}
        onConfirm={() => deleteMutation.mutate(file.id)}
      />

      <ConfirmDialog 
        open={isForceDeleteOpen} onOpenChange={setIsForceDeleteOpen}
        title="Hapus Permanen"
        description="File ini akan dihapus permanen dari database dan Google Drive Anda. Tindakan ini tidak dapat dibatalkan!"
        confirmText="Hapus Permanen"
        isDestructive={true}
        onConfirm={() => forceDeleteMutation.mutate(file.id)}
      />

      <ConfirmDialog 
        open={isRestoreOpen} onOpenChange={setIsRestoreOpen}
        title="Pulihkan File"
        description="File ini akan dipulihkan dan terlihat kembali di daftar utama Anda."
        confirmText="Pulihkan"
        onConfirm={() => restoreMutation.mutate(file.id)}
      />


      <AlertDialog 
        open={alertInfo.open}
        onOpenChange={(open) => setAlertInfo(prev => ({ ...prev, open }))}
        title={alertInfo.title}
        description={alertInfo.description}
      />

      <DialogPrimitive.Root open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content className="fixed inset-4 sm:inset-10 z-[100] border border-white/10 bg-zinc-950 p-0 shadow-2xl flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-xl overflow-hidden">
             <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/50">
                <h2 className="text-white font-medium truncate pr-4">{file.fileName}</h2>
                <button onClick={() => setIsPreviewOpen(false)} className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5" />
                </button>
             </div>
             <div className="flex-1 overflow-auto flex items-center justify-center relative p-4 sm:p-8 bg-[#050505]">
                {iconType === 'image' ? (
                   <img src={streamUrl} alt={file.fileName} className="max-w-full max-h-full object-contain" />
                ) : iconType === 'video' ? (
                   <video src={streamUrl} controls autoPlay className="max-w-full max-h-full rounded-lg" />
                ) : iconType === 'pdf' ? (
                   <iframe src={streamUrl} className="w-full h-full rounded border-0 bg-white" />
                ) : (
                   <div className="text-center">
                     <FileIcon className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
                     <p className="text-zinc-300">File ini tidak dapat dipreview secara langsung di dalam aplikasi.</p>
                     <Button onClick={() => window.open(file.webViewLink || file.webContentLink || '', '_blank')} className="mt-4 bg-white text-black hover:bg-zinc-200">
                       Buka di Google Drive
                     </Button>
                   </div>
                )}
             </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
