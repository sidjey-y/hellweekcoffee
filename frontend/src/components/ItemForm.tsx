import React, { useEffect, useState } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import { 
  Item, 
  ItemType, 
  ITEM_TYPES,
  Size,
  CategoryType,
  CATEGORY_TYPES,
  isDrinkType,
  calculateSizePrices
} from '../types/item';

const defaultSizePrices: Record<Size, number> = {
  SMALL: 0,
  MEDIUM: 0,
  LARGE: 0
};

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

interface ItemFormProps {
  onSubmit: (data: ItemFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  selectedItem?: Item;
}

const ItemForm: React.FC<ItemFormProps> = ({ onSubmit, onCancel, isLoading = false, selectedItem }) => {
  const [formData, setFormData] = useState<ItemFormData>(defaultFormData);

  useEffect(() => {
    if (selectedItem) {
      setFormData({
        name: selectedItem.name,
        type: selectedItem.type,
        basePrice: selectedItem.basePrice,
        categoryId: selectedItem.category.id,
        description: selectedItem.description || '',
        sizePrices: selectedItem.sizePrices || { ...defaultSizePrices },
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

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
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
            {Object.entries(ITEM_TYPES).map(([key, value]) => (
              <MenuItem key={key} value={value}>
                {value.replace(/_/g, ' ')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal" required error={!formData.categoryId}>
          <InputLabel>Category</InputLabel>
          <Select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleSelectChange}
            label="Category"
          >
            {CATEGORY_TYPES[formData.type].map((categoryType) => (
              <MenuItem key={categoryType} value={categoryType}>
                {categoryType.replace(/_/g, ' ')}
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
            startAdornment: <span>₱</span>,
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
        {isDrinkType(formData.type) && (
          <Box sx={{ mt: 2 }}>
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
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading || !formData.name || !formData.type || !formData.categoryId || formData.basePrice <= 0}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {selectedItem ? 'Update' : 'Create'}
          </Button>
        </Box>
      </Box>
    </form>
  );
};

export default ItemForm;
