import axios, { type InternalAxiosRequestConfig } from 'axios';
import { isTokenValid } from '../../utils';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

type RefreshResponse = {
  accessToken?: string;
  refreshToken?: string;
};

// Promise compartida para evitar múltiples refresh simultáneos.
let refreshPromise: Promise<string | null> | null = null;

const setAuthorizationHeader = (req: InternalAxiosRequestConfig, token: string) => {
  req.headers.Authorization = `${token}`;
};

const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
  const { data } = await axios.post<RefreshResponse>(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
    refreshToken,
  });

  const newAccessToken = typeof data.accessToken === 'string' ? data.accessToken : null;
  const newRefreshToken = typeof data.refreshToken === 'string' ? data.refreshToken : null;

  if (newAccessToken) {
    localStorage.setItem('accessToken', newAccessToken);
  } else {
    localStorage.removeItem('accessToken');
  }

  if (newRefreshToken) {
    localStorage.setItem('refreshToken', newRefreshToken);
  }

  return newAccessToken;
};


// Interceptor de request
api.interceptors.request.use(async (req: InternalAxiosRequestConfig) => {
  let accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (!accessToken) {
    return req;
  }

  const isExpired = isTokenValid(accessToken) === false;

  // Si expiró, esperamos un refresh único y reutilizamos su resultado.
  if (isExpired && refreshToken) {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken(refreshToken).finally(() => {
          refreshPromise = null;
        });
      }

      accessToken = await refreshPromise;
    } catch (err) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw err; // o redirige al login
    }
  }

  if (accessToken) {
    setAuthorizationHeader(req, accessToken);
  }

  return req;
});


export default api;
