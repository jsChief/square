import Image from "next/image";
import logo from "@/assets/squareIcon_1024_2x.png";

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  vectorEffect: "non-scaling-stroke" as const,
};

/** Three nested squares: the wordmark, drawn at a larger scale. */
function AuthMark() {
  return (
    <svg
      viewBox="0 0 240 240"
      className="auth-mark size-56 text-accent/50"
      aria-hidden="true"
    >
      <rect
        {...line}
        data-draw=""
        x="22"
        y="22"
        width="196"
        height="196"
        rx="36"
        transform="rotate(-8 120 120)"
      />
      <rect
        {...line}
        data-draw=""
        style={{ animationDelay: "140ms" }}
        x="60"
        y="60"
        width="120"
        height="120"
        rx="24"
        transform="rotate(-8 120 120)"
      />
      <rect
        {...line}
        data-draw=""
        style={{ animationDelay: "280ms" }}
        x="96"
        y="96"
        width="48"
        height="48"
        rx="12"
        transform="rotate(-8 120 120)"
      />
    </svg>
  );
}

export function AuthBrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden border-r border-line bg-accent-soft lg:flex lg:flex-col lg:justify-between">
      <div className="auth-grid absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 flex items-center gap-2 p-10">
        <Image
          src={logo}
          alt=""
          width={28}
          height={28}
          priority
          className="size-7 rounded-md object-contain"
        />
        <span className="text-lg font-semibold tracking-tight">
          square<span className="text-accent">.</span>
        </span>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md px-10 pb-4">
        <AuthMark />
        <h2 className="mt-9 max-w-sm text-[2rem] font-semibold leading-[1.12] tracking-[-0.03em] text-balance">
          Find what you need, right nearby.
        </h2>
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-foreground/75">
          Search local listings, pick your deal, and arrange an easy pickup — no
          shipping, no waiting.
        </p>
      </div>

      <p className="relative z-10 flex items-center gap-2.5 p-10 text-xs text-foreground/65">
        <span>Nearby finds</span>
        <span aria-hidden="true">·</span>
        <span>Local pickup</span>
        <span aria-hidden="true">·</span>
        <span>Better deals</span>
      </p>
    </aside>
  );
}
