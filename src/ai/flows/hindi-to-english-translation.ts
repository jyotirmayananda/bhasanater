'use server';
/**
 * @fileOverview Translates Hindi text to English text using a cloud-based translation API.
 *
 * - translateHindiToEnglish - A function that handles the translation process.
 * - TranslateHindiToEnglishInput - The input type for the translateHindiToEnglish function.
 * - TranslateHindiToEnglishOutput - The return type for the translateHindiToEnglish function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateHindiToEnglishInputSchema = z.object({
  hindiText: z.string().describe('The Hindi text to translate.'),
});
export type TranslateHindiToEnglishInput = z.infer<
  typeof TranslateHindiToEnglishInputSchema
>;

const TranslateHindiToEnglishOutputSchema = z.object({
  englishText: z.string().describe('The translated English text.'),
});
export type TranslateHindiToEnglishOutput = z.infer<
  typeof TranslateHindiToEnglishOutputSchema
>;

export async function translateHindiToEnglish(input: TranslateHindiToEnglishInput): Promise<TranslateHindiToEnglishOutput> {
  return translateHindiToEnglishFlow(input);
}

const translateHindiToEnglishPrompt = ai.definePrompt({
  name: 'translateHindiToEnglishPrompt',
  input: {schema: TranslateHindiToEnglishInputSchema},
  output: {schema: TranslateHindiToEnglishOutputSchema},
  prompt: `Translate the following Hindi text to English:\n\n{{hindiText}}`,
});

const translateHindiToEnglishFlow = ai.defineFlow(
  {
    name: 'translateHindiToEnglishFlow',
    inputSchema: TranslateHindiToEnglishInputSchema,
    outputSchema: TranslateHindiToEnglishOutputSchema,
  },
  async input => {
    const {output} = await translateHindiToEnglishPrompt(input);
    return output!;
  }
);
