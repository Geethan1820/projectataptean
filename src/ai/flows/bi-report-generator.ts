'use server';

/**
 * @fileOverview A business intelligence flow for generating inventory reports.
 *
 * This file exports:
 * - `generateBiReport` - A function that creates a BI report based on the specified type.
 * - `BIReportInput` - The input type for the `generateBiReport` function.
 * - `BIReport` - The output type for the `generateBiReport` function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { InventoryItem, Transaction, BIReport } from '@/lib/types';
import { BIReportSchema } from '@/lib/types';

const BIReportInputSchema = z.object({
  reportType: z.enum(['topMovers', 'lowStock']),
  inventory: z.custom<InventoryItem[]>(),
  transactions: z.custom<Transaction[]>(),
  options: z.object({
    limit: z.number().optional(),
    threshold: z.number().optional(),
  }),
});
export type BIReportInput = z.infer<typeof BIReportInputSchema>;

export async function generateBiReport(input: BIReportInput): Promise<BIReport> {
  return biReportGeneratorFlow(input);
}

const biReportGeneratorPrompt = ai.definePrompt({
  name: 'biReportGeneratorPrompt',
  input: { schema: BIReportInputSchema },
  output: { schema: BIReportSchema },
  prompt: `You are a Business Intelligence Analyst for a Polo T-shirt company.
Your task is to generate a report based on the provided inventory and transaction data.

Report Type Requested: {{{reportType}}}

{{#if options.limit}}
Report Options:
- Limit: {{{options.limit}}} items
{{/if}}

{{#if options.threshold}}
Report Options:
- Low Stock Threshold: {{{options.threshold}}} units
{{/if}}

Please analyze the data and provide the following:
1.  **Structured Data**: Compile the data for the report according to the output schema.
2.  **Analysis**: Write a brief, insightful analysis of the findings. If it's a 'topMovers' report, explain what makes these items popular. If it's a 'lowStock' report, suggest the urgency of restocking.

Here is the raw data:

**Current Inventory:**
\`\`\`json
{{{json inventory}}}
\`\`\`

**Transaction History:**
\`\`\`json
{{{json transactions}}}
\`\`\`
`,
});

const biReportGeneratorFlow = ai.defineFlow(
  {
    name: 'biReportGeneratorFlow',
    inputSchema: BIReportInputSchema,
    outputSchema: BIReportSchema,
  },
  async (input) => {
    // Here, you could add pre-processing logic in a real-world scenario.
    // For this example, we pass the data directly to the LLM.
    const { output } = await biReportGeneratorPrompt(input);
    return output!;
  }
);
