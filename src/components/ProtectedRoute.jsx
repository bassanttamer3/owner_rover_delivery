import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const accessToken = sessionStorage.getItem("accessToken");

  // لو مفيش توكن → روحي على صفحة الـ login
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // لو في توكن → خلي الصفحات اللي جوا تظهر عادي
  return <Outlet />;
};

export default ProtectedRoute;