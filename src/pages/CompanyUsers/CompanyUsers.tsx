import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  Users,
  PlusCircle,
  MoreHorizontal,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  listCompanyUsers,
  activateCompanyUser,
  deactivateCompanyUser,
} from "@/api";
import { ListCompanyUsersInterface } from "@/common";
import { useAuth } from "@/contexts/AuthContext";
import CreateUserModal from "./CreateUserModal";

type StatusFilter = ListCompanyUsersInterface["status"] | "all";
type RoleFilter = ListCompanyUsersInterface["role"] | "all";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

const ROLE_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "company_admin", label: "Company Admin" },
  { value: "dispatcher", label: "Dispatcher" },
  { value: "store_manager", label: "Store Manager" },
  { value: "customer_support", label: "Customer Support" },
  { value: "analyst", label: "Analyst" },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  inactive: { label: "Inactive", className: "bg-muted text-muted-foreground border-border" },
  suspended: { label: "Suspended", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
};

const roleLabels: Record<string, string> = {
  company_admin: "Company Admin",
  dispatcher: "Dispatcher",
  store_manager: "Store Manager",
  customer_support: "Customer Support",
  analyst: "Analyst",
};

function StatusBadge({ status }: { status?: string }) {
  const config = statusConfig[status?.toLowerCase() ?? ""] ?? {
    label: status ?? "—",
    className: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge variant="outline" className={`font-medium border ${config.className}`}>
      {config.label}
    </Badge>
  );
}

const CompanyUsers = () => {
  const navigate = useNavigate();
  const { user: loggedInUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    userId: string;
    action: "activate" | "deactivate";
    userName: string;
  } | null>(null);

  const fetchUsers = useCallback(async (page = 1) => {
    setListLoading(true);
    try {
      const params: ListCompanyUsersInterface = {
        page,
        limit: 10,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(roleFilter !== "all" && { role: roleFilter }),
      };
      const res = await listCompanyUsers(params);
      const responseData = res.data?.data;
      if (responseData) {
        setUsers(responseData.users ?? responseData ?? []);
        setTotalPages(responseData.pagination?.total_pages ?? 1);
        setCurrentPage(page);
      }
    } catch (err) {
      toast.error("Failed to load company users");
    } finally {
      setListLoading(false);
    }
  }, [statusFilter, roleFilter]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const isCurrentUser = (rowUser: { user_id?: string; email?: string }) => {
    if (!loggedInUser) return false;
    const userId = rowUser.user_id;
    const email = rowUser.email;
    const loggedUserId = loggedInUser.user_id ?? loggedInUser.id;
    const loggedEmail = loggedInUser.email;
    if (userId && loggedUserId && String(userId) === String(loggedUserId)) return true;
    if (email && loggedEmail && String(email).toLowerCase() === String(loggedEmail).toLowerCase())
      return true;
    return false;
  };

  const openConfirm = (
    userId: string,
    action: "activate" | "deactivate",
    userName: string
  ) => {
    setPendingAction({ userId, action, userName });
    setConfirmOpen(true);
  };

  const handleStatusChange = async (
    userId: string,
    action: "activate" | "deactivate"
  ) => {
    if (!userId) return;
    try {
      setListLoading(true);
      if (action === "activate") {
        await activateCompanyUser(userId);
        toast.success("User activated successfully");
      } else {
        await deactivateCompanyUser(userId);
        toast.success("User deactivated successfully");
      }
      setConfirmOpen(false);
      setPendingAction(null);
      fetchUsers(currentPage);
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { message?: string } } };
      toast.error("Action failed", {
        description: axErr.response?.data?.message ?? "Please try again.",
      });
    } finally {
      setListLoading(false);
    }
  };

  return (
    <div className="space-y-6 pt-6 pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          {/* <Users className="h-7 w-7 text-[#2ec8cf]" /> */}
          Company Users
        </h1>
        <p className="text-muted-foreground text-sm">
          View and manage users across companies
        </p>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0 pb-4 bg-muted/20 border-b border-border/50">
          <div>
            <CardTitle className="text-base font-semibold">Users</CardTitle>
            <CardDescription>
              {listLoading ? "Loading…" : `${users.length} ${users.length === 1 ? "user" : "users"}`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white"
              size="sm"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add User
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUsers(currentPage)}
              disabled={listLoading}
              className="border-[#2ec8cf]/50 text-[#2ec8cf] hover:bg-[#2ec8cf]/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${listLoading ? "animate-spin" : ""}`} />
              Sync
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border/50 bg-muted/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Status</span>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              >
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Role</span>
              <Select
                value={roleFilter}
                onValueChange={(value) => setRoleFilter(value as RoleFilter)}
              >
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-b-lg overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-muted/40">
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Role
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
                        <Skeleton className="h-3 w-48" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Skeleton className="h-8 w-8 ml-auto rounded-md" />
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Users className="h-10 w-10 opacity-50" />
                        <p className="text-sm font-medium">No users found</p>
                        <p className="text-xs max-w-xs">No company users match the current filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.user_id ?? user.email}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        const userId = user.user_id ?? user.id;
                        if (userId) navigate(`/company-users/${userId}`);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          const userId = user.user_id ?? user.id;
                          if (userId) navigate(`/company-users/${userId}`);
                        }
                      }}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">
                          {user.name ?? user.full_name ?? "—"}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="font-medium">
                          {roleLabels[user.role] ?? user.role ?? "—"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        {isCurrentUser(user) ? (
                          <span className="text-muted-foreground text-xs"></span>
                        ) : (
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
                              {String(user.status).toLowerCase() !== "active" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    openConfirm(
                                      user.user_id ?? "",
                                      "activate",
                                      user.name ?? user.full_name ?? user.email ?? "this user"
                                    )
                                  }
                                  className="text-emerald-600 focus:text-emerald-600"
                                >
                                  <ShieldCheck className="w-4 h-4 mr-2" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              {String(user.status).toLowerCase() === "active" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    openConfirm(
                                      user.user_id ?? "",
                                      "deactivate",
                                      user.name ?? user.full_name ?? user.email ?? "this user"
                                    )
                                  }
                                  className="text-amber-600 focus:text-amber-600"
                                >
                                  <ShieldAlert className="w-4 h-4 mr-2" />
                                  Deactivate
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!listLoading && users.length > 0 && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-border/50 bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => fetchUsers(currentPage - 1)}
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
                onClick={() => fetchUsers(currentPage + 1)}
                className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white border-0"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateUserModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => fetchUsers(1)}
      />

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setPendingAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.action === "activate"
                ? "Activate user?"
                : "Deactivate user?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.action === "activate"
                ? `Are you sure you want to activate ${pendingAction?.userName ?? "this user"}? They will be able to access the system again.`
                : `Are you sure you want to deactivate ${pendingAction?.userName ?? "this user"}? They will no longer be able to access the system.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (pendingAction)
                  handleStatusChange(
                    pendingAction.userId,
                    pendingAction.action
                  );
              }}
              className={
                pendingAction?.action === "deactivate"
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }
            >
              {pendingAction?.action === "activate" ? "Activate" : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CompanyUsers;
