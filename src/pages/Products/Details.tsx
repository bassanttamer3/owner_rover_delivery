import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Package,
  DollarSign,
  FileText,
  Layers,
  Percent,
  ImageIcon,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getProductById, updateProduct } from "@/api/products/products";
import type { IProduct, UpdateProductInterface } from "@/common";

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-border/60 bg-card">
      <div className="p-2.5 rounded-lg bg-muted/50 text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">{label}</p>
        <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}

const ProductDetails = () => {
  const { product_id } = useParams<{ product_id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editDiscount, setEditDiscount] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  const fetchProduct = async () => {
    if (!product_id) return;
    try {
      setLoading(true);
      const res = await getProductById(product_id);
      const data = res.data?.data ?? res.data;
      setProduct(data as IProduct);
    } catch (err) {
      toast.error("Failed to load product details");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!product_id) {
      setLoading(false);
      return;
    }
    fetchProduct();
  }, [product_id]);

  useEffect(() => {
    if (product) {
      setEditTitle(product.title);
      setEditPrice(String(product.price));
      setEditDescription(product.description ?? "");
      setEditStock(String(product.stock));
      setEditDiscount(product.discount != null ? String(product.discount) : "");
      setEditIsActive(product.is_active);
    }
  }, [product]);

  const startEditing = () => {
    if (product) {
      setEditTitle(product.title);
      setEditPrice(String(product.price));
      setEditDescription(product.description ?? "");
      setEditStock(String(product.stock));
      setEditDiscount(product.discount != null ? String(product.discount) : "");
      setEditIsActive(product.is_active);
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    if (product) {
      setEditTitle(product.title);
      setEditPrice(String(product.price));
      setEditDescription(product.description ?? "");
      setEditStock(String(product.stock));
      setEditDiscount(product.discount != null ? String(product.discount) : "");
      setEditIsActive(product.is_active);
    }
    setIsEditing(false);
  };

  const saveProduct = async () => {
    if (!product_id || !product) return;
    const priceNum = parseFloat(editPrice);
    const stockNum = parseInt(editStock, 10);
    const discountNum = editDiscount.trim() ? parseFloat(editDiscount) : undefined;
    if (isNaN(priceNum) || isNaN(stockNum)) {
      toast.error("Price and stock must be valid numbers");
      return;
    }
    if (discountNum !== undefined && (isNaN(discountNum) || discountNum < 0 || discountNum > 100)) {
      toast.error("Discount must be a number between 0 and 100");
      return;
    }
    try {
      setSaving(true);
      const payload: UpdateProductInterface = {
        title: editTitle.trim(),
        price: priceNum,
        description: editDescription.trim(),
        stock: stockNum,
        discount: discountNum,
        is_active: editIsActive,
      };
      await updateProduct(payload, product_id);
      await fetchProduct();
      setIsEditing(false);
      toast.success("Product updated successfully");
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(ax?.response?.data?.message ?? ax?.message ?? "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pt-6 pb-8">
        <Skeleton className="h-8 w-48" />
        <Card className="border-border/60">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-6 pt-6 pb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/products")}
          className="text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to products
        </Button>
        <Card className="border-border/60">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Product not found</p>
            <p className="text-sm mt-1">The product may have been removed or the link is invalid.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-6 pb-8">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/products")}
          className="w-fit text-muted-foreground hover:text-[#2ec8cf]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to products
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Package className="h-7 w-7 text-[#2ec8cf]" />
              {isEditing ? editTitle : product.title}
            </h1>
            <p className="text-muted-foreground text-sm">
              Product details and information
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  onClick={saveProduct}
                  disabled={saving}
                  className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelEditing}
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={startEditing}
                className="border-[#2ec8cf]/50 text-[#2ec8cf] hover:bg-[#2ec8cf]/10"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Details</CardTitle>
              <CardDescription>ID: {product._id}</CardDescription>
            </div>
            {!isEditing && (
              <Badge
                variant="outline"
                className={
                  product.is_active
                    ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                    : "bg-muted text-muted-foreground border-border"
                }
              >
                {product.is_active ? "Active" : "Inactive"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Product title"
                    className="border-border focus-visible:ring-[#2ec8cf]/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="0.00"
                    className="border-border focus-visible:ring-[#2ec8cf]/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-stock">Stock</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    min="0"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    placeholder="0"
                    className="border-border focus-visible:ring-[#2ec8cf]/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-discount">Discount (%)</Label>
                  <Input
                    id="edit-discount"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(e.target.value)}
                    placeholder="Optional"
                    className="border-border focus-visible:ring-[#2ec8cf]/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Product description"
                  rows={4}
                  className="border-border focus-visible:ring-[#2ec8cf]/50 resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="edit-active"
                  checked={editIsActive}
                  onCheckedChange={setEditIsActive}
                />
                <Label htmlFor="edit-active" className="cursor-pointer">
                  Active (product is visible and available)
                </Label>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard
                  icon={<DollarSign className="h-5 w-5" />}
                  label="Price"
                  value={`$${typeof product.price === "number" ? product.price.toFixed(2) : product.price}`}
                />
                <InfoCard
                  icon={<Layers className="h-5 w-5" />}
                  label="Stock"
                  value={String(product.stock)}
                />
                {product.discount != null && (
                  <InfoCard
                    icon={<Percent className="h-5 w-5" />}
                    label="Discount"
                    value={`${product.discount}%`}
                  />
                )}
              </div>

              {product.description && (
                <div className="mt-4">
                  <InfoCard
                    icon={<FileText className="h-5 w-5" />}
                    label="Description"
                    value={product.description}
                  />
                </div>
              )}

              {product.images_URL?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight mb-2 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Images
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.images_URL.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-lg border border-border/60 overflow-hidden hover:opacity-90 transition-opacity"
                      >
                        <img
                          src={url}
                          alt={`Product ${index + 1}`}
                          className="h-20 w-20 object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDetails;
