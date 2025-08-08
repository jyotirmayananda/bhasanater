// This file contains the Genkit flow for transcribing Hindi speech to Hindi text using a cloud-based ASR API, with the option to choose between different Hindi accents.
'use server';

/**
 * @fileOverview A Hindi speech-to-text AI agent.
 *
 * - transcribeHindi - A function that handles the Hindi transcription process.
 * - TranscribeHindiInput - The input type for the transcribeHindi function.
 * - TranscribeHindiOutput - The return type for the transcribeHindi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeHindiInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The audio data URI of the Hindi speech, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  accent: z
    .enum(['Indian', 'General'])
    .describe('The Hindi accent to use for transcription.')
    .optional(),
});
export type TranscribeHindiInput = z.infer<typeof TranscribeHindiInputSchema>;

const TranscribeHindiOutputSchema = z.object({
  transcription: z.string().describe('The transcribed Hindi text.'),
  alternativeTranscriptions: z.array(
      z.object({
        word: z.string(),
        alternatives: z.array(z.string()),
      })
    ).optional().describe('Word-level alternative transcriptions to resolve ambiguity.')
});
export type TranscribeHindiOutput = z.infer<typeof TranscribeHindiOutputSchema>;

export async function transcribeHindi(input: TranscribeHindiInput): Promise<TranscribeHindiOutput> {
  return transcribeHindiFlow(input);
}

const includeAlternativesTool = ai.defineTool({
  name: 'includeAlternatives',
  description: 'Determines whether to include alternative word-level transcriptions to resolve ambiguity.',
  inputSchema: z.object({
    shouldInclude: z.boolean().describe('Whether to include alternative transcriptions.'),
  }),
  outputSchema: z.boolean(),
}, async (input) => {
  return input.shouldInclude;
});

const transcribeHindiPrompt = ai.definePrompt({
  name: 'transcribeHindiPrompt',
  input: {schema: TranscribeHindiInputSchema},
  output: {schema: TranscribeHindiOutputSchema},
  tools: [includeAlternativesTool],
  prompt: `You are an expert Hindi transcriber.

You will transcribe the Hindi speech in the audio to Hindi text.

Accent: {{accent}}

Audio: {{media url=audioDataUri}}

Transcription:`, 
});

const transcribeHindiFlow = ai.defineFlow(
  {
    name: 'transcribeHindiFlow',
    inputSchema: TranscribeHindiInputSchema,
    outputSchema: TranscribeHindiOutputSchema,
  },
  async input => {
    const {output} = await transcribeHindiPrompt(input);
    return output!;
  }
);
