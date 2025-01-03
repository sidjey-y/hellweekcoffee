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
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { transactionAPI } from '../services/api';

interface TransactionItem {
  name: string;
  quantity: number;
  size?: string;
  customizations: Array<{
    name: string;
    option: string;
    price: number;
  }>;
  price: number;
  totalPrice: number;
}

interface Transaction {
  id: number;
  date: string;
  customerType: 'GUEST' | 'MEMBER';
  customerName: string;
  membershipId?: string;
  items: TransactionItem[];
  total: number;
}

const TransactionHistory = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await transactionAPI.getAllTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      enqueueSnackbar('Failed to fetch transactions', { variant: 'error' });
    }
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailsDialogOpen(true);
  };

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/pos')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2 }}>
            Transaction History
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Customer Type</TableCell>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Membership ID</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>#{transaction.id}</TableCell>
                    <TableCell>{new Date(transaction.date).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.customerType}
                        color={transaction.customerType === 'MEMBER' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{transaction.customerName}</TableCell>
                    <TableCell>{transaction.membershipId || '-'}</TableCell>
                    <TableCell>₱{transaction.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetails(transaction)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Transaction Details Dialog */}
        <Dialog
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Transaction Details - #{selectedTransaction?.id}
          </DialogTitle>
          <DialogContent>
            {selectedTransaction && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" align="center" gutterBottom>
                  HellWeek Coffee
                </Typography>
                <Typography align="center" gutterBottom>
                  {new Date(selectedTransaction.date).toLocaleString()}
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography>
                    Customer Type: {selectedTransaction.customerType}
                  </Typography>
                  <Typography>
                    Customer Name: {selectedTransaction.customerName}
                  </Typography>
                  {selectedTransaction.membershipId && (
                    <Typography>
                      Membership ID: {selectedTransaction.membershipId}
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                <TableContainer component={Paper} sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedTransaction.items.map((item, index) => (
                        <React.Fragment key={index}>
                          <TableRow>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.size || '-'}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">₱{item.price.toFixed(2)}</TableCell>
                            <TableCell align="right">₱{item.totalPrice.toFixed(2)}</TableCell>
                          </TableRow>
                          {item.customizations.map((customization, custIndex) => (
                            <TableRow key={`${index}-${custIndex}`}>
                              <TableCell colSpan={4} sx={{ pl: 4 }}>
                                + {customization.name}: {customization.option}
                              </TableCell>
                              <TableCell align="right">
                                ₱{customization.price.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      ))}
                      <TableRow>
                        <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                          Total Amount:
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          ₱{selectedTransaction.total.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default TransactionHistory; 