'use client';
import type { HistoryEntry } from '@/app/page';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, FileText, Trash, Upload, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
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

type HistoryEntryCardProps = {
  entry: HistoryEntry;
  onLoad: () => void;
  onToggleReviewed: (id: string, isReviewed: boolean) => void;
  onDelete: () => void;
};

export function HistoryEntryCard({ entry, onLoad, onToggleReviewed, onDelete }: HistoryEntryCardProps) {

  const handlePreview = () => {
    // This is a placeholder for a more complex preview modal
    alert(`Previsualizando: ${entry.fileName}\n\nResumen: ${entry.summary || 'N/A'}`);
  };

  return (
    <Card className={cn("transition-all", entry.isReviewed ? 'bg-card' : 'border-primary/50')}>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    <span className="truncate max-w-xs">{entry.fileName}</span>
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {format(new Date(entry.timestamp), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })} &bull; {entry.codingSystem}
                </CardDescription>
            </div>
            <Badge variant={entry.isReviewed ? 'secondary' : 'default'} className={cn(entry.isReviewed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>
              {entry.isReviewed ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <AlertCircle className="mr-2 h-4 w-4" />}
              {entry.isReviewed ? 'Revisado' : 'Pendiente'}
            </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
            <strong>Resumen:</strong> {entry.summary || entry.extractedText || 'Sin contenido'}
        </p>
        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
            <span>{entry.concepts?.length || 0} Conceptos</span>
            <span>{entry.diagnoses?.length || 0} Diagnósticos</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-muted/50 p-3">
        <div className="flex items-center space-x-2">
            <Switch
                id={`reviewed-switch-${entry.id}`}
                checked={entry.isReviewed}
                onCheckedChange={(checked) => onToggleReviewed(entry.id, checked)}
            />
            <Label htmlFor={`reviewed-switch-${entry.id}`} className="text-sm cursor-pointer">Marcar como revisado</Label>
        </div>
        <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onLoad}>
                <Upload className="h-4 w-4 mr-2" /> Cargar
            </Button>
            <Button size="sm" variant="ghost" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" /> Previsualizar
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button size="icon" variant="destructive" className="h-9 w-9">
                        <Trash className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar esta entrada?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará esta entrada del historial.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={onDelete}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}
