import { config } from 'dotenv';
config();

import '@/ai/flows/auto-sku-generator.ts';
import '@/ai/flows/smart-search-fuzzy-matching.ts';
import '@/ai/flows/bi-report-generator.ts';
import '@/ai/flows/low-stock-analyzer.ts';
