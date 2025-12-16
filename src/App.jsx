import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";

import ProtectedRoute from "@/components/ProtectedRoute"; // ← جديد

import MainLayout from "@/layouts/MainLayout";
import MainPage from "./pages/MainPage";
import Dashboard from "./pages/Dashboard";
import LiveTracking from "./pages/LiveTracking";
import Rovers from "./pages/Rovers";
import Orders from "./pages/Orders";
import Notifications from "./pages/Notifications";
import ActivityLogs from "./pages/ActivityLogs";
import Settings from "./pages/Settings";
import Profile from "./pages/profile";
import Login from "./pages/Login"; // ← جديد
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <Routes>
            {/* صفحة الـ Login مفتوحة للجميع */}
            <Route path="/login" element={<Login />} />

            {/* كل الصفحات الرئيسية محمية بالـ ProtectedRoute */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<MainPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/live-tracking" element={<LiveTracking />} />
                <Route path="/rovers" element={<Rovers />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/activity-logs" element={<ActivityLogs />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* أي لينك غلط أو الـ root بدون login → روحي على login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AppProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
