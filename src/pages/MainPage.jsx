import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { Truck, Package, Activity, Users, MapPin } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import Lottie from "lottie-react";
import mockRovers from "@/data/mockrovers.json";
import mapAnimation from "@/data/mapbrowsing.json";
import truckNavigation from "@/data/trucknavigation.json";

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
    { name: "Active", value: mockRovers.filter((r) => r.status === "active").length },
    { name: "Idle", value: mockRovers.filter((r) => r.status === "idle").length },
    { name: "Problem", value: mockRovers.filter((r) => r.status === "problem").length },
  ];

  const COLORS = ["#2ec8cf", "#FBBF24", "#F87171"];

  return (
    <div className="space-y-12 pb-12">

      {/* ================= HERO SECTION ================= */}
      <section className="space-y-8">
        <div className="text-center space-y-2 py-8">
          <h2 className="text-3xl font-bold text-foreground">Live Overview</h2>
          <p className="text-sm text-muted-foreground">
            Monitor your fleet in real time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Live Map */}
          <div
            onClick={() => navigate("/live-tracking")}
            className="relative group rounded-2xl overflow-hidden shadow-lg cursor-pointer h-[500px]"
          >
            <Lottie
              animationData={mapAnimation}
              loop
              autoplay
              className="w-full h-full object-cover"
            />

            {/* Center Label */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center space-y-1 z-10">
              <span className="inline-block bg-[#2ec8cf] text-white text-xs px-4 py-1 rounded-full shadow">
                LIVE MAP
                <br />
                Real-time rover locations
              </span>
            </div>

            {/* Hover Overlay + Button */}
            <div className="absolute inset-0 bg-[#2ec8cf]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 flex items-center justify-center">
              <button className="bg-white text-[#2ec8cf] px-5 py-2 rounded-lg shadow hover:bg-[#2ec8cf] hover:text-white transition">
                Go to Live Tracking
              </button>
            </div>
          </div>

          {/* Live Camera */}
          <div
            onClick={() => navigate("/live-tracking")}
            className="relative group rounded-2xl overflow-hidden shadow-lg cursor-pointer h-[500px]"
          >
            <Lottie
              animationData={truckNavigation}
              loop
              autoplay
              className="w-full h-full object-cover"
            />

            {/* Center Label */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center space-y-1 z-10">
              <span className="inline-block bg-[#2ec8cf] text-white text-xs px-4 py-1 rounded-full shadow">
                FRONT CAMERA
                <br />
                Live rover camera feed
              </span>
              
            </div>

            {/* Hover Overlay + Button */}
            <div className="absolute inset-0 bg-[#2ec8cf]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 flex items-center justify-center">
              <button className="bg-white text-[#2ec8cf] px-5 py-2 rounded-lg shadow hover:bg-[#2ec8cf] hover:text-white transition">
                View Live Feed
              </button>
            </div>

            {/* Bottom Badge */}
            <span className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-1 rounded-full z-10">
              MANUAL OVERRIDE
            </span>
          </div>
        </div>
      </section>

      {/* ================= Feature Cards ================= */}
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
                  <h3 className="text-lg font-bold text-foreground mb-1">{box.title}</h3>
                  <p className="text-sm text-muted-foreground">{box.description}</p>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-sm font-semibold text-[#2ec8cf]">{box.stats}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* ================= Fleet Insights ================= */}
      <section className="space-y-8 pt-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-foreground">Fleet Insights</h2>
          <p className="text-muted-foreground mt-1">
            Get a quick overview of your fleet performance today
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {["active", "idle", "problem", "order"].map((type, idx) => {
            let count = 0, label = "", colorFrom = "", colorTo = "", Icon = Truck;

            if (type === "active") { 
              count = mockRovers.filter((r) => r.status === "active").length; 
              label="Active Rovers"; 
              colorFrom="from-[#2ec8cf]/10"; 
              colorTo="to-[#2ec8cf]/20"; 
              Icon=Truck; 
            } else if (type === "idle") { 
              count = mockRovers.filter((r) => r.status === "idle").length; 
              label="Idle Rovers"; 
              colorFrom="from-yellow-100"; 
              colorTo="to-yellow-200"; 
              Icon=Activity; 
            } else if (type === "problem") { 
              count = mockRovers.filter((r) => r.status === "problem").length; 
              label="Problem Rovers"; 
              colorFrom="from-red-100"; 
              colorTo="to-red-200"; 
              Icon=Package; 
            } else if (type === "order") { 
              count = mockRovers.filter((r) => r.currentOrder).length; 
              label="Total Orders"; 
              colorFrom="from-blue-100"; 
              colorTo="to-blue-200"; 
              Icon=MapPin; 
            }

            return (
              <div key={idx} className={`p-6 rounded-2xl bg-gradient-to-tr ${colorFrom} ${colorTo} shadow-lg flex flex-col items-center gap-2`}>
                <Icon className="w-10 h-10 text-[#2ec8cf]" />
                <p className="text-3xl font-bold text-foreground">{count}</p>
                <span className="text-sm text-muted-foreground">{label}</span>
                <div className="w-full h-2 bg-muted rounded-full mt-2">
                  <div className="h-full bg-[#2ec8cf] rounded-full transition-all" style={{ width: `${(count / mockRovers.length) * 100}%` }}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pie Chart */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 py-8">
          <PieChart width={250} height={250}>
            <Pie
              data={pieData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
              labelLine={false}
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} stroke="#fff" strokeWidth={2} />
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

      {/* ================= About Us Section ================= */}
      <section className="space-y-8 pt-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Users className="w-8 h-8 text-[#2ec8cf]" />
            <h2 className="text-4xl font-bold text-foreground">About Our Team</h2>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-[#2ec8cf] to-[#2ec8cf]/50 rounded-full mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We are the Owner Rover Delivery Team, dedicated to revolutionizing autonomous delivery systems. Our team combines expertise in robotics, software engineering, and logistics to create efficient, reliable, and innovative delivery solutions for the modern world.
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
                  <h4 className="font-bold text-foreground text-lg">{member.name}</h4>
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
