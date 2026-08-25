"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
};

export function Field({ label, hint, error, children, htmlFor }: FieldProps) {
  return (
    <div className="grid gap-2">
      <label htmlFor={htmlFor} className="tag text-slate">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="font-mono text-[11px] text-[#8c2f22]">
          {error}
        </p>
      ) : hint ? (
        <p className="font-mono text-[11px] text-slate">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          "h-12 w-full border border-hairline bg-chalk px-4 text-[15px] text-graphite",
          "placeholder:text-slate/70 focus:border-verdigris focus:outline-none",
          "transition-colors duration-200",
          className
        )}
      />
    );
  }
);

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  labels: [string, string];
  id?: string;
};

/** Two-state stock control. Reads as a segmented shelf tag, not a checkbox. */
export function Toggle({ checked, onChange, labels, id }: ToggleProps) {
  const [onLabel, offLabel] = labels;

  return (
    <div id={id} role="group" className="inline-flex border border-hairline bg-chalk p-1">
      {[true, false].map((value) => {
        const active = checked === value;
        return (
          <button
            key={String(value)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(value)}
            className={cn(
              "tag px-4 py-2.5 transition-colors duration-200",
              active ? "bg-graphite text-chalk" : "text-slate hover:text-graphite"
            )}
          >
            {value ? onLabel : offLabel}
          </button>
        );
      })}
    </div>
  );
}
