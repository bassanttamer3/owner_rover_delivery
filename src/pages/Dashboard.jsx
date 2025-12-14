import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Package, Activity, AlertTriangle, Battery, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import mockRoversData from "@/data/mockRovers.json";

const Dashboard = () => {
  const [rovers, setRovers] = useState(mockRoversData);

  // Fake dynamic updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRovers(prev =>
        prev.map(r => ({
          ...r,
          battery: Math.max(0, r.battery - Math.floor(Math.random() * 5)), // تقليل البطارية عشوائي
          status: Math.random() > 0.95 ? "problem" : r.status // أحيانًا مشكلة
        }))
      );
    }, 5000); // كل 5 ثواني

    return () => clearInterval(interval);
  }, []);

  const activeRovers = rovers.filter(r => r.status === "active").length;
  const idleRovers = rovers.filter(r => r.status === "idle").length;
  const problemRovers = rovers.filter(r => r.status === "problem").length;
  const activeOrders = rovers.filter(r => r.currentOrder).length;
  const avgBattery = rovers.reduce((sum, r) => sum + r.battery, 0) / rovers.length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to your rover delivery control panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Total Rovers</CardTitle>
            <Truck className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{rovers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Fleet size</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Active Rovers</CardTitle>
            <Activity className="w-5 h-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{activeRovers}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently delivering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Active Orders</CardTitle>
            <Package className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">In transit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Issues</CardTitle>
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{problemRovers}</div>
            <p className="text-xs text-muted-foreground mt-1">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Avg Battery Level</CardTitle>
            <Battery className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgBattery.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Idle Rovers</CardTitle>
            <Truck className="w-5 h-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{idleRovers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle>Fleet Efficiency</CardTitle>
            <TrendingUp className="w-5 h-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {((activeRovers / rovers.length) * 100).toFixed(0)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Battery Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Battery Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={rovers}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="battery" fill="#2ec8cf" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rovers.slice(0, 5).map(r => (
              <div key={r.id} className="flex justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    r.status === 'active' ? 'bg-success' : r.status === 'idle' ? 'bg-warning' : 'bg-destructive'
                  }`} />
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.currentOrder || 'No active order'}</p>
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
