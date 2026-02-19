import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, User, X, Sun, Moon } from "lucide-react";
import logo from "@/assets/logo.png";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { logout } from "@/api";
import { toast } from "sonner";

const Header = () => {
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar, isDarkMode, toggleDarkMode } = useApp();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handlerLogout = async () => {
    try {
      await logout();
      localStorage.clear();
      window.location.href = "/login";
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between h-full px-6">
        <button
          onClick={toggleSidebar}
          className="w-10 h-10 rounded-xl border-2 border-primary bg-background flex flex-col items-center justify-center gap-1 hover:bg-primary/10 hover:scale-105 transition-all duration-200 shadow-sm"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <X className="w-5 h-5 text-primary" />
          ) : (
            <>
              <div className="w-4 h-0.5 bg-primary rounded-full"></div>
              <div className="w-4 h-0.5 bg-primary rounded-full"></div>
              <div className="w-4 h-0.5 bg-primary rounded-full"></div>
            </>
          )}
        </button>

        <div className="flex items-center gap-3">
          <img src={logo} alt="OR" className="w-10 h-10" />
          <h1 className="text-xl font-bold text-foreground">ROVEX</h1>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search rovers, orders..."
              className="pl-10 bg-muted/50 border-border focus:bg-background transition-colors"
              autoComplete="search-rovers"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-xl border-2 border-primary bg-background flex items-center justify-center hover:bg-primary/10 hover:scale-105 transition-all duration-200 shadow-sm"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-primary" />
            ) : (
              <Moon className="w-5 h-5 text-primary" />
            )}
          </button>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate("/notifications")}
          >
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs">
              3
            </Badge>
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <User className="w-5 h-5" />
            </Button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg py-1 z-50">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#2ec8cf]/10 dark:hover:bg-[#2ec8cf]/20 transition-colors"
                >
                  View Profile
                </button>
                <button
                  onClick={handlerLogout}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-700 transition-colors"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;