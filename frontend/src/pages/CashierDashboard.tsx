import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Chip,
  IconButton,
} from '@mui/material';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const CashierDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.auth.user);

  // Sample data
  const pendingOrders = [
    {
      id: '1',
      time: '23:45',
      customerName: 'John Doe',
      items: ['Americano', 'Croissant'],
      total: 250,
      status: 'Pending',
    },
    {
      id: '2',
      time: '23:40',
      customerName: 'Jane Smith',
      items: ['Cappuccino', 'Chocolate Cake'],
      total: 320,
      status: 'In Progress',
    },
  ];

  const todayStats = {
    totalOrders: 45,
    completedOrders: 42,
    totalSales: 12500,
  };

  const handleOrderAction = (orderId: string, action: 'complete' | 'cancel') => {
    // Implement order status update logic here
    console.log(`Order ${orderId} ${action}ed`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Message */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom>
              Welcome, {user?.firstName || 'Cashier'}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage orders and process transactions efficiently.
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Access to POS */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PointOfSaleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5">Point of Sale</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Process new orders and transactions
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<LocalCafeIcon />}
                fullWidth
                onClick={() => navigate('/pos')}
                sx={{ mt: 2 }}
              >
                Open POS
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="h4" color="primary">
                    {todayStats.totalOrders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h4" color="success.main">
                    {todayStats.completedOrders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h4" color="primary">
                    ₱{todayStats.totalSales}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Sales
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Orders */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Orders
            </Typography>
            <List>
              {pendingOrders.map((order, index) => (
                <React.Fragment key={order.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    secondaryAction={
                      <Box>
                        <IconButton
                          color="success"
                          onClick={() => handleOrderAction(order.id, 'complete')}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleOrderAction(order.id, 'cancel')}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            Order #{order.id}
                          </Typography>
                          <Chip
                            label={order.status}
                            color={order.status === 'Pending' ? 'warning' : 'info'}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            Time: {order.time}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2">
                            Customer: {order.customerName}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2">
                            Items: {order.items.join(', ')}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2">
                            Total: ₱{order.total}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CashierDashboard;