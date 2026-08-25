"use client";

import * as React from "react";
import Image from "next/image";

import { Input } from "@/components/ui/field";
import { Notice } from "@/components/ui/feedback";

type ImageUploaderProps = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
};

/**
 * Two ways in: upload a file (server-side, admin-only, so the storage token
 * stays on the server) or paste a URL from a host that's already allow-listed
 * in next.config.ts.
 */
export function ImageUploader({ value, onChange, label = "Image" }: ImageUploaderProps) {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputId = React.useId();

  async function upload(file: File) {
    setError(null);
    setUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/upload", { method: "POST", body });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "The upload didn't finish.");
      }

      onChange(data.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The upload didn't finish.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-3">
      <span className="tag text-slate">{label}</span>

      <div className="flex flex-wrap items-start gap-4">
        <div className="relative size-28 shrink-0 overflow-hidden border border-hairline bg-plaster">
          {value ? (
            <Image src={value} alt="" fill sizes="112px" className="object-cover" />
          ) : (
            <span className="tag absolute inset-0 flex items-center justify-center text-slate">
              None
            </span>
          )}
        </div>

        <div className="grid min-w-56 flex-1 gap-3">
          <label
            htmlFor={inputId}
            className="tag inline-flex h-12 cursor-pointer items-center justify-center border border-graphite px-5 transition-colors hover:bg-graphite hover:text-chalk"
          >
            {uploading ? "Uploading…" : "Upload image"}
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.target.value = "";
            }}
          />

          <Input
            type="url"
            inputMode="url"
            placeholder="…or paste an image URL"
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      </div>

      {error && <Notice tone="error">{error}</Notice>}
    </div>
  );
}
