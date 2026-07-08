import { createBrowserRouter, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import Login from "@/pages/Login/Login";
import MainPage from "@/pages/MainPage/MainPage";
import Dashboard from "@/pages/Dashboard/Dashboard";
import LiveTracking from "@/pages/LiveTracking/LiveTracking";
import Rovers from "@/pages/Rovers/Rovers";
import Orders from "@/pages/Orders/Orders";
import OrderDetails from "@/pages/Orders/OrderDetails";
import Notifications from "@/pages/Notifications/Notifications";
import ActivityLogs from "@/pages/ActivityLogs/ActivityLogs";
import Settings from "@/pages/Settings/Settings";
import Profile from "@/pages/Profile/Profile";
import NotFound from "@/pages/NotFound/NotFound";
import ForgetPassword from "@/pages/ForgotPassword/ForgotPassword";
import RestPassword from "@/pages/ResetPassword/ResetPassword";
import FleetOperators from "@/pages/FleetOperators/FleetOperators";
import Companies from "@/pages/Companies/Companies";
import CompanyUsers from "@/pages/CompanyUsers/CompanyUsers";
import CompanyProfile from "@/pages/Companies/CompanyProfile";
import ChangePassword from "@/pages/ChangePassword/ChangePassword";
import Details from "@/pages/CompanyUsers/Details";
import OperatorProfile from "@/pages/FleetOperators/OperatorProfile";
import Products from "@/pages/Products/Products";
import ProductDetails from "@/pages/Products/Details";
import Coupons from "@/pages/Coupons/Coupons";
import CouponProfile from "@/pages/Coupons/CouponProfile";
import Customers from "@/pages/Customers/Customers";
import CustomerProfile from "@/pages/Customers/CustomerProfile";
import Payments from "@/pages/Payments/Payments";
import Transactions from "@/pages/Transactions/Transactions";
import SubscriptionsList from "@/pages/Subscriptions/Subscriptions";
import SubscriptionDetails from "@/pages/Subscriptions/SubscriptionDetails";



function RootLayout() {
  return (
    <AuthProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Outlet />
        </TooltipProvider>
      </AppProvider>
    </AuthProvider>
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
          { path: ":loginType/reset-password", element: <RestPassword /> },
          { path: "change-password", element: <ChangePassword /> },
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
              { path: "orders/:order_id", element: <OrderDetails /> },
              { path: "notifications", element: <Notifications /> },
              { path: "activity-logs", element: <ActivityLogs /> },
              { path: "settings", element: <Settings /> },
              { path: "profile", element: <Profile /> },
              { path: "fleet-operators", element: <FleetOperators /> },
              { path: "companies/:company_id", element: <CompanyProfile /> },
              { path: "Companies", element: <Companies/> },
              { path: "fleet-operators/:operator_id", element: <OperatorProfile /> },
              { path: "company-users", element: <CompanyUsers /> },
              { path: "company-users/:user_id", element: <Details /> },
              { path: "products", element: <Products /> },
              { path: "products/:product_id", element: <ProductDetails /> },
              { path: "coupons", element: <Coupons /> },
              { path: "coupons/:id", element: <CouponProfile /> },
              { path: "customers", element: <Customers /> },
              { path: "customers/:customer_id", element: <CustomerProfile /> },
              { path: "payments", element: <Payments /> },
              { path: "transactions", element: <Transactions /> },
              { path: "subscriptions", element: <SubscriptionsList /> },
              { path: "subscriptions/:subscription_id", element: <SubscriptionDetails /> },
            ],
          },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);