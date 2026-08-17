import { Card, CardContent, CardFooter } from "./ui/card";
import { formatFileSize, getFileIcon, formatDate } from "../lib/utils";
import { StashlyFile } from "../types/file";
import { FileIcon, ImageIcon, FileTextIcon, PackageIcon, Download, Eye, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { deleteFile } from "../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface FileCardProps {
  file: StashlyFile;
  isAdmin?: boolean;
}

export function FileCard({ file, isAdmin = false }: FileCardProps) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    }
  });

  const handleDelete = () => {
    if (confirm("Hapus file ini permanen dari database? (Mungkin akan terhapus dari Drive juga)")) {
      deleteMutation.mutate(file.id);
    }
  };
  const iconType = getFileIcon(file.fileType);

  const renderIcon = () => {
    switch (iconType) {
      case 'image':
        return <ImageIcon className="h-8 w-8 text-zinc-400 group-hover:text-zinc-200 transition-colors" />;
      case 'pdf':
        return <FileTextIcon className="h-8 w-8 text-zinc-400 group-hover:text-zinc-200 transition-colors" />;
      case 'apk':
        return <PackageIcon className="h-8 w-8 text-zinc-400 group-hover:text-zinc-200 transition-colors" />;
      default:
        return <FileIcon className="h-8 w-8 text-zinc-400 group-hover:text-zinc-200 transition-colors" />;
    }
  };

  const handleDownload = () => {
    if (file.webContentLink) {
      window.open(file.webContentLink, '_blank');
    } else {
      alert('Link download tidak tersedia.');
    }
  };

  const handlePreview = () => {
    if (file.webViewLink) {
      window.open(file.webViewLink, '_blank');
    } else {
      alert('Link preview tidak tersedia.');
    }
  };

  return (
    <div className="group rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.05] hover:border-white/20 transition-all flex flex-col h-full relative">
      <div className="p-6 flex flex-col items-center justify-center min-h-[140px] relative border-b border-white/[0.05]">
        {renderIcon()}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-4">
          <h3 className="font-medium text-sm text-zinc-200 truncate w-full" title={file.fileName}>
            {file.fileName}
          </h3>
          <div className="flex justify-between items-center w-full mt-1.5">
            <p className="text-xs text-zinc-500 font-medium">
              {formatFileSize(file.fileSize)}
            </p>
            <p className="text-[10px] text-zinc-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded">
              {formatDate(file.uploadedAt)}
            </p>
          </div>
        </div>
        
        <div className="flex w-full gap-2 mt-auto">
          <button 
            onClick={handlePreview}
            disabled={!file.webViewLink}
            className="flex-1 inline-flex items-center justify-center h-8 text-xs font-medium bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5 rounded-md disabled:opacity-50 transition-colors"
          >
            <Eye className="w-3 h-3 mr-1.5" />
            Preview
          </button>
          <button 
            onClick={handleDownload}
            disabled={!file.webContentLink}
            className="flex-1 inline-flex items-center justify-center h-8 text-xs font-medium bg-zinc-100 hover:bg-white text-black rounded-md disabled:opacity-50 transition-colors"
          >
            <Download className="w-3 h-3 mr-1.5" />
            Unduh
          </button>
        </div>

        {isAdmin && (
          <button 
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="w-full mt-2 inline-flex items-center justify-center h-8 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-md transition-colors"
          >
            <Trash2 className="w-3 h-3 mr-1.5" />
            {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
          </button>
        )}
      </div>
    </div>
  );
}
