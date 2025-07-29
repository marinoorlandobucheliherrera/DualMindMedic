'use server';
/**
 * @fileOverview Summarizes clinical notes using AI.
 *
 * - summarizeClinicalNotes - A function that handles the summarization of clinical notes.
 * - SummarizeClinicalNotesInput - The input type for the summarizeClinicalNotes function.
 * - SummarizeClinicalNotesOutput - The return type for the summarizeClinicalNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeClinicalNotesInputSchema = z.object({
  notes: z.string().describe('The clinical notes to summarize.'),
});
export type SummarizeClinicalNotesInput = z.infer<typeof SummarizeClinicalNotesInputSchema>;

const SummarizeClinicalNotesOutputSchema = z.object({
  summary: z.string().describe('The summary of the clinical notes.'),
});
export type SummarizeClinicalNotesOutput = z.infer<typeof SummarizeClinicalNotesOutputSchema>;

export async function summarizeClinicalNotes(input: SummarizeClinicalNotesInput): Promise<SummarizeClinicalNotesOutput> {
  return summarizeClinicalNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeClinicalNotesPrompt',
  input: {schema: SummarizeClinicalNotesInputSchema},
  output: {schema: SummarizeClinicalNotesOutputSchema},
  prompt: `You are an expert medical summarizer.

  Please summarize the following clinical notes, extracting the most important information and details:

  Clinical Notes: {{{notes}}}`,
});

const summarizeClinicalNotesFlow = ai.defineFlow(
  {
    name: 'summarizeClinicalNotesFlow',
    inputSchema: SummarizeClinicalNotesInputSchema,
    outputSchema: SummarizeClinicalNotesOutputSchema,
    retries: 3,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
