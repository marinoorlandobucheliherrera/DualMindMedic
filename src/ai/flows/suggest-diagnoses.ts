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
  codingSystem: z
    .enum(['CIE-10', 'CIE-11', 'CIE-O'])
    .describe('The diagnostic coding system to use.'),
});
export type SuggestDiagnosesInput = z.infer<typeof SuggestDiagnosesInputSchema>;

const DiagnosisSchema = z.object({
  code: z.string().describe('The diagnosis code.'),
  description: z.string().describe('The description of the diagnosis in Spanish.'),
  confidence: z.enum(['Alta', 'Media', 'Baja']).describe('The confidence level of the diagnosis.'),
});

const SuggestDiagnosesOutputSchema = z.object({
  diagnoses: z
    .array(DiagnosisSchema)
    .describe('A list of possible diagnoses, each with a code, description, and confidence level.'),
});
export type SuggestDiagnosesOutput = z.infer<typeof SuggestDiagnosesOutputSchema>;

export async function suggestDiagnoses(input: SuggestDiagnosesInput): Promise<SuggestDiagnosesOutput> {
  return suggestDiagnosesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDiagnosesPrompt',
  input: {schema: SuggestDiagnosesInputSchema},
  output: {schema: SuggestDiagnosesOutputSchema},
  prompt: `You are an expert medical coder. Based on the clinical concepts provided, suggest a list of possible diagnoses in Spanish using the {{{codingSystem}}} coding system.

For each diagnosis, provide:
1.  The diagnosis code.
2.  A description of the diagnosis in Spanish.
3.  A confidence level for the diagnosis ('Alta', 'Media', or 'Baja').

Clinical Concepts: {{{clinicalConcepts}}}

Return the response as a JSON object with a "diagnoses" array.`,
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
