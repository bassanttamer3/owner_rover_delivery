import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { Truck, Package, Activity, Users, MapPin, Mail, Phone, Github, Linkedin, Globe } from "lucide-react"; // ضفت أيقونات للفوتر
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import Lottie from "lottie-react";
import mockRovers from "@/data/mockrovers.json";
import mapAnimation from "@/data/mapbrowsing.json";
import truckNavigation from "@/data/trucknavigation.json";
import RovexHero from "@/components/RovexHero";

const MainPage = () => {
  const navigate = useNavigate();
  const { setSelectedRover: setGlobalRover } = useApp();

  const pieData = [
    { name: "Active", value: (mockRovers as { status: string }[]).filter((r) => r.status === "active").length },
    { name: "Idle", value: (mockRovers as { status: string }[]).filter((r) => r.status === "idle").length },
    { name: "Problem", value: (mockRovers as { status: string }[]).filter((r) => r.status === "problem").length },
  ];

  const COLORS = ["#2ec8cf", "#FBBF24", "#F87171"];

  return (
    <div className="space-y-12"> {/* شلت الـ pb-12 عشان الفوتر يبقى لازق تحت */}
      <RovexHero />

      {/* Live Overview Section */}
      <section className="space-y-8 px-4">
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

      {/* Discover Fleet Section */}
      <section className="relative py-16 px-8 mx-4 bg-gradient-to-r from-[#2ec8cf]/20 to-[#2ec8cf]/5 rounded-3xl overflow-hidden">
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

      {/* Fleet Insights Section */}
      <section className="relative py-12 px-8 mx-4 bg-gradient-to-r from-[#2ec8cf]/20 to-[#2ec8cf]/5 rounded-3xl overflow-hidden">
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

      {/* --- Footer Section البديل لـ About Team --- */}
     {/* --- Footer Section Full Width & Adaptive Colors --- */}
      <footer className="w-full bg-[#2ec8cf] dark:bg-[#2ec8cf]/10 text-white dark:text-foreground mt-12 border-t dark:border-[#2ec8cf]/20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Column 1: Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Truck className="w-8 h-8 text-white dark:text-[#2ec8cf]" />
                <h2 className="text-2xl font-bold tracking-tighter text-white dark:text-foreground">ROVEX</h2>
              </div>
              <p className="text-white/80 dark:text-muted-foreground text-sm leading-relaxed max-w-xs">
                Revolutionizing autonomous delivery systems with our advanced fleet of AI-powered rovers.
              </p>
              <div className="flex gap-4 pt-2">
                <Github className="w-5 h-5 cursor-pointer text-white/80 hover:text-white dark:text-muted-foreground dark:hover:text-[#2ec8cf] transition-colors" />
                <Linkedin className="w-5 h-5 cursor-pointer text-white/80 hover:text-white dark:text-muted-foreground dark:hover:text-[#2ec8cf] transition-colors" />
                <Globe className="w-5 h-5 cursor-pointer text-white/80 hover:text-white dark:text-muted-foreground dark:hover:text-[#2ec8cf] transition-colors" />
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white dark:text-foreground">Quick Navigation</h3>
              <ul className="space-y-2 text-sm text-white/80 dark:text-muted-foreground">
                <li onClick={() => navigate("/dashboard")} className="hover:text-white dark:hover:text-[#2ec8cf] cursor-pointer transition-colors">Dashboard</li>
                <li onClick={() => navigate("/rovers")} className="hover:text-white dark:hover:text-[#2ec8cf] cursor-pointer transition-colors">Fleet Registry</li>
                <li onClick={() => navigate("/live-tracking")} className="hover:text-white dark:hover:text-[#2ec8cf] cursor-pointer transition-colors">Live Tracking</li>
                <li className="hover:text-white dark:hover:text-[#2ec8cf] cursor-pointer transition-colors">Privacy Policy</li>
              </ul>
            </div>

            {/* Column 3: Contact & Team */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white dark:text-foreground">Get In Touch</h3>
              <div className="space-y-3 text-sm text-white/80 dark:text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-white dark:text-[#2ec8cf]" />
                  <span>contact@rovex.ai</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-white dark:text-[#2ec8cf]" />
                  <span>+20 123 456 7890</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-white dark:text-[#2ec8cf]" />
                  <span>Cairo, Egypt</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/20 dark:border-[#2ec8cf]/20">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60 dark:text-muted-foreground/60">Developed by</p>
                <div className="flex flex-col gap-1 mt-1">
                  <a 
                    href="https://www.linkedin.com/in/bassanttamer3/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-white dark:text-foreground hover:text-black dark:hover:text-[#2ec8cf] transition-colors cursor-pointer"
                  >
                    Bassant Tamer
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/habiba-magdy-66589b253/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-white dark:text-foreground hover:text-black dark:hover:text-[#2ec8cf] transition-colors cursor-pointer"
                  >
                    Habiba Mohamed
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 dark:border-[#2ec8cf]/10 text-center text-xs text-white/60 dark:text-muted-foreground/50">
            © {new Date().getFullYear()} ROVEX Fleet Management. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;