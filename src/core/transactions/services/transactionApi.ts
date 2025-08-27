import type { UserTransactionFormValues } from '../../../models/shemas/user-transaction.schema';
import api from '../../api/axios';
import type { CreateTransactionResponse, ImportRequest, ImportResponse, PaginatedResponse, TransactionRequest, TransactionResponse, UpdateTransactionRequest } from '../types/transaction.types';

export const getAllTransactions = async (request: TransactionRequest): Promise<PaginatedResponse<TransactionResponse>> => {
  const response = await api.get('/UserTransaction', {
    params: request
  });
  return response.data;
};

export const createTransaction = async (request: UserTransactionFormValues): Promise<CreateTransactionResponse> => {
  const response = await api.post('/UserTransaction', request);
  return response.data;
};

export const updateTransaction = async (request: UpdateTransactionRequest): Promise<CreateTransactionResponse> => {
  const response = await api.put('/UserTransaction', request);
  return response.data;
};

export const deleteTransaction = async (id: number): Promise<CreateTransactionResponse> => {
  const response = await api.delete(`/UserTransaction/${id}`);
  return response.data;
};

export const importTransactions = async (request: ImportRequest): Promise<ImportResponse> => {
  const response = await api.post('/UserTransaction/import', request);
  return response.data;
};