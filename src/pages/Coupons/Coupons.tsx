import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, TicketPercent, Search, PlusCircle, Calendar, Users, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
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

import { listCoupons, updateCoupon } from "@/api/coupons/coupons";
import { ICoupon } from "@/common/interfaces/coupons/coupons.interface";
import { getUser } from "@/lib/auth-storage"; 
import CreateCouponModal from "./CreateCouponModal";
import { useNavigate } from "react-router-dom";

function CouponStatus({ isDeleted, expirationDate }: { isDeleted: boolean, expirationDate: string }) {
  const isExpired = new Date(expirationDate) < new Date();
  if (isDeleted) return <Badge variant="destructive" className="text-[11px] font-normal">Deleted</Badge>;
  if (isExpired) return <Badge variant="secondary" className="text-[11px] font-normal">Expired</Badge>;
  
  return (
    <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[11px] font-normal border">
      Active
    </Badge>
  );
}

const Coupons = () => {
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Confirmation Dialog State
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Fetching logic without hardcoded fallbacks to test real API permissions
   */
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const user = getUser() as any;
      const companyId = user?.company?._id; 
      
      const res = await listCoupons(companyId);
      if (res.data.success) {
        setCoupons(res.data.data);
      }
    } catch (err: any) {
      const errorStatus = err.response?.status;
      const errorMsg = err.response?.data?.message || "Failed to load coupons";
      
      console.error(`[API Error ${errorStatus}]:`, err.response?.data);
      toast.error(`Backend Error (${errorStatus}): ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Real Integration for soft-delete
   */
  const confirmDelete = async () => {
    if (!couponToDelete) return;
    setIsDeleteLoading(true);
    try {
      const res = await updateCoupon(couponToDelete, { is_deleted: true });
      if (res.data.success) {
        toast.success("Coupon marked as deleted");
        fetchCoupons();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete coupon");
    } finally {
      setIsDeleteLoading(false);
      setCouponToDelete(null);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const filteredCoupons = coupons.filter(coupon => 
    !coupon.is_deleted &&
    coupon.code.toLowerCase().includes(searchCode.toLowerCase())
  );

  return (
    <div className="space-y-6 pt-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <TicketPercent className="h-7 w-7 text-[#2ec8cf]" />
          Coupons
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your promotional codes and discount campaigns
        </p>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-muted/20 border-b border-border/50">
          <div>
            <CardTitle className="text-base font-semibold">All Coupons</CardTitle>
            <CardDescription>{filteredCoupons.length} coupons retrieved</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white shadow-sm" 
              size="sm"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              New Coupon
            </Button>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search code..."
                className="pl-8 w-48 h-8 border-[#2ec8cf]/30 focus-visible:ring-[#2ec8cf]/50"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchCoupons} 
              disabled={loading}
              className="border-[#2ec8cf]/50 text-[#2ec8cf] hover:bg-[#2ec8cf]/10"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Coupon Code</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Discount</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Usage</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expiry</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-4 py-4"><Skeleton className="h-6 w-full" /></td></tr>
                  ))
                ) : filteredCoupons.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No records found.</td></tr>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <tr 
                      key={coupon._id} 
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/coupons/${coupon._id}`)}
                    >
                      <td className="px-4 py-4 font-bold text-[#2ec8cf] tracking-wider font-mono">{coupon.code}</td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-foreground uppercase">
                          {coupon.discount} {coupon.discount_type === 'percentage' ? '%' : 'USD'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          {coupon.used_count} / {coupon.max_usage}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(coupon.expiration_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <CouponStatus isDeleted={coupon.is_deleted} expirationDate={coupon.expiration_date} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        {!coupon.is_deleted && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCouponToDelete(coupon.code);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!couponToDelete} onOpenChange={() => setCouponToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the coupon <span className="font-bold text-foreground">{couponToDelete}</span> as deleted. 
              Users will no longer be able to use it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleteLoading}
            >
              {isDeleteLoading ? "Deleting..." : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateCouponModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
        onSuccess={fetchCoupons} 
      />
    </div>
  );
};

export default Coupons;