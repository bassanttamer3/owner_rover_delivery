import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Package, AlertCircle, Truck } from "lucide-react";
import mockRovers from "@/data/mockrovers.json";

type RoverWithOrder = {
  id: string;
  name: string;
  status: string;
  currentOrder: { id: string };
  deliveryProgress: number;
};

const Orders = () => {
  const rovers = mockRovers as RoverWithOrder[];
  const orders = rovers
    .filter((rover) => rover.currentOrder)
    .map((rover) => ({
      orderId: rover.currentOrder.id,
      roverId: rover.id,
      roverName: rover.name,
      progress: rover.deliveryProgress,
      status: rover.status,
      estimatedTime: Math.round((100 - rover.deliveryProgress) / 10) + " min",
    }));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground animate-pulse/50">In Progress</Badge>;
      case "problem":
        return <Badge className="bg-destructive text-destructive-foreground animate-pulse">Issue</Badge>;
      default:
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Truck className="w-6 h-6 text-primary" /> Orders
        </h1>
        <p className="text-muted-foreground mt-1">Track all active delivery orders</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Card className="p-4 flex-1 flex items-center gap-4">
          <Package className="w-6 h-6 text-foreground/70" />
          <div>
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold text-foreground mt-1">{orders.length}</p>
          </div>
        </Card>
        <Card className="p-4 flex-1 flex items-center gap-4">
          <Clock className="w-6 h-6 text-success/80" />
          <div>
            <p className="text-sm text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold text-success mt-1">{orders.filter((o) => o.status === "active").length}</p>
          </div>
        </Card>
        <Card className="p-4 flex-1 flex items-center gap-4">
          <AlertCircle className="w-6 h-6 text-destructive/80" />
          <div>
            <p className="text-sm text-muted-foreground">Issues</p>
            <p className="text-2xl font-bold text-destructive mt-1">{orders.filter((o) => o.status === "problem").length}</p>
          </div>
        </Card>
      </div>

      <Card className="overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Rover</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Est. Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.orderId} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="font-medium">{order.orderId}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.roverName}</p>
                      <p className="text-xs text-muted-foreground">{order.roverId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2 max-w-[100px]">
                        <div className="bg-gradient-to-r from-primary to-primary/70 h-2 rounded-full transition-all hover:h-3" style={{ width: `${order.progress}%` }} />
                      </div>
                      <span className="text-sm font-medium">{order.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {order.estimatedTime}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No active orders
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Orders;
