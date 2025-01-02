import { axiosInstance, authInstance } from '../utils/axios';
import { Item, ItemType, ItemRequest } from '../types/item';
import { AxiosError } from 'axios';

// Create a function to handle logout that can be set from outside
let logoutHandler: () => void = () => {};

export const setLogoutHandler = (handler: () => void) => {
  logoutHandler = handler;
};

export const authAPI = {
  login: async (username: string, password: string) => {
    try {
      console.log('Making login request for user:', username);
      console.log('Request details:', {
        url: '/auth/login',
        method: 'POST',
        baseURL: authInstance.defaults.baseURL,
        headers: {
          'Content-Type': 'application/json'
        },
        data: { username, password: '********' }
      });

      const response = await authInstance.post('/auth/login', { username, password });
      
      // Store token immediately if present
      if (response.data.token) {
        const token = response.data.token.trim();
        localStorage.setItem('token', token);
        // Set the token for future requests
        authInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('Login response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: {
          ...response.data,
          token: response.data.token ? `${response.data.token.substring(0, 20)}...` : 'none'
        }
      });
      return response.data;
    } catch (error: any) {
      // Check if it's a network error
      if (!error.response) {
        console.error('Network error:', error.message);
        throw new Error('Could not connect to server. Please check your connection.');
      }

      // Handle other errors
      console.error('Login error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.response?.data?.message || error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers
      });
      
      // Throw appropriate error message
      if (error.response?.status === 401) {
        throw new Error('Invalid username or password');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Please check your credentials.');
      } else if (error.response?.status === 404) {
        throw new Error('Login service not found');
      } else {
        throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
      }
    }
  },

  validateToken: async (token: string) => {
    try {
      if (!token) {
        throw new Error('No token provided');
      }

      console.log('Making validate request with token:', token.substring(0, 20) + '...');
      
      // Set the token in localStorage and headers
      const trimmedToken = token.trim();
      localStorage.setItem('token', trimmedToken);
      authInstance.defaults.headers.common['Authorization'] = `Bearer ${trimmedToken}`;
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${trimmedToken}`;
      
      const response = await authInstance.get('/auth/validate');
      console.log('Token validation response:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });
      return response.data;
    } catch (error: any) {
      // Check if it's a network error
      if (!error.response) {
        console.error('Network error:', error.message);
        localStorage.removeItem('token');
        delete authInstance.defaults.headers.common['Authorization'];
        delete axiosInstance.defaults.headers.common['Authorization'];
        throw new Error('Could not connect to server. Please check your connection.');
      }

      console.error('Token validation error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        headers: error.config?.headers
      });

      // Clear token on validation failure
      localStorage.removeItem('token');
      delete authInstance.defaults.headers.common['Authorization'];
      delete axiosInstance.defaults.headers.common['Authorization'];

      // Throw appropriate error message
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Please log in again.');
      } else {
        throw new Error(error.response?.data?.message || 'Token validation failed');
      }
    }
  },

  register: async (request: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    email?: string;
    phone?: string;
  }) => {
    const response = await authInstance.post('/auth/register', request);
    return response.data;
  },

  getCurrentUser: async () => {
    try {
      console.log('Fetching current user...');
      const response = await authInstance.get('/auth/me');
      console.log('Current user response:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });
      return response.data;
    } catch (error: any) {
      console.error('Get current user error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
};

export const userAPI = {
  getUsers: async () => {
    try {
      const response = await authInstance.get('/auth/users');
      return response.data.filter((user: any) => user.active);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error fetching users:', error.message);
      }
      throw error;
    }
  },

  createUser: async (user: any) => {
    try {
      const response = await authInstance.post('/auth/register', user);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error creating user:', error.message);
      }
      throw error;
    }
  },

  updateUser: async (id: string, user: any) => {
    try {
      const response = await authInstance.put(`/auth/users/${id}`, user);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error updating user:', error.message);
      }
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    try {
      const response = await authInstance.delete(`/auth/users/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error deleting user:', error.message);
      }
      throw error;
    }
  },
};

export interface Category {
  id: string;
  name: string;
  type: ItemType;
  active: boolean;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  membershipId?: string;  // 5 character alphanumeric
  email?: string;
  phone?: string;
  birthDate: Date;
}

export interface Customization {
  id: number;
  name: string;
  type: ItemType;
  options: Array<{
    name: string;
    price: number;
  }>;
  maxOptions: number;
}

export const itemsAPI = {
  getItems: async () => {
    try {
      const response = await axiosInstance.get('/items');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error fetching items:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            baseURL: error.config?.baseURL
          }
        });
      }
      throw error;
    }
  },

  createItem: async (data: ItemRequest) => {
    try {
      const response = await axiosInstance.post('/items', data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error creating item:', error.message);
      }
      throw error;
    }
  },

  updateItem: async (code: string, data: ItemRequest) => {
    try {
      const response = await axiosInstance.put(`/items/${code}`, data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error updating item:', error.message);
      }
      throw error;
    }
  },

  deleteItem: async (code: string) => {
    try {
      await axiosInstance.delete(`/items/${code}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error deleting item:', error.message);
      }
      throw error;
    }
  },

  getItemsByType: async (type: ItemType) => {
    try {
      const response = await axiosInstance.get(`/items/by-type/${type}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error fetching items by type:', error.message);
      }
      throw error;
    }
  },
};

export const categoriesAPI = {
  getCategories: async () => {
    try {
      const response = await axiosInstance.get('/categories');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error fetching categories:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            baseURL: error.config?.baseURL
          }
        });
      }
      throw error;
    }
  },

  createCategory: async (category: Omit<Category, 'id' | 'active'>) => {
    try {
      const response = await axiosInstance.post('/categories', category);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error creating category:', error.message);
      }
      throw error;
    }
  },

  updateCategory: async (id: string, category: Partial<Category>) => {
    try {
      const response = await axiosInstance.put(`/categories/${id}`, category);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error updating category:', error.message);
      }
      throw error;
    }
  },

  deleteCategory: async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error deleting category:', error.message);
      }
      throw error;
    }
  },
};

export const customizationAPI = {
  getCustomizations: async () => {
    try {
      console.log('Making request to /customizations');
      const response = await axiosInstance.get('/customizations');
      console.log('Response from /customizations:', response.data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error fetching customizations:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            baseURL: error.config?.baseURL
          }
        });
      }
      throw error;
    }
  },

  createCustomization: async (customization: Omit<Customization, 'id'>) => {
    try {
      const response = await axiosInstance.post('/customizations', customization);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error creating customization:', error.message);
      }
      throw error;
    }
  },

  updateCustomization: async (id: number, customization: Partial<Customization>) => {
    try {
      const response = await axiosInstance.put(`/customizations/${id}`, customization);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error updating customization:', error.message);
      }
      throw error;
    }
  },

  deleteCustomization: async (id: number) => {
    try {
      const response = await axiosInstance.delete(`/customizations/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error deleting customization:', error.message);
      }
      throw error;
    }
  },
};

export default axiosInstance;
