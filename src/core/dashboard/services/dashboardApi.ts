import api from '../../api/axios';
import type { RecentTransactionRequest, RecentTransactionResponse, DashboardFilter, SummaryResponse, ByYearRequest, ByYearResponse, DashboardSummaryRequest } from '../types/dashboard.types';

const dashboardDateRanges = [
  'today',
  'last_day',
  'last_7d',
  'this_month',
  'last_month',
  'last_4w',
  'last_3_months',
  'all',
  'date_range',
] as const;

type DashboardDateRangeValue = (typeof dashboardDateRanges)[number];

const isDashboardDateRange = (value: string | null): value is DashboardDateRangeValue =>
  value !== null && dashboardDateRanges.includes(value as (typeof dashboardDateRanges)[number]);

const toSummaryRequest = (request: DashboardFilter): DashboardSummaryRequest => ({
  dateRange: isDashboardDateRange(request.dateRange) ? request.dateRange : undefined,
  minAmount: request.minAmount ?? undefined,
  maxAmount: request.maxAmount ?? undefined,
  startDate: request.startDate ?? undefined,
  endDate: request.endDate ?? undefined,
  description: request.description ?? undefined,
  transactionTypeId:
    request.transactionTypeId === 1
      ? 0
      : request.transactionTypeId === 2
        ? 1
        : undefined,
  categoryId: request.categoryId ?? undefined,
});

const toQueryParams = (request: DashboardSummaryRequest) =>
  Object.fromEntries(
    Object.entries(request).filter(([, value]) => value !== null && value !== undefined)
  ) as Record<string, string | number>;

export const summary = async (request: DashboardFilter): Promise<SummaryResponse> => {
  const response = await api.get('/Dashboard/summary', {
    params: toQueryParams(toSummaryRequest(request))
  });
  return response.data;
};

export const yearly = async (request: ByYearRequest): Promise<ByYearResponse[]> => {
  const response = await api.get('/Dashboard/yearly', {
    params: request
  });
  return response.data;
};

export const recentTransactions = async (request: RecentTransactionRequest): Promise<RecentTransactionResponse[]> => {
  const response = await api.get('/Dashboard/recent', {
    params: request
  });
  return response.data;
};