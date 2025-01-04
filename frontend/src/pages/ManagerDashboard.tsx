import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { RootState } from '../store';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  Inventory as InventoryIcon,
  Store as StoreIcon,
  ShoppingCart as POSIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import ChangePasswordDialog from '../components/ChangePasswordDialog';

const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const quickActions = [
    {
      title: 'Manage Items',
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      description: 'Manage menu items and categories',
      path: '/manager/items',
      color: '#2196F3',
    },
    {
      title: 'POS System',
      icon: <POSIcon sx={{ fontSize: 40 }} />,
      description: 'Access the point of sale system',
      path: '/pos',
      color: '#E91E63',
    },
  ];

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#4d351d', color: 'white' }} elevation={1}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src="/assets/logo2.png"
              alt="Hell Week Coffee Logo"
              sx={{ height: 50 }} 
            />
            <Typography variant="h6" component="div" fontWeight="bold">
              Hell Week Coffee
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1">
              {user?.firstName}
            </Typography>
            <Button 
              color="inherit" 
              onClick={() => setChangePasswordOpen(true)}
              sx={{ mr: 2 }}
            >
              Change Password
            </Button>
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{
        position: 'relative', 
        backgroundImage: 'url("https://www.myboysen.com/wp-content/uploads/2023/08/Cafe-Interior-feature.jpg")',
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        minHeight: '50vh', 
        paddingTop: 6,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Box 
          sx={{
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            backgroundColor: 'rgba(63, 62, 62, 0.5)', 
            zIndex: 1, 
          }}
        />

        <Typography 
          variant="h4" 
          gutterBottom 
          component="h1" 
          sx={{ 
            color: 'white', 
            fontWeight: 'bold', 
            textAlign: 'center',
            position: 'relative', 
            zIndex: 2, 
            fontSize: 50
          }}
        >
          MANAGER DASHBOARD
        </Typography>
      </Box>

      <Box sx={{ backgroundColor: '#EEDCC6', minHeight: '100vh', mt: 0, paddingTop: 5 }}>
        <Container maxWidth="lg" sx={{ mb: 4 }}>
          <Grid
            container
            spacing={3}
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    backgroundColor: '#FFF5E9',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                      transition: 'all 0.3s ease-in-out',
                    },
                  }}
                  onClick={() => navigate(action.path)}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: `${action.color}15`,
                          color: action.color,
                          mb: 2,
                        }}
                      >
                        {action.icon}
                      </Box>
                      <Typography variant="h6" component="h2" align="center" sx={{ fontWeight: 'bold', color: '#230C02' }}>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center">
                        {action.description}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      <ChangePasswordDialog 
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </>
  );
};

export default ManagerDashboard;
