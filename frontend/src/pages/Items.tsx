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
import { 
  Item, 
  ItemType, 
  ITEM_TYPES, 
  ItemRequest, 
  isDrinkType, 
  calculateSizePrices,
  Size,
  CategoryType,
  CATEGORY_TYPES
} from '../types/item';
import { Category } from '../types/category';
import { itemsAPI, categoriesAPI } from '../services/api';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import FilterListIcon from '@mui/icons-material/FilterList';

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

type ItemFormData = {
  name: string;
  type: ItemType;
  basePrice: number;
  categoryId: string;
  description: string;
  sizePrices: Record<Size, number>;
  active: boolean;
  availableCustomizations?: string[];
};

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

const generateItemCode = (categoryType: CategoryType, itemName: string, existingItems: Item[]): string => {
  // Get first and last characters of category
  const categoryChars = `${categoryType.charAt(0)}${categoryType.charAt(categoryType.length - 1)}`.toUpperCase();
  
  // Get first four letters of name, pad with last letter if less than 4 chars
  const nameLength = itemName.length;
  const nameChars = nameLength >= 4 
    ? itemName.slice(0, 4).toUpperCase()
    : (itemName + itemName.charAt(nameLength - 1).repeat(4 - nameLength)).toUpperCase();
  
  // Count items in this category to generate the sequence number
  const categoryItems = existingItems.filter(item => item.category.type === categoryType);
  const sequenceNumber = (categoryItems.length + 1).toString().padStart(3, '0');
  
  return `${categoryChars}-${nameChars}-${sequenceNumber}`;
};

type CategoryTypeValue = keyof typeof CATEGORY_TYPES;

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
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      setFormData({
        name: selectedItem.name,
        type: selectedItem.type,
        basePrice: selectedItem.basePrice,
        categoryId: selectedItem.category.id,
        description: selectedItem.description || '',
        sizePrices: selectedItem.sizePrices,
        active: selectedItem.active,
        availableCustomizations: selectedItem.availableCustomizations?.map(c => c.id) || [],
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
    if (!formData.name || !formData.type || !formData.categoryId || formData.basePrice <= 0) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
      return;
    }

    try {
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

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            HellWeek Coffee - Item Management
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Search>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  label="Type"
                >
                  <MenuItem value="">All</MenuItem>
                  {Object.values(ITEM_TYPES).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All</MenuItem>
                  {typeFilter && categories
                    .filter(category => category.type === typeFilter)
                    .map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
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

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Items
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

        <Paper>
          <StyledTableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Base Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items
                  .filter(item => 
                    (typeFilter ? item.type === typeFilter : true) &&
                    (categoryFilter ? item.category.id === categoryFilter : true) &&
                    (searchQuery 
                      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.code.toLowerCase().includes(searchQuery.toLowerCase())
                      : true
                    )
                  )
                  .map((item) => (
                    <TableRow key={item.code}>
                      <TableCell>{item.code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.type.replace(/_/g, ' ')}</TableCell>
                      <TableCell>{item.category.name}</TableCell>
                      <TableCell>₱{item.basePrice.toFixed(2)}</TableCell>
                      <TableCell>{item.active ? 'Active' : 'Inactive'}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEditItem(item)}
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
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete {selectedItem?.name}?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
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
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                type="number"
                value={formData.basePrice}
                onChange={(e) => {
                  const basePrice = Number(e.target.value);
                  setFormData({
                    ...formData,
                    basePrice,
                    sizePrices: isDrinkType(formData.type)
                      ? calculateSizePrices(basePrice)
                      : defaultSizePrices
                  });
                }}
                InputProps={{
                  startAdornment: <span>₱</span>,
                  inputProps: { min: 0, step: 0.01 }
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
      </Container>
    </>
  );
};

export default Items;
