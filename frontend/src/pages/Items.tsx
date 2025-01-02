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
  CircularProgress,
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const { handleAuthError } = useContext(AuthContext);

  useEffect(() => {
    setAuthErrorHandler(handleAuthError);
    fetchItems();
    return () => setAuthErrorHandler(() => {});
  }, [handleAuthError]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const filtered = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
      setPage(0);
    }, 300); // Debounce search for better performance

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, items]);

  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await itemsAPI.getItems();
      setItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
      if (error instanceof Error) {
        setError(error.message);
        enqueueSnackbar(`Failed to fetch items: ${error.message}`, { variant: 'error' });
      } else {
        setError('Failed to fetch items');
        enqueueSnackbar('Failed to fetch items', { variant: 'error' });
      }
    } finally {
      setIsLoading(false);
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
      setIsLoading(true);
      const itemCode = generateItemCode(formData.name, formData.category);
      const newItem: Omit<Item, 'code'> = {
        ...formData,
      };
      await itemsAPI.createItem(newItem);
      enqueueSnackbar('Item added successfully', { variant: 'success' });
      await fetchItems();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error adding item:', error);
      enqueueSnackbar('Failed to add item', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditItem = async (formData: ItemFormData) => {
    if (!selectedItem) return;
    try {
      setIsLoading(true);
      await itemsAPI.updateItem(selectedItem.code, formData);
      enqueueSnackbar('Item updated successfully', { variant: 'success' });
      await fetchItems();
      setOpenDialog(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
      enqueueSnackbar('Failed to update item', { variant: 'error' });
    } finally {
      setIsLoading(false);
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
      {isLoading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Box mb={4}>
          <Typography color="error" variant="body1">
            {error}
          </Typography>
        </Box>
      )}

      {!isLoading && !error && (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h4" component="h1">
              Items
            </Typography>
            <Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedItem(null);
                  setOpenDialog(true);
                }}
                sx={{ mr: 2 }}
              >
                Add Item
              </Button>
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                id="upload-file"
                onChange={handleFileUpload}
              />
              <label htmlFor="upload-file">
                <Button variant="outlined" component="span" startIcon={<UploadIcon />}>
                  Import
                </Button>
              </label>
            </Box>
          </Box>

          <Box mb={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

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
        </>
      )}

      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedItem(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <ItemForm
          onSubmit={selectedItem ? handleEditItem : handleAddItem}
          onCancel={() => {
            setOpenDialog(false);
            setSelectedItem(null);
          }}
          initialData={selectedItem ? {
            name: selectedItem.name,
            description: selectedItem.description,
            category: selectedItem.category,
            basePrice: selectedItem.basePrice,
            sizePrices: selectedItem.sizePrices,
            type: selectedItem.type,
            active: selectedItem.active,
            availableCustomizations: selectedItem.availableCustomizations || []
          } : undefined}
          isLoading={isLoading}
        />
      </Dialog>
    </Container>
  );
};

export default Items;
