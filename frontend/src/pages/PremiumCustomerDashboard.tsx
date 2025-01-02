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
  LinearProgress,
} from '@mui/material';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import StarIcon from '@mui/icons-material/Star';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import DiamondIcon from '@mui/icons-material/Diamond';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PremiumCustomerDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.auth.user);

  // Sample data - replace with actual data from your backend
  const recentOrders = [
    {
      id: '1',
      date: '2024-12-30',
      items: ['Americano', 'Croissant'],
      total: 250,
      points: 10,
      status: 'Completed',
    },
    {
      id: '2',
      date: '2024-12-29',
      items: ['Cappuccino', 'Chocolate Cake'],
      total: 320,
      points: 12,
      status: 'Completed',
    },
  ];

  const membershipDetails = {
    points: 1250,
    nextTier: 2000,
    membershipId: 'PREM123456',
    validUntil: '2024-12-31',
    discountRate: 10,
  };

  const exclusiveOffers = [
    {
      title: 'Double Points Weekend',
      description: 'Earn 2x points on all purchases this weekend',
      validUntil: '2024-12-31',
    },
    {
      title: 'Early Bird Special',
      description: 'Get 20% off on all drinks before 10 AM',
      validUntil: '2024-12-31',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Message */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <DiamondIcon color="primary" sx={{ fontSize: 40 }} />
              <div>
                <Typography variant="h4" gutterBottom>
                  Welcome back, {user?.firstName || 'Premium Member'}!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Enjoy your exclusive premium benefits and rewards.
                </Typography>
              </div>
            </Box>
            <Chip
              label={`Premium Member ID: ${membershipDetails.membershipId}`}
              color="primary"
              variant="outlined"
              sx={{ alignSelf: 'flex-start' }}
            />
          </Paper>
        </Grid>

        {/* Points and Progress */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StarIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5">Premium Points</Typography>
              </Box>
              <Typography variant="h3" color="primary" gutterBottom>
                {membershipDetails.points}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Earn 2 points for every ₱50 spent
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Progress to Next Tier
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(membershipDetails.points / membershipDetails.nextTier) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {membershipDetails.nextTier - membershipDetails.points} points to next tier
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => navigate('/rewards')}
              >
                View Premium Rewards
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Membership Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CardGiftcardIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5">Premium Benefits</Typography>
              </Box>
              <List>
                <ListItem>
                  <ListItemText
                    primary={`${membershipDetails.discountRate}% Off on All Orders`}
                    secondary="Automatic discount on every purchase"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Priority Queue"
                    secondary="Skip the line when ordering"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Free Birthday Set"
                    secondary="Complimentary cake and drink on your birthday"
                  />
                </ListItem>
              </List>
              <Typography variant="caption" color="text.secondary">
                Valid until: {membershipDetails.validUntil}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Exclusive Offers */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Exclusive Premium Offers
            </Typography>
            <Grid container spacing={2}>
              {exclusiveOffers.map((offer, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {offer.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {offer.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Valid until: {offer.validUntil}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
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
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip
                              label={`+${order.points} pts`}
                              color="primary"
                              size="small"
                            />
                            <Chip
                              label={order.status}
                              color="success"
                              size="small"
                            />
                          </Box>
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
                            Total: ₱{order.total} (10% Premium Discount Applied)
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

export default PremiumCustomerDashboard;