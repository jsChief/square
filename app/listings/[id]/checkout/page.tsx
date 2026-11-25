import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getPublicProfilesByIds } from "@/lib/profiles/queries";
import { requireUser } from "@/lib/auth/session";
import { getListing } from "@/lib/data";
import {
  getPaystackConfigIssue,
  getPaystackPublicKey,
} from "@/lib/payments/paystack";

export const metadata: Metadata = {
  title: "Checkout — square",
  description: "Review your order and pay securely with Paystack.",
};

interface CheckoutPageProps {
  params: Promise<{ id: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { id } = await params;
  const user = await requireUser(`/listings/${id}/checkout`);
  const listing = await getListing(id);

  if (!listing || listing.sellerId === user.id) notFound();

  const sellerProfiles = await getPublicProfilesByIds([listing.sellerId]);
  const seller = listing.sellerId
    ? sellerProfiles.get(listing.sellerId)
    : undefined;
  const sellerAvatarUrl = seller?.avatar_url ?? listing.storeLogoUrl;
  const issue = getPaystackConfigIssue();

  return (
    <div className="mx-auto max-w-6xl px-4 py-0 sm:px-6 sm:py-12">
      <Link
        href={`/listings/${listing.id}`}
        className="inline-flex items-center gap-2 rounded-md py-0.5 text-xs text-muted transition-colors hover:text-accent sm:py-2 sm:text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to listing
      </Link>

      <div className="mt-1 flex flex-wrap items-end justify-between gap-4 sm:mt-7">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-4xl">
            Checkout
          </h1>
          <p className="mt-1.5 hidden max-w-xl text-sm leading-6 text-muted sm:mt-2 sm:block">
            Review the item, choose how you’ll receive it, then pay securely with
            Paystack or arrange payment with the seller.
          </p>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted sm:inline-flex">
          <Lock className="size-3.5 text-muted" aria-hidden="true" />
          Paystack checkout
        </span>
      </div>

      <div className="mt-1 sm:mt-8">
        <CheckoutForm
          listingId={listing.productId}
          title={listing.title}
          imageUrl={listing.images[0] ?? null}
          category={listing.category}
          condition={listing.condition}
          location={listing.location}
          price={listing.price}
          stock={listing.stock}
          sellerName={listing.seller.name}
          sellerId={listing.sellerId}
          sellerAvatarUrl={sellerAvatarUrl}
          storeName={listing.storeName}
          defaultEmail={user.email ?? ""}
          publicKey={getPaystackPublicKey()}
          paymentsEnabled={issue === null}
          paymentsIssue={issue}
          buyerId={user.id}
        />
      </div>
    </div>
  );
}
