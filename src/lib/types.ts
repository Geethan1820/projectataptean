export type InventorySize = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface InventoryItem {
  sku: string;
  size: InventorySize;
  color: string;
  price: number;
  quantity: number;
  createdAt: string; // ISO date string
}

export interface Transaction {
  id: number;
  sku: string;
  type: 'IN' | 'OUT';
  quantity: number;
  timestamp: string; // ISO date string
}
