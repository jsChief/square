import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getBuyerOrders, isOrderPaid, orderTotal } from "@/lib/orders/queries";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { ProfileAvatar } from "@/components/profile-avatar";
import { getPublicProfilesByIds } from "@/lib/profiles/queries";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Your orders — square",
  description: "Track your purchases on square.",
};

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await requireUser("/orders");
  const orders = await getBuyerOrders(user.id);
  const sellerProfiles = await getPublicProfilesByIds(
    orders.map((order) => order.seller_id),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Your orders
        </h1>
        <p className="mt-2 text-sm text-muted">
          Everything you&apos;ve bought, all in one place.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center">
          <p className="font-medium">No purchases yet</p>
          <p className="mt-1 text-sm text-muted">
            Items you buy will show up here.
          </p>
          <Link
            href="/listings"
            className="mt-5 inline-block rounded-full border border-line px-4 py-2 text-sm hover:border-accent hover:text-accent"
          >
            Browse listings
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-3">
          {orders.map((order) => {
            const paid = isOrderPaid(order);
            const sellerId = order.seller_id;
            const seller = sellerProfiles.get(sellerId ?? "");
            const sellerName =
              seller?.username?.trim() || order.seller_name || "A seller";
            return (
              <div
                key={order.id}
                className="relative rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent"
              >
                <Link
                  href={`/orders/${order.id}`}
                  aria-label={`View order #${order.id}`}
                  className="absolute inset-0 rounded-2xl"
                />
                <div className="relative pointer-events-none">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide text-muted">
                        Purchased · Order #{order.id}
                      </p>
                      <p className="mt-1 truncate font-medium">
                        {order.product_name}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                        <ProfileAvatar
                          userId={sellerId}
                          src={seller?.avatar_url}
                          name={sellerName}
                          size="xs"
                          className="pointer-events-auto relative z-10"
                        />
                        <span className="truncate">From {sellerName}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <OrderStatusBadge status={order.status} />
                      <p className="font-medium tabular-nums">
                        {formatPrice(orderTotal(order))}
                      </p>
                      <p className="text-xs text-muted">
                        {paid ? "Paid online" : "Payment pending"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
