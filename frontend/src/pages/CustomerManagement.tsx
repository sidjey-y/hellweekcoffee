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
  Box,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { customerAPI } from '../services/api';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  membershipId?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  transactions?: Array<{
    id: number;
    date: string;
    total: number;
  }>;
}

const CustomerManagement = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      console.log('Fetching customers...');
      const data = await customerAPI.getCustomers();
      console.log('Raw customer data:', data);
      
      // Transform and validate the data
      const validCustomers = data.filter((customer: any) => customer && customer.id);
      console.log('Filtered customers:', validCustomers);
      
      setCustomers(validCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      enqueueSnackbar('Failed to fetch customers', { variant: 'error' });
    }
  };

  const handleViewTransactions = async (customer: Customer) => {
    try {
      const transactions = await customerAPI.getCustomerTransactions(customer.id);
      setSelectedCustomer({ ...customer, transactions });
      setTransactionDialogOpen(true);
    } catch (error) {
      console.error('Error fetching customer transactions:', error);
      enqueueSnackbar('Failed to fetch customer transactions', { variant: 'error' });
    }
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;

    try {
      await customerAPI.deleteCustomer(customerToDelete.id);
      enqueueSnackbar('Customer deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
      // Refresh the customer list
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      enqueueSnackbar('Failed to delete customer', { variant: 'error' });
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#4d351d' }} elevation={1}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img src="/assets/logo2.png" alt="Hell Week Coffee Logo" style={{ height: 50 }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              Hell Week Coffee
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
  
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: '#EEDCC6',
        pt: 4,
        pb: 4
      }}>
        <Container maxWidth="xl">
          {/* Header Section */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 4,
            backgroundColor: 'white',
            p: 2,
            borderRadius: 1,
            boxShadow: 1
          }}>
            <IconButton 
              edge="start" 
              onClick={() => navigate('/pos')}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4d351d' }}>
                Customer Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View and manage your customer database
              </Typography>
            </Box>
          </Box>

          {/* Table Section */}
          <Paper 
            elevation={3}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              backgroundColor: 'white'
            }}
          >
            <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)', overflow: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      sx={{ 
                        fontWeight: 'bold', 
                        backgroundColor: '#4d351d', 
                        color: 'white',
                        fontSize: '0.95rem'
                      }}
                    >
                      Customer ID
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 'bold', 
                        backgroundColor: '#4d351d', 
                        color: 'white',
                        fontSize: '0.95rem'
                      }}
                    >
                      Name
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 'bold', 
                        backgroundColor: '#4d351d', 
                        color: 'white',
                        fontSize: '0.95rem'
                      }}
                    >
                      Customer Type
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 'bold', 
                        backgroundColor: '#4d351d', 
                        color: 'white',
                        fontSize: '0.95rem'
                      }}
                    >
                      Membership ID
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 'bold', 
                        backgroundColor: '#4d351d', 
                        color: 'white',
                        fontSize: '0.95rem'
                      }}
                    >
                      Email
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 'bold', 
                        backgroundColor: '#4d351d', 
                        color: 'white',
                        fontSize: '0.95rem'
                      }}
                    >
                      Phone
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 'bold', 
                        backgroundColor: '#4d351d', 
                        color: 'white',
                        fontSize: '0.95rem'
                      }}
                    >
                      Birth Date
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 'bold', 
                        backgroundColor: '#4d351d', 
                        color: 'white',
                        fontSize: '0.95rem'
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow 
                      key={customer.id}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: '#f5f5f5',
                          transition: 'background-color 0.2s'
                        }
                      }}
                    >
                      <TableCell sx={{ fontSize: '0.9rem' }}>#{customer.id}</TableCell>
                      <TableCell sx={{ fontSize: '0.9rem' }}>{`${customer.firstName} ${customer.lastName}`}</TableCell>
                      <TableCell>
                        <Chip
                          label={customer.membershipId ? 'MEMBER' : 'GUEST'}
                          color={customer.membershipId ? 'primary' : 'default'}
                          size="small"
                          sx={{ 
                            backgroundColor: customer.membershipId ? '#4d351d' : '#e0e0e0',
                            color: customer.membershipId ? 'white' : 'text.primary',
                            fontWeight: 'medium'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.9rem' }}>{customer.membershipId || '-'}</TableCell>
                      <TableCell sx={{ fontSize: '0.9rem' }}>{customer.email || '-'}</TableCell>
                      <TableCell sx={{ fontSize: '0.9rem' }}>{customer.phone || '-'}</TableCell>
                      <TableCell sx={{ fontSize: '0.9rem' }}>
                        {customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleDeleteClick(customer)}
                          color="error"
                          size="small"
                          title="Delete Customer"
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: '#ffebee'
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {customers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                        <Typography variant="body1" color="text.secondary">
                          No customers found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            PaperProps={{
              sx: {
                borderRadius: 2,
                width: '100%',
                maxWidth: '400px'
              }
            }}
          >
            <DialogTitle 
              sx={{ 
                backgroundColor: '#ffebee',
                color: '#d32f2f',
                fontWeight: 'bold'
              }}
            >
              Confirm Delete
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Typography>
                Are you sure you want to delete customer{' '}
                <strong>{customerToDelete ? `${customerToDelete.firstName} ${customerToDelete.lastName}` : ''}</strong>?
                This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
              <Button 
                onClick={() => setDeleteDialogOpen(false)}
                sx={{ color: 'text.secondary' }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteConfirm} 
                variant="contained" 
                color="error"
                sx={{ 
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#d32f2f'
                  }
                }}
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </>
  );
}
export default CustomerManagement; 