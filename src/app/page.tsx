import Link from "next/link";

import { HeroSlider } from "@/components/hero-slider";
import { ProductCarousel } from "@/components/product-carousel";
import { EmptyState } from "@/components/ui/feedback";
import { isAdmin } from "@/lib/auth";
import { getProducts, getSlides } from "@/lib/data";

export default async function HomePage() {
  // Both reads are tag-cached; any admin write invalidates the tag, so guests
  // see the change on their very next request.
  const [slides, products, admin] = await Promise.all([getSlides(), getProducts(), isAdmin()]);

  const inStockCount = products.filter((product) => product.inStock).length;

  return (
    <>
      {slides.length > 0 ? (
        <HeroSlider slides={slides} />
      ) : admin ? (
        <div className="mx-auto max-w-[1440px] px-5 pt-8 sm:px-8 lg:px-12">
          <EmptyState
            title="The hero is empty"
            body="Add your first slider image and it appears here for every visitor."
          />
          <Link
            href="/admin/slider"
            className="tag mt-4 inline-flex border border-graphite px-4 py-3 transition-colors hover:bg-graphite hover:text-chalk"
          >
            Manage slider
          </Link>
        </div>
      ) : null}

      <section id="products" className="mx-auto max-w-[1440px] px-5 pt-20 sm:px-8 lg:px-12 lg:pt-28">
        <div className="rule pt-6">
          <p className="tag text-verdigris">In the shop</p>
          <h2 className="mt-5 max-w-4xl break-words text-balance font-display text-[clamp(1.5rem,7vw,4.25rem)] font-extrabold uppercase leading-[1.05] tracking-[-0.02em] sm:leading-[0.92] sm:tracking-[-0.035em]">
            Tayo iyo adeeg hufnaan waa astaanteena
          </h2>
        </div>

        <div className="mt-10 lg:mt-14">
          {products.length > 0 ? (
            <>
              <div className="mb-6 flex items-center gap-4">
                <span className="tag tabular-nums text-slate">
                  {String(inStockCount).padStart(2, "0")} in stock
                </span>
                <span aria-hidden className="h-px flex-1 bg-hairline" />
              </div>
              <ProductCarousel products={products} />
            </>
          ) : (
            <EmptyState
              title="No products yet"
              body={
                admin
                  ? "Add a product in the admin dashboard and it shows up here straight away."
                  : "The next drop is still on the cutting table. Check back shortly."
              }
            />
          )}
        </div>
      </section>
    </>
  );
}
