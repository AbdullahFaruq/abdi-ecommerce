import * as React from "react";

import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "ghost" | "danger";
type Size = "sm" | "md";

export const buttonBase =
  "inline-flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45";

export const buttonVariants: Record<Variant, string> = {
  solid: "bg-graphite text-chalk hover:bg-verdigris",
  outline: "border border-graphite text-graphite hover:bg-graphite hover:text-chalk",
  ghost: "text-slate hover:text-graphite",
  danger: "border border-[#8c2f22] text-[#8c2f22] hover:bg-[#8c2f22] hover:text-chalk",
};

export const buttonSizes: Record<Size, string> = {
  sm: "h-9 px-4",
  md: "h-12 px-6",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  pending?: boolean;
};

export function Button({
  variant = "solid",
  size = "md",
  pending = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={cn(buttonBase, buttonVariants[variant], buttonSizes[size], className)}
    >
      {pending && (
        <span
          aria-hidden
          className="size-3 animate-spin rounded-full border border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
