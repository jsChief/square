import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  GraduationCap,
  Package,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { ListingCard } from "@/components/listing-card";
import { getListings } from "@/lib/data";
import { getPublicProfileById } from "@/lib/profiles/queries";

export const metadata: Metadata = {
  title: "User profile — square",
  description: "See this square member's profile and current listings.",
};

export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const profile = await getPublicProfileById(id);
  if (!profile) notFound();

  const listings = (await getListings()).filter(
    (listing) => listing.sellerId === id,
  );
  const name = profile.username?.trim() || "square member";
  const university = profile.university?.trim();
  const accountType = profile.account_type
    ?.trim()
    .replace(/[_-]+/g, " ");
  const verified =
    profile.student_email_verified === true ||
    profile.verification_status?.trim().toLowerCase() === "verified";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <Link
        href="/listings"
        className="inline-flex items-center gap-2 rounded-md py-2 text-sm text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to listings
      </Link>

      <section className="mt-7 overflow-hidden rounded-3xl border border-line bg-surface">
        <div className="h-24 bg-gradient-to-br from-accent-soft via-surface to-background" />
        <div className="px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">
            <Avatar
              src={profile.avatar_url}
              name={name}
              size="xl"
              className="ring-4 ring-surface"
            />
            <div className="min-w-0 pb-1">
              <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                {name}
              </h1>
              <p className="mt-1 text-sm text-muted">square member</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {verified && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
                <BadgeCheck className="size-3.5" aria-hidden="true" />
                Verified
              </span>
            )}
            {university && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted">
                <GraduationCap className="size-3.5" aria-hidden="true" />
                {university}
              </span>
            )}
            {accountType && (
              <span className="rounded-full border border-line px-3 py-1.5 text-xs capitalize text-muted">
                {accountType}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted">
              <Package className="size-3.5" aria-hidden="true" />
              {listings.length} {listings.length === 1 ? "listing" : "listings"}
            </span>
          </div>
        </div>
      </section>

      <section aria-labelledby="profile-listings-heading" className="mt-9">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2
              id="profile-listings-heading"
              className="text-xl font-semibold tracking-tight"
            >
              Listings
            </h2>
            <p className="mt-1 text-sm text-muted">
              Items currently available from {name}.
            </p>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center">
            <p className="font-medium">No live listings yet</p>
            <p className="mt-1 text-sm text-muted">
              Check back later or browse what is available nearby.
            </p>
            <Link
              href="/listings"
              className="mt-5 inline-block rounded-full border border-line px-4 py-2 text-sm hover:border-accent hover:text-accent"
            >
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} compact />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
