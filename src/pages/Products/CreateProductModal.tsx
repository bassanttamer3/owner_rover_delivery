import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createProduct } from "@/api/products/products";
import type { CreateProductInterface } from "@/common";
import { Package } from "lucide-react";

const initialForm: CreateProductInterface = {
  title: "",
  price: 0,
  description: "",
  stock: 0,
  images_URL: [],
};

export interface CreateProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreateProductModal = ({ open, onOpenChange, onSuccess }: CreateProductModalProps) => {
  const [form, setForm] = useState<CreateProductInterface>(initialForm);
  const [imagesInput, setImagesInput] = useState(""); // one URL per line
  const [loading, setLoading] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setForm(initialForm);
      setImagesInput("");
    }
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!form.title?.trim()) {
      toast.error("Title is required");
      return;
    }
    const priceNum = parseFloat(String(form.price));
    const stockNum = parseInt(String(form.stock), 10);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Please enter a valid price");
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }
    const images = imagesInput
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);

    setLoading(true);
    try {
      await createProduct({
        title: form.title.trim(),
        price: priceNum,
        description: form.description?.trim() ?? "",
        stock: stockNum,
        ...(form.discount != null && form.discount > 0 && { discount: form.discount }),
        images_URL: images,
      });
      toast.success("Product created successfully");
      handleOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { message?: string } } };
      toast.error("Failed to create product", {
        description: axErr.response?.data?.message ?? "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-transparent">
        <Card className="relative shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#2ec8cf]" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#2ec8cf]" />
              Create Product
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-product-title">Title</Label>
              <Input
                id="create-product-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Product title"
                className="border-border focus-visible:ring-[#2ec8cf]/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-product-price">Price</Label>
                <Input
                  id="create-product-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price === 0 ? "" : form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: e.target.value === "" ? 0 : parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                  className="border-border focus-visible:ring-[#2ec8cf]/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-product-stock">Stock</Label>
                <Input
                  id="create-product-stock"
                  type="number"
                  min="0"
                  value={form.stock === 0 ? "" : form.stock}
                  onChange={(e) =>
                    setForm({ ...form, stock: e.target.value === "" ? 0 : parseInt(e.target.value, 10) || 0 })
                  }
                  placeholder="0"
                  className="border-border focus-visible:ring-[#2ec8cf]/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-product-discount">Discount (%)</Label>
              <Input
                id="create-product-discount"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.discount ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    discount: e.target.value === "" ? undefined : parseFloat(e.target.value) || undefined,
                  })
                }
                placeholder="Optional"
                className="border-border focus-visible:ring-[#2ec8cf]/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-product-description">Description</Label>
              <Textarea
                id="create-product-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Product description"
                rows={3}
                className="border-border focus-visible:ring-[#2ec8cf]/50 resize-none"
              />
            </div>
            {/* <div className="space-y-2">
              <Label htmlFor="create-product-images">Image URLs (one per line)</Label>
              <Textarea
                id="create-product-images"
                value={imagesInput}
                onChange={(e) => setImagesInput(e.target.value)}
                placeholder="https://example.com/image1.jpg"
                rows={2}
                className="border-border focus-visible:ring-[#2ec8cf]/50 resize-none font-mono text-xs"
              />
            </div> */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <Button variant="ghost" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white"
              >
                {loading ? "Creating…" : "Create Product"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProductModal;
