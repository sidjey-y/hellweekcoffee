import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { AppDispatch } from '../store';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate form data
    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    console.log('Attempting login with credentials:', { 
      username: formData.username,
      passwordLength: formData.password.length 
    });

    try {
      console.log('Dispatching login action...');
      const result = await dispatch(login({ 
        username: formData.username.trim(), 
        password: formData.password 
      })).unwrap();
      
      console.log('Raw login result:', result);
      console.log('Login result structure:', {
        hasToken: !!result?.token,
        hasUser: !!result?.user,
        userRole: result?.user?.role,
        userFields: result?.user ? Object.keys(result.user) : []
      });

      // Validate response data
      if (!result) {
        throw new Error('No response data received');
      }
      
      if (!result.token) {
        throw new Error('No token received');
      }
      
      if (!result.user) {
        throw new Error('No user data received');
      }
      
      if (!result.user.role) {
        throw new Error('No user role specified');
      }

      // Store token
      localStorage.setItem('token', result.token);
      
      // Get the role and ensure it's uppercase
      const role = result.user.role.toUpperCase();
      console.log('User role:', role);

      // Redirect based on role
      console.log('Redirecting user with role:', role);
      switch (role) {
        case 'ADMIN':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'MANAGER':
          navigate('/manager/dashboard', { replace: true });
          break;
        case 'CASHIER':
          navigate('/pos', { replace: true });
          break;
        default:
          throw new Error(`Unsupported role: ${role}`);
      }
    } catch (err: any) {
      console.error('Login error details:', {
        error: err,
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Clear any existing token
      localStorage.removeItem('token');
      
      // Set appropriate error message
      if (err.response?.data?.message) {
        // Use the specific error message from the backend
        setError(err.response.data.message);
      } else if (err.message === 'No response data received' || 
                err.message === 'No token received' || 
                err.message === 'No user data received') {
        setError('Server response was incomplete. Please try again.');
      } else if (err.message === 'No user role specified') {
        setError('User role not specified. Please contact support.');
      } else if (!err.response) {
        setError('Could not connect to server. Please check your connection.');
      } else {
        setError('Failed to login. Please try again.');
      }
    } finally {
      setLoading(false);
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
          <Typography component="h1" variant="h5" gutterBottom>
            HellWeek Coffee
          </Typography>
          <Typography component="h2" variant="h6" gutterBottom>
            Sign In
          </Typography>

          {error && (
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
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
