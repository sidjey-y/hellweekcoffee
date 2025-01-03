import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { customerAPI } from '../services/api';
import { useSnackbar } from 'notistack';

interface Customer {
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

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customerAPI.getCustomers();
      // Transform the data to match the interface
      const transformedData = response.map((customer: any) => ({
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName || '',
        membershipId: customer.membershipId,
        email: customer.email,
        phone: customer.phone,
        dateOfBirth: customer.dateOfBirth,
        member: !!customer.membershipId, // If has membershipId, then is a member
        active: customer.active,
        createdAt: customer.createdAt,
      }));
      setCustomers(transformedData);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to fetch customers. Please try again later.');
      enqueueSnackbar('Failed to fetch customers', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Customer Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all customers
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Membership ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Date of Birth</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Joined Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow 
                key={customer.id}
                sx={{ 
                  opacity: customer.active ? 1 : 0.5 
                }}
              >
                <TableCell>
                  {customer.firstName} {customer.lastName}
                </TableCell>
                <TableCell>
                  {customer.membershipId || '-'}
                </TableCell>
                <TableCell>{customer.email || '-'}</TableCell>
                <TableCell>{customer.phone || '-'}</TableCell>
                <TableCell>{formatDate(customer.dateOfBirth)}</TableCell>
                <TableCell>
                  <Chip
                    label={customer.member ? 'Member' : 'Guest'}
                    color={customer.member ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(customer.createdAt)}</TableCell>
                <TableCell>
                  <Chip
                    label={customer.active ? 'Active' : 'Inactive'}
                    color={customer.active ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && !error && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body1" color="text.secondary">
                    No customers found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Customers;
