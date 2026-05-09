import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Users,
  RefreshCw,
  MoreHorizontal,
  UserCircle,
  Edit3,
  Power,
  PlusCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  activateOperator,
  suspendOperator,
  deactivateOperator,
  getFleetOperators,
  updateFleetOperator,
  createFleetOperator
} from "@/api";

const statusConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  },
  inactive: {
    label: "Inactive",
    className: "bg-rose-500/15 text-rose-600 border-rose-500/30",
  },
  suspended: {
    label: "Suspended",
    className: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  },
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

const FleetOperators = () => {
  const navigate = useNavigate();
  const { user: loggedInUser } = useAuth();
  const isSuperAdmin = loggedInUser?.role === "super_admin";

  // --- State Management ---
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "fleet_manager",
    permissions: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");
  const [operators, setOperators] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);

  // --- Confirmation Dialog State ---
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    operatorId: "",
    newStatus: "",
  });

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const ITEMS_PER_PAGE = 6;

  const permissionsList = ["COMPANY_VIEW", "COMPANY_EDIT", "ROVER_VIEW"];
  const rolesList = [
    { value: "super_admin", label: "Super Admin" },
    { value: "fleet_manager", label: "Fleet Manager" },
    { value: "operations_manager", label: "Operations Manager" },
    { value: "support_engineer", label: "Support Engineer" },
    { value: "analyst", label: "Analyst" },
  ];
  const tableStatusFilters = [
    { value: "all", label: "All statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" },
  ];
  const tableRoleFilters = [
    { value: "all", label: "All roles" },
    { value: "super_admin", label: "Super Admin" },
    { value: "admin", label: "Admin" },
    { value: "manager", label: "Manager" },
    { value: "dispatcher", label: "Dispatcher" },
  ];

  const handleStatusChangeRequest = (operatorId: string, newStatus: string) => {
    setConfirmModal({
      show: true,
      operatorId,
      newStatus,
    });
  };

  const confirmStatusChange = async () => {
    const { operatorId, newStatus } = confirmModal;
    setConfirmModal((prev) => ({ ...prev, show: false }));

    if (!isSuperAdmin) return;

    try {
      setListLoading(true);
      if (newStatus === "active") {
        await activateOperator(operatorId, { reason: "Account verification completed" });
      } else if (newStatus === "suspended") {
        await suspendOperator(operatorId, { reason: "Policy violation investigation" });
      } else if (newStatus === "inactive") {
        await deactivateOperator(operatorId, { reason: "Employee resignation or offboarding" });
      }

      setOperators((prev) =>
        prev.map((op) =>
          (op.operator_id === operatorId || op.id === operatorId)
            ? { ...op, status: newStatus }
            : op,
        ),
      );

      toast.success("Status Updated", {
        description: `Operator is now ${newStatus.toUpperCase()}`,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to change operator status";
      toast.error("Error", { description: msg });
      fetchOperators(currentPage);
    } finally {
      setListLoading(false);
    }
  };

  const fetchOperators = async (
    page = 1,
    filters?: { status?: string; role?: string },
  ) => {
    setListLoading(true);
    try {
      const statusFilter = filters?.status ?? selectedStatus;
      const roleFilter = filters?.role ?? selectedRole;
      const res = await getFleetOperators({
        page,
        limit: ITEMS_PER_PAGE,
        status: statusFilter === "all" ? undefined : statusFilter,
        role: roleFilter === "all" ? undefined : roleFilter,
      });
      if (res.status === 204) {
        setOperators([]);
        return;
      }
      const responseData = res.data?.data;
      if (responseData) {
        setOperators(
          responseData.operators || (Array.isArray(responseData) ? responseData : []),
        );
        setTotalPages(responseData.pagination?.pages || 1);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setListLoading(false);
    }
  };

  const handleEditClick = (op: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditingId(op.operator_id || op.id);
    setForm({
      name: op.name,
      email: op.email,
      phone: op.phone,
      role: op.role,
      permissions: op.permissions || [],
    });
    setShowFormModal(true);
  };

  const handleSyncReset = () => {
    const defaultStatus = "all";
    const defaultRole = "all";
    const isAlreadyDefault =
      selectedStatus === defaultStatus && selectedRole === defaultRole;

    setSelectedStatus(defaultStatus);
    setSelectedRole(defaultRole);
    setCurrentPage(1);

    // If filters are unchanged, force one refresh; otherwise effect will fetch once.
    if (isAlreadyDefault) {
      fetchOperators(1, { status: defaultStatus, role: defaultRole });
    }
  };

  useEffect(() => {
    fetchOperators(1);
  }, [selectedStatus, selectedRole]);

  const togglePermission = (perm: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("Validation Error", { description: "Please fill in all required fields." });
      setLoading(false);
      return;
    }

    try {
      if (isEditing && editingId) {
        await updateFleetOperator(editingId, form);
        toast.success("Success", { description: "Operator updated successfully!" });
      } else {
        const res = await createFleetOperator(form);
        const tempPass = res.data?.data?.credentials?.temporary_password;

        toast.success("Operator created successfully!", {
          description: tempPass ? `Temp Password: ${tempPass}` : "Credentials sent to email.",
          duration: 20000,
          action: tempPass ? {
            label: "Copy Pass",
            onClick: () => {
              navigator.clipboard.writeText(tempPass);
              toast.info("Password copied to clipboard");
            }
          } : undefined
        });
      }

      setForm({ name: "", email: "", phone: "", role: "fleet_manager", permissions: [] });
      setIsEditing(false);
      setEditingId(null);
      setShowFormModal(false);
      fetchOperators(currentPage);
    } catch (err: any) {
      const msg = err.response?.data?.message || "An error occurred";
      setError(msg);
      toast.error("Operation Failed", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Users className="h-7 w-7 text-[#2ec8cf]" />
          Fleet Operators
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage operator accounts, roles, and system access
        </p>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-muted/20 border-b border-border/50">
          <div>
            <CardTitle className="text-base font-semibold">Fleet Operators</CardTitle>
            <CardDescription>
              {operators.length} {operators.length === 1 ? "operator" : "operators"}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => {
                setIsEditing(false);
                setForm({ name: "", email: "", phone: "", role: "fleet_manager", permissions: [] });
                setShowFormModal(true);
              }}
              className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white"
              size="sm"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Operator
            </Button>
            <select
              className="h-9 rounded-md border border-input bg-muted/30 px-3 text-xs font-medium focus:ring-2 focus:ring-[#2ec8cf] transition-all min-w-[140px]"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {tableStatusFilters.map((status) => (
                <option key={status.value} value={status.value} className="dark:bg-[#0f172a]">
                  {status.label}
                </option>
              ))}
            </select>
            <select
              className="h-9 rounded-md border border-input bg-muted/30 px-3 text-xs font-medium focus:ring-2 focus:ring-[#2ec8cf] transition-all min-w-[140px]"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {tableRoleFilters.map((role) => (
                <option key={role.value} value={role.value} className="dark:bg-[#0f172a]">
                  {role.label}
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
          <div className="rounded-b-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Identity Profile
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Functional Role
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
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Skeleton className="h-8 w-8 ml-auto rounded-md" />
                      </td>
                    </tr>
                  ))
                ) : operators.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                      No operators found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  operators.map((op) => {
                    const opId = op.operator_id || op.id;
                    return (
                      <tr
                        key={opId}
                        onClick={() => navigate(`/fleet-operators/${opId}`)}
                        className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground group-hover:text-[#2ec8cf] transition-colors">
                            {op.name}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">
                            {opId}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className="bg-muted text-muted-foreground border-border font-normal text-[11px]"
                          >
                            {op.role?.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={op.status} />
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
                                Manage Operator
                              </DropdownMenuLabel>

                              <DropdownMenuItem onClick={() => navigate(`/fleet-operators/${opId}`)}>
                                <UserCircle className="mr-2 h-4 w-4 opacity-70" /> View Profile
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={(e) => handleEditClick(op, e)}>
                                <Edit3 className="mr-2 h-4 w-4 opacity-70" /> Edit Details
                              </DropdownMenuItem>

                              {isSuperAdmin && (
                                <>
                                  <DropdownMenuSeparator />
                                  {op.status === "active" ? (
                                    <>
                                      <DropdownMenuItem
                                        className="text-amber-600 focus:text-amber-600"
                                        onClick={() => handleStatusChangeRequest(opId, "suspended")}
                                      >
                                        <Power className="mr-2 h-4 w-4" /> Suspend
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-rose-600 focus:text-rose-600"
                                        onClick={() => handleStatusChangeRequest(opId, "inactive")}
                                      >
                                        <Power className="mr-2 h-4 w-4" /> Deactivate
                                      </DropdownMenuItem>
                                    </>
                                  ) : (
                                    <DropdownMenuItem
                                      className="text-emerald-600 focus:text-emerald-600"
                                      onClick={() => handleStatusChangeRequest(opId, "active")}
                                    >
                                      <Power className="mr-2 h-4 w-4" /> Activate Account
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!listLoading && operators.length > 0 && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-border/50 bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => fetchOperators(currentPage - 1)}
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
                onClick={() => fetchOperators(currentPage + 1)}
                className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white border-0"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- CONFIRMATION DIALOG --- */}
      <Dialog open={confirmModal.show} onOpenChange={(val) => setConfirmModal(prev => ({ ...prev, show: val }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm status change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change this operator&apos;s status to{" "}
              <span className="font-semibold text-foreground">{confirmModal.newStatus}</span>? This
              action will affect their system access immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}>
              Cancel
            </Button>
            <Button
              onClick={confirmStatusChange}
              className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL: CREATE / MODIFY OPERATOR --- */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Users className="w-5 h-5 text-[#2ec8cf]" />
                  {isEditing ? "Edit Fleet Operator" : "Create Fleet Operator"}
                </CardTitle>
                <CardDescription>
                  {isEditing
                    ? "Update account details and access level."
                    : "Set up access credentials and roles for fleet personnel."}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 rounded-md text-sm border border-red-500/20 bg-red-500/10 text-red-600">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Full Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                    className="bg-muted/30 focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Email Address {isEditing && "(Read only)"}
                  </Label>
                  <Input
                    disabled={isEditing}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@example.com"
                    className="bg-muted/30 focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Phone Number</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1..."
                    className="bg-muted/30 focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Designated Role</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm focus:ring-2 focus:ring-[#2ec8cf] transition-all font-medium"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    {rolesList.map((r) => <option key={r.value} value={r.value} className="dark:bg-[#0f172a]">{r.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-medium text-muted-foreground">
                  Permissions
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {permissionsList.map((perm) => (
                    <button
                      key={perm}
                      type="button"
                      onClick={() => togglePermission(perm)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium border transition-all ${
                        form.permissions.includes(perm)
                          ? "bg-[#2ec8cf] border-[#2ec8cf] text-white"
                          : "bg-muted/30 border-border text-muted-foreground hover:border-[#2ec8cf]"
                      }`}
                    >
                      {perm.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <Button variant="ghost" onClick={() => setShowFormModal(false)} className="text-muted-foreground">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading} className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white">
                  {loading ? "Processing..." : isEditing ? "Save Changes" : "Create Operator"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FleetOperators;