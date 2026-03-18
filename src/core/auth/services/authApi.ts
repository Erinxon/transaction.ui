import api from '../../api/axios';
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  RegisterRequest,
  RegisterResponse,
  SendTwoFactorCodeRequest,
  VerifyTwoFactorCodeRequest,
  VerifyTwoFactorCodeResponse,
} from '../types/auth.types';

export const login = async (user: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', user);
  return response.data;
};

export const sendTwoFactorCode = async (request: SendTwoFactorCodeRequest): Promise<void> => {
  await api.post('/auth/2fa/send-code', request);
};

export const verifyTwoFactorCode = async (
  request: VerifyTwoFactorCodeRequest
): Promise<VerifyTwoFactorCodeResponse> => {
  const response = await api.post('/auth/2fa/verify-code', request);
  return response.data;
};

export const register = async (user: RegisterRequest): Promise<RegisterResponse> => {
  const response = await api.post('/auth/register', user);
  return response.data;
};

export const forgotPassword = async (
  request: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> => {
  const response = await api.post('/auth/forgot-password', request);
  return response.data;
};

export const resetPassword = async (
  request: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  const response = await api.post('/auth/reset-password', request);
  return response.data;
};