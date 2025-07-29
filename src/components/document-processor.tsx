'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Loader2, ClipboardList, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { runIAFlow } from '@/lib/ai-client';
import { useIAProvider } from '@/contexts/ia-provider-context';
import type { CodingSystem } from './coding-system-selector';
import type { Diagnosis } from './diagnosis-card';

type ResultsState = {
  extractedText?: string;
  summary?: string;
  concepts?: string[];
  diagnoses?: Diagnosis[];
};

type DocumentProcessorProps = {
  onUpdateResults: (results: Partial<ResultsState>) => void;
  onClearResults: () => void;
  onBusyChange: (isBusy: boolean) => void;
  codingSystem: CodingSystem;
};

export function DocumentProcessor({ onUpdateResults, onClearResults, onBusyChange, codingSystem }: DocumentProcessorProps) {
  const { toast } = useToast();
  const { iaProvider } = useIAProvider();
  const [text, setText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isProcessingConcepts, setIsProcessingConcepts] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    onClearResults();
    setText('');
    setIsExtracting(true);
    onBusyChange(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const dataUri = reader.result as string;
          const result = await runIAFlow('extractTextFromDocument', { documentDataUri: dataUri }, iaProvider);
          const extracted = result.extractedText;
          setText(extracted);
          onUpdateResults({ extractedText: extracted });
          toast({ title: 'Texto extraído', description: `Se extrajo el texto de ${file.name}.` });
        } catch (err) {
            console.error(err);
            toast({ variant: 'destructive', title: 'Error de extracción', description: err instanceof Error ? err.message : 'No se pudo extraer el texto del documento.' });
        } finally {
            setIsExtracting(false);
            onBusyChange(false);
        }
      };
      reader.onerror = (error) => {
        console.error("File reading error:", error);
        toast({ variant: 'destructive', title: 'Error de Archivo', description: 'No se pudo leer el archivo seleccionado.'});
        setIsExtracting(false);
        onBusyChange(false);
      }
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Error de Archivo', description: 'Ocurrió un error al procesar el archivo.'});
      setIsExtracting(false);
      onBusyChange(false);
    }
  };
  
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(event.target.value);
      onClearResults();
  };

  const handleSummarize = async () => {
    if (!text) {
        toast({ variant: 'destructive', title: 'Texto vacío', description: 'Por favor, ingrese texto para resumir.' });
        return;
    }
    setIsSummarizing(true);
    onBusyChange(true);
    try {
        const result = await runIAFlow('summarizeClinicalNotes', { notes: text }, iaProvider);
        onUpdateResults({ summary: result.summary });
        toast({ title: 'Resumen generado' });
    } catch (err) {
        console.error(err);
        toast({ variant: 'destructive', title: 'Error de resumen', description: err instanceof Error ? err.message : 'No se pudo generar el resumen.' });
    } finally {
        setIsSummarizing(false);
        onBusyChange(false);
    }
  };
  
  const handleExtractAndDiagnose = async () => {
    if (!text) {
        toast({ variant: 'destructive', title: 'Texto vacío', description: 'Por favor, ingrese texto para procesar.' });
        return;
    }
    setIsProcessingConcepts(true);
    onBusyChange(true);
    try {
        const conceptsResult = await runIAFlow('extractClinicalConcepts', { text: text }, iaProvider);
        const concepts = conceptsResult.clinicalConcepts;
        toast({ title: 'Conceptos extraídos' });

        const diagnosesResult = await runIAFlow('suggestDiagnoses', { clinicalConcepts: concepts.join(', '), codingSystem: codingSystem }, iaProvider);
        
        onUpdateResults({ concepts: concepts, diagnoses: diagnosesResult.diagnoses });
        toast({ title: 'Diagnósticos sugeridos' });
    } catch (err) {
        console.error(err);
        toast({ variant: 'destructive', title: 'Error de procesamiento', description: err instanceof Error ? err.message : 'No se pudieron generar los conceptos o diagnósticos.' });
    } finally {
        setIsProcessingConcepts(false);
        onBusyChange(false);
    }
  };

  const isBusy = isExtracting || isSummarizing || isProcessingConcepts;

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText />
          Notas Clínicas
        </CardTitle>
        <CardDescription>Cargue un documento o pegue el texto clínico para analizar.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <div className="relative">
          <Input id="file-upload" type="file" onChange={handleFileChange} className="w-full" disabled={isBusy} accept="image/*,.pdf" />
          {isExtracting && <Loader2 className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />}
        </div>
        <Textarea 
          placeholder="O pegue el texto aquí..."
          className="flex-grow min-h-[250px] resize-none"
          value={text}
          onChange={handleTextChange}
          disabled={isBusy}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button onClick={handleSummarize} disabled={isBusy || !text}>
                {isSummarizing ? <Loader2 className="animate-spin mr-2"/> : <ClipboardList className="mr-2 h-4 w-4"/>}
                Generar Resumen
            </Button>
            <Button onClick={handleExtractAndDiagnose} disabled={isBusy || !text}>
                {isProcessingConcepts ? <Loader2 className="animate-spin mr-2"/> : <Stethoscope className="mr-2 h-4 w-4"/>}
                Conceptos y Diagnósticos
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
