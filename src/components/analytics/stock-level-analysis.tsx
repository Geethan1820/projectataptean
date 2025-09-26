'use client';

import type { InventoryItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const LOW_STOCK_THRESHOLD = 10;
const DISPLAY_LIMIT = 5;

export default function StockLevelAnalysis({ items }: { items: InventoryItem[] }) {
  // Sort items by quantity
  const sortedItems = [...items].sort((a, b) => a.quantity - b.quantity);

  // Get top 5 low stock items
  const lowStockItems = sortedItems.filter(item => item.quantity <= LOW_STOCK_THRESHOLD).slice(0, DISPLAY_LIMIT);

  // Get top 5 high stock items
  const highStockItems = [...items].sort((a, b) => b.quantity - a.quantity).slice(0, DISPLAY_LIMIT);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Top {DISPLAY_LIMIT} High Stock Items</CardTitle>
          <CardDescription>Items with the highest quantity in your inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable items={highStockItems} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Top {DISPLAY_LIMIT} Low Stock Items</CardTitle>
          <CardDescription>Items that are running low (below {LOW_STOCK_THRESHOLD} units).</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable items={lowStockItems} emptyMessage="No items are currently low on stock. Great job!" />
        </CardContent>
      </Card>
    </div>
  );
}

// Reusable data table component
function DataTable({ items, emptyMessage = "No items to display." }: { items: InventoryItem[], emptyMessage?: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="rounded-md border">
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map(item => (
                <TableRow key={item.sku}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
  );
}
