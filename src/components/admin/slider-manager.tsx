"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { ImageUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, Notice } from "@/components/ui/feedback";
import type { Slide } from "@/types";

export function SliderManager({ initialSlides }: { initialSlides: Slide[] }) {
  const router = useRouter();
  const [slides, setSlides] = React.useState(initialSlides);
  const [image, setImage] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState<Slide | null>(null);
  const [deletePending, setDeletePending] = React.useState(false);

  React.useEffect(() => setSlides(initialSlides), [initialSlides]);

  async function addSlide() {
    setError(null);
    setStatus(null);

    if (!/^https?:\/\//i.test(image.trim())) {
      setError("Upload an image or paste an image URL first.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: image.trim() }),
      });

      const data = (await response.json()) as { slide?: Slide; error?: string };
      if (!response.ok || !data.slide) throw new Error(data.error ?? "The slide wasn't added.");

      setSlides((current) => [...current, data.slide as Slide]);
      setImage("");
      setStatus("Slide added. It's live on the storefront.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The slide wasn't added.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeletePending(true);

    try {
      const response = await fetch(`/api/slides/${deleting.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "The slide wasn't removed.");
      }

      setSlides((current) => current.filter((slide) => slide.id !== deleting.id));
      setStatus("Slide removed.");
      setDeleting(null);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The slide wasn't removed.");
      setDeleting(null);
    } finally {
      setDeletePending(false);
    }
  }

  return (
    <div className="grid gap-10">
      <div className="grid gap-6 border border-hairline bg-chalk p-6">
        <div className="rule pt-5">
          <p className="tag text-verdigris">Hero</p>
          <h2 className="mt-3 font-display text-2xl font-bold uppercase tracking-[-0.02em]">
            Add a slide
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate">
            Slides hold an image and nothing else. Wide, high-resolution photographs work best —
            the hero runs at 21:9 on desktop and 4:5 on phones.
          </p>
        </div>

        <ImageUploader value={image} onChange={setImage} label="Slide image" />

        {error && <Notice tone="error">{error}</Notice>}
        {status && <Notice tone="success">{status}</Notice>}

        <div>
          <Button onClick={addSlide} pending={saving}>
            Add slide
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center gap-4">
          <span className="tag tabular-nums text-slate">
            {String(slides.length).padStart(2, "0")} slides
          </span>
          <span aria-hidden className="h-px flex-1 bg-hairline" />
        </div>

        {slides.length === 0 ? (
          <EmptyState
            title="The hero is empty"
            body="Add an image above and it starts running at the top of the shop."
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {slides.map((slide, index) => (
              <li key={slide.id} className="border border-hairline bg-chalk">
                <div className="relative aspect-[16/9] bg-plaster">
                  <Image
                    src={slide.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-hairline p-3">
                  <span className="tag tabular-nums text-slate">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Button variant="danger" size="sm" onClick={() => setDeleting(slide)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this slide?"
        body="The image stops showing in the hero for every visitor. This can't be undone."
        confirmLabel="Delete slide"
        pending={deletePending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
