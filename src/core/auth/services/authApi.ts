import api from '../../api/axios';
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../types/auth.types';

export const login = async (user: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', user);
  return response.data;
};

export const register = async (user: RegisterRequest): Promise<RegisterResponse> => {
  const response = await api.post('/auth/register', user);
  return response.data;
};