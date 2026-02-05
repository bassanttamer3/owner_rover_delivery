import { createBrowserRouter, Outlet } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import Login from "@/pages/Login";
import MainPage from "@/pages/MainPage";
import Dashboard from "@/pages/Dashboard";
import LiveTracking from "@/pages/LiveTracking";
import Rovers from "@/pages/Rovers";
import Orders from "@/pages/Orders";
import Notifications from "@/pages/Notifications";
import ActivityLogs from "@/pages/ActivityLogs";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import ForgetPassword from "@/pages/ForgotPassword";
import RestPassword from "@/pages/ResetPassword";
import FleetOperators from "@/pages/FleetOperators";
import Companies from "@/pages/Companies";


function RootLayout() {
  return (
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Outlet />
      </TooltipProvider>
    </AppProvider>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "",
        element: <AuthLayout />,
        children: [
          { index: true, path: "login", element: <Login /> },
          { path: ":loginType/forget-password", element: <ForgetPassword /> },
          { path: "reset-password", element: <RestPassword /> },
        ],
      },
      {
        path: "/",
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { index: true, element: <MainPage /> },
              { path: "dashboard", element: <Dashboard /> },
              { path: "live-tracking", element: <LiveTracking /> },
              { path: "rovers", element: <Rovers /> },
              { path: "orders", element: <Orders /> },
              { path: "notifications", element: <Notifications /> },
              { path: "activity-logs", element: <ActivityLogs /> },
              { path: "settings", element: <Settings /> },
              { path: "profile", element: <Profile /> },
              { path: "fleet-operators", element: <FleetOperators /> },
               { path: "Companies", element: <Companies/> },

            ],
          },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);