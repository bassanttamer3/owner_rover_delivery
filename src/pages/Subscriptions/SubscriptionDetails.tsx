import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  cancelSubscription,
  getSubscriptionDetails,
  resumeSubscription,
} from "@/api";
import type { Subscription } from "@/common";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatAmount,
  formatDate,
  parseSubscriptionDetails,
  StatusBadge,
} from "./subscription-utils";
import UpdateSubscriptionModal from "./UpdateSubscriptionModal";

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-3 border-b border-border/40 last:border-0">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm text-foreground text-right break-all">{value}</span>
    </div>
  );
}

type SubscriptionAction = "cancel" | "resume";

const SubscriptionDetails = () => {
  const { subscription_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<SubscriptionAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const loadDetails = useCallback(async (options?: { showLoading?: boolean }) => {
    if (!subscription_id) return;

    const showLoading = options?.showLoading ?? false;
    if (showLoading) setLoading(true);

    try {
      const res = await getSubscriptionDetails(subscription_id);
      const parsed = parseSubscriptionDetails(res.data?.data ?? res.data);
      setSubscription(parsed as unknown as Subscription | null);
    } catch {
      toast.error(
        showLoading
          ? "Failed to fetch subscription details"
          : "Failed to refresh subscription details"
      );
      if (showLoading) setSubscription(null);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [subscription_id]);

  useEffect(() => {
    loadDetails({ showLoading: true });
  }, [loadDetails]);

  const openConfirm = (action: SubscriptionAction) => {
    setPendingAction(action);
    setConfirmOpen(true);
  };

  const handleSubscriptionAction = async () => {
    if (!subscription_id || !pendingAction) return;

    setActionLoading(true);
    let succeeded = false;

    try {
      if (pendingAction === "cancel") {
        await cancelSubscription(subscription_id);
        toast.success("Subscription cancelled successfully");
      } else {
        await resumeSubscription(subscription_id);
        toast.success("Subscription resumed successfully");
      }
      succeeded = true;
      setConfirmOpen(false);
      setPendingAction(null);
    } catch {
      toast.error(
        pendingAction === "cancel"
          ? "Failed to cancel subscription"
          : "Failed to resume subscription"
      );
    } finally {
      setActionLoading(false);
      if (succeeded) {
        await loadDetails();
      }
    }
  };

  const canCancel =
    subscription &&
    !subscription.cancelAtPeriodEnd &&
    !["canceled", "cancelled"].includes(subscription.status?.toLowerCase() ?? "");

  const canResume = subscription?.cancelAtPeriodEnd;

  const canUpdate =
    subscription &&
    !["canceled", "cancelled"].includes(subscription.status?.toLowerCase() ?? "");

  if (loading) {
    return (
      <div className="space-y-6 pt-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="space-y-6 pt-6 text-center text-muted-foreground">
        <p>Subscription not found.</p>
        <Button variant="outline" onClick={() => navigate("/subscriptions")}>
          Back to Subscriptions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-6 pb-8">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {subscription.plan?.name ?? "Subscription"}
          </h1>
          <p className="text-muted-foreground text-sm font-mono">
            {subscription.stripeSubscriptionId}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canUpdate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUpdateModal(true)}
              className="border-[#2ec8cf]/50 text-[#2ec8cf] hover:bg-[#2ec8cf]/10"
            >
              Update Subscription
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openConfirm("cancel")}
              className="text-destructive border-destructive/50 hover:bg-destructive/10"
            >
              Cancel Subscription
            </Button>
          )}
          {canResume && (
            <Button
              size="sm"
              onClick={() => openConfirm("resume")}
              className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white"
            >
              Resume Subscription
            </Button>
          )}
          {/* <StatusBadge status={subscription.status} /> */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 bg-muted/20 border-b border-border/50">
            <CardTitle className="text-base font-semibold">
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <DetailRow label="Subscription ID" value={subscription.stripeSubscriptionId} />
            <DetailRow label="Customer" value={subscription.customer} />
            <DetailRow
              label="Status"
              value={
                <StatusBadge
                  status={subscription.status}
                  cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
                  periodEnd={subscription.currentPeriod?.end}
                />
              }
            />
            <DetailRow
              label="Cancel at period end"
              value={subscription.cancelAtPeriodEnd ? "Yes" : "No"}
            />
            <DetailRow label="Created at" value={formatDate(subscription.createdAt)} />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 bg-muted/20 border-b border-border/50">
            <CardTitle className="text-base font-semibold">
              Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <DetailRow label="Plan name" value={subscription.plan?.name ?? "—"} />
            <DetailRow
              label="Amount"
              value={
                subscription.plan
                  ? `${formatAmount(subscription.plan.amount, subscription.plan.currency)} / ${subscription.plan.interval}`
                  : "—"
              }
            />
            <DetailRow label="Price ID" value={subscription.plan?.priceId ?? "—"} />
            <DetailRow label="Product ID" value={subscription.plan?.productId ?? "—"} />
            <DetailRow
              label="Interval count"
              value={subscription.plan?.intervalCount ?? "—"}
            />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 bg-muted/20 border-b border-border/50">
            <CardTitle className="text-base font-semibold">
              Current Period
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <DetailRow label="Start date" value={formatDate(subscription.currentPeriod?.start)} />
            <DetailRow label="End date" value={formatDate(subscription.currentPeriod?.end)} />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 bg-muted/20 border-b border-border/50">
            <CardTitle className="text-base font-semibold">
              Trial
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <DetailRow
              label="In trial"
              value={subscription.trial?.isInTrial ? "Yes" : "No"}
            />
            <DetailRow label="Trial end" value={formatDate(subscription.trial?.trialEnd)} />
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (actionLoading) return;
          setConfirmOpen(open);
          if (!open) setPendingAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction === "cancel"
                ? "Cancel subscription?"
                : "Resume subscription?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction === "cancel"
                ? `Are you sure you want to cancel ${subscription.plan?.name ?? "this subscription"}?`
                : `Are you sure you want to resume ${subscription.plan?.name ?? "this subscription"}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleSubscriptionAction();
              }}
              disabled={actionLoading}
              className={
                pendingAction === "cancel"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white"
              }
            >
              {actionLoading
                ? "Processing..."
                : pendingAction === "cancel"
                  ? "Cancel Subscription"
                  : "Resume Subscription"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UpdateSubscriptionModal
        open={showUpdateModal}
        onOpenChange={setShowUpdateModal}
        subscriptionId={subscription.stripeSubscriptionId}
        currentPriceId={subscription.plan?.priceId}
        onSuccess={() => loadDetails()}
      />
    </div>
  );
};

export default SubscriptionDetails;
