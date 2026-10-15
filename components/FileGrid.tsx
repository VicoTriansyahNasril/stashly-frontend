"use client";

import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, CloudOff, Search, SlidersHorizontal } from "lucide-react";
import { useFiles, usePublicFiles } from "@/hooks/useFiles";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useUserSettings } from "@/hooks/useUserSettings";
import { updateFilePosition } from "@/lib/api";
import type { FileSort, FileTypeFilter, LayoutStyle, Pagination, StashlyFile } from "@/types/file";
import { FileCard } from "./FileCard";
import { PublicFileCard } from "./PublicFileCard";
import { FileGridSkeleton } from "./FileGridSkeleton";
import { CustomSelect } from "./CustomSelect";

const PAGE_SIZE = 12;

function DraggableFile({ file, children }: { file: StashlyFile; children: ReactNode }) {
  const [pos, setPos] = useState({ x: file.posX || 0, y: file.posY || 0 });
  const [isDragging, setIsDragging] = useState(false);
  const start = useRef({ x: 0, y: 0, originX: 0, originY: 0 });

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button, input, a")) return;
    setIsDragging(true);
    start.current = { x: e.clientX, y: e.clientY, originX: pos.x, originY: pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPos({
      x: Math.max(0, start.current.originX + e.clientX - start.current.x),
      y: Math.max(0, start.current.originY + e.clientY - start.current.y),
    });
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    const { originX, originY } = start.current;
    if (pos.x === originX && pos.y === originY) return;
    updateFilePosition(file.id, pos.x, pos.y).catch(() => setPos({ x: originX, y: originY }));
  };

  return (
    <div
      style={{ position: "absolute", left: pos.x, top: pos.y, cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {children}
    </div>
  );
}

function PaginationControls({
  pagination,
  page,
  onChange,
}: {
  pagination: Pagination | undefined;
  page: number;
  onChange: (page: number) => void;
}) {
  if (!pagination || pagination.totalPages <= 1) return null;
  return (
    <nav className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-white/[0.05]" aria-label="Navigasi halaman">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="p-2 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-transparent"
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="text-sm text-zinc-400 font-medium">
        Halaman {page} dari {pagination.totalPages}
      </span>
      <button
        onClick={() => onChange(Math.min(pagination.totalPages, page + 1))}
        disabled={page >= pagination.totalPages}
        className="p-2 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-transparent"
        aria-label="Halaman berikutnya"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </nav>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center py-20 text-center bg-white/[0.01] border border-white/5 rounded-xl">
      <p className="text-red-400 font-medium mb-2">Gagal memuat file</p>
      <p className="text-zinc-500 text-sm">{message}</p>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
      <div className="w-16 h-16 bg-white/[0.03] border border-white/5 rounded-full flex items-center justify-center mb-5">
        <CloudOff className="w-7 h-7 text-zinc-500" />
      </div>
      <p className="text-zinc-300 font-medium text-lg">{title}</p>
      <p className="text-zinc-500 text-sm mt-1.5 max-w-sm">{description}</p>
    </div>
  );
}

const gridClass = (layout: LayoutStyle) =>
  layout === "list" ? "flex flex-col gap-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6";

/** Daftar file milik pengguna (dashboard). */
export function OwnerFileGrid() {
  const { data: settings } = useUserSettings();
  const layout: LayoutStyle = settings?.layoutStyle ?? "grid";
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [type, setType] = useState<FileTypeFilter>("");
  const [sort, setSort] = useState<FileSort>("newest");
  const search = useDebouncedValue(searchInput.trim(), 300);

  const { data, isLoading, isError, error, isFetching } = useFiles({ page, limit: PAGE_SIZE, search, type, sort });
  const files = data?.files ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/[0.02] p-3 rounded-xl border border-white/[0.05]">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" aria-hidden="true" />
          <input
            type="search"
            placeholder="Cari file..."
            aria-label="Cari file"
            value={searchInput}
            maxLength={100}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            className="w-full bg-black/50 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-white/30"
          />
        </div>

        <div className="flex w-full sm:w-auto gap-3">
          <CustomSelect
            value={type}
            onChange={(val) => {
              setType(val as FileTypeFilter);
              setPage(1);
            }}
            options={[
              { value: "", label: "Semua Tipe" },
              { value: "image", label: "Gambar" },
              { value: "pdf", label: "PDF" },
              { value: "video", label: "Video" },
            ]}
            icon={<SlidersHorizontal className="w-4 h-4" />}
            className="w-full sm:w-[160px]"
          />
          <CustomSelect
            value={sort}
            onChange={(val) => {
              setSort(val as FileSort);
              setPage(1);
            }}
            options={[
              { value: "newest", label: "Terbaru" },
              { value: "oldest", label: "Terlama" },
              { value: "name_asc", label: "Nama (A-Z)" },
              { value: "name_desc", label: "Nama (Z-A)" },
              { value: "size_desc", label: "Terbesar" },
            ]}
            className="w-full sm:w-[140px]"
          />
        </div>
      </div>

      {isLoading ? (
        <FileGridSkeleton />
      ) : isError ? (
        <ErrorState message={error.message} />
      ) : files.length === 0 ? (
        <EmptyState
          title={search || type ? "Tidak ada hasil" : "Belum ada file"}
          description={search || type ? "Coba kata kunci atau filter lain." : "File yang Anda unggah akan muncul di sini."}
        />
      ) : (
        <div className={isFetching ? "opacity-70 transition-opacity" : "transition-opacity"} aria-busy={isFetching}>
          {layout === "canvas" ? (
            <div className="relative w-full h-[600px] bg-white/[0.01] border border-white/10 rounded-xl overflow-auto custom-scrollbar">
              {files.map((file) => (
                <DraggableFile key={file.id} file={file}>
                  <div className="w-[200px]">
                    <FileCard file={file} />
                  </div>
                </DraggableFile>
              ))}
            </div>
          ) : (
            <div className={gridClass(layout)}>
              {files.map((file) => (
                <div key={file.id} className={layout === "list" ? "w-full max-w-4xl" : ""}>
                  <FileCard file={file} />
                </div>
              ))}
            </div>
          )}
          <PaginationControls pagination={data?.pagination} page={page} onChange={setPage} />
        </div>
      )}
    </div>
  );
}

/** Daftar file publik milik seorang pengguna (halaman /username). */
export function PublicFileGrid({ username }: { username: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = usePublicFiles(username, page, PAGE_SIZE);
  const files = data?.files ?? [];

  if (isLoading) return <FileGridSkeleton />;
  if (isError) return <ErrorState message={error.message} />;
  if (files.length === 0) {
    return <EmptyState title="Belum ada file publik" description="Pengguna ini belum membagikan file apa pun." />;
  }

  return (
    <div>
      <div className={gridClass("grid")}>
        {files.map((file) => (
          <PublicFileCard key={file.id} file={file} />
        ))}
      </div>
      <PaginationControls pagination={data?.pagination} page={page} onChange={setPage} />
    </div>
  );
}
