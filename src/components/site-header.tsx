import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

import { CartButton } from "@/components/cart-button";
import { isAdmin } from "@/lib/auth";

/**
 * Server component: the admin link is only rendered for real admins, but that
 * is a convenience, not a control. /admin and every write API re-check the role
 * on the server.
 */
export async function SiteHeader() {
  const admin = await isAdmin();

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-plaster/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <Link href="/" className="group flex items-baseline gap-0.5 sm:gap-2">
          <span className="font-display text-[10px] font-extrabold uppercase leading-none tracking-[-0.02em] sm:text-lg">
            Abdurahman Asad
          </span>
          <span className="font-display text-[10px] font-extrabold uppercase leading-none tracking-[-0.02em] text-verdigris transition-colors duration-300 group-hover:text-graphite sm:text-lg">
            Store
          </span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-5 sm:gap-7">
          <Link href="/#products" className="tag text-slate transition-colors hover:text-graphite">
            Products
          </Link>

          {admin && (
            <Link href="/admin" className="tag text-verdigris transition-colors hover:text-graphite">
              Admin
            </Link>
          )}

          <CartButton />

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
      </div>
    </header>
  );
}
