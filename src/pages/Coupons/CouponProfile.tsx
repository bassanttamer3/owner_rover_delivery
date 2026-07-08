import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Tag,
  User,
  Building,
  Percent,
  Trash2,
  Edit3,
  Loader2,
  AlertCircle,
  Check,
  X,
  Hash,
} from "lucide-react";
import { listCoupons, updateCoupon } from "@/api/coupons/coupons";
import { getUser } from "@/lib/auth-storage";
import { ICoupon } from "@/common/interfaces/coupons/coupons.interface";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
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

const CouponProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [coupon, setCoupon] = useState<ICoupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isSaveAlertOpen, setIsSaveAlertOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    expiration_date: "",
    max_usage: 0,
    min_purchase_amount: 0,
  });

const fetchCouponDetails = async () => {
    setLoading(true);
    try {
      const user = getUser() as any;
      const companyId = user?.company?._id;

      const res: any = await listCoupons(companyId);

      if (res.data.success) {
        const couponsArray = res.data?.data?.data || [];

        const found = couponsArray.find((c: ICoupon) => c._id === id || c.code === id);

        if (found) {
          setCoupon(found);
          setEditForm({
            expiration_date: found.expiration_date.split("T")[0],
            max_usage: found.max_usage,
            min_purchase_amount: found.min_purchase_amount || 0,
          });
        } else {
          console.error("Coupon not found in the array:", id);
        }
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Failed to retrieve coupon details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!coupon) return;
    setIsActionLoading(true);
    try {
      // Sending only updateable fields per API documentation
      const payload = {
        expiration_date: editForm.expiration_date,
        max_usage: editForm.max_usage,
        min_purchase_amount: editForm.min_purchase_amount,
      };

      // API uses 'code' as path parameter
      const res = await updateCoupon(coupon.code, payload);
      if (res.data.success) {
        setCoupon({ ...coupon, ...editForm });
        setIsEditing(false);
        toast.success("Coupon updated successfully");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to update coupon";
      toast.error(errorMsg);
    } finally {
      setIsActionLoading(false);
      setIsSaveAlertOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!coupon) return;
    setIsActionLoading(true);
    try {
      const res = await updateCoupon(coupon.code, { is_deleted: true });
      if (res.data.success) {
        toast.success("Coupon deleted successfully");
        navigate("/coupons");
      }
    } catch (err) {
      toast.error("Failed to delete coupon");
    } finally {
      setIsActionLoading(false);
      setIsDeleteAlertOpen(false);
    }
  };

  useEffect(() => {
    if (id) fetchCouponDetails();
  }, [id]);

  if (loading)
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  if (!coupon)
    return (
      <div className="p-6 text-center text-muted-foreground">
        Coupon not found.
      </div>
    );

  const usagePercentage = (coupon.used_count / coupon.max_usage) * 100;
  const isExpired = new Date(coupon.expiration_date) < new Date();

  return (
    <div className="p-6 bg-background min-h-screen text-foreground transition-colors duration-200">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        {/* <button
          onClick={() => navigate(-1)}
          className="flex items-center text-muted-foreground hover:text-[#2ec8cf] transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Coupons
        </button> */}

        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center px-4 py-2 border border-border rounded-lg bg-card text-sm font-medium hover:bg-accent"
              >
                <X className="w-4 h-4 mr-2" /> Cancel
              </button>
              <button
                onClick={() => setIsSaveAlertOpen(true)}
                className="flex items-center px-4 py-2 bg-[#2ec8cf] text-white rounded-lg text-sm font-medium shadow-sm hover:opacity-90"
              >
                <Check className="w-4 h-4 mr-2" /> Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 border border-border rounded-lg bg-card hover:bg-accent text-sm font-medium transition-all"
              >
                <Edit3 className="w-4 h-4 mr-2" /> Edit Details
              </button>
              {!coupon.is_deleted && (
                <button
                  onClick={() => setIsDeleteAlertOpen(true)}
                  className="flex items-center px-4 py-2 bg-red-500/10 text-red-600 border border-red-500/20 rounded-lg hover:bg-red-600 hover:text-white text-sm font-medium transition-all"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-8 rounded-2xl shadow-sm border border-border relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span
                className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  coupon.is_deleted
                    ? "bg-muted text-muted-foreground"
                    : isExpired
                      ? "bg-red-500/10 text-red-500"
                      : "bg-emerald-500/10 text-emerald-500"
                }`}
              >
                {coupon.is_deleted
                  ? "Deleted"
                  : isExpired
                    ? "Expired"
                    : "Active"}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-[#2ec8cf]/10 rounded-xl text-[#2ec8cf]">
                <Tag className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground font-mono tracking-tight">
                  {coupon.code}
                </h1>
                <p className="text-muted-foreground font-medium mt-1">
                  {coupon.discount}{" "}
                  {coupon.discount_type === "percentage" ? "%" : "USD"}{" "}
                  Promotional Discount
                </p>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between mb-2 text-sm font-semibold text-foreground">
                <span>Redemption Progress</span>
                <span className="text-[#2ec8cf]">
                  {coupon.used_count} /{" "}
                  {isEditing ? editForm.max_usage : coupon.max_usage}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-[#2ec8cf] h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                ></div>
              </div>
              {isEditing && (
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1 uppercase font-bold">
                      Adjust Usage Limit
                    </p>
                    <Input
                      type="text"
                      value={editForm.max_usage}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          max_usage: Number(e.target.value),
                        })
                      }
                      className="bg-background"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-start gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium">
                  Expiration Date
                </p>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editForm.expiration_date}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        expiration_date: e.target.value,
                      })
                    }
                    className="mt-1 bg-background h-8"
                  />
                ) : (
                  <p className="font-bold text-foreground">
                    {new Date(coupon.expiration_date).toLocaleDateString(
                      undefined,
                      { dateStyle: "long" },
                    )}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-start gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <Percent className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium">
                  Min Purchase
                </p>
                {isEditing ? (
                  <Input
                    type="text"
                    value={editForm.min_purchase_amount}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        min_purchase_amount: Number(e.target.value),
                      })
                    }
                    className="h-8 mt-1 bg-background"
                  />
                ) : (
                  <p className="font-bold text-foreground">
                    {coupon.min_purchase_amount || 0} USD
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border h-fit">
          <h3 className="font-bold text-foreground mb-6 border-b border-border pb-4">
            Audit Details
          </h3>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-muted-foreground text-sm font-medium">
                <User className="w-4 h-4 mr-2" /> Owner ID
              </div>
              <span className="text-xs font-semibold text-foreground font-mono truncate max-w-[120px]">
                {typeof coupon.user === "string" ? coupon.user : "System"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-muted-foreground text-sm font-medium">
                <Building className="w-4 h-4 mr-2" /> Company
              </div>
              <span className="text-xs font-semibold text-foreground">
                {typeof coupon.company === "string" ? coupon.company : "Main"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-muted-foreground text-sm font-medium">
                <Calendar className="w-4 h-4 mr-2" /> Created On
              </div>
              <span className="text-sm font-semibold text-foreground italic">
                {coupon.createdAt
                  ? new Date(coupon.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            <div className="pt-4 border-t border-border mt-4">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-2">
                Technical ID
              </p>
              <code className="text-[11px] bg-muted p-3 block rounded border border-border text-muted-foreground break-all font-mono leading-relaxed">
                {coupon._id}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={isSaveAlertOpen} onOpenChange={setIsSaveAlertOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Save Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update the details for coupon{" "}
              <span className="font-bold text-foreground">"{coupon.code}"</span>
              ? Note: Coupon codes and discount values are immutable.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isActionLoading}
              onClick={() => {
                // 1. Exit editing mode to return to "View Mode"
                setIsEditing(false);

                // 2. Reset the form fields to the original coupon data
                if (coupon) {
                  setEditForm({
                    expiration_date: coupon.expiration_date.split("T")[0],
                    max_usage: coupon.max_usage,
                    min_purchase_amount: coupon.min_purchase_amount || 0,
                  });
                }
              }}
            >
              Discard
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleUpdate();
              }}
              className="bg-[#2ec8cf] hover:opacity-90 text-white"
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Confirm Save"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will disable the coupon{" "}
              <span className="font-bold text-foreground">"{coupon.code}"</span>
              . Users will no longer be able to apply this discount.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Yes, Delete Coupon"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CouponProfile;
