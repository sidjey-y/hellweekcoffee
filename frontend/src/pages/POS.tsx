import React, { useState, useEffect, useMemo } from 'react';
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
  colors,
  InputAdornment,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  Logout as LogoutIcon,
  ShoppingCart as ShoppingCartIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  NoFood as NoFoodIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useSnackbar } from 'notistack';
import { Item, ItemType, ITEM_TYPES, Size, isDrinkType, CategoryType, CATEGORY_TYPES } from '../types/item';
import { Category } from '../types/category';
import { itemsAPI, customizationAPI, categoriesAPI, customerAPI, transactionAPI } from '../services/api';
import { axiosInstance } from '../utils/axios';
import ChangePasswordDialog from '../components/ChangePasswordDialog';

interface CustomizationOption {
  id: number;
  name: string;
  price: number;
}

interface Customization {
  id: number;
  code: string;
  name: string;
  categoryType: CategoryType;
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

interface CustomerInfo {
  id?: number;
  firstName: string;
  memberId: string;
  fullName: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
}

const isValidSize = (size: string): size is Size => {
  return ['SMALL', 'MEDIUM', 'LARGE'].includes(size);
};

const getCategoryParentType = (categoryType: CategoryType): ItemType => {
  for (const [itemType, categories] of Object.entries(CATEGORY_TYPES)) {
    if (categories.includes(categoryType)) {
      return itemType as ItemType;
    }
  }
  return 'MERCHANDISE';
};

const POS: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [isTransactionStarted, setIsTransactionStarted] = useState(false);
  const [customerInfoDialogOpen, setCustomerInfoDialogOpen] = useState(false);
  const [isGuestOrder, setIsGuestOrder] = useState(true);
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [birthdateError, setBirthdateError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    id: undefined,
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
  const [memberIdError, setMemberIdError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoCodeError, setPromoCodeError] = useState<string>('');
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [customerNameError, setCustomerNameError] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemNameError, setItemNameError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesType = !selectedType || item.type === selectedType;
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchesType && matchesSearch;
    });
  }, [items, selectedType, searchQuery]);

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
      const itemsWithImages = data.map((item: Item) => {
        const imageUrl = `/images/items/${item.type.toLowerCase()}/${item.code.toLowerCase()}.png`;
        console.log(`Constructing image URL for ${item.name}:`, {
          type: item.type.toLowerCase(),
          code: item.code.toLowerCase(),
          fullPath: imageUrl
        });
        return {
          ...item,
          imageUrl
        };
      });
      console.log('Items with images:', itemsWithImages);
      setItems(itemsWithImages);
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
    console.log('handleItemSelect called with item:', item);
    setSelectedItem(item);
    setQuantity(1);
    setSize('MEDIUM');
    setCustomizations([]);
    setSelectedCustomizations({});
    
    try {
      console.log('Fetching customizations for item:', {
        itemName: item.name,
        itemType: item.type,
        categoryType: item.category.type
      });
      const customizations = await customizationAPI.getCustomizations();
      console.log('Raw customizations from API:', customizations);
      
      const filteredCustomizations = customizations.filter((c: Customization) => {
        console.log('Checking customization for match:', {
          customizationId: c.id,
          customizationName: c.name,
          customizationType: c.categoryType,
          itemCategoryType: item.category.type,
          isActive: c.active,
          isMatch: c.categoryType === item.category.type && c.active
        });
        return c.categoryType === item.category.type && c.active;
      });
      
      console.log('Filtered customizations result:', {
        total: customizations.length,
        filtered: filteredCustomizations.length,
        customizations: filteredCustomizations
      });
      setAvailableCustomizations(filteredCustomizations);
    } catch (error) {
      console.error('Error fetching customizations:', error);
      enqueueSnackbar('Failed to fetch customizations', { variant: 'error' });
    }
    
    console.log('Opening customization dialog');
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

    const orderCustomizations = Object.entries(selectedCustomizations)
      .filter(([_, value]) => value)
      .map(([customizationId, selectedOptionName]) => {
        const customization = availableCustomizations.find(c => c.id.toString() === customizationId);
        if (!customization) return null;

        const option = customization.options.find(o => o.name === selectedOptionName);
        if (!option) return null;

        return {
          id: customization.id,
          name: customization.name,
          option: option.name,
          price: option.price
        };
      })
      .filter((c): c is OrderCustomization => c !== null);

    const totalPrice = calculateItemPrice(selectedItem, size, orderCustomizations);

    const newOrderItem: OrderItem = {
      item: selectedItem,
      quantity,
      size: selectedItem.type === ITEM_TYPES.DRINKS ? (isValidSize(size) ? size : undefined) : 'NS',
      customizations: orderCustomizations,
      totalPrice
    };

    setOrderItems(prev => [...prev, newOrderItem]);
    setIsCustomizeDialogOpen(false);
    setSelectedItem(null);
    setQuantity(1);
    setSize('MEDIUM');
    setCustomizations([]);
    setSelectedCustomizations({});

    enqueueSnackbar('Item added to order', { variant: 'success' });
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

    if (optionName === '') {
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
          updated = [...prev];
          updated[existingIndex] = newCustomization;
          console.log('Updated existing customization:', updated);
        } else {
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
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Could not open print window');
      }

      const orderItemsHtml = orderItems.map(item => {
        const customizationsHtml = item.customizations
          .map(c => `<p style="margin-left: 20px; margin-top: 0; margin-bottom: 5px;">+ ${c.name}: ${c.option} (₱${c.price.toFixed(2)})</p>`)
          .join('');

        return `
          <div style="margin: 10px 0;">
            <p style="margin: 0;">${item.quantity}x ${item.item.name} (${item.item.type === ITEM_TYPES.DRINKS ? item.size : 'NS'})</p>
            <p style="margin: 0;">₱${(item.totalPrice / item.quantity).toFixed(2)} each</p>
            ${customizationsHtml}
            <p style="margin: 5px 0 0; text-align: right;">Subtotal: ₱${item.totalPrice.toFixed(2)}</p>
          </div>
        `;
      }).join('');

      const receiptHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - Hell Week Coffee</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                max-width: 300px;
                margin: 0 auto;
              }
              @media print {
                body { width: 80mm; }
              }
            </style>
          </head>
          <body>
            <div>
              <h2 style="text-align: center; margin-bottom: 10px;">Hell Week Coffee</h2>
              <p style="text-align: center; margin: 5px 0;">${new Date().toLocaleString()}</p>
              <p style="text-align: center; margin: 5px 0;">${isGuestOrder ? `Guest: ${customerInfo.firstName}` : `Member ID: ${customerInfo.memberId}`}</p>
              
              <div style="margin: 20px 0; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; padding: 10px 0;">
                ${orderItemsHtml}
              </div>
              
              <h3 style="text-align: right; margin: 10px 0;">Subtotal: ₱${calculateTotal().toFixed(2)}</h3>
              ${discount > 0 ? `<h3 style="text-align: right; margin: 10px 0; color: #4caf50;">Discount: -₱${discount.toFixed(2)}</h3>` : ''}
              <h3 style="text-align: right; margin: 10px 0;">Total Amount: ₱${calculateFinalTotal().toFixed(2)}</h3>
              ${promoCode ? `<p style="text-align: right; color: #666;">Promo Code: ${promoCode}</p>` : ''}
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="margin: 5px 0;">Thank you for visiting Hell Week Coffee!</p>
                <p style="margin: 5px 0;">Please come again!</p>
              </div>
            </div>
            <script>
         window.onload = () => {
                window.print();
                window.onafterprint = () => window.close();
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(receiptHtml);
      printWindow.document.close();

      setIsReceiptDialogOpen(false);
      resetTransaction();
      enqueueSnackbar('Receipt printed successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error printing receipt:', error);
      enqueueSnackbar('Failed to print receipt', { variant: 'error' });
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const resetTransaction = (): void => {
    setIsTransactionStarted(false);
    setOrderItems([]);
    setCustomerInfo({
      id: undefined,
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
      dispatch     (logout());
      navigate('/login');
    }
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

  const handleCustomerInfoSubmit = async () => {
    setCustomerNameError('');
    setMemberIdError('');

    try {
      if (isGuestOrder) {
        if (!customerInfo.firstName.trim()) {
          setCustomerNameError('Please enter customer name before continuing');
          return;
        }
        
        try {
          const response = await customerAPI.createCustomer({
            firstName: customerInfo.firstName.trim(),
            lastName: '',
            dateOfBirth: new Date().toISOString().split('T')[0],
            email: null,
            phone: null,
            member: false
          });
          
          setCustomerInfo(prev => ({
            ...prev,
            id: response.id
          }));
        } catch (error) {
          console.error('Error creating guest customer:', error);
          enqueueSnackbar('Failed to create guest customer', { variant: 'error' });
          return;
        }
      }
      else if (!isGuestOrder && showNewMemberForm) {
        if (!customerInfo.fullName.trim() || !customerInfo.dateOfBirth || 
            (!customerInfo.email.trim() && !customerInfo.phoneNumber.trim())) {
          enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
          return;
        }

        const [firstName, ...lastNameParts] = customerInfo.fullName.trim().split(' ');
        const lastName = lastNameParts.join(' ');

        try {
          let formattedDate = customerInfo.dateOfBirth;
          if (customerInfo.dateOfBirth.includes('/')) {
            formattedDate = customerInfo.dateOfBirth.split('/').reverse().join('-');
          }

          const response = await customerAPI.createCustomer({
            firstName,
            lastName,
            dateOfBirth: formattedDate,
            email: customerInfo.email.trim() || null,
            phone: customerInfo.phoneNumber.trim() || null,
            member: true
          });
          
          setCustomerInfo(prev => ({
            ...prev,
            id: response.id,
            memberId: response.membershipId || ''
          }));
          
          enqueueSnackbar('Member registered successfully!', { variant: 'success' });
        } catch (error) {
          console.error('Error registering member:', error);
          enqueueSnackbar('Failed to register member', { variant: 'error' });
          return;
        }
      }
      else if (!isGuestOrder && !showNewMemberForm) {
        if (!customerInfo.memberId) {
          setMemberIdError('Please enter a valid membership ID');
          return;
        }
        
        try {
          const member = await customerAPI.getCustomerByMemberId(customerInfo.memberId);
          setCustomerInfo(prev => ({
            ...prev,
            id: member.id,
            firstName: member.firstName,
            fullName: `${member.firstName} ${member.lastName}`
          }));
        } catch (error) {
          console.error('Error validating member:', error);
          setMemberIdError('Invalid membership ID');
          return;
        }
      }

      setIsTransactionStarted(true);
      setCustomerInfoDialogOpen(false);
    } catch (error) {
      console.error('Error in customer info submission:', error);
      enqueueSnackbar('An error occurred. Please try again.', { variant: 'error' });
    }
  };

  const handleMemberIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerInfo(prev => ({
      ...prev,
      memberId: event.target.value
    }));
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoCodeError('Please enter a promo code');
      enqueueSnackbar('Please enter a promo code', { 
        variant: 'warning',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      });
      return;
    }

    setIsValidatingPromo(true);
    setPromoCodeError('');
    try {
      const response = await axiosInstance.post('/promos/validate', { code: promoCode });
      if (response.data.valid) {
        const discountPercent = response.data.discountPercent;
        const discountAmount = (calculateTotal() * discountPercent) / 100;
        setDiscount(discountAmount);
        setPromoCodeError('');
        enqueueSnackbar(`Promo code applied! ${discountPercent}% discount`, { 
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          }
        });
      } else {
        setDiscount(0);
        setPromoCode('');
        setPromoCodeError('Invalid promo code. Please try again.');
        enqueueSnackbar(response.data.message || 'Invalid promo code', { 
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          }
        });
      }
    } catch (error: any) {
      console.error('Error validating promo code:', error);
      setDiscount(0);
      setPromoCode('');
      const errorMessage = 'There is no such promo code. Please try again.';
      setPromoCodeError(errorMessage);
      enqueueSnackbar(errorMessage, { 
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      });
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const calculateFinalTotal = () => {
    const subtotal = calculateTotal();
    return subtotal - discount;
  };

  const handleBasePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+\.?\d{0,2}$/.test(value)) {
      const numValue = value === '' ? '' : Number(value).toString();
      setBasePrice(numValue);
    }
  };

  const validateItemName = (name: string) => {
    const isDuplicate = items.some(item => 
      item.name.toLowerCase() === name.toLowerCase()
    );
    if (isDuplicate) {
      setItemNameError('This item name already exists');
      return false;
    }
    setItemNameError('');
    return true;
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateBirthdate = (date: string) => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(date)) return false;
    
    const [month, day, year] = date.split('/').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    
    return birthDate < today && birthDate.getFullYear() > 1900;
  };

  const validatePhone = (phone: string) => {
    return /^\d+$/.test(phone);
  };

  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    
    switch (field) {
      case 'fullName':
        setFullNameError(!value.trim() ? 'Full name is required' : 
          value.trim().split(' ').length < 2 ? 'Please enter both first and last name' : '');
        break;
      case 'email':
        if (value.trim() && !validateEmail(value.trim())) {
          setEmailError('Please enter a valid email address');
        } else {
          setEmailError('');
        }
        break;
      case 'dateOfBirth':
        if (!validateBirthdate(value)) {
          setBirthdateError('Please enter a valid date in MM/DD/YYYY format');
        } else {
          setBirthdateError('');
        }
        break;
      case 'phoneNumber':
        if (value.trim() && !validatePhone(value.trim())) {
          setPhoneError('Phone number must contain only numbers');
        } else {
          setPhoneError('');
        }
        break;
    }
  };

  const renderCustomerInfoDialog = () => (
    <Dialog 
      open={customerInfoDialogOpen} 
      onClose={() => {
        if (!isTransactionStarted) {
          setCustomerInfoDialogOpen(false);
          setMemberIdError('');
          setCustomerNameError('');
          setFullNameError('');
          setEmailError('');
          setBirthdateError('');
          setPhoneError('');
          setShowNewMemberForm(false);
        }
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Customer Information</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Select Customer Type
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={isGuestOrder ? "contained" : "outlined"}
                onClick={() => {
                  handleCustomerTypeSelect(true);
                  setMemberIdError('');
                  setCustomerNameError('');
                  setFullNameError('');
                  setEmailError('');
                  setBirthdateError('');
                  setPhoneError('');
                }}
              >
                Guest
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={!isGuestOrder ? "contained" : "outlined"}
                onClick={() => {
                  handleCustomerTypeSelect(false);
                  setMemberIdError('');
                  setCustomerNameError('');
                  setFullNameError('');
                  setEmailError('');
                  setBirthdateError('');
                  setPhoneError('');
                }}
              >
                Member
              </Button>
            </Grid>
          </Grid>

          {isGuestOrder ? (
            <TextField
              fullWidth
              label="Guest Name"
              value={customerInfo.firstName}
              onChange={(e) => {
                setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }));
                setCustomerNameError('');
              }}
              margin="normal"
              required
              error={!!customerNameError}
              helperText={customerNameError}
              FormHelperTextProps={{
                sx: { color: 'error.main', fontWeight: 'bold' }
              }}
            />
          ) : showNewMemberForm ? (
            <>
              <TextField
                fullWidth
                label="Full Name"
                value={customerInfo.fullName}
                onChange={(e) => handleCustomerInfoChange('fullName', e.target.value)}
                margin="normal"
                required
                error={!!fullNameError}
                helperText={fullNameError || 'Enter both first name and last name'}
                FormHelperTextProps={{
                  sx: { color: fullNameError ? 'error.main' : 'text.secondary', fontWeight: fullNameError ? 'bold' : 'normal' }
                }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={customerInfo.email}
                onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                margin="normal"
                error={!!emailError}
                helperText={emailError || 'Enter email or phone number (at least one is required)'}
                FormHelperTextProps={{
                  sx: { color: emailError ? 'error.main' : 'text.secondary', fontWeight: emailError ? 'bold' : 'normal' }
                }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={customerInfo.phoneNumber}
                onChange={(e) => handleCustomerInfoChange('phoneNumber', e.target.value)}
                margin="normal"
                error={!!phoneError}
                helperText={phoneError || 'Enter phone number or email (at least one is required)'}
                FormHelperTextProps={{
                  sx: { color: phoneError ? 'error.main' : 'text.secondary', fontWeight: phoneError ? 'bold' : 'normal' }
                }}
              />
              <TextField
                fullWidth
                label="Date of Birth"
                type="text"
                value={customerInfo.dateOfBirth}
                onChange={(e) => handleCustomerInfoChange('dateOfBirth', e.target.value)}
                margin="normal"
                required
                placeholder="mm/dd/yyyy"
                error={!!birthdateError}
                helperText={birthdateError || 'Enter date in MM/DD/YYYY format'}
                FormHelperTextProps={{
                  sx: { color: birthdateError ? 'error.main' : 'text.secondary', fontWeight: birthdateError ? 'bold' : 'normal' }
                }}
                inputProps={{
                  maxLength: 10,
                  pattern: "\\d{2}/\\d{2}/\\d{4}"
                }}
              />
            </>
          ) : (
            <TextField
              fullWidth
              label="Member ID"
              value={customerInfo.memberId}
              onChange={handleMemberIdChange}
              margin="normal"
              error={!!memberIdError}
              helperText={memberIdError || 'Enter your membership ID'}
              required
            />
          )}

          {!isGuestOrder && !showNewMemberForm && (
            <Button
              sx={{ mt: 2 }}
              onClick={() => {
                setShowNewMemberForm(true);
                setMemberIdError('');
                setCustomerInfo(prev => ({
                  ...prev,
                  fullName: '',
                  email: '',
                  phoneNumber: '',
                  dateOfBirth: '',
                  memberId: ''
                }));
              }}
            >
              New Member? Register here
            </Button>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => {
            setCustomerInfoDialogOpen(false);
            setShowNewMemberForm(false);
            setMemberIdError('');
            setCustomerNameError('');
            setFullNameError('');
            setEmailError('');
            setBirthdateError('');
            setPhoneError('');
            setCustomerInfo({
              id: undefined,
              firstName: '',
              memberId: '',
              fullName: '',
              dateOfBirth: '',
              email: '',
              phoneNumber: '',
            });
            setIsTransactionStarted(false);
          }}
          sx={{ color: '#4d351d' }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleCustomerInfoSubmit} 
          variant="contained" 
          color="primary"
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderCustomizationDialog = () => (
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
            {selectedItem?.type !== ITEM_TYPES.DRINKS && ' (NS - No Size)'}
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
                    <MenuItem key={`${customization.id}-${option.name}`} value={option.name}>
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
  );

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #receipt-to-print, #receipt-to-print * {
              visibility: visible;
            }
            #receipt-to-print {
              position: absolute;
              left: 0;
              top: 0;
              width: 80mm;
              padding: 10mm;
            }
            .MuiDialog-root {
              position: absolute !important;
            }
          }
        `}
      </style>

      <AppBar position="static" sx={{ backgroundColor: '#4d351d', color: 'white' }} elevation={1}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              onClick={() => navigate('/admin/dashboard')}
              aria-label="back"
            >
              <ArrowBackIcon />
            </IconButton>
            <Box
              component="img"
              src="/assets/logo2.png"
              alt="Hell Week Coffee Logo"
              sx={{ height: 50 }}
            />
            <Box>
              <Typography variant="h6" component="div" fontWeight="bold">
                Hell Week Coffee
              </Typography>
              <Typography variant="subtitle2" component="div">
                Point-of-Sale System
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Typography variant="subtitle1">
              {customerInfo.firstName}
            </Typography>
            <Button 
              color="inherit" 
              onClick={() => setChangePasswordOpen(true)}
              sx={{ mr: 5 }}
            >
              Change Password
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate('/customer-management')}
              startIcon={<PersonIcon />}
              sx={{ mr: 2 }}
            >
              Customers
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

      <Box sx={{ backgroundColor: '#EEDCC6', minHeight: '100vh', mt: 0, paddingTop: 0.5 }}>
        <Container maxWidth="xl" sx={{ mt: 6, mb: 6 }}>
          {!isTransactionStarted ? (
            // Initial Transaction Screen
            <Box sx={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', mt: 4 }}>
              <Typography variant='h2'sx={{fontWeight: 'bold', color:'#230c02', mb:3}}>Point-of-Sale System</Typography>
              <Grid container spacing={2} justifyContent="center">
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={handleNewTransaction}
                    sx={{
                      width: '400px',
                      height: '300px',
                      backgroundColor: '#4d351d',
                      '&:hover': {
                        backgroundColor: '#362513',
                      },
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <ShoppingCartIcon sx={{ fontSize: 60, mb: 1 }} />
                      <Typography variant="h6">New Transaction</Typography>
                    </Box>
                  </Button>
                </Grid>
              </Grid>
            </Box>
          ) : (
            // Main POS Interface
            <>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: '#230c02', textAlign: 'center', mb: 4 }}
              >
                Point-of-Sale System
              </Typography>
              
              <Grid container spacing={3}>
                {/* Left Panel - Item Selection */}
                <Grid item xs={12} md={8} lg={9}>
                  <Paper sx={{ p: 3, height: '85vh', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                    {/* Search and Filter Section */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#230c02', mb: 2 }}>
                        Menu Items
                      </Typography>
                      <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Search for items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon sx={{ color: '#4d351d' }} />
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                backgroundColor: 'white'
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth size="small">
                            <Select
                              value={selectedType}
                              onChange={(e) => setSelectedType(e.target.value as ItemType | '')}
                              displayEmpty
                              sx={{
                                borderRadius: 1.5,
                                backgroundColor: 'white'
                              }}
                            >
                              <MenuItem value="">All Items</MenuItem>
                              {Object.values(ITEM_TYPES).map((type) => (
                                <MenuItem key={type} value={type}>
                                  {type.replace(/_/g, ' ')}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Item Type Selection */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#230c02', mb: 2 }}>
                        Select Item Type
                      </Typography>
                      <Grid container spacing={1.5}>
                        {Object.values(ITEM_TYPES).map((type) => (
                          <Grid item key={type}>
                            <Button
                              variant={selectedType === type ? 'contained' : 'outlined'}
                              onClick={() => handleTypeSelect(type)}
                              sx={{
                                minWidth: '130px',
                                height: '40px',
                                borderRadius: 1.5,
                                backgroundColor: selectedType === type ? '#4d351d' : 'transparent',
                                borderColor: '#4d351d',
                                color: selectedType === type ? 'white' : '#4d351d',
                                '&:hover': {
                                  backgroundColor: selectedType === type ? '#362513' : 'rgba(77, 53, 29, 0.1)',
                                  borderColor: '#4d351d'
                                }
                              }}
                            >
                              {type.replace(/_/g, ' ')}
                            </Button>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    {/* Item Selection */}
                    {selectedType && (
                      <Box sx={{ 
                        flex: 1,
                        overflow: 'auto',
                        backgroundColor: 'white',
                        borderRadius: 2,
                        p: 2
                      }}>
                        <Typography 
                          variant="h6" 
                          sx={{
                            color: '#4d351d',
                            fontWeight: 'bold',
                            mb: 2,
                            pl: 1
                          }}
                        > 
                          Select Item
                        </Typography>
                        <Grid container spacing={2}>
                          {filteredItems.map((item) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={item.code}>
                              <Card
                                onClick={() => handleItemSelect(item)}
                                sx={{
                                  cursor: 'pointer',
                                  height: '320px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  transition: 'all 0.2s ease',
                                  borderRadius: 2,
                                  border: selectedItem?.code === item.code ? '2px solid #4d351d' : '1px solid #f0f0f0',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                  },
                                  backgroundColor: selectedItem?.code === item.code ? '#fff5e6' : 'white'
                                }}
                              >
                                <CardMedia
                                  component="img"
                                  image={item.imageUrl || '/assets/placeholder.png'}
                                  alt={item.name}
                                  sx={{
                                    height: '180px',
                                    objectFit: 'cover',
                                    borderTopLeftRadius: 8,
                                    borderTopRightRadius: 8
                                  }}
                                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/assets/placeholder.png';
                                  }}
                                />
                                <CardContent 
                                  sx={{ 
                                    p: 2,
                                    height: '140px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                  }}
                                >
                                  <Box>
                                    <Typography 
                                      variant="subtitle1" 
                                      sx={{ 
                                        fontWeight: 'bold',
                                        color: '#4d351d',
                                        mb: 0.5,
                                        fontSize: '1rem',
                                        lineHeight: 1.2
                                      }}
                                    >
                                      {item.name}
                                    </Typography>
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        color: 'text.secondary',
                                        mb: 1,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        fontSize: '0.875rem',
                                        lineHeight: 1.3
                                      }}
                                    >
                                      {item.description || 'No description available'}
                                    </Typography>
                                  </Box>
                                  <Typography 
                                    variant="subtitle1" 
                                    sx={{ 
                                      fontWeight: 'bold',
                                      color: '#4d351d',
                                      mt: 'auto'
                                    }}
                                  >
                                    ₱{item.basePrice.toFixed(2)}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Right Panel - Order Summary */}
                <Grid item xs={12} md={4} lg={3}>
                  <Paper sx={{ p: 2, height: '85vh', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" gutterBottom fontWeight='bold' sx={{color:'#230c02'}}>
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
                                <Typography variant="subtitle2">
                                  {orderItem.item.name}
                                  {` (${orderItem.item.type === ITEM_TYPES.DRINKS ? orderItem.size : 'NS'})`}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography variant="body2" color="text.secondary">
                                    ₱{orderItem.totalPrice.toFixed(2)}
                                  </Typography>
                                  {orderItem.customizations.map((customization, idx) => (
                                    <Typography key={idx} variant="caption" display="block" color="text.secondary">
                                      + {customization.name}: {customization.option}
                                    </Typography>
                                  ))}
                                </>
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
            </>
          )}

          {/* Customization Dialog */}
          {renderCustomizationDialog()}

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
                    Subtotal: ₱{calculateTotal().toFixed(2)}
                  </Typography>

                  {/* Add Promo Code Section */}
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Have a promo code?
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField
                        size="small"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          setPromoCodeError(''); // Clear error when user types
                        }}
                        disabled={isValidatingPromo}
                        sx={{ flex: 1 }}
                        error={!!promoCodeError}
                        helperText={promoCodeError}
                      />
                      <Button
                        variant="contained"
                        onClick={handleApplyPromoCode}
                        disabled={isValidatingPromo || !promoCode.trim()}
                        sx={{ minWidth: '100px' }}
                      >
                        {isValidatingPromo ? 'Validating...' : 'Apply'}
                      </Button>
                    </Box>
                  </Box>

                  {discount > 0 && (
                    <Typography variant="h6" align="right" color="success.main">
                      Discount: -₱{discount.toFixed(2)}
                    </Typography>
                  )}

                  <Typography variant="h5" align="right" sx={{ mt: 1, fontWeight: 'bold' }}>
                    Total Amount: ₱{calculateFinalTotal().toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setIsReceiptDialogOpen(false);
                setPromoCode('');
                setDiscount(0);
              }}>Close</Button>
              <Button onClick={handlePrintReceipt} variant="contained" color="primary" startIcon={<ReceiptIcon />}>
                Print Receipt
              </Button>
            </DialogActions>
          </Dialog>

          {/* Customer Information Dialog */}
          {renderCustomerInfoDialog()}

          {/* Cancel Transaction Dialog */}
          <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
            <DialogTitle>Cancel Transaction</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to cancel this transaction?</Typography>
              <Typography color="error" sx={{ mt: 2, fontSize: '0.9rem' }}>
                You'll be logged out from the pos page
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCancelDialogOpen(false)}>No</Button>
              <Button onClick={handleCancelTransaction} color="error">Yes</Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
      <ChangePasswordDialog 
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </>
  );
};

export default POS;
