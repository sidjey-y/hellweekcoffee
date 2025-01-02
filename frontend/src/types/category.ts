import { ItemType } from './item';

export interface Category {
  id: string;
  name: string;
  type: ItemType;
  active: boolean;
}

export interface CategoryRequest {
  name: string;
  type: ItemType;
} 