import Image from "next/image";
import { cn } from "@/lib/utils";

const avatarSizes = {
  xs: { className: "size-6 text-[9px]", pixels: "24px" },
  sm: { className: "size-7 text-[10px]", pixels: "28px" },
  md: { className: "size-9 text-xs", pixels: "36px" },
  lg: { className: "size-11 text-sm", pixels: "44px" },
  xl: { className: "size-14 text-base", pixels: "56px" },
} as const;

export function Avatar({
  src,
  name,
  size = "md",
  className,
}: {
  src: string | null | undefined;
  name: string;
  size?: keyof typeof avatarSizes;
  className?: string;
}) {
  const dimensions = avatarSizes[size];
  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-soft font-semibold uppercase text-accent ring-1 ring-line",
        dimensions.className,
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={dimensions.pixels}
          className="object-cover"
        />
      ) : (
        initials
      )}
    </span>
  );
}
