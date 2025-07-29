import { extractText, ExtractTextFromDocumentOutput, ExtractTextFromDocumentInput } from "@/ai/flows/extract-text-from-document";
import { extractClinicalConcepts, ExtractClinicalConceptsOutput, ExtractClinicalConceptsInput } from "@/ai/flows/extract-clinical-concepts";
import { suggestDiagnoses, SuggestDiagnosesOutput, SuggestDiagnosesInput } from "@/ai/flows/suggest-diagnoses";
import { summarizeClinicalNotes, SummarizeClinicalNotesOutput, SummarizeClinicalNotesInput } from "@/ai/flows/summarize-clinical-notes";
import type { IAProvider } from "@/contexts/ia-provider-context";

type FlowName = 
  | 'extractTextFromDocument'
  | 'extractClinicalConcepts'
  | 'suggestDiagnoses'
  | 'summarizeClinicalNotes';
  
type FlowInputs = {
  extractTextFromDocument: ExtractTextFromDocumentInput;
  extractClinicalConcepts: ExtractClinicalConceptsInput;
  suggestDiagnoses: SuggestDiagnosesInput;
  summarizeClinicalNotes: SummarizeClinicalNotesInput;
};

type FlowOutputs = {
  extractTextFromDocument: ExtractTextFromDocumentOutput;
  extractClinicalConcepts: ExtractClinicalConceptsOutput;
  suggestDiagnoses: SuggestDiagnosesOutput;
  summarizeClinicalNotes: SummarizeClinicalNotesOutput;
};

const genkitFlows = {
  extractTextFromDocument: extractText,
  extractClinicalConcepts,
  suggestDiagnoses,
  summarizeClinicalNotes,
};

const ollamaPrompts = {
  extractTextFromDocument: (input: FlowInputs['extractTextFromDocument']) => `You are a medical document processing expert. You will extract the text from the provided document. The document is provided as a data URI. Return a JSON object with a single key "extractedText" containing the extracted text. Document: ${input.documentDataUri}`,
  extractClinicalConcepts: (input: FlowInputs['extractClinicalConcepts']) => `You are an AI assistant specialized in extracting clinical concepts from medical texts in Spanish. Given the following medical text, extract the key clinical concepts. Return a JSON object with a key "clinicalConcepts" which is an array of strings. Text: ${input.text}`,
  suggestDiagnoses: (input: FlowInputs['suggestDiagnoses']) => `You are an expert medical coder in Spanish. Based on the clinical concepts provided, suggest a list of possible diagnoses using the ${input.codingSystem} system. For each diagnosis, provide the code, a description, and a confidence level ('Alta', 'Media', or 'Baja'). Return a JSON object with a "diagnoses" array. Clinical Concepts: ${input.clinicalConcepts}`,
  summarizeClinicalNotes: (input: FlowInputs['summarizeClinicalNotes']) => `You are an expert medical summarizer. Please summarize the following clinical notes in Spanish, extracting the most important information and details. Return a JSON object with a single key "summary" containing the text. Clinical Notes: ${input.notes}`,
};


export async function runIAFlow<T extends FlowName>(
  flowName: T,
  input: FlowInputs[T],
  provider: IAProvider
): Promise<FlowOutputs[T]> {
  if (provider === 'genkit') {
    const flow = genkitFlows[flowName];
    // This is a type assertion because the generic types are hard to track through the object.
    // It's safe because we know the flowName corresponds to the correct input/output pair.
    return await (flow as any)(input);
  } else {
    const OLLAMA_API_URL = 'http://localhost:11434/api/generate';
    const prompt = ollamaPrompts[flowName](input as any);
    
    const isImageFlow = flowName === 'extractTextFromDocument';
    let images: string[] = [];
    if (isImageFlow && 'documentDataUri' in input && input.documentDataUri) {
      images.push(input.documentDataUri.split(',')[1]);
    }

    const body = {
      model: isImageFlow ? "llava:latest" : "llama3:latest",
      prompt,
      stream: false,
      format: "json",
      ...(isImageFlow && images.length > 0 && { images }),
    };

    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Error en la API de Ollama: ${response.status} ${response.statusText}. Verifique que Ollama esté en ejecución. Detalles: ${errorBody}`);
    }

    const result = await response.json();
    if (result.error) {
        throw new Error(`Error en la API de Ollama: ${result.error}`)
    }
    
    try {
        return JSON.parse(result.response);
    } catch(e) {
        throw new Error(`Ollama ha devuelto un JSON no válido: ${result.response}`);
    }
  }
}
