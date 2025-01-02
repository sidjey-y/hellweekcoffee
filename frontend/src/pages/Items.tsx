import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useSnackbar } from 'notistack';
import { Item, ItemType, ITEM_TYPES } from '../types/item';
import { itemsAPI } from '../services/api';

const Items = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState<Item[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await itemsAPI.getItems();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
      enqueueSnackbar('Failed to fetch items', { variant: 'error' });
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleAddItem = () => {
    setDialogMode('add');
    setSelectedItem(null);
    setOpenDialog(true);
  };

  const handleEditItem = (item: Item) => {
    setDialogMode('edit');
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleDeleteItem = async (item: Item) => {
    try {
      await itemsAPI.deleteItem(item.code);
      enqueueSnackbar('Item deleted successfully', { variant: 'success' });
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      enqueueSnackbar('Failed to delete item', { variant: 'error' });
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  const handleSaveItem = async (formData: any) => {
    try {
      if (dialogMode === 'add') {
        await itemsAPI.createItem(formData);
        enqueueSnackbar('Item created successfully', { variant: 'success' });
      } else {
        await itemsAPI.updateItem(selectedItem!.code, formData);
        enqueueSnackbar('Item updated successfully', { variant: 'success' });
      }
      handleDialogClose();
      fetchItems();
    } catch (error) {
      console.error('Error saving item:', error);
      enqueueSnackbar('Failed to save item', { variant: 'error' });
    }
  };

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            HellWeek Coffee - Items Management
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Items Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddItem}
          >
            Add New Item
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Base Price</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.code}>
                  <TableCell>{item.code}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>₱{item.basePrice}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditItem(item)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteItem(item)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {dialogMode === 'add' ? 'Add New Item' : 'Edit Item'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Item Code"
                margin="normal"
                name="code"
                defaultValue={selectedItem?.code}
                disabled={dialogMode === 'edit'}
              />
              <TextField
                fullWidth
                label="Name"
                margin="normal"
                name="name"
                defaultValue={selectedItem?.name}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  defaultValue={selectedItem?.type || ''}
                >
                  {Object.values(ITEM_TYPES).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Base Price"
                margin="normal"
                name="basePrice"
                type="number"
                defaultValue={selectedItem?.basePrice}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button onClick={() => handleSaveItem({})} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Items;
