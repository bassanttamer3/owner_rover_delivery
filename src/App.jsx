import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import MainLayout from "@/layouts/MainLayout";
import MainPage from "./pages/MainPage";
import Dashboard from "./pages/Dashboard";
import LiveTracking from "./pages/LiveTracking";
import Rovers from "./pages/Rovers";
import Orders from "./pages/Orders";
import Notifications from "./pages/Notifications";
import ActivityLogs from "./pages/ActivityLogs";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Profile from "./pages/profile";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<MainPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/live-tracking" element={<LiveTracking />} />
              <Route path="/rovers" element={<Rovers />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/activity-logs" element={<ActivityLogs />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/Profile" element={<Profile />} />

            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AppProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
