import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '@/lib/translations';
import { useLanguages } from '@/hooks/useLanguages';

export type Language = string;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['uz'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { languages, defaultLanguage, loading } = useLanguages();
  const [language, setLanguageState] = useState<Language>(() => {
    return localStorage.getItem('furniture-language') || 'uz';
  });

  useEffect(() => {
    if (loading) return;
    const activeCodes = languages.map((l) => l.code);
    if (activeCodes.length > 0 && !activeCodes.includes(language)) {
      setLanguageState(defaultLanguage);
    }
  }, [loading, languages, defaultLanguage, language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('furniture-language', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (translations as Record<string, typeof translations['uz']>)[language]
    ?? (translations as Record<string, typeof translations['uz']>)[defaultLanguage]
    ?? translations.uz;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
