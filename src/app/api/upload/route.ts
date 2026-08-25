import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * POST /api/upload — admin only.
 *
 * Uploads go through the server rather than straight from the browser, so the
 * Cloudinary API secret never reaches the client and every file is checked
 * for type and size before it is stored. `unique_filename`/`overwrite: false`
 * prevents an admin from overwriting an existing object by re-using a name.
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Images must be JPEG, PNG, WebP or AVIF." },
        { status: 415 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Images must be 5 MB or smaller." }, { status: 413 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80);
    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "atelier-nord",
          public_id: safeName,
          unique_filename: true,
          overwrite: false,
          resource_type: "image",
        },
        (error, uploadResult) => {
          if (error || !uploadResult) {
            reject(error ?? new Error("Cloudinary upload failed."));
            return;
          }
          resolve(uploadResult);
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({ url: result.secure_url }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
