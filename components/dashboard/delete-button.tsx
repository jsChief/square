"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useActionState } from "react";
import {
  deleteListing,
  deleteService,
  deleteStore,
  type SellerActionState,
} from "@/lib/seller/actions";

const initialState: SellerActionState = {};

export function DeleteButton({
  kind,
  id,
  label,
}: {
  kind: "listing" | "service" | "store";
  id: number;
  label: string;
}) {
  const action =
    kind === "listing"
      ? deleteListing
      : kind === "service"
        ? deleteService
        : deleteStore;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        onSubmit={(event) => {
          if (!window.confirm(`Delete ${label}? This can't be undone.`)) {
            event.preventDefault();
          }
        }}
        aria-label={`Delete ${label}`}
        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-danger/40 hover:text-danger disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 className="size-3.5" aria-hidden="true" />
        )}
        Delete
      </button>
      {state.error && (
        <span role="alert" className="max-w-52 text-right text-[11px] text-danger">
          {state.error}
        </span>
      )}
    </form>
  );
}
