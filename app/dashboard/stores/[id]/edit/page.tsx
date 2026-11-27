import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoreForm } from "@/components/dashboard/store-form";
import { PageHeader } from "@/components/dashboard/ui";
import { requireUser } from "@/lib/auth/session";
import { getSellerStoreById } from "@/lib/seller/queries";

export const metadata: Metadata = {
  title: "Edit store — square",
  description: "Update your storefront details.",
};

export const dynamic = "force-dynamic";

export default async function EditStorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const storeId = Number(id);
  if (!Number.isInteger(storeId)) notFound();

  const user = await requireUser(`/dashboard/stores/${id}/edit`);
  const store = await getSellerStoreById(user.id, storeId);
  if (!store) notFound();

  return (
    <>
      <PageHeader
        title="Edit store"
        description="Change how your storefront appears across square."
      />
      <StoreForm
        values={{
          id: store.id,
          name: store.name?.trim() || "",
          tagLine: store.tag_line?.trim() || "",
          category: store.category?.trim() || "",
          location: store.location?.trim() || "",
          details: store.details?.trim() || "",
          phone: store.phone?.trim() || "",
          whatsapp: store.whatsapp_number?.trim() || "",
          link: store.link?.trim() || "",
          logoUrl: store.logo_url?.trim() || "",
          tags: store.tags?.trim() || "",
        }}
      />
    </>
  );
}
