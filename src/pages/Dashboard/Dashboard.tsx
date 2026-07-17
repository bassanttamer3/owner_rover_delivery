import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Package, Activity, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTelemetry } from "@/hooks/useTelemetry";
import mockRovers from "@/data/mockrovers.json";

type Order = { id: string };

type DashboardRover = {
  id: string;
  name: string;
  status: "active" | "idle" | "problem";
  battery: number;
  currentOrder: Order | null;
  lastUpdate: string;
};

const Dashboard = () => {
  const { rovers: telemetryRovers } = useTelemetry();

  const mockRoversArray = useMemo(() => {
    return Object.entries(mockRovers as Record<string, any>).map(([key, value]) => ({
      id: key,
      ...value,
    }));
  }, []);

  const dashboardData: DashboardRover[] = useMemo(() => {
    return telemetryRovers.map((r) => {
      const mock = mockRoversArray.find((m) => m.id === r.roverId) || {};
      return {
        id: r.roverId,
        name: mock.name || `Rover ${r.roverId.split("-")[1]}`,
        status: r.status === "moving" ? "active" : r.status === "error" ? "problem" : "idle",
        battery: r.battery ?? mock.battery ?? 0,
        currentOrder: (r.currentOrder as Order) || (mock.currentOrder as Order) || null,
        lastUpdate: new Date().toISOString(),
      };
    });
  }, [telemetryRovers, mockRoversArray]);

  const activeRovers = dashboardData.filter((r) => r.status === "active").length;
  const idleRovers = dashboardData.filter((r) => r.status === "idle").length;
  const problemRovers = dashboardData.filter((r) => r.status === "problem").length;
  const activeOrders = dashboardData.filter((r) => r.currentOrder !== null).length;
  const avgBattery = dashboardData.length 
    ? Math.round(dashboardData.reduce((sum, r) => sum + r.battery, 0) / dashboardData.length) 
    : 0;

  return (
    <div className="space-y-6 pt-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to your rover delivery control panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Rovers</CardTitle>
            <Truck className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{dashboardData.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Rovers</CardTitle>
            <Activity className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-green-500">{activeRovers}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Package className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{activeOrders}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-red-500">{problemRovers}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col items-start gap-1">
          <CardTitle>Battery Levels</CardTitle>
          <p className="text-xs text-muted-foreground">Avg: {avgBattery}% | Active: {activeRovers} | Idle: {idleRovers} | Problem: {problemRovers}</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dashboardData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`${value}%`, "Battery"]} />
              <Bar dataKey="battery" fill="#2ec8cf" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardData.slice(0, 5).map((r) => (
              <div key={r.id} className="flex flex-col gap-2 sm:flex-row sm:justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${r.status === "active" ? "bg-green-500" : r.status === "idle" ? "bg-yellow-500" : "bg-red-500"}`} />
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.currentOrder ? `Order: ${r.currentOrder.id}` : "No active order"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{r.battery}% Battery</p>
                  <p className="text-xs text-muted-foreground">{new Date(r.lastUpdate).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;