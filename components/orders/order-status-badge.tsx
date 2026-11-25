import { cn } from "@/lib/utils";

const labels: Record<string, string> = {
  pending: "Awaiting payment",
  paid: "Paid",
  accepted: "Accepted",
  completed: "Completed",
  cancelled: "Cancelled",
  declined: "Declined",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        status === "paid" || status === "completed"
          ? "border-accent/30 bg-accent-soft text-accent"
          : status === "cancelled" || status === "declined"
            ? "border-danger/30 bg-danger/5 text-danger"
            : "border-line bg-surface text-muted",
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}
