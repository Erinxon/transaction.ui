import { createContext } from 'react';
import type { LoginResponse } from '../types/auth.types';

export interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);