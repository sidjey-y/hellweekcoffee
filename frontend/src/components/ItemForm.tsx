import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  FormControlLabel,
  Switch,
  Box,
  CircularProgress,
} from '@mui/material';
import { ItemFormData, ItemType } from '../types/item';

interface ItemFormProps {
  initialData?: ItemFormData;
  onSubmit: (data: ItemFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ItemForm: React.FC<ItemFormProps> = ({ initialData, onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = React.useState<ItemFormData>({
    name: '',
    description: '',
    category: '',
    basePrice: 0,
    sizePrices: {},
    type: 'ESPRESSO_DRINK',
    active: true,
    availableCustomizations: [],
    ...initialData,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: ItemFormData) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: ItemFormData) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSizeChange = (size: string, value: string) => {
    setFormData((prev: ItemFormData) => ({
      ...prev,
      sizePrices: {
        ...prev.sizePrices,
        [size]: parseFloat(value) || 0,
      },
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: ItemFormData) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isDrinkType = (type: ItemType) => {
    return ['ESPRESSO_DRINK', 'BLENDED_DRINK', 'TEA', 'OTHER_DRINK'].includes(type);
  };

  const isFoodType = (type: ItemType) => {
    return ['PASTRY', 'CAKE', 'SANDWICH', 'PASTA', 'OTHER_FOOD'].includes(type);
  };

  const isMerchandiseType = (type: ItemType) => {
    return ['TSHIRT', 'BAG', 'MUG', 'OTHER_MERCHANDISE'].includes(type);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={3}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleSelectChange}
            >
              <MenuItem value="ESPRESSO_DRINK">Espresso Drink</MenuItem>
              <MenuItem value="BLENDED_DRINK">Blended Drink</MenuItem>
              <MenuItem value="TEA">Tea</MenuItem>
              <MenuItem value="OTHER_DRINK">Other Drink</MenuItem>
              <MenuItem value="PASTRY">Pastry</MenuItem>
              <MenuItem value="CAKE">Cake</MenuItem>
              <MenuItem value="SANDWICH">Sandwich</MenuItem>
              <MenuItem value="PASTA">Pasta</MenuItem>
              <MenuItem value="OTHER_FOOD">Other Food</MenuItem>
              <MenuItem value="TSHIRT">T-Shirt</MenuItem>
              <MenuItem value="BAG">Bag</MenuItem>
              <MenuItem value="MUG">Mug</MenuItem>
              <MenuItem value="OTHER_MERCHANDISE">Other Merchandise</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Base Price"
            name="basePrice"
            type="number"
            value={formData.basePrice}
            onChange={handleNumberChange}
            required
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>
        {isDrinkType(formData.type) && (
          <>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Small Size Price"
                type="number"
                value={formData.sizePrices?.SMALL || ''}
                onChange={(e) => handleSizeChange('SMALL', e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Medium Size Price"
                type="number"
                value={formData.sizePrices?.MEDIUM || ''}
                onChange={(e) => handleSizeChange('MEDIUM', e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Large Size Price"
                type="number"
                value={formData.sizePrices?.LARGE || ''}
                onChange={(e) => handleSizeChange('LARGE', e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
          </>
        )}
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleSelectChange}
            >
              {isDrinkType(formData.type) && (
                <>
                  <MenuItem value="Espresso Drinks">Espresso Drinks</MenuItem>
                  <MenuItem value="Blended Drinks">Blended Drinks</MenuItem>
                  <MenuItem value="Tea">Tea</MenuItem>
                  <MenuItem value="Others">Others</MenuItem>
                </>
              )}
              {isFoodType(formData.type) && (
                <>
                  <MenuItem value="Pastries">Pastries</MenuItem>
                  <MenuItem value="Cakes">Cakes</MenuItem>
                  <MenuItem value="Sandwiches">Sandwiches</MenuItem>
                  <MenuItem value="Pastas">Pastas</MenuItem>
                  <MenuItem value="Others">Others</MenuItem>
                </>
              )}
              {isMerchandiseType(formData.type) && (
                <>
                  <MenuItem value="T-Shirts">T-Shirts</MenuItem>
                  <MenuItem value="Bags">Bags</MenuItem>
                  <MenuItem value="Mugs">Mugs</MenuItem>
                  <MenuItem value="Others">Others</MenuItem>
                </>
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.active}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                name="active"
              />
            }
            label="Available"
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={onCancel} disabled={isLoading}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {initialData ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default ItemForm;
