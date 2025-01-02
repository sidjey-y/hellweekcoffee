import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  CircularProgress,
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
      const from = location.state?.from?.pathname;
      if (from && from !== '/login') {
        navigate(from);
      } else {
        if (user.role === 'ADMIN') navigate('/admin/dashboard');
        else if (user.role === 'CASHIER') navigate('/pos');
        else if (user.role === 'MANAGER') navigate('/manager/dashboard');
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
      await dispatch(login({ username, password })).unwrap();
    } catch (err: any) {}
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
      }}
    >
      {/* Left Side with Image */}
      <Box
        sx={{
          flex: 1,
          backgroundImage: 'url(https://images.unsplash.com/photo-1605187151664-9d89904d62d0?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGFlc3RoZXRpYyUyMGNvZmZlZXxlbnwwfHwwfHx8MA%3D%3D)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Right Side with Login Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 4,
          backgroundColor: '#EEDCC6',
          flexDirection: 'column',
        }}
      >
        <Typography
          component="h1"
          variant="h4"
          sx={{
            mb: 4, 
            fontWeight: 'bold',
            color: '#230C02'
          }}
        >
          Hell Week Coffee
        </Typography>
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            width: '100%',
            maxWidth: 400,
            textAlign: 'center',
          }}
        >

          <Typography
            component="h2"
            variant="h5"
            sx={{
              mb: 3,
            }}
          >
            Sign in
          </Typography>

          {showError && error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
            sx={{
              mt: 3,
              mb: 2,
              backgroundColor: username && password ? '#230C02' : 'grey',
              color: 'white',
              '&:hover': {
                backgroundColor: username && password ? '#430E04' : 'grey',
              },
            }}
            disabled={loading || !username || !password}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>

          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
