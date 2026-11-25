import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { categoryMeta } from "@/lib/categories";
import { categoryLabels, cn, conditionLabels, formatPrice } from "@/lib/utils";
import type { Listing } from "@/types";

interface ListingCardProps {
  listing: Listing;
  /** Dense layout for narrow grid columns (listings page). */
  compact?: boolean;
}

export function ListingCard({ listing, compact = false }: ListingCardProps) {
  const meta = categoryMeta[listing.category];
  const Icon = meta.icon;
  const image = listing.images[0];

  return (
    <Link
      href={`/listings/${listing.id}`}
      className={cn(
        "group flex flex-col overflow-hidden border border-line bg-surface",
        "transition-[transform,border-color,box-shadow] duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md active:scale-[0.98]",
        compact ? "rounded-xl" : "rounded-2xl",
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-center bg-gradient-to-br",
          meta.gradient,
          compact ? "aspect-square" : "aspect-[4/3]",
        )}
      >
        {image ? (
          <Image
            src={image}
            alt={listing.title}
            fill
            unoptimized
            sizes={
              compact
                ? "(max-width: 1023px) 50vw, 25vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            className="object-cover"
          />
        ) : (
          <Icon
            className={cn(meta.tint, compact ? "size-10" : "size-14")}
            strokeWidth={1.25}
            aria-hidden="true"
          />
        )}
        <span
          className={cn(
            "absolute rounded-full bg-surface/90 font-medium text-foreground",
            compact
              ? "left-2 top-2 px-2 py-0.5 text-[10px]"
              : "left-3 top-3 px-2.5 py-1 text-[11px]",
          )}
        >
          {conditionLabels[listing.condition]}
        </span>
        {!image && (
          <span
            className={cn(
              "absolute rounded-full bg-surface/90 font-medium text-muted",
              compact
                ? "bottom-1.5 right-1.5 px-1.5 py-0.5 text-[10px]"
                : "bottom-2 right-2 px-2 py-0.5 text-[11px]",
            )}
          >
            Photo soon
          </span>
        )}
      </div>

      {compact ? (
        <div className="flex flex-1 flex-col p-2.5 sm:p-3.5">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-accent">
            {listing.title}
          </h3>
          <p className="mt-1.5 text-base font-semibold sm:text-lg">
            {formatPrice(listing.price)}
          </p>
          <div className="mt-auto flex items-center justify-between gap-1 pt-1.5 text-[11px] text-muted sm:text-xs">
            <span className="flex min-w-0 items-center gap-1">
              <MapPin className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{listing.location}</span>
            </span>
            {listing.seller.rating !== null && (
              <span className="flex shrink-0 items-center gap-1">
                <Star
                  className="size-3 fill-amber-400 text-amber-400"
                  aria-hidden="true"
                />
                {listing.seller.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {categoryLabels[listing.category]}
          </p>
          <h3 className="mt-1 line-clamp-1 font-medium group-hover:text-accent">
            {listing.title}
          </h3>
          <p className="mt-2 text-lg font-semibold">{formatPrice(listing.price)}</p>

          <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3 text-xs text-muted">
            <span className="flex min-w-0 items-center gap-1">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{listing.location}</span>
            </span>
            {listing.seller.rating !== null && (
              <span className="flex shrink-0 items-center gap-1">
                <Star
                  className="size-3.5 fill-amber-400 text-amber-400"
                  aria-hidden="true"
                />
                {listing.seller.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      )}
    </Link>
  );
}
