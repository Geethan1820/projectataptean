import { getInventoryItems } from '@/app/actions';
import SizeDistributionChart from '@/components/analytics/size-distribution-chart';
import ColorDistributionChart from '@/components/analytics/color-distribution-chart';
import StockLevelAnalysis from '@/components/analytics/stock-level-analysis';

export default async function AnalyticsPage() {
  const items = await getInventoryItems();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Inventory Analytics</h1>
      
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
