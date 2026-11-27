"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

export function RefreshButton({ label = "Refresh" }: { label?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
      aria-label={pending ? "Refreshing orders" : "Refresh orders"}
      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-medium transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
    >
      <RefreshCw
        className={cn("size-4", pending && "animate-spin")}
        aria-hidden="true"
      />
      {pending ? "Refreshing…" : label}
    </button>
  );
}
