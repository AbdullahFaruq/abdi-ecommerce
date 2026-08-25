import Link from "next/link";

import { WHATSAPP_NUMBER } from "@/lib/store-contact";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-hairline bg-chalk">
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <p className="font-display text-2xl font-extrabold uppercase leading-none tracking-[-0.02em]">
              Abdurahman Asad <span className="text-verdigris">Store</span>
            </p>
            <p className="mt-5 text-sm leading-relaxed text-slate">
              Shirts, dresses and everyday essentials, cut and sewn in short runs. When a style
              sells out, it stays out.
            </p>
          </div>

          <nav aria-label="Shop" className="grid content-start gap-4">
            <p className="tag text-slate">Shop</p>
            <Link href="/#products" className="text-sm text-graphite transition-colors hover:text-verdigris">
              All products
            </Link>
            <Link href="/#products" className="text-sm text-graphite transition-colors hover:text-verdigris">
              In stock now
            </Link>
          </nav>

          <div className="grid content-start gap-4">
            <p className="tag text-slate">Contact</p>
            <p className="text-sm leading-relaxed text-graphite">
              Pay by bank transfer or EVC Plus, then confirm your order on WhatsApp.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-graphite transition-colors hover:text-verdigris"
            >
              Message us on WhatsApp
            </a>
          </div>
        </div>

        <div className="rule mt-14 flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="tag text-slate">© {new Date().getFullYear()} Abdurahman Asad Store</p>
          <p className="tag text-slate">Made to be worn</p>
        </div>
      </div>
    </footer>
  );
}
