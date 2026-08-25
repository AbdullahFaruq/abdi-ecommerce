import Link from "next/link";

import { getProducts, getSlides } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [products, slides] = await Promise.all([getProducts(), getSlides()]);
  const soldOut = products.filter((product) => !product.inStock).length;

  const stats = [
    { label: "Products", value: products.length },
    { label: "Sold out", value: soldOut },
    { label: "Slider images", value: slides.length },
  ];

  return (
    <div className="grid gap-10">
      <dl className="grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-chalk px-6 py-8">
            <dt className="tag text-slate">{stat.label}</dt>
            <dd className="mt-4 font-mono text-4xl tabular-nums">
              {String(stat.value).padStart(2, "0")}
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card
          href="/admin/products"
          title="Products"
          body="Add, edit and remove products. Each one carries a name, price, image and stock state."
        />
        <Card
          href="/admin/slider"
          title="Hero slider"
          body="Upload the images that run across the top of the shop. Images only, no captions."
        />
      </div>
    </div>
  );
}

function Card({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link
      href={href}
      className="group border border-hairline bg-chalk p-7 transition-colors hover:border-graphite"
    >
      <p className="font-display text-xl font-bold uppercase tracking-[-0.02em] group-hover:text-verdigris">
        {title}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-slate">{body}</p>
    </Link>
  );
}
