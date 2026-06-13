import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useApp } from "@/contexts/AppContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

/**
 * Main app shell for all dashboard pages: header, sidebar, and content area.
 */
const DashboardLayout = () => {
  const { isSidebarOpen, toggleSidebar } = useApp();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 overflow-x-hidden">
      <Header />
      {isMobile && isSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 top-16 z-40 bg-black/50 backdrop-blur-[1px] md:hidden"
          onClick={toggleSidebar}
        />
      )}
      <Sidebar />
      <main
        className={cn(
          "pt-16 pb-6 px-4 sm:px-6 md:pb-8 md:px-8 transition-all duration-300 min-w-0",
          isMobile ? "ml-0" : isSidebarOpen ? "md:ml-64" : "md:ml-16"
        )}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
