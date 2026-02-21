import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Mail, Phone, UserCircle, Shield, Pencil, Check, X,
  ArrowLeft, IdCard, Calendar, Activity, Lock, AlertTriangle 
} from "lucide-react";
import { toast } from "sonner";
import { getOperatorById, updateFleetOperator } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const OperatorProfile = () => {
  const params = useParams();
  const operatorId = params.operator_id || params.company_id || params.id; 
  const navigate = useNavigate();

  const [operator, setOperator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});
  
  const [editForm, setEditForm] = useState({ name: "", phone: "", role: "" });

  useEffect(() => {
    const fetchOperatorData = async () => {
      if (!operatorId) return;
      try {
        setLoading(true);
        const res = await getOperatorById(operatorId);
        const data = res.data?.data?.operator || res.data?.data;
        setOperator(data);
        setEditForm({ name: data.name, phone: data.phone || "", role: data.role });
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
    setPendingAction(() => async () => {
      try {
        await updateFleetOperator(operatorId as string, editForm);
        setOperator({ ...operator, ...editForm });
        setIsEditing(false);
        toast.success("Profile updated");
      } catch (err) {
        toast.error("Update failed");
      }
    });
    setShowConfirm(true);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#2ec8cf]"></div>
    </div>
  );

  return (
    <div className="p-6 bg-background min-h-screen transition-colors duration-300" dir="ltr">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => navigate("/fleet-operators")} className="text-muted-foreground hover:text-[#2ec8cf] font-bold">
          <ArrowLeft size={18} className="mr-2" /> Back
        </Button>
        
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white rounded-xl">
            <Pencil size={14} className="mr-2" /> Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSaveClick} className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white rounded-xl">
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Hero Banner - (Custom Cyan remains, but inner elements use Shadcn logic) */}
      <div className="bg-[#2ec8cf] rounded-[1.5rem] p-6 mb-6 flex flex-col md:flex-row items-center gap-6 relative shadow-xl shadow-[#2ec8cf]/10">
        <div className="w-24 h-24 rounded-[1.2rem] bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center text-3xl font-black text-white uppercase">
          {editForm.name?.slice(0, 1)}
        </div>

        <div className="text-white flex-1 w-full text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
            {isEditing ? (
              <input 
                className="bg-white/10 border border-white/30 rounded-lg px-3 py-1 text-2xl font-black text-white outline-none focus:bg-white/20 transition-all"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              />
            ) : (
              <h2 className="text-3xl font-black tracking-tight">{operator?.name}</h2>
            )}
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 capitalize">
                {operator?.status}
            </Badge>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
            <div className="flex items-center gap-2 text-xs font-medium bg-black/5 px-3 py-1.5 rounded-lg border border-white/10">
              <Mail size={14} className="opacity-80" /> {operator?.email}
            </div>
            <div className="flex items-center gap-2 text-xs font-medium bg-black/5 px-3 py-1.5 rounded-lg border border-white/10">
              <Phone size={14} className="opacity-80" />
              {isEditing ? (
                <input className="bg-transparent border-b border-white/30 outline-none text-white w-28" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} />
              ) : (
                operator?.phone || "N/A"
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 <InfoCard icon={<IdCard size={18} className="text-blue-500" />} label="ID" value={operator?.operator_id || operator?.id} />
                 <InfoCard icon={<Activity size={18} className="text-[#2ec8cf]" />} label="Role" value={operator?.role?.replace(/_/g, ' ')} />
                 <InfoCard icon={<Calendar size={18} className="text-emerald-500" />} label="Joined" value={operator?.created_at ? new Date(operator.created_at).toLocaleDateString() : 'N/A'} />
                 <InfoCard icon={<Shield size={18} className="text-purple-500" />} label="Access" value={operator?.status} />
            </div>

            {/* Permissions Card - Using Shadcn Card Component */}
            <Card className="border-border/50 bg-card rounded-[1.5rem] shadow-sm overflow-hidden">
              <CardContent className="p-6">
                 <h3 className="text-sm font-black text-foreground mb-5 flex items-center gap-2">
                     <Lock size={18} className="text-[#2ec8cf]" /> Permissions
                 </h3>
                 <div className="flex flex-wrap gap-2">
                     {operator?.permissions?.map((perm: string) => (
                         <Badge key={perm} variant="outline" className="px-3 py-1.5 bg-muted/30 text-muted-foreground border-border/50 font-bold text-[10px] uppercase">
                             <div className="w-1.5 h-1.5 bg-[#2ec8cf] rounded-full mr-2"></div>
                             {perm.replace(/_/g, ' ')}
                         </Badge>
                     ))}
                 </div>
              </CardContent>
            </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
            <div className="bg-amber-500/5 rounded-[1.5rem] p-5 border border-amber-500/10">
                <div className="flex gap-4">
                    <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg h-fit"><AlertTriangle size={20} /></div>
                    <div>
                      <h4 className="font-black text-amber-600 mb-1 uppercase text-[10px] tracking-widest">Security Notice</h4>
                      <p className="text-[11px] text-muted-foreground font-bold leading-relaxed">
                          All activities under this account are logged. Modifications require override.
                      </p>
                    </div>
                </div>
            </div>
            
            <Button 
              variant="outline"
              onClick={() => {
                setPendingAction(() => () => toast.error("Account suspended."));
                setShowConfirm(true);
              }}
              className="w-full py-6 border-rose-500/20 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 rounded-xl font-black text-xs uppercase"
            >
               Suspend Account
            </Button>
        </div>
      </div>

      {/* Shadcn Based AlertDialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="rounded-[1.5rem] bg-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black text-foreground">Confirm Change</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to proceed? This will update the operator profile in the directory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-none bg-muted text-muted-foreground">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => { pendingAction(); setShowConfirm(false); }}
              className="rounded-xl bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white shadow-lg shadow-[#2ec8cf]/20"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

const InfoCard = ({ icon, label, value }: any) => (
    <Card className="border-border/50 bg-card hover:border-[#2ec8cf]/30 transition-all shadow-sm group">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-3 bg-muted rounded-xl group-hover:scale-105 transition-transform duration-300">{icon}</div>
        <div className="min-w-0">
          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter mb-0.5">{label}</p>
          <p className="text-xs font-black text-foreground truncate">{value}</p>
        </div>
      </CardContent>
    </Card>
);

export default OperatorProfile;