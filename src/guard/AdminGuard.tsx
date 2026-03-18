import { Navigate, Outlet } from 'react-router-dom';
import { isAdminToken } from '../utils';

export const AdminGuard = () => {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return isAdminToken(token) ? <Outlet /> : <Navigate to="/app/dashboard" replace />;
};