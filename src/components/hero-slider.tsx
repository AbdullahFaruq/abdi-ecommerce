"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import type { Slide } from "@/types";

const INTERVAL_MS = 1500;

/**
 * Hero = images only, shown in full (`object-contain`, no cropping) so
 * nothing outside the frame is ever lost. Prev/next arrows sit directly on
 * the image; ticks and the counter live in a bar below the frame.
 */
export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const touchStartX = React.useRef<number | null>(null);
  const count = slides.length;

  const go = React.useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  );

  React.useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [count, paused]);

  // Don't burn cycles advancing a slider nobody is looking at.
  React.useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  if (count === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured images"
      className="rise"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className="relative aspect-[4/5] w-full overflow-hidden bg-graphite/5 sm:aspect-[3/2] lg:aspect-[21/9]"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          const start = touchStartX.current;
          if (start === null) return;
          const delta = event.changedTouches[0].clientX - start;
          if (Math.abs(delta) > 48) go(index + (delta < 0 ? 1 : -1));
          touchStartX.current = null;
        }}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            aria-hidden={i !== index}
            className={cn(
              "absolute inset-0 transition-opacity duration-[900ms] ease-[var(--ease-shelf)]",
              i === index ? "opacity-100" : "opacity-0"
            )}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-contain"
            />
          </div>
        ))}

        {count > 1 && (
          <>
            <SliderArrow label="Previous image" onClick={() => go(index - 1)} direction="left" />
            <SliderArrow label="Next image" onClick={() => go(index + 1)} direction="right" />
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mx-auto flex max-w-[1440px] items-center gap-5 px-5 py-4 sm:px-8 lg:px-12">
          <span className="tag tabular-nums text-slate">
            {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>

          <div className="flex flex-1 items-center gap-1.5">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show image ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
                className="group h-4 flex-1 min-w-4"
              >
                <span
                  className={cn(
                    "block h-px w-full transition-all duration-300",
                    i === index
                      ? "translate-y-2 bg-graphite shadow-[0_1px_0_0_currentColor]"
                      : "translate-y-2 bg-hairline group-hover:bg-slate"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function SliderArrow({
  label,
  onClick,
  direction,
}: {
  label: string;
  onClick: () => void;
  direction: "left" | "right";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "absolute top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center border border-white/40 bg-black/30 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-black/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:size-11",
        direction === "left" ? "left-3 sm:left-5" : "right-3 sm:right-5"
      )}
    >
      <svg viewBox="0 0 16 16" aria-hidden className="size-3.5 sm:size-4" fill="none" stroke="currentColor">
        <path
          d={direction === "left" ? "M10 2 4 8l6 6" : "M6 2l6 6-6 6"}
          strokeWidth="1.5"
          strokeLinecap="square"
        />
      </svg>
    </button>
  );
}
