'use client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ClipboardList, Sparkles, Stethoscope } from 'lucide-react';

type Results = {
  summary?: string;
  concepts?: string[];
  diagnoses?: string;
};

type ResultsDisplayProps = {
  results: Results;
  isLoading: boolean;
};

export function ResultsDisplay({ results, isLoading }: ResultsDisplayProps) {
  const { summary, concepts, diagnoses } = results;

  const hasResults = summary || (concepts && concepts.length > 0) || diagnoses;

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Resultados del Análisis</CardTitle>
        <CardDescription>Aquí se mostrarán los resultados generados por la IA.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {isLoading ? (
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
          <div className="space-y-6 text-sm">
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

            {(concepts && diagnoses) && <Separator />}

            {diagnoses && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Diagnósticos Sugeridos
                </h3>
                <p className="text-foreground/90 whitespace-pre-wrap rounded-md border p-3 bg-background">{diagnoses}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
