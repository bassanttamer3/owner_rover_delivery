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
  LayoutGrid,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const fetchCompanies = async (page = 1) => {
    setListLoading(true);
    try {
      const res = await getCompanies({ page, limit: 10 });
      const responseData = res.data?.data;
      if (responseData) {
        setCompanies(responseData.companies || []);
        setTotalPages(responseData.pagination?.total_pages || 1);
        setCurrentPage(page);
      }
    } catch (err) {
      toast.error("Sync Failed");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!id) return;
    try {
      setListLoading(true);
      switch (newStatus) {
        case 'active':
          await activateCompany(id, "Admin activation");
          break;
        case 'suspended':
          await suspendCompany(id, "Administrative review");
          break;
        case 'cancelled':
          await cancelCompanySubscription(id, "Subscription ended by admin");
          break;
        default:
          await updateCompanyStatus(id, { status: newStatus, reason: "Manual update" });
      }
      toast.success(`Account ${newStatus} successfully`);
      fetchCompanies(currentPage);
    } catch (err: any) {
      toast.error("Operation failed", {
        description: err.response?.status === 404 ? "Endpoint not found on server" : "Manual update failed"
      });
    } finally {
      setListLoading(false);
    }
  };

  return (
    <div className="space-y-6 pt-6 pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Building2 className="h-7 w-7 text-[#2ec8cf]" />
          Corporate Directory
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage companies, subscriptions, and fleet assignments
        </p>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-muted/20 border-b border-border/50">
          <div>
            <CardTitle className="text-base font-semibold">Companies</CardTitle>
            <CardDescription>
              {companies.length} {companies.length === 1 ? "entity" : "entities"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowFormModal(true)}
              className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white"
              size="sm"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Company
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCompanies(currentPage)}
              disabled={listLoading}
              className="border-[#2ec8cf]/50 text-[#2ec8cf] hover:bg-[#2ec8cf]/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${listLoading ? "animate-spin" : ""}`} />
              Sync
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="rounded-b-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Company Profile
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Business Type
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
                {listLoading && companies.length === 0 ? (
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
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="font-normal">
                          {company.business_type}
                        </Badge>
                      </td>
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
                                onClick={() => handleStatusChange(company.company_id, "active")}
                                className="text-emerald-600 focus:text-emerald-600"
                              >
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                Activate Account
                              </DropdownMenuItem>
                            )}

                            {company.status === 'active' && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(company.company_id, "suspended")}
                                className="text-amber-600 focus:text-amber-600"
                              >
                                <ShieldAlert className="w-4 h-4 mr-2" />
                                Suspend Account
                              </DropdownMenuItem>
                            )}

                            {company.status !== 'cancelled' && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(company.company_id, "cancelled")}
                                className="text-orange-600 focus:text-orange-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Cancel Subscription
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate(`/companies/${company.company_id}`)}>
                              <LayoutGrid className="w-4 h-4 mr-2" />
                              View Full Profile
                            </DropdownMenuItem>
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
    </div>
  );
};

export default Companies;