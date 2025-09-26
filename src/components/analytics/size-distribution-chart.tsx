'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { InventoryItem } from '@/lib/types';

export default function SizeDistributionChart({ items }: { items: InventoryItem[] }) {
  // Aggregate stock by size
  const sizeData = items.reduce((acc, item) => {
    const existing = acc.find(d => d.size === item.size);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      acc.push({ size: item.size, quantity: item.quantity });
    }
    return acc;
  }, [] as { size: string; quantity: number }[]);

  // Sort sizes for consistent order
  const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL'];
  sizeData.sort((a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock by Size</CardTitle>
        <CardDescription>Total quantity of items available for each size.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sizeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="size" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
              }}
            />
            <Legend />
            <Bar dataKey="quantity" fill="var(--color-chart-1)" name="Total Stock" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
