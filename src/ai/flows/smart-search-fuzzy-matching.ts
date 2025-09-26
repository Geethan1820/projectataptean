'use server';

/**
 * @fileOverview Implements smart search with fuzzy matching for polo t-shirts.
 *
 * This file exports:
 * - `smartSearch`: A function that suggests relevant search terms based on fuzzy matching.
 * - `SmartSearchInput`: The input type for the `smartSearch` function.
 * - `SmartSearchOutput`: The output type for the `smartSearch` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartSearchInputSchema = z.object({
  searchTerm: z
    .string()
    .describe('The search term provided by the user (SKU, size, or color).'),
});
export type SmartSearchInput = z.infer<typeof SmartSearchInputSchema>;

const SmartSearchOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested search terms based on fuzzy matching.'),
});
export type SmartSearchOutput = z.infer<typeof SmartSearchOutputSchema>;

export async function smartSearch(input: SmartSearchInput): Promise<SmartSearchOutput> {
  return smartSearchFlow(input);
}

const smartSearchPrompt = ai.definePrompt({
  name: 'smartSearchPrompt',
  input: {schema: SmartSearchInputSchema},
  output: {schema: SmartSearchOutputSchema},
  prompt: `You are a search assistant for an inventory management system specializing in polo t-shirts.
  The user is searching for a polo t-shirt by SKU, size, or color.
  Your task is to provide suggested search terms based on fuzzy matching of the user's input.
  Return a maximum of 5 suggestions.

  User's search term: {{{searchTerm}}}
  Suggestions:`,
});

const smartSearchFlow = ai.defineFlow(
  {
    name: 'smartSearchFlow',
    inputSchema: SmartSearchInputSchema,
    outputSchema: SmartSearchOutputSchema,
  },
  async input => {
    const {output} = await smartSearchPrompt(input);
    return output!;
  }
);
