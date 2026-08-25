import { cn } from "@/lib/utils";

export function Notice({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "tag border px-4 py-3 leading-[1.5]",
        tone === "error"
          ? "border-[#8c2f22]/40 bg-[#8c2f22]/8 text-[#8c2f22]"
          : "border-verdigris/30 bg-verdigris-soft text-verdigris"
      )}
    >
      {children}
    </p>
  );
}

export function EmptyState({
  title,
  body,
  className,
}: {
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border border-dashed border-hairline bg-chalk/60 px-6 py-14 text-center",
        className
      )}
    >
      <p className="font-display text-lg font-bold tracking-tight">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate">{body}</p>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-hairline/60", className)} />;
}
