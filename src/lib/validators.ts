import { NextResponse } from "next/server";
import { z } from "zod";

import { AuthorizationError } from "@/lib/auth";

/** Blocks javascript:/data: URLs and other non-http(s) schemes. */
const imageUrl = z
  .string()
  .trim()
  .min(1, "An image is required.")
  .max(2048)
  .url("Enter a valid image URL.")
  .refine((value) => /^https?:\/\//i.test(value), "Image URLs must start with http:// or https://");

export const productInputSchema = z.object({
  name: z.string().trim().min(2, "Name needs at least 2 characters.").max(120),
  price: z.coerce
    .number({ invalid_type_error: "Price must be a number." })
    .min(0, "Price can't be negative.")
    .max(10_000_000)
    .finite(),
  image: imageUrl,
  inStock: z.coerce.boolean(),
});

export const productUpdateSchema = productInputSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "Nothing to update."
);

export const slideInputSchema = z.object({ image: imageUrl });

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "That record id isn't valid.");

export type ProductInput = z.infer<typeof productInputSchema>;
export type SlideInput = z.infer<typeof slideInputSchema>;

/**
 * Single place where thrown errors become responses, so handlers stay small
 * and internal messages/stack traces never leak to the client.
 */
export function handleRouteError(error: unknown) {
  if (error instanceof AuthorizationError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Check the highlighted fields.", details: error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  console.error("[api]", error);
  return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
}
