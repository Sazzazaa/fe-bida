export interface FnbItem {
  id: number;
  name: string;
  category: 'drink' | 'snack' | 'food';
  price: number;
}

export const MOCK_FNB_ITEMS: FnbItem[] = [
  { id: 1, name: 'Iced Coffee', category: 'drink', price: 2.5 },
  { id: 2, name: 'Green Tea', category: 'drink', price: 1.8 },
  { id: 3, name: 'Bottled Water', category: 'drink', price: 1.0 },
  { id: 4, name: 'French Fries', category: 'snack', price: 3.2 },
  { id: 5, name: 'Peanuts', category: 'snack', price: 1.5 },
  { id: 6, name: 'Chicken Sandwich', category: 'food', price: 4.8 },
];

export const fnbService = {
  async getAll(): Promise<FnbItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return MOCK_FNB_ITEMS;
  },
};
