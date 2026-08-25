import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Layer 1 of authorization: everything under /admin and every write to the
 * content APIs requires a session. The *role* check happens later, on the
 * server, in `requireAdmin()` — middleware only proves "someone is signed in",
 * which keeps it fast and keeps the authoritative check next to the database.
 */
const isAdminPage = createRouteMatcher(["/admin(.*)"]);
const isContentApi = createRouteMatcher([
  "/api/products(.*)",
  "/api/slides(.*)",
  "/api/upload(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const isRead = req.method === "GET" || req.method === "HEAD";

  if (isAdminPage(req)) {
    await auth.protect();
    return NextResponse.next();
  }

  if (isContentApi(req) && !isRead) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next internals and static files, run for everything else.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|png|gif|svg|webp|avif|ico|woff2?|ttf)).*)",
    "/(api|trpc)(.*)",
  ],
};
