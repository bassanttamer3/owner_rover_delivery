import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

/**
 * Main app shell for all dashboard pages: header, sidebar, and content area.
 */
const DashboardLayout = () => {
  const { isSidebarOpen } = useApp();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header />
      <Sidebar />
      <main
        className={cn(
          "pt-16 pb-8 px-8 transition-all duration-300",
          isSidebarOpen ? "ml-64" : "ml-16"
        )}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
