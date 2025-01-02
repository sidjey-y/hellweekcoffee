import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import CakeIcon from '@mui/icons-material/Cake';
import StarIcon from '@mui/icons-material/Star';

const Membership = () => {
  const benefits = [
    {
      title: 'Welcome Gift',
      description: 'Get a FREE drink of your choice upon membership registration',
      icon: <LocalCafeIcon color="primary" />,
    },
    {
      title: 'Birthday Treat',
      description: 'Enjoy a complimentary cake slice on your birthday month',
      icon: <CakeIcon color="primary" />,
    },
    {
      title: 'Points System',
      description: 'Earn 1 point for every ₱50 spent, redeem for free drinks and food',
      icon: <StarIcon color="primary" />,
    },
    {
      title: 'Exclusive Rewards',
      description: 'Access to member-only promotions and special discounts',
      icon: <CardGiftcardIcon color="primary" />,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Join Our Premium Membership
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Experience coffee like never before with exclusive perks and rewards
        </Typography>
        <Button
          component={RouterLink}
          to="/register"
          variant="contained"
          size="large"
          sx={{ mt: 2 }}
        >
          Become a Member Now
        </Button>
      </Box>

      {/* Benefits Section */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {benefits.map((benefit, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  {benefit.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {benefit.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {benefit.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Membership Tiers */}
      <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        Membership Levels
      </Typography>
      <Grid container spacing={4}>
        {/* Regular Member */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Regular Member
              </Typography>
              <Typography variant="h4" color="primary" gutterBottom>
                FREE
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="1 point per ₱50 spent" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Birthday treat" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Access to member-only events" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Premium Member */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', backgroundColor: '#f5f5f5' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Premium Member
              </Typography>
              <Typography variant="h4" color="primary" gutterBottom>
                ₱500/year
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="2 points per ₱50 spent (Double Points!)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="FREE welcome drink" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Birthday treat + FREE drink" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="10% off on all orders" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Exclusive seasonal promotions" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Priority queue" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Membership;
