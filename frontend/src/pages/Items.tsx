import React, { useState, useEffect, useRef } from 'react';
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
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useSnackbar } from 'notistack';
import { RootState } from '../store';
import { 
  Item, 
  ItemType, 
  ITEM_TYPES, 
  ItemRequest, 
  isDrinkType,
  isFoodType,
  calculateSizePrices,
  Size,
  CategoryType,
  CATEGORY_TYPES
} from '../types/item';
import { Category } from '../types/category';
import { itemsAPI, categoriesAPI, customizationAPI } from '../services/api';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import FilterListIcon from '@mui/icons-material/FilterList';
import Papa from 'papaparse';

interface CSVRow {
  name: string;
  type: string;
  basePrice: string;
  categoryId: string;
  description: string;
  active: string;
  smallPrice?: string;
  mediumPrice?: string;
  largePrice?: string;
}

interface ParseResult {
  data: CSVRow[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  border: '1px solid #ddd',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: 'calc(100vh - 250px)',
  '& .MuiTableHead-root': {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    '& .MuiTableCell-root': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      fontWeight: 'bold',
    },
  },
  '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
  '& .MuiTableBody-root .MuiTableRow-root:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
})) as typeof TableContainer;

interface ItemFormData {
  name: string;
  type: ItemType;
  basePrice: number;
  categoryId: string;
  description: string;
  sizePrices: Record<Size, number>;
  active: boolean;
  availableCustomizations: number[];
}

const defaultSizePrices: Record<Size, number> = {
  SMALL: 0,
  MEDIUM: 0,
  LARGE: 0
};

const defaultFormData: ItemFormData = {
  name: '',
  type: ITEM_TYPES.DRINKS,
  basePrice: 0,
  categoryId: '',
  description: '',
  sizePrices: defaultSizePrices,
  active: true,
  availableCustomizations: [],
};

const generateItemCode = (categoryId: CategoryType, name: string, existingItems: Item[]): string => {
  const prefix = categoryId.substring(0, 2).toUpperCase();
  const namePrefix = name.substring(0, 2).toUpperCase();
  let counter = 1;
  
  let code: string;
  do {
    code = `${prefix}${namePrefix}${counter.toString().padStart(3, '0')}`;
    counter++;
  } while (existingItems.some(item => item.code === code));
  
  return code;
};

type CategoryTypeValue = keyof typeof CATEGORY_TYPES;

// Add this interface for customizations
interface Customization {
  id: number;
  name: string;
  options: Array<{
    id: number;
    name: string;
    price: number;
  }>;
}

interface CustomizationResponse {
  id: string | number;
  name: string;
  options: Array<{
    id: string | number;
    name: string;
    price: number;
  }>;
}

interface CustomizationOption {
  id: number;
  name: string;
  price: number;
}

interface CustomizationFormData {
  id: number;
  name: string;
  options: CustomizationOption[];
}

const Items: React.FC = () => {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [confirmItemCode, setConfirmItemCode] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [availableCustomizations, setAvailableCustomizations] = useState<Customization[]>([]);
  const [customizationDialogOpen, setCustomizationDialogOpen] = useState(false);
  const [selectedItemForCustomization, setSelectedItemForCustomization] = useState<Item | null>(null);
  const [customizationFormData, setCustomizationFormData] = useState<CustomizationFormData[]>([]);
  const [nameError, setNameError] = useState<string>('');
  const [itemNameError, setItemNameError] = useState('');
  const { user } = useSelector((state: RootState) => state.auth);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [showCsvErrorDialog, setShowCsvErrorDialog] = useState(false);
  const [priceError, setPriceError] = useState('');
  const [editConfirmDialogOpen, setEditConfirmDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  const [confirmEditItemCode, setConfirmEditItemCode] = useState('');
  const [deleteCodeError, setDeleteCodeError] = useState('');
  const [editCodeError, setEditCodeError] = useState('');

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      // Convert string IDs to numbers
      const customizationIds = selectedItem.availableCustomizations?.map(c => {
        const id = typeof c.id === 'string' ? parseInt(c.id, 10) : c.id;
        return isNaN(id) ? 0 : id; // Fallback to 0 if parsing fails
      }) || [];
      
      setFormData({
        name: selectedItem.name,
        type: selectedItem.type,
        basePrice: selectedItem.basePrice,
        categoryId: selectedItem.category.id,
        description: selectedItem.description || '',
        sizePrices: selectedItem.sizePrices,
        active: selectedItem.active,
        availableCustomizations: customizationIds
      });
    } else {
      setFormData({
        ...defaultFormData,
        sizePrices: calculateSizePrices(defaultFormData.basePrice)
      });
    }
  }, [selectedItem]);

  const fetchItems = async () => {
    try {
      console.log('Fetching items...');
      const data = await itemsAPI.getItems();
      console.log('Items fetched:', data);
      setItems(data);
    } catch (error: any) {
      console.error('Error fetching items:', error);
      enqueueSnackbar(error.message || 'Failed to fetch items. Please check your connection and try again.', { 
        variant: 'error',
        autoHideDuration: 5000,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      enqueueSnackbar('Failed to fetch categories', { variant: 'error' });
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

  const handleEditClick = (item: Item) => {
    setItemToEdit(item);
    setConfirmEditItemCode('');
    setEditCodeError('');
    setEditConfirmDialogOpen(true);
  };

  const handleEditConfirm = () => {
    if (!itemToEdit) return;

    if (confirmEditItemCode !== itemToEdit.code) {
      setEditCodeError('Item code does not match');
      return;
    }

    setEditConfirmDialogOpen(false);
    setDialogMode('edit');
    setSelectedItem(itemToEdit);
    setFormData({
      name: itemToEdit.name,
      type: itemToEdit.type,
      basePrice: itemToEdit.basePrice,
      categoryId: itemToEdit.category.id,
      description: itemToEdit.description || '',
      sizePrices: itemToEdit.sizePrices,
      active: itemToEdit.active,
      availableCustomizations: itemToEdit.availableCustomizations?.map(c => 
        typeof c.id === 'string' ? parseInt(c.id, 10) : c.id
      ) || []
    });
    setOpenDialog(true);
    setItemToEdit(null);
    setConfirmEditItemCode('');
    setEditCodeError('');
  };

  const handleDeleteClick = (item: Item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
    setConfirmItemCode('');
    setDeleteCodeError('');
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    if (confirmItemCode !== itemToDelete.code) {
      setDeleteCodeError('Item code does not match');
      return;
    }

    try {
      await itemsAPI.deleteItem(itemToDelete.code);
      setItems(items.filter(item => item.code !== itemToDelete.code));
      enqueueSnackbar('Item deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setConfirmItemCode('');
      setDeleteCodeError('');
    } catch (error) {
      console.error('Error deleting item:', error);
      enqueueSnackbar('Failed to delete item', { variant: 'error' });
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedItem(null);
    setNameError('');
  };

  const handleTextFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'basePrice') {
      const basePrice = Number(value);
      setFormData(prev => ({
        ...prev,
        basePrice,
        sizePrices: isDrinkType(prev.type) ? calculateSizePrices(basePrice) : { ...defaultSizePrices }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'quantity' ? Number(value) : value
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name === 'type') {
      const type = value as ItemType;
      setFormData(prev => ({
        ...prev,
        type,
        categoryId: '', // Reset category when type changes
        sizePrices: isDrinkType(type) ? calculateSizePrices(prev.basePrice) : { ...defaultSizePrices }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveItem = async () => {
    setNameError('');

    if (!formData.name || !formData.type || !formData.categoryId || formData.basePrice <= 0) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
      return;
    }

    try {
      // Check for existing items with the same name (case-insensitive)
      const existingItem = items.find(
        item => item.name.toLowerCase() === formData.name.toLowerCase() && 
        (!selectedItem || item.code !== selectedItem.code)
      );

      if (existingItem) {
        setNameError('An item with this name already exists');
        return;
      }

      const itemData: ItemRequest = {
        name: formData.name,
        type: formData.type,
        basePrice: formData.basePrice,
        categoryId: formData.categoryId,
        description: formData.description,
        sizePrices: formData.sizePrices,
        active: formData.active,
        availableCustomizations: formData.availableCustomizations,
      };

      if (dialogMode === 'edit' && selectedItem) {
        await itemsAPI.updateItem(selectedItem.code, itemData);
        enqueueSnackbar('Item updated successfully', { variant: 'success' });
      } else {
        const code = generateItemCode(formData.categoryId as CategoryType, formData.name, items);
        await itemsAPI.createItem({ ...itemData, code });
        enqueueSnackbar('Item created successfully', { variant: 'success' });
      }

      setOpenDialog(false);
      fetchItems();
    } catch (error) {
      console.error('Error saving item:', error);
      enqueueSnackbar('Failed to save item', { variant: 'error' });
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || item.category.id === categoryFilter;
    const matchesType = !typeFilter || item.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setCsvErrors([]);
    Papa.parse<CSVRow>(file, {
      header: true,
      complete: async (results: ParseResult) => {
        try {
          let successCount = 0;
          let errorCount = 0;
          const errors: string[] = [];

          for (const row of results.data) {
            try {
              // Check for duplicate item names
              const isDuplicate = items.some(item => 
                item.name.toLowerCase() === row.name.toLowerCase()
              );

              if (isDuplicate) {
                errors.push(`Item "${row.name}" already exists in the table`);
                errorCount++;
                continue;
              }

              const type = row.type.toUpperCase() as ItemType;
              const basePrice = parseFloat(row.basePrice);
              
              const sizePrices: Record<Size, number> = type === ITEM_TYPES.DRINKS ? {
                SMALL: parseFloat(row.smallPrice || row.basePrice),
                MEDIUM: parseFloat(row.mediumPrice || row.basePrice),
                LARGE: parseFloat(row.largePrice || row.basePrice)
              } : defaultSizePrices;

              const itemData: ItemRequest = {
                name: row.name,
                type,
                basePrice,
                categoryId: row.categoryId,
                description: row.description || '',
                active: row.active.toLowerCase() === 'true',
                sizePrices,
                availableCustomizations: []
              };

              const code = generateItemCode(row.categoryId as CategoryType, row.name, items);
              await itemsAPI.createItem({ ...itemData, code });
              successCount++;
            } catch (error) {
              console.error('Error importing row:', row, error);
              errors.push(`Failed to import "${row.name}": ${error}`);
              errorCount++;
            }
          }

          // Set errors and show dialog if there are any
          if (errors.length > 0) {
            setCsvErrors(errors);
            setShowCsvErrorDialog(true);
          }

          // Refresh the items list
          await fetchItems();
          
          // Show results
          enqueueSnackbar(
            `Import completed: ${successCount} items added, ${errorCount} failed`,
            { variant: successCount > 0 ? 'success' : 'warning' }
          );
        } catch (error) {
          console.error('Error processing CSV:', error);
          enqueueSnackbar('Failed to process CSV file', { variant: 'error' });
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      },
      error: (error: Error | Papa.ParseError) => {
        console.error('Error parsing CSV:', error);
        enqueueSnackbar('Failed to parse CSV file', { variant: 'error' });
        setIsImporting(false);
      }
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleCustomizationSelect = (customizationId: number, selected: boolean) => {
    setFormData(prev => ({
      ...prev,
      availableCustomizations: selected
        ? [...prev.availableCustomizations, customizationId]
        : prev.availableCustomizations.filter(id => id !== customizationId)
    }));
  };

  const renderCustomizationSelect = () => (
    <FormControl fullWidth margin="normal">
      <InputLabel>Available Customizations</InputLabel>
      <Select
        multiple
        value={formData.availableCustomizations}
        onChange={(e) => {
          const values = e.target.value as (string | number)[];
          const selected = values.map(v => typeof v === 'string' ? parseInt(v) : v);
          setFormData(prev => ({
            ...prev,
            availableCustomizations: selected
          }));
        }}
      >
        {availableCustomizations.map((customization: Customization) => (
          <MenuItem key={customization.id} value={customization.id}>
            {customization.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  // Add fetchCustomizations function
  const fetchCustomizations = async () => {
    try {
      const customizations = await customizationAPI.getCustomizations();
      setAvailableCustomizations(customizations.map((c: CustomizationResponse) => ({
        id: typeof c.id === 'string' ? parseInt(c.id, 10) : c.id,
        name: c.name,
        options: c.options.map(o => ({
          id: typeof o.id === 'string' ? parseInt(o.id, 10) : o.id,
          name: o.name,
          price: o.price
        }))
      })));
    } catch (error) {
      console.error('Error fetching customizations:', error);
      enqueueSnackbar('Failed to fetch customizations', { variant: 'error' });
    }
  };

  // Add useEffect to fetch customizations
  useEffect(() => {
    fetchCustomizations();
  }, []);

  const handleCustomizationClick = async (item: Item) => {
    setSelectedItemForCustomization(item);
    try {
      const customizations = await customizationAPI.getCustomizationsByCategory(item.category.type);
      let initialCustomizations = customizations.map((c: CustomizationResponse) => ({
        id: typeof c.id === 'string' ? parseInt(c.id, 10) : c.id,
        name: c.name,
        options: c.options.map((o: { id: string | number; name: string; price: number }) => ({
          id: typeof o.id === 'string' ? parseInt(o.id, 10) : o.id,
          name: o.name,
          price: o.price
        }))
      }));

      // If there are no customizations, initialize with one empty customization
      if (initialCustomizations.length === 0) {
        initialCustomizations = [{
          id: Date.now(),
          name: '',
          options: [{ id: Date.now(), name: '', price: 0 }]
        }];
      }

      setCustomizationFormData(initialCustomizations);
      setCustomizationDialogOpen(true);
    } catch (error) {
      console.error('Error fetching customizations:', error);
      enqueueSnackbar('Failed to fetch customizations', { variant: 'error' });
    }
  };

  const handleAddCustomizationOption = (customizationIndex: number) => {
    setCustomizationFormData(prev => {
      const updated = [...prev];
      const currentOptions = updated[customizationIndex].options;
      
      if (currentOptions.length >= 5) {
        enqueueSnackbar('Maximum of 5 options allowed per customization', { variant: 'warning' });
        return prev;
      }

      updated[customizationIndex] = {
        ...updated[customizationIndex],
        options: [
          ...currentOptions,
          { id: Date.now(), name: '', price: 0 }
        ]
      };
      return updated;
    });
  };

  const handleRemoveCustomizationOption = (customizationIndex: number, optionIndex: number) => {
    setCustomizationFormData(prev => {
      const updated = [...prev];
      updated[customizationIndex] = {
        ...updated[customizationIndex],
        options: updated[customizationIndex].options.filter((_, i) => i !== optionIndex)
      };
      return updated;
    });
  };

  const handleCustomizationChange = (
    customizationIndex: number,
    field: string,
    value: string | number
  ) => {
    setCustomizationFormData(prev => {
      const updated = [...prev];
      updated[customizationIndex] = {
        ...updated[customizationIndex],
        [field]: value
      };
      return updated;
    });
  };

  const handleOptionChange = (
    customizationIndex: number,
    optionIndex: number,
    field: string,
    value: string | number
  ) => {
    if (field === 'price') {
      const priceValue = value.toString();
      
      // Allow empty input
      if (priceValue === '') {
        setCustomizationFormData(prev => {
          const updated = [...prev];
          updated[customizationIndex] = {
            ...updated[customizationIndex],
            options: updated[customizationIndex].options.map((opt, i) => 
              i === optionIndex ? { ...opt, price: 0 } : opt
            )
          };
          return updated;
        });
        return;
      }

      // Check for negative numbers
      if (priceValue.startsWith('-')) {
        enqueueSnackbar('Price cannot be negative', { variant: 'error' });
        return;
      }

      // Remove leading zeros and validate decimal format
      if (/^\d*\.?\d{0,2}$/.test(priceValue)) {
        const numValue = priceValue.replace(/^0+(?=\d)/, '');
        const price = Number(numValue);
        
        setCustomizationFormData(prev => {
          const updated = [...prev];
          updated[customizationIndex] = {
            ...updated[customizationIndex],
            options: updated[customizationIndex].options.map((opt, i) => 
              i === optionIndex ? { ...opt, price } : opt
            )
          };
          return updated;
        });
      }
    } else {
      setCustomizationFormData(prev => {
        const updated = [...prev];
        updated[customizationIndex] = {
          ...updated[customizationIndex],
          options: updated[customizationIndex].options.map((opt, i) => 
            i === optionIndex ? { ...opt, [field]: value } : opt
          )
        };
        return updated;
      });
    }
  };

  const handleAddNewCustomization = () => {
    setCustomizationFormData(prev => [
      ...prev,
      {
        id: Date.now(), // Temporary ID for new customization
        name: '',
        options: [{ id: Date.now(), name: '', price: 0 }]
      }
    ]);
  };

  const handleSaveCustomizations = async () => {
    try {
      // Validate customizations
      for (const customization of customizationFormData) {
        if (!customization.name.trim()) {
          enqueueSnackbar('Customization name cannot be empty', { variant: 'error' });
          return;
        }
        for (const option of customization.options) {
          if (!option.name.trim()) {
            enqueueSnackbar('Option name cannot be empty', { variant: 'error' });
            return;
          }
          if (option.price < 0) {
            enqueueSnackbar('Option price cannot be negative', { variant: 'error' });
            return;
          }
        }
      }

      const savedCustomizationIds: number[] = [];

      // Save customizations
      for (const customization of customizationFormData) {
        if (!selectedItemForCustomization) {
          throw new Error('No item selected for customization');
        }

        const customizationData = {
          name: customization.name,
          categoryType: selectedItemForCustomization.category.type,
          options: customization.options.map(opt => ({
            name: opt.name,
            price: opt.price
          }))
        };

        try {
          let savedCustomization;
          if (customization.id.toString().length > 10) {
            savedCustomization = await customizationAPI.createCustomization(customizationData);
          } else {
            savedCustomization = await customizationAPI.updateCustomization(customization.id, customizationData);
          }
          savedCustomizationIds.push(savedCustomization.id);
        } catch (error) {
          console.error('Error saving customization:', error);
          throw error;
        }
      }

      // Update item's available customizations
      if (selectedItemForCustomization) {
        const updatedItemData: ItemRequest = {
          name: selectedItemForCustomization.name,
          type: selectedItemForCustomization.type,
          basePrice: selectedItemForCustomization.basePrice,
          categoryId: selectedItemForCustomization.category.id,
          description: selectedItemForCustomization.description || '',
          sizePrices: selectedItemForCustomization.sizePrices,
          active: selectedItemForCustomization.active,
          availableCustomizations: savedCustomizationIds
        };
        await itemsAPI.updateItem(selectedItemForCustomization.code, updatedItemData);
        
        // Refresh items list
        await fetchItems();
      }

      setCustomizationDialogOpen(false);
      enqueueSnackbar('Customizations saved successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error saving customizations:', error);
      enqueueSnackbar('Failed to save customizations', { variant: 'error' });
    }
  };

  // Modify the table cell for customization icon
  const renderCustomizationCell = (item: Item) => {
    // Only show customization icon for DRINKS and FOOD items
    if (!isDrinkType(item.type) && !isFoodType(item.type)) {
      return <TableCell />; // Empty cell for non-customizable categories
    }

    return (
      <TableCell>
        <IconButton
          onClick={() => handleCustomizationClick(item)}
          color="primary"
          size="small"
          title="Manage Customizations"
        >
          <SettingsIcon />
          {item.availableCustomizations && item.availableCustomizations.length > 0 && (
            <Typography variant="caption" sx={{ ml: 0.5 }}>
              ({item.availableCustomizations.length})
            </Typography>
          )}
        </IconButton>
      </TableCell>
    );
  };

  // Add the handleDeleteCustomization function
  const handleDeleteCustomization = async (index: number) => {
    try {
      if (!selectedItemForCustomization) {
        throw new Error('No item selected for customization');
      }

      // Get the customization being deleted
      const customizationToDelete = customizationFormData[index];

      // Remove from form data
      setCustomizationFormData(prev => prev.filter((_, i) => i !== index));

      // Update the item's available customizations
      const availableCustomizations = selectedItemForCustomization.availableCustomizations || [];
      const updatedCustomizations = availableCustomizations.filter(
        c => Number(c.id) !== customizationToDelete.id
      );

      // Update the item with the new customizations list
      const updatedItemData: ItemRequest = {
        name: selectedItemForCustomization.name,
        type: selectedItemForCustomization.type,
        basePrice: selectedItemForCustomization.basePrice,
        categoryId: selectedItemForCustomization.category.id,
        description: selectedItemForCustomization.description || '',
        sizePrices: selectedItemForCustomization.sizePrices,
        active: selectedItemForCustomization.active,
        availableCustomizations: updatedCustomizations.map(c => typeof c.id === 'string' ? parseInt(c.id, 10) : c.id)
      };

      // Delete the customization from the API
      try {
        await customizationAPI.updateCustomization(customizationToDelete.id, {
          active: false
        });
      } catch (error) {
        console.error('Error deactivating customization:', error);
      }

      await itemsAPI.updateItem(selectedItemForCustomization.code, updatedItemData);
      
      // Refresh items list to reflect changes
      await fetchItems();
      
      enqueueSnackbar('Customization deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting customization:', error);
      enqueueSnackbar('Failed to delete customization', { variant: 'error' });
    }
  };

  const handleBackClick = () => {
    if (user?.role === 'MANAGER') {
      navigate('/manager/dashboard');
    } else if (user?.role === 'ADMIN') {
      navigate('/admin/dashboard');
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

  const handleBasePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty input for initial typing
    if (value === '') {
      setFormData(prev => ({
        ...prev,
        basePrice: 0
      }));
      setPriceError('');
      return;
    }

    // Check for negative numbers
    if (value.startsWith('-')) {
      setPriceError('Price cannot be negative');
      return;
    }

    // Remove leading zeros and validate decimal format
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      const numValue = value.replace(/^0+(?=\d)/, ''); // Remove leading zeros but keep single 0
      const basePrice = Number(numValue);
      
      setFormData(prev => ({
        ...prev,
        basePrice,
        sizePrices: isDrinkType(prev.type)
          ? calculateSizePrices(basePrice)
          : defaultSizePrices
      }));
      setPriceError('');
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#4d351d', color: 'white' }} elevation={1}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              onClick={handleBackClick}
              aria-label="back"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" component="div" fontWeight="bold">
              Item Management
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Search
          sx={{
            backgroundColor: 'white',
            borderRadius: 1,
            '&:hover': {
              backgroundColor: 'white',
            },
          }}
        >
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ color: 'black' }}  // Set the input text color to black
          />
        </Search>
        <Box sx={{ display: 'flex', gap: 1 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: 'primary' }}>Type</InputLabel>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            label="Type"
            sx={{
              color: typeFilter === '' ? '#230c02' : 'inherit',
              backgroundColor: 'white',
            }}
          >
            <MenuItem value="">All</MenuItem>
            {Object.values(ITEM_TYPES).map((type) => (
              <MenuItem key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{ color: 'white' }} // Set the button text color to white
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
      </AppBar>
      
      <Box sx={{backgroundColor: '#EEDCC6', minHeight: '100vh', mt: 0, paddingTop: 0.5}}>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" fontWeight="bold" color="#230c02">
              Item Management
          </Typography>
        </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <input
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
            <Button
              sx={{backgroundColor: '#4d351d'}}
              variant="contained"
              color="primary"
              startIcon={<UploadIcon />}
              onClick={handleImportClick}
              disabled={isImporting}
            >
              {isImporting ? 'Importing...' : 'Import CSV'}
            </Button>
            <Button
              sx={{backgroundColor: '#4d351d'}}
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
            >
              Add New Item
            </Button>
          </Box>
        </Box>

        <Paper>
          <StyledTableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{backgroundColor: '#4d351d'}}>
                  <TableCell sx={{ fontWeight: 'bold' , color: 'white'}}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' , color: 'white'}}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' , color: 'white'}}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' , color: 'white'}}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' , color: 'white'}}>Base Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' , color: 'white'}}>Size Prices</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' , color: 'white'}}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' , color: 'white'}}>Actions</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' , color: 'white'}}>Customizations</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.map((item) => (
                    <TableRow key={item.code}>
                      <TableCell>{item.code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.type.replace(/_/g, ' ')}</TableCell>
                      <TableCell>{item.category.name}</TableCell>
                      <TableCell>₱{item.basePrice.toFixed(2)}</TableCell>
                      <TableCell>
                        {isDrinkType(item.type) && (
                          <>
                            {Object.entries(item.sizePrices).map(([size, price]) => (
                              <Typography key={size}>
                                {size}: ₱{price.toFixed(2)}
                              </Typography>
                            ))}
                          </>
                        )}
                      </TableCell>
                      <TableCell>{item.active ? 'Active' : 'Inactive'}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(item)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(item)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                      {renderCustomizationCell(item)}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Delete Item</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Are you sure you want to delete this item?
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Item: {itemToDelete?.name} (Code: {itemToDelete?.code})
            </Typography>
            <Typography variant="body2" color="error" sx={{ mt: 2, mb: 1 }}>
              Please enter the item code to confirm deletion:
            </Typography>
            <TextField
              fullWidth
              value={confirmItemCode}
              onChange={(e) => {
                setConfirmItemCode(e.target.value);
                setDeleteCodeError('');
              }}
              placeholder="Enter item code"
              size="small"
              error={!!deleteCodeError}
              helperText={deleteCodeError}
              FormHelperTextProps={{
                sx: { color: 'error.main', fontWeight: 'bold' }
              }}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              disabled={!confirmItemCode}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add/Edit Item Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {dialogMode === 'add' ? 'Add New Item' : 'Edit Item'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                required
                label="Item Name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  validateItemName(e.target.value);
                }}
                error={!!itemNameError}
                helperText={itemNameError}
                FormHelperTextProps={{
                  sx: { color: 'error.main', fontWeight: 'bold' }
                }}
                sx={{ mb: 2 }}
              />
              
              <FormControl fullWidth required sx={{ mb: 2 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e: SelectChangeEvent) => {
                    const newType = e.target.value as ItemType;
                    setFormData({
                      ...formData,
                      type: newType,
                      categoryId: '',
                      sizePrices: isDrinkType(newType) 
                        ? calculateSizePrices(formData.basePrice)
                        : defaultSizePrices
                    });
                  }}
                  label="Type"
                >
                  {Object.values(ITEM_TYPES).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  label="Category"
                >
                  {CATEGORY_TYPES[formData.type].map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                required
                label="Base Price"
                type="text"
                value={formData.basePrice === 0 ? '' : formData.basePrice.toString()}
                onChange={handleBasePriceChange}
                error={!!priceError}
                helperText={priceError}
                FormHelperTextProps={{
                  sx: { color: 'error.main', fontWeight: 'bold' }
                }}
                InputProps={{
                  startAdornment: <span>₱</span>,
                  inputProps: { 
                    inputMode: 'decimal',
                    pattern: '[0-9]*',
                    min: 0
                  }
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />

              {isDrinkType(formData.type) && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Size Prices (Auto-calculated)
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    {Object.entries(formData.sizePrices).map(([size, price]) => (
                      <Typography key={size}>
                        {size}: ₱{price.toFixed(2)}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSaveItem}
              variant="contained"
              color="primary"
              disabled={!formData.name || !formData.type || !formData.categoryId || formData.basePrice <= 0}
            >
              {dialogMode === 'add' ? 'Add' : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Customization Dialog */}
        <Dialog
          open={customizationDialogOpen}
          onClose={() => setCustomizationDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              minHeight: '50vh',
              maxHeight: '80vh'
            }
          }}
        >
          <DialogTitle>
            Manage Customizations - {selectedItemForCustomization?.name}
          </DialogTitle>
          <DialogContent>
            {customizationFormData.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No customizations available.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Click the button below to add a new customization.
                </Typography>
              </Box>
            ) : (
              customizationFormData.map((customization, index) => (
                <Box key={index} sx={{ mb: 4, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Customization Name"
                      value={customization.name}
                      onChange={(e) => handleCustomizationChange(index, 'name', e.target.value)}
                      sx={{ mr: 2 }}
                      inputProps={{
                        autoComplete: 'off'
                      }}
                    />
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteCustomization(index)}
                      title="Delete Customization"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  {customization.options.map((option, optionIndex) => (
                    <Box key={optionIndex} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                      <TextField
                        label="Option Name"
                        value={option.name}
                        onChange={(e) => handleOptionChange(index, optionIndex, 'name', e.target.value)}
                        sx={{ flex: 2 }}
                        inputProps={{
                          autoComplete: 'off'
                        }}
                      />
                      <TextField
                        label="Price"
                        type="text"
                        value={option.price === 0 ? '' : option.price.toString()}
                        onChange={(e) => handleOptionChange(index, optionIndex, 'price', e.target.value)}
                        sx={{ flex: 1 }}
                        InputProps={{
                          startAdornment: <span>₱</span>,
                          inputProps: { 
                            inputMode: 'decimal',
                            pattern: '[0-9]*',
                            min: 0
                          }
                        }}
                      />
                      <IconButton 
                        color="error" 
                        onClick={() => handleRemoveCustomizationOption(index, optionIndex)}
                        disabled={customization.options.length <= 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    onClick={() => handleAddCustomizationOption(index)}
                    disabled={customization.options.length >= 5}
                    sx={{ mt: 1 }}
                  >
                    Add Option
                  </Button>
                </Box>
              ))
            )}
            <Button
              variant="contained"
              onClick={handleAddNewCustomization}
              sx={{ mt: 2 }}
            >
              Add New Customization
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCustomizationDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCustomizations} variant="contained" color="primary">
              Save Customizations
            </Button>
          </DialogActions>
        </Dialog>

        {/* CSV Error Dialog */}
        <Dialog
          open={showCsvErrorDialog}
          onClose={() => setShowCsvErrorDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ color: 'error.main' }}>Import Errors</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              The following errors occurred during import:
            </Typography>
            <List>
              {csvErrors.map((error, index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={error} 
                    sx={{ 
                      '& .MuiListItemText-primary': { 
                        color: 'error.main',
                        fontWeight: 'bold'
                      } 
                    }} 
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCsvErrorDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Confirmation Dialog */}
        <Dialog
          open={editConfirmDialogOpen}
          onClose={() => setEditConfirmDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Item</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Please confirm you want to edit this item:
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Item: {itemToEdit?.name} (Code: {itemToEdit?.code})
            </Typography>
            <Typography variant="body2" color="error" sx={{ mt: 2, mb: 1 }}>
              Please enter the item code to confirm:
            </Typography>
            <TextField
              fullWidth
              value={confirmEditItemCode}
              onChange={(e) => {
                setConfirmEditItemCode(e.target.value);
                setEditCodeError('');
              }}
              placeholder="Enter item code"
              size="small"
              error={!!editCodeError}
              helperText={editCodeError}
              FormHelperTextProps={{
                sx: { color: 'error.main', fontWeight: 'bold' }
              }}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditConfirmDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleEditConfirm}
              color="primary"
              disabled={!confirmEditItemCode}
            >
              Proceed
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
      </Box>
    </>
  );
};

export default Items;
