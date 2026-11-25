"use client";

import { useState, type FormEvent } from "react";
import { Sparkles } from "lucide-react";
import { categoryMeta } from "@/lib/categories";
import {
  categoryLabels,
  conditionLabels,
  cn,
  formatPrice,
} from "@/lib/utils";
import type { Category, Condition } from "@/types";

type DraftSource = "openai" | "anthropic" | "google" | "template";

const inputClass =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent";
const labelClass = "block text-sm font-medium";

export function SellForm() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("textbooks");
  const [condition, setCondition] = useState<Condition>("good");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionEdited, setDescriptionEdited] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const [draftSource, setDraftSource] = useState<DraftSource | null>(null);
  const [preview, setPreview] = useState(false);

  async function generateDescription() {
    if (!title.trim()) {
      setAiError("Add a title first so the draft has something to work with.");
      return;
    }

    if (
      description.trim() &&
      descriptionEdited &&
      !window.confirm("Replace your current description with a new draft?")
    ) {
      return;
    }

    setGenerating(true);
    setAiError("");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, condition }),
      });

      if (!response.ok) throw new Error("Request failed");

      const data = (await response.json()) as {
        description?: string;
        source?: DraftSource;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "Couldn't draft a description.");
      }
      if (data.description) {
        setDescription(data.description);
        setDescriptionEdited(false);
        setDraftSource(data.source ?? "template");
      }
    } catch (error) {
      setAiError(
        error instanceof Error
          ? error.message
          : "Couldn't draft a description. Try again in a moment.",
      );
    } finally {
      setGenerating(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPreview(true);
  }

  const meta = categoryMeta[category];
  const Icon = meta.icon;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-line bg-surface p-6 sm:p-8"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className={labelClass}>
            What are you selling?
          </label>
          <input
            id="title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Calculus I & II textbook bundle"
            className={cn(inputClass, "mt-2")}
          />
        </div>

        <div>
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value as Category)}
            className={cn(inputClass, "mt-2")}
          >
            {(Object.keys(categoryLabels) as Category[]).map((key) => (
              <option key={key} value={key}>
                {categoryLabels[key]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="condition" className={labelClass}>
            Condition
          </label>
          <select
            id="condition"
            value={condition}
            onChange={(event) => setCondition(event.target.value as Condition)}
            className={cn(inputClass, "mt-2")}
          >
            <option value="new">Brand new</option>
            <option value="like-new">Like new</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="price" className={labelClass}>
            Price (NGN)
          </label>
          <input
            id="price"
            type="number"
            min="0"
            required
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="1500"
            className={cn(inputClass, "mt-2")}
          />
        </div>

        <div className="sm:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <button
              type="button"
              onClick={generateDescription}
              disabled={generating}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent-soft/70 disabled:opacity-60"
            >
              <Sparkles className="size-3.5" aria-hidden="true" />
              {generating ? "Writing..." : "Draft with AI"}
            </button>
          </div>
          <textarea
            id="description"
            rows={5}
            required
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setDescriptionEdited(true);
            }}
            placeholder="Tell buyers about the item, its condition, and where you can meet."
            className={cn(inputClass, "mt-2 resize-y")}
          />
          <p className="mt-1.5 text-xs text-muted">
            {draftSource && draftSource !== "template"
              ? "AI draft — edit freely before previewing."
              : draftSource === "template"
                ? "Sample draft — add a model key to .env.local to enable AI drafting."
                : "Draft with AI, then edit freely before previewing."}
          </p>
          {aiError && (
            <p role="alert" className="mt-2 text-sm text-accent">
              {aiError}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <p className={labelClass}>Photos</p>
          <div className="mt-2 grid place-items-center rounded-2xl border border-dashed border-line bg-background px-6 py-7 text-center">
            <p className="text-sm text-muted">Photo uploads aren&apos;t available yet.</p>
            <p className="mt-1 text-xs text-muted">
              Your listing will use a category image for now.
            </p>
          </div>
        </div>
      </div>

      {preview && (
        <section
          aria-label="Listing preview"
          className="mt-6 rounded-2xl border border-line bg-background p-4 sm:p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Preview only
            </p>
            <button
              type="button"
              onClick={() => setPreview(false)}
              className="rounded-full px-2 py-1 text-xs text-muted hover:text-foreground"
            >
              Close preview
            </button>
          </div>
          <div className="mt-4 flex gap-4">
            <div
              className={cn(
                "grid size-20 shrink-0 place-items-center rounded-xl bg-gradient-to-br",
                meta.gradient,
              )}
            >
              <Icon
                className={cn("size-8", meta.tint)}
                strokeWidth={1.25}
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                {categoryLabels[category]}
              </p>
              <h2 className="truncate font-medium">{title || "Untitled item"}</h2>
              <p className="mt-1 font-semibold text-accent">
                {price ? formatPrice(Number(price)) : "Price not set"}
              </p>
              <span className="mt-2 inline-block rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                {conditionLabels[condition]}
              </span>
            </div>
          </div>
          {description && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted">
              {description}
            </p>
          )}
          <p className="mt-4 text-xs text-muted">
            Nothing is published yet. Accounts and publishing are coming soon.
          </p>
        </section>
      )}

      <button
        type="submit"
        className="mt-6 w-full rounded-full bg-accent px-5 py-3 font-medium text-accent-contrast transition-colors hover:bg-accent/90 sm:w-auto"
      >
        {preview ? "Update preview" : "Preview listing"}
      </button>
    </form>
  );
}
