// src/app/transactions/page.tsx
import { getTransactions } from '@/app/actions';
import TransactionsTable from '@/components/transactions/transactions-table';

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Transaction History</h1>
      <TransactionsTable transactions={transactions} />
    </div>
  );
}
