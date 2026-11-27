"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { useActionState } from "react";
import {
  createListing,
  updateListing,
  type SellerActionState,
} from "@/lib/seller/actions";
import { categoryLabels, cn } from "@/lib/utils";
import type { Category } from "@/types";
import { ActionError, FormField, inputClass } from "./form-controls";

export interface ListingFormValues {
  id?: number;
  storeId: number | null;
  name: string;
  category: Category;
  condition: string;
  price: string;
  stock: number;
  location: string;
  description: string;
  imageUrls: string;
}

const initialState: SellerActionState = {};

const conditionOptions = [
  { value: "new", label: "Brand new" },
  { value: "like-new", label: "Like new" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "unknown", label: "Not listed" },
] as const;

export function ListingForm({
  values,
  stores,
}: {
  values: ListingFormValues;
  stores: { id: number; name: string }[];
}) {
  const action = values.id ? updateListing : createListing;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className="mt-7 rounded-2xl border border-line bg-surface p-5 sm:p-7"
    >
      {values.id && <input type="hidden" name="id" value={values.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="listing-name"
          label="Listing title"
          error={state.error?.includes("title") ? state.error : undefined}
          className="sm:col-span-2"
        >
          <input
            id="listing-name"
            name="name"
            required
            maxLength={160}
            defaultValue={values.name}
            placeholder="e.g. Calculus textbook bundle"
            className={inputClass}
          />
        </FormField>

        <FormField id="listing-store" label="Store">
          <select
            id="listing-store"
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

        <FormField id="listing-category" label="Category">
          <select
            id="listing-category"
            name="category"
            defaultValue={values.category}
            className={inputClass}
          >
            {(Object.keys(categoryLabels) as Category[]).map((key) => (
              <option key={key} value={key}>
                {categoryLabels[key]}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="listing-condition" label="Condition">
          <select
            id="listing-condition"
            name="condition"
            defaultValue={values.condition}
            className={inputClass}
          >
            {conditionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            id="listing-price"
            label="Price (NGN)"
            error={state.error?.includes("price") ? state.error : undefined}
          >
            <input
              id="listing-price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={values.price}
              placeholder="1500"
              className={inputClass}
            />
          </FormField>
          <FormField id="listing-stock" label="Stock">
            <input
              id="listing-stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              defaultValue={values.stock}
              className={inputClass}
            />
          </FormField>
        </div>

        <FormField id="listing-location" label="Pickup location">
          <input
            id="listing-location"
            name="location"
            maxLength={160}
            defaultValue={values.location}
            placeholder="e.g. Main library entrance"
            className={inputClass}
          />
        </FormField>

        <FormField
          id="listing-description"
          label="Description"
          className="sm:col-span-2"
        >
          <textarea
            id="listing-description"
            name="description"
            rows={5}
            maxLength={4000}
            defaultValue={values.description}
            placeholder="Tell buyers about the item and how to collect it."
            className={cn(inputClass, "resize-y")}
          />
        </FormField>

        <FormField
          id="listing-images"
          label="Image URLs"
          hint="Optional. One URL per line, or separate with commas."
          className="sm:col-span-2"
        >
          <textarea
            id="listing-images"
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
          state.error && !state.error.includes("title") && !state.error.includes("price")
            ? state.error
            : undefined
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
          {pending
            ? "Saving…"
            : values.id
              ? "Save listing"
              : "Create listing"}
        </button>
        <Link
          href="/dashboard/listings"
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
