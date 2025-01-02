import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Chip,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useSnackbar } from 'notistack';
import { Item, ItemType, ITEM_TYPES } from '../types/item';
import { Category } from '../types/category';
import { itemsAPI } from '../services/api';

interface OrderItem {
  item: Item;
  quantity: number;
  size?: string;
  customizations: Array<{
    id: number;
    name: string;
    option: string;
    price: number;
  }>;
  totalPrice: number;
}

const POS = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedType, setSelectedType] = useState<ItemType | ''>('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<string>('MEDIUM');
  const [customizations, setCustomizations] = useState<Array<{
    id: number;
    name: string;
    option: string;
    price: number;
  }>>([]);
  const [isCustomizeDialogOpen, setIsCustomizeDialogOpen] = useState(false);
  const [isGuestOrder, setIsGuestOrder] = useState(true);
  const [membershipId, setMembershipId] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await itemsAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      enqueueSnackbar('Failed to fetch categories', { variant: 'error' });
    }
  };

  const fetchItems = async () => {
    try {
      const data = await itemsAPI.getItems();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
      enqueueSnackbar('Failed to fetch items', { variant: 'error' });
    }
  };

  const handleTypeSelect = (type: ItemType) => {
    setSelectedType(type);
    setSelectedItem(null);
  };

  const handleItemSelect = (item: Item) => {
    setSelectedItem(item);
    setQuantity(1);
    setSize('MEDIUM');
    setCustomizations([]);
    setIsCustomizeDialogOpen(true);
  };

  const calculateItemPrice = (item: Item, size: string, customizations: Array<{ price: number }>) => {
    const basePrice = item.sizePrices[size] || item.basePrice;
    const customizationTotal = customizations.reduce((sum, c) => sum + c.price, 0);
    return basePrice + customizationTotal;
  };

  const handleAddToOrder = () => {
    if (!selectedItem) return;

    const itemPrice = calculateItemPrice(selectedItem, size, customizations);
    const totalPrice = itemPrice * quantity;

    // Check if the same item with same customizations exists
    const existingItemIndex = orderItems.findIndex(orderItem => 
      orderItem.item.code === selectedItem.code &&
      orderItem.size === size &&
      JSON.stringify(orderItem.customizations) === JSON.stringify(customizations)
    );

    if (existingItemIndex !== -1) {
      // Update quantity of existing item
      const updatedOrderItems = [...orderItems];
      const existingItem = updatedOrderItems[existingItemIndex];
      existingItem.quantity += quantity;
      existingItem.totalPrice = calculateItemPrice(existingItem.item, existingItem.size || 'MEDIUM', existingItem.customizations) * existingItem.quantity;
      setOrderItems(updatedOrderItems);
    } else {
      // Add new item
      setOrderItems([...orderItems, {
        item: selectedItem,
        quantity,
        size,
        customizations,
        totalPrice
      }]);
    }

    setIsCustomizeDialogOpen(false);
    setSelectedItem(null);
    setQuantity(1);
    setCustomizations([]);
  };

  const handleRemoveOrderItem = (index: number) => {
    const updatedOrderItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(updatedOrderItems);
  };

  const handleUpdateQuantity = (index: number, increment: boolean) => {
    const updatedOrderItems = [...orderItems];
    const item = updatedOrderItems[index];
    
    if (increment) {
      item.quantity += 1;
    } else if (item.quantity > 1) {
      item.quantity -= 1;
    }
    
    item.totalPrice = calculateItemPrice(item.item, item.size || 'MEDIUM', item.customizations) * item.quantity;
    setOrderItems(updatedOrderItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleCompleteTransaction = () => {
    // TODO: Implement transaction completion
    enqueueSnackbar('Transaction completed successfully', { variant: 'success' });
    setOrderItems([]);
    setIsGuestOrder(true);
    setMembershipId('');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#4d351d', color: 'white' }} elevation={1}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div" fontWeight="bold">
             Hell Week Coffee
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
      <Box sx={{ backgroundColor: '#EEDCC6', padding: 2, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="bold" sx={{color: '#230C02'}}>
          Point-Of-Sale System
        </Typography>
      </Box>
      <Container maxWidth="xl" sx={{minHeight: '100vh', mt: 0, paddingTop: 0, mb: 4, backgroundColor: '#eedcc6'}}>
        <Grid container spacing={3}>
          {/* Left Panel - Order Items */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: '80vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFF5E9'}}>
              {/* Customer Type Selection */}
              <Box sx={{ mb: 2 }}>
  <FormControl fullWidth sx={{ backgroundColor: '#FFF5E9', p: 0, borderRadius: 1 }}>
    <Typography
      variant="h6"
      fontWeight="bold"
      sx={{ backgroundColor: '#FFF5E9', mb: 1 }}
    >
      Customer Type
    </Typography>
    <Select
      value={isGuestOrder ? 'guest' : 'member'}
      onChange={(e) => setIsGuestOrder(e.target.value === 'guest')}
      sx={{ mt: 0, backgroundColor: 'white' }}
    >
      <MenuItem value="guest">Guest</MenuItem>
      <MenuItem value="member">Member</MenuItem>
    </Select>
  </FormControl>
  {!isGuestOrder && (
    <TextField
      fullWidth
      label="Membership ID"
      value={membershipId}
      onChange={(e) => setMembershipId(e.target.value)}
      sx={{ mt: 2, backgroundColor: 'white' }}
    />
  )}
</Box>



              {/* Item Type Selection */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom fontWeight='bold' sx={{ color: '#230c02' }}>
                  Select Item Type
                </Typography>
                <Grid container spacing={1}>
                  {Object.values(ITEM_TYPES).map((type) => (
                    <Grid item key={type}>
                      <Button
                        variant={selectedType === type ? 'contained' : 'outlined'}
                    
                        onClick={() => handleTypeSelect(type)}
                      >
                        {type.replace(/_/g, ' ')}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Item Selection */}
              {selectedType && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom fontWeight='bold' sx={{ color: '#230c02' }}>
                    Select Item
                  </Typography>
                  <Grid container spacing={2}>
                    {items
                      .filter((item) => item.type === selectedType)
                      .map((item) => (
                        <Grid item key={item.code} xs={12} sm={6} md={4}>
                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => handleItemSelect(item)}
                            sx={{ height: '100%', textAlign: 'left', justifyContent: 'flex-start', backgroundColor: 'white' }}
                          >
                            <Box>
                              <Typography variant="subtitle1">{item.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {item.description}
                              </Typography>
                              <Typography variant="body2" color="primary">
                                ₱{item.basePrice}
                              </Typography>
                            </Box>
                          </Button>
                        </Grid>
                      ))}
                  </Grid>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right Panel - Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '80vh', display: 'flex', flexDirection: 'column' , backgroundColor: '#FFF5E9'}}>
              <Typography variant="h6" gutterBottom fontWeight='bold' sx={{ color: '#230c02' }}>
                Order Summary
              </Typography>
              <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                {orderItems.map((orderItem, index) => (
                  <React.Fragment key={`${orderItem.item.code}-${index}`}>
                    <ListItem>
                      <ListItemText
                        primary={orderItem.item.name}
                        secondary={
                          <>
                            <Typography variant="body2">
                              Size: {orderItem.size}
                            </Typography>
                            {orderItem.customizations.map((customization, i) => (
                              <Typography key={i} variant="body2">
                                {customization.name}: {customization.option} (+₱{customization.price})
                              </Typography>
                            ))}
                            <Typography variant="body2">
                              ₱{orderItem.totalPrice}
                            </Typography>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleUpdateQuantity(index, false)}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography component="span" sx={{ mx: 1 }}>
                          {orderItem.quantity}
                        </Typography>
                        <IconButton
                          edge="end"
                          onClick={() => handleUpdateQuantity(index, true)}
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveOrderItem(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" align="right" gutterBottom sx={{ color: '#230c02' }}>
                  Total: ₱{calculateTotal()}
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<ReceiptIcon />}
                  onClick={handleCompleteTransaction}
                  disabled={orderItems.length === 0}
                >
                  Complete Transaction
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Customize Dialog */}
        <Dialog 
          open={isCustomizeDialogOpen}
          onClose={() => setIsCustomizeDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Customize {selectedItem?.name}
          </DialogTitle>
          <DialogContent>
            {selectedItem?.sizePrices && Object.keys(selectedItem.sizePrices).length > 0 && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Size</InputLabel>
                <Select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                >
                  {Object.entries(selectedItem.sizePrices).map(([sizeOption, price]) => (
                    <MenuItem key={sizeOption} value={sizeOption}>
                      {sizeOption} - ₱{price}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Quantity</InputLabel>
              <TextField
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1 }}
              />
            </FormControl>

            {selectedItem?.availableCustomizations && selectedItem.availableCustomizations.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Customizations
                </Typography>
                {/* Add customization options here */}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsCustomizeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddToOrder} variant="contained" color="primary">
              Add to Order
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default POS;
