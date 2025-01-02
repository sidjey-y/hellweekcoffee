import React from 'react';
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
  IconButton,
} from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  Inventory as InventoryIcon,
  Store as StoreIcon,
  ShoppingCart as POSIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const quickActions = [
    {
      title: 'Manage Users',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      description: 'Add, edit, or remove staff members',
      path: '/admin/users',
      color: '#4CAF50',
    },
    {
      title: 'Manage Items',
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      description: 'Manage menu items and categories',
      path: '/admin/items',
      color: '#2196F3',
    },
    {
      title: 'View Inventory',
      icon: <StoreIcon sx={{ fontSize: 40 }} />,
      description: 'Check and update inventory levels',
      path: '/admin/inventory',
      color: '#FF9800',
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
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            HellWeek Coffee
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom component="h1">
          Admin Dashboard
        </Typography>
        
        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
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
                    <Typography variant="h6" component="h2" align="center">
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
    </>
  );
};

export default AdminDashboard;
