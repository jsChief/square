import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/lib/auth-actions";
import { requireUser } from "@/lib/auth/session";
import {
  getOrdersForUser,
  isOrderPaid,
  orderTotal,
} from "@/lib/orders/queries";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { ProfileAvatar } from "@/components/profile-avatar";
import { getPublicProfilesByIds } from "@/lib/profiles/queries";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Your orders — square",
  description: "Track your purchases and sales on square.",
};

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await requireUser("/orders");
  const orders = await getOrdersForUser(user.id);
  const counterpartyProfiles = await getPublicProfilesByIds(
    orders.map((order) =>
      order.buyer_id === user.id ? order.seller_id : order.buyer_id,
    ),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Your orders
          </h1>
          <p className="mt-2 text-sm text-muted">
            Purchases and sales, all in one place.
          </p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
          >
            Sign out
          </button>
        </form>
      </div>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center">
          <p className="font-medium">No orders yet</p>
          <p className="mt-1 text-sm text-muted">
            Find something nearby and it will show up here.
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
            const buying = order.buyer_id === user.id;
            const paid = isOrderPaid(order);
            const counterpartyId = buying ? order.seller_id : order.buyer_id;
            const counterparty = counterpartyProfiles.get(counterpartyId ?? "");
            const counterpartyName =
              counterparty?.username?.trim() ||
              (buying ? order.seller_name : order.buyer_name);
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
                        {buying ? "Buying" : "Selling"} · Order #{order.id}
                      </p>
                      <p className="mt-1 truncate font-medium">
                        {order.product_name}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                        <ProfileAvatar
                          userId={counterpartyId}
                          src={counterparty?.avatar_url}
                          name={counterpartyName}
                          size="xs"
                          className="pointer-events-auto relative z-10"
                        />
                        <span className="truncate">
                          {buying ? "From" : "To"} {counterpartyName}
                        </span>
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
