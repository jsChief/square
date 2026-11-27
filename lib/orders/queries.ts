import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
export type ReceiptRow = Database["public"]["Tables"]["payment_receipts"]["Row"];

export async function getOrderById(orderId: number): Promise<OrderRow | null> {
  if (!Number.isInteger(orderId) || orderId <= 0) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  return error ? null : data;
}

export async function getOrderReceipts(orderId: number): Promise<ReceiptRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payment_receipts")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  return error ? [] : data ?? [];
}

/** Orders bought by this user. Sales live in the seller dashboard. */
export async function getBuyerOrders(userId: string): Promise<OrderRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false });

  return error ? [] : data ?? [];
}

export function orderTotal(order: Pick<OrderRow, "product_price" | "quantity">) {
  const price = Number.parseFloat((order.product_price ?? "").replace(/,/g, ""));
  if (!Number.isFinite(price)) return 0;
  return price * Math.max(1, order.quantity || 1);
}

export function isOrderPaid(order: Pick<OrderRow, "payment_status" | "payment_reference">) {
  return order.payment_status === "paid" || Boolean(order.payment_reference);
}
