export type SnackCategory = 'POPCORN' | 'DRINK' | 'COMBO' | 'SNACK';

export interface Snack {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: SnackCategory;
  isAvailable: boolean;
}
