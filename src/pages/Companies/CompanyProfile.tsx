import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BellRing,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Hash,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Save,
  Settings2,
  Tablet,
  Target,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  addCompanyLocation,
  deleteCompanyLocation,
  getCompanyById,
  getCompanyStats,
  regenerateCompanyCredentials,
  unassignRoversFromCompany,
  updateCompany,
  updateCompanySettings,
  updateCompanyLocation,
} from "@/api";
import { Company, CompanyLocation, CompanyStats, UpdateCompanyLocation } from "@/common";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import CompanyLocationModal, {
  createDefaultLocationForm,
  DEFAULT_LOCATION_COORDINATES,
  normalizeOperatingHours,
} from "./CompanyLocationModal";

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  trial: { label: "Trial", className: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  suspended: { label: "Suspended", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground border-border" },
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
};

const formatMoney = (value?: number) => {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPercent = (value?: number) => {
  if (value === undefined || value === null) return "—";
  return `${value}%`;
};

const formatBool = (value?: boolean) => {
  if (value === undefined || value === null) return "—";
  return value ? "Enabled" : "Disabled";
};

const valueText = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const createSettingsForm = (settings?: Company["settings"]) => ({
  auto_dispatch: settings?.auto_dispatch ?? false,
  require_otp: settings?.require_otp ?? false,
  enable_face_detection: settings?.enable_face_detection ?? false,
  enable_weight_check: settings?.enable_weight_check ?? false,
  default_delivery_timeout: settings?.default_delivery_timeout ?? 0,
  notification_preferences: {
    email: settings?.notification_preferences?.email ?? false,
    sms: settings?.notification_preferences?.sms ?? false,
    webhook: settings?.notification_preferences?.webhook ?? false,
  },
});

const CompanyProfile = () => {
  const { company_id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRawApiData, setShowRawApiData] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [locationModal, setLocationModal] = useState<{ open: boolean; mode: "add" | "edit"; data?: CompanyLocation }>({
    open: false,
    mode: "add",
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; locId: string | null }>({
    open: false,
    locId: null,
  });
  const [credentialsConfirmOpen, setCredentialsConfirmOpen] = useState(false);
  const [credentialsLoading, setCredentialsLoading] = useState(false);
  const [credentialsReason, setCredentialsReason] = useState("");
  const [selectedRoverIds, setSelectedRoverIds] = useState<string[]>([]);
  const [unassignLoading, setUnassignLoading] = useState(false);
  const [showUnassignConfirm, setShowUnassignConfirm] = useState(false);
  const [locationForm, setLocationForm] = useState<UpdateCompanyLocation>(createDefaultLocationForm());
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsForm, setSettingsForm] = useState(createSettingsForm());

  const [formData, setFormData] = useState({
    name: "",
    primary_contact: "",
    email: "",
    phone: "",
    address: "",
  });

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^\+?[0-9]{7,15}$/.test(phone);
  const refreshCompanyDetails = async (showPageLoading = false) => {
    if (!company_id) return;
    try {
      if (showPageLoading) setLoading(true);
      const detailsRes = await getCompanyById(company_id);
      const details = detailsRes.data?.data?.company;
      setCompany(details ?? null);
      setFormData({
        name: details?.name ?? "",
        primary_contact: details?.contact?.primary_contact ?? "",
        email: details?.contact?.email ?? "",
        phone: details?.contact?.phone ?? "",
        address: details?.contact?.address ?? "",
      });
    } finally {
      if (showPageLoading) setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [companyRes, statsRes] = await Promise.all([
        getCompanyById(company_id as string),
        getCompanyStats(company_id as string),
      ]);
      const data = companyRes.data?.data?.company;
      // console.log("Fetched company:", data);
      setCompany(data);
      setStats(statsRes.data?.data?.stats ?? null);
      setFormData({
        name: data?.name ?? "",
        primary_contact: data?.contact?.primary_contact ?? "",
        email: data?.contact?.email ?? "",
        phone: data?.contact?.phone ?? "",
        address: data?.contact?.address ?? "",
      });
    } catch {
      toast.error("Data retrieval failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (company_id) fetchAllData();
  }, [company_id]);

  useEffect(() => {
    if (!isEditingSettings) {
      setSettingsForm(createSettingsForm(company?.settings));
    }
  }, [company?.settings, isEditingSettings]);

  const resolvedStats = stats ?? company?.stats ?? null;

  const statsCards = useMemo(
    () => [
      { label: "Success Rate", value: formatPercent(resolvedStats?.success_rate), icon: Target },
      { label: "Failure Rate", value: formatPercent(resolvedStats?.failure_rate), icon: TrendingUp },
      { label: "Total Deliveries", value: valueText(resolvedStats?.total_deliveries), icon: TrendingUp },
      { label: "Successful Deliveries", value: valueText(resolvedStats?.successful_deliveries), icon: CheckCircle2 },
      { label: "Failed Deliveries", value: valueText(resolvedStats?.failed_deliveries), icon: Trash2 },
      { label: "Avg Delivery Time", value: resolvedStats?.average_delivery_time !== undefined ? `${resolvedStats.average_delivery_time} min` : "—", icon: Clock },
      { label: "Customer Satisfaction", value: formatPercent(resolvedStats?.customer_satisfaction), icon: Users },
      { label: "Active Users", value: valueText(resolvedStats?.active_users), icon: Users },
      { label: "Monthly Deliveries", value: valueText(resolvedStats?.monthly_deliveries), icon: Calendar },
      { label: "Active Locations", value: valueText(resolvedStats?.active_locations), icon: MapPin },
      { label: "Total Locations", value: valueText(resolvedStats?.total_locations), icon: MapPin },
      { label: "Assigned Rovers", value: valueText(resolvedStats?.assigned_rovers ?? company?.assigned_rovers?.length), icon: Tablet },
    ],
    [company?.assigned_rovers?.length, resolvedStats],
  );

  const paginatedHubs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return company?.locations?.slice(start, start + itemsPerPage) || [];
  }, [company?.locations, currentPage]);

  const totalPages = Math.ceil((company?.locations?.length || 0) / itemsPerPage);

  const handleUpdateProfile = async () => {
    if (!validateEmail(formData.email)) return toast.error("Invalid email format");
    if (!validatePhone(formData.phone)) return toast.error("Invalid phone format");

    try {
      setEditLoading(true);
      setShowConfirm(false);
      const payload = {
        name: formData.name,
        contact: {
          primary_contact: formData.primary_contact,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        },
      };
      await updateCompany(company_id!, payload);
      await refreshCompanyDetails(true);
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  const handleRegenerateCredentials = async () => {
    if (!company_id) return;
    try {
      setCredentialsLoading(true);
      setCredentialsConfirmOpen(false);
      const reason = credentialsReason.trim() || "Manual credential rotation from company profile";
      await regenerateCompanyCredentials(company_id, reason);
      await refreshCompanyDetails(true);
      toast.success("API credentials regenerated");
    } catch {
      toast.error("Failed to regenerate credentials");
    } finally {
      setCredentialsLoading(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!locationForm.name.trim() || !locationForm.address.trim()) {
      return toast.error("Please fill in all location details");
    }

    try {
      setEditLoading(true);
      const payload: UpdateCompanyLocation = {
        ...locationForm,
        coordinates: {
          type: "Point",
          coordinates: [
            locationForm.coordinates?.coordinates?.[0] ?? DEFAULT_LOCATION_COORDINATES[0],
            locationForm.coordinates?.coordinates?.[1] ?? DEFAULT_LOCATION_COORDINATES[1],
          ],
        },
        operating_hours: normalizeOperatingHours(locationForm.operating_hours),
      };

      if (locationModal.mode === "add") {
        await addCompanyLocation(company_id!, payload as any);
        toast.success("Location added");
      } else {
        await updateCompanyLocation(company_id!, locationModal.data!.location_id!, payload as UpdateCompanyLocation);
        toast.success("Location updated");
      }
      await refreshCompanyDetails(true);

      setLocationModal({ open: false, mode: "add" });
      setLocationForm(createDefaultLocationForm());
    } catch {
      toast.error("Operation failed");
    } finally {
      setEditLoading(false);
    }
  };

  const handleLocationModalCancel = () => {
    setLocationModal({ open: false, mode: "add" });
    setLocationForm(createDefaultLocationForm());
  };

  const confirmDeleteLocation = async () => {
    if (!deleteConfirm.locId) return;
    const locIdToDelete = deleteConfirm.locId;
    setDeleteConfirm({ open: false, locId: null });
    try {
      await deleteCompanyLocation(company_id!, locIdToDelete);
      await refreshCompanyDetails(true);
      toast.success("Location removed");
    } catch {
      toast.error("Deletion failed");
    }
  };

  const handleUnassignRover = async (roverId: string) => {
    try {
      await unassignRoversFromCompany(company_id!, [roverId]);
      await refreshCompanyDetails(true);
      setSelectedRoverIds((prev) => prev.filter((id) => id !== roverId));
      toast.success(`Rover ${roverId} unassigned`);
    } catch {
      toast.error("Failed to unassign rover");
    }
  };

  const toggleRoverSelection = (roverId: string) => {
    setSelectedRoverIds((prev) =>
      prev.includes(roverId) ? prev.filter((id) => id !== roverId) : [...prev, roverId],
    );
  };

  const handleUnassignSelected = async () => {
    if (selectedRoverIds.length === 0) return;
    try {
      setUnassignLoading(true);
      setShowUnassignConfirm(false);
      await unassignRoversFromCompany(company_id!, selectedRoverIds);
      await refreshCompanyDetails(true);
      setSelectedRoverIds([]);
      toast.success(`${selectedRoverIds.length} rover(s) unassigned`);
    } catch {
      toast.error("Failed to unassign rovers");
    } finally {
      setUnassignLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!company_id) return;
    if (settingsForm.default_delivery_timeout < 0) {
      toast.error("Default timeout cannot be negative");
      return;
    }

    try {
      setSettingsLoading(true);
      await updateCompanySettings(company_id, settingsForm);
      await refreshCompanyDetails(true);
      setIsEditingSettings(false);
      toast.success("Operational settings updated");
    } catch {
      toast.error("Failed to update settings");
    } finally {
      setSettingsLoading(false);
    }
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

  if (!company) {
    return (
      <div className="pt-16 text-center">
        <p className="text-muted-foreground">Company not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/companies")}>
          Back to Companies
        </Button>
      </div>
    );
  }

  const status = statusConfig[company.status] ?? {
    label: valueText(company.status),
    className: "bg-muted text-muted-foreground border-border",
  };

  const locationCount = company.locations?.length || 0;
  const settings = company.settings;
  const subscriptionPricing = company.subscription?.pricing;

  return (
    <div className="space-y-6 pt-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          {isEditing ? (
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-10 max-w-sm text-xl font-semibold"
            />
          ) : (
            <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
          )}
          <p className="text-sm text-muted-foreground">Company profile and operational overview</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setCredentialsReason("");
              setCredentialsConfirmOpen(true);
            }}
            disabled={credentialsLoading}
            className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white"
          >
            <BellRing className="w-4 h-4 mr-2" />
            {credentialsLoading ? "Regenerating..." : "Regenerate Credentials"}
          </Button>
          {!isEditing ? (
            <Button size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={editLoading}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={() => setShowConfirm(true)} disabled={editLoading}>
                <Save className="w-4 h-4 mr-2" />
                {editLoading ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Company Overview
              </CardTitle>
              <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs inline-flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {company.company_id}
                </span>
                <Badge variant="outline">{company.business_type}</Badge>
                <Badge variant="outline" className={`border ${status.className}`}>
                  {status.label}
                </Badge>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Created: {formatDate(company.created_at)}
              </p>
              <p>Updated: {formatDate(company.updated_at)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Contact Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-[20px_1fr] items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                {isEditing ? (
                  <Input
                    value={formData.primary_contact}
                    onChange={(e) => setFormData({ ...formData, primary_contact: e.target.value })}
                  />
                ) : (
                  <p>{valueText(company.contact?.primary_contact)}</p>
                )}
              </div>
              <div className="grid grid-cols-[20px_1fr] items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                {isEditing ? (
                  <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                ) : (
                  <p>{valueText(company.contact?.email)}</p>
                )}
              </div>
              <div className="grid grid-cols-[20px_1fr] items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                {isEditing ? (
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                ) : (
                  <p>{valueText(company.contact?.phone)}</p>
                )}
              </div>
              <div className="grid grid-cols-[20px_1fr] items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                {isEditing ? (
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                ) : (
                  <p className="leading-6">{valueText(company.contact?.address)}</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Subscription
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-muted-foreground">Tier</p>
              <p>{valueText(company.subscription?.tier)}</p>
              <p className="text-muted-foreground">Billing Cycle</p>
              <p>{valueText(company.subscription?.billing_cycle)}</p>
              <p className="text-muted-foreground">Status</p>
              <p>{valueText(company.subscription?.status)}</p>
              <p className="text-muted-foreground">Start Date</p>
              <p>{formatDate(company.subscription?.start_date)}</p>
              <p className="text-muted-foreground">Renewal Date</p>
              <p>{formatDate(company.subscription?.renewal_date)}</p>
            </div>
            <div className="rounded-md bg-background border p-3">
              <p className="text-xs font-semibold mb-2">Pricing</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <p className="text-muted-foreground">Base Fee</p>
                <p>{formatMoney(subscriptionPricing?.base_fee)}</p>
                <p className="text-muted-foreground">Per Delivery</p>
                <p>{formatMoney(subscriptionPricing?.per_delivery_fee)}</p>
                <p className="text-muted-foreground">Included Deliveries</p>
                <p>{valueText(subscriptionPricing?.included_deliveries)}</p>
                <p className="text-muted-foreground">Overage Rate</p>
                <p>{formatMoney(subscriptionPricing?.overage_rate)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            Operational Settings
          </CardTitle>
          {!isEditingSettings ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditingSettings(true)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={settingsLoading}
                onClick={() => {
                  setSettingsForm(createSettingsForm(company.settings));
                  setIsEditingSettings(false);
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" disabled={settingsLoading} onClick={handleUpdateSettings}>
                <Save className="w-4 h-4 mr-2" />
                {settingsLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="text-sm">
          <div className="rounded-lg border p-4 space-y-2">
            <p className="font-semibold">Automation & Verification</p>
            <div className="grid grid-cols-2 gap-2">
              <p className="text-muted-foreground">Auto Dispatch</p>
              {isEditingSettings ? (
                <Checkbox
                  checked={settingsForm.auto_dispatch}
                  onCheckedChange={(checked) =>
                    setSettingsForm((prev) => ({ ...prev, auto_dispatch: checked === true }))
                  }
                  disabled={settingsLoading}
                />
              ) : (
                <p>{formatBool(settings?.auto_dispatch)}</p>
              )}
              <p className="text-muted-foreground">Require OTP</p>
              {isEditingSettings ? (
                <Checkbox
                  checked={settingsForm.require_otp}
                  onCheckedChange={(checked) =>
                    setSettingsForm((prev) => ({ ...prev, require_otp: checked === true }))
                  }
                  disabled={settingsLoading}
                />
              ) : (
                <p>{formatBool(settings?.require_otp)}</p>
              )}
              <p className="text-muted-foreground">Face Detection</p>
              {isEditingSettings ? (
                <Checkbox
                  checked={settingsForm.enable_face_detection}
                  onCheckedChange={(checked) =>
                    setSettingsForm((prev) => ({ ...prev, enable_face_detection: checked === true }))
                  }
                  disabled={settingsLoading}
                />
              ) : (
                <p>{formatBool(settings?.enable_face_detection)}</p>
              )}
              <p className="text-muted-foreground">Weight Check</p>
              {isEditingSettings ? (
                <Checkbox
                  checked={settingsForm.enable_weight_check}
                  onCheckedChange={(checked) =>
                    setSettingsForm((prev) => ({ ...prev, enable_weight_check: checked === true }))
                  }
                  disabled={settingsLoading}
                />
              ) : (
                <p>{formatBool(settings?.enable_weight_check)}</p>
              )}
              <p className="text-muted-foreground">Default Timeout</p>
              {isEditingSettings ? (
                <Input
                  type="number"
                  min={0}
                  value={settingsForm.default_delivery_timeout}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      default_delivery_timeout: Number(e.target.value) || 0,
                    }))
                  }
                  disabled={settingsLoading}
                  className="h-8 max-w-[130px]"
                />
              ) : (
                <p>{settings?.default_delivery_timeout ? `${settings.default_delivery_timeout} min` : "—"}</p>
              )}
              <p className="text-muted-foreground">Notification Email</p>
              {isEditingSettings ? (
                <Checkbox
                  checked={settingsForm.notification_preferences.email}
                  onCheckedChange={(checked) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      notification_preferences: {
                        ...prev.notification_preferences,
                        email: checked === true,
                      },
                    }))
                  }
                  disabled={settingsLoading}
                />
              ) : (
                <p>{formatBool(settings?.notification_preferences?.email)}</p>
              )}
              <p className="text-muted-foreground">Notification SMS</p>
              {isEditingSettings ? (
                <Checkbox
                  checked={settingsForm.notification_preferences.sms}
                  onCheckedChange={(checked) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      notification_preferences: {
                        ...prev.notification_preferences,
                        sms: checked === true,
                      },
                    }))
                  }
                  disabled={settingsLoading}
                />
              ) : (
                <p>{formatBool(settings?.notification_preferences?.sms)}</p>
              )}
              <p className="text-muted-foreground">Notification Webhook</p>
              {isEditingSettings ? (
                <Checkbox
                  checked={settingsForm.notification_preferences.webhook}
                  onCheckedChange={(checked) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      notification_preferences: {
                        ...prev.notification_preferences,
                        webhook: checked === true,
                      },
                    }))
                  }
                  disabled={settingsLoading}
                />
              ) : (
                <p>{formatBool(settings?.notification_preferences?.webhook)}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Performance Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statsCards.map((item) => (
            <div key={item.label} className="rounded-md border bg-muted/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-base font-semibold mt-2">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Locations
            </CardTitle>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setLocationForm(createDefaultLocationForm());
              setLocationModal({ open: true, mode: "add" });
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="border-b">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Name</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Address</th>
                  {/* <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Coordinates</th> */}
                  <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Flags</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Working Days</th>
                  {/* <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Created</th> */}
                  <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedHubs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-muted-foreground text-xs">
                      No locations available.
                    </td>
                  </tr>
                ) : (
                  paginatedHubs.map((loc) => (
                    <tr key={loc.location_id || `${loc.name}-${loc.address}`}>
                      <td className="px-3 py-3">{valueText(loc.name)}</td>
                      <td className="px-3 py-3">{valueText(loc.address)}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant={loc.is_primary ? "default" : "secondary"}>Primary: {loc.is_primary ? "Yes" : "No"}</Badge>
                          <Badge variant={loc.active ? "default" : "secondary"}>Active: {loc.active ? "Yes" : "No"}</Badge>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {loc.operating_hours ? `${Object.keys(loc.operating_hours).length} day(s)` : "—"}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setLocationForm({
                                name: loc.name,
                                address: loc.address,
                                coordinates: {
                                  type: "Point",
                                  coordinates:
                                    loc.coordinates?.coordinates ?? [...DEFAULT_LOCATION_COORDINATES],
                                },
                                operating_hours: normalizeOperatingHours(loc.operating_hours),
                                is_primary: loc.is_primary,
                                active: loc.active,
                              });
                              setLocationModal({ open: true, mode: "edit", data: loc });
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {!loc.is_primary && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => setDeleteConfirm({ open: true, locId: loc.location_id || null })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Tablet className="w-4 h-4 text-primary" />
            Assigned Fleet ({company.assigned_rovers?.length || 0})
          </CardTitle>
          {company.assigned_rovers?.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/50 hover:bg-destructive/10"
              disabled={selectedRoverIds.length === 0}
              onClick={() => setShowUnassignConfirm(true)}
            >
              Unassign selected ({selectedRoverIds.length})
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {company.assigned_rovers?.length ? (
            company.assigned_rovers.map((roverId) => (
              <div
                key={roverId}
                className={`group flex items-center gap-2 px-3 py-2 rounded-md border text-xs ${
                  selectedRoverIds.includes(roverId)
                    ? "bg-destructive/10 border-destructive/40"
                    : "bg-muted/40"
                }`}
              >
                <Checkbox checked={selectedRoverIds.includes(roverId)} onCheckedChange={() => toggleRoverSelection(roverId)} />
                <span className="font-mono">{roverId}</span>
                <button
                  onClick={() => handleUnassignRover(roverId)}
                  className="opacity-0 group-hover:opacity-100 text-destructive transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No rovers assigned yet.</p>
          )}
        </CardContent>
      </Card>

      <CompanyLocationModal
        open={locationModal.open}
        mode={locationModal.mode}
        locationForm={locationForm}
        setLocationForm={setLocationForm}
        loading={editLoading}
        onSave={handleSaveLocation}
        onCancel={handleLocationModalCancel}
        onOpenChange={(open) => setLocationModal((prev) => ({ ...prev, open }))}
      />

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Profile Updates</AlertDialogTitle>
            <AlertDialogDescription>
              Save changes for <span className="font-semibold text-primary">{company.name}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateProfile} disabled={editLoading}>
              {editLoading ? "Updating..." : "Yes, Update"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={credentialsConfirmOpen}
        onOpenChange={(open) => {
          if (credentialsLoading) return;
          setCredentialsConfirmOpen(open);
          if (!open) setCredentialsReason("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate API credentials?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to regenerate the API credentials for <span className="font-semibold text-primary">{company.name}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Input
              value={credentialsReason}
              onChange={(e) => setCredentialsReason(e.target.value)}
              placeholder="Reason (optional)"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={credentialsLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRegenerateCredentials}
              disabled={credentialsLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {credentialsLoading ? "Regenerating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteConfirm.open} onOpenChange={(v) => setDeleteConfirm((prev) => ({ ...prev, open: v }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete location?</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this location? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteLocation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showUnassignConfirm} onOpenChange={(v) => !unassignLoading && setShowUnassignConfirm(v)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unassign {selectedRoverIds.length} rover(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              Selected IDs: <span className="font-mono">{selectedRoverIds.join(", ") || "—"}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unassignLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnassignSelected} disabled={unassignLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {unassignLoading ? "Unassigning..." : "Unassign"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CompanyProfile;