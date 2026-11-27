import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingForm } from "@/components/dashboard/listing-form";
import { PageHeader } from "@/components/dashboard/ui";
import { requireUser } from "@/lib/auth/session";
import { mapCategory } from "@/lib/data";
import {
  getSellerProductById,
  getSellerStores,
  jsonList,
} from "@/lib/seller/queries";

export const metadata: Metadata = {
  title: "Edit listing — square",
  description: "Update one of your listings.",
};

export const dynamic = "force-dynamic";

const conditions = ["new", "like-new", "good", "fair", "unknown"];

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listingId = Number(id);
  if (!Number.isInteger(listingId)) notFound();

  const user = await requireUser(`/dashboard/listings/${id}/edit`);
  const [product, stores] = await Promise.all([
    getSellerProductById(user.id, listingId),
    getSellerStores(user.id),
  ]);
  if (!product) notFound();

  const rawCondition = product.condition?.trim().toLowerCase() ?? "unknown";
  const condition = conditions.includes(rawCondition) ? rawCondition : "unknown";

  return (
    <>
      <PageHeader
        title="Edit listing"
        description="Update the details buyers see. Review status stays with moderators."
      />
      <ListingForm
        values={{
          id: product.id,
          storeId: product.store_id,
          name: product.name?.trim() || "",
          category: mapCategory(product.category),
          condition,
          price: product.price?.replace(/,/g, "") ?? "",
          stock: product.stock ?? 0,
          location: product.location?.trim() || "",
          description: product.description?.trim() || "",
          imageUrls: jsonList(product.image_urls),
        }}
        stores={stores.map((store) => ({
          id: store.id,
          name: store.name?.trim() || "Untitled store",
        }))}
      />
    </>
  );
}
