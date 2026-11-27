"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import type { Json } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import { getSellerStores } from "./queries";

export interface SellerActionState {
  error?: string;
}

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optional(value: string, maxLength: number): string | null {
  return value.length > 0 ? value.slice(0, maxLength) : null;
}

function numberField(formData: FormData, key: string) {
  const value = Number(text(formData, key));
  return Number.isFinite(value) && value > 0 ? Math.trunc(value) : null;
}

function stockField(formData: FormData) {
  const value = Number(text(formData, "stock"));
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.trunc(value);
}

function priceField(formData: FormData) {
  const value = Number(text(formData, "price").replace(/,/g, ""));
  return Number.isFinite(value) && value >= 0 ? value.toFixed(2) : null;
}

function splitList(value: string, maxItems: number): Json {
  const items = value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems);
  return items.length > 0 ? items : null;
}

function revalidateSellerPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/listings");
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard/stores");
  revalidatePath("/listings");
}

async function ownedStoreIds(userId: string) {
  const stores = await getSellerStores(userId);
  return stores.map((store) => store.id);
}

/* ---------------------------------- Stores --------------------------------- */

export async function createStore(
  _previous: SellerActionState,
  formData: FormData,
): Promise<SellerActionState> {
  const user = await requireUser("/dashboard/stores");
  const name = text(formData, "name");

  if (!name) return { error: "Enter a store name." };
  if (name.length > 120) return { error: "Store name must be 120 characters or fewer." };

  const supabase = await createClient();
  const { error } = await supabase.from("test_stores").insert({
    name,
    tag_line: optional(text(formData, "tag_line"), 160),
    category: optional(text(formData, "category"), 80),
    location: optional(text(formData, "location"), 160),
    details: optional(text(formData, "details"), 2000),
    phone: optional(text(formData, "phone"), 40),
    whatsapp_number: optional(text(formData, "whatsapp_number"), 40),
    link: optional(text(formData, "link"), 300),
    logo_url: optional(text(formData, "logo_url"), 500),
    tags: optional(text(formData, "tags"), 300),
    owner_id: user.id,
    owner_uid: user.id,
  });

  if (error) return { error: "We couldn't create your store. Try again." };

  revalidateSellerPaths();
  redirect("/dashboard/stores?saved=created");
}

export async function updateStore(
  _previous: SellerActionState,
  formData: FormData,
): Promise<SellerActionState> {
  const user = await requireUser("/dashboard/stores");
  const id = numberField(formData, "id");
  const name = text(formData, "name");

  if (!id) return { error: "That store could not be found." };
  if (!name) return { error: "Enter a store name." };
  if (name.length > 120) return { error: "Store name must be 120 characters or fewer." };

  const storeIds = await ownedStoreIds(user.id);
  if (!storeIds.includes(id)) return { error: "You don't manage that store." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("test_stores")
    .update({
      name,
      tag_line: optional(text(formData, "tag_line"), 160),
      category: optional(text(formData, "category"), 80),
      location: optional(text(formData, "location"), 160),
      details: optional(text(formData, "details"), 2000),
      phone: optional(text(formData, "phone"), 40),
      whatsapp_number: optional(text(formData, "whatsapp_number"), 40),
      link: optional(text(formData, "link"), 300),
      logo_url: optional(text(formData, "logo_url"), 500),
      tags: optional(text(formData, "tags"), 300),
    })
    .eq("id", id);

  if (error) return { error: "We couldn't update your store. Try again." };

  revalidateSellerPaths();
  redirect("/dashboard/stores?saved=updated");
}

export async function deleteStore(
  _previous: SellerActionState,
  formData: FormData,
): Promise<SellerActionState> {
  const user = await requireUser("/dashboard/stores");
  const id = numberField(formData, "id");
  if (!id) return { error: "That store could not be found." };

  const storeIds = await ownedStoreIds(user.id);
  if (!storeIds.includes(id)) return { error: "You don't manage that store." };

  const supabase = await createClient();
  const [products, services] = await Promise.all([
    supabase.from("test_products").select("id").eq("store_id", id).limit(1),
    supabase.from("test_services").select("id").eq("store_id", id).limit(1),
  ]);

  if (products.error || services.error) {
    return { error: "We couldn't check that store's content. Try again." };
  }
  if (products.data?.length || services.data?.length) {
    return {
      error: "Move or delete this store's listings and services before deleting it.",
    };
  }

  const { error } = await supabase.from("test_stores").delete().eq("id", id);
  if (error) return { error: "We couldn't delete your store. Try again." };

  revalidateSellerPaths();
  redirect("/dashboard/stores?saved=deleted");
}

/* --------------------------------- Listings -------------------------------- */

export async function createListing(
  _previous: SellerActionState,
  formData: FormData,
): Promise<SellerActionState> {
  const user = await requireUser("/dashboard/listings");
  const storeId = numberField(formData, "store_id");
  const name = text(formData, "name");
  const price = priceField(formData);

  if (!storeId) return { error: "Choose a store for this listing." };
  if (!(await ownedStoreIds(user.id)).includes(storeId)) {
    return { error: "You don't manage that store." };
  }
  if (!name) return { error: "Enter a listing title." };
  if (price === null) return { error: "Enter a valid price." };

  const supabase = await createClient();
  const { error } = await supabase.from("test_products").insert({
    store_id: storeId,
    name,
    category: optional(text(formData, "category"), 80),
    condition: optional(text(formData, "condition"), 40),
    price,
    stock: stockField(formData),
    location: optional(text(formData, "location"), 160),
    description: optional(text(formData, "description"), 4000),
    image_urls: splitList(text(formData, "image_urls"), 8),
    status: "pending",
    featured: false,
  });

  if (error) return { error: "We couldn't create your listing. Try again." };

  revalidateSellerPaths();
  redirect("/dashboard/listings?saved=created");
}

export async function updateListing(
  _previous: SellerActionState,
  formData: FormData,
): Promise<SellerActionState> {
  const user = await requireUser("/dashboard/listings");
  const id = numberField(formData, "id");
  const storeId = numberField(formData, "store_id");
  const name = text(formData, "name");
  const price = priceField(formData);

  if (!id) return { error: "That listing could not be found." };
  if (!storeId) return { error: "Choose a store for this listing." };
  if (!name) return { error: "Enter a listing title." };
  if (price === null) return { error: "Enter a valid price." };

  const storeIds = await ownedStoreIds(user.id);
  if (!storeIds.includes(storeId)) return { error: "You don't manage that store." };

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("test_products")
    .select("id")
    .eq("id", id)
    .in("store_id", storeIds)
    .maybeSingle();

  if (!current) return { error: "You don't manage that listing." };

  const { error } = await supabase
    .from("test_products")
    .update({
      store_id: storeId,
      name,
      category: optional(text(formData, "category"), 80),
      condition: optional(text(formData, "condition"), 40),
      price,
      stock: stockField(formData),
      location: optional(text(formData, "location"), 160),
      description: optional(text(formData, "description"), 4000),
      image_urls: splitList(text(formData, "image_urls"), 8),
    })
    .eq("id", id);

  if (error) return { error: "We couldn't update your listing. Try again." };

  revalidateSellerPaths();
  redirect("/dashboard/listings?saved=updated");
}

export async function deleteListing(
  _previous: SellerActionState,
  formData: FormData,
): Promise<SellerActionState> {
  const user = await requireUser("/dashboard/listings");
  const id = numberField(formData, "id");
  if (!id) return { error: "That listing could not be found." };

  const storeIds = await ownedStoreIds(user.id);
  if (storeIds.length === 0) return { error: "You don't manage that listing." };

  const supabase = await createClient();
  const { data } = await supabase
    .from("test_products")
    .delete()
    .eq("id", id)
    .in("store_id", storeIds)
    .select("id")
    .maybeSingle();

  if (!data) return { error: "You don't manage that listing." };

  revalidateSellerPaths();
  redirect("/dashboard/listings?saved=deleted");
}

/* --------------------------------- Services -------------------------------- */

export async function createService(
  _previous: SellerActionState,
  formData: FormData,
): Promise<SellerActionState> {
  const user = await requireUser("/dashboard/services");
  const storeId = numberField(formData, "store_id");
  const name = text(formData, "name");

  if (!storeId) return { error: "Choose a store for this service." };
  if (!(await ownedStoreIds(user.id)).includes(storeId)) {
    return { error: "You don't manage that store." };
  }
  if (!name) return { error: "Enter a service name." };

  const supabase = await createClient();
  const { error } = await supabase.from("test_services").insert({
    store_id: storeId,
    name,
    category: optional(text(formData, "category"), 80),
    description: optional(text(formData, "description"), 4000),
    owner_whatsapp: optional(text(formData, "owner_whatsapp"), 40),
    image_urls: splitList(text(formData, "image_urls"), 8),
    tags: splitList(text(formData, "tags"), 12),
    status: "pending",
    featured: false,
  });

  if (error) return { error: "We couldn't create your service. Try again." };

  revalidateSellerPaths();
  redirect("/dashboard/services?saved=created");
}

export async function updateService(
  _previous: SellerActionState,
  formData: FormData,
): Promise<SellerActionState> {
  const user = await requireUser("/dashboard/services");
  const id = numberField(formData, "id");
  const storeId = numberField(formData, "store_id");
  const name = text(formData, "name");

  if (!id) return { error: "That service could not be found." };
  if (!storeId) return { error: "Choose a store for this service." };
  if (!name) return { error: "Enter a service name." };

  const storeIds = await ownedStoreIds(user.id);
  if (!storeIds.includes(storeId)) return { error: "You don't manage that store." };

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("test_services")
    .select("id")
    .eq("id", id)
    .in("store_id", storeIds)
    .maybeSingle();

  if (!current) return { error: "You don't manage that service." };

  const { error } = await supabase
    .from("test_services")
    .update({
      store_id: storeId,
      name,
      category: optional(text(formData, "category"), 80),
      description: optional(text(formData, "description"), 4000),
      owner_whatsapp: optional(text(formData, "owner_whatsapp"), 40),
      image_urls: splitList(text(formData, "image_urls"), 8),
      tags: splitList(text(formData, "tags"), 12),
    })
    .eq("id", id);

  if (error) return { error: "We couldn't update your service. Try again." };

  revalidateSellerPaths();
  redirect("/dashboard/services?saved=updated");
}

export async function deleteService(
  _previous: SellerActionState,
  formData: FormData,
): Promise<SellerActionState> {
  const user = await requireUser("/dashboard/services");
  const id = numberField(formData, "id");
  if (!id) return { error: "That service could not be found." };

  const storeIds = await ownedStoreIds(user.id);
  if (storeIds.length === 0) return { error: "You don't manage that service." };

  const supabase = await createClient();
  const { data } = await supabase
    .from("test_services")
    .delete()
    .eq("id", id)
    .in("store_id", storeIds)
    .select("id")
    .maybeSingle();

  if (!data) return { error: "You don't manage that service." };

  revalidateSellerPaths();
  redirect("/dashboard/services?saved=deleted");
}
