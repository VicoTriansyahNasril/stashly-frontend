import { Skeleton } from "@/components/ui/skeleton";

export function FileGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.05] h-64 flex flex-col">
          <Skeleton className="h-36 w-full rounded-none bg-white/5" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4 bg-white/5" />
            <Skeleton className="h-3 w-1/2 bg-white/5" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 w-full rounded-md bg-white/5" />
              <Skeleton className="h-8 w-full rounded-md bg-white/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
