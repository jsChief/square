import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/ui";
import { ListingForm } from "@/components/dashboard/listing-form";
import { requireUser } from "@/lib/auth/session";
import { getSellerStores } from "@/lib/seller/queries";

export const metadata: Metadata = {
  title: "New listing — square",
  description: "Add a new listing to one of your stores.",
};

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const user = await requireUser("/dashboard/listings/new");
  const stores = await getSellerStores(user.id);

  return (
    <>
      <PageHeader
        title="New listing"
        description="Add an item to one of your stores. It will be reviewed before going live."
      />
      <ListingForm
        values={{
          storeId: stores[0]?.id ?? null,
          name: "",
          category: "other",
          condition: "good",
          price: "",
          stock: 1,
          location: "",
          description: "",
          imageUrls: "",
        }}
        stores={stores.map((store) => ({
          id: store.id,
          name: store.name?.trim() || "Untitled store",
        }))}
      />
    </>
  );
}
