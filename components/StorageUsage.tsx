import { formatFileSize } from "@/lib/utils";

export function StorageUsage({ used, limit }: { used: number; limit: number }) {
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const barColor = percent >= 90 ? "bg-red-500" : percent >= 75 ? "bg-amber-500" : "bg-white";

  return (
    <div className="mt-4 max-w-xs">
      <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
        <span>Kuota Stashly</span>
        <span>
          {formatFileSize(used)} / {formatFileSize(limit)}
        </span>
      </div>
      <div
        className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden"
        role="progressbar"
        aria-label="Penggunaan kuota"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
