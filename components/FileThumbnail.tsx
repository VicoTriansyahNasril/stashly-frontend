"use client";

import { useState } from "react";
import { FileIcon, FileTextIcon, ImageIcon, Lock, PackageIcon, VideoIcon } from "lucide-react";
import { getFileIcon } from "@/lib/utils";

const ICONS = {
  image: ImageIcon,
  video: VideoIcon,
  pdf: FileTextIcon,
  apk: PackageIcon,
  file: FileIcon,
} as const;

interface FileThumbnailProps {
  fileType: string;
  fileName: string;
  /** URL thumbnail; null jika tidak boleh/tidak bisa ditampilkan. */
  src: string | null;
  locked?: boolean;
  className?: string;
}

export function FileThumbnail({ fileType, fileName, src, locked = false, className = "" }: FileThumbnailProps) {
  const [failed, setFailed] = useState(false);
  const kind = getFileIcon(fileType);
  const Icon = locked ? Lock : ICONS[kind];
  const canShowImage = !!src && !failed && !locked && kind !== "apk" && kind !== "file";

  if (canShowImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- konten dinamis dari API, bukan aset statis
      <img
        src={src}
        alt={fileName}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`}>
      <Icon className="h-8 w-8 text-zinc-400 group-hover:text-zinc-200 transition-colors" aria-hidden="true" />
    </div>
  );
}
