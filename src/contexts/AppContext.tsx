import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export type AppContextValue = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  selectedRover: unknown;
  setSelectedRover: (rover: unknown) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);
const THEME_STORAGE_KEY = "isDarkMode";

type AppProviderProps = { children: ReactNode };

export const AppProvider = ({ children }: AppProviderProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedRover, setSelectedRover] = useState<unknown>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return localStorage.getItem(THEME_STORAGE_KEY) === "true";
  });
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (location.pathname === "/") {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem(THEME_STORAGE_KEY, String(isDarkMode));
  }, [isDarkMode]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return (
    <AppContext.Provider
      value={{
        isSidebarOpen,
        toggleSidebar,
        selectedRover,
        setSelectedRover,
        isDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};