import type { Metadata } from "next";
import { ServiceForm } from "@/components/dashboard/service-form";
import { PageHeader } from "@/components/dashboard/ui";
import { requireUser } from "@/lib/auth/session";
import { getSellerStores } from "@/lib/seller/queries";

export const metadata: Metadata = {
  title: "New service — square",
  description: "Add a service to one of your stores.",
};

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  const user = await requireUser("/dashboard/services/new");
  const stores = await getSellerStores(user.id);

  return (
    <>
      <PageHeader
        title="New service"
        description="Offer tutoring, repairs, or anything else your store can do."
      />
      <ServiceForm
        values={{
          storeId: stores[0]?.id ?? null,
          name: "",
          category: "",
          description: "",
          ownerWhatsapp: "",
          imageUrls: "",
          tags: "",
        }}
        stores={stores.map((store) => ({
          id: store.id,
          name: store.name?.trim() || "Untitled store",
        }))}
      />
    </>
  );
}
