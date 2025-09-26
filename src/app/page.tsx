import StatCards from '@/components/dashboard/stat-cards';
import InventoryTable from '@/components/dashboard/inventory-table';
import { getInventoryItems } from '@/app/actions';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const searchTerm =
    typeof searchParams?.q === 'string' ? searchParams.q : undefined;
  
  const allItems = await getInventoryItems();

  const displayedItems = searchTerm
    ? allItems.filter(
        (item) =>
          item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.size.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allItems;

  return (
    <div className="flex flex-col gap-8">
      <StatCards items={allItems} />
      <InventoryTable initialItems={displayedItems} />
    </div>
  );
}
