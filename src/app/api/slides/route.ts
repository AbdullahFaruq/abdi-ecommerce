import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { SLIDES_TAG, getSlides } from "@/lib/data";
import { connectToDatabase } from "@/lib/db";
import { toSlide } from "@/lib/serialize";
import { handleRouteError, slideInputSchema } from "@/lib/validators";
import { Slide } from "@/models/slide";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/slides — public. */
export async function GET() {
  try {
    return NextResponse.json({ slides: await getSlides() });
  } catch (error) {
    return handleRouteError(error);
  }
}

/** POST /api/slides — admin only. Stores the image and nothing else. */
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const { image } = slideInputSchema.parse(await request.json());

    await connectToDatabase();
    const created = await Slide.create({ image });

    revalidateTag(SLIDES_TAG);

    return NextResponse.json({ slide: toSlide(created.toObject()) }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
