'use client';

import React, { createContext, useContext } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';

export type IAProvider = 'genkit' | 'ollama';

interface IAProviderContextType {
  iaProvider: IAProvider;
  setIaProvider: (provider: IAProvider) => void;
}

const IAProviderContext = createContext<IAProviderContextType | undefined>(undefined);

export const IAProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [iaProvider, setIaProvider] = useLocalStorage<IAProvider>('iaProvider', 'genkit');

  return (
    <IAProviderContext.Provider value={{ iaProvider, setIaProvider }}>
      {children}
    </IAProviderContext.Provider>
  );
};

export const useIAProvider = () => {
  const context = useContext(IAProviderContext);
  if (context === undefined) {
    throw new Error('useIAProvider must be used within a IAProviderWrapper');
  }
  return context;
};
