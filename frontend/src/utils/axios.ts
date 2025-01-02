import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getAuthToken } from './auth';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

let handleAuthError: () => void = () => {};

export const setAuthErrorHandler = (handler: () => void) => {
  handleAuthError = handler;
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    console.log('Token for request:', {
      exists: !!token,
      length: token?.length,
      value: token ? `${token.substring(0, 20)}...` : 'none'
    });

    if (token) {
      // Remove any existing Authorization header
      delete config.headers.Authorization;
      // Add the token with proper formatting
      const authHeader = `Bearer ${token.trim()}`;
      config.headers.Authorization = authHeader;
      
      console.log('Request details:', {
        url: config.url,
        method: config.method,
        authHeader: authHeader.substring(0, 40) + '...',
        allHeaders: config.headers
      });
    } else {
      console.warn('No token found for request to:', config.url);
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('Response details:', {
      url: response.config.url,
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error: AxiosError) => {
    console.error('Response error details:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      requestHeaders: {
        ...error.config?.headers,
        Authorization: typeof error.config?.headers?.Authorization === 'string'
          ? `${error.config.headers.Authorization.substring(0, 40)}...`
          : 'none'
      }
    });

    // Only handle auth errors for non-auth endpoints
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !error.config?.url?.includes('/auth/')
    ) {
      console.log('Auth error detected, handling...');
      handleAuthError();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
