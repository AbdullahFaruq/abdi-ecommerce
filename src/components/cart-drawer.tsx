"use client";

import * as React from "react";
import Image from "next/image";

import { Button, buttonBase, buttonSizes, buttonVariants } from "@/components/ui/button";
import { useCart, type CartItem } from "@/lib/cart-context";
import { BANK_TRANSFER, EVC_PLUS, WHATSAPP_NUMBER } from "@/lib/store-contact";
import { cn, formatPrice } from "@/lib/utils";

function buildWhatsAppMessage(items: CartItem[], subtotal: number): string {
  const lines = items.map(
    (item) => `• ${item.name} × ${item.qty} — ${formatPrice(item.price * item.qty)}`
  );

  return [
    "Hi! I'd like to confirm this order from Abdirahman Asad Store:",
    "",
    ...lines,
    "",
    `Total: ${formatPrice(subtotal)}`,
    "I've sent the payment — here's proof.",
  ].join("\n");
}

/** Native <dialog> pinned to the right edge: focus trap, Escape-to-close and
 * an inert background all come for free, same as ConfirmDialog. */
export function CartDrawer() {
  const cart = useCart();
  const { isOpen, step, items, count, subtotal, close } = cart;
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    buildWhatsAppMessage(items, subtotal)
  )}`;

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === ref.current) close();
      }}
      className="fixed inset-y-0 left-auto right-0 top-0 m-0 hidden h-dvh max-h-none w-full max-w-md flex-col border-l border-graphite bg-chalk p-0 text-graphite open:flex backdrop:bg-graphite/60"
    >
      <div className="flex items-center justify-between gap-4 border-b border-hairline px-6 py-5">
        <h2 className="font-display text-lg font-bold tracking-tight">
          {step === "cart" ? `Cart${count > 0 ? ` (${count})` : ""}` : "Checkout"}
        </h2>
        <button
          type="button"
          aria-label="Close cart"
          onClick={close}
          className="flex size-8 items-center justify-center text-slate transition-colors hover:text-graphite"
        >
          <svg viewBox="0 0 16 16" aria-hidden className="size-3.5" fill="none" stroke="currentColor">
            <path d="M2 2l12 12M14 2 2 14" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {step === "cart" ? <CartStepView /> : <CheckoutStepView whatsappHref={whatsappHref} />}
    </dialog>
  );
}

function CartStepView() {
  const { items, subtotal, removeItem, setQty, close, goToCheckout } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm leading-relaxed text-slate">Your cart is empty.</p>
        <Button variant="outline" size="sm" onClick={close}>
          Continue shopping
        </Button>
      </div>
    );
  }

  return (
    <>
      <ul className="flex-1 overflow-y-auto divide-y divide-hairline px-6">
        {items.map((item) => (
          <li key={item.id} className="flex gap-4 py-5">
            <div className="relative size-16 shrink-0 overflow-hidden border border-hairline bg-plaster">
              <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
            </div>

            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium leading-snug">{item.name}</p>
                <button
                  type="button"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => removeItem(item.id)}
                  className="tag shrink-0 text-slate transition-colors hover:text-[#8c2f22]"
                >
                  Remove
                </button>
              </div>

              <div className="mt-auto flex items-center justify-between gap-3">
                <div className="flex items-center border border-hairline">
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${item.name}`}
                    onClick={() => setQty(item.id, item.qty - 1)}
                    className="flex size-7 items-center justify-center text-graphite transition-colors hover:bg-graphite hover:text-chalk"
                  >
                    −
                  </button>
                  <span className="w-7 text-center font-mono text-xs tabular-nums">{item.qty}</span>
                  <button
                    type="button"
                    aria-label={`Increase quantity of ${item.name}`}
                    onClick={() => setQty(item.id, item.qty + 1)}
                    className="flex size-7 items-center justify-center text-graphite transition-colors hover:bg-graphite hover:text-chalk"
                  >
                    +
                  </button>
                </div>
                <span className="font-mono text-sm tabular-nums">
                  {formatPrice(item.price * item.qty)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="grid gap-4 border-t border-hairline px-6 py-5">
        <div className="flex items-center justify-between">
          <span className="tag text-slate">Subtotal</span>
          <span className="font-mono text-base tabular-nums">{formatPrice(subtotal)}</span>
        </div>
        <Button onClick={goToCheckout}>Checkout</Button>
        <Button variant="ghost" size="sm" onClick={close}>
          Continue shopping
        </Button>
      </div>
    </>
  );
}

function CheckoutStepView({ whatsappHref }: { whatsappHref: string }) {
  const { items, subtotal, goToCart } = useCart();

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <ul className="grid gap-2 border-b border-hairline pb-5">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate">
              {item.name} <span className="font-mono text-xs">× {item.qty}</span>
            </span>
            <span className="font-mono tabular-nums">{formatPrice(item.price * item.qty)}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between py-5">
        <span className="tag text-slate">Total</span>
        <span className="font-mono text-lg tabular-nums">{formatPrice(subtotal)}</span>
      </div>

      <div className="grid gap-4">
        <p className="text-sm leading-relaxed text-slate">
          Send the total above to one of the accounts below, then confirm your order on WhatsApp
          — include a screenshot of the payment.
        </p>

        <PaymentCard title="Bank transfer">
          <PaymentRow label="Bank" value={BANK_TRANSFER.bankName} />
          <PaymentRow label="Account name" value={BANK_TRANSFER.accountName} />
          <PaymentRow label="Account number" value={BANK_TRANSFER.accountNumber} mono />
        </PaymentCard>

        <PaymentCard title="EVC Plus">
          <PaymentRow label="Account name" value={EVC_PLUS.accountName} />
          <PaymentRow label="Number" value={EVC_PLUS.number} mono />
        </PaymentCard>
      </div>

      <div className="mt-6 grid gap-3">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonBase, buttonVariants.solid, buttonSizes.md, "w-full")}
        >
          Confirm order on WhatsApp
        </a>
        <Button variant="ghost" size="sm" onClick={goToCart}>
          Back to cart
        </Button>
      </div>
    </div>
  );
}

function PaymentCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-hairline p-4">
      <p className="tag text-verdigris">{title}</p>
      <div className="mt-3 grid gap-1.5">{children}</div>
    </div>
  );
}

function PaymentRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-slate">{label}</span>
      <span className={mono ? "font-mono tabular-nums" : ""}>{value}</span>
    </div>
  );
}
