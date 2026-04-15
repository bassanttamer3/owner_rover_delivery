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
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Truck,
  User,
  Building2,
  MapPin,
  DollarSign,
  Percent,
  CreditCard,
  Package,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { getOrderById } from "@/api";
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

const OrderDetails = () => {
  const { order_id } = useParams<{ order_id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    if (!order_id) return;
    try {
      setLoading(true);
      const res = await getOrderById(order_id);
      const data = res.data?.data ?? res.data;
      setOrder(data as Order);
    } catch (err) {
      toast.error("Failed to load order details");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!order_id) {
      setLoading(false);
      return;
    }
    fetchOrder();
  }, [order_id]);

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

  if (!order) {
    return (
      <div className="space-y-6 pt-6 pb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/orders")}
          className="text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to orders
        </Button>
        <Card className="border-border/60">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Order not found</p>
            <p className="text-sm mt-1">The order may have been removed or the link is invalid.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const display = (v: unknown) => (v != null && v !== "" ? String(v) : "—");

  return (
    <div className="space-y-6 pt-6 pb-8">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/orders")}
          className="w-fit text-muted-foreground hover:text-[#2ec8cf]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to orders
        </Button>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Truck className="h-7 w-7 text-[#2ec8cf]" />
            Order Details
          </h1>
          <p className="text-muted-foreground text-sm">
            Order ID: {order._id}
          </p>
        </div>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Summary</CardTitle>
              <CardDescription>Order status and key information</CardDescription>
            </div>
            <OrderStatusBadge status={order.order_status} />
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              icon={<User className="h-5 w-5" />}
              label="User"
              value={display(order.user)}
            />
            <InfoCard
              icon={<Building2 className="h-5 w-5" />}
              label="Company"
              value={display(order.company)}
            />
            <InfoCard
              icon={<DollarSign className="h-5 w-5" />}
              label="Total Price"
              value={
                typeof order.total_price === "number"
                  ? order.total_price.toFixed(2)
                  : display(order.total_price)
              }
            />
            <InfoCard
              icon={<Percent className="h-5 w-5" />}
              label="Discount"
              value={
                typeof order.discount_amount === "number"
                  ? order.discount_amount.toFixed(2)
                  : display(order.discount_amount)
              }
            />
            <InfoCard
              icon={<DollarSign className="h-5 w-5" />}
              label="Final Price"
              value={
                typeof order.final_price === "number"
                  ? order.final_price.toFixed(2)
                  : display(order.final_price)
              }
            />
            <InfoCard
              icon={<CreditCard className="h-5 w-5" />}
              label="Payment Method"
              value={display(order.payment_method)}
            />
            <InfoCard
              icon={<CreditCard className="h-5 w-5" />}
              label="Payment Status"
              value={display(order.payment_status)}
            />
            {order.coupon && (
              <InfoCard
                icon={<Percent className="h-5 w-5" />}
                label="Coupon"
                value={display(order.coupon)}
              />
            )}
            {order.payment_id && (
              <InfoCard
                icon={<CreditCard className="h-5 w-5" />}
                label="Payment ID"
                value={display(order.payment_id)}
              />
            )}
            {order.expires_at && (
              <InfoCard
                icon={<Calendar className="h-5 w-5" />}
                label="Expires At"
                value={display(order.expires_at)}
              />
            )}
          </div>

          {order.shipping_address && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </p>
              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 text-sm">
                {order.shipping_address}
              </div>
            </div>
          )}

          {(order.createdAt || order.updatedAt) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {order.createdAt && (
                <InfoCard
                  icon={<Calendar className="h-5 w-5" />}
                  label="Created At"
                  value={display(order.createdAt)}
                />
              )}
              {order.updatedAt && (
                <InfoCard
                  icon={<Calendar className="h-5 w-5" />}
                  label="Updated At"
                  value={display(order.updatedAt)}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {order.items && order.items.length > 0 && (
        <Card className="border-border/60 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border/50">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </CardTitle>
            <CardDescription>{order.items.length} item(s) in this order</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="border-b border-border/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {order.items.map((item, index) => (
                    <tr key={item.product_id + index} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {item.title || item.product_id || "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {typeof item.price === "number" ? item.price.toFixed(2) : item.price ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground">{item.quantity ?? "—"}</td>
                      <td className="px-4 py-3 text-foreground">
                        {typeof item.price === "number" && typeof item.quantity === "number"
                          ? (item.price * item.quantity).toFixed(2)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderDetails;
