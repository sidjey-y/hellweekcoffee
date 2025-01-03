export type ItemType = 'DRINKS' | 'FOOD' | 'MERCHANDISE';

export const ITEM_TYPES = {
  DRINKS: 'DRINKS',
  FOOD: 'FOOD',
  MERCHANDISE: 'MERCHANDISE'
} as const;

export type CategoryType = 
  | 'ESPRESSO_DRINKS'
  | 'BLENDED_DRINKS'
  | 'TEA'
  | 'OTHER_DRINKS'
  | 'PASTRIES'
  | 'CAKES'
  | 'SANDWICHES'
  | 'PASTAS'
  | 'OTHER_FOOD'
  | 'TSHIRTS'
  | 'BAGS'
  | 'MUGS'
  | 'OTHER_MERCHANDISE';

export const CATEGORY_TYPES: Record<ItemType, CategoryType[]> = {
  DRINKS: ['ESPRESSO_DRINKS', 'BLENDED_DRINKS', 'TEA', 'OTHER_DRINKS'],
  FOOD: ['PASTRIES', 'CAKES', 'SANDWICHES', 'PASTAS', 'OTHER_FOOD'],
  MERCHANDISE: ['TSHIRTS', 'BAGS', 'MUGS', 'OTHER_MERCHANDISE']
};

export type Size = 'SMALL' | 'MEDIUM' | 'LARGE';

export const SIZES: Record<Size, { multiplier: number, additive: number }> = {
  SMALL: { multiplier: 0.8, additive: 0 },
  MEDIUM: { multiplier: 1.0, additive: 0 },
  LARGE: { multiplier: 1.2, additive: 20 }
};

export interface Item {
  code: string;
  name: string;
  description?: string;
  basePrice: number;
  category: {
    id: string;
    name: string;
    type: CategoryType;
  };
  type: ItemType;
  active: boolean;
  sizePrices: Record<Size, number>;
  availableCustomizations?: {
    id: string;
    name: string;
    optionsWithPrices: Record<string, number>;
  }[];
}

export interface ItemFormData {
  name: string;
  type: ItemType;
  basePrice: number;
  categoryId: string;
  description: string;
  sizePrices: Record<Size, number>;
  active: boolean;
  availableCustomizations?: string[];
}

export interface ItemRequest {
  code?: string;
  name: string;
  type: ItemType;
  basePrice: number;
  categoryId: string;
  description?: string;
  sizePrices: Record<Size, number>;
  active: boolean;
  availableCustomizations: number[];
}

export const isDrinkType = (type: ItemType): boolean => {
  return type === 'DRINKS';
};

export const isFoodType = (type: ItemType): boolean => {
  return type === 'FOOD';
};

export const isMerchandiseType = (type: ItemType): boolean => {
  return type === 'MERCHANDISE';
};

export const calculateSizePrices = (basePrice: number): Record<Size, number> => {
  return {
    SMALL: Math.round(basePrice * SIZES.SMALL.multiplier + SIZES.SMALL.additive),
    MEDIUM: Math.round(basePrice * SIZES.MEDIUM.multiplier + SIZES.MEDIUM.additive),
    LARGE: Math.round(basePrice * SIZES.LARGE.multiplier + SIZES.LARGE.additive)
  };
};
