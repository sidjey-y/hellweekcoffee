import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Logout as LogoutIcon } from '@mui/icons-material';
import ItemForm from '../components/ItemForm';

const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'modify' | 'delete' | 'import'>('add');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleOpenDialog = (type: 'add' | 'modify' | 'delete' | 'import') => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAddItem = () => {
    navigate('/manager/items', { state: { action: 'add' } });
  };

  const handleModifyItem = () => {
    navigate('/manager/items', { state: { action: 'modify' } });
  };

  const handleDeleteItem = () => {
    navigate('/manager/items', { state: { action: 'delete' } });
  };

  const handleImportItems = () => {
    navigate('/manager/items', { state: { action: 'import' } });
  };

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            HellWeek Coffee - Manager
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
          Manager Dashboard
        </Typography>

        {/* Encode Items and Customizations */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Encode Items and Customizations</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add new items with basic definitions, customizations, and options.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleAddItem}
            sx={{ mr: 2 }}
          >
            Add New Item
          </Button>
        </Box>

        {/* Modify Encoded Items and Customizations */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Modify Items and Customizations</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Modify existing items including size, price, and customizations.
          </Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleModifyItem}
          >
            Modify Item
          </Button>
        </Box>

        {/* Delete Items and Customizations */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Delete Items and Customizations</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Remove items from the system using their item code.
          </Typography>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleDeleteItem}
          >
            Delete Item
          </Button>
        </Box>

        {/* Encode from a File */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Encode from a File</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Import items from a file to quickly add multiple items.
          </Typography>
          <Button 
            variant="contained" 
            color="info" 
            onClick={handleImportItems}
          >
            Import Items
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default ManagerDashboard;
