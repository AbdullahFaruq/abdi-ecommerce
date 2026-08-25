"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { ImageUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input, Toggle } from "@/components/ui/field";
import { EmptyState, Notice } from "@/components/ui/feedback";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

type Draft = { name: string; price: string; image: string; inStock: boolean };

const EMPTY_DRAFT: Draft = { name: "", price: "", image: "", inStock: true };

type FieldErrors = Partial<Record<keyof Draft, string>>;

export function ProductManager({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const [products, setProducts] = React.useState(initialProducts);
  const [draft, setDraft] = React.useState<Draft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState<Product | null>(null);
  const [deletePending, setDeletePending] = React.useState(false);
  const formRef = React.useRef<HTMLDivElement>(null);

  // Server data wins whenever the route re-renders (e.g. after router.refresh).
  React.useEffect(() => setProducts(initialProducts), [initialProducts]);

  function validate(): boolean {
    const errors: FieldErrors = {};
    const price = Number(draft.price);

    if (draft.name.trim().length < 2) errors.name = "Name needs at least 2 characters.";
    if (!draft.price.trim() || Number.isNaN(price) || price < 0) {
      errors.price = "Enter a price of 0 or more.";
    }
    if (!/^https?:\/\//i.test(draft.image.trim())) errors.image = "Add an image first.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function resetForm() {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    setFieldErrors({});
    setFormError(null);
  }

  async function save() {
    setFormError(null);
    setStatus(null);
    if (!validate()) return;

    setSaving(true);
    try {
      const response = await fetch(
        editingId ? `/api/products/${editingId}` : "/api/products",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: draft.name.trim(),
            price: Number(draft.price),
            image: draft.image.trim(),
            inStock: draft.inStock,
          }),
        }
      );

      const data = (await response.json()) as {
        product?: Product;
        error?: string;
        details?: Record<string, string[]>;
      };

      if (!response.ok || !data.product) {
        if (data.details) {
          setFieldErrors(
            Object.fromEntries(
              Object.entries(data.details).map(([key, messages]) => [key, messages[0]])
            ) as FieldErrors
          );
        }
        throw new Error(data.error ?? "The product wasn't saved.");
      }

      const saved = data.product;
      setProducts((current) =>
        editingId
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...current]
      );
      setStatus(editingId ? `Updated ${saved.name}.` : `Added ${saved.name}.`);
      resetForm();
      router.refresh();
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "The product wasn't saved.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeletePending(true);

    try {
      const response = await fetch(`/api/products/${deleting.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "The product wasn't removed.");
      }

      setProducts((current) => current.filter((item) => item.id !== deleting.id));
      setStatus(`Removed ${deleting.name}.`);
      if (editingId === deleting.id) resetForm();
      setDeleting(null);
      router.refresh();
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "The product wasn't removed.");
      setDeleting(null);
    } finally {
      setDeletePending(false);
    }
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setDraft({
      name: product.name,
      price: String(product.price),
      image: product.image,
      inStock: product.inStock,
    });
    setFieldErrors({});
    setFormError(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
      <div
        ref={formRef}
        className="grid gap-6 border border-hairline bg-chalk p-6 lg:sticky lg:top-24"
      >
        <div className="rule pt-5">
          <p className="tag text-verdigris">{editingId ? "Editing" : "New product"}</p>
          <h2 className="mt-3 font-display text-2xl font-bold uppercase tracking-[-0.02em]">
            {editingId ? "Update object" : "Add object"}
          </h2>
        </div>

        <Field label="Name" error={fieldErrors.name} htmlFor="product-name">
          <Input
            id="product-name"
            value={draft.name}
            maxLength={120}
            placeholder="Stoneware carafe, 1.2 L"
            onChange={(event) => setDraft((d) => ({ ...d, name: event.target.value }))}
          />
        </Field>

        <Field label="Price (USD)" error={fieldErrors.price} htmlFor="product-price">
          <Input
            id="product-price"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={draft.price}
            placeholder="0.00"
            onChange={(event) => setDraft((d) => ({ ...d, price: event.target.value }))}
          />
        </Field>

        <div className="grid gap-2">
          <ImageUploader
            value={draft.image}
            onChange={(url) => setDraft((d) => ({ ...d, image: url }))}
          />
          {fieldErrors.image && (
            <p role="alert" className="font-mono text-[11px] text-[#8c2f22]">
              {fieldErrors.image}
            </p>
          )}
        </div>

        <Field label="Stock" htmlFor="product-stock">
          <Toggle
            id="product-stock"
            checked={draft.inStock}
            labels={["In stock", "Sold out"]}
            onChange={(value) => setDraft((d) => ({ ...d, inStock: value }))}
          />
        </Field>

        {formError && <Notice tone="error">{formError}</Notice>}
        {status && <Notice tone="success">{status}</Notice>}

        <div className="flex flex-wrap gap-3">
          <Button onClick={save} pending={saving}>
            {editingId ? "Save changes" : "Add product"}
          </Button>
          {editingId && (
            <Button variant="ghost" onClick={resetForm} disabled={saving}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center gap-4">
          <span className="tag tabular-nums text-slate">
            {String(products.length).padStart(2, "0")} products
          </span>
          <span aria-hidden className="h-px flex-1 bg-hairline" />
        </div>

        {products.length === 0 ? (
          <EmptyState
            title="Nothing in the catalogue"
            body="Add your first object with the form. It appears on the storefront immediately."
          />
        ) : (
          <ul className="grid gap-px border border-hairline bg-hairline">
            {products.map((product) => (
              <li
                key={product.id}
                className={cn(
                  "flex flex-wrap items-center gap-4 bg-chalk p-4",
                  editingId === product.id && "outline outline-1 -outline-offset-1 outline-verdigris"
                )}
              >
                <div className="relative size-16 shrink-0 overflow-hidden border border-hairline bg-plaster">
                  <Image src={product.image} alt="" fill sizes="64px" className="object-cover" />
                </div>

                <div className="min-w-40 flex-1">
                  <p className="text-[15px] font-medium leading-snug">{product.name}</p>
                  <p className="mt-1.5 flex items-center gap-3">
                    <span className="font-mono text-sm tabular-nums">
                      {formatPrice(product.price)}
                    </span>
                    <span
                      className={cn("tag", product.inStock ? "text-verdigris" : "text-slate")}
                    >
                      {product.inStock ? "In stock" : "Sold out"}
                    </span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => startEdit(product)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleting(product)}>
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
        title="Delete this product?"
        body={
          deleting
            ? `${deleting.name} will be removed from the shop for everyone. This can't be undone.`
            : ""
        }
        confirmLabel="Delete product"
        pending={deletePending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
