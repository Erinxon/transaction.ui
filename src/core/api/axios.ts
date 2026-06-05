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
  AccessToken?: string;
  RefreshToken?: string;
  access_token?: string;
  refresh_token?: string;
  token?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    AccessToken?: string;
    RefreshToken?: string;
    access_token?: string;
    refresh_token?: string;
    token?: string;
  };
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
  req.headers.Authorization = `Bearer ${token}`;
};

const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
  const { data } = await axios.post<RefreshResponse>(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
    RefreshToken: refreshToken,
  });

  const payload = data.data ?? data;

  const newAccessToken =
    typeof payload.accessToken === 'string'
      ? payload.accessToken
      : typeof payload.AccessToken === 'string'
        ? payload.AccessToken
      : typeof payload.access_token === 'string'
        ? payload.access_token
        : typeof payload.token === 'string'
          ? payload.token
          : null;

  const newRefreshToken =
    typeof payload.refreshToken === 'string'
      ? payload.refreshToken
      : typeof payload.RefreshToken === 'string'
        ? payload.RefreshToken
      : typeof payload.refresh_token === 'string'
        ? payload.refresh_token
        : null;

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

  // Si no hay access token, intentamos recuperar sesión usando refresh token.
  if (!accessToken && refreshToken) {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken(refreshToken).finally(() => {
          refreshPromise = null;
        });
      }

      accessToken = await refreshPromise;

      if (!accessToken) {
        forceLogout();
        return Promise.reject(new Error('Session expired: unable to refresh access token'));
      }
    } catch (err) {
      forceLogout();
      throw err;
    }
  }

  if (!accessToken) {
    return req;
  }

  const isExpired = isTokenValid(accessToken) === false;

  // Si expiró, esperamos un refresh único y reutilizamos su resultado.
  if (isExpired && !refreshToken) {
    forceLogout();
    return Promise.reject(new Error('Session expired: missing refresh token'));
  }

  if (isExpired && refreshToken) {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken(refreshToken).finally(() => {
          refreshPromise = null;
        });
      }

      accessToken = await refreshPromise;

      if (!accessToken) {
        forceLogout();
        return Promise.reject(new Error('Session expired: refresh did not return access token'));
      }
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
        forceLogout();
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

        forceLogout();
      } catch {
        forceLogout();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
