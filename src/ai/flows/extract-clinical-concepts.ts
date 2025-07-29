'use server';

/**
 * @fileOverview A clinical concept extraction AI agent.
 *
 * - extractClinicalConcepts - A function that handles the clinical concept extraction process.
 * - ExtractClinicalConceptsInput - The input type for the extractClinicalConcepts function.
 * - ExtractClinicalConceptsOutput - The return type for the extractClinicalConcepts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractClinicalConceptsInputSchema = z.object({
  text: z.string().describe('The medical text to extract clinical concepts from.'),
});
export type ExtractClinicalConceptsInput = z.infer<typeof ExtractClinicalConceptsInputSchema>;

const ExtractClinicalConceptsOutputSchema = z.object({
  clinicalConcepts: z
    .array(z.string())
    .describe('The extracted clinical concepts from the medical text.'),
});
export type ExtractClinicalConceptsOutput = z.infer<typeof ExtractClinicalConceptsOutputSchema>;

export async function extractClinicalConcepts(input: ExtractClinicalConceptsInput): Promise<ExtractClinicalConceptsOutput> {
  return extractClinicalConceptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractClinicalConceptsPrompt',
  input: {schema: ExtractClinicalConceptsInputSchema},
  output: {schema: ExtractClinicalConceptsOutputSchema},
  prompt: `You are an AI assistant specialized in extracting clinical concepts from medical texts.

  Given the following medical text, extract the key clinical concepts. Return a list of clinical concepts.

  Text: {{{text}}}`,
});

const extractClinicalConceptsFlow = ai.defineFlow(
  {
    name: 'extractClinicalConceptsFlow',
    inputSchema: ExtractClinicalConceptsInputSchema,
    outputSchema: ExtractClinicalConceptsOutputSchema,
    retries: 3,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
