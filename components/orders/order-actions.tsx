"use client";

import * as React from "react";
import { LoaderCircle } from "lucide-react";
import {
  confirmOrderReceivedAction,
  updateOrderStatusAction,
} from "@/lib/orders/actions";
import { cn } from "@/lib/utils";

type OrderActionsProps = {
  orderId: number;
  role: "buyer" | "seller" | "both";
  status: string;
  className?: string;
};

type ActionResult = { error?: string; success?: string } | null;

const secondaryClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-medium transition-colors hover:border-accent hover:text-accent disabled:opacity-60";
const primaryClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent/90 disabled:opacity-60";

export function OrderActions({
  orderId,
  role,
  status,
  className,
}: OrderActionsProps) {
  const [pending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult>(null);

  function run(action: () => Promise<ActionResult>) {
    setResult(null);
    startTransition(async () => {
      const response = await action().catch(() => ({
        error: "Could not update the order. Try again.",
      }));
      setResult(response);
    });
  }

  const isSeller = role === "seller" || role === "both";
  const isBuyer = role === "buyer" || role === "both";
  const canSellerManage = isSeller && (status === "pending" || status === "paid");
  const canSellerCancel = canSellerManage || (isSeller && status === "accepted");
  const canBuyerCancel = isBuyer && !isSeller && status === "pending";
  const canConfirm = isBuyer && status === "accepted";

  const buttons: React.ReactNode[] = [];

  if (canSellerManage) {
    buttons.push(
      <button
        key="accept"
        type="button"
        disabled={pending}
        onClick={() => run(() => updateOrderStatusAction(orderId, "accepted"))}
        className={primaryClass}
      >
        Accept order
      </button>,
      <button
        key="decline"
        type="button"
        disabled={pending}
        onClick={() => run(() => updateOrderStatusAction(orderId, "declined"))}
        className={secondaryClass}
      >
        Decline
      </button>,
    );
  }

  if (canSellerCancel || canBuyerCancel) {
    buttons.push(
      <button
        key="cancel"
        type="button"
        disabled={pending}
        onClick={() => run(() => updateOrderStatusAction(orderId, "cancelled"))}
        className={secondaryClass}
      >
        Cancel order
      </button>,
    );
  }

  if (canConfirm) {
    buttons.push(
      <button
        key="confirm"
        type="button"
        disabled={pending}
        onClick={() => run(() => confirmOrderReceivedAction(orderId))}
        className={primaryClass}
      >
        I&apos;ve received it
      </button>,
    );
  }

  if (buttons.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-3">{buttons}</div>
      {pending && (
        <p className="flex items-center gap-2 text-xs text-muted">
          <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
          Updating order…
        </p>
      )}
      {result?.error && (
        <p role="alert" className="text-xs text-danger">
          {result.error}
        </p>
      )}
      {result?.success && (
        <p role="status" className="text-xs text-accent">
          {result.success}
        </p>
      )}
    </div>
  );
}
