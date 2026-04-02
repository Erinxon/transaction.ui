import api from '../../api/axios';
import type { CategoryResponse, TransactionType } from '../types/category.types';

export const getAllCategories = async (transactionType?: TransactionType): Promise<CategoryResponse[]> => {
  const response = await api.get('/Category', {
    params: {
      transactionType,
    },
  });
  return response.data;
};