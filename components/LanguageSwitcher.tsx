
import React from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { Locale } from '../context/LanguageContext';

const LanguageSwitcher: React.FC = () => {
    const { locale, setLocale } = useTranslations();

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLocale(e.target.value as Locale);
    };

    return (
        <div className="relative">
            <select
                value={locale}
                onChange={handleLanguageChange}
                className="appearance-none py-2 pl-3 pr-8 rounded-full bg-stone-200 dark:bg-gray-700 text-stone-800 dark:text-gray-200 hover:bg-stone-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer text-sm"
                aria-label="Select language"
            >
                <option value="en">EN</option>
                <option value="tr">TR</option>
                <option value="sv">SV</option>
                <option value="de">DE</option>
                <option value="ru">RU</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-700 dark:text-gray-300">
                 <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="http://www.w3.org/2000/svg"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
    );
};

export default LanguageSwitcher;