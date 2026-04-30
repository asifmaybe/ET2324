import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { t, T } from '../constants/translations';

export function useLang() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLang must be used within LanguageProvider');

  const { lang, toggleLang } = context;

  const tr = (key: keyof typeof T) => t(key, lang);

  return { lang, toggleLang, tr };
}
