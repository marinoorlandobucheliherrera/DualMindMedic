'use client';
import { useState, useMemo } from 'react';
import type { HistoryEntry } from '@/app/page';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Import, FileDown, Trash2 } from 'lucide-react';
import { HistoryEntryCard } from './history-entry-card';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type HistoryPanelProps = {
  history: HistoryEntry[];
  onLoad: (entry: HistoryEntry) => void;
};

type FilterStatus = 'all' | 'reviewed' | 'pending';

export function HistoryPanel({ history, onLoad }: HistoryPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const { toast } = useToast();

  const filteredHistory = useMemo(() => {
    return (history || [])
      .filter(entry => {
        if (filterStatus === 'all') return true;
        return filterStatus === 'reviewed' ? entry.isReviewed : !entry.isReviewed;
      })
      .filter(entry => {
        if (!searchTerm) return true;
        const lowerSearch = searchTerm.toLowerCase();
        const searchIn = [
          entry.fileName,
          entry.extractedText,
          entry.summary,
          entry.isReviewed ? 'revisado' : 'pendiente',
          ...(entry.concepts || []),
          ...(entry.diagnoses?.map(d => `${d.code} ${d.description}`) || []),
        ].join(' ').toLowerCase();
        return searchIn.includes(lowerSearch);
      });
  }, [history, searchTerm, filterStatus]);

  const handleToggleReviewed = async (id: number, isReviewed: boolean) => {
    try {
      await db.history.update(id, { isReviewed });
    } catch (error) {
      console.error("Failed to toggle reviewed status:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar el estado de revisión.' });
    }
  };

  const handleDeleteEntry = async (id: number) => {
    try {
      await db.history.delete(id);
      toast({ title: 'Entrada eliminada', description: 'La entrada ha sido eliminada del historial.' });
    } catch (error) {
      console.error("Failed to delete entry:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar la entrada.' });
    }
  };

  const handleClearHistory = async () => {
    try {
      await db.history.clear();
      toast({ title: 'Historial borrado', description: 'Todas las entradas han sido eliminadas.' });
    } catch (error) {
      console.error("Failed to clear history:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo borrar el historial.' });
    }
  };
  
  const exportToJson = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'dualmint_medic_history.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast({ title: 'Historial exportado a JSON'});
  };
  
  const importFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("El archivo no es de texto.");
        const importedHistory: HistoryEntry[] = JSON.parse(text);

        if (Array.isArray(importedHistory) && importedHistory.every(item => 'timestamp' in item && 'fileName' in item)) {
          await db.transaction('rw', db.history, async () => {
            await db.history.clear();
            await db.history.bulkAdd(importedHistory);
          });
          toast({ title: 'Historial importado', description: 'El historial ha sido cargado desde el archivo JSON.' });
        } else {
          throw new Error('El archivo JSON no tiene el formato correcto.');
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error de importación', description: error instanceof Error ? error.message : 'No se pudo procesar el archivo.'});
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };
  
  const exportToCsv = () => {
     let csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Timestamp,File Name,Reviewed,Coding System,Primary Diagnosis,Selected Diagnoses,Extracted Text,Summary,Concepts,Diagnoses\n";

    (history || []).forEach(entry => {
        const row = [
            `"${entry.id}"`,
            `"${new Date(entry.timestamp).toISOString()}"`,
            `"${entry.fileName}"`,
            entry.isReviewed,
            `"${entry.codingSystem}"`,
            `"${entry.primaryDiagnosis || ''}"`,
            `"${(entry.selectedDiagnoses || []).join(', ')}"`,
            `"${(entry.extractedText || '').replace(/"/g, '""')}"`,
            `"${(entry.summary || '').replace(/"/g, '""')}"`,
            `"${(entry.concepts || []).join('; ')}"`,
            `"${(entry.diagnoses || []).map(d => `${d.code}:${d.description}`).join('; ')}"`
        ].join(',');
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "dualmint_medic_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Historial exportado a CSV'});
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <CardTitle>Historial de Análisis</CardTitle>
                <CardDescription>
                  {filteredHistory.length} de {(history || []).length} entradas mostradas.
                </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => document.getElementById('import-json-input')?.click()}>
                    <Import className="mr-2 h-4 w-4" /> Importar JSON
                </Button>
                <input type="file" id="import-json-input" className="hidden" accept=".json" onChange={importFromJson}/>
                <Button variant="outline" size="sm" onClick={exportToJson} disabled={!history || history.length === 0}>
                    <FileDown className="mr-2 h-4 w-4" /> Exportar JSON
                </Button>
                <Button variant="outline" size="sm" onClick={exportToCsv} disabled={!history || history.length === 0}>
                    <FileDown className="mr-2 h-4 w-4" /> Exportar CSV
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={!history || history.length === 0}>
                        <Trash2 className="mr-2 h-4 w-4" /> Borrar Todo
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente todo el historial de análisis.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearHistory}>Continuar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar en el historial..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterStatus)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Estados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="reviewed">Revisados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {filteredHistory.length > 0 ? (
            <div className="space-y-4">
              {filteredHistory.map((entry) => (
                <HistoryEntryCard
                  key={entry.id}
                  entry={entry}
                  onLoad={() => onLoad(entry)}
                  onToggleReviewed={(isReviewed) => handleToggleReviewed(entry.id!, isReviewed)}
                  onDelete={() => handleDeleteEntry(entry.id!)}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No se encontraron entradas en el historial.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
