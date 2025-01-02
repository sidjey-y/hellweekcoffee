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
  IconButton,
  Divider,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  Logout as LogoutIcon,
  ShoppingCart as ShoppingCartIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useSnackbar } from 'notistack';
import { Item, ItemType, ITEM_TYPES, Size } from '../types/item';
import { Category } from '../types/category';
import { itemsAPI, customizationAPI, categoriesAPI } from '../services/api';

interface CustomizationOption {
  id: number;
  name: string;
  price: number;
}

interface Customization {
  id: number;
  code: string;
  name: string;
  categoryType: ItemType;
  options: CustomizationOption[];
  active: boolean;
}

interface OrderCustomization {
  id: number;
  name: string;
  option: string;
  price: number;
}

interface OrderItem {
  item: Item;
  quantity: number;
  size?: string;
  customizations: OrderCustomization[];
  totalPrice: number;
}

const isValidSize = (size: string): size is Size => {
  return ['SMALL', 'MEDIUM', 'LARGE'].includes(size);
};

const POS = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [isTransactionStarted, setIsTransactionStarted] = useState(false);
  const [customerInfoDialogOpen, setCustomerInfoDialogOpen] = useState(false);
  const [isGuestOrder, setIsGuestOrder] = useState(true);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    memberId: '',
    fullName: '',
    dateOfBirth: '',
    email: '',
    phoneNumber: '',
  });
  const [showNewMemberForm, setShowNewMemberForm] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedType, setSelectedType] = useState<ItemType | ''>('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<string>('MEDIUM');
  const [customizations, setCustomizations] = useState<OrderCustomization[]>([]);
  const [isCustomizeDialogOpen, setIsCustomizeDialogOpen] = useState(false);
  const [availableCustomizations, setAvailableCustomizations] = useState<Customization[]>([]);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string>>({});
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [membershipId, setMembershipId] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getCategories();
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

  const handleItemSelect = async (item: Item) => {
    setSelectedItem(item);
    setQuantity(1);
    setSize('MEDIUM');
    setCustomizations([]);
    setSelectedCustomizations({});
    
    try {
      console.log('Selected item:', item);
      const customizations = await customizationAPI.getCustomizations();
      console.log('Raw customizations from API:', customizations);
      
      const filteredCustomizations = customizations.filter((c: Customization) => {
        console.log('Checking customization:', {
          id: c.id,
          name: c.name,
          categoryType: c.categoryType,
          itemType: item.type,
          active: c.active,
          options: c.options
        });
        return c.categoryType === item.type && c.active;
      });
      
      console.log('Filtered customizations:', filteredCustomizations);
      setAvailableCustomizations(filteredCustomizations);
    } catch (error) {
      console.error('Error fetching customizations:', error);
      enqueueSnackbar('Failed to fetch customizations', { variant: 'error' });
    }
    
    setIsCustomizeDialogOpen(true);
  };

  const calculateItemPrice = (item: Item | null, size: string, customizations: OrderCustomization[]) => {
    if (!item) return 0;
    
    const validSize = isValidSize(size) ? size : null;
    const basePrice = validSize && item.type === ITEM_TYPES.DRINKS ? item.sizePrices[validSize] : item.basePrice;
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
      const newOrderItem: OrderItem = {
        item: selectedItem,
        quantity,
        size,
        customizations,
        totalPrice
      };
      setOrderItems([...orderItems, newOrderItem]);
    }

    setIsCustomizeDialogOpen(false);
    setSelectedItem(null);
    setQuantity(1);
    setCustomizations([]);
    setSelectedCustomizations({});
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

  const handleCustomizationChange = (customizationId: number, optionName: string) => {
    console.log('Customization change:', { customizationId, optionName });
    
    setSelectedCustomizations(prev => {
      const updated = { ...prev, [customizationId]: optionName };
      console.log('Updated selected customizations:', updated);
      return updated;
    });

    // Update the customizations array with the selected option
    if (optionName === '') {
      // Remove the customization if "None" is selected
      setCustomizations(prev => {
        const updated = prev.filter(c => c.id !== customizationId);
        console.log('Removed customization:', { customizationId, updated });
        return updated;
      });
    } else {
      const customization = availableCustomizations.find(c => c.id === customizationId);
      console.log('Found customization:', customization);
      if (!customization) return;

      const option = customization.options.find(o => o.name === optionName);
      console.log('Found option:', option);
      if (!option) return;

      const newCustomization: OrderCustomization = {
        id: customizationId,
        name: customization.name,
        option: optionName,
        price: option.price
      };
      console.log('New customization:', newCustomization);

      setCustomizations(prev => {
        const existingIndex = prev.findIndex(c => c.id === customizationId);
        let updated;
        if (existingIndex >= 0) {
          // Replace existing customization
          updated = [...prev];
          updated[existingIndex] = newCustomization;
          console.log('Updated existing customization:', updated);
        } else {
          // Add new customization
          updated = [...prev, newCustomization];
          console.log('Added new customization:', updated);
        }
        return updated;
      });
    }
  };

  const handleCustomizationConfirm = () => {
    if (!selectedItem) return;

    handleAddToOrder();
  };

  const handleCompleteTransaction = () => {
    setIsReceiptDialogOpen(true);
  };

  const handlePrintReceipt = () => {
    window.print(); // This will trigger the browser's print dialog
    setIsReceiptDialogOpen(false);
    resetTransaction();
    enqueueSnackbar('Transaction completed successfully', { variant: 'success' });
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleNewTransaction = () => {
    setIsTransactionStarted(true);
    setCustomerInfoDialogOpen(true);
  };

  const handleCancelTransaction = () => {
    if (orderItems.length > 0) {
      if (window.confirm('Are you sure you want to cancel this transaction? All items will be lost.')) {
        resetTransaction();
        dispatch(logout());
        navigate('/login');
      }
    } else {
      resetTransaction();
      dispatch(logout());
      navigate('/login');
    }
  };

  const resetTransaction = () => {
    setIsTransactionStarted(false);
    setOrderItems([]);
    setCustomerInfo({
      firstName: '',
      memberId: '',
      fullName: '',
      dateOfBirth: '',
      email: '',
      phoneNumber: '',
    });
    setIsGuestOrder(true);
    setShowNewMemberForm(false);
  };

  const handleCustomerTypeSelect = (isGuest: boolean) => {
    setIsGuestOrder(isGuest);
    if (!isGuest) {
      setShowNewMemberForm(false);
    }
  };

  const validateCustomerInfo = () => {
    if (isGuestOrder) {
      return !!customerInfo.firstName.trim();
    } else if (showNewMemberForm) {
      return (
        !!customerInfo.fullName.trim() &&
        !!customerInfo.dateOfBirth &&
        (!!customerInfo.email.trim() || !!customerInfo.phoneNumber.trim())
      );
    } else {
      return !!customerInfo.memberId.trim();
    }
  };

  const handleCustomerInfoSubmit = () => {
    if (validateCustomerInfo()) {
      setCustomerInfoDialogOpen(false);
    } else {
      enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
    }
  };

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            HellWeek Coffee - POS
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

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {!isTransactionStarted ? (
          // Initial Transaction Screen
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<ShoppingCartIcon />}
              onClick={handleNewTransaction}
              sx={{ width: '300px', height: '60px' }}
            >
              New Transaction
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="large"
              startIcon={<CancelIcon />}
              onClick={handleCancelTransaction}
              sx={{ width: '300px', height: '60px' }}
            >
              Cancel Transaction
            </Button>
          </Box>
        ) : (
          // Main POS Interface
          <Grid container spacing={3}>
            {/* Left Panel - Menu Selection */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, height: '80vh', display: 'flex', flexDirection: 'column' }}>
                {/* Customer Type Selection */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Customer Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Customer Type</InputLabel>
                        <Select
                          value={isGuestOrder ? 'guest' : 'member'}
                          onChange={(e) => setIsGuestOrder(e.target.value === 'guest')}
                        >
                          <MenuItem value="guest">Guest</MenuItem>
                          <MenuItem value="member">Member</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    {!isGuestOrder && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Membership ID"
                          value={membershipId}
                          onChange={(e) => setMembershipId(e.target.value)}
                        />
                      </Grid>
                    )}
                  </Grid>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Item Type Selection */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Select Item Type
                  </Typography>
                  <Grid container spacing={1}>
                    {Object.values(ITEM_TYPES).map((type) => (
                      <Grid item key={type}>
                        <Button
                          variant={selectedType === type ? 'contained' : 'outlined'}
                          onClick={() => handleTypeSelect(type)}
                          sx={{ minWidth: '120px' }}
                        >
                          {type.replace(/_/g, ' ')}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Item Selection */}
                {selectedType && (
                  <Box sx={{ mb: 2, flex: 1, overflow: 'auto' }}>
                    <Typography variant="h6" gutterBottom>
                      Select Item
                    </Typography>
                    <Grid container spacing={2}>
                      {items
                        .filter(item => item.type === selectedType && item.active)
                        .map((item) => (
                          <Grid item xs={12} sm={6} md={4} key={item.code}>
                            <Paper
                              sx={{
                                p: 2,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: 3,
                                },
                              }}
                              onClick={() => handleItemSelect(item)}
                            >
                              <Typography variant="subtitle1" gutterBottom>
                                {item.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Base Price: ₱{item.basePrice.toFixed(2)}
                              </Typography>
                              {item.description && (
                                <Typography variant="body2" color="text.secondary" noWrap>
                                  {item.description}
                                </Typography>
                              )}
                            </Paper>
                          </Grid>
                        ))}
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Right Panel - Order Summary */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '80vh', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                
                <List sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
                  {orderItems.map((orderItem, index) => (
                    <React.Fragment key={index}>
                      <ListItem
                        secondaryAction={
                          <Box>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleUpdateQuantity(index, false)}
                              disabled={orderItem.quantity <= 1}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <Typography component="span" sx={{ mx: 1 }}>
                              {orderItem.quantity}
                            </Typography>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleUpdateQuantity(index, true)}
                            >
                              <AddIcon />
                            </IconButton>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleRemoveOrderItem(index)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" component="div">
                              {orderItem.item.name}
                              {orderItem.size && ` (${orderItem.size})`}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" component="div">
                                ₱{orderItem.totalPrice.toFixed(2)}
                              </Typography>
                              {orderItem.customizations.map((customization, idx) => (
                                <Typography key={idx} variant="caption" display="block" color="text.secondary" component="div">
                                  + {customization.name}: {customization.option}
                                </Typography>
                              ))}
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>

                <Box>
                  <Typography variant="h6" align="right" gutterBottom>
                    Total: ₱{calculateTotal().toFixed(2)}
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<ReceiptIcon />}
                    onClick={handleCompleteTransaction}
                    disabled={orderItems.length === 0}
                    size="large"
                  >
                    Complete Transaction
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Customization Dialog */}
        <Dialog 
          open={isCustomizeDialogOpen}
          onClose={() => setIsCustomizeDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box>
              <Typography variant="h6" component="div">
                {selectedItem?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Base Price: ₱{selectedItem?.basePrice.toFixed(2)}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              {selectedItem?.type === ITEM_TYPES.DRINKS && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Size</InputLabel>
                    <Select
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      label="Size"
                    >
                      <MenuItem value="SMALL">Small (₱{selectedItem?.sizePrices.SMALL.toFixed(2)})</MenuItem>
                      <MenuItem value="MEDIUM">Medium (₱{selectedItem?.sizePrices.MEDIUM.toFixed(2)})</MenuItem>
                      <MenuItem value="LARGE">Large (₱{selectedItem?.sizePrices.LARGE.toFixed(2)})</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Quantity
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <IconButton 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    size="small"
                    color="primary"
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography variant="h6">{quantity}</Typography>
                  <IconButton 
                    onClick={() => setQuantity(prev => prev + 1)}
                    size="small"
                    color="primary"
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Grid>

              {availableCustomizations.map((customization) => (
                <Grid item xs={12} key={customization.id}>
                  <FormControl fullWidth>
                    <InputLabel>{customization.name}</InputLabel>
                    <Select
                      value={selectedCustomizations[customization.id] || ''}
                      onChange={(e) => handleCustomizationChange(customization.id, e.target.value)}
                      label={customization.name}
                    >
                      <MenuItem value="">None</MenuItem>
                      {customization.options?.map((option) => (
                        <MenuItem key={option.name} value={option.name}>
                          {option.name} (+₱{option.price.toFixed(2)})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              ))}

              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Total Price: ₱{selectedItem ? (calculateItemPrice(selectedItem, size, customizations) * quantity).toFixed(2) : '0.00'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsCustomizeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCustomizationConfirm} variant="contained" color="primary">
              Add to Order
            </Button>
          </DialogActions>
        </Dialog>

        {/* Receipt Dialog */}
        <Dialog
          open={isReceiptDialogOpen}
          onClose={() => setIsReceiptDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Receipt</DialogTitle>
          <DialogContent>
            <Box sx={{ p: 2 }} className="receipt-content">
              <Typography variant="h6" align="center" gutterBottom>
                HellWeek Coffee
              </Typography>
              <Typography align="center" gutterBottom>
                {new Date().toLocaleString()}
              </Typography>
              <Typography align="center" gutterBottom>
                {isGuestOrder 
                  ? `Guest: ${customerInfo.firstName}`
                  : `Member ID: ${customerInfo.memberId}`}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              {orderItems.map((orderItem, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography>
                    {orderItem.quantity}x {orderItem.item.name} 
                    {orderItem.size && ` (${orderItem.size})`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                    Base Price: ₱{orderItem.item.basePrice.toFixed(2)}
                  </Typography>
                  
                  {orderItem.customizations.map((customization, idx) => (
                    <Typography key={idx} variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      + {customization.name}: {customization.option} 
                      (₱{customization.price.toFixed(2)})
                    </Typography>
                  ))}
                  
                  <Typography align="right">
                    Item Total: ₱{orderItem.totalPrice.toFixed(2)}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                </Box>
              ))}
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" align="right">
                  Total Amount: ₱{calculateTotal().toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsReceiptDialogOpen(false)}>Close</Button>
            <Button onClick={handlePrintReceipt} variant="contained" color="primary" startIcon={<ReceiptIcon />}>
              Print Receipt
            </Button>
          </DialogActions>
        </Dialog>

        {/* Customer Information Dialog */}
        <Dialog 
          open={customerInfoDialogOpen} 
          onClose={() => setCustomerInfoDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Customer Information</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Select Customer Type
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant={isGuestOrder ? 'contained' : 'outlined'}
                    onClick={() => handleCustomerTypeSelect(true)}
                  >
                    Guest
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant={!isGuestOrder ? 'contained' : 'outlined'}
                    onClick={() => handleCustomerTypeSelect(false)}
                  >
                    Member
                  </Button>
                </Grid>
              </Grid>

              {isGuestOrder ? (
                // Guest Information Form
                <TextField
                  fullWidth
                  required
                  label="First Name"
                  value={customerInfo.firstName}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                  sx={{ mb: 2 }}
                />
              ) : showNewMemberForm ? (
                // New Member Registration Form
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    required
                    label="Full Name"
                    value={customerInfo.fullName}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    required
                    label="Date of Birth"
                    type="date"
                    value={customerInfo.dateOfBirth}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, dateOfBirth: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    helperText="Email or phone number is required"
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={customerInfo.phoneNumber}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phoneNumber: e.target.value })}
                    helperText="Email or phone number is required"
                  />
                  <Typography variant="body2" color="text.secondary">
                    * At least one contact information (email or phone) is required
                  </Typography>
                </Box>
              ) : (
                // Existing Member Form
                <Box>
                  <TextField
                    fullWidth
                    required
                    label="Member ID"
                    value={customerInfo.memberId}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, memberId: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => setShowNewMemberForm(true)}
                  >
                    New Member? Register here
                  </Button>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setCustomerInfoDialogOpen(false);
              setIsTransactionStarted(false);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCustomerInfoSubmit}
              variant="contained"
              disabled={!validateCustomerInfo()}
            >
              Continue
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default POS;
