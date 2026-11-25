import Image from "next/image";
import type { StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import beautyImg from "@/assets/categories/beauty.jpg";
import clothingImg from "@/assets/categories/clothing.jpg";
import electronicsImg from "@/assets/categories/electronics.jpg";
import foodImg from "@/assets/categories/food.jpg";
import furnitureImg from "@/assets/categories/furniture.jpg";
import otherImg from "@/assets/categories/other.jpg";
import textbooksImg from "@/assets/categories/textbooks.jpg";
import ticketsImg from "@/assets/categories/tickets.jpg";
import { HeroBackdrop } from "@/components/hero-backdrop";
import { ListingCard } from "@/components/listing-card";
import { SearchBar } from "@/components/search-bar";
import { categoryMeta } from "@/lib/categories";
import { getListings } from "@/lib/data";
import { categoryLabels } from "@/lib/utils";
import type { Category } from "@/types";

export const dynamic = "force-dynamic";

const categoryImages: Record<Category, StaticImageData> = {
  textbooks: textbooksImg,
  electronics: electronicsImg,
  furniture: furnitureImg,
  clothing: clothingImg,
  tickets: ticketsImg,
  beauty: beautyImg,
  food: foodImg,
  other: otherImg,
};

export default async function HomePage() {
  const featured = (await getListings()).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line bg-surface">
        <HeroBackdrop />
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Made for easy local finds
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              Everything a student needs,{" "}
              <span className="text-accent">without the hassle.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-base text-muted sm:text-lg">
              Find textbooks, tech, furniture, and more from people nearby.
              Search, pick your deal, and arrange an easy local pickup.
            </p>
            <div className="mx-auto mt-8 max-w-lg">
              <SearchBar />
            </div>
            <div className="mt-5 flex items-center justify-center gap-3 text-sm">
              <Link
                href="/listings"
                className="rounded-full bg-accent px-5 py-2.5 font-medium text-accent-contrast transition-colors hover:bg-accent/90"
              >
                Browse all listings
              </Link>
              <Link
                href="/sell"
                className="inline-flex items-center gap-1 rounded-full border border-line px-5 py-2.5 font-medium transition-colors hover:border-accent hover:text-accent"
              >
                Sell something <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Explore by category
            </h2>
            <p className="mt-1 text-sm text-muted">
              Whatever you need, someone nearby probably has it.
            </p>
          </div>
          <Link
            href="/listings"
            className="hidden shrink-0 text-sm font-medium text-accent hover:underline sm:block"
          >
            Browse all listings
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {(Object.keys(categoryLabels) as Category[]).map((category) => {
            const { icon: Icon } = categoryMeta[category];
            return (
              <Link
                key={category}
                href={`/listings?category=${category}`}
                className="group relative flex aspect-[4/3] items-end overflow-hidden rounded-2xl border border-line bg-surface transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md active:scale-[0.98]"
              >
                <Image
                  src={categoryImages[category]}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                />
                <span className="relative z-10 flex w-full items-center justify-between gap-2 p-3">
                  <span className="text-sm font-medium text-white">
                    {categoryLabels[category]}
                  </span>
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/15 text-white backdrop-blur-sm">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured listings */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Fresh on square
            </h2>
            <p className="mt-1 text-sm text-muted">
              Recently listed by people near you.
            </p>
          </div>
          <Link
            href="/listings"
            className="shrink-0 text-sm font-medium text-accent hover:underline"
          >
            Browse all listings
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-2xl border border-dashed border-line bg-surface px-6 py-10 text-center text-sm text-muted">
            No approved listings yet. Check back soon.
          </p>
        )}
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Three steps, zero fuss
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Search what you need",
                text: "Browse by category or search the exact item. Someone nearby probably has it.",
              },
              {
                step: "02",
                title: "Pick your local deal",
                text: "Compare condition and price, then choose the listing that fits your budget.",
              },
              {
                step: "03",
                title: "Arrange the pickup",
                text: "Meet nearby, pay, and walk away with it. No shipping, no waiting around.",
              },
            ].map((item) => (
              <div key={item.step}>
                <p className="text-sm font-semibold text-accent">{item.step}</p>
                <h3 className="mt-2 font-medium">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
