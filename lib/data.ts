import type { Database } from "@/lib/database.types";
import { getSupabaseClient } from "@/lib/supabase";
import type { Category, Condition, Listing, Seller } from "@/types";

type ProductRow = Database["public"]["Tables"]["test_products"]["Row"];
type StoreRow = Database["public"]["Tables"]["test_stores"]["Row"];

const categoryMap: Record<string, Category> = {
  textbooks: "textbooks",
  electronics: "electronics",
  appliances: "electronics",
  games: "electronics",
  gaming: "electronics",
  utility: "electronics",
  furniture: "furniture",
  clothing: "clothing",
  fashion: "clothing",
  tickets: "tickets",
  beauty: "beauty",
  confectionery: "food",
  food: "food",
  foodloc: "food",
  groceries: "food",
};

export function mapCategory(value: string | null): Category {
  return categoryMap[value?.trim().toLowerCase() ?? ""] ?? "other";
}

function mapCondition(value: string | null): Condition {
  const normalized = value?.trim().toLowerCase() ?? "";
  if (normalized === "new" || normalized === "brand new") return "new";
  if (normalized.includes("like")) return "like-new";
  if (normalized === "good") return "good";
  if (normalized === "fair") return "fair";
  return "unknown";
}

function imageUrls(value: ProductRow["image_urls"]): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") return [value];
  return [];
}

function mapSeller(product: ProductRow, store?: StoreRow): Seller {
  const rating = Number(product.rating ?? 0);
  return {
    id: product.store_id ? String(product.store_id) : `seller-${product.id}`,
    name: store?.name ?? product.store_name ?? "Local seller",
    campus: product.location ?? store?.location ?? "Near campus",
    rating: Number.isFinite(rating) && rating > 0 ? rating : null,
  };
}

function mapListing(product: ProductRow, store?: StoreRow): Listing | null {
  if (product.status !== "approved" || product.is_blocked) return null;
  if ((product.stock ?? 1) <= 0) return null;

  const price = Number(product.price ?? 0);
  if (!Number.isFinite(price)) return null;

  const storeName =
    store?.name?.trim() || product.store_name?.trim() || "Local seller";

  return {
    id: String(product.id),
    productId: product.id,
    title: product.name?.trim() || "Untitled listing",
    description: product.description?.trim() || "No description provided.",
    price,
    category: mapCategory(product.category),
    condition: mapCondition(product.condition),
    location: product.location ?? store?.location ?? "Near campus",
    createdAt: product.created_at.slice(0, 10),
    images: imageUrls(product.image_urls),
    seller: mapSeller(product, store),
    storeId: product.store_id,
    sellerId: store?.owner_uid ?? store?.owner_id ?? null,
    storeName,
    storeLogoUrl: store?.logo_url ?? null,
    stock: product.stock ?? null,
    status: product.status ?? "pending",
    isBlocked: Boolean(product.is_blocked),
  };
}

/** Live, read-only listings from the existing Biz Link marketplace tables. */
export async function getListings(): Promise<Listing[]> {
  const supabase = getSupabaseClient();

  const [productsResult, storesResult] = await Promise.all([
    supabase
      .from("test_products")
      .select("*")
      .eq("status", "approved")
      .eq("is_blocked", false)
      .order("created_at", { ascending: false }),
    supabase.from("test_stores").select("*"),
  ]);

  if (productsResult.error) {
    throw new Error(`Could not load listings: ${productsResult.error.message}`);
  }
  if (storesResult.error) {
    throw new Error(`Could not load sellers: ${storesResult.error.message}`);
  }

  const stores = new Map(
    (storesResult.data ?? []).map((store) => [store.id, store]),
  );

  return (productsResult.data ?? [])
    .map((product) => mapListing(product, stores.get(product.store_id ?? -1)))
    .filter((listing): listing is Listing => listing !== null);
}

export async function getListing(id: string): Promise<Listing | null> {
  if (!/^\d+$/.test(id)) return null;
  const listings = await getListings();
  return listings.find((listing) => listing.id === id) ?? null;
}
