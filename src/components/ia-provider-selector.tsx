'use client';
import { useIAProvider } from '@/contexts/ia-provider-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Cloud, Server } from 'lucide-react';

export function IAProviderSelector() {
  const { iaProvider, setIaProvider } = useIAProvider();

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 22a10 10 0 0 0 10-10h-2a8 8 0 0 1-8 8v2Z"/><path d="M22 12a10 10 0 0 1-10 10v-2a8 8 0 0 0 8-8h2Z"/><path d="M12 2a10 10 0 0 1 10 10h-2a8 8 0 0 0-8-8v-2Z"/><path d="M2 12a10 10 0 0 0 10 10v-2a8 8 0 0 1-8-8H2Z"/><path d="m15.24 9.5-3.53 3.53a.5.5 0 0 1-.71 0l-1.42-1.41a.5.5 0 0 1 0-.71l3.53-3.53a.5.5 0 0 1 .71 0l1.42 1.41a.5.5 0 0 1 0 .71Z"/><path d="M12 12 9.5 9.5"/></svg>
          Motor de IA
        </CardTitle>
        <CardDescription>Elija el motor para procesar los datos.</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={iaProvider} onValueChange={(value) => setIaProvider(value as 'genkit' | 'ollama')} className="gap-4">
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="genkit" id="genkit" />
            <Label htmlFor="genkit" className="flex items-center gap-2 cursor-pointer font-normal text-base">
              <Cloud className="h-5 w-5 text-primary" />
              Google AI (Cloud)
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="ollama" id="ollama" />
            <Label htmlFor="ollama" className="flex items-center gap-2 cursor-pointer font-normal text-base">
              <Server className="h-5 w-5 text-accent" />
              Ollama (Local)
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
