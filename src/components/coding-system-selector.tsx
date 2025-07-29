// src/components/coding-system-selector.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BookMarked } from 'lucide-react';

export type CodingSystem = 'CIE-10' | 'CIE-11' | 'CIE-O';

type CodingSystemSelectorProps = {
  value: CodingSystem;
  onChange: (value: CodingSystem) => void;
};

export function CodingSystemSelector({ value, onChange }: CodingSystemSelectorProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
            <BookMarked className="h-6 w-6" />
            Codificación
        </CardTitle>
        <CardDescription>Elija el sistema de codificación para diagnósticos.</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={value} onValueChange={(value) => onChange(value as CodingSystem)} className="gap-4">
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="CIE-10" id="cie10" />
            <Label htmlFor="cie10" className="cursor-pointer font-normal text-base">CIE-10</Label>
          </div>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="CIE-11" id="cie11" />
            <Label htmlFor="cie11" className="cursor-pointer font-normal text-base">CIE-11</Label>
          </div>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="CIE-O" id="cie-o" />
            <Label htmlFor="cie-o" className="cursor-pointer font-normal text-base">CIE-O</Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
