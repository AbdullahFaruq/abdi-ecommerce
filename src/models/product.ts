import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

/**
 * Products store ONLY: name, price, image, stock status.
 * `strict: true` (default) means any extra key sent by a client is dropped,
 * so the shape can't be widened from the outside.
 */
const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    price: { type: Number, required: true, min: 0, max: 10_000_000 },
    image: { type: String, required: true, trim: true },
    inStock: { type: Boolean, required: true, default: true },
  },
  { timestamps: true, versionKey: false, strict: true }
);

// Newest first on the storefront.
ProductSchema.index({ createdAt: -1 });

export type ProductDocument = InferSchemaType<typeof ProductSchema>;

export const Product: Model<ProductDocument> =
  (models.Product as Model<ProductDocument>) ?? model<ProductDocument>("Product", ProductSchema);
