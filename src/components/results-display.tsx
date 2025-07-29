'use client';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ClipboardList, Sparkles, Stethoscope, Copy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Diagnosis, DiagnosisCard } from './diagnosis-card';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

type Results = {
  summary?: string;
  concepts?: string[];
  diagnoses?: Diagnosis[];
};

type ResultsDisplayProps = {
  results: Results;
  isLoading: boolean;
  onClearDiagnoses: () => void;
};

export function ResultsDisplay({ results, isLoading, onClearDiagnoses }: ResultsDisplayProps) {
  const { summary, concepts } = results;
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setDiagnoses(results.diagnoses || []);
  }, [results.diagnoses]);

  const hasResults = summary || (concepts && concepts.length > 0) || (diagnoses && diagnoses.length > 0);
  
  const sensors = useSensors(
    useSensor(PointerSensor)
  );
  
  function handleDragEnd(event: any) {
    const {active, over} = event;
    
    if (active.id !== over.id) {
      setDiagnoses((items) => {
        const oldIndex = items.findIndex(item => item.code === active.id);
        const newIndex = items.findIndex(item => item.code === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
  
  const copyDiagnoses = () => {
    const textToCopy = diagnoses
      .map(d => `${d.code}: ${d.description} (Confianza: ${d.confidence})`)
      .join('\n');
    navigator.clipboard.writeText(textToCopy);
    toast({ title: "Copiado", description: "Diagnósticos copiados al portapapeles." });
  }
  
  const handleClear = () => {
      setDiagnoses([]);
      onClearDiagnoses();
  }

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Resultados del Análisis</CardTitle>
        <CardDescription>Aquí se mostrarán los resultados generados por la IA.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        {isLoading && !hasResults ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-32 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            </div>
             <div className="space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ) : !hasResults ? (
          <div className="flex h-full items-center justify-center text-center text-muted-foreground py-16">
            <p>Los resultados del análisis aparecerán aquí.</p>
          </div>
        ) : (
          <div className="space-y-6 text-sm flex-grow flex flex-col">
            {summary && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Resumen
                </h3>
                <p className="text-foreground/90 whitespace-pre-wrap rounded-md border p-3 bg-background">{summary}</p>
              </div>
            )}
            
            {summary && (concepts || diagnoses) && <Separator />}

            {concepts && concepts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Conceptos Clínicos
                </h3>
                <div className="flex flex-wrap gap-2">
                  {concepts.map((concept, i) => (
                    <Badge key={i} variant="secondary" className="text-base font-normal">{concept}</Badge>
                  ))}
                </div>
              </div>
            )}

            {(concepts && diagnoses.length > 0) && <Separator />}

            {diagnoses.length > 0 && (
              <div className="space-y-2 flex-grow flex flex-col min-h-0">
                 <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-primary" />
                      Diagnósticos Sugeridos
                    </h3>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={copyDiagnoses}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copiar
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleClear}>
                            <X className="h-4 w-4 mr-2" />
                            Limpiar
                        </Button>
                    </div>
                </div>
                <ScrollArea className="flex-grow pr-4">
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext 
                      items={diagnoses.map(d => d.code)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2 py-2">
                      {diagnoses.map(diag => (
                        <DiagnosisCard key={diag.code} diagnosis={diag} />
                      ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </ScrollArea>
              </div>
            )}
            
            {isLoading && (
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-48" />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
