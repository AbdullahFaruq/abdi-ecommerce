import Link from "next/link";
import { notFound } from "next/navigation";

import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Layer 2 of authorization. Middleware has already proved there's a session;
 * here the role is verified against Clerk before anything renders. A signed-in
 * non-admin gets a 404 rather than a "forbidden" page — no reason to confirm
 * that an admin area exists at this URL.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) notFound();

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8 lg:px-12">
      <header className="rule flex flex-col gap-6 pt-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="tag text-verdigris">Admin</p>
          <h1 className="mt-4 font-display text-4xl font-extrabold uppercase leading-none tracking-[-0.03em]">
            Back of house
          </h1>
        </div>
        <nav aria-label="Admin" className="flex gap-2">
          <AdminLink href="/admin">Overview</AdminLink>
          <AdminLink href="/admin/products">Products</AdminLink>
          <AdminLink href="/admin/slider">Slider</AdminLink>
        </nav>
      </header>

      <div className="mt-12">{children}</div>
    </div>
  );
}

function AdminLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="tag border border-hairline px-4 py-3 transition-colors hover:border-graphite hover:bg-graphite hover:text-chalk"
    >
      {children}
    </Link>
  );
}
