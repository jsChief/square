import Link from "next/link";
import { CircleCheck, Star, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductRow } from "@/lib/seller/queries";

export function SavedNotice({ saved }: { saved?: string }) {
  if (!saved) return null;

  const messages: Record<string, string> = {
    created: "Created successfully.",
    updated: "Changes saved.",
    deleted: "Deleted successfully.",
  };
  const message = messages[saved];
  if (!message) return null;

  return (
    <p
      role="status"
      className="mt-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3.5 py-2 text-xs font-medium text-accent"
    >
      <CircleCheck className="size-3.5" aria-hidden="true" />
      {message}
    </p>
  );
}

export function formatDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  href?: string;
}) {
  const inner = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted">
          {label}
        </span>
        <Icon className="size-4 text-accent" aria-hidden="true" />
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </>
  );

  const classes =
    "block rounded-2xl border border-line bg-surface p-5 transition-colors";

  return href ? (
    <Link href={href} className={cn(classes, "hover:border-accent/40")}>
      {inner}
    </Link>
  ) : (
    <div className={classes}>{inner}</div>
  );
}

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("rounded-2xl border border-line bg-surface p-5", className)}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ListingStatusBadge({ product }: { product: ProductRow }) {
  const blocked = product.is_blocked;
  const status = product.status ?? "pending";

  const tone = blocked
    ? "border-danger/30 bg-danger/5 text-danger"
    : status === "approved"
      ? "border-accent/30 bg-accent-soft text-accent"
      : status === "rejected"
        ? "border-danger/30 bg-danger/5 text-danger"
        : "border-line bg-surface text-muted";

  const label = blocked
    ? "Blocked"
    : status === "approved"
      ? "Live"
      : status === "rejected"
        ? "Rejected"
        : status === "pending"
          ? "In review"
          : status;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        tone,
      )}
    >
      {label}
    </span>
  );
}

export function ServiceStatusBadge({ status }: { status: string | null }) {
  const value = status ?? "pending";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        value === "approved"
          ? "border-accent/30 bg-accent-soft text-accent"
          : value === "rejected" || value === "blocked"
            ? "border-danger/30 bg-danger/5 text-danger"
            : "border-line bg-surface text-muted",
      )}
    >
      {value === "approved"
        ? "Live"
        : value === "pending"
          ? "In review"
          : value.charAt(0).toUpperCase() + value.slice(1)}
    </span>
  );
}

export function Stars({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  return (
    <span
      className={cn("flex items-center gap-0.5", className)}
      aria-label={`${rating} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((step) => (
        <Star
          key={step}
          className={cn(
            "size-3.5",
            step <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-line",
          )}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
      <Icon className="mx-auto size-7 text-muted" aria-hidden="true" />
      <p className="mt-4 font-medium">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{message}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function FilterPills({
  items,
  basePath,
  active,
}: {
  items: { key: string; label: string; count?: number }[];
  basePath: string;
  active: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = item.key === active;
        const href =
          item.key === "all" ? basePath : `${basePath}?view=${item.key}`;
        return (
          <Link
            key={item.key}
            href={href}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "border-accent bg-accent text-accent-contrast"
                : "border-line bg-surface text-muted hover:border-accent hover:text-accent",
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span className={cn("tabular-nums", isActive ? "opacity-80" : "opacity-60")}>
                {item.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
