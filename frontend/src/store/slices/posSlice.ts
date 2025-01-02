import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OrderItem } from '../../types/models';

interface POSState {
  items: OrderItem[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: POSState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
};

const calculateTotal = (items: OrderItem[]): number => {
  return items.reduce((sum, item) => sum + item.subtotal, 0);
};

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    addItem: (state: POSState, action: PayloadAction<OrderItem>) => {
      state.items.push(action.payload);
      state.total = calculateTotal(state.items);
    },
    removeItem: (state: POSState, action: PayloadAction<number>) => {
      state.items = state.items.filter((_, index) => index !== action.payload);
      state.total = calculateTotal(state.items);
    },
    updateItemQuantity: (
      state: POSState,
      action: PayloadAction<{ index: number; quantity: number }>
    ) => {
      const { index, quantity } = action.payload;
      if (state.items[index]) {
        state.items[index].quantity = quantity;
        state.items[index].subtotal = 
          state.items[index].item.basePrice * quantity +
          state.items[index].customizations.reduce((sum, cust) => 
            sum + cust.selectedOptions.reduce((optSum, opt) => 
              optSum + opt.price, 0), 0);
        state.total = calculateTotal(state.items);
      }
    },
    clearTransaction: (state: POSState) => {
      state.items = [];
      state.total = 0;
    },
    setLoading: (state: POSState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state: POSState, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addItem,
  removeItem,
  updateItemQuantity,
  clearTransaction,
  setLoading,
  setError,
} = posSlice.actions;

export default posSlice.reducer;
