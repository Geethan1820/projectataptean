import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Archive, AlertTriangle } from 'lucide-react';
import type { InventoryItem } from '@/lib/types';

const LOW_STOCK_THRESHOLD = 10;

export default function StatCards({ items }: { items: InventoryItem[] }) {
  const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalSkus = items.length;
  const lowStockItemsCount = items.filter(item => item.quantity < LOW_STOCK_THRESHOLD).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStock.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Total units available</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
          <Archive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSkus}</div>
          <p className="text-xs text-muted-foreground">Unique products</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          <AlertTriangle className={`h-4 w-4 ${lowStockItemsCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${lowStockItemsCount > 0 ? 'text-destructive' : ''}`}>{lowStockItemsCount}</div>
          <p className="text-xs text-muted-foreground">Items with less than {LOW_STOCK_THRESHOLD} units</p>
        </CardContent>
      </Card>
    </div>
  );
}
