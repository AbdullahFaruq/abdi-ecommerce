import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

import { CartButton } from "@/components/cart-button";
import { MobileNav } from "@/components/mobile-nav";
import { isAdmin } from "@/lib/auth";

/**
 * Server component: the admin link is only rendered for real admins, but that
 * is a convenience, not a control. /admin and every write API re-check the role
 * on the server.
 *
 * Below `sm` there isn't room for the full inline nav next to the logo, so
 * Products/Admin/Sign-in collapse into a hamburger (MobileNav); the cart icon
 * stays visible at every width since it's the one action people reach for
 * mid-browse.
 */
export async function SiteHeader() {
  const admin = await isAdmin();

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-plaster/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-5 sm:gap-6 sm:px-8 lg:px-12">
        {/* Below `sm` the name stacks onto two lines (Abdirahman / Asad Store)
            so the whole wordmark stays visible instead of shrinking to fit
            one line; from `sm` up it's a single inline row like before. */}
        <Link href="/" className="group grid min-w-0 leading-none sm:flex sm:items-baseline sm:gap-2">
          <span className="font-display text-sm font-extrabold uppercase tracking-[-0.02em] sm:text-lg">
            Abdirahman
          </span>
          <span className="font-display text-sm font-extrabold uppercase tracking-[-0.02em] sm:text-lg">
            Asad{" "}
            <span className="text-verdigris transition-colors duration-300 group-hover:text-graphite">
              Store
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-3 sm:gap-7">
          <nav aria-label="Main" className="hidden items-center gap-5 sm:flex sm:gap-7">
            <Link href="/#products" className="tag text-slate transition-colors hover:text-graphite">
              Products
            </Link>

            {admin && (
              <Link href="/admin" className="tag text-verdigris transition-colors hover:text-graphite">
                Admin
              </Link>
            )}

            <SignedOut>
              <SignInButton mode="modal">
                <button className="tag border border-graphite px-4 py-2.5 transition-colors duration-200 hover:bg-graphite hover:text-chalk">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton
                appearance={{ elements: { avatarBox: "h-8 w-8 rounded-none" } }}
              />
            </SignedIn>
          </nav>

          <CartButton />
          <MobileNav admin={admin} />
        </div>
      </div>
    </header>
  );
}
