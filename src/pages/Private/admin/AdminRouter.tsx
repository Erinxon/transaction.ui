import { Navigate, Route } from 'react-router-dom';
import { RoutesWithNotFound } from '../../../components';
import { AppRoutes } from '../../../models/AppRoutes';
import { AdminDashboard } from './AdminDashboard';
import { AdminLogs } from './AdminLogs';
import { AdminAudit } from './AdminAudit';
import { AdminUsers } from './AdminUsers';
import { AdminCategories } from './AdminCategories';

export const AdminRouter = () => {
  return (
    <RoutesWithNotFound>
      <Route path="" element={<Navigate to={AppRoutes.private.admin.dashboard} replace />} />
      <Route path={AppRoutes.private.admin.dashboard} element={<AdminDashboard />} />
      <Route path={AppRoutes.private.admin.logs} element={<AdminLogs />} />
      <Route path={AppRoutes.private.admin.audit} element={<AdminAudit />} />
      <Route path={AppRoutes.private.admin.users} element={<AdminUsers />} />
      <Route path={AppRoutes.private.admin.categories} element={<AdminCategories />} />
    </RoutesWithNotFound>
  );
};