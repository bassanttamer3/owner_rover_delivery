import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createCoupon } from "@/api/coupons/coupons";
import { CreateCouponPayload } from "@/common/interfaces/coupons/coupons.interface";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateCouponModal({ open, onOpenChange, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCouponPayload>({
    code: "",
    discount_type: "percentage",
    expiration_date: "",
    max_usage: 100,
    min_purchase_amount: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createCoupon(formData);
      if (res.data.success) {
        toast.success("Coupon created successfully");
        onSuccess();
        onOpenChange(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#2ec8cf]">New Promo Code</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Coupon Code</Label>
            <Input 
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
              placeholder="E.g. SAVE20" 
              required 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Value</Label>
              <Input 
                type="text" 
                value={formData.discount_type}
                onChange={(e) => setFormData({...formData, discount_type: e.target.value as any})}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input 
                type="date" 
                value={formData.expiration_date}
                onChange={(e) => setFormData({...formData, expiration_date: e.target.value})}
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Usage</Label>
              <Input 
                type="text" 
                value={formData.max_usage}
                onChange={(e) => setFormData({...formData, max_usage: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>Min Purchase</Label>
              <Input 
                type="text" 
                value={formData.min_purchase_amount}
                onChange={(e) => setFormData({...formData, min_purchase_amount: Number(e.target.value)})}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90"
            >
              {loading ? "Processing..." : "Create Coupon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}