import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  Banknote,
  Clock,
  Package,
  Plus,
  Star,
  Store,
} from "lucide-react";
import { signOut } from "@/lib/auth-actions";
import { displayName, getProfile, requireUser } from "@/lib/auth/session";
import {
  averageRating,
  getSellerOrders,
  getSellerProducts,
  getSellerStores,
  getStoreReviews,
  listingStatusCounts,
  listingsByCategory,
  ordersNeedingAction,
  ordersByStatus,
  productPrice,
  ratingDistribution,
  revenueByMonth,
  sellerRevenue,
} from "@/lib/seller/queries";
import { orderTotal } from "@/lib/orders/queries";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderActions } from "@/components/orders/order-actions";
import { ProfileAvatar } from "@/components/profile-avatar";
import { getPublicProfilesByIds } from "@/lib/profiles/queries";
import { BarChart, DonutChart, RevenueChart } from "@/components/dashboard/charts";
import {
  ChartCard,
  EmptyState,
  ListingStatusBadge,
  PageHeader,
  StatCard,
  formatDate,
} from "@/components/dashboard/ui";
import { cn, formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Seller dashboard — square",
  description: "Track your listings, sales, and reviews on square.",
};

export const dynamic = "force-dynamic";

const statusSegments = [
  { status: "pending", label: "Pending", color: "rgb(var(--muted-rgb))", opacity: 0.75 },
  { status: "paid", label: "Paid", color: "rgb(var(--accent-rgb))", opacity: 0.45 },
  { status: "accepted", label: "Accepted", color: "rgb(var(--accent-rgb))", opacity: 0.72 },
  { status: "completed", label: "Completed", color: "rgb(var(--accent-rgb))", opacity: 1 },
  { status: "cancelled", label: "Cancelled", color: "rgb(var(--line-rgb))", opacity: 1 },
  { status: "declined", label: "Declined", color: "rgb(var(--danger-rgb))", opacity: 0.8 },
];

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const profile = await getProfile();

  const stores = await getSellerStores(user.id);
  const storeIds = stores.map((store) => store.id);
  const [products, orders, reviews] = await Promise.all([
    getSellerProducts(storeIds),
    getSellerOrders(user.id),
    getStoreReviews(storeIds),
  ]);

  if (stores.length === 0) {
    return (
      <>
        <PageHeader
          title={`Hi, ${displayName(user, profile)}`}
          description="Your selling command centre will appear here."
        />
        <div className="mt-8">
          <EmptyState
            icon={Store}
            title="No store yet"
            message="Your charts, listings, sales, and reviews will appear here once you publish your first item."
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
      </>
    );
  }

  const revenue = sellerRevenue(orders);
  const status = listingStatusCounts(products);
  const attention = ordersNeedingAction(orders);
  const rating = averageRating(reviews);
  const revenueSeries = revenueByMonth(orders);
  const categorySeries = listingsByCategory(products);
  const ratingSeries = ratingDistribution(reviews).map((point) => ({
    label: `${point.label}★`,
    value: point.value,
  }));
  const statusCounts = ordersByStatus(orders);
  const donutSegments = statusSegments
    .map((segment) => {
      const count =
        statusCounts.find((s) => s.status === segment.status)?.count ?? 0;
      return { ...segment, value: count };
    })
    .filter((segment) => segment.value > 0 || orders.length === 0);

  const flagged = products
    .filter(
      (product) =>
        product.is_blocked ||
        product.status === "rejected" ||
        (product.status === "approved" &&
          !product.is_blocked &&
          (product.stock ?? 0) > 0 &&
          (product.stock ?? 0) <= 3),
    )
    .slice(0, 4);
  const buyerProfiles = await getPublicProfilesByIds(
    attention.map((order) => order.buyer_id),
  );

  return (
    <>
      <PageHeader
        title="Overview"
        description={`Welcome back, ${displayName(user, profile)}.`}
        actions={
          <>
            <Link
              href="/sell"
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent/90"
            >
              <Plus className="size-4" aria-hidden="true" />
              New listing
            </Link>
            <form action={signOut} className="lg:hidden">
              <button
                type="submit"
                className="rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
              >
                Sign out
              </button>
            </form>
          </>
        }
      />

      {/* Metrics */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatPrice(revenue)}
          hint={`${orders.filter((o) => o.status === "completed").length} completed sales`}
          icon={Banknote}
        />
        <StatCard
          label="Live listings"
          value={String(status.live)}
          hint={`${products.length} total listings`}
          icon={Package}
          href="/dashboard/listings"
        />
        <StatCard
          label="Needs action"
          value={String(attention.length)}
          hint={attention.length ? "Orders awaiting a reply" : "You're all caught up"}
          icon={Clock}
          href="/dashboard/orders?view=action"
        />
        <StatCard
          label="Rating"
          value={rating ? rating.toFixed(1) : "—"}
          hint={`${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`}
          icon={Star}
          href="/dashboard/reviews"
        />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Revenue"
          subtitle="Paid sales over the last 6 months"
          className="lg:col-span-2"
        >
          <RevenueChart data={revenueSeries} valueFormatter={formatPrice} />
        </ChartCard>

        <ChartCard title="Orders by status" subtitle="All time">
          {orders.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              No orders yet — your status breakdown will appear here.
            </p>
          ) : (
            <DonutChart segments={donutSegments} centerLabel="orders" />
          )}
        </ChartCard>

        <ChartCard title="Listings by category" subtitle={`${products.length} total`}>
          <BarChart data={categorySeries} />
        </ChartCard>

        <ChartCard
          title="Rating breakdown"
          subtitle={rating ? `Averages ${rating.toFixed(1)} out of 5` : "No ratings yet"}
        >
          <BarChart data={ratingSeries} />
        </ChartCard>

        <ChartCard title="Listing health" subtitle="Where your listings stand">
          <ul className="space-y-2.5 text-sm">
            {[
              { label: "Live", value: status.live, tone: "text-accent" },
              { label: "In review", value: status.pending, tone: "text-muted" },
              { label: "Sold out", value: status.soldOut, tone: "text-muted" },
              { label: "Rejected", value: status.rejected, tone: "text-danger" },
              { label: "Blocked", value: status.blocked, tone: "text-danger" },
            ].map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-3">
                <span className="text-muted">{row.label}</span>
                <span className={cn("font-medium tabular-nums", row.tone)}>
                  {row.value}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard/listings"
            className="mt-4 inline-block text-xs font-medium text-accent hover:underline"
          >
            Manage listings →
          </Link>
        </ChartCard>
      </div>

      {/* Needs attention */}
      {(attention.length > 0 || flagged.length > 0) && (
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <AlertTriangle className="size-4 text-danger" aria-hidden="true" />
              Needs your attention
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {attention.length > 0 && (
              <div className="space-y-3">
                {attention.slice(0, 3).map((order) => {
                  const buyer = buyerProfiles.get(order.buyer_id ?? "");
                  const buyerName =
                    buyer?.username?.trim() || order.buyer_name || "A buyer";
                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-line bg-surface p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-wide text-muted">
                            Order #{order.id} · {formatDate(order.created_at)}
                          </p>
                          <p className="mt-1 truncate text-sm font-medium">
                            {order.product_name}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                            <ProfileAvatar
                              userId={order.buyer_id}
                              src={buyer?.avatar_url}
                              name={buyerName}
                              size="xs"
                            />
                            <span className="truncate">
                              {buyerName} · qty {order.quantity || 1} ·{" "}
                              {formatPrice(orderTotal(order))}
                            </span>
                          </div>
                        </div>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-sm text-muted transition-colors hover:text-accent"
                        >
                          View details
                        </Link>
                        <OrderActions
                          orderId={order.id}
                          role="seller"
                          status={order.status}
                        />
                      </div>
                    </div>
                  );
                })}
                <Link
                  href="/dashboard/orders?view=action"
                  className="inline-block text-xs font-medium text-accent hover:underline"
                >
                  View all orders →
                </Link>
              </div>
            )}

            {flagged.length > 0 && (
              <div className="space-y-3">
                {flagged.map((product) => {
                  const reason = product.is_blocked
                    ? (product.blocked_reason ?? "Blocked by moderators.")
                    : product.status === "rejected"
                      ? (product.rejection_reason ?? "Rejected in review.")
                      : `Only ${product.stock} left in stock.`;
                  return (
                    <div
                      key={product.id}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-line bg-surface p-5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {product.name?.trim() || "Untitled listing"}
                        </p>
                        <p className="mt-1 text-xs text-muted">{reason}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {formatPrice(productPrice(product.price))}
                        </p>
                      </div>
                      <ListingStatusBadge product={product} />
                    </div>
                  );
                })}
                <Link
                  href="/dashboard/listings"
                  className="inline-block text-xs font-medium text-accent hover:underline"
                >
                  Manage listings →
                </Link>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
