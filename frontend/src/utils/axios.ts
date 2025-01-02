import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig, AxiosInstance } from 'axios';
import { getAuthToken } from './auth';

// Define the error response type
interface ErrorResponse {
  message: string;
  status?: number;
  error?: string;
}

// Create two axios instances - one for auth and one for API
export const authInstance = axios.create({
  baseURL: process.env.REACT_APP_AUTH_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true // This is important for CORS with credentials
});

export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  validateStatus: (status) => status >= 200 && status < 300 // Only treat 2xx as success
});

let handleAuthError: () => void = () => {};

export const setAuthErrorHandler = (handler: () => void) => {
  handleAuthError = handler;
};

// Configure interceptors for both instances
const configureInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAuthToken();
      
      if (token) {
        // Add the token with proper formatting
        const authHeader = `Bearer ${token.trim()}`;
        config.headers = config.headers || {};
        config.headers.Authorization = authHeader;

        // Log token for debugging (except sensitive endpoints)
        if (config.url && !config.url.includes('/auth/login') && !config.url.includes('/auth/register')) {
          console.log('Token being sent:', token.substring(0, 20) + '...');
          console.log('Full request URL:', `${config.baseURL || ''}${config.url}`);
          console.log('Authorization header:', authHeader);
          console.log('All headers:', config.headers);
        }
      } else if (config.url) {
        console.warn('No token available for request:', config.url);
      }

      return config;
    },
    (error: AxiosError) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Don't log sensitive data
      if (response.config.url && !response.config.url.includes('/auth/login') && !response.config.url.includes('/auth/register')) {
        console.log('Response:', {
          url: response.config.url,
          status: response.status,
          statusText: response.statusText,
          success: true,
          data: response.data,
          headers: response.headers
        });
      }
      return response;
    },
    (error: AxiosError<ErrorResponse>) => {
      // Don't log sensitive data
      if (error.config?.url && !error.config.url.includes('/auth/login') && !error.config.url.includes('/auth/register')) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error('Response error:', {
          url: error.config.url,
          fullUrl: `${error.config.baseURL || ''}${error.config.url}`,
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: errorMessage,
          data: error.response?.data,
          headers: error.config.headers
        });
      }

      // Handle auth errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleAuthError();
      }
      return Promise.reject(error);
    }
  );
};

// Configure interceptors for both instances
configureInterceptors(authInstance);
configureInterceptors(axiosInstance);

export default axiosInstance;
