import {
  Mail,
  Phone,
  UserCircle,
  Shield,
  IdCard,
  Building2,
  Clock,
  CheckCircle,
  Eye,
  Settings,
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserDetails, editUserData } from "@/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const ROLES: Array<"company_admin" | "dispatcher" | "store_manager" | "customer_support" | "analyst"> = [
  "company_admin",
  "dispatcher",
  "store_manager",
  "customer_support",
  "analyst",
];

const Details = () => {
  const navigate = useNavigate();
  const { user_id } = useParams<{ user_id: string }>();
  const { user: loggedInUser } = useAuth();
  const isSuperAdmin = loggedInUser?.role === "company_admin";
  const isEditingSelf =
    user_id != null &&
    String(loggedInUser?.user_id ?? loggedInUser?.id ?? "") === user_id;
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState<string>("");

  const fetchUser = async () => {
    if (!user_id) return;
    try {
      setLoading(true);
      const response = await getUserDetails(user_id);
      const data = response.data?.data?.user;
      const userData = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
      setUser(userData);
      if (userData) {
        setEditName(String(userData.name ?? ""));
        setEditPhone(String(userData.phone ?? ""));
        setEditRole(String(userData.role ?? ""));
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(ax?.response?.data?.message ?? ax?.message ?? "Failed to load user details");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user_id) {
      setLoading(false);
      return;
    }
    fetchUser();
  }, [user_id]);

  const startEditing = () => {
    setEditName(user?.name != null && user?.name !== "" ? String(user.name) : "");
    setEditPhone(user?.phone != null && user?.phone !== "" ? String(user.phone) : "");
    setEditRole(user?.role != null && user?.role !== "" ? String(user.role) : "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditName(user?.name != null && user?.name !== "" ? String(user.name) : "");
    setEditPhone(user?.phone != null && user?.phone !== "" ? String(user.phone) : "");
    setEditRole(user?.role != null && user?.role !== "" ? String(user.role) : "");
  };

  const saveUser = async () => {
    if (!user_id) return;
    try {
      setSaving(true);
      const payload: { name?: string; phone?: string; role?: (typeof ROLES)[number] } = {
        name: editName.trim(),
        phone: editPhone.trim(),
      };
      const role = editRole.trim();
      if (ROLES.includes(role as (typeof ROLES)[number])) {
        payload.role = role as (typeof ROLES)[number];
      }
      await editUserData(user_id, payload);
      await fetchUser();
      setIsEditing(false);
      toast.success("User updated successfully");
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(ax?.response?.data?.message ?? ax?.message ?? "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const permissions: string[] = Array.isArray(user?.permissions)
    ? (user.permissions as string[])
    : [];
  const permissionsBySubject = permissions.reduce(
    (acc: Record<string, string[]>, perm) => {
      const dot = perm.indexOf(".");
      const subject = dot >= 0 ? perm.slice(0, dot) : perm;
      const action = dot >= 0 ? perm.slice(dot + 1) : "";
      if (!acc[subject]) acc[subject] = [];
      const label = action === "*" ? "ALL" : action;
      if (label && !acc[subject].includes(label)) acc[subject].push(label);
      return acc;
    },
    {} as Record<string, string[]>
  );
  const subjectEntries: [string, string[]][] = Object.entries(permissionsBySubject);

  const actionIcons: Record<string, typeof Shield> = {
    edit: Pencil,
    read: Eye,
    delete: Trash2,
    manage: Settings,
    create: Plus,
    all: Shield,
  };
  const getActionIcon = (action: string) =>
    actionIcons[action.toLowerCase()] ?? Shield;

  if (!user_id) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Invalid user. <button type="button" onClick={() => navigate("/company-users")} className="text-[#2ec8cf] underline">Back to list</button></p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading user details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">User not found. <button type="button" onClick={() => navigate("/company-users")} className="text-[#2ec8cf] underline">Back to list</button></p>
      </div>
    );
  }

  const display = (v: unknown) => (v != null && v !== "" ? String(v) : "—");

  return (
    <div className="p-8 bg-gray-50 min-h-screen dark:bg-gray-900">
      {/* Header with back, title, and actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/company-users")}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Back to company users"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold text-gray-700 dark:text-white flex items-center gap-2">
            User Details
          </h1>
        </div>
        <div className="flex gap-2">
          {isSuperAdmin &&
            (isEditing ? (
              <>
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-all duration-200"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveUser}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2ec8cf] text-white font-medium rounded-xl shadow-sm hover:bg-[#2ec8cf]/90 hover:shadow-md active:scale-[0.98] disabled:opacity-50 transition-all duration-200"
                >
                  <Pencil size={18} />
                  {saving ? "Saving…" : "Save"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startEditing}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2ec8cf] text-white font-medium rounded-xl shadow-sm hover:bg-[#2ec8cf]/90 hover:shadow-md active:scale-[0.98] transition-all duration-200"
              >
                <Pencil size={18} />
                Edit
              </button>
            ))}
        </div>
      </div>

      {/* Main Banner */}
      <div className="bg-[#2ec8cf] rounded-2xl p-8 mb-8 flex items-center gap-6 relative overflow-hidden">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-white/30 border-4 border-white/50 flex items-center justify-center text-3xl font-bold text-white uppercase">
            {user?.name && String(user.name) !== "—"
              ? String(user.name).slice(0, 2)
              : "—"}
          </div>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white text-[#2ec8cf] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm capitalize">
            {display(user?.status)}
          </span>
        </div>

        <div className="text-white flex-1">
          {isEditing ? (
            <div className="space-y-3 max-w-md">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/40 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                  placeholder="Name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/40 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                  placeholder="Phone"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  disabled={isEditingSelf}
                  className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/40 text-white focus:outline-none focus:ring-2 focus:ring-white/50 text-sm [&>option]:text-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="text-gray-800">
                      {r.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold capitalize">{display(user?.name)}</h2>
              <p className="opacity-90 text-sm mb-3">{display(user?.role)}</p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 text-xs">
                  <Mail size={14} /> {display(user?.email)}
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 text-xs">
                  <Phone size={14} /> {display(user?.phone)}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-60 flex items-center gap-1 text-sm text-white border border-white/40 px-3 py-1 rounded-full">
          <CheckCircle size={16} /> {display(user?.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Info cards */}
        <div className="space-y-4">
          <InfoCard
            icon={<IdCard className="text-blue-500" />}
            label="User ID"
            value={display(user?.user_id)}
          />
          <InfoCard
            icon={<Building2 className="text-purple-500" />}
            label="Company ID"
            value={display(user?.company_id)}
          />
          <InfoCard
            icon={<UserCircle className="text-cyan-500" />}
            label="Role"
            value={display(user?.role)}
          />
          <InfoCard
            icon={<Clock className="text-emerald-500" />}
            label="Created at"
            value={display(user?.created_at)}
          />
          <InfoCard
            icon={<Clock className="text-amber-500" />}
            label="Updated at"
            value={display(user?.updated_at)}
          />
        </div>

        {/* Right Column: Permissions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-gray-700 dark:text-white flex items-center gap-2">
              Permissions
            </h3>
          </div>
          <div className="p-5 space-y-4">
            {subjectEntries.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">—</p>
            ) : (
              subjectEntries.map(([subject, actions]) => (
                <div
                  key={subject}
                  className="border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0 pb-4"
                >
                  <p className="text-sm font-semibold text-gray-700 dark:text-white capitalize mb-2">
                    {subject}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {actions.map((action) => {
                      const Icon = getActionIcon(action);
                      return (
                        <span
                          key={action}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium"
                        >
                          <Icon size={12} className="text-gray-400 shrink-0" />{" "}
                          {action}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">{icon}</div>
    <div>
      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-tight">
        {label}
      </p>
      <p className="text-base font-bold text-gray-800 dark:text-white">
        {value}
      </p>
    </div>
  </div>
);

export default Details;
