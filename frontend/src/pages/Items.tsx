import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import ItemForm from '../components/ItemForm';
import { Item, ItemFormData, ItemType } from '../types/item';
import { Category } from '../types/category';
import { itemsAPI } from '../services/api';
import { AuthContext } from '../components/AuthProvider';
import { setAuthErrorHandler } from '../utils/axios';

const Items = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const { handleAuthError } = useContext(AuthContext);

  useEffect(() => {
    setAuthErrorHandler(handleAuthError);
    fetchItems();
    return () => setAuthErrorHandler(() => {});
  }, [handleAuthError]);

  useEffect(() => {
    const filtered = items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
    setPage(0);
  }, [searchTerm, items]);

  const fetchItems = async () => {
    try {
      console.log('Fetching items...');
      
      // First, fetch categories
      const categories = await itemsAPI.getCategories();
      console.log('Categories fetched:', categories);
      
      // If no categories exist, create default ones
      if (!categories || categories.length === 0) {
        console.log('No categories found, creating default categories...');
        const defaultCategories: Array<{ name: string; type: ItemType }> = [
          { name: 'Hot Drinks', type: 'ESPRESSO_DRINK' },
          { name: 'Cold Drinks', type: 'BLENDED_DRINK' },
          { name: 'Teas', type: 'TEA' },
          { name: 'Pastries', type: 'PASTRY' },
          { name: 'Cakes', type: 'CAKE' }
        ];
        
        for (const category of defaultCategories) {
          await itemsAPI.createCategory(category);
        }
      }
      
      // Now fetch items
      const data = await itemsAPI.getItems();
      console.log('Items fetched:', data);
      
      // If no items exist, add some initial items
      if (!data || data.length === 0) {
        console.log('No items found, adding initial items...');
        const hotDrinksCategory = categories.find((c: Category) => c.name === 'Hot Drinks');
        const cakesCategory = categories.find((c: Category) => c.name === 'Cakes');
        
        if (hotDrinksCategory && cakesCategory) {
          const initialItems: Omit<Item, 'code'>[] = [
            {
              name: 'Espresso',
              description: 'Classic espresso shot',
              type: 'ESPRESSO_DRINK',
              category: hotDrinksCategory.id,
              basePrice: 120,
              sizePrices: {
                SMALL: 120,
                MEDIUM: 140,
                LARGE: 160
              },
              active: true,
              availableCustomizations: []
            },
            {
              name: 'Cappuccino',
              description: 'Espresso with steamed milk and foam',
              type: 'ESPRESSO_DRINK',
              category: hotDrinksCategory.id,
              basePrice: 140,
              sizePrices: {
                SMALL: 140,
                MEDIUM: 160,
                LARGE: 180
              },
              active: true,
              availableCustomizations: []
            },
            {
              name: 'Chocolate Cake',
              description: 'Rich chocolate cake slice',
              type: 'CAKE',
              category: cakesCategory.id,
              basePrice: 150,
              sizePrices: {},
              active: true,
              availableCustomizations: []
            }
          ];

          for (const item of initialItems) {
            await itemsAPI.createItem(item);
          }
          
          // Fetch items again after adding initial ones
          const updatedData = await itemsAPI.getItems();
          setItems(updatedData);
        }
      } else {
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      if (error instanceof Error) {
        enqueueSnackbar(`Failed to fetch items: ${error.message}`, { variant: 'error' });
      } else {
        enqueueSnackbar('Failed to fetch items', { variant: 'error' });
      }
    }
  };

  const generateItemCode = (name: string, category: string) => {
    const prefix = category.substring(0, 2).toUpperCase();
    const namePart = name.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${namePart}${randomNum}`;
  };

  const handleAddItem = async (formData: ItemFormData) => {
    try {
      const itemCode = generateItemCode(formData.name, formData.category);
      const newItem: Omit<Item, 'code'> = {
        ...formData,
      };
      await itemsAPI.createItem(newItem);
      enqueueSnackbar('Item added successfully', { variant: 'success' });
      fetchItems();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error adding item:', error);
      enqueueSnackbar('Failed to add item', { variant: 'error' });
    }
  };

  const handleEditItem = async (formData: ItemFormData) => {
    if (!selectedItem) return;
    try {
      await itemsAPI.updateItem(selectedItem.code, formData);
      enqueueSnackbar('Item updated successfully', { variant: 'success' });
      fetchItems();
      setOpenDialog(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
      enqueueSnackbar('Failed to update item', { variant: 'error' });
    }
  };

  const handleDeleteItem = async (item: Item) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await itemsAPI.deleteItem(item.code);
        enqueueSnackbar('Item deleted successfully', { variant: 'success' });
        fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
        enqueueSnackbar('Failed to delete item', { variant: 'error' });
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const items = JSON.parse(content);
        
        if (!Array.isArray(items)) {
          throw new Error('Invalid file format. Expected an array of items.');
        }

        for (const item of items) {
          const itemCode = generateItemCode(item.name, item.category);
          await itemsAPI.createItem({ ...item });
        }

        enqueueSnackbar('Items imported successfully', { variant: 'success' });
        fetchItems();
      } catch (error) {
        console.error('Error importing items:', error);
        enqueueSnackbar('Failed to import items. Please check the file format.', {
          variant: 'error',
        });
      }
    };
    reader.readAsText(file);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Menu Items
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedItem(null);
              setOpenDialog(true);
            }}
          >
            Add Item
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            component="label"
          >
            Import Items
            <input
              type="file"
              accept=".json"
              hidden
              onChange={handleFileUpload}
            />
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search items by name, code, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ p: 2 }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item) => (
                <TableRow key={item.code}>
                  <TableCell>{item.code}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.active ? 'Available' : 'Unavailable'}
                      color={item.active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => {
                            setSelectedItem(item);
                            setOpenDialog(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDeleteItem(item)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedItem(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {selectedItem ? 'Edit Item' : 'Add New Item'}
          </Typography>
          <ItemForm
            initialData={selectedItem ? {
              ...selectedItem,
            } : undefined}
            onSubmit={async (data) => {
              if (selectedItem) {
                await handleEditItem(data);
              } else {
                await handleAddItem(data);
              }
            }}
            onCancel={() => {
              setOpenDialog(false);
              setSelectedItem(null);
            }}
          />
        </Box>
      </Dialog>
    </Container>
  );
};

export default Items;
