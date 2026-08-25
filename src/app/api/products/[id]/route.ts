import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { PRODUCTS_TAG } from "@/lib/data";
import { connectToDatabase } from "@/lib/db";
import { toProduct } from "@/lib/serialize";
import { handleRouteError, objectIdSchema, productUpdateSchema } from "@/lib/validators";
import { Product } from "@/models/product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

/** PATCH /api/products/:id — admin only. */
export async function PATCH(request: Request, { params }: Context) {
  try {
    await requireAdmin();

    const id = objectIdSchema.parse((await params).id);
    const updates = productUpdateSchema.parse(await request.json());

    await connectToDatabase();
    const updated = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return NextResponse.json({ error: "That product no longer exists." }, { status: 404 });
    }

    revalidateTag(PRODUCTS_TAG);

    return NextResponse.json({ product: toProduct(updated) });
  } catch (error) {
    return handleRouteError(error);
  }
}

/** DELETE /api/products/:id — admin only. */
export async function DELETE(_request: Request, { params }: Context) {
  try {
    await requireAdmin();

    const id = objectIdSchema.parse((await params).id);

    await connectToDatabase();
    const deleted = await Product.findByIdAndDelete(id).lean();

    if (!deleted) {
      return NextResponse.json({ error: "That product no longer exists." }, { status: 404 });
    }

    revalidateTag(PRODUCTS_TAG);

    return NextResponse.json({ id });
  } catch (error) {
    return handleRouteError(error);
  }
}
