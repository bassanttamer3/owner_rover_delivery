import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Package, Search, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { listProducts } from "@/api/products/products";
import { getUser } from "@/lib/auth-storage";
import type { IProduct } from "@/common";
import CreateProductModal from "./CreateProductModal";

function StatusBadge({ isActive }: { isActive: boolean }) {
  const config = isActive
    ? { label: "Active", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" }
    : { label: "Inactive", className: "bg-muted text-muted-foreground border-border" };
  return (
    <Badge variant="outline" className={`font-normal border text-[11px] ${config.className}`}>
      {config.label}
    </Badge>
  );
}

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTitle, setSearchTitle] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchProducts = async (page = 1) => {
    const user = getUser();
    const companyId = user?.company_id as string;

    setListLoading(true);
    try {
      const res = await listProducts(
        { page, limit: 10, title: searchTitle.trim() || undefined },
        companyId
      );
      const rows = res.data?.data.data;
      // console.log(res.data?.data);
      setProducts(Array.isArray(rows) ? rows : []);
      setTotalPages(res.data?.data.pagination?.total_pages ?? 0);
      setCurrentPage(res.data?.data.pagination?.page ?? page);
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const user = getUser();
  const companyId = user?.company_id as string | undefined;

  return (
    <div className="space-y-6 pt-6 pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Package className="h-7 w-7 text-[#2ec8cf]" />
          Products
        </h1>
        <p className="text-muted-foreground text-sm">
          View and manage your product catalog
        </p>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-muted/20 border-b border-border/50">
          <div>
            <CardTitle className="text-base font-semibold">Product list</CardTitle>
            <CardDescription>
              {products.length} {products.length === 1 ? "product" : "products"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white"
              size="sm"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Product
            </Button>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && companyId && fetchProducts(1)}
                className="pl-8 w-56 h-8 border-[#2ec8cf]/30 focus-visible:ring-[#2ec8cf]/50"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => companyId && fetchProducts(1)}
              disabled={listLoading || !companyId}
              className="border-[#2ec8cf]/50 text-[#2ec8cf] hover:bg-[#2ec8cf]/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${listLoading ? "animate-spin" : ""}`} />
              Sync
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="rounded-b-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {listLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-36 mb-2" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-16" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-12" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </td>
                    </tr>
                  ))
                ) : !companyId ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Package className="h-10 w-10 opacity-50" />
                        <p className="text-sm font-medium">Company not found</p>
                        <p className="text-xs max-w-xs">Please log in again to load products.</p>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Package className="h-10 w-10 opacity-50" />
                        <p className="text-sm font-medium">No products yet</p>
                        <p className="text-xs max-w-xs">Add your first product to get started.</p>
                        <Button
                          onClick={() => setShowCreateModal(true)}
                          size="sm"
                          className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white mt-1"
                        >
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Create Product
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  (Array.isArray(products) ? products : []).map((product) => (
                    <tr
                      key={product._id}
                      onClick={() => navigate(`/products/${product._id}`)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3 font-medium text-foreground group-hover:text-[#2ec8cf] transition-colors">
                        {product.title}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {typeof product.price === "number"
                          ? `$${product.price.toFixed(2)}`
                          : product.price}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {product.stock}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge isActive={product.is_active} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!listLoading && products.length > 0 && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-border/50 bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => fetchProducts(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-xs font-medium text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => fetchProducts(currentPage + 1)}
                className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white border-0"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateProductModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => fetchProducts(1)}
      />
    </div>
  );
};

export default Products;
