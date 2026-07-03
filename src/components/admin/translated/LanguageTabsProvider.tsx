import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { LanguageDef } from '@/hooks/useLanguages';

interface LanguageTabsContextType {
  activeLang: string;
  setActiveLang: (code: string) => void;
  languages: LanguageDef[];
}

const LanguageTabsContext = createContext<LanguageTabsContextType | undefined>(undefined);

interface Props {
  languages: LanguageDef[];
  defaultLanguage: string;
  children: ReactNode;
}

export function LanguageTabsProvider({ languages, defaultLanguage, children }: Props) {
  const [activeLang, setActiveLang] = useState(defaultLanguage);

  useEffect(() => {
    if (languages.length > 0 && !languages.some((l) => l.code === activeLang)) {
      setActiveLang(defaultLanguage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languages, defaultLanguage]);

  return (
    <LanguageTabsContext.Provider value={{ activeLang, setActiveLang, languages }}>
      {children}
    </LanguageTabsContext.Provider>
  );
}

export function useLanguageTabs() {
  const context = useContext(LanguageTabsContext);
  if (!context) {
    throw new Error('useLanguageTabs must be used within LanguageTabsProvider');
  }
  return context;
}
