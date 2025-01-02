import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  CircularProgress
} from '@mui/material';
import PasswordInput from '../components/PasswordInput';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { error, loading, isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Clear any existing errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User role:', user.role);
      // Get the intended destination from location state, or use default based on role
      const from = location.state?.from?.pathname;
      if (from && from !== '/login') {
        navigate(from);
      } else {
        // Redirect based on role
        if (user.role === 'ADMIN') {
          console.log('Redirecting user with role:', user.role);
          navigate('/admin/dashboard');
        } else if (user.role === 'CASHIER') {
          navigate('/pos');
        } else if (user.role === 'MANAGER') {
          navigate('/manager/dashboard');
        }
      }
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(false);
    
    if (!username || !password) {
      setShowError(true);
      dispatch({ type: 'auth/setError', payload: 'Please enter both username and password' });
      return;
    }

    try {
      console.log('Attempting login with credentials:', {
        username,
        passwordLength: password.length
      });

      console.log('Dispatching login action...');
      const result = await dispatch(login({ username, password })).unwrap();
      
      console.log('Raw login result:', result);
      console.log('Login result structure:', {
        hasToken: !!result.token,
        hasUser: !!result.user,
        userRole: result.user?.role,
        userFields: result.user ? Object.keys(result.user) : []
      });
    } catch (err: any) {
      console.error('Login failed:', err);
      // Error is handled by the reducer
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Sign in to HellWeek Coffee
          </Typography>
          
          {showError && error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              error={showError && !username}
              helperText={showError && !username ? 'Username is required' : ''}
            />
            <PasswordInput
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              error={showError && !password}
              helperText={showError && !password ? 'Password is required' : ''}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || !username || !password}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
