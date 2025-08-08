'use server';

/**
 * @fileOverview A transcription tool that enhances ASR output with alternative word-level transcriptions.
 *
 * - enhanceTranscription - A function that enhances the transcription with alternative word choices.
 * - EnhanceTranscriptionInput - The input type for the enhanceTranscription function.
 * - EnhanceTranscriptionOutput - The return type for the enhanceTranscription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceTranscriptionInputSchema = z.object({
  originalText: z
    .string()
    .describe('The original transcribed text from the ASR service.'),
  alternativeWords: z.array(z.object({
    word: z.string().describe('The primary transcribed word.'),
    alternatives: z.array(z.string()).describe('Alternative word choices for the given word.'),
  })).describe('An array of alternative word choices for each word in the original text.'),
});
export type EnhanceTranscriptionInput = z.infer<typeof EnhanceTranscriptionInputSchema>;

const EnhanceTranscriptionOutputSchema = z.object({
  enhancedText: z.string().describe('The enhanced transcription with alternative word choices included inline.'),
});
export type EnhanceTranscriptionOutput = z.infer<typeof EnhanceTranscriptionOutputSchema>;

export async function enhanceTranscription(input: EnhanceTranscriptionInput): Promise<EnhanceTranscriptionOutput> {
  return enhanceTranscriptionFlow(input);
}

const transcriptionToolPrompt = ai.definePrompt({
  name: 'transcriptionToolPrompt',
  input: {schema: EnhanceTranscriptionInputSchema},
  output: {schema: EnhanceTranscriptionOutputSchema},
  prompt: `You are a helpful assistant designed to enhance the output of an Automatic Speech Recognition (ASR) system.
  Your task is to take the original transcribed text and a list of alternative word choices for specific words and generate an enhanced transcription.
  The enhanced transcription should include the alternative word choices inline, allowing the user to easily understand potential ambiguities in the original transcription and choose the correct word.

  Original Text: {{{originalText}}}

  Alternative Words:
  {{#each alternativeWords}}
    - Word: {{{word}}}, Alternatives: {{#each alternatives}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  {{/each}}

  Please generate the enhanced transcription, clearly indicating the alternative word choices for each ambiguous word.
  Enhanced Text:`, // No Handlebars logic here, just the raw enhanced text.
});

const enhanceTranscriptionFlow = ai.defineFlow(
  {
    name: 'enhanceTranscriptionFlow',
    inputSchema: EnhanceTranscriptionInputSchema,
    outputSchema: EnhanceTranscriptionOutputSchema,
  },
  async input => {
    const {output} = await transcriptionToolPrompt(input);
    return output!;
  }
);
