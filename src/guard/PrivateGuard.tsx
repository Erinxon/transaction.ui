import { Navigate, Outlet } from "react-router-dom";

export const PrivateGuard = () => {
  const token = localStorage.getItem("accessToken");
  return token ? <Outlet /> : <Navigate to="/login" replace /> 
}