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
} from '@mui/material';
import { Item, ItemFormData, ItemType, ITEM_TYPES } from '../types/item';

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
        sizePrices: selectedItem.sizePrices || {},
        active: selectedItem.active,
        availableCustomizations: selectedItem.availableCustomizations?.map((customization) => customization.id) || [],
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [selectedItem]);

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'basePrice' ? Number(value) : value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isDrinkType = (type: ItemType): boolean => {
    return ['ESPRESSO_DRINK', 'BLENDED_DRINK', 'TEA', 'OTHER_DRINK'].includes(type);
  };

  const isFoodType = (type: ItemType): boolean => {
    return ['PASTRY', 'CAKE', 'SANDWICH', 'PASTA', 'OTHER_FOOD'].includes(type);
  };

  const isMerchandiseType = (type: ItemType): boolean => {
    return ['TSHIRT', 'BAG', 'MUG', 'OTHER_MERCHANDISE'].includes(type);
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
            {Object.values(ITEM_TYPES).map((type) => (
              <MenuItem key={type} value={type}>
                {type.replace(/_/g, ' ')}
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
            {isDrinkType(formData.type) && (
              <MenuItem value="DRINKS">Drinks</MenuItem>
            )}
            {isFoodType(formData.type) && (
              <MenuItem value="FOOD">Food</MenuItem>
            )}
            {isMerchandiseType(formData.type) && (
              <MenuItem value="MERCHANDISE">Merchandise</MenuItem>
            )}
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
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading || !formData.name || !formData.type || formData.basePrice <= 0}
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
