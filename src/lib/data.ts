import "server-only";

import { unstable_cache } from "next/cache";

import { connectToDatabase } from "@/lib/db";
import { toProduct, toSlide } from "@/lib/serialize";
import { Product } from "@/models/product";
import { Slide } from "@/models/slide";
import type { Product as ProductDTO, Slide as SlideDTO } from "@/types";

/**
 * Caching strategy
 * ----------------
 * Storefront reads are cached per tag rather than per time. Any admin write
 * calls `revalidateTag(...)`, which drops the cache instantly — so a guest who
 * loads the page one second after an edit gets the new data, while normal
 * traffic still avoids hitting Mongo on every request. The time-based TTL is
 * only a safety net for out-of-band edits (e.g. someone editing Atlas directly).
 */
export const PRODUCTS_TAG = "products";
export const SLIDES_TAG = "slides";

export const getProducts = unstable_cache(
  async (): Promise<ProductDTO[]> => {
    await connectToDatabase();
    const docs = await Product.find({}).sort({ createdAt: -1 }).limit(60).lean();
    return docs.map(toProduct);
  },
  ["products:list"],
  { tags: [PRODUCTS_TAG], revalidate: 300 }
);

export const getSlides = unstable_cache(
  async (): Promise<SlideDTO[]> => {
    await connectToDatabase();
    const docs = await Slide.find({}).sort({ createdAt: 1 }).limit(12).lean();
    return docs.map(toSlide);
  },
  ["slides:list"],
  { tags: [SLIDES_TAG], revalidate: 300 }
);
