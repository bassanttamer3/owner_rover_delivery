import { useQuery } from "@tanstack/react-query";
import { listPlans } from "@/api";
import type { ProductPlan } from "@/common";

export const PLANS_QUERY_KEY = ["plans"] as const;

const PLANS_STALE_TIME = 5 * 60 * 1000;

function parsePlansResponse(data: unknown): ProductPlan[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as ProductPlan[];

  const record = data as Record<string, unknown>;
  const rows = record.plans ?? record.data;
  return Array.isArray(rows) ? (rows as ProductPlan[]) : [];
}

export async function fetchPlans(): Promise<ProductPlan[]> {
  const res = await listPlans();
  const rows = parsePlansResponse(res.data?.data ?? res.data);
  return rows.filter((plan) => plan.active !== false);
}

export function usePlans(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: PLANS_QUERY_KEY,
    queryFn: fetchPlans,
    staleTime: PLANS_STALE_TIME,
    gcTime: 30 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}
