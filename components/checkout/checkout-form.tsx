"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  LoaderCircle,
  Lock,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";
import { categoryMeta } from "@/lib/categories";
import { ProfileAvatar } from "@/components/profile-avatar";
import {
  createOrderAction,
  type CreateOrderInput,
} from "@/lib/orders/actions";
import type { PaystackConfigIssue } from "@/lib/payments/paystack";
import { loadPaystack } from "@/lib/payments/paystack-inline";
import {
  clearPendingPayment,
  usePendingPayment,
  writePendingPayment,
} from "@/lib/payments/pending-payment-store";
import { cn, categoryLabels, conditionLabels, formatPrice } from "@/lib/utils";
import type { Category, Condition } from "@/types";

type CheckoutFormProps = {
  listingId: number;
  title: string;
  imageUrl: string | null;
  category: Category;
  condition: Condition;
  location: string;
  price: number;
  stock: number | null;
  sellerName: string;
  sellerId: string | null;
  sellerAvatarUrl: string | null;
  storeName: string;
  defaultEmail: string;
  publicKey: string;
  paymentsEnabled: boolean;
  paymentsIssue: PaystackConfigIssue | null;
  buyerId: string;
};

type PendingPayment = {
  reference: string;
  quantity: number;
  email: string;
  notes: string;
  fulfillment: "pickup" | "delivery";
};

const STORAGE_PREFIX = "square.pending-checkout.";

const fieldClassName =
  "mt-2 h-11 w-full rounded-xl border border-line bg-background px-3.5 text-sm text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15";

const noteClassName =
  "mt-2 min-h-24 w-full resize-y rounded-xl border border-line bg-background px-3.5 py-3 text-sm leading-6 text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/15";

function parsePending(value: string | null): PendingPayment | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as PendingPayment;
    return typeof parsed.reference === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function CheckoutForm({
  listingId,
  title,
  imageUrl,
  category,
  condition,
  location,
  price,
  stock,
  sellerName,
  sellerId,
  sellerAvatarUrl,
  storeName,
  defaultEmail,
  publicKey,
  paymentsEnabled,
  paymentsIssue,
  buyerId,
}: CheckoutFormProps) {
  const router = useRouter();
  const [quantity, setQuantity] = React.useState(1);
  const [email, setEmail] = React.useState(defaultEmail);
  const [notes, setNotes] = React.useState("");
  const [fulfillment, setFulfillment] = React.useState<"pickup" | "delivery">(
    "pickup",
  );
  const [busy, setBusy] = React.useState<"pay" | "request" | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const paymentStarted = React.useRef(false);
  const emailInputRef = React.useRef<HTMLInputElement>(null);

  const storageKey = `${STORAGE_PREFIX}${buyerId}.${listingId}`;
  const pending = parsePending(usePendingPayment(storageKey));
  const soldOut = stock !== null && stock <= 0;
  const maxQuantity = stock === null ? 99 : Math.min(stock, 99);
  const total = price * quantity;
  const pendingTotal = pending ? price * Math.max(1, pending.quantity) : 0;

  const categoryInfo = categoryMeta[category];
  const CategoryIcon = categoryInfo.icon;
  const canPayOnline = paymentsEnabled && !soldOut;

  const noteLabel =
    fulfillment === "delivery"
      ? "Delivery address or instructions"
      : "Pickup note";
  const notePlaceholder =
    fulfillment === "delivery"
      ? "Hall, room number, and a good time for delivery"
      : "When and where on campus can you meet?";

  const paymentNote =
    paymentsIssue === "missing"
      ? "Online payments aren't configured yet. You can still send a purchase request and arrange payment directly."
      : "Paystack keys need an admin fix before online payments can be used. Send a purchase request instead.";

  function rememberPending(payment: PendingPayment) {
    writePendingPayment(storageKey, JSON.stringify(payment));
  }

  function forgetPending() {
    clearPendingPayment(storageKey);
  }

  async function placeOrder(
    paymentReference: string | null,
    pending?: PendingPayment,
  ) {
    setError(null);
    setEmailError(null);
    setBusy(paymentReference ? "pay" : "request");

    const input: CreateOrderInput = {
      listingId,
      quantity: pending?.quantity ?? quantity,
      email: pending?.email ?? email,
      notes: pending?.notes ?? notes,
      fulfillment: pending?.fulfillment ?? fulfillment,
      paymentReference,
    };

    const result = await createOrderAction(input).catch(() => null);

    if (!result || result.error || !result.orderId) {
      setError(
        result?.error ??
          "Could not place your order. Check your connection and try again.",
      );
      setBusy(null);
      return;
    }

    forgetPending();
    router.push(`/orders/${result.orderId}?placed=1`);
    router.refresh();
  }

  async function handlePay() {
    if (soldOut || busy) return;

    if (pending) {
      await placeOrder(pending.reference, pending);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Enter a valid email address for your receipt.");
      emailInputRef.current?.scrollIntoView({ block: "center" });
      emailInputRef.current?.focus();
      return;
    }

    setError(null);
    setEmailError(null);
    setBusy("pay");
    paymentStarted.current = false;

    const details = {
      quantity,
      email: email.trim(),
      notes,
      fulfillment,
    } as const;

    try {
      const Paystack = await loadPaystack();
      const handler = Paystack.setup({
        key: publicKey,
        email: email.trim(),
        amount: Math.round(total * 100),
        currency: "NGN",
        channels: ["card", "bank_transfer", "mobile_money"],
        metadata: {
          buyer_id: buyerId,
          listing_id: listingId,
          product_name: title,
          store_name: storeName,
          quantity,
        },
        callback: (response) => {
          paymentStarted.current = true;
          const reference = response.reference?.trim();
          if (!reference) {
            setBusy(null);
            setError(
              "Paystack did not return a reference. Do not pay again — contact support.",
            );
            return;
          }
          rememberPending({ reference, ...details });
          void placeOrder(reference, { reference, ...details });
        },
        onClose: () => {
          if (paymentStarted.current) return;
          setBusy(null);
          setError("Payment cancelled. Your order was not placed.");
        },
      });
      handler.openIframe();
    } catch (caught) {
      setBusy(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not open Paystack. Try again or arrange payment with the seller.",
      );
    }
  }

  function handlePrimaryAction() {
    if (pending || canPayOnline) void handlePay();
    else void placeOrder(null);
  }

  const primaryLabel =
    busy === "pay"
      ? "Confirming payment…"
      : busy === "request" && !canPayOnline && !pending
        ? "Sending…"
        : pending
          ? "Retry payment confirmation"
          : soldOut
            ? "Sold out"
            : canPayOnline
              ? `Pay ${formatPrice(total)} with Paystack`
              : price === 0
                ? "Send free request"
                : "Arrange payment with seller";

  const PrimaryIcon =
    busy !== null
      ? LoaderCircle
      : pending
        ? RefreshCw
        : canPayOnline
          ? Lock
          : ShieldCheck;

  const showSecondary = canPayOnline && !pending;

  return (
    <div className="grid gap-6 pb-24 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.75fr)] lg:items-start lg:gap-8 lg:pb-0">
      <section className="order-1 rounded-3xl border border-line bg-surface p-3.5 sm:p-6 lg:col-start-1 lg:row-start-1">
        <div className="flex gap-3 sm:gap-5">
          <div
            className={cn(
              "relative size-20 shrink-0 overflow-hidden rounded-2xl border border-line bg-gradient-to-br sm:size-28",
              categoryInfo.gradient,
            )}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                unoptimized
                sizes="112px"
                className="object-cover"
              />
            ) : (
              <CategoryIcon
                className={cn("size-10", categoryInfo.tint)}
                strokeWidth={1.25}
                aria-hidden="true"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-line bg-background px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-muted">
                {categoryLabels[category]}
              </span>
              <span className="rounded-full border border-line px-2.5 py-1 text-[11px] text-muted">
                {conditionLabels[condition]}
              </span>
            </div>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-balance">
              {title}
            </h2>
            <p className="mt-1 text-sm text-muted">{formatPrice(price)} each</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Store className="size-3.5 text-muted" aria-hidden="true" />
                {storeName}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 text-muted" aria-hidden="true" />
                {location}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted">
              <ProfileAvatar
                userId={sellerId}
                src={sellerAvatarUrl}
                name={sellerName}
                size="xs"
              />
              <span>Sold by {sellerName}</span>
            </div>
          </div>
        </div>
      </section>

      <aside className="order-3 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-line bg-surface p-4 shadow-[0_18px_45px_-28px_rgb(var(--foreground-rgb)_/_0.35)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Amount due</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-background px-2.5 py-1 text-[11px] font-medium text-muted">
              <Lock className="size-3" aria-hidden="true" />
              Secure
            </span>
          </div>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted">Item subtotal</dt>
              <dd className="font-medium tabular-nums">{formatPrice(total)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted">Handover</dt>
              <dd className="font-medium">
                {fulfillment === "pickup" ? "Campus pickup" : "Delivery"}
              </dd>
            </div>
            <div className="flex items-end justify-between gap-4 border-t border-line pt-4">
              <dt className="text-sm font-medium">Total</dt>
              <dd
                className="text-3xl font-semibold tracking-tight text-accent tabular-nums"
                aria-live="polite"
              >
                {formatPrice(total)}
              </dd>
            </div>
          </dl>

          <div className="mt-5 space-y-3">
            {soldOut && (
              <p
                role="alert"
                className="rounded-2xl border border-danger/30 bg-danger/5 p-3 text-xs leading-relaxed text-danger"
              >
                This item is sold out. Message the seller to ask about a restock.
              </p>
            )}

            {!paymentsEnabled && (
              <p className="rounded-2xl border border-line bg-background p-3 text-xs leading-relaxed text-muted">
                {paymentNote}
              </p>
            )}

            {pending && (
              <div className="rounded-2xl border border-accent/25 bg-accent-soft p-3 text-xs leading-relaxed text-accent">
                <p className="font-semibold">Payment not confirmed yet</p>
                <p className="mt-1 text-foreground/80">
                  Do not pay again. We saved your reference and can retry the
                  confirmation.
                </p>
                <p className="mt-1.5 break-all font-mono text-[11px]">
                  Reference: {pending.reference}
                </p>
                <p className="mt-1 text-foreground/80">
                  Amount: {formatPrice(pendingTotal)}. Retry uses the email and
                  quantity from that attempt.
                </p>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-danger/30 bg-danger/5 p-3 text-xs leading-relaxed text-danger"
              >
                <p>{error}</p>
                {pending && (
                  <p className="mt-1.5">
                    Your reference is saved. Use “Retry payment confirmation”
                    instead of paying again.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 space-y-2.5">
            <button
              type="button"
              onClick={handlePrimaryAction}
              disabled={soldOut || busy !== null}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 text-[15px] font-medium text-accent-contrast transition-colors hover:bg-accent/90 focus-visible:ring-4 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PrimaryIcon
                className={cn("size-4", busy !== null && "animate-spin")}
                aria-hidden="true"
              />
              {primaryLabel}
            </button>

            {showSecondary && (
              <button
                type="button"
                onClick={() => void placeOrder(null)}
                disabled={busy !== null}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line bg-background px-5 text-[15px] font-medium transition-colors hover:border-accent hover:text-accent focus-visible:ring-4 focus-visible:ring-accent/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy === "request" && (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                )}
                {busy === "request"
                  ? "Sending…"
                  : price === 0
                    ? "Send free request"
                    : "Arrange payment with seller"}
              </button>
            )}
          </div>

          <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-muted">
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0 text-muted"
              aria-hidden="true"
            />
            Payments are processed by Paystack. square never sees your card
            details.
          </p>
        </div>
      </aside>

      <section className="order-2 rounded-3xl border border-line bg-surface p-4 sm:p-6 lg:col-start-1 lg:row-start-2">
        <div className="divide-y divide-line">
          <div className="pb-4 sm:pb-6">
            <h2 className="text-sm font-semibold">Quantity</h2>
            <p className="mt-1 text-xs text-muted">
              Each item is sold by the unit below.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center rounded-full border border-line bg-background">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  disabled={quantity <= 1 || soldOut}
                  aria-label="Decrease quantity"
                  className="grid size-10 place-items-center rounded-full text-muted transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span aria-hidden="true">−</span>
                </button>
                <span
                  className="w-10 text-center text-sm font-semibold tabular-nums"
                  aria-live="polite"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) => Math.min(maxQuantity, current + 1))
                  }
                  disabled={quantity >= maxQuantity || soldOut}
                  aria-label="Increase quantity"
                  className="grid size-10 place-items-center rounded-full text-muted transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span aria-hidden="true">+</span>
                </button>
              </div>
              <p className="text-xs text-muted">
                {soldOut
                  ? "Sold out"
                  : stock !== null
                    ? `${stock} available`
                    : "Available now"}
              </p>
            </div>
          </div>

          <fieldset className="py-4 sm:py-6">
            <legend className="text-sm font-semibold">How would you like it?</legend>
            <p className="mt-1 text-xs text-muted">
              Final handover details are agreed with the seller.
            </p>
            <div className="mt-4 inline-flex w-full max-w-md rounded-2xl border border-line bg-background p-1">
              {(["pickup", "delivery"] as const).map((option) => {
                const selected = fulfillment === option;
                const Icon = option === "pickup" ? MapPin : Truck;
                return (
                  <label
                    key={option}
                    className={cn(
                      "relative flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm transition-colors focus-within:ring-4 focus-within:ring-accent/15",
                      selected
                        ? "bg-accent-soft font-medium text-accent"
                        : "text-muted hover:text-foreground",
                    )}
                  >
                    <input
                      type="radio"
                      name="fulfillment"
                      value={option}
                      checked={selected}
                      onChange={() => setFulfillment(option)}
                      className="sr-only"
                    />
                    <Icon className="size-4" aria-hidden="true" />
                    <span>{option === "pickup" ? "Campus pickup" : "Delivery"}</span>
                    {selected && (
                      <span
                        className="size-1.5 rounded-full bg-accent"
                        aria-hidden="true"
                      />
                    )}
                  </label>
                );
              })}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              {fulfillment === "pickup"
                ? "Meet the seller at an agreed spot."
                : "Arrange a drop-off with the seller."}
            </p>
          </fieldset>

          <div className="pt-4 sm:pt-6">
            <h2 className="text-sm font-semibold">Receipt and note</h2>
            <p className="mt-1 text-xs text-muted">
              We use this email for your payment receipt and order updates.
            </p>
            <div className="mt-3 space-y-5 sm:mt-4">
              <div>
                <label htmlFor="checkout-email" className="block text-sm font-medium">
                  Receipt email
                </label>
                <input
                  ref={emailInputRef}
                  id="checkout-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={emailError ? true : undefined}
                  aria-describedby={emailError ? "checkout-email-error" : undefined}
                  className={cn(
                    fieldClassName,
                    "scroll-mb-24",
                    emailError &&
                      "border-danger focus-visible:border-danger focus-visible:ring-danger/15",
                  )}
                />
                {emailError && (
                  <p
                    id="checkout-email-error"
                    role="alert"
                    className="mt-1.5 text-xs leading-relaxed text-danger"
                  >
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="checkout-notes" className="block text-sm font-medium">
                  {noteLabel} <span className="text-muted">(optional)</span>
                </label>
                <textarea
                  id="checkout-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value.slice(0, 1000))}
                  maxLength={1000}
                  rows={3}
                  placeholder={notePlaceholder}
                  className={noteClassName}
                />
                <p className="mt-1.5 text-right text-[11px] text-muted tabular-nums">
                  {notes.length}/1000
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="checkout-action-bar fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface px-4 py-3 shadow-[0_-10px_30px_-24px_rgb(var(--foreground-rgb)_/_0.35)] lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted">
              Total
            </p>
            <p
              className="text-lg font-semibold tracking-tight text-accent tabular-nums"
              aria-live="polite"
            >
              {formatPrice(total)}
            </p>
          </div>
          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={soldOut || busy !== null}
            className="ml-auto flex h-11 min-w-44 items-center justify-center gap-2 rounded-full bg-accent px-4 text-xs font-medium text-accent-contrast transition-colors hover:bg-accent/90 focus-visible:ring-4 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PrimaryIcon
              className={cn("size-4 shrink-0", busy !== null && "animate-spin")}
              aria-hidden="true"
            />
            <span>{primaryLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
