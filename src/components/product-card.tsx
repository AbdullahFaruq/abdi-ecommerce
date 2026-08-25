"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

/**
 * The card is a gallery object label: image above a hairline, then the name,
 * a mono row with price and stock state, then cart actions. Products only
 * carry name, price, image and stock — the cart line adds a quantity.
 */
export function ProductCard({ product, eager = false }: { product: Product; eager?: boolean }) {
  const { addItem, open } = useCart();

  return (
    <article className="group flex h-full flex-col border border-hairline bg-chalk transition-colors duration-300 hover:border-graphite">
      <div className="relative aspect-[4/5] overflow-hidden bg-plaster">
        <Image
          src={product.image}
          alt={product.name}
          fill
          loading={eager ? "eager" : "lazy"}
          sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 25vw"
          className={cn(
            "object-cover transition-transform duration-700 ease-[var(--ease-shelf)] group-hover:scale-[1.05]",
            !product.inStock && "opacity-70 saturate-[0.4]"
          )}
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 border-t border-hairline p-4 sm:p-5">
        <h3 className="text-[15px] font-medium leading-snug tracking-[-0.01em]">{product.name}</h3>

        <div className="mt-auto flex items-end justify-between gap-3">
          <span className="font-mono text-sm tabular-nums">{formatPrice(product.price)}</span>
          <StockTag inStock={product.inStock} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!product.inStock}
            onClick={() => addItem(product)}
          >
            Add to cart
          </Button>
          <Button
            size="sm"
            disabled={!product.inStock}
            onClick={() => {
              addItem(product);
              open("checkout");
            }}
          >
            Buy now
          </Button>
        </div>
      </div>
    </article>
  );
}

function StockTag({ inStock }: { inStock: boolean }) {
  return (
    <span className={cn("tag flex items-center gap-1.5", inStock ? "text-verdigris" : "text-slate")}>
      <span
        aria-hidden
        className={cn("size-1.5 rounded-full", inStock ? "bg-verdigris" : "bg-slate/60")}
      />
      {inStock ? "In stock" : "Sold out"}
    </span>
  );
}
