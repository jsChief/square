"use client";

import Image from "next/image";
import { useId, useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { categoryMeta } from "@/lib/categories";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface ListingGalleryProps {
  images: string[];
  title: string;
  category: Category;
}

export function ListingGallery({ images, title, category }: ListingGalleryProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const hintId = useId();
  const meta = categoryMeta[category];
  const Icon = meta.icon;
  const hasMultiple = images.length > 1;

  function go(next: number) {
    setIndex(Math.min(Math.max(next, 0), images.length - 1));
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(index + 1);
    }
  }

  function onTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.changedTouches[0].clientX;
  }

  function onTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) > 40) go(distance < 0 ? index + 1 : index - 1);
  }

  return (
    <div
      role={hasMultiple ? "group" : undefined}
      aria-roledescription={hasMultiple ? "carousel" : undefined}
      aria-label={hasMultiple ? `Photos of ${title}` : undefined}
      aria-describedby={hasMultiple ? hintId : undefined}
      tabIndex={hasMultiple ? 0 : undefined}
      onKeyDown={hasMultiple ? onKeyDown : undefined}
      onTouchStart={hasMultiple ? onTouchStart : undefined}
      onTouchEnd={hasMultiple ? onTouchEnd : undefined}
      className="group"
    >
      {hasMultiple && (
        <span id={hintId} className="sr-only">
          Use the arrow keys, the buttons, or the thumbnails to browse photos.
        </span>
      )}

      <div
        className={`relative aspect-square overflow-hidden rounded-3xl border border-line bg-gradient-to-br ${meta.gradient}`}
      >
        {images.length > 0 ? (
          <div
            className="flex h-full w-full motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {images.map((image, imageIndex) => (
              <div
                key={`${image}-${imageIndex}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${imageIndex + 1} of ${images.length}`}
                aria-hidden={imageIndex !== index}
                className="relative h-full w-full shrink-0"
              >
                <Image
                  src={image}
                  alt={
                    hasMultiple
                      ? `${title}, photo ${imageIndex + 1} of ${images.length}`
                      : title
                  }
                  fill
                  unoptimized
                  loading={imageIndex === 0 ? "eager" : "lazy"}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <Icon
            className={cn("size-32", meta.tint)}
            strokeWidth={1}
            aria-hidden="true"
          />
        )}

        {!hasMultiple && images.length === 0 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-medium text-muted">
            Photo coming soon
          </span>
        )}

        {hasMultiple && (
          <>
            {index > 0 && (
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface/90 text-foreground opacity-100 transition-opacity hover:bg-surface sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
            )}
            {index < images.length - 1 && (
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface/90 text-foreground opacity-100 transition-opacity hover:bg-surface sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            )}
            <span className="absolute bottom-3 right-3 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-medium text-foreground tabular-nums">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {hasMultiple && (
        <div
          role="group"
          aria-label="Choose a photo"
          className="mt-3 flex gap-2"
        >
          {images.map((image, imageIndex) => (
            <button
              key={`${image}-${imageIndex}`}
              type="button"
              onClick={() => setIndex(imageIndex)}
              aria-label={`Show photo ${imageIndex + 1} of ${images.length}`}
              aria-current={imageIndex === index ? "true" : undefined}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors sm:size-[72px]",
                imageIndex === index
                  ? "border-accent"
                  : "border-transparent hover:border-line",
              )}
            >
              <Image
                src={image}
                alt=""
                fill
                unoptimized
                sizes="72px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
