import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-6xl place-items-center px-4 text-center sm:px-6">
      <div>
        <p className="text-sm font-semibold text-accent">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-2 text-sm text-muted">
          The link may be outdated, or the page may have moved. Try browsing
          listings instead.
        </p>
        <Link
          href="/listings"
          className="mt-6 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-contrast hover:bg-accent/90"
        >
          Browse all listings
        </Link>
      </div>
    </div>
  );
}
