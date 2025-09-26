import type { InventoryItem, Transaction } from './types';

export const initialInventory: InventoryItem[] = [
  { sku: 'POLO-M-BLUE-1234', size: 'M', color: 'Blue', price: 25.99, quantity: 50, createdAt: new Date('2023-01-15T09:30:00Z').toISOString() },
  { sku: 'POLO-L-RED-5678', size: 'L', color: 'Red', price: 25.99, quantity: 8, createdAt: new Date('2023-01-16T10:00:00Z').toISOString() },
  { sku: 'POLO-S-GREEN-9101', size: 'S', color: 'Green', price: 24.99, quantity: 30, createdAt: new Date('2023-02-20T11:00:00Z').toISOString() },
  { sku: 'POLO-XL-BLACK-2122', size: 'XL', color: 'Black', price: 27.99, quantity: 15, createdAt: new Date('2023-03-01T14:20:00Z').toISOString() },
  { sku: 'POLO-M-WHITE-3345', size: 'M', color: 'White', price: 24.99, quantity: 45, createdAt: new Date('2023-03-05T16:00:00Z').toISOString() },
  { sku: 'POLO-XXL-NAVY-6789', size: 'XXL', color: 'Navy', price: 28.99, quantity: 5, createdAt: new Date('2023-04-10T09:00:00Z').toISOString() },
  { sku: 'POLO-L-GREY-4321', size: 'L', color: 'Grey', price: 26.99, quantity: 22, createdAt: new Date('2023-04-12T13:45:00Z').toISOString() },
];

export const initialTransactions: Transaction[] = [
  { id: 1, sku: 'POLO-M-BLUE-1234', type: 'IN', quantity: 50, timestamp: new Date('2023-01-15T09:30:00Z').toISOString() },
  { id: 2, sku: 'POLO-L-RED-5678', type: 'IN', quantity: 15, timestamp: new Date('2023-01-16T10:00:00Z').toISOString() },
  { id: 3, sku: 'POLO-L-RED-5678', type: 'OUT', quantity: 7, timestamp: new Date('2023-02-01T12:00:00Z').toISOString() },
  { id: 4, sku: 'POLO-S-GREEN-9101', type: 'IN', quantity: 30, timestamp: new Date('2023-02-20T11:00:00Z').toISOString() },
  { id: 5, sku: 'POLO-XL-BLACK-2122', type: 'IN', quantity: 20, timestamp: new Date('2023-03-01T14:20:00Z').toISOString() },
  { id: 6, sku: 'POLO-XL-BLACK-2122', type: 'OUT', quantity: 5, timestamp: new Date('2023-03-15T18:00:00Z').toISOString() },
  { id: 7, sku: 'POLO-XXL-NAVY-6789', type: 'IN', quantity: 10, timestamp: new Date('2023-04-10T09:00:00Z').toISOString() },
  { id: 8, sku: 'POLO-XXL-NAVY-6789', type: 'OUT', quantity: 5, timestamp: new Date('2023-04-20T11:30:00Z').toISOString() },
];
