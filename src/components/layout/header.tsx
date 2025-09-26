import { Package, QrCode, BarChart2 } from 'lucide-react';
import { SmartSearch } from '@/components/smart-search';
import { ThemeToggle } from '@/components/theme-toggle';
import AddItemDialog from '../dashboard/add-item-dialog';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <Package className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              Polo Stock Pilot
            </span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <SmartSearch />
          </div>
          <nav className="flex items-center gap-2">
            <Button asChild variant="outline">
                <Link href="/analytics">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Analytics
                </Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/scan">
                    <QrCode className="mr-2 h-4 w-4" />
                    Scan Item
                </Link>
            </Button>
            <AddItemDialog />
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
