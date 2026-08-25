import { Skeleton } from "@/components/ui/feedback";

export default function Loading() {
  return (
    <div>
      <Skeleton className="aspect-[4/5] w-full sm:aspect-[3/2] lg:aspect-[21/9]" />
      <div className="mx-auto max-w-[1440px] px-5 pt-20 sm:px-8 lg:px-12">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-6 h-20 w-full max-w-xl" />
        <div className="mt-12 flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-[70vw] shrink-0 sm:w-[40vw] lg:w-[24vw]">
              <Skeleton className="aspect-[4/5] w-full" />
              <Skeleton className="mt-4 h-4 w-3/4" />
              <Skeleton className="mt-3 h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
