import { Mail, Phone, UserCircle, Shield, Pencil, Trash2, Lock, IdCard, Building2, Clock, CheckCircle, Eye, Settings, Plus, X } from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { profilePicUrls } from "@/assets/profilepic";
import { getProfile, editProfileDetails } from "@/api";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    const storedAvatar = localStorage.getItem("selectedAvatar");
    if (storedAvatar) setAvatar(storedAvatar);
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      const user = response.data?.data?.user ?? response.data?.data ?? response.data;
      setProfile(user);
      setEditName(user?.name ?? "");
      setEditPhone(user?.phone ?? "");
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(ax?.response?.data?.message ?? ax?.message ?? "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const startEditing = () => {
    setEditName(profile?.name ?? "");
    setEditPhone(profile?.phone ?? "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditName(profile?.name ?? "");
    setEditPhone(profile?.phone ?? "");
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      await editProfileDetails({ name: editName.trim(), phone: editPhone.trim() });
      await fetchProfile();
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(ax?.response?.data?.message ?? ax?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const permissions: string[] = Array.isArray(profile?.permissions) ? profile.permissions : [];

  // Group permissions by subject (format: "subject.action"); show action "*" as "ALL"
  const permissionsBySubject = permissions.reduce((acc: Record<string, string[]>, perm) => {
    const dot = perm.indexOf(".");
    const subject = dot >= 0 ? perm.slice(0, dot) : perm;
    const action = dot >= 0 ? perm.slice(dot + 1) : "";
    if (!acc[subject]) acc[subject] = [];
    const label = action === "*" ? "ALL" : action;
    if (label && !acc[subject].includes(label)) acc[subject].push(label);
    return acc;
  }, {} as Record<string, string[]>);
  const subjectEntries: [string, string[]][] = Object.entries(permissionsBySubject);

  const actionIcons: Record<string, typeof Shield> = {
    edit: Pencil,
    read: Eye,
    delete: Trash2,
    manage: Settings,
    create: Plus,
    all: Shield,
  };
  const getActionIcon = (action: string) => actionIcons[action.toLowerCase()] ?? Shield;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-6 pb-4 text-foreground transition-colors duration-200">
      {/* Header section with Actions */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          User Profile
        </h1>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-border bg-card text-foreground font-medium rounded-xl shadow-sm hover:bg-accent disabled:opacity-50 transition-all duration-200"
              >
                <X size={18} />
                Cancel
              </button>
              <button
                type="button"
                onClick={saveProfile}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2ec8cf] text-white font-medium rounded-xl shadow-sm hover:bg-[#2ec8cf]/90 hover:shadow-md active:scale-[0.98] disabled:opacity-50 transition-all duration-200 dark:bg-[#2ec8cf] dark:hover:bg-[#2ec8cf]/90"
              >
                <Pencil size={18} />
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2ec8cf] text-white font-medium rounded-xl shadow-sm hover:bg-[#2ec8cf]/90 hover:shadow-md active:scale-[0.98] transition-all duration-200 dark:bg-[#2ec8cf] dark:hover:bg-[#2ec8cf]/90"
            >
              <Pencil size={18} />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Main Banner */}
      <div className="bg-[#2ec8cf] rounded-2xl p-8 mb-8 flex items-center gap-6 relative overflow-hidden">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-white/30 border-4 border-white/50 flex items-center justify-center text-3xl font-bold text-white uppercase">
            {avatar ? <img src={profilePicUrls[avatar]} className="rounded-full" /> : (profile?.name?.slice(0, 2) ?? "—")}
          </div>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white text-[#2ec8cf] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm capitalize">
            {profile?.status ?? "—"}
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
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/40 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                  placeholder="Phone number"
                />
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold capitalize">{profile?.name ?? "—"}</h2>
              <p className="opacity-90 text-sm mb-3">{profile?.role ?? "—"}</p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 text-xs">
                  <Mail size={14} /> {profile?.email ?? "—"}
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 text-xs">
                  <Phone size={14} /> {profile?.phone ?? "—"}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-60 flex items-center gap-1 text-sm text-white border border-white/40 px-3 py-1 rounded-full">
          <CheckCircle size={16} /> {profile?.status ?? "—"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: ProfileData fields */}
        <div className="space-y-4">
          <InfoCard icon={<IdCard className="text-blue-500" />} label="User ID" value={profile?.user_id ?? "—"} />
          <InfoCard icon={<Building2 className="text-purple-500" />} label="Company ID" value={profile?.company_id ?? "—"} />
          <InfoCard icon={<UserCircle className="text-cyan-500" />} label="Role" value={profile?.role ?? "—"} />
          <InfoCard icon={<Clock className="text-emerald-500" />} label="Created at" value={profile?.created_at ?? "—"} />
          <InfoCard icon={<Clock className="text-amber-500" />} label="Updated at" value={profile?.updated_at ?? "—"} />
        </div>

        {/* Right Column: Permissions grouped by subject, actions listed (e.g. subject.action → * as ALL) */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              Permissions
            </h3>
          </div>
          <div className="p-5 space-y-4">
            {subjectEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">—</p>
            ) : (
              subjectEntries.map(([subject, actions]) => (
                <div key={subject} className="border-b border-border last:border-0 last:pb-0 pb-4 last:pb-0">
                  <p className="text-sm font-semibold capitalize mb-2">{subject}</p>
                  <div className="flex flex-wrap gap-2">
                    {actions.map((action) => {
                      const Icon = getActionIcon(action);
                      return (
                        <span
                          key={action}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-medium"
                        >
                          <Icon size={12} className="text-muted-foreground/70 shrink-0" /> {action}
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

// Helper Component for Info Cards
const InfoCard = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="bg-card p-4 rounded-2xl shadow-sm border border-border flex items-center gap-4">
    <div className="p-3 bg-muted rounded-xl">{icon}</div>
    <div>
      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-tight">{label}</p>
      <p className="text-base font-bold">{value}</p>
    </div>
  </div>
);

export default Profile;