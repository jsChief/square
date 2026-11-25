import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { SearchBar } from "@/components/search-bar";
import { getListings } from "@/lib/data";
import { categoryLabels, cn, conditionLabels } from "@/lib/utils";
import type { Category } from "@/types";

interface ListingsPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export const dynamic = "force-dynamic";

const primaryCategories: Category[] = ["textbooks", "electronics"];

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const { q = "", category = "" } = await searchParams;
  const listings = await getListings();
  const query = q.trim().toLowerCase();
  const activeCategory = Object.prototype.hasOwnProperty.call(
    categoryLabels,
    category,
  )
    ? (category as Category)
    : null;

  const moreCategories = (Object.keys(categoryLabels) as Category[]).filter(
    (key) => !primaryCategories.includes(key),
  );
  const activeInMore = activeCategory
    ? moreCategories.includes(activeCategory)
    : false;

  const results = listings.filter((listing) => {
    const matchesCategory = !activeCategory || listing.category === activeCategory;
    const matchesQuery =
      !query ||
      [
        listing.title,
        listing.description,
        listing.location,
        listing.seller.name,
        listing.seller.campus,
        categoryLabels[listing.category],
        conditionLabels[listing.condition],
      ].some((value) => value.toLowerCase().includes(query));
    return matchesCategory && matchesQuery;
  });

  function categoryHref(next: Category | null) {
    const params = new URLSearchParams();
    if (query) params.set("q", q);
    if (next) params.set("category", next);
    const search = params.toString();
    return search ? `/listings?${search}` : "/listings";
  }

  function pillClass(active: boolean) {
    return cn(
      "inline-flex items-center rounded-full border px-4 py-2 text-sm transition-colors",
      active
        ? "border-accent bg-accent text-accent-contrast"
        : "border-line bg-surface text-muted hover:border-accent hover:text-accent",
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Browse listings
          </h1>
          <p className="mt-2 text-sm text-muted">
            {activeCategory
              ? `Showing ${categoryLabels[activeCategory].toLowerCase()}`
              : "Showing local listings"}
            {query ? ` for “${q}”` : ""}.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <SearchBar defaultValue={q} />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Link href={categoryHref(null)} className={pillClass(!activeCategory)}>
          All
        </Link>
        {primaryCategories.map((key) => (
          <Link
            key={key}
            href={categoryHref(key)}
            className={pillClass(activeCategory === key)}
          >
            {categoryLabels[key]}
          </Link>
        ))}
        <details className="relative">
          <summary
            className={cn(
              pillClass(activeInMore),
              "cursor-pointer list-none [&::-webkit-details-marker]:hidden",
            )}
          >
            More
            <ChevronDown className="ml-1 size-3.5" aria-hidden="true" />
          </summary>
          <div className="absolute left-0 top-12 z-10 w-44 rounded-xl border border-line bg-surface p-2 shadow-lg">
            {moreCategories.map((key) => (
              <Link
                key={key}
                href={categoryHref(key)}
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-background",
                  activeCategory === key ? "font-medium text-accent" : "text-muted",
                )}
              >
                {categoryLabels[key]}
              </Link>
            ))}
          </div>
        </details>
        <p className="ml-auto self-center text-sm text-muted">
          {results.length} {results.length === 1 ? "item" : "items"}
        </p>
      </div>

      {results.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {results.map((listing) => (
            <ListingCard key={listing.id} listing={listing} compact />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center">
          <p className="font-medium">No listings found</p>
          <p className="mt-1 text-sm text-muted">
            Try a different search term or category.
          </p>
          <Link
            href="/listings"
            className="mt-5 inline-block rounded-full border border-line px-4 py-2 text-sm hover:border-accent hover:text-accent"
          >
            Clear filters
          </Link>
        </div>
      )}
    </div>
  );
}
