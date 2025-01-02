import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import CakeIcon from '@mui/icons-material/Cake';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { useSelector } from 'react-redux';

const StyledCoupon = styled(Card)(({ theme }) => ({
  position: 'relative',
  overflow: 'visible',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: -15,
    top: '50%',
    width: 30,
    height: 30,
    backgroundColor: theme.palette.background.default,
    borderRadius: '50%',
    transform: 'translateY(-50%)',
    boxShadow: 'inset 2px 0 5px rgba(0,0,0,0.1)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    right: -15,
    top: '50%',
    width: 30,
    height: 30,
    backgroundColor: theme.palette.background.default,
    borderRadius: '50%',
    transform: 'translateY(-50%)',
    boxShadow: 'inset -2px 0 5px rgba(0,0,0,0.1)',
  },
}));

const Rewards = () => {
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  const user = useSelector((state: any) => state.auth.user);

  const coupons = [
    {
      title: 'Welcome Drink',
      description: 'Get any drink FREE on your first visit as a premium member',
      expiry: '30 days after registration',
      icon: <LocalCafeIcon sx={{ fontSize: 40 }} />,
      memberOnly: true,
      premium: true,
    },
    {
      title: 'Birthday Special',
      description: 'FREE slice of cake + drink during your birthday month',
      expiry: 'Valid during birthday month',
      icon: <CakeIcon sx={{ fontSize: 40 }} />,
      memberOnly: true,
      premium: false,
    },
    {
      title: '50% Off Pastries',
      description: 'Get 50% off on all pastries with any drink purchase',
      expiry: 'Valid until Dec 31, 2024',
      icon: <FastfoodIcon sx={{ fontSize: 40 }} />,
      memberOnly: true,
      premium: true,
    },
    {
      title: 'Buy 1 Get 1',
      description: 'Buy any drink and get one FREE of equal or lesser value',
      expiry: 'Valid until Dec 31, 2024',
      icon: <LocalCafeIcon sx={{ fontSize: 40 }} />,
      memberOnly: true,
      premium: true,
    },
    {
      title: '30% Off Coffee Beans',
      description: 'Get 30% off on all coffee bean purchases',
      expiry: 'Valid until Dec 31, 2024',
      icon: <LocalOfferIcon sx={{ fontSize: 40 }} />,
      memberOnly: true,
      premium: true,
    },
    {
      title: 'Free Upsize',
      description: 'Get a FREE upsize on any drink',
      expiry: 'Valid until Dec 31, 2024',
      icon: <LocalCafeIcon sx={{ fontSize: 40 }} />,
      memberOnly: true,
      premium: false,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Rewards & Coupons
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Exclusive offers for our valued members
        </Typography>
        {!isAuthenticated && (
          <Button
            variant="contained"
            size="large"
            href="/register"
            sx={{ mt: 2 }}
          >
            Join Now to Access Rewards
          </Button>
        )}
      </Box>

      {/* Points Status for Members */}
      {isAuthenticated && (
        <Card sx={{ mb: 4, p: 3 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" gutterBottom>
                Your Points Balance
              </Typography>
              <Typography variant="h3" color="primary">
                500 pts
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" paragraph>
                Earn more points with every purchase:
              </Typography>
              <Typography variant="body2">
                • Regular Members: 1 point per ₱50 spent
              </Typography>
              <Typography variant="body2">
                • Premium Members: 2 points per ₱50 spent
              </Typography>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* Available Coupons */}
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Available Coupons
      </Typography>
      <Grid container spacing={3}>
        {coupons.map((coupon, index) => (
          <Grid item xs={12} md={6} key={index}>
            <StyledCoupon>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ mr: 2, color: 'primary.main' }}>
                    {coupon.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {coupon.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {coupon.memberOnly && (
                        <Chip
                          label="Members Only"
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                      {coupon.premium && (
                        <Chip
                          label="Premium"
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
                <Typography variant="body1" paragraph>
                  {coupon.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Expires: {coupon.expiry}
                </Typography>
              </CardContent>
              <Divider sx={{ mx: 2 }} />
              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <Button
                  variant="contained"
                  disabled={!isAuthenticated || (coupon.premium && !user?.isPremium)}
                >
                  {!isAuthenticated
                    ? 'Login to Claim'
                    : coupon.premium && !user?.isPremium
                    ? 'Premium Members Only'
                    : 'Claim Coupon'}
                </Button>
              </CardActions>
            </StyledCoupon>
          </Grid>
        ))}
      </Grid>

      {/* Call to Action for Non-Premium Members */}
      {isAuthenticated && !user?.isPremium && (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h5" gutterBottom>
            Upgrade to Premium
          </Typography>
          <Typography variant="body1" paragraph>
            Get access to exclusive premium coupons and double points on all purchases!
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            href="/membership"
          >
            Upgrade Now
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Rewards;
