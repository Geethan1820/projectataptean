import { getInventoryItems, getTransactions } from '@/app/actions';
import { generateBiReport } from '@/ai/flows/bi-report-generator';
import ReportCard from '@/components/analytics/report-card';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function ReportsPage() {
  const inventory = await getInventoryItems();
  const transactions = await getTransactions();

  // Generate reports using the AI flow
  const topMoversReport = await generateBiReport({
    reportType: 'topMovers',
    inventory,
    transactions,
    options: { limit: 5 },
  });

  const lowStockReport = await generateBiReport({
    reportType: 'lowStock',
    inventory,
    transactions,
    options: { threshold: 10 },
  });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Business Intelligence Reports</h1>
      <p className="text-muted-foreground">
        AI-generated insights to help you make smarter inventory decisions.
      </p>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <ReportCard
          title="Top 5 Fast-Moving Items"
          description="These are your best-selling products based on recent sales."
          icon={<TrendingUp className="h-6 w-6 text-green-500" />}
          report={topMoversReport}
          headers={['SKU', 'Total Sold']}
          keys={['sku', 'totalSold']}
        />

        <ReportCard
          title="Low Inventory Report"
          description="Items that have fallen below the 10-unit stock threshold."
          icon={<AlertTriangle className="h-6 w-6 text-amber-500" />}
          report={lowStockReport}
          headers={['SKU', 'Remaining Quantity']}
          keys={['sku', 'quantity']}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Analysis & Recommendations</CardTitle>
          <CardDescription>
            Summary of findings from the generated reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">Fast-Movers Analysis</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {topMoversReport.analysis}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Low Stock Recommendations</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {lowStockReport.analysis}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
