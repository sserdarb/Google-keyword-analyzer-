
import React, { createContext, useState, useCallback, useEffect } from 'react';

export type Locale = 'tr' | 'en' | 'sv' | 'de' | 'ru';

interface Translations {
  [key: string]: any;
}

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const savedLocale = localStorage.getItem('locale') as Locale;
      if (savedLocale && ['tr', 'en', 'sv', 'de', 'ru'].includes(savedLocale)) {
        return savedLocale;
      }
    } catch (e) {
      console.warn('Could not read locale from localStorage', e);
    }
    const browserLang = navigator.language?.split(/[-_]/)[0];
    if (['tr', 'en', 'sv', 'de', 'ru'].includes(browserLang)) {
        return browserLang as Locale;
    }
    return 'en';
  });
  
  const [translations, setTranslations] = useState<{ [key in Locale]?: Translations }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const responses = await Promise.all([
          fetch('./locales/tr.json'),
          fetch('./locales/en.json'),
          fetch('./locales/sv.json'),
          fetch('./locales/de.json'),
          fetch('./locales/ru.json'),
        ]);

        for (const response of responses) {
            if (!response.ok) {
                 throw new Error(`Failed to fetch a translation file: ${response.statusText}`);
            }
        }

        const [trData, enData, svData, deData, ruData] = await Promise.all(responses.map(res => res.json()));

        setTranslations({ tr: trData, en: enData, sv: svData, de: deData, ru: ruData });
      } catch (err: any) {
        console.error("Could not load translations:", err);
        setError(`Could not load translations. Please check the network connection and refresh the page. Details: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTranslations();
  }, []);

  const setLocale = (newLocale: Locale) => {
    try {
        localStorage.setItem('locale', newLocale);
    } catch(e) {
        console.warn('Could not save locale to localStorage', e);
    }
    setLocaleState(newLocale);
  };

  const t = useCallback((key: string, replacements?: { [key: string]: string | number }): string => {
    const langPack = translations[locale] || translations['en'] || {};
    let translation = langPack[key] || key;
    
    if (translation === key && locale !== 'en') {
        translation = (translations['en'] || {})[key] || key;
    }

    if (replacements) {
        Object.keys(replacements).forEach(placeholder => {
            translation = translation.replace(`\${${placeholder}}`, String(replacements[placeholder]));
        });
    }
    return translation;
  }, [locale, translations]);

  if (isLoading) {
    return <div className="fixed inset-0 flex items-center justify-center bg-stone-50 dark:bg-gray-900 z-50"><div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-orange-500"></div></div>;
  }

  if (error) {
    return <div className="fixed inset-0 flex items-center justify-center bg-red-100 text-red-700 p-4 text-center z-50">{error}</div>;
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};