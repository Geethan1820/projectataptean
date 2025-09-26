'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { InventoryItem } from '@/lib/types';

// Simple hash function to generate a color from a string
const colorNameToHex = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
}

export default function ColorDistributionChart({ items }: { items: InventoryItem[] }) {
    // Aggregate stock by color
    const colorData = items.reduce((acc, item) => {
        const existing = acc.find(d => d.name === item.color);
        if (existing) {
            existing.value += item.quantity;
        } else {
            acc.push({ name: item.color, value: item.quantity });
        }
        return acc;
    }, [] as { name: string; value: number }[]);
    
    // Assign a color to each data entry
    const chartData = colorData.map(entry => ({
        ...entry,
        fill: entry.name.toLowerCase(),
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Stock by Color</CardTitle>
                <CardDescription>Distribution of inventory across different colors.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={(entry) => `${entry.name} (${entry.value})`}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                borderColor: 'hsl(var(--border))',
                            }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
