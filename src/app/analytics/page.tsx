import { getInventoryItems, getTransactions } from '@/app/actions';
import SizeDistributionChart from '@/components/analytics/size-distribution-chart';
import ColorDistributionChart from '@/components/analytics/color-distribution-chart';
import StockLevelAnalysis from '@/components/analytics/stock-level-analysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText } from 'lucide-react';

export default async function AnalyticsPage() {
  const items = await getInventoryItems();
  const transactions = await getTransactions();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Analytics</h1>
        <Button asChild>
          <Link href="/analytics/reports">
            <FileText className="mr-2 h-4 w-4" />
            View Reports
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SizeDistributionChart items={items} />
        </div>
        <ColorDistributionChart items={items} />
      </div>

      <div>
        <StockLevelAnalysis items={items} />
      </div>
    </div>
  );
}
