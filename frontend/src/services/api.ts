import { axiosInstance, authInstance } from '../utils/axios';
import { Item, ItemType, ItemRequest, CategoryType } from '../types/item';
import type { Category as CategoryInterface } from '../types/category';
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

export interface Category extends CategoryInterface {}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  membershipId: string | null;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  member: boolean;
  active: boolean;
  createdAt: string;
}

export interface Customization {
  id: number;
  code: string;
  name: string;
  categoryType: CategoryType;
  options: Array<{
    id: number;
    name: string;
    price: number;
  }>;
  active: boolean;
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
      const response = await axiosInstance.get('/customizations');
      return response.data;
    } catch (error) {
      console.error('Error fetching customizations:', error);
      throw error;
    }
  },

  getCustomizationsByCategory: async (categoryType: string) => {
    try {
      const response = await axiosInstance.get(`/customizations/by-category/${categoryType}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customizations by category:', error);
      throw error;
    }
  },

  createCustomization: async (customization: {
    name: string;
    categoryType: string;
    options: Array<{
      name: string;
      price: number;
    }>;
  }) => {
    try {
      const response = await axiosInstance.post('/customizations', customization);
      return response.data;
    } catch (error) {
      console.error('Error creating customization:', error);
      throw error;
    }
  },

  updateCustomization: async (id: number, customization: any) => {
    try {
      const response = await axiosInstance.put(`/customizations/${id}`, customization);
      return response.data;
    } catch (error) {
      console.error('Error updating customization:', error);
      throw error;
    }
  }
};

// Helper function to generate a membership ID
const generateMembershipId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const customerAPI = {
  getCustomers: async () => {
    try {
      console.log('Making request to /customers');
      const response = await axiosInstance.get('/customers');
      console.log('Response from /customers:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching customers:', {
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
      if (error.response?.status === 404) {
        throw new Error('Customer service not found');
      }
      throw error;
    }
  },

  getCustomerByMemberId: async (memberId: string) => {
    try {
      const response = await axiosInstance.get(`/customers/membership/${memberId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching customer by membership ID:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  createCustomer: async (customer: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  }) => {
    try {
      const response = await axiosInstance.post('/customers', customer);
      return response.data;
    } catch (error: any) {
      console.error('Error creating customer:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error(error.response?.data?.message || 'Failed to create customer');
    }
  },

  registerMember: async (member: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
  }) => {
    try {
      // Validate input data first
      if (!member.firstName?.trim()) {
        throw new Error('First name is required');
      }
      if (!member.lastName?.trim()) {
        throw new Error('Last name is required for members');
      }
      if (!member.dateOfBirth) {
        throw new Error('Date of birth is required for members');
      }
      if (!member.email?.trim() && !member.phone?.trim()) {
        throw new Error('Either email or phone number is required for members');
      }

      console.log('Attempting to register new member with data:', {
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email || null,
        phone: member.phone || null,
        dateOfBirth: member.dateOfBirth,
        member: true
      });
      
      // First, register the member
      const response = await axiosInstance.post('/customers/register', {
        firstName: member.firstName.trim(),
        lastName: member.lastName.trim(),
        email: member.email.trim() || null,
        phone: member.phone.trim() || null,
        dateOfBirth: member.dateOfBirth.split('/').reverse().join('-'),
        member: true,
        active: true
      });
      
      console.log('Server response for member registration:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });

      // If we get a response with data, consider it a success even if email fails
      if (response.data && response.data.id) {
        // If there's an email error, we'll handle it separately
        if (response.data.emailError) {
          console.warn('Member registered but email failed:', response.data.emailError);
        }
        return response.data;
      }

      throw new Error('Invalid response data');
    } catch (error: any) {
      // Log detailed error information
      console.error('Error in member registration:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        error: error.response?.data?.error,
        trace: error.response?.data?.trace,
        config: error.config ? {
          url: error.config.url,
          method: error.config.method,
          baseURL: error.config.baseURL,
          data: JSON.stringify(error.config.data, null, 2),
          headers: error.config.headers
        } : 'No config available'
      });

      // Special handling for email service errors
      if (error.response?.status === 500 && 
          error.response?.data?.error?.includes('MailAuthenticationException')) {
        // If it's just an email error, we can still consider the registration successful
        if (error.response.data.customer) {
          console.warn('Member registered but email failed');
          return error.response.data.customer;
        }
      }

      // Throw specific error messages based on the error type
      if (error.response) {
        switch (error.response.status) {
          case 400:
            throw new Error('Invalid member data: ' + (error.response.data?.message || 'Please check your input'));
          case 409:
            throw new Error('Member already exists: ' + (error.response.data?.message || 'Please try with different details'));
          case 500:
            console.error('Server error details:', {
              error: error.response.data?.error,
              message: error.response.data?.message,
              trace: error.response.data?.trace
            });
            // Check if it's an email error
            if (error.response.data?.error?.includes('MailAuthenticationException')) {
              throw new Error('Member registered but welcome email could not be sent. Your membership ID will be shown here.');
            } else {
              throw new Error('Server error: ' + (error.response.data?.message || 'An internal server error occurred. Please check the server logs.'));
            }
          default:
            throw new Error(error.response.data?.message || 'Failed to register member: ' + error.message);
        }
      }

      // For network errors or other issues
      throw new Error('Failed to register member: ' + error.message);
    }
  },

  updateCustomer: async (id: number, customer: Partial<Customer>) => {
    try {
      const response = await axiosInstance.put(`/customers/${id}`, customer);
      return response.data;
    } catch (error: any) {
      console.error('Error updating customer:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error(error.response?.data?.message || 'Failed to update customer');
    }
  },

  getCustomerTransactions: async (customerId: number) => {
    try {
      const response = await axiosInstance.get(`/customers/${customerId}/transactions`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching customer transactions:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      if (error.response?.status === 404) {
        return [];
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch customer transactions');
    }
  },
};

export const transactionAPI = {
  getAllTransactions: async () => {
    try {
      console.log('Fetching all transactions...');
      const response = await axiosInstance.get('/transactions');
      console.log('Transactions response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching transactions:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          baseURL: error.config?.baseURL
        }
      });
      throw error;
    }
  },

  getTransactionById: async (id: number) => {
    try {
      console.log('Fetching transaction:', id);
      const response = await axiosInstance.get(`/transactions/${id}`);
      console.log('Transaction response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching transaction:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  createTransaction: async (transaction: {
    customerId: number;
    items: Array<{
      itemId: string;
      quantity: number;
      size?: string;
      customizations?: Array<{
        customizationId: number;
        optionId: number;
      }>;
    }>;
  }) => {
    try {
      console.log('Creating transaction:', JSON.stringify(transaction, null, 2));
      const response = await axiosInstance.post('/transactions', transaction);
      console.log('Create transaction response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating transaction:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        request: transaction
      });
      throw error;
    }
  }
};

export default axiosInstance;
