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

  return (
    <>
      <AppBar position="static" color="default" sx={{ backgroundColor: '#4d351d' }} elevation={1}>
        <Toolbar>
          <img src="/assets/logo2.png" alt="Hell Week Coffee Logo" style={{ height: 50, marginRight: 10 }} />
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            Hell Week Coffee
          </Typography>
        </Toolbar>
      </AppBar>
  
      <Container maxWidth="xl" sx={{ paddingTop: 4, paddingBottom: 4, mt: 0, mb: 0, backgroundColor:'#EEDCC6'}}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/pos')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
            Customer Management
          </Typography>
        </Box>
  
        <Paper sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{backgroundColor: '#4d351d'}}>
                  <TableCell sx={{ fontWeight: 'bold' , color: 'white'}}>Customer ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' , color: 'white'}}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' , color: 'white'}}>Customer Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' , color: 'white'}}>Membership ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' , color: 'white'}}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' , color: 'white'}}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' , color: 'white'}}>Birth Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>#{customer.id}</TableCell>
                    <TableCell>{`${customer.firstName} ${customer.lastName}`}</TableCell>
                    <TableCell>
                      <Chip
                        label={customer.membershipId ? 'MEMBER' : 'GUEST'}
                        color={customer.membershipId ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{customer.membershipId || '-'}</TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell>{customer.phone || '-'}</TableCell>
                    <TableCell>{customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString() : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
  
        {/* Transaction History Dialog */}
        <Dialog
          open={transactionDialogOpen}
          onClose={() => setTransactionDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Transaction History - {selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : ''}
          </DialogTitle>
          <DialogContent>
            {selectedCustomer?.transactions && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Transaction ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Total Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedCustomer.transactions.map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell>#{transaction.id}</TableCell>
                        <TableCell>{new Date(transaction.date).toLocaleString()}</TableCell>
                        <TableCell>₱{transaction.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTransactionDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
export default CustomerManagement; 