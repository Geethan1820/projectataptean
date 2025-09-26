import { z } from 'zod';

export type InventorySize = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface InventoryItem {
  sku: string;
  size: InventorySize;
  color: string;
  price: number;
  quantity: number;
  createdAt: string; // ISO date string
}

export interface Transaction {
  id: number;
  sku: string;
  type: 'IN' | 'OUT';
  quantity: number;
  timestamp: string; // ISO date string
}

// BI Report Types
const ReportDataSchema = z.object({
  sku: z.string(),
  quantity: z.number().optional(),
  totalSold: z.number().optional(),
});

export const BIReportSchema = z.object({
  reportType: z
    .enum(['topMovers', 'lowStock'])
    .describe('The type of the generated report.'),
  data: z
    .array(ReportDataSchema)
    .describe('The structured data for the report.'),
  analysis: z
    .string()
    .describe(
      'A natural language analysis of the report, including insights and recommendations.'
    ),
});

export type BIReport = z.infer<typeof BIReportSchema>;
