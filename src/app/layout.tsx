import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { IBM_Plex_Mono, IBM_Plex_Sans, Syne } from "next/font/google";

import { CartDrawer } from "@/components/cart-drawer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CartProvider } from "@/lib/cart-context";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Abdirahman Asad Store — clothing for everyday wear",
  description:
    "A small clothing store for shirts, dresses and everyday essentials, made in short runs and sold while they last.",
};

export const viewport: Viewport = {
  themeColor: "#e3e0d9",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#1e5b50",
          colorText: "#191a17",
          borderRadius: "2px",
        },
      }}
    >
      <html lang="en" className={`${syne.variable} ${plexSans.variable} ${plexMono.variable}`}>
        <body className="min-h-dvh antialiased">
          <a
            href="#main"
            className="tag sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-graphite focus:px-4 focus:py-3 focus:text-chalk"
          >
            Skip to content
          </a>
          <CartProvider>
            <div className="flex min-h-dvh flex-col">
              <SiteHeader />
              <main id="main" className="flex-1">
                {children}
              </main>
              <SiteFooter />
            </div>
            <CartDrawer />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
