export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface Recipe {
  id: number;
  title: string;
  category: string[];
  cover: string;
  ingredients: Ingredient[];
  seasonings: string[];
  steps: string[];
  link?: string;
}

export type ScreenType = 'home' | 'detail' | 'editor' | 'import' | 'aggregation';

export interface AggregatedData {
  ingredients: { name: string; amount: number; unit: string }[];
  seasonings: string[];
  count: number;
  menuNames: string[];
}
