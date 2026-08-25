import type { ProductDocument } from "@/models/product";
import type { SlideDocument } from "@/models/slide";
import type { Product, Slide } from "@/types";

type WithId<T> = T & { _id: unknown };

/** Mongo documents contain ObjectIds/Dates that React can't serialise. */
export function toProduct(doc: WithId<ProductDocument>): Product {
  return {
    id: String(doc._id),
    name: doc.name,
    price: doc.price,
    image: doc.image,
    inStock: doc.inStock,
  };
}

export function toSlide(doc: WithId<SlideDocument>): Slide {
  return { id: String(doc._id), image: doc.image };
}
