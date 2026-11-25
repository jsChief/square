import type { SVGProps } from "react";

type ShapeProps = Pick<SVGProps<SVGSVGElement>, "className" | "style">;

// One shared stroke language, matching the weight of the lucide icons already
// used across the site. non-scaling-stroke keeps these delicate at any size.
const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  vectorEffect: "non-scaling-stroke",
} as const;

/** Nested rounded squares — the "square" wordmark as a quiet motif. */
function SquareStack({ className, style }: ShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style}>
      <rect {...line} x="16" y="16" width="68" height="68" rx="16" transform="rotate(-10 50 50)" />
      <rect {...line} x="33" y="33" width="34" height="34" rx="9" transform="rotate(-10 50 50)" />
    </svg>
  );
}

/** An open book — the textbook category, drawn as a line study. */
function OpenBook({ className, style }: ShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style}>
      <path {...line} d="M50 32c-8-6-18-8-28-7v40c10-1 20 1 28 7 8-6 18-8 28-7V25c-10-1-20 1-28 7Z" />
      <path {...line} d="M50 32v40" />
      <path {...line} d="M31 42c5-.4 9 .3 12 2M31 50c5-.4 9 .3 12 2M57 44c4-1.7 8-2.4 12-2M57 52c4-1.7 8-2.4 12-2" />
    </svg>
  );
}

/** A leaf — giving things a second life. */
function Leaf({ className, style }: ShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style}>
      <path {...line} d="M82 16C54 18 32 31 26 55c-2 9 0 17 4 23 22 1 40-11 47-32 3-10 5-20 5-30Z" />
      <path {...line} d="M24 84c9-18 24-32 44-43" />
      <path {...line} d="M50 58c-3-8-3-14 0-20M64 49c4 5 6 10 6 16" />
    </svg>
  );
}

/** A price tag — the fair-price promise of local exchange. */
function PriceTag({ className, style }: ShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style}>
      <path {...line} d="M16 44 44 16h34a6 6 0 0 1 6 6v30L56 84a6 6 0 0 1-8 0L16 52a6 6 0 0 1 0-8Z" />
      <circle {...line} cx="70" cy="30" r="5" />
    </svg>
  );
}

/** A four-point spark, echoing the "Made for easy local finds" badge icon. */
function Spark({ className, style }: ShapeProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} style={style}>
      <path {...line} d="M20 4c1.5 8 4 10.5 12 12-8 1.5-10.5 4-12 12-1.5-8-4-10.5-12-12 8-1.5 10.5-4 12-12Z" />
    </svg>
  );
}

/**
 * Decorative line-art backdrop for the home hero. Purely atmospheric: hidden
 * from assistive tech, transparent to pointer events, and tinted from the
 * live accent so every saved theme and light/dark mode is respected.
 */
export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="hero-shape absolute -left-24 -top-16 text-shape/20 sm:-left-10 sm:-top-6 sm:text-shape/30" style={{ animationDelay: "40ms" }}>
        <SquareStack className="size-48 sm:size-64" />
      </div>
      <div className="hero-shape absolute -right-20 top-20 text-shape/25 sm:right-[3%] sm:top-24 sm:text-shape/35" style={{ animationDelay: "140ms" }}>
        <OpenBook className="size-40 sm:size-52" />
      </div>
      <div className="hero-shape absolute bottom-[-2.5rem] left-[2%] text-shape/20 sm:bottom-2 sm:left-[11%] sm:text-shape/25" style={{ animationDelay: "240ms" }}>
        <Leaf className="size-32 sm:size-48" />
      </div>
      <div className="hero-shape absolute right-[12%] top-8 text-shape/25 sm:right-[22%] sm:top-12 sm:text-shape/35" style={{ animationDelay: "200ms" }}>
        <Spark className="size-6 sm:size-8" />
      </div>
      <div className="hero-shape absolute bottom-20 left-[4%] text-shape/20 sm:bottom-24 sm:left-[5%] sm:text-shape/30" style={{ animationDelay: "320ms" }}>
        <Spark className="size-5 sm:size-6" />
      </div>
      <div className="hero-shape absolute -bottom-12 -right-10 hidden text-shape/30 sm:block sm:bottom-6 sm:right-[7%]" style={{ animationDelay: "380ms" }}>
        <PriceTag className="size-44" />
      </div>
    </div>
  );
}
