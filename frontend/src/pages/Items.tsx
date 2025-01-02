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
  SelectChangeEvent,
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

type ItemFormData = {
  name: string;
  type: ItemType;
  basePrice: number;
  categoryId: string;
  description: string;
  sizePrices: Record<string, number>;
  active: boolean;
  availableCustomizations?: number[];
};

const defaultFormData: ItemFormData = {
  name: '',
  type: 'ESPRESSO_DRINK',
  basePrice: 0,
  categoryId: 'GENERAL',
  description: '',
  sizePrices: {},
  active: true,
  availableCustomizations: [],
};

const Items = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState<Item[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState<ItemFormData>(defaultFormData);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      setFormData({
        name: selectedItem.name,
        type: selectedItem.type,
        basePrice: selectedItem.basePrice,
        categoryId: selectedItem.category.id,
        description: selectedItem.description || '',
        sizePrices: selectedItem.sizePrices || {},
        active: selectedItem.active,
        availableCustomizations: selectedItem.availableCustomizations?.map(c => c.id) || [],
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [selectedItem]);

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

  const handleDeleteClick = (item: Item) => {
    setSelectedItem(item);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    
    try {
      await itemsAPI.deleteItem(selectedItem.code);
      enqueueSnackbar('Item deleted successfully', { variant: 'success' });
      setOpenDeleteDialog(false);
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      enqueueSnackbar('Failed to delete item', { variant: 'error' });
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setSelectedItem(null);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  const handleTextFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'basePrice' ? Number(value) : value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveItem = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.type || formData.basePrice <= 0) {
        enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
        return;
      }

      const requestData = {
        name: formData.name,
        type: formData.type,
        basePrice: Number(formData.basePrice),
        categoryId: formData.categoryId,
        description: formData.description,
        sizePrices: formData.sizePrices,
        active: formData.active,
        availableCustomizations: formData.availableCustomizations,
      };

      console.log('Saving item with data:', requestData);

      if (dialogMode === 'add') {
        await itemsAPI.createItem(requestData);
        enqueueSnackbar('Item created successfully', { variant: 'success' });
      } else {
        await itemsAPI.updateItem(selectedItem!.code, requestData);
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
                <TableCell>Category</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.code}>
                  <TableCell>{item.code}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.type.replace(/_/g, ' ')}</TableCell>
                  <TableCell>{item.basePrice}</TableCell>
                  <TableCell>{item.category.name}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditItem(item)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(item)}>
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
            <Box sx={{ width: '100%', mt: 2 }}>
              <TextField
                fullWidth
                required
                label="Name"
                margin="normal"
                name="name"
                value={formData.name}
                onChange={handleTextFieldChange}
                error={!formData.name}
                helperText={!formData.name ? 'Name is required' : ''}
              />
              <FormControl fullWidth margin="normal" required error={!formData.type}>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleSelectChange}
                  label="Type"
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
                required
                label="Base Price"
                margin="normal"
                name="basePrice"
                type="number"
                value={formData.basePrice}
                onChange={handleTextFieldChange}
                error={formData.basePrice <= 0}
                helperText={formData.basePrice <= 0 ? 'Base price must be greater than 0' : ''}
                InputProps={{
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
              <TextField
                fullWidth
                label="Description"
                margin="normal"
                name="description"
                value={formData.description}
                onChange={handleTextFieldChange}
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button 
              onClick={handleSaveItem} 
              variant="contained" 
              color="primary"
              disabled={!formData.name || !formData.type || formData.basePrice <= 0}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openDeleteDialog} onClose={handleDeleteCancel}>
          <DialogTitle>Delete Item</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete {selectedItem?.name}? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Items;
