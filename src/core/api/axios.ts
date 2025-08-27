import axios, { type InternalAxiosRequestConfig } from 'axios';
import { isTokenValid } from '../../utils';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Para evitar múltiples refresh simultáneos
let isRefreshing = false;


// Interceptor de request
api.interceptors.request.use(async (req: InternalAxiosRequestConfig) => {
  let accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (accessToken) {
    const isExpired = isTokenValid(accessToken) === false;

    // Si expiró, intentamos refresh antes de enviar la request
    if (isExpired && refreshToken && !isRefreshing) {
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
          refreshToken,
        });

        accessToken = data.accessToken;
        if (typeof accessToken === 'string') {
          localStorage.setItem('accessToken', accessToken);
        }
        if (typeof data.refreshToken === 'string') {
          localStorage.setItem('refreshToken', data.refreshToken);
        }

        req.headers.Authorization = `${accessToken}`;
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        throw err; // o redirige al login
      } finally {
        isRefreshing = false;
      }
    } else if (!isExpired) {
      req.headers.Authorization = `${accessToken}`;
    }
  }

  return req;
});


export default api;
