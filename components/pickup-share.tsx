"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

export function PickupShare({ location }: { location: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API is unavailable in some browsers; fall back to a selection copy.
      const input = document.createElement("textarea");
      input.value = url;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }

    setCopied(true);
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="pickup-panel"
        className="w-full rounded-full bg-accent px-5 py-3 font-medium text-accent-contrast transition-colors hover:bg-accent/90"
      >
        Arrange pickup
      </button>

      {open && (
        <div
          id="pickup-panel"
          className="mt-3 rounded-2xl border border-line bg-surface p-4"
        >
          <p className="text-sm font-medium">Meet locally, keep it simple</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Direct messaging isn&apos;t available yet. Copy this listing link
            and share it with the seller to agree on a time and place around{" "}
            {location}.
          </p>
          <button
            type="button"
            onClick={copyLink}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            {copied ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Link2 className="size-4" aria-hidden="true" />
            )}
            {copied ? "Link copied" : "Copy listing link"}
          </button>
          <span className="sr-only" aria-live="polite">
            {copied ? "Listing link copied to clipboard" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
