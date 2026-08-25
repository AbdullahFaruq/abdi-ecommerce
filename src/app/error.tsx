"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto grid max-w-xl gap-6 px-5 py-32 text-center">
      <p className="tag text-slate">Error</p>
      <h1 className="font-display text-3xl font-extrabold uppercase tracking-[-0.03em]">
        The shop didn&apos;t load
      </h1>
      <p className="text-sm leading-relaxed text-slate">
        The catalogue couldn&apos;t be fetched. Reloading usually fixes it.
      </p>
      <div className="flex justify-center">
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
