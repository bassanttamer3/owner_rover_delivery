import { Badge } from "@/components/ui/badge";

export const formatDate = (date?: string) => {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

export const formatAmount = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount / 100);

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  trialing: { label: "Trialing", className: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  past_due: { label: "Past Due", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  canceled: { label: "Canceled", className: "bg-muted text-muted-foreground border-border" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground border-border" },
  unpaid: { label: "Unpaid", className: "bg-rose-500/15 text-rose-600 border-rose-500/30" },
  incomplete: { label: "Incomplete", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  incomplete_expired: { label: "Expired", className: "bg-rose-500/15 text-rose-600 border-rose-500/30" },
  paused: { label: "Paused", className: "bg-muted text-muted-foreground border-border" },
};

export function StatusBadge({
  status,
  cancelAtPeriodEnd,
  periodEnd,
}: {
  status?: string;
  cancelAtPeriodEnd?: boolean;
  periodEnd?: string;
}) {
  const normalizedStatus = status?.toLowerCase() ?? "";

  if (cancelAtPeriodEnd && normalizedStatus === "active") {
    const label = periodEnd
      ? `Active until ${formatDate(periodEnd)}`
      : "Active until period end";
    return (
      <Badge
        variant="outline"
        className="font-normal border text-[11px] bg-amber-500/15 text-amber-600 border-amber-500/30"
      >
        {label}
      </Badge>
    );
  }

  const config = statusConfig[normalizedStatus] ?? {
    label: status ?? "—",
    className: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge variant="outline" className={`font-normal border text-[11px] ${config.className}`}>
      {config.label}
    </Badge>
  );
}

export function parseSubscriptionsResponse(data: unknown) {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  const record = data as Record<string, unknown>;
  const rows = record.subscriptions ?? record.data;
  return Array.isArray(rows) ? rows : [];
}

export function parseSubscriptionDetails(data: unknown) {
  if (!data || typeof data !== "object") return null;

  const record = data as Record<string, unknown>;
  if ("stripeSubscriptionId" in record) return record;

  const nested = record.subscription ?? record.data;
  if (nested && typeof nested === "object" && "stripeSubscriptionId" in nested) {
    return nested as Record<string, unknown>;
  }

  return null;
}
