'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { IAProviderWrapper } from '@/contexts/ia-provider-context';
import { IAProviderSelector } from '@/components/ia-provider-selector';
import { DocumentProcessor } from '@/components/document-processor';
import { ResultsDisplay } from '@/components/results-display';
import { CodingSystemSelector, CodingSystem } from '@/components/coding-system-selector';
import type { Diagnosis } from '@/components/diagnosis-card';
import { HistoryPanel } from '@/components/history-panel';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export type ResultsState = {
  extractedText?: string;
  summary?: string;
  concepts?: string[];
  diagnoses?: Diagnosis[];
  fileName?: string;
};

export interface HistoryEntry {
  id?: number; // Optional because it's auto-incremented
  timestamp: number;
  fileName: string;
  codingSystem: CodingSystem;
  isReviewed: boolean;
  extractedText: string;
  summary?: string;
  concepts?: string[];
  diagnoses?: Diagnosis[];
  primaryDiagnosis?: string;
  selectedDiagnoses?: string[];
};


function HomePageContent() {
  const [results, setResults] = useState<ResultsState>({});
  const [isBusy, setIsBusy] = useState(false);
  const [codingSystem, setCodingSystem] = useState<CodingSystem>('CIE-10');
  const { toast } = useToast();

  const history = useLiveQuery(() => db.history.orderBy('timestamp').reverse().toArray(), []);

  const updateResults = (newValues: Partial<ResultsState>) => {
      setResults(prev => ({...prev, ...newValues}));
  };
  
  const clearResults = () => {
    setResults({});
  };

  const clearDiagnoses = () => {
    setResults(prev => ({...prev, diagnoses: []}));
  }
  
  const handleSaveToHistory = async (entryData: {primaryDiagnosis?: string; selectedDiagnoses?: string[]}) => {
    if (!results.extractedText && !results.summary) {
      toast({
        variant: 'destructive',
        title: 'Nada que guardar',
        description: 'No hay resultados de análisis para guardar en el historial.',
      });
      return;
    }
    
    const newEntry: HistoryEntry = {
      timestamp: Date.now(),
      fileName: results.fileName || 'Entrada Manual',
      codingSystem: codingSystem,
      isReviewed: false,
      extractedText: results.extractedText || '',
      summary: results.summary,
      concepts: results.concepts,
      diagnoses: results.diagnoses,
      ...entryData,
    };

    try {
      await db.history.add(newEntry);
      toast({
        title: 'Guardado en el historial',
        description: `La entrada "${newEntry.fileName}" ha sido guardada.`,
      });
    } catch (error) {
      console.error("Failed to save to history:", error);
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: 'No se pudo guardar la entrada en el historial.',
      });
    }
  };
  
  const handleLoadFromHistory = (entry: HistoryEntry) => {
    setCodingSystem(entry.codingSystem);
    setResults({
      fileName: entry.fileName,
      extractedText: entry.extractedText,
      summary: entry.summary,
      concepts: entry.concepts,
      diagnoses: entry.diagnoses,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast({ title: 'Entrada Cargada', description: `Se cargaron los datos de "${entry.fileName}".`});
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary font-headline">DualMind Medic</h1>
          <p className="text-muted-foreground mt-2">Asistente de codificación y análisis clínico con IA dual</p>
        </header>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
          <IAProviderSelector />
          <CodingSystemSelector value={codingSystem} onChange={setCodingSystem} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 items-start">
          <DocumentProcessor 
              onUpdateResults={updateResults} 
              onClearResults={clearResults} 
              onBusyChange={setIsBusy}
              codingSystem={codingSystem}
          />
          <ResultsDisplay 
            results={results} 
            isLoading={isBusy} 
            onClearDiagnoses={clearDiagnoses}
            onSave={handleSaveToHistory} 
          />
        </div>
        
        <Separator className="my-12" />
        
        <HistoryPanel 
          history={history || []}
          onLoad={handleLoadFromHistory}
        />
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <IAProviderWrapper>
      <HomePageContent />
    </IAProviderWrapper>
  );
}
