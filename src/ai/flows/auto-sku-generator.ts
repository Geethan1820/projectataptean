// src/ai/flows/auto-sku-generator.ts
'use server';

/**
 * @fileOverview Flow to automatically generate a unique SKU for a polo t-shirt.
 *
 * This file exports:
 * - `generateSku` - A function that generates a unique SKU.
 * - `AutoSkuInput` - The input type for the generateSku function.
 * - `AutoSkuOutput` - The return type for the generateSku function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoSkuInputSchema = z.object({
  size: z.enum(['S', 'M', 'L', 'XL', 'XXL']).describe('The size of the polo shirt.'),
  color: z.string().describe('The color of the polo shirt.'),
  existingSkus: z.array(z.string()).describe('A list of SKUs that are already in use.'),
});
export type AutoSkuInput = z.infer<typeof AutoSkuInputSchema>;

const AutoSkuOutputSchema = z.object({
  sku: z.string().describe('The generated SKU in the format POLO-{SIZE}-{COLOR}-{ID}.'),
});
export type AutoSkuOutput = z.infer<typeof AutoSkuOutputSchema>;

export async function generateSku(input: AutoSkuInput): Promise<AutoSkuOutput> {
  return autoSkuGeneratorFlow(input);
}

const autoSkuGeneratorPrompt = ai.definePrompt({
  name: 'autoSkuGeneratorPrompt',
  input: {schema: AutoSkuInputSchema},
  output: {schema: AutoSkuOutputSchema},
  prompt: `You are a product SKU generator. Given the size and color, generate a unique SKU in the format POLO-{SIZE}-{COLOR}-{ID}.
The ID should be a random 4-digit number.

The generated SKU must NOT be one of the following existing SKUs:
{{{json existingSkus}}}

Size: {{{size}}}
Color: {{{color}}}`,
});

const autoSkuGeneratorFlow = ai.defineFlow(
  {
    name: 'autoSkuGeneratorFlow',
    inputSchema: AutoSkuInputSchema,
    outputSchema: AutoSkuOutputSchema,
  },
  async input => {
    // In a real-world scenario with many SKUs, you would want to implement more robust logic
    // to ensure uniqueness, perhaps with a loop and multiple generation attempts.
    // For this example, we rely on the LLM's ability to follow instructions.
    const {output} = await autoSkuGeneratorPrompt(input);
    return output!;
  }
);