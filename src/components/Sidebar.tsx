import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  BarChart,
  Truck,
  Package,
  Bell,
  Activity,
  Settings,
  Users,
  Building2,
  Package2,
  Ticket,
  TicketPercent,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Main", path: "/" },
  { icon: BarChart, label: "Dashboard", path: "/dashboard" },
  { icon: MapPin, label: "Live Tracking", path: "/live-tracking" },
  { icon: Truck, label: "Rovers", path: "/rovers" },
  { icon: Package, label: "Orders", path: "/orders" },
  { icon: Package2, label: "Products", path: "/products" },
  { icon: TicketPercent, label: "Coupons", path: "/coupons" },
  { icon: Building2, label: "Companies", path: "/Companies" },
  { icon: Users, label: "Company Users", path: "/company-users" },
  { icon: Users, label: "Fleet Operators", path: "/fleet-operators" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Activity, label: "Activity Logs", path: "/activity-logs" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Sidebar = () => {
  const { isSidebarOpen } = useApp();
  const { userType } = useAuth();
  const visibleItems =
    userType === "company"
      ? menuItems.filter(
          (item) =>
            item.path !== "/fleet-operators" && item.path !== "/Companies"
        )
      : userType === "fleet"
        ? menuItems.filter(
          (item) => 
            item.path !== "/company-users" && item.path !== "/products" && item.path !== "/coupons"
        )
        : menuItems;

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40 shadow-md",
        isSidebarOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex flex-col h-full">
        <nav className="flex-1 px-3 py-6">
          <ul className="space-y-2">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:scale-105",
                        isActive
                          ? "bg-primary text-primary-foreground font-medium shadow-md"
                          : "text-sidebar-foreground",
                        !isSidebarOpen && "justify-center"
                      )
                    }
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {isSidebarOpen && <span className="text-sm">{item.label}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
