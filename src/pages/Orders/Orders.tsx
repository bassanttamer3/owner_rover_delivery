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
import { RefreshCw, Truck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getAllOrders } from "@/api";
import type { Order } from "@/common/interfaces";

const orderStatusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  confirmed: { label: "Confirmed", className: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  processing: { label: "Processing", className: "bg-sky-500/15 text-sky-600 border-sky-500/30" },
  shipped: { label: "Shipped", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  delivered: { label: "Delivered", className: "bg-emerald-600/15 text-emerald-700 border-emerald-600/30" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground border-border" },
};

function OrderStatusBadge({ status }: { status?: string }) {
  const config = orderStatusConfig[status?.toLowerCase() ?? ""] ?? {
    label: status ?? "—",
    className: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge variant="outline" className={`font-normal border text-[11px] ${config.className}`}>
      {config.label}
    </Badge>
  );
}

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchOrders = async (page = 1) => {
    setListLoading(true);
    try {
      const { data } = await getAllOrders({ page, limit: 10 });
      // console.log(data.data);
      setOrders(data.data.data ?? []);
      setTotalPages(data.data.pagination?.total_pages ?? 0);
      setCurrentPage(data.data.pagination?.page ?? page);
    } catch (err) {
      toast.error("Sync Failed");
      setOrders([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6 pt-6 pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Truck className="h-7 w-7 text-[#2ec8cf]" />
          Orders
        </h1>
        <p className="text-muted-foreground text-sm">
          View and manage all orders
        </p>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-muted/20 border-b border-border/50">
          <div>
            <CardTitle className="text-base font-semibold">Orders</CardTitle>
            <CardDescription>
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchOrders(currentPage)}
              disabled={listLoading}
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
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Order Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {listLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-28 mb-2" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-32" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-16" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-14" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </td>
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Truck className="h-10 w-10 opacity-50" />
                        <p className="text-sm font-medium">No orders yet</p>
                        <p className="text-xs max-w-xs">Orders will appear here when available.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  (Array.isArray(orders) ? orders : []).map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {order.user || "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {order.company || "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {typeof order.total_price === "number"
                          ? order.total_price.toFixed(2)
                          : order.total_price ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {typeof order.discount_amount === "number"
                          ? order.discount_amount.toFixed(2)
                          : order.discount_amount ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.order_status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!listLoading && orders.length > 0 && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-border/50 bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => fetchOrders(currentPage - 1)}
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
                onClick={() => fetchOrders(currentPage + 1)}
                className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white border-0"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
