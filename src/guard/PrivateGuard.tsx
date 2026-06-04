import { Navigate, Outlet } from "react-router-dom";
import { isTokenValid } from "../utils";

export const PrivateGuard = () => {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  const isAccessTokenValid = isTokenValid(accessToken);
  if (!isAccessTokenValid && !refreshToken) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}