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

export async function addBatchTransactions(
  operations: {
    sku: string;
    update?: Partial<Omit<InventoryItem, 'sku' | 'createdAt'>>;
    transaction?: Omit<Transaction, 'id' | 'timestamp' | 'sku'>;
  }[]
): Promise<{ success: boolean; message: string }> {
  // This is a simulation of a transactional batch operation.
  // 1. Create snapshots of the data.
  const originalInventory = JSON.parse(JSON.stringify(inventory));
  const originalTransactions = JSON.parse(JSON.stringify(transactions));

  try {
    // 2. Try to apply all operations to a temporary copy.
    const tempInventory = JSON.parse(JSON.stringify(inventory));
    const tempTransactions = JSON.parse(JSON.stringify(transactions));
    let tempTransactionId = nextTransactionId;

    for (const op of operations) {
      const itemIndex = tempInventory.findIndex(item => item.sku === op.sku);
      if (itemIndex === -1) {
        throw new Error(`Item with SKU ${op.sku} not found.`);
      }

      // Apply item details update
      if (op.update) {
        tempInventory[itemIndex] = { ...tempInventory[itemIndex], ...op.update };
      }

      // Apply transaction
      if (op.transaction) {
        const currentItem = tempInventory[itemIndex];
        if (op.transaction.type === 'OUT') {
          if (currentItem.quantity < op.transaction.quantity) {
            throw new Error(`Insufficient stock for ${op.sku}. Required: ${op.transaction.quantity}, Available: ${currentItem.quantity}`);
          }
          currentItem.quantity -= op.transaction.quantity;
        } else {
          currentItem.quantity += op.transaction.quantity;
        }

        const newTransaction: Transaction = {
          ...op.transaction,
          sku: op.sku,
          id: tempTransactionId++,
          timestamp: new Date().toISOString(),
        };
        tempTransactions.unshift(newTransaction);
        tempInventory[itemIndex] = currentItem;
      }
    }

    // 3. If all operations succeed, commit the changes to the actual data store.
    inventory = tempInventory;
    transactions = tempTransactions;
    nextTransactionId = tempTransactionId;

    revalidatePath('/');
    revalidatePath('/transactions');
    revalidatePath('/analytics');

    return { success: true, message: 'Batch operations completed successfully.' };

  } catch (error: any) { {
    // 4. If any operation fails, the 'temp' data is discarded and no changes are made.
    // The original data remains untouched.
    console.error("Batch transaction failed, rolling back.", error.message);
    // Restore from snapshot (though in this simple memory store, we just don't commit the temp data)
    inventory = originalInventory;
    transactions = originalTransactions;
    return { success: false, message: `Transaction failed: ${error.message}` };
  }
}
}

export async function generateSku(input: { size: InventorySize; color: string; existingSkus: string[] }) {
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
