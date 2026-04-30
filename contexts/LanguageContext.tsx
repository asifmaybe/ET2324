import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lang } from '../constants/translations';

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('bn');

  useEffect(() => {
    AsyncStorage.getItem('et2324_lang').then(v => {
      if (v === 'en' || v === 'bn') setLang(v);
    });
  }, []);

  const toggleLang = () => {
    setLang(prev => {
      const next = prev === 'bn' ? 'en' : 'bn';
      AsyncStorage.setItem('et2324_lang', next);
      return next;
    });
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}
