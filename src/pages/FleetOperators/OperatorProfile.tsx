import { useState, useEffect, type ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Activity,
  Calendar,
  IdCard,
  Lock,
  Mail,
  Pencil,
  Phone,
  Shield,
  UserCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getOperatorById, updateFleetOperator } from "@/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
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

type Primitive = string | number | boolean | null | undefined;

const statusConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: "Active",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  },
  inactive: {
    label: "Inactive",
    className:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  },
  suspended: {
    label: "Suspended",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  },
};

const formatLabel = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const isIsoDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value) || /^\d{4}-\d{2}-\d{2}$/.test(value);

const formatPrimitive = (value: Primitive) => {
  if (value === null || value === undefined || value === "") return "N/A";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" && isIsoDate(value)) return new Date(value).toLocaleString();
  return String(value);
};

const OperatorProfile = () => {
  const params = useParams();
  const operatorId = params.operator_id || params.company_id || params.id;
  const navigate = useNavigate();
  const { user: loggedInUser } = useAuth();
  const isSuperAdmin = loggedInUser?.role === "super_admin";

  const [operator, setOperator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});

  const [editForm, setEditForm] = useState({ name: "", phone: "", role: "", permissions: [] as string[] });
  const rolesList = [
    { value: "super_admin", label: "Super Admin" },
    { value: "admin", label: "Admin" },
    { value: "manager", label: "Manager" },
    { value: "dispatcher", label: "Dispatcher" },
  ];
  const permissionsList = ["COMPANY_VIEW", "COMPANY_EDIT", "ROVER_VIEW"];

  useEffect(() => {
    const fetchOperatorData = async () => {
      if (!operatorId) return;
      try {
        setLoading(true);
        const res = await getOperatorById(operatorId);
        const data = res.data?.data?.operator || res.data?.data;
        setOperator(data);
        setEditForm({
          name: data.name,
          phone: data.phone || "",
          role: data.role,
          permissions: Array.isArray(data.permissions)
            ? data.permissions.filter((perm: string) => permissionsList.includes(perm))
            : [],
        });
      } catch (err) {
        toast.error("Failed to load operator details");
        navigate("/fleet-operators");
      } finally {
        setLoading(false);
      }
    };
    fetchOperatorData();
  }, [operatorId]);

  const handleSaveClick = () => {
    if (!isSuperAdmin) return;
    setPendingAction(() => async () => {
      try {
        const selectedPermissions = Array.from(
          new Set(editForm.permissions.filter((perm) => permissionsList.includes(perm)))
        );
        const normalizedCurrentPermissions = Array.from(
          new Set(
            (Array.isArray(operator?.permissions) ? operator.permissions : []).filter((perm: string) =>
              permissionsList.includes(perm)
            )
          )
        );

        const payload: Record<string, string | string[]> = {};
        if (editForm.name !== (operator?.name ?? "")) payload.name = editForm.name;
        if (editForm.phone !== (operator?.phone ?? "")) payload.phone = editForm.phone;
        if (editForm.role !== (operator?.role ?? "")) payload.role = editForm.role;

        const permissionsChanged =
          selectedPermissions.length !== normalizedCurrentPermissions.length ||
          selectedPermissions.some((perm) => !normalizedCurrentPermissions.includes(perm));
        if (permissionsChanged) payload.permissions = selectedPermissions;

        if (Object.keys(payload).length === 0) {
          setIsEditing(false);
          toast.info("No changes to update");
          return;
        }

        await updateFleetOperator(operatorId as string, payload);
        setOperator({ ...operator, ...payload });
        setIsEditing(false);
        toast.success("Profile updated");
      } catch (err) {
        toast.error("Update failed");
      }
    });
    setShowConfirm(true);
  };

  const togglePermission = (perm: string) => {
    if (!isSuperAdmin) return;
    setEditForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  if (loading) {
    return (
      <div className="space-y-4 pt-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6" dir="ltr">
      <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
        {isSuperAdmin && !isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white rounded-xl">
            <Pencil size={14} className="mr-2" /> Edit Profile
          </Button>
        ) : isSuperAdmin && isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleSaveClick} className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white rounded-xl">
              Save Changes
            </Button>
          </div>
        ) : null}
      </div>

      <div className="mb-6 flex flex-col items-center gap-6 rounded-3xl bg-[#2ec8cf] p-6 shadow-xl shadow-[#2ec8cf]/10 md:flex-row">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-white/30 bg-white/20 text-3xl font-black uppercase text-white backdrop-blur-md">
          {editForm.name?.slice(0, 1)}
        </div>

        <div className="w-full flex-1 text-center text-white md:text-left">
          <div className="mb-3 flex flex-col items-center gap-3 md:flex-row">
            {isSuperAdmin && isEditing ? (
              <Input
                className="h-11 max-w-sm border-white/30 bg-white/10 text-2xl font-black text-white placeholder:text-white/70 focus-visible:ring-white/40"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            ) : (
              <h2 className="text-3xl font-black tracking-tight">{operator?.name}</h2>
            )}
            <Badge
              variant="outline"
              className={`border text-xs font-bold uppercase ${statusConfig[operator?.status?.toLowerCase()]?.className || "border-white/40 bg-white/20 text-white"}`}
            >
              {statusConfig[operator?.status?.toLowerCase()]?.label || operator?.status || "Unknown"}
            </Badge>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-start">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/5 px-3 py-1.5 text-xs font-medium">
              <Mail size={14} className="opacity-80" /> {operator?.email}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/5 px-3 py-1.5 text-xs font-medium">
              <Phone size={14} className="opacity-80" />
              {isSuperAdmin && isEditing ? (
                <Input
                  className="h-7 w-32 border-white/30 bg-transparent px-1 text-white"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              ) : (
                operator?.phone || "N/A"
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card className="rounded-3xl border-border/60 bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-black">
                <UserCircle size={18} className="text-[#2ec8cf]" />
                Profile Details
              </CardTitle>
              <CardDescription>Core profile and account metadata.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InfoCard icon={<Mail size={16} className="text-[#2ec8cf]" />} label="Email" value={operator?.email} />
              <InfoCard
                icon={<Phone size={16} className="text-[#2ec8cf]" />}
                label="Phone"
                value={isSuperAdmin && isEditing ? (
                  <Input
                    className="h-8 bg-muted/50 text-xs"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                ) : (
                  operator?.phone
                )}
              />
              <InfoCard
                icon={<Activity size={16} className="text-[#2ec8cf]" />}
                label="Role"
                value={
                  isSuperAdmin && isEditing ? (
                    <select
                      className="h-8 min-w-[140px] rounded-md border border-input bg-muted/30 px-2 text-xs font-medium transition-all focus:ring-2 focus:ring-[#2ec8cf]"
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    >
                      {rolesList.map((role) => (
                        <option key={role.value} value={role.value} className="dark:bg-[#0f172a]">
                          {role.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    operator?.role?.replace(/_/g, " ")
                  )
                }
              />
              <InfoCard icon={<Shield size={16} className="text-violet-500" />} label="Status" value={operator?.status} />
              <InfoCard icon={<IdCard size={16} className="text-sky-500" />} label="Operator ID" value={operator?.operator_id || operator?.id} />
              <InfoCard
                icon={<Calendar size={16} className="text-emerald-500" />}
                label="Created At"
                value={formatPrimitive(operator?.created_at)}
              />
              <InfoCard
                icon={<Calendar size={16} className="text-amber-500" />}
                label="Updated At"
                value={formatPrimitive(operator?.updated_at)}
              />
            </CardContent>
          </Card>


        </div>

        <div className="space-y-6">
          <Card className="h-fit rounded-3xl border-border/60 bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-black">
                <Lock size={18} className="text-[#2ec8cf]" />
                Permissions
              </CardTitle>
              <CardDescription>Assigned access controls for this operator.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isSuperAdmin && isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {permissionsList.map((perm) => (
                    <button
                      key={perm}
                      type="button"
                      onClick={() => togglePermission(perm)}
                      className={`rounded-md border px-3 py-1.5 text-[10px] font-bold uppercase transition-all ${
                        editForm.permissions.includes(perm)
                          ? "border-[#2ec8cf] bg-[#2ec8cf] text-white shadow-lg shadow-[#2ec8cf]/20"
                          : "border-border/50 bg-muted/30 text-muted-foreground hover:border-[#2ec8cf]"
                      }`}
                    >
                      {perm.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(operator?.permissions) && operator.permissions.length > 0 ? (
                    operator.permissions.map((perm: string) => (
                      <Badge
                        key={perm}
                        variant="outline"
                        className="border-border/60 bg-muted/30 px-3 py-1.5 text-[10px] font-bold uppercase text-muted-foreground"
                      >
                        {perm.replace(/_/g, " ")}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No permissions assigned.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="h-fit rounded-3xl border-border/60 bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-black">
                <Shield size={18} className="text-[#2ec8cf]" />
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <QuickDataRow label="Role" value={operator?.role?.replace(/_/g, " ")} />
              <QuickDataRow label="Status" value={operator?.status} />
              <QuickDataRow label="Email" value={operator?.email} />
              <QuickDataRow label="Phone" value={operator?.phone} />
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="rounded-[1.5rem] border-border/50 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black text-foreground">Confirm Change</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to proceed? This will update the operator profile in the directory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-none bg-muted text-muted-foreground rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                pendingAction();
                setShowConfirm(false);
              }}
              className="rounded-xl bg-[#2ec8cf] text-white shadow-lg shadow-[#2ec8cf]/20 hover:bg-[#2ec8cf]/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const QuickDataRow = ({ label, value }: { label: string; value: Primitive }) => (
  <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-2 last:border-none last:pb-0">
    <Label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">{label}</Label>
    <span className="text-right font-semibold text-foreground">{formatPrimitive(value)}</span>
  </div>
);


const InfoCard = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: Primitive | ReactNode;
}) => (
  <Card className="group border-border/50 bg-card shadow-sm transition-all hover:border-[#2ec8cf]/30">
    <CardContent className="flex items-center gap-4 p-4">
      <div className="rounded-xl bg-muted p-3 transition-transform duration-300 group-hover:scale-105">{icon}</div>
      <div className="min-w-0">
        <p className="mb-0.5 text-[9px] font-black uppercase tracking-tighter text-muted-foreground">{label}</p>
        <div className="truncate text-xs font-black text-foreground">
          {typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value == null
            ? formatPrimitive(value as Primitive)
            : value}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default OperatorProfile;