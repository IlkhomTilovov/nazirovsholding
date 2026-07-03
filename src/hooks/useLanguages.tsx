import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LanguageDef {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
}

interface LanguagesContextType {
  languages: LanguageDef[];
  allLanguages: LanguageDef[];
  defaultLanguage: string;
  loading: boolean;
  refetch: () => Promise<void>;
}

const FALLBACK_LANGUAGES: LanguageDef[] = [
  { id: 'fallback-uz', code: 'uz', name: "O'zbekcha", isActive: true, isDefault: true, sortOrder: 0 },
  { id: 'fallback-ru', code: 'ru', name: 'Русский', isActive: true, isDefault: false, sortOrder: 1 },
];

const LanguagesContext = createContext<LanguagesContextType | undefined>(undefined);

export function LanguagesProvider({ children }: { children: ReactNode }) {
  const [allLanguages, setAllLanguages] = useState<LanguageDef[]>(FALLBACK_LANGUAGES);
  const [loading, setLoading] = useState(true);

  const fetchLanguages = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) {
      console.error('Failed to load languages:', error.message);
    } else if (data && data.length > 0) {
      setAllLanguages(
        (data as any[]).map((l) => ({
          id: l.id,
          code: l.code,
          name: l.name,
          isActive: l.is_active,
          isDefault: l.is_default,
          sortOrder: l.sort_order,
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  const languages = allLanguages.filter((l) => l.isActive);
  const defaultLanguage = allLanguages.find((l) => l.isDefault)?.code || languages[0]?.code || 'uz';

  return (
    <LanguagesContext.Provider value={{ languages, allLanguages, defaultLanguage, loading, refetch: fetchLanguages }}>
      {children}
    </LanguagesContext.Provider>
  );
}

export function useLanguages() {
  const context = useContext(LanguagesContext);
  if (!context) {
    throw new Error('useLanguages must be used within LanguagesProvider');
  }
  return context;
}
