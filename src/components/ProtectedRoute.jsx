import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const accessToken = sessionStorage.getItem("accessToken");

  
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

 
  return <Outlet />;
};

export default ProtectedRoute;