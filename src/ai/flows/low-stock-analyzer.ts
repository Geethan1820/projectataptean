'use server';

/**
 * @fileOverview An AI flow to analyze low inventory and generate actionable alerts.
 *
 * This file exports:
 * - `getLowStockAlerts` - A function that analyzes inventory and returns an alert if needed.
 * - `LowStockAlertInput` - The input type for the `getLowStockAlerts` function.
 * - `LowStockAlertOutput` - The return type for the `getLowStockAlerts` function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { InventoryItem } from '@/lib/types';

const LOW_STOCK_THRESHOLD = 10;

const LowStockAlertInputSchema = z.custom<InventoryItem[]>();
export type LowStockAlertInput = z.infer<typeof LowStockAlertInputSchema>;

const LowStockAlertOutputSchema = z.object({
  requiresAttention: z
    .boolean()
    .describe('Whether an alert needs to be raised.'),
  title: z
    .string()
    .describe('A short, catchy title for the alert. Max 5 words.'),
  message: z
    .string()
    .describe(
      'A concise, helpful message for the user, summarizing the low-stock items and suggesting urgency. Mention the number of SKUs affected.'
    ),
  items: z
    .array(z.object({ sku: z.string(), quantity: z.number() }))
    .describe('A list of the low-stock items.'),
});
export type LowStockAlertOutput = z.infer<typeof LowStockAlertOutputSchema>;

export async function getLowStockAlerts(
  items: InventoryItem[]
): Promise<LowStockAlertOutput> {
  const lowStockItems = items.filter(
    (item) => item.quantity < LOW_STOCK_THRESHOLD && item.quantity > 0
  );

  if (lowStockItems.length === 0) {
    return {
      requiresAttention: false,
      title: '',
      message: '',
      items: [],
    };
  }

  // Pass only the relevant items to the AI
  return lowStockAnalyzerFlow(lowStockItems);
}

const lowStockAnalyzerPrompt = ai.definePrompt({
  name: 'lowStockAnalyzerPrompt',
  input: { schema: LowStockAlertInputSchema },
  output: { schema: LowStockAlertOutputSchema },
  prompt: `You are an inventory management AI agent. Your task is to generate a proactive alert for items that are running low on stock.
The user needs a clear, concise summary and a call to action.

Based on the following low-stock items, generate an alert.
- Set requiresAttention to true.
- Create a short, attention-grabbing title.
- Write a message summarizing the situation. Mention the number of SKUs that are low on stock and recommend immediate restocking to prevent sell-outs.
- List the SKUs and their current quantities.

Low Stock Items:
\`\`\`json
{{{json .}}}
\`\`\`
`,
});

const lowStockAnalyzerFlow = ai.defineFlow(
  {
    name: 'lowStockAnalyzerFlow',
    inputSchema: LowStockAlertInputSchema,
    outputSchema: LowStockAlertOutputSchema,
  },
  async (lowStockItems) => {
    if (lowStockItems.length === 0) {
      return {
        requiresAttention: false,
        title: '',
        message: '',
        items: [],
      };
    }
    const { output } = await lowStockAnalyzerPrompt(lowStockItems);
    return output!;
  }
);
