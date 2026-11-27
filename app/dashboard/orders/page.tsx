import type { Metadata } from "next";
import Link from "next/link";
import { Receipt } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getSellerOrders } from "@/lib/seller/queries";
import { isOrderPaid, orderTotal } from "@/lib/orders/queries";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderActions } from "@/components/orders/order-actions";
import { ProfileAvatar } from "@/components/profile-avatar";
import { getPublicProfilesByIds } from "@/lib/profiles/queries";
import { RefreshButton } from "@/components/dashboard/refresh-button";
import {
  EmptyState,
  FilterPills,
  PageHeader,
  formatDate,
} from "@/components/dashboard/ui";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Orders you're selling — square",
  description: "Accept, decline, and track orders for your listings.",
};

export const dynamic = "force-dynamic";

type View = "all" | "action" | "accepted" | "completed" | "closed";

export default async function SellerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view: viewParam } = await searchParams;
  const user = await requireUser("/dashboard/orders");
  const orders = await getSellerOrders(user.id);
  const buyerProfiles = await getPublicProfilesByIds(
    orders.map((order) => order.buyer_id),
  );

  const views: View[] = ["all", "action", "accepted", "completed", "closed"];
  const active: View = views.includes(viewParam as View)
    ? (viewParam as View)
    : "all";

  const counts: Record<View, number> = {
    all: orders.length,
    action: orders.filter((o) => o.status === "pending" || o.status === "paid").length,
    accepted: orders.filter((o) => o.status === "accepted").length,
    completed: orders.filter((o) => o.status === "completed").length,
    closed: orders.filter((o) => o.status === "cancelled" || o.status === "declined").length,
  };

  const visible = orders.filter((order) => {
    switch (active) {
      case "action":
        return order.status === "pending" || order.status === "paid";
      case "accepted":
        return order.status === "accepted";
      case "completed":
        return order.status === "completed";
      case "closed":
        return order.status === "cancelled" || order.status === "declined";
      default:
        return true;
    }
  });

  return (
    <>
      <PageHeader
        title="Orders"
        description="Every order placed on your listings."
        actions={<RefreshButton />}
      />

      {orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Receipt}
            title="No orders yet"
            message="When someone buys one of your listings, the order lands here for you to accept."
          />
        </div>
      ) : (
        <>
          <div className="mt-6">
            <FilterPills
              basePath="/dashboard/orders"
              active={active}
              items={[
                { key: "all", label: "All", count: counts.all },
                { key: "action", label: "Needs action", count: counts.action },
                { key: "accepted", label: "Accepted", count: counts.accepted },
                { key: "completed", label: "Completed", count: counts.completed },
                { key: "closed", label: "Closed", count: counts.closed },
              ]}
            />
          </div>

          {visible.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center text-sm text-muted">
              Nothing in this view.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {visible.map((order) => {
                const actionable = order.status === "pending" || order.status === "paid";
                const buyer = buyerProfiles.get(order.buyer_id ?? "");
                const buyerName =
                  buyer?.username?.trim() || order.buyer_name || "A buyer";
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
                            Order #{order.id} · {formatDate(order.created_at)}
                          </p>
                          <p className="mt-1 truncate text-sm font-medium">
                            {order.product_name}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                            <ProfileAvatar
                              userId={order.buyer_id}
                              src={buyer?.avatar_url}
                              name={buyerName}
                              size="xs"
                              className="pointer-events-auto relative z-10"
                            />
                            <span className="truncate">
                              {buyerName} · qty {order.quantity || 1} ·{" "}
                              {isOrderPaid(order) ? "Paid online" : "Payment pending"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <OrderStatusBadge status={order.status} />
                          <p className="text-sm font-semibold tabular-nums">
                            {formatPrice(orderTotal(order))}
                          </p>
                        </div>
                      </div>
                      {actionable && (
                        <div className="pointer-events-none relative z-10 mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                          <Link
                            href={`/orders/${order.id}`}
                            className="pointer-events-auto text-sm text-muted transition-colors hover:text-accent"
                          >
                            View details
                          </Link>
                          <OrderActions
                            orderId={order.id}
                            role="seller"
                            status={order.status}
                            className="pointer-events-auto"
                          />
                        </div>
                      )}
                    </div>
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
