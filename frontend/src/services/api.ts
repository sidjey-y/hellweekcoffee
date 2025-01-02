import { axiosInstance } from '../utils/axios';
import { Item, ItemType } from '../types/item';
import { AxiosError } from 'axios';

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token.trim()) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // store.dispatch(logout());
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (username: string, password: string) => {
    try {
      console.log('Making login request for user:', username);
      const response = await axiosInstance.post('/api/auth/login', { username, password });
      console.log('Login response:', {
        status: response.status,
        headers: response.headers,
        data: {
          ...response.data,
          token: response.data.token ? `${response.data.token.substring(0, 20)}...` : 'none'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Login error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  validateToken: async (token: string) => {
    try {
      console.log('Making validate request with token:', token.substring(0, 20) + '...');
      const response = await axiosInstance.get('/api/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Token validation response:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });
      return response.data;
    } catch (error: any) {
      console.error('Token validation error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
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
    const response = await axiosInstance.post('/api/auth/register', request);
    return response.data;
  },

  getCurrentUser: async () => {
    try {
      console.log('Fetching current user...');
      const response = await axiosInstance.get('/api/auth/me');
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
      const response = await axiosInstance.get('/api/auth/users');
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
      const response = await axiosInstance.post('/api/auth/register', user);
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
      const response = await axiosInstance.put(`/api/auth/users/${id}`, user);
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
      const response = await axiosInstance.delete(`/api/auth/users/${id}`);
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
  isActive: boolean;
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
  maxOptions: 5;
}

export const itemsAPI = {
  getItems: async () => {
    try {
      const response = await axiosInstance.get('/api/items');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error fetching items:', error.message);
      }
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const response = await axiosInstance.get('/api/categories');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error fetching categories:', error.message);
      }
      throw error;
    }
  },

  createCategory: async (category: { name: string; type: string }) => {
    try {
      const response = await axiosInstance.post('/api/categories', category);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error creating category:', error.message);
      }
      throw error;
    }
  },

  createItem: async (item: Omit<Item, 'code'>) => {
    try {
      const response = await axiosInstance.post('/api/items', item);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error creating item:', error.message);
      }
      throw error;
    }
  },

  updateItem: async (code: string, item: Omit<Item, 'code'>) => {
    try {
      const response = await axiosInstance.put(`/api/items/${code}`, item);
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
      const response = await axiosInstance.delete(`/api/items/${code}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error deleting item:', error.message);
      }
      throw error;
    }
  }
};

export const categoriesAPI = {
  getCategories: async () => {
    try {
      const response = await axiosInstance.get('/api/categories');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error fetching categories:', error.message);
      }
      throw error;
    }
  },

  createCategory: async (category: Omit<Category, 'id' | 'isActive'>) => {
    try {
      const response = await axiosInstance.post('/api/categories', category);
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
      const response = await axiosInstance.put(`/api/categories/${id}`, category);
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
      const response = await axiosInstance.delete(`/api/categories/${id}`);
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
      const response = await axiosInstance.get('/api/customizations');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error fetching customizations:', error.message);
      }
      throw error;
    }
  },

  createCustomization: async (customization: Omit<Customization, 'id'>) => {
    try {
      const response = await axiosInstance.post('/api/customizations', customization);
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
      const response = await axiosInstance.put(`/api/customizations/${id}`, customization);
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
      const response = await axiosInstance.delete(`/api/customizations/${id}`);
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
