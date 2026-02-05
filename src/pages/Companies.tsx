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
  RefreshCw, 
  LayoutGrid, 
  MapPin, 
  Tablet, 
  MoreHorizontal, 
  Settings, 
  Navigation,
  Box,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  getCompanies, 
  createCompany, 
  updateCompany, 
  activateCompany, 
  suspendCompany,
  deleteCompany,
  updateCompanyStatus
} from "@/api";
import { CreateCompanyPayload } from "@/common";

const Companies = () => {
  const navigate = useNavigate();
  
  // --- State Management ---
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // --- Form State ---
  const [form, setForm] = useState<CreateCompanyPayload>({
    name: "",
    business_type: "logistics",
    contact: { primary_contact: "", email: "", phone: "", address: "" },
    subscription: { tier: "professional", billing_cycle: "monthly" },
    locations: [],
    assigned_rovers: [],
    admin_user: { name: "", email: "", phone: "", role: "company_admin" }
  });

  // --- Functions ---
  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setForm({
      name: "",
      business_type: "logistics",
      contact: { primary_contact: "", email: "", phone: "", address: "" },
      subscription: { tier: "starter", billing_cycle: "monthly" }, // المسمى الموحد starter
      locations: [],
      assigned_rovers: [],
      admin_user: { name: "", email: "", phone: "", role: "company_admin" }
    });
    setShowFormModal(true);
  };

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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isEditing && editingId) {
        await updateCompany(editingId, { name: form.name, contact: form.contact });
        toast.success("Company Updated");
      } else {
        const res = await createCompany(form);
        const tempPass = res.data?.data?.admin_user?.temporary_password;
        toast.success("Registered!", {
          description: tempPass ? `Admin Pass: ${tempPass}` : "Sent to email.",
          duration: 10000,
        });
      }
      setShowFormModal(false);
      fetchCompanies(currentPage);
    } catch (err: any) {
      toast.error("Error", { description: err.response?.data?.message || "Failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setListLoading(true);
      if (newStatus === "suspended") {
        await suspendCompany(id, "Administrative review");
      } else if (newStatus === "active") {
        await activateCompany(id, "Account reactivated");
      } else {
        await updateCompanyStatus(id, { status: newStatus, reason: "Manual status update" });
      }
      toast.success(`Status updated to ${newStatus}`);
      fetchCompanies(currentPage);
    } catch (err) {
      toast.error("Status Change Failed");
      setListLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this company?")) return;
    try {
      setListLoading(true);
      await deleteCompany(id);
      toast.success("Company Deleted");
      fetchCompanies(currentPage);
    } catch (err) {
      toast.error("Deletion Failed");
      setListLoading(false);
    }
  };

  return (
    <div className="space-y-6 pt-12">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg">Corporate Directory</CardTitle>
            <CardDescription>Managing {companies.length} entities</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={openCreateModal} className="bg-[#2ec8cf] text-white" size="sm">
              Add Company
            </Button>
            <Button variant="outline" size="sm" onClick={() => fetchCompanies(currentPage)} className="text-[#2ec8cf]">
              <RefreshCw className={`w-4 h-4 mr-2 ${listLoading ? "animate-spin" : ""}`} /> Sync
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-[10px] uppercase font-bold text-muted-foreground">
                <tr className="border-b border-border/50">
                  <th className="p-4 text-left">Company Profile</th>
                  <th className="p-4 text-left">Business Type</th>
                  <th className="p-4 text-left">Operational Assets</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {companies.map((company) => (
                  <tr key={company.company_id} className="hover:bg-muted/20 transition-colors group">
                    <td className="p-4">
                      <div className="font-bold group-hover:text-[#2ec8cf]">{company.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{company.company_id}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-black uppercase bg-muted px-2 py-0.5 rounded">{company.business_type}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                         <div className="flex items-center gap-1">
                           <MapPin className="w-3 h-3 text-[#2ec8cf]" />
                           <span className="text-[11px] font-bold">{company.stats?.active_locations || 0}</span>
                         </div>
                         <div className="flex items-center gap-1">
                           <Tablet className="w-3 h-3 text-[#2ec8cf]" />
                           <span className="text-[11px] font-bold">{company.stats?.assigned_rovers || 0}</span>
                         </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={company.status}
                        onChange={(e) => handleStatusChange(company.company_id, e.target.value)}
                        className={`bg-transparent border-none font-bold text-[10px] uppercase cursor-pointer ${
                          company.status === "active" ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="trial">Trial</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-3 items-center">
                        <button 
                          onClick={() => navigate(`/dashboard?cid=${company.company_id}`)}
                          className="text-muted-foreground font-bold text-[11px] uppercase hover:text-[#2ec8cf]"
                        >
                          Dashboard
                        </button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-[#2ec8cf] font-bold text-[11px] uppercase hover:underline flex items-center gap-1">
                              Manage <MoreHorizontal className="w-3 h-3" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-[10px] uppercase">Control Center</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate(`/live-tracking?cid=${company.company_id}`)}>
                              <Navigation className="w-4 h-4 mr-2 text-[#2ec8cf]" /> Live Tracking
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/rovers?cid=${company.company_id}`)}>
                              <Tablet className="w-4 h-4 mr-2 text-[#2ec8cf]" /> Fleet (Rovers)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/orders?cid=${company.company_id}`)}>
                              <Box className="w-4 h-4 mr-2 text-[#2ec8cf]" /> Order Logs
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                              setForm({...company});
                              setIsEditing(true);
                              setEditingId(company.company_id);
                              setShowFormModal(true);
                            }}>
                              <Settings className="w-4 h-4 mr-2" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(company.company_id)}
                              className="text-rose-500 focus:text-rose-500"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete Company
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1 || listLoading} 
              onClick={() => fetchCompanies(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">
              Page {currentPage} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage >= totalPages || listLoading} 
              onClick={() => fetchCompanies(currentPage + 1)} 
              className="bg-[#2ec8cf] text-white hover:bg-[#2ec8cf]/80 border-none"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none bg-transparent">
          <Card className="relative shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#2ec8cf]" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-[#2ec8cf]" />
                {isEditing ? "Modify Company" : "Register Company"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black">Company Name</Label>
                    <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Acme Inc" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black">Business Type</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={form.business_type}
                      onChange={(e) => setForm({...form, business_type: e.target.value as any})}
                    >
                      <option value="logistics">Logistics</option>
                      <option value="ecommerce">E-commerce</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="campus">Campus</option>
                    </select>
                  </div>

                  {/* Primary Contact Section */}
                  <div className="col-span-2 grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black">Contact Person</Label>
                        <Input value={form.contact.primary_contact} onChange={(e) => setForm({...form, contact: {...form.contact, primary_contact: e.target.value}})} placeholder="Full Name" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black">Contact Email</Label>
                        <Input value={form.contact.email} onChange={(e) => setForm({...form, contact: {...form.contact, email: e.target.value}})} placeholder="email@corp.com" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black">Contact Phone</Label>
                        <Input value={form.contact.phone} onChange={(e) => setForm({...form, contact: {...form.contact, phone: e.target.value}})} placeholder="+1..." />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black">Office Address</Label>
                        <Input value={form.contact.address} onChange={(e) => setForm({...form, contact: {...form.contact, address: e.target.value}})} placeholder="123 Street, City" />
                    </div>
                  </div>

                  {!isEditing && (
                    <>
                      <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black">Subscription Tier</Label>
                          <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={form.subscription.tier}
                              onChange={(e) => setForm({...form, subscription: {...form.subscription, tier: e.target.value as any}})}
                          >
                              <option value="starter">Starter</option>
                              <option value="professional">Professional</option>
                              <option value="enterprise">Enterprise</option>
                          </select>
                      </div>
                      <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black">Billing Cycle</Label>
                          <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={form.subscription.billing_cycle}
                              onChange={(e) => setForm({...form, subscription: {...form.subscription, billing_cycle: e.target.value as any}})}
                          >
                              <option value="monthly">Monthly</option>
                              <option value="yearly">Yearly</option>
                          </select>
                      </div>
                      <div className="col-span-2 space-y-3 pt-2">
                          <h4 className="text-[10px] font-black uppercase text-muted-foreground border-b pb-1">System Administrator</h4>
                          <div className="grid grid-cols-2 gap-4">
                              <Input placeholder="Admin Name" onChange={(e) => setForm({...form, admin_user: {...form.admin_user, name: e.target.value}})} />
                              <Input placeholder="Admin Email" onChange={(e) => setForm({...form, admin_user: {...form.admin_user, email: e.target.value}})} />
                          </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                  <Button variant="ghost" onClick={() => setShowFormModal(false)}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={loading} className="bg-[#2ec8cf] text-white">
                    {loading ? "Processing..." : isEditing ? "Save Changes" : "Confirm Registration"}
                  </Button>
                </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Companies;