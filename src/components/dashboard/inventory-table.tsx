'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PackageOpen } from 'lucide-react';
import Image from 'next/image';
import type { InventoryItem } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import UpdateItemDialog from './update-item-dialog';

const LOW_STOCK_THRESHOLD = 10;

export default function InventoryTable({ initialItems }: { initialItems: InventoryItem[] }) {
  const [items, setItems] = React.useState(initialItems);
  const [currentItem, setCurrentItem] = React.useState<InventoryItem | null>(null);
  const [isUpdateOpen, setUpdateOpen] = React.useState(false);
  const emptyStateImage = PlaceHolderImages.find(img => img.id === 'empty-inventory');

  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);
  
  const handleOpenUpdate = (item: InventoryItem) => {
    setCurrentItem(item);
    setUpdateOpen(true);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory</CardTitle>
        <CardDescription>Manage your polo t-shirt stock.</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.sku}
                    className={
                      item.quantity < LOW_STOCK_THRESHOLD && item.quantity > 0
                        ? 'bg-amber-500/10 hover:bg-amber-500/20'
                        : item.quantity === 0 ? 'bg-destructive/10 hover:bg-destructive/20' : ''
                    }
                  >
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>{item.size}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color.toLowerCase() }}></span>
                        {item.color}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(item.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className='flex items-center justify-end gap-2'>
                        {item.quantity < LOW_STOCK_THRESHOLD && (
                          <Badge variant={item.quantity === 0 ? "destructive" : "secondary"}>
                            {item.quantity === 0 ? "Out of Stock" : "Low Stock"}
                          </Badge>
                        )}
                        <span>{item.quantity.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenUpdate(item)}>
                            Update Item / Stock
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 border rounded-md">
            {emptyStateImage && (
                 <Image
                    src={emptyStateImage.imageUrl}
                    alt={emptyStateImage.description}
                    width={200}
                    height={150}
                    data-ai-hint={emptyStateImage.imageHint}
                    className="mb-4 rounded-lg"
                 />
            )}
            <PackageOpen className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No Items Found</h3>
            <p className="text-muted-foreground">
              Your search returned no results, or your inventory is empty.
            </p>
          </div>
        )}
      </CardContent>
      {currentItem && (
        <UpdateItemDialog
          isOpen={isUpdateOpen}
          setIsOpen={setUpdateOpen}
          item={currentItem}
        />
      )}
    </Card>
  );
}
