import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { createSubscription } from "@/api";
import type { PriceDetails, ProductPlan } from "@/common";
import { usePlans } from "@/hooks/use-plans";
import { cn } from "@/lib/utils";

interface CreateSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type BillingCycle = "monthly" | "annual";

const formatAmount = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount / 100);

export default function CreateSubscriptionModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateSubscriptionModalProps) {
  const { data: plans = [], isLoading: plansLoading, isError } = usePlans({ enabled: open });
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlanKey, setSelectedPlanKey] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [trialDays, setTrialDays] = useState("");

  const resetForm = () => {
    setSelectedPlanKey(null);
    setBillingCycle("monthly");
    setTrialDays("");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load plans", {
        description: "Please try again.",
      });
    }
  }, [isError]);

  const selectedPlan = plans.find((plan) => plan.planKey === selectedPlanKey) ?? null;

  const getSelectedPrice = (plan: ProductPlan): PriceDetails | null => {
    const price = plan.prices[billingCycle];
    return price?.id ? price : null;
  };

  const handleSubmit = async () => {
    if (!selectedPlan) {
      toast.error("Please select a plan");
      return;
    }

    const price = getSelectedPrice(selectedPlan);
    if (!price) {
      toast.error("Selected billing cycle is not available for this plan");
      return;
    }

    const parsedTrialDays = trialDays.trim() ? Number(trialDays) : undefined;
    if (parsedTrialDays != null && (Number.isNaN(parsedTrialDays) || parsedTrialDays < 0)) {
      toast.error("Trial days must be a valid non-negative number");
      return;
    }

    setSubmitting(true);
    try {
      await createSubscription({
        priceId: price.id,
        ...(parsedTrialDays != null && { trialDays: parsedTrialDays }
        ),
      });
      toast.success("Subscription created successfully");
      handleOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { message?: string } } };
      toast.error("Failed to create subscription", {
        description: axErr.response?.data?.message ?? "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#2ec8cf]">
            <CreditCard className="h-5 w-5" />
            Create Subscription
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Billing cycle
            </Label>
            <div className="flex rounded-md border border-input overflow-hidden">
              {(["monthly", "annual"] as const).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                    billingCycle === cycle
                      ? "bg-[#2ec8cf] text-white"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  {cycle}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {plansLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-border/60 p-4 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))
            ) : plans.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No plans available.
              </p>
            ) : (
              plans.map((plan) => {
                const price = getSelectedPrice(plan);
                const isSelected = selectedPlanKey === plan.planKey;

                return (
                  <button
                    key={plan.planKey}
                    type="button"
                    onClick={() => setSelectedPlanKey(plan.planKey)}
                    className={cn(
                      "w-full text-left rounded-lg border p-4 transition-all",
                      isSelected
                        ? "border-[#2ec8cf] bg-[#2ec8cf]/5 ring-1 ring-[#2ec8cf]/30"
                        : "border-border/60 hover:border-[#2ec8cf]/40 hover:bg-muted/20",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{plan.name}</p>
                          {isSelected && <Check className="h-4 w-4 text-[#2ec8cf] shrink-0" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {price ? (
                          <>
                            <p className="text-lg font-semibold text-[#2ec8cf]">
                              {formatAmount(price.amount, price.currency)}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              / {price.interval || billingCycle}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground">Not available</p>
                        )}
                      </div>
                    </div>

                    {plan.features.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="text-xs text-muted-foreground flex items-start gap-2"
                          >
                            <span className="text-[#2ec8cf] mt-0.5">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="trial-days">Trial days (optional)</Label>
            <Input
              id="trial-days"
              type="number"
              min={0}
              placeholder="e.g. 14"
              value={trialDays}
              onChange={(e) => setTrialDays(e.target.value)}
              disabled={submitting}
            />
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            variant="ghost"
            type="button"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || plansLoading || !selectedPlan}
            className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white"
          >
            {submitting ? "Creating..." : "Create Subscription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
