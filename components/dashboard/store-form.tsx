"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { useActionState } from "react";
import {
  createStore,
  updateStore,
  type SellerActionState,
} from "@/lib/seller/actions";
import { cn } from "@/lib/utils";
import { ActionError, FormField, inputClass } from "./form-controls";

export interface StoreFormValues {
  id?: number;
  name: string;
  tagLine: string;
  category: string;
  location: string;
  details: string;
  phone: string;
  whatsapp: string;
  link: string;
  logoUrl: string;
  tags: string;
}

const initialState: SellerActionState = {};

export function StoreForm({ values }: { values: StoreFormValues }) {
  const action = values.id ? updateStore : createStore;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className="mt-7 rounded-2xl border border-line bg-surface p-5 sm:p-7"
    >
      {values.id && <input type="hidden" name="id" value={values.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="store-name"
          label="Store name"
          error={state.error?.includes("store name") ? state.error : undefined}
        >
          <input
            id="store-name"
            name="name"
            required
            maxLength={120}
            defaultValue={values.name}
            placeholder="e.g. Campus Corner"
            className={inputClass}
          />
        </FormField>

        <FormField id="store-tagline" label="Tagline">
          <input
            id="store-tagline"
            name="tag_line"
            maxLength={160}
            defaultValue={values.tagLine}
            placeholder="A short line about your store"
            className={inputClass}
          />
        </FormField>

        <FormField id="store-category" label="Category">
          <input
            id="store-category"
            name="category"
            maxLength={80}
            defaultValue={values.category}
            placeholder="e.g. Books and tech"
            className={inputClass}
          />
        </FormField>

        <FormField id="store-location" label="Location">
          <input
            id="store-location"
            name="location"
            maxLength={160}
            defaultValue={values.location}
            placeholder="e.g. Near the main gate"
            className={inputClass}
          />
        </FormField>

        <FormField id="store-phone" label="Phone number">
          <input
            id="store-phone"
            name="phone"
            type="tel"
            maxLength={40}
            defaultValue={values.phone}
            placeholder="e.g. +234 800 000 0000"
            className={inputClass}
          />
        </FormField>

        <FormField id="store-whatsapp" label="WhatsApp number">
          <input
            id="store-whatsapp"
            name="whatsapp_number"
            type="tel"
            maxLength={40}
            defaultValue={values.whatsapp}
            placeholder="e.g. +234 800 000 0000"
            className={inputClass}
          />
        </FormField>

        <FormField id="store-link" label="Website or social link">
          <input
            id="store-link"
            name="link"
            type="url"
            maxLength={300}
            defaultValue={values.link}
            placeholder="https://…"
            className={inputClass}
          />
        </FormField>

        <FormField id="store-logo" label="Logo URL">
          <input
            id="store-logo"
            name="logo_url"
            type="url"
            maxLength={500}
            defaultValue={values.logoUrl}
            placeholder="https://…"
            className={inputClass}
          />
        </FormField>

        <FormField id="store-tags" label="Tags" hint="Separate tags with commas.">
          <input
            id="store-tags"
            name="tags"
            maxLength={300}
            defaultValue={values.tags}
            placeholder="books, tech, pickup"
            className={inputClass}
          />
        </FormField>

        <FormField id="store-details" label="Details" className="sm:col-span-2">
          <textarea
            id="store-details"
            name="details"
            rows={4}
            maxLength={2000}
            defaultValue={values.details}
            placeholder="Tell buyers what your store is known for."
            className={cn(inputClass, "resize-y")}
          />
        </FormField>
      </div>

      <ActionError
        message={
          state.error && !state.error.includes("store name") ? state.error : undefined
        }
      />

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending && (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          )}
          {pending ? "Saving…" : values.id ? "Save store" : "Create store"}
        </button>
        <Link
          href="/dashboard/stores"
          className="rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
