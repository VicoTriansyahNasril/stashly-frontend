"use client";

import { useState, useEffect } from "react";
import { useFiles } from "../hooks/useFiles";
import { FileCard } from "./FileCard";
import { FileGridSkeleton } from "./FileGridSkeleton";
import { CloudOff, Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { CustomSelect } from "./CustomSelect";

interface FileGridProps {
  isAdmin?: boolean;
  username?: string;
}

const DraggableFile = ({ file, onPositionChange, children }: any) => {
  const [pos, setPos] = useState({ x: file.posX || 0, y: file.posY || 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, input, a')) {
      return;
    }
    setIsDragging(true);
    setStartPos({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPos({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    onPositionChange(file.id, pos.x, pos.y);
  };

  return (
    <div 
      style={{ position: 'absolute', left: pos.x, top: pos.y, cursor: isDragging ? 'grabbing' : 'grab' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {children}
    </div>
  );
};

export function FileGrid({ isAdmin = false, username }: FileGridProps) {
  const [layoutStyle, setLayoutStyle] = useState("grid");

  useEffect(() => {
    if (!isAdmin) return;
    
    import('../lib/api').then(m => {
      m.getUserSettings().then(res => {
        if(res.data?.layoutStyle) setLayoutStyle(res.data.layoutStyle);
      }).catch(e => console.error("Could not fetch layout", e));
    });
  }, [isAdmin]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState("newest");
  const limit = 12;

  const { data, isLoading, isError, error } = useFiles(username, page, limit, search, type, sort);

  const files = data?.data?.files || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="space-y-6">
      {/* Controls Bar - Hanya tampil jika bukan public view atau ada file */}
      {!username && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/[0.02] p-3 rounded-xl border border-white/[0.05]">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Cari file..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-black/50 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-white/30"
            />
          </div>
          
          <div className="flex w-full sm:w-auto gap-3">
            <CustomSelect
              value={type}
              onChange={(val) => { setType(val); setPage(1); }}
              options={[
                { value: '', label: 'Semua Tipe' },
                { value: 'image', label: 'Gambar' },
                { value: 'application/pdf', label: 'PDF' },
                { value: 'video', label: 'Video' }
              ]}
              icon={<SlidersHorizontal className="w-4 h-4" />}
              className="w-full sm:w-[160px]"
            />
            
            <CustomSelect
              value={sort}
              onChange={(val) => { setSort(val); setPage(1); }}
              options={[
                { value: 'newest', label: 'Terbaru' },
                { value: 'oldest', label: 'Terlama' },
                { value: 'name_asc', label: 'Nama (A-Z)' },
                { value: 'size_desc', label: 'Terbesar' }
              ]}
              className="w-full sm:w-[140px]"
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <FileGridSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white/[0.01] border border-white/5 rounded-xl">
          <p className="text-red-400 font-medium mb-2">Gagal memuat file</p>
          <p className="text-zinc-500 text-sm">{error?.message || "Silakan coba lagi nanti"}</p>
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
          <div className="w-16 h-16 bg-white/[0.03] border border-white/5 rounded-full flex items-center justify-center mb-5">
            <CloudOff className="w-7 h-7 text-zinc-500" />
          </div>
          <p className="text-zinc-300 font-medium text-lg">Belum ada file</p>
          <p className="text-zinc-500 text-sm mt-1.5 max-w-sm">
            {search ? "Pencarian tidak menemukan hasil apapun." : "File yang Anda unggah akan muncul di sini."}
          </p>
        </div>
      ) : (
        <>
          {layoutStyle === "canvas" ? (
            <div className="relative w-full h-[600px] bg-white/[0.01] border border-white/10 rounded-xl overflow-auto custom-scrollbar">
              {files.map((file: any) => (
                <DraggableFile 
                  key={file.id} 
                  file={file} 
                  onPositionChange={async (id: string, x: number, y: number) => {
                     try {
                        const { updateFilePosition } = await import('../lib/api');
                        await updateFilePosition(id, x, y);
                     } catch(e) { console.error(e); }
                  }}
                >
                  <div className="w-[200px]">
                     <FileCard file={file} isAdmin={isAdmin} />
                  </div>
                </DraggableFile>
              ))}
            </div>
          ) : (
            <div className={layoutStyle === 'list' ? "flex flex-col gap-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"}>
              {files.map((file: any) => (
                <div key={file.id} className={layoutStyle === 'list' ? "w-full max-w-4xl" : ""}>
                  <FileCard file={file} isAdmin={isAdmin} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && layoutStyle !== 'canvas' && (
            <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-white/[0.05]">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-zinc-400 font-medium">
                Halaman {page} dari {pagination.totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="p-2 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
