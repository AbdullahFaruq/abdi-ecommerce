# Abdirahman Asad Store

A production-shaped e-commerce storefront: Next.js 15 (App Router) + TypeScript, Clerk auth with an admin role, MongoDB via Mongoose, and Cloudinary for uploaded images.

The shop sells shirts, dresses and everyday essentials in short runs. Design direction: gallery plaster (`#E3E0D9`) and graphite ink with a single verdigris accent, Syne for display type, IBM Plex Sans for body and IBM Plex Mono for anything that behaves like data — prices, stock states, slide indices. Every product card is a museum object label.

---

## Run it

```bash
npm install
cp .env.example .env.local     # then fill in the values below
npm run seed                   # optional demo products + slides
npm run dev                    # http://localhost:3000
```

### Environment variables

| Variable | Where it comes from |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Clerk dashboard → API keys |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `..._SIGN_UP_URL` | `/sign-in`, `/sign-up` |
| `MONGODB_URI` | Atlas connection string (or `mongodb://127.0.0.1:27017/atelier-nord`) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary dashboard → API Keys |

### Make yourself an admin

Clerk dashboard → **Users** → your user → **Metadata** → **Public metadata**:

```json
{ "role": "admin" }
```

Sign out and back in. `/admin` now resolves; for everyone else it 404s.

---

## Folder structure

```
atelier-nord/
├── next.config.ts             # image host allow-list, security headers
├── postcss.config.mjs         # Tailwind v4
├── scripts/seed.ts
└── src/
    ├── middleware.ts          # Clerk middleware: session gate on /admin + write APIs
    ├── app/
    │   ├── layout.tsx         # ClerkProvider, fonts, header/footer shell
    │   ├── globals.css        # design tokens, base styles, motion
    │   ├── page.tsx           # storefront: hero slider + product carousel
    │   ├── loading.tsx  error.tsx  not-found.tsx
    │   ├── sign-in/[[...sign-in]]/page.tsx
    │   ├── sign-up/[[...sign-up]]/page.tsx
    │   ├── admin/
    │   │   ├── layout.tsx     # role check → notFound() for non-admins
    │   │   ├── page.tsx       # counts + entry points
    │   │   ├── products/page.tsx
    │   │   └── slider/page.tsx
    │   └── api/
    │       ├── products/route.ts        # GET public · POST admin
    │       ├── products/[id]/route.ts   # PATCH · DELETE admin
    │       ├── slides/route.ts          # GET public · POST admin
    │       ├── slides/[id]/route.ts     # DELETE admin
    │       └── upload/route.ts          # POST admin → Cloudinary
    ├── components/
    │   ├── site-header.tsx  site-footer.tsx
    │   ├── hero-slider.tsx  product-carousel.tsx  product-card.tsx
    │   ├── ui/          button · field · confirm-dialog · feedback
    │   └── admin/       product-manager · slider-manager · image-uploader
    ├── lib/
    │   ├── db.ts        # cached Mongoose connection
    │   ├── auth.ts      # getCurrentUser · isAdmin · requireAdmin
    │   ├── data.ts      # tag-cached reads (getProducts, getSlides)
    │   ├── validators.ts# zod schemas + handleRouteError
    │   ├── serialize.ts utils.ts
    ├── models/          product.ts · slide.ts
    └── types/index.ts
```

---

## Architectural decisions

**Authorization is server-side, in two layers.** `middleware.ts` proves a session exists for `/admin` and for every non-GET call to the content APIs. The authoritative check — `requireAdmin()` — reads `publicMetadata.role` from Clerk's backend API inside each route handler and inside the admin layout. `publicMetadata` can only be written with the secret key, so a signed-in user can't promote themselves, and calling `POST /api/products` directly with a valid non-admin session returns `403` even though the UI never showed the button. Hiding the admin link in the header is cosmetic only.

**Reads are tag-cached, writes invalidate.** `getProducts()` / `getSlides()` are wrapped in `unstable_cache` with the tags `products` and `slides`. Every mutating handler calls `revalidateTag(...)` after the write, so a guest loading the page one second after an admin edit gets fresh data, while ordinary traffic doesn't hit Mongo on every request. The 300-second TTL is only a safety net for edits made outside the app.

**Schemas are exactly the requested fields.** `Product` = `{ name, price, image, inStock }`, `Slide` = `{ image }`, both with Mongoose `strict: true`, so extra keys in a request body are dropped rather than stored. Writes are built field-by-field from a parsed zod object, never by spreading the raw body. *Assumption:* Mongo's `_id` and `timestamps` are kept — the id is required to address a record and `createdAt` gives the storefront a stable order. Neither is content.

**Uploads go through the server.** The browser never sees `CLOUDINARY_API_SECRET`. `/api/upload` requires admin, rejects anything that isn't JPEG/PNG/WebP/AVIF, caps files at 5 MB, sanitises the filename and uses a unique public ID so an upload can't overwrite an existing object. Pasting a URL is also supported, and `next.config.ts` allow-lists the hosts `next/image` will serve.

**Route handlers rather than server actions** for CRUD: the admin screens are interactive lists that need optimistic state and error details per field, and an explicit HTTP surface makes the "authorization lives on the server" property easy to demonstrate (curl it yourself). After each write the client also calls `router.refresh()` so server-rendered lists re-sync.

---

## Verification

| Requirement | Where |
| --- | --- |
| Hero is a slider of images with no text overlay | `hero-slider.tsx` — the frame contains only `<Image>`; index, ticks and arrows sit in a bar *below* it |
| Smooth, responsive slider transitions | 900 ms crossfade + slow scale, 4:5 → 3:2 → 21:9 by breakpoint, swipe on touch, pauses on hover/focus/hidden tab, honours `prefers-reduced-motion` |
| Carousel advances every 1.5 s | `product-carousel.tsx`, `AUTOPLAY_MS = 1500`; loops seamlessly by cloning the head of the list and rewinding with the transition off |
| Cards show image, name, price, stock | `product-card.tsx` |
| Admin CRUD with validation, loading, empty, error, confirm | `product-manager.tsx`, `slider-manager.tsx`, `confirm-dialog.tsx` |
| Admin can't be bypassed from the client | `requireAdmin()` in all five write handlers + `/admin` layout; middleware as the outer gate |
| Guests see current data | tag-based invalidation on every write (`revalidateTag`) |
| Responsive + accessible | fluid type, 1 → 4.2 cards per view, visible focus ring, labelled controls, native `<dialog>` focus trap |

Quick bypass test with a signed-in **non-admin** session cookie:

```bash
curl -i -X POST http://localhost:3000/api/products \
  -H 'Content-Type: application/json' \
  -b 'clerk-session-cookie-here' \
  -d '{"name":"Hack","price":1,"image":"https://example.com/a.jpg","inStock":true}'
# → HTTP/1.1 403  {"error":"Admin access required."}
```

Run `npm run typecheck` and `npm run lint` before deploying.

## Deploying

Vercel: import the repo, add the environment variables, and create a Cloudinary account/cloud for the project. Add your production domain in Clerk. MongoDB Atlas: allow Vercel's egress or use `0.0.0.0/0` with a strong credential.
