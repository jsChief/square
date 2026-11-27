import type { Database, Json } from "@/lib/database.types";
import { mapCategory } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { isOrderPaid, orderTotal, type OrderRow } from "@/lib/orders/queries";
import { categoryLabels } from "@/lib/utils";
import type { Category } from "@/types";

export type StoreRow = Database["public"]["Tables"]["test_stores"]["Row"];
export type ProductRow = Database["public"]["Tables"]["test_products"]["Row"];
export type StoreReviewRow = Database["public"]["Tables"]["store_reviews"]["Row"];
export type ServiceRow = Database["public"]["Tables"]["test_services"]["Row"];

/** Stores owned by this auth user, matched on either owner column. */
export async function getSellerStores(userId: string): Promise<StoreRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("test_stores")
    .select("*")
    .or(`owner_uid.eq.${userId},owner_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  return error ? [] : data ?? [];
}

/**
 * Every product across the seller's stores, including non-live rows so the
 * dashboard can surface pending, rejected, and blocked listings. RLS may
 * already scope this; we constrain by store id regardless.
 */
export async function getSellerProducts(
  storeIds: number[],
): Promise<ProductRow[]> {
  if (storeIds.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("test_products")
    .select("*")
    .in("store_id", storeIds)
    .order("created_at", { ascending: false });

  return error ? [] : data ?? [];
}

/** Orders where this user is the seller. */
export async function getSellerOrders(userId: string): Promise<OrderRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("seller_id", userId)
    .order("created_at", { ascending: false });

  return error ? [] : data ?? [];
}

/** Reviews left on any of the seller's stores. */
export async function getStoreReviews(
  storeIds: number[],
): Promise<StoreReviewRow[]> {
  if (storeIds.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("store_reviews")
    .select("*")
    .in("store_id", storeIds)
    .order("created_at", { ascending: false });

  return error ? [] : data ?? [];
}

export function isListingLive(product: ProductRow): boolean {
  return (
    product.status === "approved" &&
    !product.is_blocked &&
    (product.stock ?? 1) > 0
  );
}

/** Revenue counts orders that are paid and not cancelled or declined. */
export function sellerRevenue(orders: OrderRow[]): number {
  return orders.reduce((sum, order) => {
    if (order.status === "cancelled" || order.status === "declined") return sum;
    if (!isOrderPaid(order)) return sum;
    return sum + orderTotal(order);
  }, 0);
}

/** Orders still waiting on the seller: new (pending) or paid, not yet accepted. */
export function ordersNeedingAction(orders: OrderRow[]): OrderRow[] {
  return orders.filter(
    (order) => order.status === "pending" || order.status === "paid",
  );
}

export function averageRating(reviews: StoreReviewRow[]): number | null {
  const scored = reviews
    .map((review) => review.rating)
    .filter((rating): rating is number => typeof rating === "number");
  if (scored.length === 0) return null;
  return scored.reduce((sum, rating) => sum + rating, 0) / scored.length;
}

/** Services offered across the seller's stores. */
export async function getSellerServices(
  storeIds: number[],
): Promise<ServiceRow[]> {
  if (storeIds.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("test_services")
    .select("*")
    .in("store_id", storeIds)
    .order("created_at", { ascending: false });

  return error ? [] : data ?? [];
}

export async function getSellerStoreById(
  userId: string,
  id: number,
): Promise<StoreRow | null> {
  const stores = await getSellerStores(userId);
  return stores.find((store) => store.id === id) ?? null;
}

export async function getSellerProductById(
  userId: string,
  id: number,
): Promise<ProductRow | null> {
  const stores = await getSellerStores(userId);
  if (stores.length === 0) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("test_products")
    .select("*")
    .eq("id", id)
    .in("store_id", stores.map((store) => store.id))
    .maybeSingle();

  return data ?? null;
}

export async function getSellerServiceById(
  userId: string,
  id: number,
): Promise<ServiceRow | null> {
  const stores = await getSellerStores(userId);
  if (stores.length === 0) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("test_services")
    .select("*")
    .eq("id", id)
    .in("store_id", stores.map((store) => store.id))
    .maybeSingle();

  return data ?? null;
}

export function firstImage(value: Json | null): string | null {
  if (Array.isArray(value)) {
    return value.find((item): item is string => typeof item === "string") ?? null;
  }
  if (typeof value === "string") return value;
  return null;
}

/** Form-friendly representation of a JSON string/array column. */
export function jsonList(value: Json | null): string {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string").join(", ");
  }
  return typeof value === "string" ? value : "";
}

export function productPrice(value: ProductRow["price"]): number {
  const price = Number.parseFloat((value ?? "").replace(/,/g, ""));
  return Number.isFinite(price) ? price : 0;
}

export type ChartPoint = { label: string; value: number };

/** Paid, non-cancelled revenue bucketed into the last `months` months. */
export function revenueByMonth(orders: OrderRow[], months = 6): ChartPoint[] {
  const now = new Date();
  const buckets = Array.from({ length: months }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      label: date.toLocaleDateString("en-NG", { month: "short" }),
      value: 0,
    };
  });
  const index = new Map(buckets.map((b, i) => [`${b.year}-${b.month}`, i]));

  for (const order of orders) {
    if (order.status === "cancelled" || order.status === "declined") continue;
    if (!isOrderPaid(order)) continue;
    const date = new Date(order.created_at);
    if (Number.isNaN(date.getTime())) continue;
    const bucket = index.get(`${date.getFullYear()}-${date.getMonth()}`);
    if (bucket !== undefined) buckets[bucket].value += orderTotal(order);
  }

  return buckets.map(({ label, value }) => ({ label, value }));
}

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "accepted",
  "completed",
  "cancelled",
  "declined",
] as const;

export function ordersByStatus(
  orders: OrderRow[],
): { status: string; count: number }[] {
  return ORDER_STATUSES.map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length,
  }));
}

export function listingsByCategory(products: ProductRow[]): ChartPoint[] {
  const counts = new Map<Category, number>();
  for (const product of products) {
    const category = mapCategory(product.category);
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([category, value]) => ({ label: categoryLabels[category], value }))
    .sort((a, b) => b.value - a.value);
}

export function listingStatusCounts(products: ProductRow[]) {
  let live = 0;
  let pending = 0;
  let rejected = 0;
  let blocked = 0;
  let soldOut = 0;
  for (const product of products) {
    if (product.is_blocked) {
      blocked += 1;
      continue;
    }
    if (product.status === "rejected") {
      rejected += 1;
      continue;
    }
    if (product.status === "approved") {
      if ((product.stock ?? 0) > 0) live += 1;
      else soldOut += 1;
      continue;
    }
    pending += 1;
  }
  return { live, pending, rejected, blocked, soldOut };
}

export function ratingDistribution(reviews: StoreReviewRow[]): ChartPoint[] {
  const buckets = [5, 4, 3, 2, 1].map((star) => ({ star, value: 0 }));
  for (const review of reviews) {
    if (typeof review.rating !== "number") continue;
    const rounded = Math.max(1, Math.min(5, Math.round(review.rating)));
    const bucket = buckets.find((b) => b.star === rounded);
    if (bucket) bucket.value += 1;
  }
  return buckets.map(({ star, value }) => ({ label: `${star}`, value }));
}
