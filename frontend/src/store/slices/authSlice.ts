import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';
import { setAuthToken, clearAuthToken, getAuthToken } from '../../utils/auth';
import { setLogoutHandler } from '../../services/api';

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

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
      clearAuthToken();
      
      // Return user-friendly error message
      return rejectWithValue(
        error.message || 
        error.response?.data?.message || 
        'Failed to login'
      );
    }
  }
);

export const validateToken = createAsyncThunk(
  'auth/validateToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        clearAuthToken();
        return rejectWithValue('No token found');
      }

      const response = await authAPI.validateToken(token.trim());

      if (!response.user || !response.user.role) {
        clearAuthToken();
        return rejectWithValue('Invalid user data');
      }

      // Normalize role to uppercase and validate it
      const role = response.user.role.toUpperCase();
      if (!['ADMIN', 'MANAGER', 'CASHIER'].includes(role)) {
        clearAuthToken();
        return rejectWithValue(`Invalid role: ${role}`);
      }

      const user = {
        ...response.user,
        role
      };
      
      return { user, token };
    } catch (error: any) {
      clearAuthToken();
      return rejectWithValue(
        error.message || 
        error.response?.data?.message || 
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
      state.error = null;
      clearAuthToken();
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearError: (state) => {
      state.error = null;
    }
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
        state.error = action.payload as string || action.error.message || 'Invalid token';
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        clearAuthToken();
      });
  },
});

export const { logout, setUser, clearError } = authSlice.actions;

// Set up the logout handler
setLogoutHandler(() => {
  authSlice.caseReducers.logout(initialState);
});

export default authSlice.reducer;
