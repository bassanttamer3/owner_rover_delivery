import { Outlet } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * Minimal layout for auth pages (login, register).
 * No sidebar or dashboard chrome. Shared background respects app theme.
 */
const AuthLayout = () => (
  <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
      <ThemeToggle />
    </div>
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-cyan-100 dark:from-background dark:via-background dark:to-muted" />
    <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-300/20 dark:bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400/20 dark:bg-primary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
    <div className="z-10 w-full">
      <Outlet />
    </div>
  </div>
);

export default AuthLayout;
