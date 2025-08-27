import type { ZodGUID } from "zod/v4";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
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