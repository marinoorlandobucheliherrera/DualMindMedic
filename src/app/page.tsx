'use client';

import { useState } from 'react';
import { IAProviderWrapper } from '@/contexts/ia-provider-context';
import { IAProviderSelector } from '@/components/ia-provider-selector';
import { DocumentProcessor } from '@/components/document-processor';
import { ResultsDisplay } from '@/components/results-display';
import { CodingSystemSelector, CodingSystem } from '@/components/coding-system-selector';

type ResultsState = {
  extractedText?: string;
  summary?: string;
  concepts?: string[];
  diagnoses?: string;
};

function HomePageContent() {
  const [results, setResults] = useState<ResultsState>({});
  const [isBusy, setIsBusy] = useState(false);
  const [codingSystem, setCodingSystem] = useState<CodingSystem>('CIE-10');
  
  const updateResults = (newValues: Partial<ResultsState>) => {
      setResults(prev => ({...prev, ...newValues}));
  };
  
  const clearResults = () => {
    setResults({});
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
          <ResultsDisplay results={results} isLoading={isBusy} />
        </div>
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
