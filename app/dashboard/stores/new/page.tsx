import type { Metadata } from "next";
import { StoreForm } from "@/components/dashboard/store-form";
import { PageHeader } from "@/components/dashboard/ui";

export const metadata: Metadata = {
  title: "New store — square",
  description: "Create a storefront for your listings and services.",
};

export default function NewStorePage() {
  return (
    <>
      <PageHeader
        title="New store"
        description="Set up the storefront that will hold your listings and services."
      />
      <StoreForm
        values={{
          name: "",
          tagLine: "",
          category: "",
          location: "",
          details: "",
          phone: "",
          whatsapp: "",
          link: "",
          logoUrl: "",
          tags: "",
        }}
      />
    </>
  );
}
