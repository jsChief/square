import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CircleCheck, CreditCard, Mail } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import {
  getOrderById,
  getOrderReceipts,
  isOrderPaid,
  orderTotal,
} from "@/lib/orders/queries";
import {
  getPaystackConfigIssue,
  getPaystackPublicKey,
} from "@/lib/payments/paystack";
import { formatPrice } from "@/lib/utils";
import { RefreshButton } from "@/components/dashboard/refresh-button";
import { OrderActions } from "@/components/orders/order-actions";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { PayOrderButton } from "@/components/orders/pay-order-button";
import { ProfileAvatar } from "@/components/profile-avatar";
import { getPublicProfilesByIds } from "@/lib/profiles/queries";

export const metadata: Metadata = {
  title: "Order details — square",
  description: "Track your square order and payment.",
};

export const dynamic = "force-dynamic";

interface OrderPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string; paid?: string }>;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
}

const steps = [
  { status: "placed", label: "Order placed" },
  { status: "paid", label: "Payment received" },
  { status: "accepted", label: "Seller accepted" },
  { status: "completed", label: "Collected and complete" },
];

function reachedStep(orderStatus: string, step: string) {
  const order = ["placed", "paid", "accepted", "completed"];
  const current = orderStatus === "pending" ? "placed" : orderStatus;
  if (step === "paid" && current === "accepted") return true;
  return order.indexOf(current) >= order.indexOf(step);
}

export default async function OrderPage({
  params,
  searchParams,
}: OrderPageProps) {
  const { id } = await params;
  const { placed, paid: paidFlag } = await searchParams;
  const user = await requireUser(`/orders/${id}`);

  const orderId = /^\d+$/.test(id) ? Number(id) : 0;
  const order = await getOrderById(orderId);
  if (!order) notFound();

  const buying = order.buyer_id === user.id;
  const selling = order.seller_id === user.id;
  if (!buying && !selling) notFound();
  const backHref = selling ? "/dashboard/orders" : "/orders";

  const receipts = await getOrderReceipts(orderId);
  const counterpartyId = buying ? order.seller_id : order.buyer_id;
  const counterpartyProfiles = await getPublicProfilesByIds([counterpartyId]);
  const counterparty = counterpartyProfiles.get(counterpartyId);
  const counterpartyName =
    counterparty?.username?.trim() ||
    (buying ? order.seller_name : order.buyer_name);
  const total = orderTotal(order);
  const paymentPaid = isOrderPaid(order);
  const showPlacedSuccess = placed === "1";
  const showPaidSuccess = paidFlag === "1" && paymentPaid;
  const issue = getPaystackConfigIssue();
  const canPay =
    buying &&
    !paymentPaid &&
    total > 0 &&
    (order.status === "pending" || order.status === "accepted") &&
    issue === null &&
    Boolean(user.email);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-md py-2 text-sm text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All orders
        </Link>
        <RefreshButton />
      </div>

      {(showPlacedSuccess || showPaidSuccess) && (
        <div
          role="status"
          className="mt-7 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent-soft p-4 text-sm"
        >
          <CircleCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
          <div>
            <p className="font-medium text-accent">
              {paymentPaid ? "Payment successful" : "Purchase request sent"}
            </p>
            <p className="mt-1 text-muted">
              {paymentPaid
                ? "Your payment has been verified and your order is on record."
                : "The seller can now arrange payment and pickup with you."}
            </p>
          </div>
        </div>
      )}

      <div className="mt-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">
            Order #{order.id} · {buying ? "Buying" : "Selling"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {order.product_name}
          </h1>
          <div className="mt-2 flex items-center gap-2.5 text-sm text-muted">
            <ProfileAvatar
              userId={counterpartyId}
              src={counterparty?.avatar_url}
              name={counterpartyName}
              size="sm"
            />
            <span>
              {buying ? "Sold by" : "Buyer:"}{" "}
              <span className="font-medium text-foreground">
                {counterpartyName}
              </span>
            </span>
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-9 grid gap-6 lg:grid-cols-[1.4fr_0.9fr] lg:items-start">
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <h2 className="text-base font-semibold">Order progress</h2>
            <ol className="mt-5 space-y-4">
              {steps.map((step) => {
                const reached = reachedStep(order.status, step.status);
                return (
                  <li key={step.status} className="flex items-center gap-3 text-sm">
                    <span
                      className={
                        reached
                          ? "grid size-6 place-items-center rounded-full bg-accent text-accent-contrast"
                          : "grid size-6 place-items-center rounded-full border border-line text-muted"
                      }
                    >
                      {reached ? (
                        <CircleCheck className="size-3.5" aria-hidden="true" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-muted" />
                      )}
                    </span>
                    <span className={reached ? "font-medium" : "text-muted"}>
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ol>
            <div className="mt-6">
              <OrderActions
                orderId={order.id}
                role={buying && selling ? "both" : buying ? "buyer" : "seller"}
                status={order.status}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <h2 className="text-base font-semibold">Payment</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted">Amount</span>
                <span className="font-medium tabular-nums">
                  {formatPrice(total)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted">Status</span>
                <span>{paymentPaid ? "Paid with Paystack" : "Not paid yet"}</span>
              </div>
              {order.payment_reference && (
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="text-muted">Reference</span>
                  <code className="break-all rounded bg-background px-2 py-1 text-xs">
                    {order.payment_reference}
                  </code>
                </div>
              )}
              {order.notes && (
                <p className="border-t border-line pt-4 text-xs leading-relaxed text-muted">
                  {order.notes}
                </p>
              )}
            </div>

            {canPay && user.email && (
              <div className="mt-6">
                <PayOrderButton
                  orderId={order.id}
                  amount={total}
                  email={user.email}
                  buyerId={user.id}
                  publicKey={getPaystackPublicKey()}
                  productName={order.product_name}
                />
              </div>
            )}
            {buying && !paymentPaid && issue !== null && (
              <p className="mt-4 text-xs text-muted">
                Online payments are unavailable right now. Arrange payment
                directly with the seller.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <h2 className="text-base font-semibold">Details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted">Placed</dt>
                <dd className="mt-1">{formatDate(order.created_at)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Quantity</dt>
                <dd className="mt-1 tabular-nums">{order.quantity}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Store</dt>
                <dd className="mt-1">{order.store_name}</dd>
              </div>
            </dl>
          </section>

          {receipts.length > 0 && (
            <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <h2 className="text-base font-semibold">Receipts</h2>
              <div className="mt-4 space-y-4">
                {receipts.map((receipt) => (
                  <div
                    key={receipt.id}
                    className="rounded-xl border border-line bg-background p-3 text-xs"
                  >
                    <p className="flex items-center gap-2 font-medium">
                      <CreditCard className="size-3.5 text-accent" aria-hidden="true" />
                      {formatPrice(Number(receipt.amount))}
                    </p>
                    <p className="mt-2 break-all text-muted">
                      Ref: <span className="text-foreground">{receipt.reference}</span>
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-muted">
                      <Mail className="size-3.5" aria-hidden="true" />
                      {receipt.email}
                    </p>
                    <p className="mt-1 text-muted">
                      {formatDate(receipt.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
