import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { SLIDES_TAG } from "@/lib/data";
import { connectToDatabase } from "@/lib/db";
import { handleRouteError, objectIdSchema } from "@/lib/validators";
import { Slide } from "@/models/slide";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

/** DELETE /api/slides/:id — admin only. */
export async function DELETE(_request: Request, { params }: Context) {
  try {
    await requireAdmin();

    const id = objectIdSchema.parse((await params).id);

    await connectToDatabase();
    const deleted = await Slide.findByIdAndDelete(id).lean();

    if (!deleted) {
      return NextResponse.json({ error: "That slide no longer exists." }, { status: 404 });
    }

    revalidateTag(SLIDES_TAG);

    return NextResponse.json({ id });
  } catch (error) {
    return handleRouteError(error);
  }
}
