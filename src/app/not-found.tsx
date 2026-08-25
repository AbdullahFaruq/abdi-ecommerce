import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-xl gap-6 px-5 py-32 text-center">
      <p className="tag text-slate">404</p>
      <h1 className="font-display text-3xl font-extrabold uppercase tracking-[-0.03em]">
        Nothing on this shelf
      </h1>
      <p className="text-sm leading-relaxed text-slate">
        The page you asked for isn&apos;t here.
      </p>
      <Link
        href="/"
        className="tag mx-auto border border-graphite px-5 py-3 transition-colors hover:bg-graphite hover:text-chalk"
      >
        Back to the shop
      </Link>
    </div>
  );
}
