import { useTranslations } from './useTranslations';

// A simple hook to get the current language from context
export const useLanguage = () => {
    const { locale } = useTranslations();
    return { locale };
};
