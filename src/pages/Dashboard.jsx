import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Package, Activity, AlertTriangle, Battery, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import mockRoversData from "@/data/mockrovers.json";

const Dashboard = () => {
  const [rovers, setRovers] = useState(mockRoversData);

  useEffect(() => {
    const interval = setInterval(() => {
      setRovers(prev =>
        prev.map(r => ({
          ...r,
          battery: Math.max(0, r.battery - Math.floor(Math.random() * 5)),
          status: Math.random() > 0.95 ? "problem" : r.status 
        }))
      );
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  const activeRovers = rovers.filter(r => r.status === "active").length;
  const idleRovers = rovers.filter(r => r.status === "idle").length;
  const problemRovers = rovers.filter(r => r.status === "problem").length;
  const activeOrders = rovers.filter(r => r.currentOrder !== null).length;
  const avgBattery = Math.round(rovers.reduce((sum, r) => sum + r.battery, 0) / rovers.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to your rover delivery control panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Rovers</CardTitle>
            <Truck className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{rovers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Rovers</CardTitle>
            <Activity className="w-5 h-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{activeRovers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Package className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{problemRovers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Battery Chart */}
      <Card>
        <CardHeader className="flex flex-col items-start gap-1">
          <CardTitle>Battery Levels</CardTitle>
          {/* إضافة التحليلات الصغيرة هنا */}
          <p className="text-xs text-muted-foreground">
            Avg Battery: {avgBattery}% | Active: {activeRovers} | Idle: {idleRovers} | Problem: {problemRovers}
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={rovers}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name, props) => [`${value}%`, "Battery"]} />
              <Bar dataKey="battery" fill="#2ec8cf" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
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
                    <p className="text-xs text-muted-foreground">
                        {r.currentOrder ? `Order: ${r.currentOrder.id}` : 'No active order'}
                    </p>
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
