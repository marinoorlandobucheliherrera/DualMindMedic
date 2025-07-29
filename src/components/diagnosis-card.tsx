// src/components/diagnosis-card.tsx
'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GripVertical, Star, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


export type Diagnosis = {
  code: string;
  description: string;
  confidence: 'Alta' | 'Media' | 'Baja';
};

type DiagnosisCardProps = {
  diagnosis: Diagnosis;
};

export function DiagnosisCard({ diagnosis }: DiagnosisCardProps) {
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
  
  const confidenceColor = {
    'Alta': 'bg-green-500 hover:bg-green-500/90',
    'Media': 'bg-yellow-500 hover:bg-yellow-500/90',
    'Baja': 'bg-red-500 hover:bg-red-500/90',
  };

  const handleSave = () => {
    toast({
      title: 'Guardado (Simulación)',
      description: `Diagnóstico "${diagnosis.code}" guardado en el historial.`,
    });
  }

  return (
    <Card ref={setNodeRef} style={style} className="p-3 flex flex-col gap-2 bg-card/80">
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
        <Badge className={cn("text-white", confidenceColor[diagnosis.confidence])}>
            {diagnosis.confidence}
        </Badge>
      </div>
      <CardFooter className="p-0 justify-end">
        <Button size="sm" variant="ghost" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Guardar en Historial
        </Button>
      </CardFooter>
    </Card>
  );
}
