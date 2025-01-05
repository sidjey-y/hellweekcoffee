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
} from '@mui/material';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import StarIcon from '@mui/icons-material/Star';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.auth.user);

  // Sample data
  const recentOrders = [
    {
      id: '1',
      date: '2024-12-30',
      items: ['Americano', 'Croissant'],
      total: 250,
      status: 'Completed',
    },
    {
      id: '2',
      date: '2024-12-29',
      items: ['Cappuccino', 'Chocolate Cake'],
      total: 320,
      status: 'Completed',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Message */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user?.firstName || 'Customer'}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View your orders, points, and rewards all in one place.
            </Typography>
          </Paper>
        </Grid>

        {/* Points and Membership Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StarIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5">Your Points</Typography>
              </Box>
              <Typography variant="h3" color="primary" gutterBottom>
                500
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Earn 1 point for every ₱50 spent
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => navigate('/rewards')}
              >
                View Rewards
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<LocalCafeIcon />}
                    onClick={() => navigate('/pos')}
                  >
                    Order Now
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ReceiptIcon />}
                    onClick={() => navigate('/membership')}
                  >
                    Upgrade to Premium
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            <List>
              {recentOrders.map((order, index) => (
                <React.Fragment key={order.id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1">
                            Order #{order.id}
                          </Typography>
                          <Chip
                            label={order.status}
                            color="success"
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            {order.date}
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
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button variant="text" color="primary">
                View All Orders
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CustomerDashboard;