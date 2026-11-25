import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, ShoppingBag, Star } from "lucide-react";
import { ListingGallery } from "@/components/listing-gallery";
import { ProfileAvatar } from "@/components/profile-avatar";
import { getPublicProfilesByIds } from "@/lib/profiles/queries";
import { PickupShare } from "@/components/pickup-share";
import { getListing } from "@/lib/data";
import { getSellerStores } from "@/lib/seller/queries";
import { createClient } from "@/lib/supabase/server";
import {
  categoryLabels,
  conditionLabels,
  formatPrice,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

interface ListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) notFound();

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  let isOwner = false;
  if (data.user && listing.storeId !== null) {
    const stores = await getSellerStores(data.user.id);
    isOwner = stores.some((store) => store.id === listing.storeId);
  }

  const sellerProfiles = await getPublicProfilesByIds([listing.sellerId]);
  const seller = listing.sellerId
    ? sellerProfiles.get(listing.sellerId)
    : undefined;
  const sellerAvatarUrl = seller?.avatar_url ?? listing.storeLogoUrl;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <Link
        href="/listings"
        className="inline-flex items-center gap-2 rounded-md py-2 text-sm text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to listings
      </Link>

      <div className="mt-7 grid gap-10 lg:grid-cols-2 lg:gap-12">
        <ListingGallery
          images={listing.images}
          title={listing.title}
          category={listing.category}
        />

        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {listing.title}
          </h1>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-accent tabular-nums">
            {formatPrice(listing.price)}
          </p>

          {!isOwner && (
            <div className="mt-6">
              <Link
                href={`/listings/${listing.id}/checkout`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent/90"
              >
                <ShoppingBag className="size-4" aria-hidden="true" />
                Buy now
              </Link>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-accent-soft px-3 py-1.5 font-medium text-accent">
              {conditionLabels[listing.condition]}
            </span>
            <span className="flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-muted">
              <MapPin className="size-3.5" aria-hidden="true" />
              {listing.location}
            </span>
            <span className="rounded-full border border-line px-3 py-1.5 text-muted">
              {categoryLabels[listing.category]}
            </span>
          </div>

          <section className="mt-9 border-t border-line pt-7">
            <h2 className="text-sm font-semibold">Description</h2>
            <p className="mt-3 max-w-prose whitespace-pre-line text-sm leading-6 text-muted">
              {listing.description}
            </p>
          </section>

          <section className="mt-8 rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted">
              Sold by
            </h2>
            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ProfileAvatar
                  userId={listing.sellerId}
                  src={sellerAvatarUrl}
                  name={listing.seller.name}
                  size="lg"
                />
                <div>
                  <p className="text-sm font-medium">{listing.seller.name}</p>
                  <p className="text-xs text-muted">{listing.seller.campus}</p>
                </div>
              </div>
              {listing.seller.rating !== null && (
                <span
                  className="flex shrink-0 items-center gap-1 text-sm font-medium tabular-nums"
                  aria-label={`Rated ${listing.seller.rating.toFixed(1)} out of 5`}
                >
                  <Star
                    className="size-4 fill-amber-400 text-amber-400"
                    aria-hidden="true"
                  />
                  {listing.seller.rating.toFixed(1)}
                </span>
              )}
            </div>
          </section>

          {!isOwner && <PickupShare location={listing.location} />}
        </div>
      </div>
    </div>
  );
}
