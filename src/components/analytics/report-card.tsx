'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { BIReport } from '@/ai/flows/bi-report-generator';

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  report: BIReport;
  headers: string[];
  keys: string[];
}

export default function ReportCard({
  title,
  description,
  icon,
  report,
  headers,
  keys,
}: ReportCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {report.data.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.data.map((row, index) => (
                  <TableRow key={index}>
                    {keys.map((key) => (
                      <TableCell key={key} className="font-medium">
                        {(row as any)[key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No data available for this report.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
