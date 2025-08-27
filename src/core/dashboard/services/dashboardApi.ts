import api from '../../api/axios';
import type { RecentTransactionRequest, RecentTransactionResponse, DashboardFilter, SummaryResponse, ByYearRequest, ByYearResponse } from '../types/dashboard.types';

export const summary = async (request: DashboardFilter): Promise<SummaryResponse> => {
  const response = await api.get('/Dashboard/summary', {
    params: request
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