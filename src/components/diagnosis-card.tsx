'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GripVertical, Star, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Diagnosis = {
  code: string;
  description: string;
  confidence: 'Alta' | 'Media' | 'Baja';
};

type DiagnosisCardProps = {
  diagnosis: Diagnosis;
  isPrimary: boolean;
  isSelected: boolean;
  onTogglePrimary: () => void;
  onToggleSelected: (isSelected: boolean) => void;
  onDelete: () => void;
};

export function DiagnosisCard({
  diagnosis,
  isPrimary,
  isSelected,
  onTogglePrimary,
  onToggleSelected,
  onDelete,
}: DiagnosisCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: diagnosis.code });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const confidenceStyles = {
    'Alta': 'bg-green-500 hover:bg-green-600',
    'Media': 'bg-yellow-500 hover:bg-yellow-600',
    'Baja': 'bg-red-500 hover:bg-red-600',
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-2 bg-card/80 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2 w-full">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 shrink-0 text-muted-foreground hover:text-foreground">
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="shrink-0">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onToggleSelected(Boolean(checked))}
            aria-label="Seleccionar diagnóstico"
          />
        </div>
        <button onClick={onTogglePrimary} className="p-1 shrink-0">
          <Star className={cn('h-5 w-5 transition-colors', isPrimary ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground hover:text-yellow-300')} />
        </button>
        <code className="font-semibold text-sm shrink-0 w-24 truncate">{diagnosis.code}</code>
        <div className="flex-1 min-w-0">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-muted-foreground truncate cursor-default">
                  {diagnosis.description}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{diagnosis.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="shrink-0">
          <Badge className={cn("text-white", confidenceStyles[diagnosis.confidence])}>
            {diagnosis.confidence}
          </Badge>
        </div>
        <Button size="icon" variant="ghost" onClick={onDelete} className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" aria-label="Eliminar diagnóstico">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
