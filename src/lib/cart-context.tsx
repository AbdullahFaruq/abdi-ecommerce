"use client";

import * as React from "react";

import type { Product } from "@/types";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
};

export type CartStep = "cart" | "checkout";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  step: CartStep;
  addItem: (product: Product, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  open: (step?: CartStep) => void;
  close: () => void;
  goToCart: () => void;
  goToCheckout: () => void;
};

const CartContext = React.createContext<CartContextValue | null>(null);
const STORAGE_KEY = "atelier-nord:cart";

/** Client-only cart: this shop takes no online payment, so there is no
 * server-side order to sync against — a browser-local cart is all a manual,
 * WhatsApp-confirmed checkout needs. */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [step, setStep] = React.useState<CartStep>("cart");
  const hydrated = React.useRef(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // Corrupt or unavailable storage — start from an empty cart.
    }
    hydrated.current = true;
  }, []);

  React.useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage may be full or blocked (private browsing) — cart still works in-memory.
    }
  }, [items]);

  const addItem = React.useCallback((product: Product, qty = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [
        ...current,
        { id: product.id, name: product.name, price: product.price, image: product.image, qty },
      ];
    });
  }, []);

  const removeItem = React.useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const setQty = React.useCallback((id: string, qty: number) => {
    setItems((current) =>
      qty < 1
        ? current.filter((item) => item.id !== id)
        : current.map((item) => (item.id === id ? { ...item, qty } : item))
    );
  }, []);

  const clear = React.useCallback(() => setItems([]), []);
  const open = React.useCallback((next: CartStep = "cart") => {
    setStep(next);
    setIsOpen(true);
  }, []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const goToCart = React.useCallback(() => setStep("cart"), []);
  const goToCheckout = React.useCallback(() => setStep("checkout"), []);

  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);

  const value = React.useMemo<CartContextValue>(
    () => ({
      items,
      count,
      subtotal,
      isOpen,
      step,
      addItem,
      removeItem,
      setQty,
      clear,
      open,
      close,
      goToCart,
      goToCheckout,
    }),
    [items, count, subtotal, isOpen, step, addItem, removeItem, setQty, clear, open, close, goToCart, goToCheckout]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = React.useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
