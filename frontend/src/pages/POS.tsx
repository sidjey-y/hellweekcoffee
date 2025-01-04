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
  colors,
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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useSnackbar } from 'notistack';
import { Item, ItemType, ITEM_TYPES, Size } from '../types/item';
import { Category } from '../types/category';
import { itemsAPI, customizationAPI, categoriesAPI, customerAPI, transactionAPI } from '../services/api';
import { axiosInstance } from '../utils/axios';

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

const POS = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [isTransactionStarted, setIsTransactionStarted] = useState(false);
  const [customerInfoDialogOpen, setCustomerInfoDialogOpen] = useState(false);
  const [isGuestOrder, setIsGuestOrder] = useState(true);
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
      
      // Filter customizations based on the item's category type
      const filteredCustomizations = customizations.filter((c: Customization) => {
        console.log('Checking customization:', {
          id: c.id,
          name: c.name,
          categoryType: c.categoryType,
          itemCategory: item.category.type,
          active: c.active
        });
        // Convert both to strings for comparison since they're from different enums
        return c.categoryType.toString() === item.category.type.toString() && c.active;
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

    // Convert selected customizations to order customizations
    const orderCustomizations = Object.entries(selectedCustomizations)
      .filter(([_, value]) => value) // Filter out empty selections
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
      size: isValidSize(size) ? size : undefined,
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
    try {
      // Create print window
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Could not open print window');
      }

      // Create the receipt content
      const orderItemsHtml = orderItems.map(item => {
        const customizationsHtml = item.customizations
          .map(c => `<p style="margin-left: 20px; margin-top: 0; margin-bottom: 5px;">+ ${c.name}: ${c.option} (₱${c.price.toFixed(2)})</p>`)
          .join('');

        return `
          <div style="margin: 10px 0;">
            <p style="margin: 0;">${item.quantity}x ${item.item.name} ${item.size ? `(${item.size})` : ''}</p>
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

      // Write and print
      printWindow.document.write(receiptHtml);
      printWindow.document.close();

      // Complete transaction
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
    if (!validateCustomerInfo()) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
      return;
    }

    try {
      if (isGuestOrder) {
        try {
          // Create guest customer
          const guestCustomer = await customerAPI.createCustomer({
            firstName: customerInfo.firstName,
            lastName: '',  // For guests, we only need first name
            dateOfBirth: new Date().toISOString().split('T')[0], // Current date as default
          });
          setCustomerInfo(prev => ({
            ...prev,
            id: guestCustomer.id
          }));
          setCustomerInfoDialogOpen(false);
          enqueueSnackbar('Guest customer added successfully', { variant: 'success' });
        } catch (error) {
          console.error('Error creating guest customer:', error);
          enqueueSnackbar('Failed to create guest customer. Please try again.', { variant: 'error' });
          return;
        }
      } else if (showNewMemberForm) {
        // Basic validation for required fields
        if (!customerInfo.fullName?.trim()) {
          enqueueSnackbar('Please enter your name', { variant: 'error' });
          return;
        }

        // Split full name - more lenient now, just needs at least one word
        const nameParts = customerInfo.fullName.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        // Validate that at least email or phone is provided
        if (!customerInfo.email && !customerInfo.phoneNumber) {
          enqueueSnackbar('Please provide either an email or phone number', { variant: 'error' });
          return;
        }

        // Email validation only if email is provided
        if (customerInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
          enqueueSnackbar('Please enter a valid email address', { variant: 'error' });
          return;
        }

        // Phone validation only if phone is provided
        if (customerInfo.phoneNumber && !/^\+?[\d\s-]{7,}$/.test(customerInfo.phoneNumber)) {
          enqueueSnackbar('Please enter a valid phone number (at least 7 digits)', { variant: 'error' });
          return;
        }

        // Date validation
        if (!customerInfo.dateOfBirth) {
          enqueueSnackbar('Please enter your date of birth', { variant: 'error' });
          return;
        }

        try {
          // Parse date more flexibly - accept both MM/DD/YYYY and YYYY-MM-DD formats
          let formattedDate;
          if (customerInfo.dateOfBirth.includes('/')) {
            const [month, day, year] = customerInfo.dateOfBirth.split('/');
            formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          } else if (customerInfo.dateOfBirth.includes('-')) {
            formattedDate = customerInfo.dateOfBirth; // Already in YYYY-MM-DD format
          } else {
            enqueueSnackbar('Please enter date in MM/DD/YYYY format', { variant: 'error' });
            return;
          }

          // Validate date is valid
          if (isNaN(Date.parse(formattedDate))) {
            enqueueSnackbar('Please enter a valid date', { variant: 'error' });
            return;
          }

          // Show loading message
          enqueueSnackbar('Registering new member...', { 
            variant: 'info',
            autoHideDuration: 2000
          });

          // Register new member
          const newMember = await customerAPI.registerMember({
            firstName: firstName,
            lastName: lastName || firstName, // Use firstName as lastName if no lastName provided
            email: customerInfo.email || '',
            phone: customerInfo.phoneNumber || '',
            dateOfBirth: formattedDate,
          });

          console.log('Registration successful:', newMember);

          if (!newMember || !newMember.id) {
            enqueueSnackbar('Failed to create member: Invalid server response', { 
              variant: 'error',
              autoHideDuration: 4000
            });
            return;
          }

          // Update customer info with the new member data
          setCustomerInfo(prev => ({
            ...prev,
            id: newMember.id,
            memberId: newMember.membershipId,
            firstName: newMember.firstName,
            fullName: `${newMember.firstName} ${newMember.lastName}`,
          }));

          // Show success message
          if (newMember.emailError) {
            enqueueSnackbar(`New member registered successfully! Membership ID: ${newMember.membershipId}. Note: Welcome email could not be sent.`, { 
              variant: 'warning',
              autoHideDuration: 8000
            });
          } else {
            enqueueSnackbar(`New member registered successfully! Membership ID: ${newMember.membershipId}`, { 
              variant: 'success',
              autoHideDuration: 6000
            });
          }

          // Close the dialog after successful registration
          setCustomerInfoDialogOpen(false);
          setShowNewMemberForm(false);

        } catch (error: any) {
          console.error('Error registering new member:', error);
          
          let errorMessage = 'Failed to register member. Please try again.';
          let additionalMessage: string | null = null;

          if (error.response?.status === 500) {
            // Check if this is a mail error but member was created
            if (error.response.data?.customer && error.response.data?.error?.includes('MailAuthenticationException')) {
              const customer = error.response.data.customer;
              // Update customer info
              setCustomerInfo(prev => ({
                ...prev,
                id: customer.id,
                memberId: customer.membershipId,
                firstName: customer.firstName,
                fullName: `${customer.firstName} ${customer.lastName}`,
              }));
              
              enqueueSnackbar(`New member registered successfully! Membership ID: ${customer.membershipId}. Note: Welcome email could not be sent.`, { 
                variant: 'warning',
                autoHideDuration: 8000
              });
              
              // Close dialogs since registration was successful
              setCustomerInfoDialogOpen(false);
              setShowNewMemberForm(false);
              return;
            }
            
            errorMessage = 'Server error: ' + (error.response.data?.message || 'An internal server error occurred');
            additionalMessage = 'Please contact support if the problem persists.';
          } else if (error.response?.status === 400) {
            errorMessage = 'Invalid member data: ' + (error.response.data?.message || 'Please check your input');
          } else if (error.response?.status === 409) {
            errorMessage = 'Member already exists: ' + (error.response.data?.message || 'Please try with different details');
          } else if (error.message) {
            errorMessage = error.message;
          }
            
          // Show the main error message
          enqueueSnackbar(errorMessage, { 
            variant: 'error',
            autoHideDuration: 4000
          });

          // Show additional message if exists
          if (additionalMessage) {
            setTimeout(() => {
              enqueueSnackbar(additionalMessage, {
                variant: 'warning',
                autoHideDuration: 4000
              });
            }, 1000);
          }
        }
      } else {
        // Verify existing member
        if (!customerInfo.memberId) {
          enqueueSnackbar('Please enter a membership ID', { variant: 'error' });
          setMemberIdError('Please enter a membership ID');
          return;
        }

        try {
          const memberResponse = await customerAPI.getCustomerByMemberId(customerInfo.memberId);
          if (!memberResponse || !memberResponse.id) {
            const errorMsg = 'Membership ID wrong please try again';
            enqueueSnackbar(errorMsg, { variant: 'error' });
            setMemberIdError(errorMsg);
            setCustomerInfo(prev => ({
              ...prev,
              memberId: ''  // Clear the membership ID field
            }));
            return;
          }
          setMemberIdError(''); // Clear error on success
          setCustomerInfo(prev => ({
            ...prev,
            id: memberResponse.id,
            firstName: memberResponse.firstName,
            fullName: `${memberResponse.firstName} ${memberResponse.lastName}`,
            email: memberResponse.email || '',
            phoneNumber: memberResponse.phone || '',
            dateOfBirth: memberResponse.birthDate || '',
          }));
          setCustomerInfoDialogOpen(false);
          enqueueSnackbar('Member found successfully', { variant: 'success' });
        } catch (error) {
          console.error('Error verifying member:', error);
          const errorMsg = 'Membership ID wrong please try again';
          enqueueSnackbar(errorMsg, { variant: 'error' });
          setMemberIdError(errorMsg);
          setCustomerInfo(prev => ({
            ...prev,
            memberId: ''  // Clear the membership ID field
          }));
          return;
        }
      }
    } catch (error) {
      console.error('Error handling customer:', error);
      enqueueSnackbar('An unexpected error occurred. Please try again.', { variant: 'error' });
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
      enqueueSnackbar('Please enter a promo code', { variant: 'warning' });
      return;
    }

    setIsValidatingPromo(true);
    try {
      const response = await axiosInstance.post('/promos/validate', { code: promoCode });
      if (response.data.valid) {
        const discountPercent = response.data.discountPercent;
        const discountAmount = (calculateTotal() * discountPercent) / 100;
        setDiscount(discountAmount);
        enqueueSnackbar(`Promo code applied! ${discountPercent}% discount`, { variant: 'success' });
      } else {
        setDiscount(0);
        enqueueSnackbar(response.data.message || 'Invalid promo code', { variant: 'error' });
      }
    } catch (error: any) {
      console.error('Error validating promo code:', error);
      setDiscount(0);
      enqueueSnackbar(error.response?.data?.message || 'Invalid promo code', { variant: 'error' });
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const calculateFinalTotal = () => {
    const subtotal = calculateTotal();
    return subtotal - discount;
  };

  // Customer Information Dialog
  const renderCustomerInfoDialog = () => (
    <Dialog 
      open={customerInfoDialogOpen} 
      onClose={() => {
        // Only allow closing if it's not a new transaction
        if (!isTransactionStarted) {
          setCustomerInfoDialogOpen(false);
          setMemberIdError('');
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
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
              margin="normal"
              required
            />
          ) : showNewMemberForm ? (
            <>
              <TextField
                fullWidth
                label="Full Name"
                value={customerInfo.fullName}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, fullName: e.target.value }))}
                margin="normal"
                required
                helperText="Enter both first name and last name"
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                margin="normal"
                helperText="Enter email or phone number (at least one is required)"
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={customerInfo.phoneNumber}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phoneNumber: e.target.value }))}
                margin="normal"
                helperText="Enter phone number or email (at least one is required)"
              />
              <TextField
                fullWidth
                label="Date of Birth"
                type="text"
                value={customerInfo.dateOfBirth}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                margin="normal"
                required
                placeholder="mm/dd/yyyy"
                helperText="Enter date in MM/DD/YYYY format"
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
                // Reset form when switching to registration
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
            if (!isTransactionStarted) {
              setCustomerInfoDialogOpen(false);
              setShowNewMemberForm(false);
              setMemberIdError('');
              // Reset form
              setCustomerInfo({
                id: undefined,
                firstName: '',
                memberId: '',
                fullName: '',
                dateOfBirth: '',
                email: '',
                phoneNumber: '',
              });
            }
          }}
          disabled={isTransactionStarted}
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
                    <Box
                      component="img"
                      src="/assets/logo2.png"
                      alt="Hell Week Coffee Logo"
                      sx={{ height: 50 }} 
                    />
          <Typography variant="h6" component="div" fontWeight='bold'>
            Hell Week Coffee
          </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              color="inherit"
              onClick={() => navigate('/customers')}
              startIcon={<PersonIcon />}
            >
              Customer Management
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
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {!isTransactionStarted ? (
          // Initial Transaction Screen
          <Box sx={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', mt: 4 }}>
            <Typography variant='h2'sx={{fontWeight: 'bold', color:'#230c02', mb:3}}>Point-of-Sale System</Typography>
            <Box sx={{ display: 'flex' , flexDirection:'row', gap: 3 }}>
            <Button
            variant="outlined"
            size="large"
            onClick={handleCancelTransaction}
            sx={{
              width: '300px',
              height: '200px',
              backgroundColor: '#FFF5E9',
              borderColor: '#4d351d',
              color: '#230c02',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
          <CancelIcon sx={{ fontSize: '70px', color: '#4d351d', mb: 1 }} />
          Cancel Transaction
          </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleNewTransaction}
              sx={{
                width: '300px',
                height: '200px',
                backgroundColor: '#4d351d',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: '70px', color: 'white', mb: 1 }} />
              New Transaction
            </Button>
        </Box>
        </Box>
        ) : (
          
          // Main POS Interface
          
      <Container maxWidth="xl" sx={{ mt: 0, mb: 4 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: '#230c02', textAlign: 'center', mb: 4 }}
          >
            Point-of-Sale System
          </Typography>
          <Grid container spacing={3}>
            {/* Left Panel - Menu Selection */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, height: '80vh', display: 'flex', flexDirection: 'column' }}>
                {/* Customer Type Selection */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom fontWeight='bold' sx={{color:'#230c02'}}>
                    Customer Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
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
                  <Typography variant="h6" gutterBottom fontWeight='bold' sx={{color:'#230c02'}}>
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
                    <Typography variant="h6" gutterBottom fontWeight='bold' sx={{color:'#230c02'}}> 
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
                              <Typography variant="subtitle1" gutterBottom fontWeight='bold'>
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
                              {orderItem.size && ` (${orderItem.size})`}
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
          </Container>
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
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      disabled={isValidatingPromo}
                      sx={{ flex: 1 }}
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
      </Container>
      </Box>
    </>
  );
};

export default POS;
