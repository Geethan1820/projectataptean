'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BellRing, ChevronDown } from 'lucide-react';
import type { LowStockAlertOutput } from '@/ai/flows/low-stock-analyzer';

interface LowStockAlertProps {
  alert: LowStockAlertOutput;
}

export default function LowStockAlert({ alert }: LowStockAlertProps) {
  return (
    <Alert className="border-amber-500/50 text-amber-600 dark:border-amber-500 [&>svg]:text-amber-600">
      <BellRing className="h-4 w-4" />
      <div className="flex items-center justify-between">
        <div>
          <AlertTitle className="font-bold">{alert.title}</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            View Details
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Dismiss</DropdownMenuItem>
              <DropdownMenuItem>Snooze for 24 hours</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Alert>
  );
}
