import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { isTokenValid } from '../../utils';

// Extiende la config para marcar reintentos y evitar bucles infinitos.
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

type RefreshResponse = {
  accessToken?: string;
  refreshToken?: string;
};

// Promise compartida para evitar múltiples refresh simultáneos.
let refreshPromise: Promise<string | null> | null = null;

// Callback registrado por AuthProvider para cerrar sesión desde el interceptor.
let logoutCallback: (() => void) | null = null;
export const setLogoutCallback = (cb: () => void) => {
  logoutCallback = cb;
};

const forceLogout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  logoutCallback?.();
};

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
      forceLogout();
      throw err;
    }
  }

  if (accessToken) {
    setAuthorizationHeader(req, accessToken);
  }

  return req;
});

// Interceptor de response: maneja 401 que devuelve el servidor.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        localStorage.removeItem('accessToken');
        return Promise.reject(error);
      }

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken(refreshToken).finally(() => {
            refreshPromise = null;
          });
        }

        const newAccessToken = await refreshPromise;

        if (newAccessToken) {
          setAuthorizationHeader(originalRequest, newAccessToken);
          return api(originalRequest);
        }
      } catch {
        forceLogout();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
