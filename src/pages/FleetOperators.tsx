import { useState, useEffect } from "react";
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
import { Users, RefreshCw } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner"; // Using sonner for notifications
import { 
  activateOperator, 
  suspendOperator, 
  deactivateOperator, 
  getFleetOperators, 
  getOperatorById, 
  updateFleetOperator, 
  createFleetOperator 
} from "@/api";

const FleetOperators = () => {
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
  const [selectedOperator, setSelectedOperator] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // --- Configuration Data ---
  const permissionsList = ["COMPANY_VIEW", "COMPANY_EDIT", "ROVER_VIEW"];
  const rolesList = [
    { value: "super_admin", label: "Super Admin" },
    { value: "fleet_manager", label: "Fleet Manager" },
    { value: "operations_manager", label: "Operations Manager" },
    { value: "support_engineer", label: "Support Engineer" },
    { value: "analyst", label: "Analyst" },
  ];

  /**
   * Status Change Handler
   * Triggers specific API endpoints based on selection
   */
  const handleStatusChange = async (operatorId: string, newStatus: string) => {
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
          op.operator_id === operatorId || op.id === operatorId
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

  /**
   * Fetch Operators List from API
   */
  const fetchOperators = async (page = 1) => {
    setListLoading(true);
    try {
      const res = await getFleetOperators({ page, limit: ITEMS_PER_PAGE });
      if (res.status === 204) {
        setOperators([]);
        return;
      }
      const responseData = res.data?.data;
      if (responseData) {
        setOperators(responseData.operators || (Array.isArray(responseData) ? responseData : []));
        setTotalPages(responseData.pagination?.pages || 1);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setListLoading(false);
    }
  };

  /**
   * Modal: View Full Profile Details
   */
  const handleViewDetails = async (operatorId: string) => {
    try {
      const res = await getOperatorById(operatorId);
      const operatorData = res.data.data?.operator || res.data.data;
      if (operatorData) {
        setSelectedOperator(operatorData);
        setShowDetailsModal(true);
      }
    } catch (err) {
      console.error("Details Fetch Failed:", err);
    }
  };

  /**
   * Form: Prepare UI for Modification
   */
  const handleEditClick = (op: any) => {
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

  useEffect(() => {
    fetchOperators();
  }, []);

  /**
   * Permission Toggler
   */
  const togglePermission = (perm: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  /**
   * Final Submission Logic (Create or Update)
   */
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
        
        // Show password in toast for 20 seconds if it exists
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
    <div className="space-y-6 pt-12 ">
      
      {/* --- DATABASE SECTION --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg">Fleet Directory</CardTitle>
            <CardDescription>
              Managing {operators.length} personnel entries
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setIsEditing(false);
                setForm({ name: "", email: "", phone: "", role: "fleet_manager", permissions: [] });
                setShowFormModal(true);
              }}
              className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white font-bold"
              size="sm"
            >
              Add Operator
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchOperators(currentPage)}
              className="text-[#2ec8cf]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${listLoading ? "animate-spin" : ""}`} /> 
              Sync
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-[10px] uppercase font-bold text-muted-foreground">
                <tr className="border-b border-border/50">
                  <th className="p-4 text-left">Identity Profile</th>
                  <th className="p-4 text-left">Functional Role</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {listLoading && operators.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-muted-foreground animate-pulse">
                      Synchronizing directory...
                    </td>
                  </tr>
                ) : (
                  operators.map((op) => (
                    <tr key={op.operator_id || op.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="p-4">
                        <div className="font-bold group-hover:text-[#2ec8cf] transition-colors">{op.name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{op.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-black uppercase bg-muted px-2 py-0.5 rounded">
                          {op.role?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={op.status}
                          onChange={(e) => handleStatusChange(op.operator_id || op.id, e.target.value)}
                          className={`bg-transparent border-none font-bold text-[10px] uppercase cursor-pointer focus:ring-0 p-0 ${
                            op.status === "active" ? "text-emerald-500" : "text-rose-500"
                          }`}
                        >
                          <option value="active" className="dark:bg-[#0f172a]">Active</option>
                          <option value="suspended" className="dark:bg-[#0f172a]">Suspended</option>
                          <option value="inactive" className="dark:bg-[#0f172a]">Inactive</option>
                        </select>
                      </td>
                      <td className="p-4 text-right space-x-3">
                        <button onClick={() => handleViewDetails(op.operator_id || op.id)} className="text-muted-foreground font-bold text-[11px] uppercase hover:text-foreground">Profile</button>
                        <button onClick={() => handleEditClick(op)} className="text-[#2ec8cf] font-bold text-[11px] uppercase hover:underline">Edit</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" size="sm" disabled={currentPage === 1 || listLoading} onClick={() => fetchOperators(currentPage - 1)}>Previous</Button>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Page {currentPage} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={currentPage >= totalPages || listLoading} onClick={() => fetchOperators(currentPage + 1)} className="bg-[#2ec8cf] text-white hover:bg-[#2ec8cf]/80 border-none">Next</Button>
          </div>
        </CardContent>
      </Card>

      {/* --- MODAL: CREATE / MODIFY OPERATOR --- */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none bg-transparent">
          <Card className={isEditing ? "border-[#2ec8cf] ring-1 ring-[#2ec8cf]/20 shadow-2xl relative" : "relative shadow-2xl"}>
            <div className="absolute top-0 left-0 w-full h-1 bg-[#2ec8cf]" />
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#2ec8cf]" />
                    {isEditing ? "Modify Fleet Operator" : "Register Fleet Operator"}
                  </CardTitle>
                  <CardDescription>
                    {isEditing ? "Update account details and access level" : "Setup access credentials and roles for fleet personnel"}
                  </CardDescription>
                </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && <div className="p-4 bg-red-500/10 text-red-500 rounded-lg text-sm border border-red-500/20 font-medium">{error}</div>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address {isEditing && "(Read Only)"}</Label>
                  <Input disabled={isEditing} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1..." />
                </div>
                <div className="space-y-2">
                  <Label>Designated Role</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-[#2ec8cf] transition-all"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    {rolesList.map((r) => <option key={r.value} value={r.value} className="dark:bg-[#0f172a]">{r.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center text-xs uppercase tracking-widest text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-[#2ec8cf] mr-2 inline-block"></span>
                  Permissions Control
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {permissionsList.map((perm) => (
                    <button
                      key={perm}
                      onClick={() => togglePermission(perm)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                        form.permissions.includes(perm) ? "bg-[#2ec8cf] border-[#2ec8cf] text-white" : "bg-transparent border-input text-muted-foreground hover:border-[#2ec8cf]"
                      }`}
                    >
                      {perm.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <Button variant="ghost" onClick={() => setShowFormModal(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={loading} className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white font-bold px-8">
                  {loading ? "Processing..." : isEditing ? "Save Changes" : "Confirm & Create"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {/* --- MODAL: OPERATOR DETAILS --- */}
      <Dialog open={showDetailsModal && !!selectedOperator} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-lg p-0 overflow-hidden border-none bg-transparent">
          <Card className="w-full shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#2ec8cf]" />
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-[#2ec8cf] uppercase tracking-widest mb-1">Operator Profile</p>
                  <CardTitle className="text-2xl font-black">{selectedOperator?.name}</CardTitle>
                </div>
                
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Unique ID</span>
                  <p className="text-sm font-mono font-bold truncate">{selectedOperator?.operator_id || selectedOperator?.id}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Access Status</span>
                  <p className={`text-xs font-black uppercase ${selectedOperator?.status === "active" ? "text-emerald-500" : "text-rose-500"}`}>{selectedOperator?.status}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Contact Email</span>
                  <p className="text-sm font-bold truncate">{selectedOperator?.email}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Phone</span>
                  <p className="text-sm font-bold">{selectedOperator?.phone || "N/A"}</p>
                </div>
                <div className="col-span-2 p-3 bg-muted/50 rounded-lg">
                  <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Role Assigned</span>
                  <p className="text-sm font-black uppercase text-[#2ec8cf]">{selectedOperator?.role?.replace(/_/g, " ")}</p>
                </div>
              </div>
              <Button onClick={() => setShowDetailsModal(false)} className="w-full font-bold">Close Directory Profile</Button>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FleetOperators;