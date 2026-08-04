import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Lang = 'fr' | 'en' | 'ar';

type LangContextType = {
  lang: Lang;
  changeLang: (l: Lang) => void;
};

const LangContext = createContext<LangContextType | undefined>(undefined);

export function LangProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState<Lang>((localStorage.getItem('ezeecad-lang') as Lang) || 'fr');

  useEffect(() => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('ezeecad-lang', lang);
  }, [lang, i18n]);

  const changeLang = (l: Lang) => setLang(l);

  return <LangContext.Provider value={{ lang, changeLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
