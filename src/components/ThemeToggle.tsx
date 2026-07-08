import { Sun, Moon } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const ThemeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useApp();

  return (
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
  );
};

export default ThemeToggle;
