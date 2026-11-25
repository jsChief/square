import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink, MapPin, MessageCircle, Phone, Store } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import {
  getSellerProducts,
  getSellerServices,
  getSellerStores,
  getStoreReviews,
  isListingLive,
} from "@/lib/seller/queries";
import { EmptyState, PageHeader, formatDate } from "@/components/dashboard/ui";

export const metadata: Metadata = {
  title: "Your stores — square",
  description: "The storefronts behind your listings.",
};

export const dynamic = "force-dynamic";

export default async function StoresPage() {
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
      />

      {stores.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Store}
            title="No store yet"
            message="Your store is created alongside your first listing. Once it exists, its details and stats appear here."
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
                  <span className="ml-auto text-muted">
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
