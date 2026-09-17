import { Skeleton } from "@/components/ui/skeleton"

export function BriefsTableSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-3">
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-3.5">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-3 w-24 hidden sm:block" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
