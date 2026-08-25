"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Native <dialog> gives focus trapping, Escape-to-close and inertness for
 * free — no dependency needed for a confirm step this small.
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onCancel();
      }}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] border border-graphite bg-chalk p-0 text-graphite backdrop:bg-graphite/60"
    >
      <div className="grid gap-5 p-7">
        <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
        <p className="text-sm leading-relaxed text-slate">{body}</p>
        <div className="flex flex-wrap justify-end gap-3 pt-1">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={pending}>
            Keep it
          </Button>
          <Button variant="danger" size="sm" pending={pending} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
