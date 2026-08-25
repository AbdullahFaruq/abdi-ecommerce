import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { PRODUCTS_TAG, getProducts } from "@/lib/data";
import { connectToDatabase } from "@/lib/db";
import { toProduct } from "@/lib/serialize";
import { handleRouteError, productInputSchema } from "@/lib/validators";
import { Product } from "@/models/product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/products — public. */
export async function GET() {
  try {
    return NextResponse.json({ products: await getProducts() });
  } catch (error) {
    return handleRouteError(error);
  }
}

/** POST /api/products — admin only. */
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const payload = productInputSchema.parse(await request.json());

    await connectToDatabase();
    // Only the four allowed fields are ever written.
    const created = await Product.create({
      name: payload.name,
      price: payload.price,
      image: payload.image,
      inStock: payload.inStock,
    });

    revalidateTag(PRODUCTS_TAG);

    return NextResponse.json({ product: toProduct(created.toObject()) }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
