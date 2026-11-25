import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Package, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { mapCategory } from "@/lib/data";
import {
  firstImage,
  getSellerProducts,
  getSellerStores,
  productPrice,
  type ProductRow,
} from "@/lib/seller/queries";
import {
  EmptyState,
  FilterPills,
  ListingStatusBadge,
  PageHeader,
  formatDate,
} from "@/components/dashboard/ui";
import { categoryLabels, formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Your listings — square",
  description: "Manage every listing across your stores.",
};

export const dynamic = "force-dynamic";

type View = "all" | "live" | "review" | "soldout" | "rejected" | "blocked";

function matches(product: ProductRow, view: View): boolean {
  const approved = product.status === "approved" && !product.is_blocked;
  switch (view) {
    case "live":
      return approved && (product.stock ?? 0) > 0;
    case "review":
      return !product.is_blocked && product.status !== "approved" && product.status !== "rejected";
    case "soldout":
      return approved && (product.stock ?? 0) <= 0;
    case "rejected":
      return !product.is_blocked && product.status === "rejected";
    case "blocked":
      return product.is_blocked;
    default:
      return true;
  }
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view: viewParam } = await searchParams;
  const user = await requireUser("/dashboard/listings");
  const stores = await getSellerStores(user.id);
  const products = await getSellerProducts(stores.map((store) => store.id));

  const views: View[] = ["all", "live", "review", "soldout", "rejected", "blocked"];
  const active: View = views.includes(viewParam as View)
    ? (viewParam as View)
    : "all";
  const visible = products.filter((product) => matches(product, active));

  return (
    <>
      <PageHeader
        title="Listings"
        description="Everything you've listed, live or in review."
        actions={
          <Link
            href="/sell"
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent/90"
          >
            <Plus className="size-4" aria-hidden="true" />
            New listing
          </Link>
        }
      />

      {stores.length === 0 || products.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Package}
            title="No listings yet"
            message="Publish your first item and it will show up here with its review status."
            action={
              <Link
                href="/sell"
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent/90"
              >
                List something
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-6">
            <FilterPills
              basePath="/dashboard/listings"
              active={active}
              items={[
                { key: "all", label: "All", count: products.length },
                { key: "live", label: "Live", count: products.filter((p) => matches(p, "live")).length },
                { key: "review", label: "In review", count: products.filter((p) => matches(p, "review")).length },
                { key: "soldout", label: "Sold out", count: products.filter((p) => matches(p, "soldout")).length },
                { key: "rejected", label: "Rejected", count: products.filter((p) => matches(p, "rejected")).length },
                { key: "blocked", label: "Blocked", count: products.filter((p) => matches(p, "blocked")).length },
              ]}
            />
          </div>

          {visible.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center text-sm text-muted">
              Nothing in this view.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {visible.map((product) => {
                const image = firstImage(product.image_urls);
                const live = product.status === "approved" && !product.is_blocked;
                const stock = product.stock ?? 0;
                const reason = product.is_blocked
                  ? (product.blocked_reason ?? "Blocked by moderators.")
                  : product.status === "rejected"
                    ? (product.rejection_reason ?? "Rejected in review.")
                    : null;
                return (
                  <div
                    key={product.id}
                    className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-4"
                  >
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-line bg-background">
                      {image ? (
                        <Image
                          src={image}
                          alt={product.name ?? "Listing"}
                          fill
                          unoptimized
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <Package
                          className="absolute inset-0 m-auto size-6 text-muted"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {live ? (
                          <Link
                            href={`/listings/${product.id}`}
                            className="truncate text-sm font-medium hover:text-accent"
                          >
                            {product.name?.trim() || "Untitled listing"}
                          </Link>
                        ) : (
                          <span className="truncate text-sm font-medium">
                            {product.name?.trim() || "Untitled listing"}
                          </span>
                        )}
                        <ListingStatusBadge product={product} />
                        {live && stock > 0 && stock <= 3 && (
                          <span className="rounded-full border border-danger/30 bg-danger/5 px-2 py-0.5 text-[11px] font-medium text-danger">
                            Low stock
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {categoryLabels[mapCategory(product.category)]} ·{" "}
                        {stock} in stock · listed {formatDate(product.created_at)}
                      </p>
                      {reason && (
                        <p className="mt-1 text-xs text-danger">{reason}</p>
                      )}
                    </div>

                    <p className="ml-auto text-sm font-semibold tabular-nums">
                      {formatPrice(productPrice(product.price))}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );
}
