import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MapPanel from "@/components/MapPanel";
import mockRovers from "@/data/mockRovers.json";
import { useApp } from "@/contexts/AppContext";
import {
  Truck,
  Package,
  MapPin,
  Activity,
  ArrowRight,
  Users,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const MainPage = () => {
  const [selectedRover, setSelectedRover] = useState(null);
  const navigate = useNavigate();
  const { setSelectedRover: setGlobalRover } = useApp();

  const overviewBoxes = [
    {
      icon: Truck,
      title: "Rovers Overview",
      description: "Manage your entire delivery fleet",
      stats: `${mockRovers.length} Total Rovers`,
      route: "/rovers",
    },
    {
      icon: Package,
      title: "Orders Summary",
      description: "Track all active deliveries",
      stats: `${mockRovers.filter((r) => r.currentOrder).length} Active Orders`,
      route: "/orders",
    },
    {
      icon: MapPin,
      title: "Live Tracking",
      description: "Real-time rover location monitoring",
      stats: `${
        mockRovers.filter((r) => r.status === "active").length
      } Active Rovers`,
      route: "/live-tracking",
    },
    {
      icon: Activity,
      title: "Activity Logs",
      description: "View complete fleet activity history",
      stats: "Real-time updates",
      route: "/activity-logs",
    },
  ];

  const teamMembers = [
    { name: "Bassant Tamer", role: "Team Member" },
    { name: "Habiba Mohamed", role: "Team Member" },
    { name: "Salma Osama", role: "Team Member" },
    { name: "Omar Hassan", role: "Team Member" },
    { name: "Ahmed Fayad", role: "Team Member" },
    { name: "Mohammed Abdullah", role: "Team Member" },
    { name: "Hassan Elzayat", role: "Team Member" },
    { name: "Karim Salah", role: "Team Member" },
    { name: "Menna Essam", role: "Team Member" },
    { name: "Mahmoud Galal", role: "Team Member" },
    { name: "Peter Ashraf", role: "Team Member" },
  ];

  const pieData = [
    {
      name: "Active",
      value: mockRovers.filter((r) => r.status === "active").length,
    },
    {
      name: "Idle",
      value: mockRovers.filter((r) => r.status === "idle").length,
    },
    {
      name: "Problem",
      value: mockRovers.filter((r) => r.status === "problem").length,
    },
  ];

  const COLORS = ["#2ec8cf", "#FBBF24", "#F87171"]; // Updated active color

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-[#2ec8cf]/5 to-background flex gap-6">
        <div className="flex-1 rounded-2xl overflow-hidden">
          <div className="h-full">
            <MapPanel
              rovers={mockRovers}
              selectedRover={null}
              onMarkerClick={() => {}}
            />
          </div>
        </div>

        <div className="w-80 space-y-4">
          {mockRovers.map((rover) => (
            <Card key={rover.id} className="p-4">
              <h3 className="text-lg font-bold">{rover.name}</h3>
              <p className="text-sm text-muted-foreground">{rover.id}</p>
              <Badge
                className={`${
                  rover.status === "active"
                    ? "bg-[#2ec8cf] text-white"
                    : rover.status === "idle"
                    ? "bg-yellow-500 text-yellow-900"
                    : "bg-red-500 text-white"
                } my-2`}
              >
                {rover.status.toUpperCase()}
              </Badge>
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Battery</span>
                  <span className="font-bold text-foreground">
                    {rover.battery}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#2ec8cf] h-full rounded-full transition-all duration-300"
                    style={{ width: `${rover.battery}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>Speed</span>
                  <span className="font-bold text-foreground">
                    {rover.speed || 0} mph
                  </span>
                </div>
                {rover.currentOrder && (
                  <div className="mt-1">
                    <span className="text-sm text-muted-foreground">Order</span>
                    <p className="font-medium text-foreground">
                      {rover.currentOrder}
                    </p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Updated {new Date(rover.lastUpdate).toLocaleTimeString()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
        {overviewBoxes.map((box, index) => {
          const Icon = box.icon;
          return (
            <Card
              key={index}
              className="group hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-[#2ec8cf]/50 bg-gradient-to-br from-background to-[#2ec8cf]/5"
              onClick={() => navigate(box.route)}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-xl bg-[#2ec8cf]/10 flex items-center justify-center group-hover:bg-[#2ec8cf] group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-7 h-7 text-[#2ec8cf] group-hover:text-white transition-colors" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {box.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {box.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-sm font-semibold text-[#2ec8cf]">
                    {box.stats}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-[#2ec8cf] text-[#2ec8cf] hover:bg-[#2ec8cf] hover:text-white group-hover:shadow-md transition-all"
                >
                  Show More
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Fleet Insights */}
      <section className="space-y-8 pt-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-foreground">Fleet Insights</h2>
          <p className="text-muted-foreground mt-1">
            Get a quick overview of your fleet performance today
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {["active", "idle", "problem", "order"].map((type, idx) => {
            let count = 0;
            let label = "";
            let colorFrom = "";
            let colorTo = "";
            let Icon = Truck;

            if (type === "active") {
              count = mockRovers.filter((r) => r.status === "active").length;
              label = "Active Rovers";
              colorFrom = "from-[#2ec8cf]/10";
              colorTo = "to-[#2ec8cf]/20";
              Icon = Truck;
            } else if (type === "idle") {
              count = mockRovers.filter((r) => r.status === "idle").length;
              label = "Idle Rovers";
              colorFrom = "from-yellow-100";
              colorTo = "to-yellow-200";
              Icon = Activity;
            } else if (type === "problem") {
              count = mockRovers.filter((r) => r.status === "problem").length;
              label = "Problem Rovers";
              colorFrom = "from-red-100";
              colorTo = "to-red-200";
              Icon = Package;
            } else if (type === "order") {
              count = mockRovers.filter((r) => r.currentOrder).length;
              label = "Total Orders";
              colorFrom = "from-blue-100";
              colorTo = "to-blue-200";
              Icon = MapPin;
            }

            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl bg-gradient-to-tr ${colorFrom} ${colorTo} shadow-lg flex flex-col items-center gap-2`}
              >
                <Icon className="w-10 h-10 text-[#2ec8cf]" />
                <p className="text-3xl font-bold text-foreground">{count}</p>
                <span className="text-sm text-muted-foreground">{label}</span>
                <div className="w-full h-2 bg-muted rounded-full mt-2">
                  <div
                    className="h-full bg-[#2ec8cf] rounded-full transition-all"
                    style={{
                      width: `${(count / mockRovers.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 py-8">
          <PieChart width={250} height={250}>
            <Pie
              data={pieData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index]}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, "Rovers"]} />
          </PieChart>
        </div>

        {/* CTA */}
        <div
          className="bg-[#2ec8cf]/10 p-6 rounded-2xl text-center shadow-md hover:shadow-lg transition cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <h3 className="text-lg font-bold text-[#2ec8cf]">Go to Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            View detailed stats and manage your fleet
          </p>
        </div>
      </section>

      {/* About Us Section */}
      <section className="space-y-8 pt-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Users className="w-8 h-8 text-[#2ec8cf]" />
            <h2 className="text-4xl font-bold text-foreground">
              About Our Team
            </h2>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-[#2ec8cf] to-[#2ec8cf]/50 rounded-full mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We are the Owner Rover Delivery Team, dedicated to revolutionizing
            autonomous delivery systems. Our team combines expertise in
            robotics, software engineering, and logistics to create efficient,
            reliable, and innovative delivery solutions for the modern world.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg hover:scale-105 transition-all duration-300 border-2 hover:border-[#2ec8cf]/30 bg-gradient-to-br from-background to-[#2ec8cf]/5"
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#2ec8cf]/20 to-[#2ec8cf]/40 flex items-center justify-center border-4 border-[#2ec8cf]/30 group-hover:border-[#2ec8cf]/60 transition-all duration-300 group-hover:scale-110">
                  <Users className="w-12 h-12 text-[#2ec8cf]" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg">
                    {member.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
                <div className="w-16 h-1 bg-[#2ec8cf] rounded-full mx-auto group-hover:w-full transition-all duration-300"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MainPage;
