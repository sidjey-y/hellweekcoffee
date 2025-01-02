export type ItemType = 
  | 'ESPRESSO_DRINK'
  | 'BLENDED_DRINK'
  | 'TEA'
  | 'OTHER_DRINK'
  | 'PASTRY'
  | 'CAKE'
  | 'SANDWICH'
  | 'PASTA'
  | 'OTHER_FOOD'
  | 'TSHIRT'
  | 'BAG'
  | 'MUG'
  | 'OTHER_MERCHANDISE';

export const ITEM_TYPES = {
  ESPRESSO_DRINK: 'ESPRESSO_DRINK',
  BLENDED_DRINK: 'BLENDED_DRINK',
  TEA: 'TEA',
  OTHER_DRINK: 'OTHER_DRINK',
  PASTRY: 'PASTRY',
  CAKE: 'CAKE',
  SANDWICH: 'SANDWICH',
  PASTA: 'PASTA',
  OTHER_FOOD: 'OTHER_FOOD',
  TSHIRT: 'TSHIRT',
  BAG: 'BAG',
  MUG: 'MUG',
  OTHER_MERCHANDISE: 'OTHER_MERCHANDISE'
} as const;

export interface Item {
  code: string;
  name: string;
  description?: string;
  category: string;
  basePrice: number;
  sizePrices: Record<string, number>;
  type: ItemType;
  active: boolean;
  availableCustomizations?: number[];
}

export interface ItemFormData {
  name: string;
  description?: string;
  category: string;
  basePrice: number;
  sizePrices: Record<string, number>;
  type: ItemType;
  active: boolean;
  availableCustomizations?: number[];
}
