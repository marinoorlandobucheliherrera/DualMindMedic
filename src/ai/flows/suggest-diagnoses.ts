// A Genkit flow for suggesting possible diagnoses based on clinical concepts.

'use server';

/**
 * @fileOverview This file defines a Genkit flow that suggests possible diagnoses based on clinical concepts.
 *
 * - suggestDiagnoses - A function that suggests diagnoses based on clinical concepts.
 * - SuggestDiagnosesInput - The input type for the suggestDiagnoses function.
 * - SuggestDiagnosesOutput - The output type for the suggestDiagnoses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDiagnosesInputSchema = z.object({
  clinicalConcepts: z
    .string()
    .describe('The clinical concepts extracted from the medical text.'),
});
export type SuggestDiagnosesInput = z.infer<typeof SuggestDiagnosesInputSchema>;

const SuggestDiagnosesOutputSchema = z.object({
  diagnoses: z
    .string()
    .describe('The possible diagnoses based on the clinical concepts.'),
});
export type SuggestDiagnosesOutput = z.infer<typeof SuggestDiagnosesOutputSchema>;

export async function suggestDiagnoses(input: SuggestDiagnosesInput): Promise<SuggestDiagnosesOutput> {
  return suggestDiagnosesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDiagnosesPrompt',
  input: {schema: SuggestDiagnosesInputSchema},
  output: {schema: SuggestDiagnosesOutputSchema},
  prompt: `You are an expert medical coder. Based on the clinical concepts provided, suggest possible diagnoses.

Clinical Concepts: {{{clinicalConcepts}}}

Possible Diagnoses:`,
});

const suggestDiagnosesFlow = ai.defineFlow(
  {
    name: 'suggestDiagnosesFlow',
    inputSchema: SuggestDiagnosesInputSchema,
    outputSchema: SuggestDiagnosesOutputSchema,
    retries: 3,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
