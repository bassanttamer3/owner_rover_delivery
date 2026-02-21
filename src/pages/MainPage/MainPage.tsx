import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { Truck, Package, Activity, Users, MapPin } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import Lottie from "lottie-react";
import mockRovers from "@/data/mockrovers.json";
import mapAnimation from "@/data/mapbrowsing.json";
import truckNavigation from "@/data/trucknavigation.json";
import RovexHero from "@/components/RovexHero";

const MainPage = () => {
  const navigate = useNavigate();
  const { setSelectedRover: setGlobalRover } = useApp();

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
    { name: "Active", value: (mockRovers as { status: string }[]).filter((r) => r.status === "active").length },
    { name: "Idle", value: (mockRovers as { status: string }[]).filter((r) => r.status === "idle").length },
    { name: "Problem", value: (mockRovers as { status: string }[]).filter((r) => r.status === "problem").length },
  ];

  const COLORS = ["#2ec8cf", "#FBBF24", "#F87171"];

  return (
    <div className="space-y-12 pb-12">
      <RovexHero />

      <section className="space-y-8">
        <div className="text-center space-y-2 py-8">
          <h2 className="text-3xl font-bold text-foreground">Live Overview</h2>
          <p className="text-sm text-muted-foreground">Monitor your fleet in real time</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onClick={() => navigate("/live-tracking")}
            className="relative group rounded-2xl overflow-hidden shadow-lg cursor-pointer h-[500px]"
          >
            <Lottie animationData={mapAnimation} loop autoplay className="w-full h-full object-cover" />
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center space-y-1 z-10">
              <span className="inline-block bg-[#2ec8cf] text-white text-xs px-4 py-1 rounded-full shadow">
                LIVE MAP<br />Real-time rover locations
              </span>
            </div>
            <div className="absolute inset-0 bg-[#2ec8cf]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 flex items-center justify-center">
              <button className="bg-white text-[#2ec8cf] px-5 py-2 rounded-lg shadow hover:bg-[#2ec8cf] hover:text-white transition">
                Go to Live Tracking
              </button>
            </div>
          </div>

          <div
            onClick={() => navigate("/live-tracking")}
            className="relative group rounded-2xl overflow-hidden shadow-lg cursor-pointer h-[500px]"
          >
            <Lottie animationData={truckNavigation} loop autoplay className="w-full h-full object-cover" />
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center space-y-1 z-10">
              <span className="inline-block bg-[#2ec8cf] text-white text-xs px-4 py-1 rounded-full shadow">
                FRONT CAMERA<br />Live rover camera feed
              </span>
            </div>
            <div className="absolute inset-0 bg-[#2ec8cf]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 flex items-center justify-center">
              <button className="bg-white text-[#2ec8cf] px-5 py-2 rounded-lg shadow hover:bg-[#2ec8cf] hover:text-white transition">
                View Live Feed
              </button>
            </div>
            <span className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-1 rounded-full z-10">
              MANUAL OVERRIDE
            </span>
          </div>
        </div>
      </section>

      <section className="relative py-16 px-8 bg-gradient-to-r from-[#2ec8cf]/20 to-[#2ec8cf]/5 rounded-3xl overflow-hidden">
        <div className="absolute top-0 -left-16 w-96 h-96 bg-[#2ec8cf]/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 -right-16 w-96 h-96 bg-[#2ec8cf]/20 rounded-full blur-3xl -z-10" />
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-extrabold text-foreground">Discover Your Rovers Fleet</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Explore all autonomous rovers in your fleet with a single click.
          </p>
          <button
            onClick={() => navigate("/rovers")}
            className="mt-4 px-8 py-3 bg-[#2ec8cf] text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl hover:bg-[#2ec8cf]/90 transition-all duration-300"
          >
            Go to Rovers Page
          </button>
        </div>
      </section>

      <section className="relative py-12 px-8 bg-gradient-to-r from-[#2ec8cf]/20 to-[#2ec8cf]/5 rounded-3xl overflow-hidden">
        <div className="absolute top-0 -left-16 w-96 h-96 bg-[#2ec8cf]/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 -right-16 w-96 h-96 bg-[#2ec8cf]/20 rounded-full blur-3xl -z-10" />
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-extrabold text-foreground">Fleet Insights</h2>
          <p className="text-muted-foreground text-lg">Get a quick overview of your fleet performance today</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { type: "active", label: "Active Rovers", Icon: Truck, colorFrom: "from-[#2ec8cf]/10", colorTo: "to-[#2ec8cf]/20" },
              { type: "idle", label: "Idle Rovers", Icon: Activity, colorFrom: "from-yellow-100", colorTo: "to-yellow-200" },
              { type: "problem", label: "Problem Rovers", Icon: Package, colorFrom: "from-red-100", colorTo: "to-red-200" },
              { type: "order", label: "Total Orders", Icon: MapPin, colorFrom: "from-blue-100", colorTo: "to-blue-200" },
            ].map(({ type, label, Icon, colorFrom, colorTo }, idx) => {
              const count =
                type === "order"
                  ? (mockRovers as { currentOrder?: unknown }[]).filter((r) => r.currentOrder).length
                  : (mockRovers as { status: string }[]).filter((r) => r.status === type).length;
              return (
                <div key={idx} className={`p-6 rounded-2xl bg-gradient-to-tr ${colorFrom} ${colorTo} shadow-lg flex flex-col items-center gap-2`}>
                  <Icon className="w-10 h-10 text-[#2ec8cf]" />
                  <p className="text-3xl font-bold text-foreground">{count}</p>
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <div className="w-full h-2 bg-muted rounded-full mt-2">
                    <div className="h-full bg-[#2ec8cf] rounded-full transition-all" style={{ width: `${(count / (mockRovers as unknown[]).length) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center py-8">
            <PieChart width={250} height={250}>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Rovers"]} />
            </PieChart>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 px-8 py-3 bg-[#2ec8cf] text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl hover:bg-[#2ec8cf]/90 transition-all duration-300"
          >
            Go to Dashboard
          </button>
        </div>
      </section>

      <section className="space-y-8 pt-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Users className="w-8 h-8 text-[#2ec8cf]" />
            <h2 className="text-4xl font-bold text-foreground">About Our Team</h2>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-[#2ec8cf] to-[#2ec8cf]/50 rounded-full mx-auto mb-6" />
          <p className="text-lg text-muted-foreground leading-relaxed">
            We are the Owner Rover Delivery Team, dedicated to revolutionizing autonomous delivery systems.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <Card key={index} className="group hover:shadow-lg hover:scale-105 transition-all duration-300 border-2 hover:border-[#2ec8cf]/30 bg-gradient-to-br from-background to-[#2ec8cf]/5">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#2ec8cf]/20 to-[#2ec8cf]/40 flex items-center justify-center border-4 border-[#2ec8cf]/30 group-hover:border-[#2ec8cf]/60 transition-all duration-300 group-hover:scale-110">
                  <Users className="w-12 h-12 text-[#2ec8cf]" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg">{member.name}</h4>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
                <div className="w-16 h-1 bg-[#2ec8cf] rounded-full mx-auto group-hover:w-full transition-all duration-300" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MainPage;
