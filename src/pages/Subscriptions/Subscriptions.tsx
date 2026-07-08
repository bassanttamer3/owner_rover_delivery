import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { listSubscriptions } from "@/api";
import type { Subscription } from "@/common";
import CreateSubscriptionModal from "./CreateSubscriptionModal";
import { fetchPlans, PLANS_QUERY_KEY } from "@/hooks/use-plans";
import {
  formatAmount,
  formatDate,
  parseSubscriptionsResponse,
  StatusBadge,
} from "./subscription-utils";

const SubscriptionsList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchSubscriptions = async (page = 1) => {
    setListLoading(true);
    try {
      const res = await listSubscriptions({ page, limit: 10 });
      const responseData = res.data?.data;
      const rows = parseSubscriptionsResponse(responseData) as Subscription[];

      setSubscriptions(rows);

      if (responseData && !Array.isArray(responseData)) {
        const record = responseData as Record<string, unknown>;
        const pagination = record.pagination as { total_pages?: number } | undefined;
        setTotalPages(pagination?.total_pages ?? 1);
      } else {
        setTotalPages(1);
      }
      setCurrentPage(page);
    } catch {
      toast.error("Sync Failed");
      setSubscriptions([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions(1);
    queryClient.prefetchQuery({ queryKey: PLANS_QUERY_KEY, queryFn: fetchPlans });
  }, [queryClient]);

  const handleSync = () => {
    setCurrentPage(1);
    fetchSubscriptions(1);
  };

  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Subscriptions
        </h1>
        <p className="text-muted-foreground text-sm">
          View and manage all subscription plans
        </p>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0 pb-4 bg-muted/20 border-b border-border/50">
          <div>
            <CardTitle className="text-base font-semibold">Subscriptions</CardTitle>
            <CardDescription>
              {subscriptions.length}{" "}
              {subscriptions.length === 1 ? "subscription" : "subscriptions"}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white"
              size="sm"
            >
              Create New
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={listLoading}
              className="border-[#2ec8cf]/50 text-[#2ec8cf] hover:bg-[#2ec8cf]/10"
            >
              Sync
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="rounded-b-lg overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-muted/40">
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Plan Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {listLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-36" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-24" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-28" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-28" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </td>
                    </tr>
                  ))
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <p className="text-sm font-medium">No subscriptions yet</p>
                        <p className="text-xs max-w-xs">
                          Subscriptions will appear here once they are created.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((subscription) => (
                    <tr
                      key={subscription.stripeSubscriptionId}
                      onClick={() =>
                        navigate(`/subscriptions/${subscription.stripeSubscriptionId}`)
                      }
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground group-hover:text-[#2ec8cf] transition-colors">
                          {subscription.plan?.name ?? "—"}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          {subscription.stripeSubscriptionId}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {subscription.plan
                          ? formatAmount(subscription.plan.amount, subscription.plan.currency)
                          : "—"}
                        {subscription.plan?.interval && (
                          <span className="text-xs text-muted-foreground ml-1">
                            / {subscription.plan.interval}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDate(subscription.currentPeriod?.start)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDate(subscription.currentPeriod?.end)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={subscription.status}
                          cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
                          periodEnd={subscription.currentPeriod?.end}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!listLoading && subscriptions.length > 0 && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-border/50 bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => fetchSubscriptions(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-xs font-medium text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => fetchSubscriptions(currentPage + 1)}
                className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white border-0"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateSubscriptionModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => fetchSubscriptions(1)}
      />
    </div>
  );
};

export default SubscriptionsList;
