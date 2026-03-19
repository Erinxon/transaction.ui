import api from '../../api/axios';
import type {
  AdminActionResponse,
  AdminAuditRequest,
  AdminDashboardResponse,
  AdminLogsRequest,
  AdminUser,
  AdminUsersRequest,
  DateRangeFilter,
  SystemLog,
  UserAudit,
  UserStatisticsResponse,
} from '../types/admin.types';

export const getAdminLogs = async (request: AdminLogsRequest): Promise<SystemLog[]> => {
  const response = await api.get('/api/admin/logs', { params: request });
  return response.data;
};

export const getLogStatistics = async (request: DateRangeFilter): Promise<Record<string, number>> => {
  const response = await api.get('/api/admin/logs/statistics', { params: request });
  return response.data;
};

export const getRecentErrors = async (count = 10): Promise<SystemLog[]> => {
  const response = await api.get('/api/admin/logs/recent-errors', { params: { count } });
  return response.data;
};

export const getMostUsedEndpoints = async (
  request: DateRangeFilter & { top?: number },
): Promise<Record<string, number>> => {
  const response = await api.get('/api/admin/logs/most-used-endpoints', { params: request });
  return response.data;
};

export const getRequestsByDay = async (request: DateRangeFilter): Promise<Record<string, number>> => {
  const response = await api.get('/api/admin/logs/requests-by-day', { params: request });
  return response.data;
};

export const getUserAuditByUser = async (
  userId: string,
  request: Omit<AdminAuditRequest, 'userId'>,
): Promise<UserAudit[]> => {
  const response = await api.get(`/api/admin/audit/user/${userId}`, { params: request });
  return response.data;
};

export const getAllAudits = async (request: AdminAuditRequest): Promise<UserAudit[]> => {
  const response = await api.get('/api/admin/audit', { params: request });
  return response.data;
};

export const getAdminUsers = async (request: AdminUsersRequest): Promise<AdminUser[]> => {
  const response = await api.get('/api/admin/users', { params: request });
  return response.data;
};

export const getAdminUserById = async (userId: string): Promise<AdminUser> => {
  const response = await api.get(`/api/admin/users/${userId}`);
  return response.data;
};

export const activateUser = async (userId: string): Promise<AdminActionResponse> => {
  const response = await api.post(`/api/admin/users/${userId}/activate`);
  return response.data;
};

export const deactivateUser = async (userId: string): Promise<AdminActionResponse> => {
  const response = await api.post(`/api/admin/users/${userId}/deactivate`);
  return response.data;
};

export const confirmUserEmail = async (userId: string): Promise<AdminActionResponse> => {
  const response = await api.post(`/api/admin/users/${userId}/confirm-email`);
  return response.data;
};

export const getUserStatistics = async (userId: string): Promise<UserStatisticsResponse> => {
  const response = await api.get(`/api/admin/users/${userId}/statistics`);
  return response.data;
};

export const getAdminDashboard = async (request: DateRangeFilter): Promise<AdminDashboardResponse> => {
  const response = await api.get('/api/admin/dashboard', { params: request });
  return response.data;
};