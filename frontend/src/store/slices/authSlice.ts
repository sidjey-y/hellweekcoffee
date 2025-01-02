import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';
import { setAuthToken, clearAuthToken, getAuthToken } from '../../utils/auth';

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: getAuthToken(),
  loading: false,
  error: null,
  isAuthenticated: !!getAuthToken(),
};

interface LoginResponse {
  user: User;
  token: string;
}

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('Login attempt for:', username);
      const response = await authAPI.login(username, password);
      console.log('Login response:', {
        token: response.token ? `${response.token.substring(0, 20)}...` : 'No token',
        user: response.user
      });
      
      // Validate response
      if (!response.token || !response.user || !response.user.role) {
        console.error('Invalid response structure:', response);
        return rejectWithValue('Invalid response from server');
      }

      // Store token immediately
      const token = response.token.trim();
      setAuthToken(token);
      console.log('Token stored:', {
        token: token.substring(0, 20) + '...',
        length: token.length,
        stored: !!getAuthToken()
      });
      
      // Normalize role to uppercase and ensure it's a valid role
      const role = response.user.role.toUpperCase();
      if (!['ADMIN', 'MANAGER', 'CASHIER'].includes(role)) {
        clearAuthToken();
        return rejectWithValue(`Invalid role: ${role}`);
      }

      const user = {
        ...response.user,
        role: role
      };

      console.log('Normalized user data:', user);
      
      return { user, token };
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      clearAuthToken();
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to login'
      );
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (request: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    email?: string;
    phone?: string;
  }) => {
    try {
      const response = await authAPI.register(request);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to register');
    }
  }
);

export const validateToken = createAsyncThunk(
  'auth/validateToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      console.log('Validating token:', {
        exists: !!token,
        length: token?.length,
        value: token ? `${token.substring(0, 20)}...` : 'none'
      });
      
      if (!token) {
        console.warn('No token found');
        clearAuthToken();
        return rejectWithValue('No token found');
      }

      console.log('Making validate request...');
      const response = await authAPI.validateToken(token.trim());
      console.log('Validate response:', response);

      if (!response.user || !response.user.role) {
        console.error('Invalid user data in response:', response);
        clearAuthToken();
        return rejectWithValue('Invalid user data');
      }

      // Normalize role to uppercase and validate it
      const role = response.user.role.toUpperCase();
      if (!['ADMIN', 'MANAGER', 'CASHIER'].includes(role)) {
        console.error('Invalid role:', role);
        clearAuthToken();
        return rejectWithValue('Invalid user role');
      }

      const user = {
        ...response.user,
        role
      };

      console.log('Validation successful:', {
        user,
        tokenLength: token.length,
        tokenStored: !!getAuthToken()
      });
      
      return { user, token };
    } catch (error: any) {
      console.error('Token validation error:', error);
      console.error('Error response:', error.response?.data);
      clearAuthToken();
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Token validation failed'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      clearAuthToken();
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isAuthenticated = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message || 'Failed to login';
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        clearAuthToken();
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to register';
      })
      // Validate Token
      .addCase(validateToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateToken.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(validateToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Invalid token';
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        clearAuthToken();
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
