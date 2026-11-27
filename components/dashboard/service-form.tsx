"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { useActionState } from "react";
import {
  createService,
  updateService,
  type SellerActionState,
} from "@/lib/seller/actions";
import { cn } from "@/lib/utils";
import { ActionError, FormField, inputClass } from "./form-controls";

export interface ServiceFormValues {
  id?: number;
  storeId: number | null;
  name: string;
  category: string;
  description: string;
  ownerWhatsapp: string;
  imageUrls: string;
  tags: string;
}

const initialState: SellerActionState = {};

export function ServiceForm({
  values,
  stores,
}: {
  values: ServiceFormValues;
  stores: { id: number; name: string }[];
}) {
  const action = values.id ? updateService : createService;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className="mt-7 rounded-2xl border border-line bg-surface p-5 sm:p-7"
    >
      {values.id && <input type="hidden" name="id" value={values.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="service-name"
          label="Service name"
          error={state.error?.includes("service name") ? state.error : undefined}
          className="sm:col-span-2"
        >
          <input
            id="service-name"
            name="name"
            required
            maxLength={160}
            defaultValue={values.name}
            placeholder="e.g. Maths tutoring"
            className={inputClass}
          />
        </FormField>

        <FormField id="service-store" label="Store">
          <select
            id="service-store"
            name="store_id"
            required
            defaultValue={values.storeId ?? ""}
            className={inputClass}
            disabled={stores.length === 0}
          >
            {stores.length === 0 ? (
              <option value="">Create a store first</option>
            ) : (
              stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))
            )}
          </select>
        </FormField>

        <FormField id="service-category" label="Category">
          <input
            id="service-category"
            name="category"
            maxLength={80}
            defaultValue={values.category}
            placeholder="e.g. Tutoring"
            className={inputClass}
          />
        </FormField>

        <FormField id="service-whatsapp" label="WhatsApp number">
          <input
            id="service-whatsapp"
            name="owner_whatsapp"
            type="tel"
            maxLength={40}
            defaultValue={values.ownerWhatsapp}
            placeholder="e.g. +234 800 000 0000"
            className={inputClass}
          />
        </FormField>

        <FormField id="service-tags" label="Tags" hint="Separate tags with commas.">
          <input
            id="service-tags"
            name="tags"
            defaultValue={values.tags}
            placeholder="tutoring, exams, weekend"
            className={inputClass}
          />
        </FormField>

        <FormField
          id="service-description"
          label="Description"
          className="sm:col-span-2"
        >
          <textarea
            id="service-description"
            name="description"
            rows={5}
            maxLength={4000}
            defaultValue={values.description}
            placeholder="Explain what you offer and how buyers can book you."
            className={cn(inputClass, "resize-y")}
          />
        </FormField>

        <FormField
          id="service-images"
          label="Image URLs"
          hint="Optional. One URL per line, or separate with commas."
          className="sm:col-span-2"
        >
          <textarea
            id="service-images"
            name="image_urls"
            rows={2}
            defaultValue={values.imageUrls}
            placeholder="https://…"
            className={cn(inputClass, "resize-y")}
          />
        </FormField>
      </div>

      <ActionError
        message={
          state.error && !state.error.includes("service name") ? state.error : undefined
        }
      />

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || stores.length === 0}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending && (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          )}
          {pending ? "Saving…" : values.id ? "Save service" : "Create service"}
        </button>
        <Link
          href="/dashboard/services"
          className="rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          Cancel
        </Link>
        {stores.length === 0 && (
          <Link href="/dashboard/stores/new" className="text-sm font-medium text-accent hover:underline">
            Add a store
          </Link>
        )}
      </div>
    </form>
  );
}
