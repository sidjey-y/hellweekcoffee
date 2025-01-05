import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Link,
  Alert,
} from '@mui/material';
import api from '../utils/axios';

interface MemberFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
}

const MemberRegistration = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<MemberFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate that either email or phone is provided
    if (!formData.email && !formData.phone) {
      setError('Either email or phone number must be provided');
      return;
    }

    try {
      // Format the date to YYYY-MM-DD
      const formattedDate = formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : null;

      const response = await api.post('/api/customers', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formattedDate,
        email: formData.email,
        phone: formData.phone,
        member: true // Changed from isMember to member to match backend
      });

      if (response.data) {
        // Registration successful
        navigate('/registration-success', { 
          state: { 
            membershipId: response.data.membershipId,
            firstName: formData.firstName
          }
        });
      }
    } catch (error: any) {
      console.error('Member registration failed:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // outside the 200-299 range, meaning something went wrong on the server
        const errorMessage = error.response.data.message || 
                           error.response.data.error ||
                           'Registration failed. Please check your input.';
        setError(errorMessage);
        console.log('Server error details:', error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        setError('Could not connect to the server. Please try again later.');
        console.log('Network error:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('An error occurred. Please try again.');
        console.log('Error details:', error);
      }
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
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Become a Member
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              margin="normal"
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              helperText="Either email or phone number is required"
            />

            <TextField
              margin="normal"
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              helperText="Either email or phone number is required"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Register as Member
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login">
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default MemberRegistration;
