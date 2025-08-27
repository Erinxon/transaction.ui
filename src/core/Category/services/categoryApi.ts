import api from '../../api/axios';
import type { CategoryResponde } from '../types/category.types';

export const getAllCategories = async (): Promise<CategoryResponde[]> => {
  const response = await api.get('/Category');
  return response.data;
};