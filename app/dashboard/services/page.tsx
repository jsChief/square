import type { Metadata } from "next";
import Image from "next/image";
import { MessageCircle, Sparkles, Wrench } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import {
  firstImage,
  getSellerServices,
  getSellerStores,
} from "@/lib/seller/queries";
import {
  EmptyState,
  PageHeader,
  ServiceStatusBadge,
  formatDate,
} from "@/components/dashboard/ui";

export const metadata: Metadata = {
  title: "Your services — square",
  description: "Services offered by your stores.",
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const user = await requireUser("/dashboard/services");
  const stores = await getSellerStores(user.id);
  const services = await getSellerServices(stores.map((store) => store.id));
  const storeName = new Map(stores.map((store) => [store.id, store.name]));

  return (
    <>
      <PageHeader
        title="Services"
        description="What your stores offer beyond products."
      />

      {services.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Wrench}
            title="No services yet"
            message="Services you offer — tutoring, repairs, and more — will appear here."
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {services.map((service) => {
            const image = firstImage(service.image_urls);
            const whatsapp = service.owner_whatsapp?.replace(/[^\d]/g, "") ?? "";
            return (
              <div
                key={service.id}
                className="flex gap-4 rounded-2xl border border-line bg-surface p-4"
              >
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-line bg-background">
                  {image ? (
                    <Image
                      src={image}
                      alt={service.name ?? "Service"}
                      fill
                      unoptimized
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <Wrench
                      className="absolute inset-0 m-auto size-6 text-muted"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-medium">
                      {service.name?.trim() || "Untitled service"}
                    </span>
                    <ServiceStatusBadge status={service.status} />
                    {service.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
                        <Sparkles className="size-3" aria-hidden="true" />
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {service.category?.trim() || "General"} ·{" "}
                    {storeName.get(service.store_id ?? -1) ?? "Your store"} ·{" "}
                    {formatDate(service.created_at)}
                  </p>
                  {service.description?.trim() && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
                      {service.description.trim()}
                    </p>
                  )}
                  {whatsapp && (
                    <a
                      href={`https://wa.me/${whatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
                    >
                      <MessageCircle className="size-3.5" aria-hidden="true" />
                      Contact on WhatsApp
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
