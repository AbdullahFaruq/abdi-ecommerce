"use client";

import * as React from "react";
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

/** Collapses Products/Admin/Sign-in into a hamburger panel below `sm`, where
 * the full inline nav no longer fits next to the logo and cart icon. */
export function MobileNav({ admin }: { admin: boolean }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    // The panel is a mobile-only pattern — drop it if the viewport grows
    // past `sm` (e.g. a device rotation) so it can't linger over the desktop nav.
    const query = window.matchMedia("(min-width: 640px)");
    const onResize = () => {
      if (query.matches) setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    query.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      query.removeEventListener("change", onResize);
    };
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex size-9 items-center justify-center border border-hairline text-graphite transition-colors duration-200 hover:border-graphite"
      >
        <svg viewBox="0 0 16 16" aria-hidden className="size-3.5" fill="none" stroke="currentColor">
          {open ? (
            <path d="M2 2l12 12M14 2 2 14" strokeWidth="1.4" strokeLinecap="round" />
          ) : (
            <path d="M1.5 4h13M1.5 8h13M1.5 12h13" strokeWidth="1.4" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-x-0 bottom-0 top-16 z-30 bg-graphite/40 sm:hidden"
          />
          <nav
            aria-label="Main"
            className="fixed inset-x-0 top-16 z-40 grid gap-1 border-b border-hairline bg-plaster px-5 py-5 sm:hidden"
          >
            <Link
              href="/#products"
              onClick={() => setOpen(false)}
              className="tag border-b border-hairline py-3 text-slate transition-colors hover:text-graphite"
            >
              Products
            </Link>

            {admin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="tag border-b border-hairline py-3 text-verdigris transition-colors hover:text-graphite"
              >
                Admin
              </Link>
            )}

            <div className="pt-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    onClick={() => setOpen(false)}
                    className="tag flex h-12 w-full items-center justify-center border border-graphite transition-colors duration-200 hover:bg-graphite hover:text-chalk"
                  >
                    Sign in
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <div className="flex items-center gap-3">
                  <UserButton appearance={{ elements: { avatarBox: "h-8 w-8 rounded-none" } }} />
                  <span className="tag text-slate">Account</span>
                </div>
              </SignedIn>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
