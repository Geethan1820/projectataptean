'use server';

import { revalidatePath } from 'next/cache';
import type { InventoryItem, Transaction, InventorySize } from '@/lib/types';
import { initialInventory, initialTransactions } from '@/lib/data';
import { generateSku as generateSkuAI } from '@/ai/flows/auto-sku-generator';
import { smartSearch as smartSearchAI } from '@/ai/flows/smart-search-fuzzy-matching';

// In-memory data store simulation
let inventory: InventoryItem[] = JSON.parse(JSON.stringify(initialInventory));
let transactions: Transaction[] = JSON.parse(JSON.stringify(initialTransactions));
let nextTransactionId = initialTransactions.length > 0 ? Math.max(...initialTransactions.map(t => t.id)) + 1 : 1;

export async function getInventoryItems(): Promise<InventoryItem[]> {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 500));
  return JSON.parse(JSON.stringify(inventory));
}

export async function getTransactions(): Promise<Transaction[]> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
    return JSON.parse(JSON.stringify(transactions));
}

export async function addInventoryItem(itemData: Omit<InventoryItem, 'createdAt'>) {
  if (inventory.some(item => item.sku === itemData.sku)) {
    throw new Error('SKU already exists.');
  }

  const newItem: InventoryItem = {
    ...itemData,
    createdAt: new Date().toISOString(),
  };
  inventory.unshift(newItem);

  if (newItem.quantity > 0) {
    const newTransaction: Transaction = {
      id: nextTransactionId++,
      sku: newItem.sku,
      type: 'IN',
      quantity: newItem.quantity,
      timestamp: new Date().toISOString(),
    };
    transactions.unshift(newTransaction);
  }
  
  revalidatePath('/');
  revalidatePath('/transactions');
  return newItem;
}

export async function updateInventoryItem(
  sku: string,
  itemData: Partial<Omit<InventoryItem, 'sku' | 'createdAt'>>
) {
  const itemIndex = inventory.findIndex(item => item.sku === sku);
  if (itemIndex === -1) {
    throw new Error('Item not found.');
  }

  inventory[itemIndex] = { ...inventory[itemIndex], ...itemData };
  revalidatePath('/');
  revalidatePath('/analytics');
  return inventory[itemIndex];
}

export async function addTransaction(transactionData: Omit<Transaction, 'id' | 'timestamp'>) {
  const itemIndex = inventory.findIndex(item => item.sku === transactionData.sku);
  if (itemIndex === -1) {
    throw new Error('Item not found.');
  }

  const currentItem = inventory[itemIndex];

  if (transactionData.type === 'OUT') {
    if (currentItem.quantity < transactionData.quantity) {
      throw new Error('Insufficient stock for this transaction.');
    }
    currentItem.quantity -= transactionData.quantity;
  } else {
    currentItem.quantity += transactionData.quantity;
  }

  const newTransaction: Transaction = {
    ...transactionData,
    id: nextTransactionId++,
    timestamp: new Date().toISOString(),
  };
  transactions.unshift(newTransaction);
  inventory[itemIndex] = currentItem;

  revalidatePath('/');
  revalidatePath('/transactions');
  revalidatePath('/analytics');
  return { updatedItem: currentItem, transaction: newTransaction };
}

export async function generateSku(input: { size: InventorySize; color: string }) {
  const result = await generateSkuAI(input);
  return result.sku;
}

export async function getSearchSuggestions(searchTerm: string) {
    if(!searchTerm) return [];
    try {
        const result = await smartSearchAI({ searchTerm });
        return result.suggestions;
    } catch (error) {
        console.error("AI search failed:", error);
        return [];
    }
}
