import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, Pencil, MapPin, Tablet, Mail, Phone, Building2, 
  CreditCard, Clock, TrendingUp, Target, User,
  Users, Settings2, BellRing, Trash2, Plus, Save, X, AlertTriangle,
  ChevronLeft, ChevronRight, Hash, Calendar
} from "lucide-react";
import { 
  getCompanyById, 
  getCompanyStats, 
  updateCompanySettings, 
  deleteCompanyLocation,
  updateCompany,
  addCompanyLocation,
  updateCompanyLocation,
  unassignRoversFromCompany 
} from "@/api"; 
import { Company, CompanyStats } from "@/common";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  trial: { label: "Trial", className: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  suspended: { label: "Suspended", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground border-border" },
};

const CompanyProfile = () => {
  const { company_id } = useParams();
  const navigate = useNavigate();
  
  const [company, setCompany] = useState<Company | null>(null);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [locationModal, setLocationModal] = useState<{open: boolean, mode: 'add' | 'edit', data?: any}>({
    open: false,
    mode: 'add'
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{open: boolean, locId: string | null}>({
    open: false,
    locId: null
  });
  const [settingConfirm, setSettingConfirm] = useState<{
    open: boolean;
    key: "auto_dispatch" | "require_otp" | null;
    value: boolean;
  }>({ open: false, key: null, value: false });
  const [settingLoading, setSettingLoading] = useState(false);
  const [selectedRoverIds, setSelectedRoverIds] = useState<string[]>([]);
  const [unassignLoading, setUnassignLoading] = useState(false);
  const [showUnassignConfirm, setShowUnassignConfirm] = useState(false);
  const [locationForm, setLocationForm] = useState({
    name: "",
    address: "",
    is_primary: false
  });

  const [formData, setFormData] = useState({
    name: "",
    primary_contact: "",
    email: "",
    phone: "",
    address: ""
  });

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^\+?[0-9]{7,15}$/.test(phone);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [companyRes, statsRes] = await Promise.all([
        getCompanyById(company_id as string),
        getCompanyStats(company_id as string)
      ]);
      const data = companyRes.data?.data?.company;
      setCompany(data);
      setStats(statsRes.data?.data?.stats);
      setFormData({
        name: data.name,
        primary_contact: data.contact?.primary_contact ?? "",
        email: data.contact?.email ?? "",
        phone: data.contact?.phone ?? "",
        address: data.contact?.address ?? ""
      });
    } catch (err: any) {
      toast.error("Data retrieval failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (company_id) fetchAllData();
  }, [company_id]);


  const handleUpdateProfile = async () => {
    if (!validateEmail(formData.email)) return toast.error("Invalid email format");
    if (!validatePhone(formData.phone)) return toast.error("Invalid phone format");

    try {
      setEditLoading(true);
      const payload = {
        name: formData.name,
        contact: {
          primary_contact: formData.primary_contact,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        }
      };
      const res = await updateCompany(company_id!, payload);
      setCompany(res.data?.data?.company ?? { ...company, name: payload.name, contact: payload.contact } as Company);
      toast.success("Profile updated successfully");
      setIsEditing(false);
      setShowConfirm(false);
    } catch (err: any) {
      toast.error("Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };


  const handleToggleSetting = async (key: "auto_dispatch" | "require_otp", value: boolean) => {
    const previousSettings = { ...company?.settings };
    setCompany(prev =>
      prev ? { ...prev, settings: { ...prev.settings, [key]: value } } : null
    );
    try {
      const updatedSettings = { ...company?.settings, [key]: value };
      await updateCompanySettings(company_id as string, updatedSettings as any);
      toast.success(`${key.replace("_", " ")} updated`);
      setSettingConfirm({ open: false, key: null, value: false });
    } catch (err: any) {
      setCompany(prev =>
        prev ? { ...prev, settings: previousSettings as any } : null
      );
      toast.error("Update failed");
    } finally {
      setSettingLoading(false);
    }
  };

  const handleSettingConfirm = () => {
    if (!settingConfirm.key) return;
    setSettingLoading(true);
    handleToggleSetting(settingConfirm.key, settingConfirm.value);
  };

const handleSaveLocation = async () => {
  if (!locationForm.name.trim() || !locationForm.address.trim()) {
    return toast.error("Please fill in all hub details");
  }

  try {
    setEditLoading(true);
    const payload = {
      name: locationForm.name,
      address: locationForm.address,
      coordinates: { type: "Point", coordinates: [-118.2437, 34.0522] },
      is_primary: locationForm.is_primary,
      active: true
    };

    if (locationModal.mode === 'add') {
      const res = await addCompanyLocation(company_id!, payload as any);
      const newLocation = res.data?.data?.location;
      setCompany(prev => prev ? { 
        ...prev, 
        locations: [...(prev.locations || []), newLocation] 
      } : null);
      toast.success("New hub added");
    } else {
      setCompany((prev: any) => {
  if (!prev) return null;
        const targetId = locationModal.data?.location_id;
        if (!targetId) return prev;

        return {
          ...prev,
          locations: (prev.locations || []).map((l) =>
            l.location_id === targetId ? { ...l, ...payload } : l
          ),
        };
      });

      await updateCompanyLocation(company_id!, locationModal.data.location_id, payload as any);
      toast.success("Hub updated");
    }

    setLocationModal({ open: false, mode: 'add' });
  } catch (err: any) {
    toast.error("Operation failed");
  } finally {
    setEditLoading(false);
  }
};

  const confirmDeleteLocation = async () => {
    if (!deleteConfirm.locId) return;
    const locIdToDelete = deleteConfirm.locId;
    try {
      await deleteCompanyLocation(company_id!, locIdToDelete);
      
      setCompany(prev => prev ? {
        ...prev,
        locations: prev.locations?.filter(l => l.location_id !== locIdToDelete)
      } : null);

      toast.success("Location removed");
    } catch (err: any) {
      toast.error("Deletion failed");
    } finally {
      setDeleteConfirm({ open: false, locId: null });
    }
  };

  const handleUnassignRover = async (roverId: string) => {
    try {
      await unassignRoversFromCompany(company_id!, [roverId]);
      setCompany(prev => prev ? {
        ...prev,
        assigned_rovers: prev.assigned_rovers?.filter(id => id !== roverId)
      } : null);
      setSelectedRoverIds(prev => prev.filter(id => id !== roverId));
      toast.success(`Rover ${roverId} unassigned`);
    } catch (err: any) {
      toast.error("Failed to unassign rover");
    }
  };

  const toggleRoverSelection = (roverId: string) => {
    setSelectedRoverIds(prev =>
      prev.includes(roverId) ? prev.filter(id => id !== roverId) : [...prev, roverId]
    );
  };

  const handleUnassignSelected = async () => {
    if (selectedRoverIds.length === 0) return;
    try {
      setUnassignLoading(true);
      await unassignRoversFromCompany(company_id!, selectedRoverIds);
      setCompany(prev => prev ? {
        ...prev,
        assigned_rovers: prev.assigned_rovers?.filter(id => !selectedRoverIds.includes(id))
      } : null);
      setSelectedRoverIds([]);
      setShowUnassignConfirm(false);
      toast.success(`${selectedRoverIds.length} rover(s) unassigned`);
    } catch (err: any) {
      toast.error("Failed to unassign rovers");
    } finally {
      setUnassignLoading(false);
    }
  };

  const paginatedHubs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return company?.locations?.slice(start, start + itemsPerPage) || [];
  }, [company?.locations, currentPage]);

  const totalPages = Math.ceil((company?.locations?.length || 0) / itemsPerPage);


  if (loading) return <div className="p-12 text-center text-[#2ec8cf] animate-pulse font-bold tracking-widest">LOADING...</div>;
  if (!company) return <div className="p-12 text-center">Entity not found.</div>;

  return (
    <div className="space-y-6 pt-12 max-w-7xl mx-auto px-4 pb-12">
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/companies")} className="hover:text-[#2ec8cf] font-bold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
        </Button>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 pr-4 border-r border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingConfirm({ open: true, key: "auto_dispatch", value: !(company.settings?.auto_dispatch ?? false) })}
              disabled={settingLoading}
              className="border-border text-xs font-medium"
            >
              Auto Dispatch: {company.settings?.auto_dispatch ? "On" : "Off"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingConfirm({ open: true, key: "require_otp", value: !(company.settings?.require_otp ?? false) })}
              disabled={settingLoading}
              className="border-border text-xs font-medium"
            >
              Require OTP: {company.settings?.require_otp ? "On" : "Off"}
            </Button>
          </div>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="border-[#2ec8cf] text-[#2ec8cf] hover:bg-[#2ec8cf] hover:text-white transition-all">
              <Pencil className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={editLoading}> <X className="w-4 h-4 mr-1" /> Cancel</Button>
              <Button size="sm" onClick={() => setShowConfirm(true)} className="bg-[#2ec8cf] hover:bg-[#26b1b8]" disabled={editLoading}>
                <Save className="w-4 h-4 mr-1" /> {editLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="space-y-6">
          <Card className="relative overflow-hidden border-none shadow-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#2ec8cf]" />
            <CardContent className="pt-8 text-center space-y-4">
              <div className="w-20 h-20 bg-muted rounded-2xl mx-auto flex items-center justify-center border">
                <Building2 className="w-10 h-10 text-[#2ec8cf]" />
              </div>
              
              {isEditing ? (
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-left block text-muted-foreground">Company Name</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-8 text-center font-bold border-[#2ec8cf]/30" />
                </div>
              ) : (
                <>
                  <CardTitle className="text-xl font-bold">{company.name}</CardTitle>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="text-[9px] font-black uppercase bg-[#2ec8cf]/10 text-[#2ec8cf] px-2 py-1 rounded inline-block">{company.business_type}</span>
                    {company.status && (
                      <Badge variant="outline" className={`text-[9px] font-semibold border ${statusConfig[company.status]?.className ?? "bg-muted text-muted-foreground border-border"}`}>
                        {statusConfig[company.status]?.label ?? company.status}
                      </Badge>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-1 pt-2 text-left text-[10px] font-mono text-muted-foreground flex items-center gap-2 justify-center">
                <Hash className="w-3 h-3" />
                {company.company_id}
              </div>

              <div className="space-y-4 pt-4 border-t text-left">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-[#2ec8cf] shrink-0" />
                  {isEditing ? (
                    <Input placeholder="Primary contact name" value={formData.primary_contact} onChange={e => setFormData({...formData, primary_contact: e.target.value})} className="h-7 text-xs" />
                  ) : (
                    <span className="text-xs font-medium">{company.contact?.primary_contact || "—"}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#2ec8cf] shrink-0" />
                  {isEditing ? <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-7 text-xs"/> : <span className="text-xs font-medium truncate">{company.contact?.email}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#2ec8cf] shrink-0" />
                  {isEditing ? <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="h-7 text-xs"/> : <span className="text-xs font-medium">{company.contact?.phone}</span>}
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#2ec8cf] shrink-0 mt-0.5" />
                  {isEditing ? <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-7 text-xs"/> : <span className="text-xs leading-relaxed text-muted-foreground">{company.contact?.address || "—"}</span>}
                </div>
              </div>

              {!isEditing && (company.created_at || company.updated_at) && (
                <div className="pt-3 border-t flex flex-wrap items-center justify-center gap-3 text-[9px] text-muted-foreground">
                  {company.created_at && (
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Created {new Date(company.created_at).toLocaleDateString()}</span>
                  )}
                  {company.updated_at && (
                    <span>Updated {new Date(company.updated_at).toLocaleDateString()}</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#2ec8cf] text-white border-none shadow-sm relative overflow-hidden">
            <CardContent className="p-6 space-y-4">
               <div className="flex justify-between items-center opacity-70">
                 <CreditCard className="w-8 h-8" />
                 <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-1 rounded">{company.subscription?.billing_cycle}</span>
               </div>
               <div>
                 <p className="text-[10px] uppercase font-bold opacity-80">Current Plan</p>
                 <p className="text-2xl font-black">{company.subscription?.tier}</p>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          
          <Card className="border-t-4 border-t-amber-500 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-amber-500" /> Operational Logic & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-muted/10 p-4 rounded-lg space-y-3 border border-dashed">
                <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
                  <BellRing className="w-3 h-3" /> Notification Channels
                </Label>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {['Email', 'SMS', 'Webhook'].map((n) => (
                    <div key={n} className="bg-background border p-2 rounded shadow-sm">
                      <p className="text-[9px] font-bold">{n}</p>
                      <p className="text-[8px] text-emerald-500 font-black uppercase">Active</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Success Rate", value: `${stats?.success_rate}%`, icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { label: "Total Deliveries", value: stats?.total_deliveries, icon: TrendingUp, color: "text-[#2ec8cf]", bg: "bg-[#2ec8cf]/10" },
              { label: "Active Users", value: stats?.active_users, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Avg Time", value: `${stats?.average_delivery_time}m`, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
            ].map((item, i) => (
              <Card key={i} className="border-none shadow-sm bg-card border border-slate-100">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground">{item.label}</p>
                    <p className="text-base font-bold">{item.value || 0}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${item.bg}`}><item.icon className={`w-4 h-4 ${item.color}`} /></div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2ec8cf]" /> Fleet Hubs
              </CardTitle>
              <Button 
                size="sm" variant="ghost" className="text-[10px] font-black text-[#2ec8cf] hover:bg-[#2ec8cf]/5" 
                onClick={() => {
                  setLocationForm({ name: "", address: "", is_primary: false });
                  setLocationModal({ open: true, mode: 'add' });
                }}
              >
                <Plus className="w-3 h-3 mr-1" /> ADD HUB
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden text-xs">
                <table className="w-full">
                  <thead className="bg-muted/50 text-[10px] font-bold uppercase border-b">
                    <tr>
                      <th className="p-3 text-left">Location Name</th>
                      <th className="p-3 text-left">Address</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-card">
                    {paginatedHubs.map((loc) => (
                      <tr key={loc.location_id} className="hover:bg-muted/5 transition-colors">
                        <td className="p-3">
                          <span className="font-bold">{loc.name}</span>
                          {loc.is_primary && <span className="ml-2 text-[8px] bg-[#2ec8cf] text-white px-1.5 py-0.5 rounded uppercase font-black">Primary</span>}
                        </td>
                        <td className="p-3 text-muted-foreground truncate max-w-[200px]">{loc.address}</td>
                        <td className="p-3 text-right flex justify-end gap-1">
                          <Button 
                            variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"
                            onClick={() => {
                              setLocationForm({ name: loc.name, address: loc.address, is_primary: loc.is_primary });
                              setLocationModal({ open: true, mode: 'edit', data: loc });
                            }}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          {!loc.is_primary && (
                             <Button 
                               variant="ghost" size="icon" className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50" 
                               onClick={() => setDeleteConfirm({ open: true, locId: loc.location_id! })}
                             >
                               <Trash2 className="w-3 h-3" />
                             </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-2">
                  <p className="text-[10px] font-bold text-muted-foreground">Page {currentPage} of {totalPages}</p>
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" size="icon" className="h-7 w-7" 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="outline" size="icon" className="h-7 w-7" 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Tablet className="w-4 h-4 text-[#2ec8cf]" /> Assigned Fleet ({company.assigned_rovers?.length || 0})
              </CardTitle>
              {company.assigned_rovers?.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[10px] font-bold text-rose-600 border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-600"
                  disabled={selectedRoverIds.length === 0}
                  onClick={() => setShowUnassignConfirm(true)}
                >
                  Unassign selected ({selectedRoverIds.length})
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {company.assigned_rovers?.length > 0 ? (
                company.assigned_rovers?.map((roverId: string) => (
                  <div
                    key={roverId}
                    className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-tight transition-all ${
                      selectedRoverIds.includes(roverId)
                        ? "bg-rose-500/10 border-rose-500/50"
                        : "bg-muted/40 border-slate-100 hover:border-[#2ec8cf]"
                    }`}
                  >
                    <Checkbox
                      checked={selectedRoverIds.includes(roverId)}
                      onCheckedChange={() => toggleRoverSelection(roverId)}
                      className="border-slate-300 data-[state=checked]:border-rose-500 data-[state=checked]:bg-rose-500"
                    />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    {roverId}
                    <button onClick={() => handleUnassignRover(roverId)} className="ml-1 opacity-0 group-hover:opacity-100 text-rose-500 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-muted-foreground italic">No rovers assigned yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={locationModal.open} onOpenChange={(v) => setLocationModal(prev => ({...prev, open: v}))}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#2ec8cf] font-black uppercase text-sm tracking-widest">
              {locationModal.mode === 'add' ? 'Add New Hub' : 'Edit Hub Details'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase opacity-60">Hub Name</Label>
              <Input 
                placeholder="e.g. West Coast Center" 
                value={locationForm.name}
                onChange={e => setLocationForm({...locationForm, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase opacity-60">Full Address</Label>
              <Input 
                placeholder="Street name, Building, City" 
                value={locationForm.address}
                onChange={e => setLocationForm({...locationForm, address: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="text-xs" onClick={() => setLocationModal({open: false, mode: 'add'})}>Cancel</Button>
            <Button className="bg-[#2ec8cf] hover:bg-[#26b1b8] text-xs font-bold" onClick={handleSaveLocation} disabled={editLoading}>
              {editLoading ? "Saving..." : "Save Hub"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-2">
              <AlertTriangle className="text-amber-500 w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-center font-black">Confirm Updates</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-xs">
              Save changes for <span className="font-bold text-[#2ec8cf]">{company.name}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2">
            <AlertDialogCancel className="rounded-xl border-slate-200 text-xs">Go Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateProfile} className="bg-[#2ec8cf] hover:bg-[#26b1b8] rounded-xl px-8 text-xs font-bold" disabled={editLoading}>
              {editLoading ? "Updating..." : "Yes, Update"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={settingConfirm.open}
        onOpenChange={(open) => !settingLoading && setSettingConfirm((p) => ({ ...p, open }))}
      >
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-2">
              <Settings2 className="text-amber-500 w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-center font-black">
              {settingConfirm.key === "auto_dispatch"
                ? settingConfirm.value
                  ? "Enable Auto Dispatch?"
                  : "Disable Auto Dispatch?"
                : settingConfirm.key === "require_otp"
                  ? settingConfirm.value
                    ? "Enable Require OTP?"
                    : "Disable Require OTP?"
                  : "Confirm setting change"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-xs">
              {settingConfirm.key === "auto_dispatch" && (
                <>This will {settingConfirm.value ? "enable" : "disable"} automated rover assignment for <span className="font-bold text-[#2ec8cf]">{company.name}</span>. Continue?</>
              )}
              {settingConfirm.key === "require_otp" && (
                <>This will {settingConfirm.value ? "enable" : "disable"} OTP verification on delivery for <span className="font-bold text-[#2ec8cf]">{company.name}</span>. Continue?</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2">
            <AlertDialogCancel className="rounded-xl border-slate-200 text-xs" disabled={settingLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSettingConfirm}
              className="bg-[#2ec8cf] hover:bg-[#26b1b8] rounded-xl px-8 text-xs font-bold"
              disabled={settingLoading}
            >
              {settingLoading ? "Updating..." : "Yes, Update"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteConfirm.open} onOpenChange={(v) => setDeleteConfirm(prev => ({...prev, open: v}))}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-2">
              <Trash2 className="text-rose-500 w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-center font-black">Delete Hub?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-xs">
              This will permanently remove the hub. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2">
            <AlertDialogCancel className="rounded-xl text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteLocation} className="bg-rose-500 hover:bg-rose-600 rounded-xl px-8 text-xs font-bold">
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showUnassignConfirm} onOpenChange={(v) => !unassignLoading && setShowUnassignConfirm(v)}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-2">
              <Tablet className="text-rose-500 w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-center font-black">Unassign {selectedRoverIds.length} rover(s)?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-xs">
              The following rovers will be unassigned from <span className="font-bold text-[#2ec8cf]">{company.name}</span>:{" "}
              <span className="font-mono text-[10px]">{selectedRoverIds.join(", ")}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2">
            <AlertDialogCancel className="rounded-xl text-xs" disabled={unassignLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnassignSelected}
              className="bg-rose-500 hover:bg-rose-600 rounded-xl px-8 text-xs font-bold"
              disabled={unassignLoading}
            >
              {unassignLoading ? "Unassigning..." : "Yes, Unassign"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default CompanyProfile;