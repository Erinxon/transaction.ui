import type { ZodGUID } from "zod/v4";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string | null;
  refreshToken: string | null;
  requiresTwoFactor: boolean;
  message: string | null;
}

export interface SendTwoFactorCodeRequest {
  email: string;
  password: string;
}

export interface VerifyTwoFactorCodeRequest {
  email: string;
  password: string;
  code: string;
}

export interface VerifyTwoFactorCodeResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  receiveEmailNotifications: boolean;
  receiveMonthlyExpenseReport: boolean;
  receiveWeeklyExpenseReport: boolean;
  receiveBiweeklyExpenseReport: boolean;
  sendWeeklyTransactionBackup: boolean;
  password: string;
}

export interface RegisterResponse {
  id: ZodGUID;
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}