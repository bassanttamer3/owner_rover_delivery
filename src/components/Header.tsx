import { useNavigate } from "react-router-dom";
import { User, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/api";
import { clear } from "@/lib/auth-storage";
import NotificationMenu from "@/components/NotificationMenu";
import ThemeToggle from "@/components/ThemeToggle";

const Header = () => {
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useApp();
  const { logout: authLogout } = useAuth();

  const handlerLogout = async () => {
    await logout();
    clear();
    authLogout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={toggleSidebar}
            className="w-10 h-10 rounded-xl border-2 border-primary bg-background flex flex-col items-center justify-center gap-1 hover:bg-primary/10 hover:scale-105 transition-all duration-200 shadow-sm shrink-0"
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

          <img src={logo} alt="OR" className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" />
          <h1 className="text-lg sm:text-xl font-bold text-foreground truncate hidden sm:block">ROVEX</h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 relative shrink-0">
          <ThemeToggle />

          <NotificationMenu />

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open profile menu">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onSelect={() => navigate("/profile")}>View Profile</DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handlerLogout}
                className="text-red-500 focus:bg-red-100 dark:focus:bg-red-700"
              >
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;