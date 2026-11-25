"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, getProfile } from "@/lib/auth/session";
import { getListing } from "@/lib/data";
import { verifyPaystackTransaction } from "@/lib/payments/paystack";
import { createClient } from "@/lib/supabase/server";

export type OrderState = {
  error?: string;
  success?: string;
  paid?: boolean;
} | null;

export type CreateOrderInput = {
  listingId: number;
  quantity: number;
  email: string;
  notes?: string;
  fulfillment?: "pickup" | "delivery";
  /** Paystack reference. Omit it to create a pay-on-pickup request. */
  paymentReference?: string | null;
};

export type CreateOrderResult = {
  error?: string;
  orderId?: number;
};

const SELLER_STATUSES = new Set(["accepted", "declined", "cancelled"]);
const CLOSED_STATUSES = new Set(["completed", "cancelled", "declined"]);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidId(value: number) {
  return Number.isInteger(value) && value > 0;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function friendlyDbError(message: string) {
  const normalized = message.toLowerCase();
  if (
    normalized.includes("row-level security") ||
    normalized.includes("permission")
  ) {
    return "You do not have permission to do that. Sign in again and retry.";
  }
  if (normalized.includes("violates foreign key")) {
    return "That item is linked to a missing store. Refresh and try again.";
  }
  if (normalized.includes("duplicate key")) {
    return "That already exists. Refresh and try again.";
  }
  return message;
}

function revalidateOrderPaths(orderId?: number) {
  revalidatePath("/orders");
  revalidatePath("/listings");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  if (orderId) revalidatePath(`/orders/${orderId}`);
}

/** Creates an order, verifying a Paystack charge first when one was supplied. */
export async function createOrderAction(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to place an order." };

  if (!isValidId(input.listingId)) return { error: "Listing not found." };

  const quantity = Math.trunc(input.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    return { error: "Choose a quantity between 1 and 99." };
  }

  const email = (input.email ?? "").trim();
  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address for your receipt." };
  }

  const notes = (input.notes ?? "").trim();
  if (notes.length > 1000) {
    return { error: "Keep your note under 1,000 characters." };
  }

  const fulfillment = input.fulfillment === "delivery" ? "delivery" : "pickup";

  const listing = await getListing(String(input.listingId));
  if (!listing) return { error: "This listing is not available right now." };
  if (listing.sellerId === user.id) {
    return { error: "You cannot order your own listing." };
  }
  if (listing.storeId == null) {
    return { error: "This listing is not linked to a store." };
  }
  if (!listing.sellerId || !UUID_PATTERN.test(listing.sellerId)) {
    return { error: "This seller has no linked account yet." };
  }
  if (listing.stock != null && quantity > listing.stock) {
    return {
      error: `Only ${listing.stock} ${listing.stock === 1 ? "item is" : "items are"} left.`,
    };
  }

  const total = listing.price * quantity;
  if (!Number.isFinite(total) || total < 0) {
    return { error: "This listing has an invalid price. Contact the seller." };
  }

  const reference = (input.paymentReference ?? "").trim();
  const paid = total > 0 && reference.length > 0;
  const supabase = await createClient();

  if (paid) {
    const verification = await verifyPaystackTransaction(reference);
    if (!verification.data) {
      return { error: verification.error ?? "We could not verify that payment." };
    }

    const payment = verification.data;
    if (payment.status !== "success") {
      return {
        error:
          "That payment has not completed yet. If you were charged, wait a moment and try again.",
      };
    }
    if (payment.currency && payment.currency !== "NGN") {
      return { error: "That payment was not made in naira (NGN)." };
    }

    const expectedKobo = Math.round(total * 100);
    if (payment.amountKobo < expectedKobo) {
      return {
        error: "The payment amount does not match this order. Refresh and try again.",
      };
    }

    const metadataBuyerId =
      typeof payment.metadata?.buyer_id === "string"
        ? payment.metadata.buyer_id
        : null;
    if (metadataBuyerId && metadataBuyerId !== user.id) {
      return { error: "That payment belongs to a different account." };
    }

    const paymentEmail = payment.customerEmail?.trim().toLowerCase();
    if (!metadataBuyerId && paymentEmail && paymentEmail !== email.toLowerCase()) {
      return {
        error:
          "That payment was made with a different email address. Use the email you paid with or contact support.",
      };
    }

    const metadataListingId = Number(payment.metadata?.listing_id);
    if (Number.isInteger(metadataListingId) && metadataListingId !== input.listingId) {
      return { error: "That payment was made for a different listing." };
    }

    // A lost response from an earlier attempt must return the existing order
    // instead of asking the buyer to pay again.
    const { data: existing } = await supabase
      .from("orders")
      .select("id, buyer_id")
      .eq("payment_reference", reference)
      .limit(1)
      .maybeSingle();

    if (existing) {
      if (existing.buyer_id === user.id) return { orderId: existing.id };
      return { error: "That payment has already been used for an order." };
    }
  }

  const profile = await getProfile();
  const buyerName =
    profile?.username?.trim() ||
    (typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "") ||
    user.email?.split("@")[0] ||
    "Buyer";

  const noteParts = [
    fulfillment === "delivery" ? "Delivery requested" : "Campus pickup requested",
  ];
  if (notes) noteParts.push(notes);

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      product_id: listing.productId,
      product_name: listing.title,
      product_image_url: listing.images[0] ?? null,
      product_price: String(listing.price),
      buyer_id: user.id,
      buyer_name: buyerName,
      seller_id: listing.sellerId,
      seller_name: listing.seller.name,
      store_id: listing.storeId,
      store_name: listing.storeName,
      status: paid ? "paid" : "pending",
      quantity,
      notes: noteParts.join(" · ").slice(0, 1000),
      payment_reference: paid ? reference : null,
      payment_status: paid ? "paid" : null,
      payment_amount: paid ? total.toFixed(2) : null,
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      error: error ? friendlyDbError(error.message) : "Could not place your order.",
    };
  }

  if (paid) {
    const { error: receiptError } = await supabase.from("payment_receipts").insert({
      order_id: data.id,
      reference,
      amount: total.toFixed(2),
      email,
      status: "paid",
      created_at: now,
    });

    // The order is already paid; a missing receipt must not hide that fact.
    if (receiptError) {
      console.error("Failed to store payment receipt", receiptError.message);
    }
  }

  revalidateOrderPaths(data.id);
  return { orderId: data.id };
}

/** Records a Paystack payment against an existing unpaid order. */
export async function payOrderAction(
  orderId: number,
  reference: string,
): Promise<OrderState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to pay for this order." };
  if (!isValidId(orderId)) return { error: "Order not found." };

  const trimmed = (reference ?? "").trim();
  if (trimmed.length < 4 || trimmed.length > 120) {
    return { error: "That payment reference is not valid." };
  }

  const supabase = await createClient();
  const { data: order, error: readError } = await supabase
    .from("orders")
    .select(
      "id, buyer_id, status, product_price, quantity, payment_reference, payment_status",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (readError) return { error: "Could not load that order." };
  if (!order) return { error: "Order not found." };
  if (order.buyer_id !== user.id) {
    return { error: "Only the buyer can pay for this order." };
  }

  if (order.payment_reference === trimmed && order.payment_status === "paid") {
    return { success: "Payment confirmed.", paid: true };
  }
  if (CLOSED_STATUSES.has(order.status)) {
    return { error: "This order is closed and cannot be paid online." };
  }
  if (order.payment_reference || order.payment_status === "paid") {
    return { error: "This order has already been paid." };
  }
  if (order.status !== "pending" && order.status !== "accepted") {
    return { error: "This order cannot be paid online right now." };
  }

  const price = Number.parseFloat((order.product_price ?? "").replace(/,/g, ""));
  const total = price * Math.max(1, order.quantity || 1);
  if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(total) || total <= 0) {
    return { error: "This order has no payable amount. Contact the seller." };
  }

  const verification = await verifyPaystackTransaction(trimmed);
  if (!verification.data) {
    return { error: verification.error ?? "We could not verify that payment." };
  }

  const payment = verification.data;
  if (payment.status !== "success") {
    return {
      error:
        "That payment has not completed yet. If you were charged, wait a moment and try again.",
    };
  }
  if (payment.currency && payment.currency !== "NGN") {
    return { error: "That payment was not made in naira (NGN)." };
  }
  if (payment.amountKobo < Math.round(total * 100)) {
    return {
      error: "The payment amount does not match this order. Refresh and try again.",
    };
  }

  const metadataBuyerId =
    typeof payment.metadata?.buyer_id === "string"
      ? payment.metadata.buyer_id
      : null;
  if (metadataBuyerId && metadataBuyerId !== user.id) {
    return { error: "That payment belongs to a different account." };
  }

  if (!metadataBuyerId) {
    const profile = await getProfile();
    const expectedEmail = (
      profile?.student_email?.trim() ||
      user.email?.trim() ||
      ""
    ).toLowerCase();
    const paymentEmail = payment.customerEmail?.trim().toLowerCase() ?? "";

    if (!expectedEmail || !paymentEmail || paymentEmail !== expectedEmail) {
      return {
        error:
          "That payment was made with a different email address. Use the email on your square account or contact support.",
      };
    }
  }

  const metadataOrderId = Number(payment.metadata?.order_id);
  if (Number.isInteger(metadataOrderId) && metadataOrderId !== orderId) {
    return { error: "That payment was made for a different order." };
  }

  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("payment_reference", trimmed)
    .neq("id", orderId)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return { error: "That payment has already been used for an order." };
  }

  const now = new Date().toISOString();
  const nextStatus = order.status === "accepted" ? "accepted" : "paid";
  const { data: updated, error: updateError } = await supabase
    .from("orders")
    .update({
      status: nextStatus,
      payment_reference: trimmed,
      payment_status: "paid",
      payment_amount: total.toFixed(2),
      updated_at: now,
    })
    .eq("id", orderId)
    .select("id")
    .maybeSingle();

  if (updateError) return { error: friendlyDbError(updateError.message) };
  if (!updated) {
    return {
      error:
        "The payment could not be recorded. Do not pay again — keep your reference and retry confirmation, or contact support with it.",
    };
  }

  const receiptEmail = payment.customerEmail?.trim() || user.email?.trim() || "";
  if (receiptEmail) {
    const { error: receiptError } = await supabase.from("payment_receipts").insert({
      order_id: orderId,
      reference: trimmed,
      amount: total.toFixed(2),
      email: receiptEmail,
      status: "paid",
      created_at: now,
    });

    if (receiptError) {
      console.error("Failed to store payment receipt", receiptError.message);
    }
  }

  revalidateOrderPaths(orderId);
  return { success: "Payment confirmed.", paid: true };
}

export async function updateOrderStatusAction(
  orderId: number,
  nextStatus: string,
): Promise<OrderState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to manage orders." };
  if (!isValidId(orderId)) return { error: "Order not found." };
  if (!SELLER_STATUSES.has(nextStatus)) return { error: "That status is not allowed." };

  const supabase = await createClient();
  const { data: order, error: readError } = await supabase
    .from("orders")
    .select("id, buyer_id, seller_id, status")
    .eq("id", orderId)
    .maybeSingle();

  if (readError) return { error: "Could not load that order." };
  if (!order) return { error: "Order not found." };

  const isSeller = order.seller_id === user.id;
  const isBuyer = order.buyer_id === user.id;
  if (!isSeller && !isBuyer) return { error: "Order not found." };
  if (CLOSED_STATUSES.has(order.status)) return { error: "This order is already closed." };

  if (isBuyer && !isSeller) {
    if (nextStatus !== "cancelled" || order.status !== "pending") {
      return { error: "You can only cancel an order while it is still pending." };
    }
  }

  if (isSeller) {
    const canAccept = order.status === "pending" || order.status === "paid";
    const canCancel = canAccept || order.status === "accepted";

    if (nextStatus === "accepted" && !canAccept) {
      return { error: "Only a new or paid order can be accepted." };
    }
    if (nextStatus === "declined" && !canAccept) {
      return { error: "Only a new or paid order can be declined." };
    }
    if (nextStatus === "cancelled" && !canCancel) {
      return { error: "This order cannot be cancelled now." };
    }
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select("id")
    .maybeSingle();

  if (error) return { error: friendlyDbError(error.message) };
  if (!data) {
    return {
      error:
        "The order status did not change. This usually means the database still restricts order updates.",
    };
  }

  revalidateOrderPaths(orderId);
  return { success: "Order updated." };
}

/** The buyer's final step: confirm receipt and complete the order. */
export async function confirmOrderReceivedAction(
  orderId: number,
): Promise<OrderState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to confirm this order." };
  if (!isValidId(orderId)) return { error: "Order not found." };

  const supabase = await createClient();
  const { data: order, error: readError } = await supabase
    .from("orders")
    .select("id, buyer_id, status, buyer_confirmed_at")
    .eq("id", orderId)
    .maybeSingle();

  if (readError) return { error: "Could not load that order." };
  if (!order) return { error: "Order not found." };
  if (order.buyer_id !== user.id) {
    return { error: "Only the buyer can confirm receipt of this order." };
  }
  if (CLOSED_STATUSES.has(order.status)) {
    if (order.status === "completed") return { success: "Order already completed." };
    return { error: "This order is closed." };
  }
  if (order.status !== "accepted") {
    return { error: "Wait for the seller to accept the order before confirming receipt." };
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "completed",
      buyer_confirmed_at: order.buyer_confirmed_at ?? now,
      updated_at: now,
    })
    .eq("id", orderId)
    .select("id")
    .maybeSingle();

  if (error) return { error: friendlyDbError(error.message) };
  if (!data) {
    return {
      error:
        "The order could not be completed. Refresh the page and try again, or contact support.",
    };
  }

  revalidateOrderPaths(orderId);
  return { success: "Order completed. Thanks for confirming!" };
}
