"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CreditCard, LoaderCircle, RefreshCw } from "lucide-react";
import { payOrderAction } from "@/lib/orders/actions";
import { loadPaystack } from "@/lib/payments/paystack-inline";
import {
  clearPendingPayment,
  usePendingPayment,
  writePendingPayment,
} from "@/lib/payments/pending-payment-store";
import { cn, formatPrice } from "@/lib/utils";

type PayOrderButtonProps = {
  orderId: number;
  amount: number;
  email: string;
  buyerId: string;
  publicKey: string;
  productName?: string | null;
  className?: string;
};

const STORAGE_PREFIX = "square.pending-payment.";

export function PayOrderButton({
  orderId,
  amount,
  email,
  buyerId,
  publicKey,
  productName,
  className,
}: PayOrderButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const paymentStarted = React.useRef(false);
  const storageKey = `${STORAGE_PREFIX}${buyerId}.${orderId}`;
  const pendingReference = usePendingPayment(storageKey);

  async function recordPayment(reference: string) {
    setBusy(true);
    setError(null);
    writePendingPayment(storageKey, reference);

    const result = await payOrderAction(orderId, reference).catch(() => null);

    if (result?.paid) {
      clearPendingPayment(storageKey);
      router.push(`/orders/${orderId}?paid=1`);
      router.refresh();
      setBusy(false);
      return;
    }

    setError(
      result?.error ??
        "Payment went through but we could not confirm it. Do not pay again — keep your reference and contact support.",
    );
    setBusy(false);
  }

  async function handlePay() {
    if (busy) return;

    if (pendingReference) {
      await recordPayment(pendingReference);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Add a valid email address for your receipt.");
      return;
    }

    setError(null);
    setBusy(true);
    paymentStarted.current = false;

    try {
      const Paystack = await loadPaystack();
      const handler = Paystack.setup({
        key: publicKey,
        email: email.trim(),
        amount: Math.round(amount * 100),
        currency: "NGN",
        channels: ["card", "bank_transfer", "mobile_money"],
        metadata: {
          buyer_id: buyerId,
          order_id: orderId,
          ...(productName ? { product_name: productName } : {}),
        },
        callback: (response) => {
          paymentStarted.current = true;
          const reference = response.reference?.trim();
          if (!reference) {
            setBusy(false);
            setError(
              "Paystack did not return a reference. Do not pay again — contact support.",
            );
            return;
          }
          void recordPayment(reference);
        },
        onClose: () => {
          if (paymentStarted.current) return;
          setBusy(false);
          setError("Payment cancelled. Your order is still unpaid.");
        },
      });
      handler.openIframe();
    } catch (caught) {
      setBusy(false);
      setError(
        caught instanceof Error ? caught.message : "Could not open Paystack. Try again.",
      );
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void handlePay()}
        disabled={busy}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
      >
        {busy ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : pendingReference ? (
          <RefreshCw className="size-4" aria-hidden="true" />
        ) : (
          <CreditCard className="size-4" aria-hidden="true" />
        )}
        {busy
          ? "Confirming payment…"
          : pendingReference
            ? "Retry payment confirmation"
            : `Pay ${formatPrice(amount)} now`}
      </button>
      {error && (
        <div role="alert" className="rounded-xl border border-danger/30 bg-danger/5 p-3 text-xs leading-relaxed text-danger">
          {error}
        </div>
      )}
    </div>
  );
}
