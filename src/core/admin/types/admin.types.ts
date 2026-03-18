export type LogLevel = 'Information' | 'Warning' | 'Error' | 'Fatal';

export interface SystemLog {
  id: string;
  message: string;
  level: string;
  timestamp: string;
  exception: string | null;
  properties: string | null;
  requestPath: string | null;
  requestMethod: string | null;
  statusCode: number | null;
  userId: string | null;
  userName: string | null;
  ipAddress: string | null;
  responseTimeMs: number | null;
}

export interface UserSummary {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

export interface UserAudit {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityName: string;
  entityId: string | null;
  oldValues: string | null;
  newValues: string | null;
  ipAddress: string | null;
  timestamp: string;
  additionalInfo: string | null;
  user: UserSummary;
}

export interface AdminUser {
  id: string;
  userName: string;
  email: string;
  emailConfirmed: boolean;
  phoneNumber: string | null;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  receiveEmailNotifications: boolean;
  receiveMonthlyExpenseReport: boolean;
  receiveWeeklyExpenseReport: boolean;
  receiveBiweeklyExpenseReport: boolean;
  sendWeeklyTransactionBackup: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd: string | null;
  lockoutEnabled: boolean;
}

export interface DashboardRecentError {
  id: string;
  message: string;
  timestamp: string;
  requestPath: string | null;
  userName: string | null;
}

export interface AdminDashboardResponse {
  totalRequests: number;
  totalErrors: number;
  logsByLevel: Record<string, number>;
  requestsByDay: Record<string, number>;
  mostUsedEndpoints: Record<string, number>;
  recentErrors: DashboardRecentError[];
}

export interface DateRangeFilter {
  from?: string;
  to?: string;
}

export interface AdminLogsRequest extends DateRangeFilter {
  level?: LogLevel;
  userId?: string;
  requestPath?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminAuditRequest extends DateRangeFilter {
  userId?: string;
  action?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminUsersRequest {
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminActionResponse {
  message: string;
}

export interface UserStatisticsResponse {
  TotalTransactions: number;
  TotalIncome: number;
  TotalExpense: number;
  LastTransactionDate: string | null;
  RecentActions: Array<{
    Action: string;
    Timestamp: string;
  }>;
}