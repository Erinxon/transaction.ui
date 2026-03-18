import { jwtDecode } from 'jwt-decode';

interface JwtClaims {
  IsAdmin?: string | boolean;
}

export const isAdminToken = (token: string | null): boolean => {
  if (!token) {
    return false;
  }

  try {
    const claims = jwtDecode<JwtClaims>(token);
    const rawValue = claims.IsAdmin;

    if (typeof rawValue === 'boolean') {
      return rawValue;
    }

    if (typeof rawValue === 'string') {
      return rawValue.toLowerCase() === 'true';
    }

    return false;
  } catch {
    return false;
  }
};