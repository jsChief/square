import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Store,
} from "lucide-react";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { requireUser } from "@/lib/auth/session";
import {
  getSellerProducts,
  getSellerServices,
  getSellerStores,
  getStoreReviews,
  isListingLive,
} from "@/lib/seller/queries";
import {
  EmptyState,
  PageHeader,
  SavedNotice,
  formatDate,
} from "@/components/dashboard/ui";

export const metadata: Metadata = {
  title: "Your stores — square",
  description: "The storefronts behind your listings.",
};

export const dynamic = "force-dynamic";

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const user = await requireUser("/dashboard/stores");
  const stores = await getSellerStores(user.id);
  const storeIds = stores.map((store) => store.id);
  const [products, services, reviews] = await Promise.all([
    getSellerProducts(storeIds),
    getSellerServices(storeIds),
    getStoreReviews(storeIds),
  ]);

  return (
    <>
      <PageHeader
        title="Stores"
        description="The storefronts behind your listings and services."
        actions={
          <Link
            href="/dashboard/stores/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent/90"
          >
            <Plus className="size-4" aria-hidden="true" />
            New store
          </Link>
        }
      />

      <SavedNotice saved={saved} />

      {stores.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Store}
            title="No store yet"
            message="Create a storefront to hold your listings and services. Its details and stats will appear here."
            action={
              <Link
                href="/dashboard/stores/new"
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent/90"
              >
                Create a store
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {stores.map((store) => {
            const storeProducts = products.filter((p) => p.store_id === store.id);
            const live = storeProducts.filter(isListingLive).length;
            const storeServices = services.filter((s) => s.store_id === store.id);
            const storeReviews = reviews.filter((r) => r.store_id === store.id);
            const scored = storeReviews
              .map((r) => r.rating)
              .filter((r): r is number => typeof r === "number");
            const avg =
              scored.length > 0
                ? scored.reduce((sum, r) => sum + r, 0) / scored.length
                : null;
            const whatsapp = store.whatsapp_number?.replace(/[^\d]/g, "") ?? "";

            return (
              <div
                key={store.id}
                className="rounded-2xl border border-line bg-surface p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-line bg-background">
                    {store.logo_url ? (
                      <Image
                        src={store.logo_url}
                        alt={store.name ?? "Store logo"}
                        fill
                        unoptimized
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <Store
                        className="absolute inset-0 m-auto size-6 text-muted"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{store.name}</p>
                    {store.tag_line?.trim() && (
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {store.tag_line.trim()}
                      </p>
                    )}
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                      <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">
                        {store.location ?? "Near campus"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2 border-t border-line pt-4 text-center">
                  {[
                    { label: "Listings", value: String(storeProducts.length) },
                    { label: "Live", value: String(live) },
                    { label: "Services", value: String(storeServices.length) },
                    { label: "Rating", value: avg ? avg.toFixed(1) : "—" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-sm font-semibold tabular-nums">
                        {stat.value}
                      </p>
                      <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-xs">
                  {store.phone && (
                    <a
                      href={`tel:${store.phone}`}
                      className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-accent"
                    >
                      <Phone className="size-3.5" aria-hidden="true" />
                      {store.phone}
                    </a>
                  )}
                  {whatsapp && (
                    <a
                      href={`https://wa.me/${whatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-accent"
                    >
                      <MessageCircle className="size-3.5" aria-hidden="true" />
                      WhatsApp
                    </a>
                  )}
                  {store.link && (
                    <a
                      href={store.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-accent"
                    >
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                      Visit link
                    </a>
                  )}
                  <div className="ml-auto flex items-center gap-1.5">
                    <Link
                      href={`/dashboard/stores/${store.id}/edit`}
                      aria-label={`Edit ${store.name}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </Link>
                    <DeleteButton
                      kind="store"
                      id={store.id}
                      label={store.name ?? "store"}
                    />
                  </div>
                  <span className="text-muted">
                    Joined {formatDate(store.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
