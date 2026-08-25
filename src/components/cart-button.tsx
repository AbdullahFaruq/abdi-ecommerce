"use client";

import { useCart } from "@/lib/cart-context";

export function CartButton() {
  const { count, open } = useCart();

  return (
    <button
      type="button"
      onClick={() => open("cart")}
      aria-label={count > 0 ? `Open cart, ${count} item${count === 1 ? "" : "s"}` : "Open cart"}
      className="relative flex size-9 items-center justify-center border border-hairline text-graphite transition-colors duration-200 hover:border-graphite hover:bg-graphite hover:text-chalk"
    >
      <svg viewBox="0 0 20 20" aria-hidden className="size-4" fill="none" stroke="currentColor">
        <path
          d="M2.5 5h2l1.6 9.2a1.5 1.5 0 0 0 1.48 1.24h6.4a1.5 1.5 0 0 0 1.48-1.24L17 7H5.4"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="8.5" cy="17.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="14.5" cy="17.5" r="1" fill="currentColor" stroke="none" />
      </svg>

      {count > 0 && (
        <span
          aria-hidden
          className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-verdigris px-1 font-mono text-[10px] leading-none text-chalk"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
