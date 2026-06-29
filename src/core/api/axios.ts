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

const getFirstStringValue = (...values: Array<string | undefined | null>): string | null => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return null;
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
  req.headers = {
    ...(req.headers ?? {}),
    Authorization: `Bearer ${token}`,
  } as InternalAxiosRequestConfig['headers'];
};

const refreshSession = async (refreshTokenValue: string): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken(refreshTokenValue).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
  const { data } = await axios.post<RefreshResponse>(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
    refreshToken,
    RefreshToken: refreshToken,
    refresh_token: refreshToken,
  });

  const payload = (data?.data ?? data) as RefreshResponse;

  const newAccessToken = getFirstStringValue(
    payload.accessToken,
    payload.AccessToken,
    payload.access_token,
    payload.token,
  );

  const newRefreshToken = getFirstStringValue(
    payload.refreshToken,
    payload.RefreshToken,
    payload.refresh_token,
  );

  if (newAccessToken) {
    localStorage.setItem('accessToken', newAccessToken);
  } else {
    localStorage.removeItem('accessToken');
  }

  if (newRefreshToken) {
    localStorage.setItem('refreshToken', newRefreshToken);
  } else {
    localStorage.removeItem('refreshToken');
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
      accessToken = await refreshSession(refreshToken);

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
      accessToken = await refreshSession(refreshToken);

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
      if (originalRequest.url?.includes('/auth/refresh')) {
        forceLogout();
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        forceLogout();
        return Promise.reject(error);
      }

      try {
        const newAccessToken = await refreshSession(refreshToken);

        if (newAccessToken) {
          setAuthorizationHeader(originalRequest, newAccessToken);
          return api.request(originalRequest);
        }

        forceLogout();
      } catch (refreshError) {
        forceLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
