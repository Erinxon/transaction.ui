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

type TokenPayload = {
  accessToken?: string | null;
  refreshToken?: string | null;
  AccessToken?: string | null;
  RefreshToken?: string | null;
};

type LoginPayload = TokenPayload & {
  requiresTwoFactor?: boolean;
  RequiresTwoFactor?: boolean;
  message?: string | null;
  Message?: string | null;
};

const normalizeTokenPair = (payload: TokenPayload): { accessToken: string | null; refreshToken: string | null } => ({
  accessToken:
    typeof payload.accessToken === 'string'
      ? payload.accessToken
      : typeof payload.AccessToken === 'string'
        ? payload.AccessToken
        : null,
  refreshToken:
    typeof payload.refreshToken === 'string'
      ? payload.refreshToken
      : typeof payload.RefreshToken === 'string'
        ? payload.RefreshToken
        : null,
});

export const login = async (user: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginPayload>('/auth/login', user);
  const tokens = normalizeTokenPair(response.data);

  return {
    ...tokens,
    requiresTwoFactor:
      typeof response.data.requiresTwoFactor === 'boolean'
        ? response.data.requiresTwoFactor
        : Boolean(response.data.RequiresTwoFactor),
    message:
      typeof response.data.message === 'string'
        ? response.data.message
        : typeof response.data.Message === 'string'
          ? response.data.Message
          : null,
  };
};

export const sendTwoFactorCode = async (request: SendTwoFactorCodeRequest): Promise<void> => {
  await api.post('/auth/2fa/send-code', request);
};

export const verifyTwoFactorCode = async (
  request: VerifyTwoFactorCodeRequest
): Promise<VerifyTwoFactorCodeResponse> => {
  const response = await api.post<TokenPayload>('/auth/2fa/verify-code', request);
  const tokens = normalizeTokenPair(response.data);

  if (!tokens.accessToken || !tokens.refreshToken) {
    throw new Error('Invalid verify-two-factor response: missing tokens');
  }

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
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