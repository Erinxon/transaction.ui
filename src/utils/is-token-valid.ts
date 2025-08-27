import { jwtDecode } from "jwt-decode"

export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;

  try {
    const decoded: { exp?: number } = jwtDecode(token);
    if (!decoded.exp) return false;
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error: unknown) {
    console.log(error);
    return false;
  }
}