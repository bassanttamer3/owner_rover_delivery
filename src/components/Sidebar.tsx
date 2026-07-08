import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  BarChart,
  Truck,
  Package,
  ScrollText,
  Settings,
  Building2,
  TicketPercent,
  Boxes,
  UserCog,
  HardHat,
  Contact,
  ArrowLeftRight,
  Wallet,
  Repeat,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Main", path: "/" },
  { icon: BarChart, label: "Dashboard", path: "/dashboard" },
  { icon: MapPin, label: "Live Tracking", path: "/live-tracking" },
  { icon: Truck, label: "Rovers", path: "/rovers" },
  { icon: Package, label: "Orders", path: "/orders" },
  { icon: Boxes, label: "Products", path: "/products" },
  { icon: TicketPercent, label: "Coupons", path: "/coupons" },
  { icon: Building2, label: "Companies", path: "/Companies" },
  { icon: UserCog, label: "Company Users", path: "/company-users" },
  { icon: HardHat, label: "Fleet Operators", path: "/fleet-operators" },
  { icon: ScrollText, label: "Activity Logs", path: "/activity-logs" },
  { icon: ArrowLeftRight, label: "Transactions", path: "/transactions" },
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: Contact, label: "Customers", path: "/customers" },
  { icon: Wallet, label: "Payments", path: "/payments" },
  { icon: Repeat, label: "Subscriptions", path: "/subscriptions" },
];

const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar } = useApp();
  const { userType } = useAuth();
  const isMobile = useIsMobile();
  const visibleItems =
    userType === "company"
      ? menuItems.filter(
          (item) =>
            item.path !== "/fleet-operators" && item.path !== "/Companies"
        )
      : userType === "fleet"
        ? menuItems.filter(
          (item) =>
            item.path !== "/company-users" &&
          item.path !== "/products" &&
          item.path !== "/coupons" &&
          item.path !== "/orders" &&
          item.path !== "/customers" &&
          item.path !== "/payments" &&
          item.path !== "/subscriptions"
        )
        : menuItems;

  const showLabels = isMobile || isSidebarOpen;

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-sidebar border-r border-sidebar-border transition-all duration-300 shadow-md",
        isMobile
          ? cn("w-64 z-50", isSidebarOpen ? "translate-x-0" : "-translate-x-full")
          : cn("z-40", isSidebarOpen ? "w-64" : "w-16")
      )}
    >
      <div className="flex flex-col h-full overflow-y-auto">
        <nav className="flex-1 px-3 py-6">
          <ul className="space-y-2">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === "/"}
                    onClick={() => {
                      if (isMobile) toggleSidebar();
                    }}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:scale-105",
                        isActive
                          ? "bg-primary text-primary-foreground font-medium shadow-md"
                          : "text-sidebar-foreground",
                        !showLabels && "justify-center"
                      )
                    }
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {showLabels && <span className="text-sm">{item.label}</span>}
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
