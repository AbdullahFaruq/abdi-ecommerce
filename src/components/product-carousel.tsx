"use client";

import * as React from "react";

import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

/** Requirement: the product carousel advances every 1.5 seconds. */
const AUTOPLAY_MS = 1500;

/** Fractional values leave the next card half-visible, so the row reads as continuous. */
function perViewFor(width: number): number {
  if (width < 640) return 1.25;
  if (width < 900) return 2.2;
  if (width < 1280) return 3.2;
  return 4.2;
}

/** Below `sm` there's no room to peek at a second card, and a sliding
 * autoplay just fights with page scroll on touch — products render as a
 * plain static column instead. The sliding carousel is `sm:` and up only. */
export function ProductCarousel({ products }: { products: Product[] }) {
  const count = products.length;
  const [perView, setPerView] = React.useState(4.2);
  const [index, setIndex] = React.useState(0);
  const [animate, setAnimate] = React.useState(true);
  const [paused, setPaused] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [isMobileColumn, setIsMobileColumn] = React.useState(false);
  const trackRef = React.useRef<HTMLUListElement>(null);

  React.useEffect(() => {
    const onResize = () => setPerView(perViewFor(window.innerWidth));
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Matches Tailwind's `sm` breakpoint (640px) so the JS carousel state
  // agrees with which markup is actually visible.
  React.useEffect(() => {
    const query = window.matchMedia("(max-width: 639.98px)");
    const sync = () => setIsMobileColumn(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  React.useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const canLoop = !isMobileColumn && count > Math.ceil(perView);

  // The clock. One step every 1.5s, stopped on hover, focus, hidden tab, the
  // mobile column layout, or when the row already fits on screen.
  React.useEffect(() => {
    if (!canLoop || paused || reducedMotion) return;
    const id = window.setInterval(() => setIndex((i) => i + 1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [canLoop, paused, reducedMotion]);

  // Re-enable the transition on the frame after a silent rewind.
  React.useEffect(() => {
    if (animate) return;
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  React.useEffect(() => {
    if (!canLoop) setIndex(0);
  }, [canLoop]);

  if (count === 0) return null;

  // Enough clones to fill the viewport while the tail scrolls past.
  const items = canLoop ? [...products, ...products.slice(0, Math.ceil(perView))] : products;
  const step = 100 / perView;

  const move = (delta: number) => {
    setIndex((i) => {
      const next = i + delta;
      if (next < 0) return count - 1;
      return next;
    });
  };

  return (
    <>
      {/* Below `sm`: every product, stacked, no motion. Rendered unconditionally
          (not gated on `isMobileColumn`) so there's no hydration flash — CSS
          alone decides which layout is visible at any given width. */}
      <div className="grid grid-cols-1 gap-6 sm:hidden">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} eager={i < 2} />
        ))}
      </div>

      <div
        aria-roledescription="carousel"
        aria-label="Products"
        className="relative hidden sm:block"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div className="overflow-hidden">
          <ul
            ref={trackRef}
            className="flex will-change-transform"
            style={{
              transform: `translate3d(-${index * step}%, 0, 0)`,
              transition: animate ? "transform 650ms var(--ease-shelf)" : "none",
            }}
            onTransitionEnd={(event) => {
              if (event.target !== trackRef.current || event.propertyName !== "transform") return;
              if (index >= count) {
                setAnimate(false);
                setIndex(0);
              }
            }}
          >
            {items.map((product, i) => (
              <li
                key={`${product.id}-${i}`}
                aria-hidden={i >= count || undefined}
                className="shrink-0 grow-0 pr-3 sm:pr-4"
                style={{ flexBasis: `${step}%` }}
              >
                <ProductCard product={product} eager={i < 4} />
              </li>
            ))}
          </ul>
        </div>

        {canLoop && (
          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="tag text-slate">
              {paused ? "Paused" : "Auto-advancing"} · {count} products
            </p>
            <div className="flex gap-2">
              <CarouselArrow label="Previous product" direction="left" onClick={() => move(-1)} />
              <CarouselArrow label="Next product" direction="right" onClick={() => move(1)} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function CarouselArrow({
  label,
  direction,
  onClick,
}: {
  label: string;
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex size-9 items-center justify-center border border-hairline text-graphite",
        "transition-colors duration-200 hover:border-graphite hover:bg-graphite hover:text-chalk"
      )}
    >
      <svg viewBox="0 0 16 16" aria-hidden className="size-3.5" fill="none" stroke="currentColor">
        <path
          d={direction === "left" ? "M10 2 4 8l6 6" : "M6 2l6 6-6 6"}
          strokeWidth="1.5"
          strokeLinecap="square"
        />
      </svg>
    </button>
  );
}
