export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER';

export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER';
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Item {
  itemCode: string;
  name: string;
  description?: string;
  category: Category;
  basePrice: number;
  type: string;
  available: boolean;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  membershipId: string;
  email: string;
  phoneNumber: string;
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
}

export interface Customization {
  id: string;
  name: string;
  options: CustomizationOption[];
  maxOptions: number;
}

export interface OrderItem {
  item: Item;
  quantity: number;
  customizations: {
    customization: Customization;
    selectedOptions: CustomizationOption[];
  }[];
  subtotal: number;
}

export interface Order {
  id: string;
  customer?: Customer;
  items: OrderItem[];
  total: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}
