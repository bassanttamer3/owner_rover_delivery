import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  MoreHorizontal,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Building2,
  PlusCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  getCompanies,
  activateCompany,
  suspendCompany,
  updateCompanyStatus,
  cancelCompanySubscription,
} from "@/api";
import CreateCompanyModal from "./CreateCompanyModal";

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  trial: { label: "Trial", className: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  suspended: { label: "Suspended", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground border-border" },
};

function StatusBadge({ status }: { status?: string }) {
  const config = statusConfig[status?.toLowerCase() ?? ""] ?? {
    label: status ?? "—",
    className: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge variant="outline" className={`font-normal border text-[11px] ${config.className}`}>
      {config.label}
    </Badge>
  );
}

const Companies = () => {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBusinessType, setSelectedBusinessType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSubscriptionTier, setSelectedSubscriptionTier] = useState("all");
  const [statusActionLoading, setStatusActionLoading] = useState(false);
  const [statusChangeConfirm, setStatusChangeConfirm] = useState<{
    open: boolean;
    companyId: string;
    companyName: string;
    newStatus: string;
  }>({
    open: false,
    companyId: "",
    companyName: "",
    newStatus: "",
  });
  const [statusReason, setStatusReason] = useState("");

  const businessTypeFilters = [
    { value: "all", label: "All business types" },
    { value: "restaurant", label: "Restaurant" },
    { value: "healthcare", label: "Healthcare" },
    { value: "campus", label: "Campus" },
    { value: "ecommerce", label: "Ecommerce" },
    { value: "logistics", label: "Logistics" },
  ];

  const statusFilters = [
    { value: "all", label: "All statuses" },
    { value: "active", label: "Active" },
    { value: "trial", label: "Trial" },
    { value: "suspended", label: "Suspended" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const subscriptionTierFilters = [
    { value: "all", label: "All tiers" },
    { value: "starter", label: "Starter" },
    { value: "professional", label: "Professional" },
    { value: "enterprise", label: "Enterprise" },
  ];

  const fetchCompanies = async (
    page = 1,
    filters?: { business_type?: string; status?: string; subscription_tier?: string },
  ) => {
    setListLoading(true);
    try {
      const businessTypeFilter = filters?.business_type ?? selectedBusinessType;
      const statusFilter = filters?.status ?? selectedStatus;
      const subscriptionTierFilter = filters?.subscription_tier ?? selectedSubscriptionTier;

      const res = await getCompanies({
        page,
        limit: 10,
        business_type: businessTypeFilter === "all" ? undefined : (businessTypeFilter as any),
        status: statusFilter === "all" ? undefined : (statusFilter as any),
        subscription_tier:
          subscriptionTierFilter === "all" ? undefined : (subscriptionTierFilter as any),
      });
      const responseData = res.data?.data;
      if (responseData) {
        setCompanies(responseData.companies || []);
        setTotalPages(responseData.pagination?.total_pages || 1);
        setCurrentPage(page);
      }
    } catch {
      toast.error("Sync Failed");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(1);
  }, [selectedBusinessType, selectedStatus, selectedSubscriptionTier]);

  const handleSyncReset = () => {
    const defaultBusinessType = "all";
    const defaultStatus = "all";
    const defaultSubscriptionTier = "all";

    const isAlreadyDefault =
      selectedBusinessType === defaultBusinessType &&
      selectedStatus === defaultStatus &&
      selectedSubscriptionTier === defaultSubscriptionTier;

    setSelectedBusinessType(defaultBusinessType);
    setSelectedStatus(defaultStatus);
    setSelectedSubscriptionTier(defaultSubscriptionTier);
    setCurrentPage(1);

    // If filters are already at default, trigger a manual refresh.
    // Otherwise, the filter effect above will fetch once.
    if (isAlreadyDefault) {
      fetchCompanies(1, {
        business_type: defaultBusinessType,
        status: defaultStatus,
        subscription_tier: defaultSubscriptionTier,
      });
    }
  };

  const openStatusConfirm = (id: string, companyName: string, newStatus: string) => {
    setStatusReason("");
    setStatusChangeConfirm({
      open: true,
      companyId: id,
      companyName,
      newStatus,
    });
  };

  const handleStatusChange = async (id: string, newStatus: string, reason?: string) => {
    if (!id) return;
    try {
      setStatusActionLoading(true);
      setListLoading(true);
      switch (newStatus) {
        case 'active':
          await activateCompany(id, reason);
          break;
        case 'suspended':
          await suspendCompany(id, reason);
          break;
        case 'cancelled':
          await cancelCompanySubscription(id, reason);
          break;
        default:
          await updateCompanyStatus(id, { status: newStatus, reason });
      }
      toast.success(`Account ${newStatus} successfully`);
      fetchCompanies(currentPage);
    } catch (err: any) {
      toast.error("Operation failed", {
        description: err.response?.status === 404 ? "Endpoint not found on server" : "Manual update failed"
      });
    } finally {
      setStatusActionLoading(false);
      setListLoading(false);
    }
  };

  const handleConfirmStatusChange = async () => {
    const trimmedReason = statusReason.trim();
    await handleStatusChange(
      statusChangeConfirm.companyId,
      statusChangeConfirm.newStatus,
      trimmedReason || undefined,
    );
    setStatusChangeConfirm((prev) => ({ ...prev, open: false }));
    setStatusReason("");
  };

  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          {/* <Building2 className="h-7 w-7 text-[#2ec8cf]" /> */}
          Companies
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage companies, subscriptions, and fleet assignments
        </p>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0 pb-4 bg-muted/20 border-b border-border/50">
          <div>
            <CardTitle className="text-base font-semibold">Companies</CardTitle>
            <CardDescription>
              {companies.length} {companies.length === 1 ? "entity" : "entities"}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setShowFormModal(true)}
              className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white"
              size="sm"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Company
            </Button>
            <select
              className="h-9 rounded-md border border-input bg-muted/30 px-3 text-xs font-medium focus:ring-2 focus:ring-[#2ec8cf] transition-all min-w-[170px]"
              value={selectedBusinessType}
              onChange={(e) => setSelectedBusinessType(e.target.value)}
            >
              {businessTypeFilters.map((filter) => (
                <option key={filter.value} value={filter.value} className="dark:bg-[#0f172a]">
                  {filter.label}
                </option>
              ))}
            </select>
            <select
              className="h-9 rounded-md border border-input bg-muted/30 px-3 text-xs font-medium focus:ring-2 focus:ring-[#2ec8cf] transition-all min-w-[140px]"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statusFilters.map((filter) => (
                <option key={filter.value} value={filter.value} className="dark:bg-[#0f172a]">
                  {filter.label}
                </option>
              ))}
            </select>
            <select
              className="h-9 rounded-md border border-input bg-muted/30 px-3 text-xs font-medium focus:ring-2 focus:ring-[#2ec8cf] transition-all min-w-[140px]"
              value={selectedSubscriptionTier}
              onChange={(e) => setSelectedSubscriptionTier(e.target.value)}
            >
              {subscriptionTierFilters.map((filter) => (
                <option key={filter.value} value={filter.value} className="dark:bg-[#0f172a]">
                  {filter.label}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncReset}
              disabled={listLoading}
              className="border-[#2ec8cf]/50 text-[#2ec8cf] hover:bg-[#2ec8cf]/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${listLoading ? "animate-spin" : ""}`} />
              Sync
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="rounded-b-lg overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-muted/40">
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Company Profile
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Business Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {listLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-36 mb-2" />
                        <Skeleton className="h-3 w-28" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Skeleton className="h-8 w-8 ml-auto rounded-md" />
                      </td>
                    </tr>
                  ))
                ) : companies.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Building2 className="h-10 w-10 opacity-50" />
                        <p className="text-sm font-medium">No companies yet</p>
                        <p className="text-xs max-w-xs">Add your first company to get started.</p>
                        <Button
                          onClick={() => setShowFormModal(true)}
                          size="sm"
                          className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white mt-1"
                        >
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Add Company
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  companies.map((company) => (
                    <tr
                      key={company.company_id}
                      onClick={() => navigate(`/companies/${company.company_id}`)}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="text-left font-semibold text-foreground group-hover:text-[#2ec8cf] transition-colors">
                          {company.name}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          {company.company_id}
                        </div>
                      </td>
                      <td className="px-4 py-3">{company.business_type}</td>

                      <td className="px-4 py-3">{company.subscription.tier}</td>

                      <td className="px-4 py-3">
                        <StatusBadge status={company.status} />
                      </td>


                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-[#2ec8cf]"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                              Management Actions
                            </DropdownMenuLabel>

                            {company.status !== 'active' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  openStatusConfirm(company.company_id, company.name, "active")
                                }
                                className="text-emerald-600 focus:text-emerald-600"
                              >
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                Activate Account
                              </DropdownMenuItem>
                            )}

                            {company.status === 'active' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  openStatusConfirm(company.company_id, company.name, "suspended")
                                }
                                className="text-amber-600 focus:text-amber-600"
                              >
                                <ShieldAlert className="w-4 h-4 mr-2" />
                                Suspend Account
                              </DropdownMenuItem>
                            )}

                            {company.status !== 'cancelled' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  openStatusConfirm(company.company_id, company.name, "cancelled")
                                }
                                className="text-orange-600 focus:text-orange-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Cancel Subscription
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!listLoading && companies.length > 0 && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-border/50 bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => fetchCompanies(currentPage - 1)}
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
                onClick={() => fetchCompanies(currentPage + 1)}
                className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white border-0"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateCompanyModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        onSuccess={() => fetchCompanies(1)}
      />

      <AlertDialog
        open={statusChangeConfirm.open}
        onOpenChange={(open) => {
          if (statusActionLoading) return;
          setStatusChangeConfirm((prev) => ({ ...prev, open }));
          if (!open) setStatusReason("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm status change</AlertDialogTitle>
            <AlertDialogDescription>
              {`You are about to set `}
              <span className="font-semibold text-primary">{statusChangeConfirm.companyName || "this company"}</span>
              {` to `}
              <span className="font-semibold">{statusChangeConfirm.newStatus || "a new status"}</span>.
              Add a reason for this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={statusReason}
            onChange={(e) => setStatusReason(e.target.value)}
            placeholder="Reason (optional)"
            disabled={statusActionLoading}
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={statusActionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStatusChange} disabled={statusActionLoading}>
              {statusActionLoading ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Companies;