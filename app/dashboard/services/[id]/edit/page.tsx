import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceForm } from "@/components/dashboard/service-form";
import { PageHeader } from "@/components/dashboard/ui";
import { requireUser } from "@/lib/auth/session";
import {
  getSellerServiceById,
  getSellerStores,
  jsonList,
} from "@/lib/seller/queries";

export const metadata: Metadata = {
  title: "Edit service — square",
  description: "Update one of your services.",
};

export const dynamic = "force-dynamic";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const serviceId = Number(id);
  if (!Number.isInteger(serviceId)) notFound();

  const user = await requireUser(`/dashboard/services/${id}/edit`);
  const [service, stores] = await Promise.all([
    getSellerServiceById(user.id, serviceId),
    getSellerStores(user.id),
  ]);
  if (!service) notFound();

  return (
    <>
      <PageHeader
        title="Edit service"
        description="Keep your service details accurate for buyers."
      />
      <ServiceForm
        values={{
          id: service.id,
          storeId: service.store_id,
          name: service.name?.trim() || "",
          category: service.category?.trim() || "",
          description: service.description?.trim() || "",
          ownerWhatsapp: service.owner_whatsapp?.trim() || "",
          imageUrls: jsonList(service.image_urls),
          tags: jsonList(service.tags),
        }}
        stores={stores.map((store) => ({
          id: store.id,
          name: store.name?.trim() || "Untitled store",
        }))}
      />
    </>
  );
}
