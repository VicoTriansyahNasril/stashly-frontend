"use client";

import { useFiles } from "../hooks/useFiles";
import { FileCard } from "./FileCard";
import { Skeleton } from "./ui/skeleton";

export function FileGrid() {
  const { data, isLoading, isError, error } = useFiles();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-red-500 font-medium mb-2">Failed to load files</p>
        <p className="text-muted-foreground text-sm">{error?.message || "Please try again later"}</p>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl">
        <p className="text-muted-foreground">No files uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {data.data.map((file) => (
        <FileCard key={file.id} file={file} />
      ))}
    </div>
  );
}
