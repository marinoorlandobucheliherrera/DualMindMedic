// src/components/diagnosis-card.tsx
'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GripVertical, Star, Save, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


export type Diagnosis = {
  code: string;
  description: string;
  confidence: 'Alta' | 'Media' | 'Baja';
};

type DiagnosisCardProps = {
  diagnosis: Diagnosis;
  onDelete: (code: string) => void;
};

export function DiagnosisCard({ diagnosis, onDelete }: DiagnosisCardProps) {
  const { toast } = useToast();
  const [isPrimary, setIsPrimary] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: diagnosis.code});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const confidenceStyles = {
    'Alta': { backgroundColor: '#22c55e' }, // green-500
    'Media': { backgroundColor: '#eab308' }, // yellow-500
    'Baja': { backgroundColor: '#ef4444' }, // red-500
  };

  const handleSave = () => {
    toast({
      title: 'Guardado (Simulación)',
      description: `Diagnóstico "${diagnosis.code}" guardado en el historial.`,
    });
  }
  
  const handleDelete = () => {
    onDelete(diagnosis.code);
  }

  return (
    <Card ref={setNodeRef} style={style} className="p-3 bg-card/80">
      <div className="flex items-center gap-2">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
        <Checkbox 
          checked={isSelected}
          onCheckedChange={() => setIsSelected(!isSelected)}
          aria-label="Seleccionar diagnóstico" 
        />
        <button onClick={() => setIsPrimary(!isPrimary)} className="p-1">
          <Star className={cn('h-5 w-5', isPrimary ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
        </button>
        <code className="font-semibold text-sm">{diagnosis.code}</code>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <p className="text-sm text-muted-foreground truncate flex-1 cursor-default">
                      {diagnosis.description}
                    </p>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{diagnosis.description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <Badge style={confidenceStyles[diagnosis.confidence]} className="text-white">
            {diagnosis.confidence}
        </Badge>
        <Button size="icon" variant="ghost" onClick={handleSave} className="h-8 w-8" aria-label="Guardar en Historial">
            <Save className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleDelete} className="h-8 w-8 text-destructive hover:text-destructive" aria-label="Eliminar diagnóstico">
            <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
