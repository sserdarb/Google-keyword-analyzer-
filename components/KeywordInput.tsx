
/**
 * @file Keyword Input Component
 * @description This component provides the main user interface for inputting the keyword, URL, and competitor information to start a new analysis.
 */
import React, { useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import type { UserInput, KeywordLanguage, Currency } from '../types';
import VoiceInputButton from './VoiceInputButton';

interface KeywordInputProps {
  onSubmit: (data: UserInput) => void;
}

const KeywordInput: React.FC<KeywordInputProps> = ({ onSubmit }) => {
  const { t } = useTranslations();
  const [keyword, setKeyword] = useState('');
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState<KeywordLanguage>('tr');
  const [currency, setCurrency] = useState<Currency>('TRY');
  const [competitorUrls, setCompetitorUrls] = useState<string[]>(['']);
  const [targetMarkets, setTargetMarkets] = useState<string[]>([]);
  const [newMarket, setNewMarket] = useState('');
  
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const sanitizeUrl = (input: string): string => {
    return input.replace(/[^a-zA-Z0-9\/:.\-?=&_~#%@!$*()+,;']/g, '');
  };

  const handleCompetitorUrlChange = (index: number, value: string) => {
    const sanitizedValue = sanitizeUrl(value);
    setCompetitorUrls(prev => { const newUrls = [...prev]; newUrls[index] = sanitizedValue; return newUrls; });
  };

  const addCompetitorUrl = () => {
    if (competitorUrls.length < 3) setCompetitorUrls(prev => [...prev, '']);
  };

  const removeCompetitorUrl = (index: number) => {
    setCompetitorUrls(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : ['']);
  };
  
  const addTargetMarket = () => {
      if (newMarket.trim()) {
          setTargetMarkets(prev => [...prev, newMarket.trim()]);
          setNewMarket('');
      }
  };
  
  const removeTargetMarket = (index: number) => {
      setTargetMarkets(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleKeyDownMarket = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          addTargetMarket();
      }
  };

  const handleGetLocation = () => {
      setLocationError(null);
      setLocation(null);
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  setLocation({
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude,
                  });
              },
              (error) => {
                  setLocationError(t('locationError'));
                  console.error("Geolocation error:", error);
              }
          );
      } else {
          setLocationError(t('locationNotSupported'));
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim() && url.trim()) {
      onSubmit({ 
          keyword: keyword.trim(), 
          url: url.trim(), 
          language, 
          currency, 
          competitorUrls: competitorUrls.map(u => u.trim()).filter(Boolean), 
          targetMarkets,
          location: location || undefined 
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
        <form onSubmit={handleSubmit} className="w-full space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                     <div className="flex justify-between items-center mb-1">
                        <label htmlFor="url-input" className="block text-sm font-medium text-stone-700 dark:text-gray-300">{t('urlInputPlaceholder')}</label>
                        <button
                            type="button"
                            onClick={handleGetLocation}
                            className={`flex items-center space-x-1.5 text-xs font-semibold px-2 py-1 rounded-full transition-colors ${
                                location
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                    : 'bg-stone-200 hover:bg-stone-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-stone-700 dark:text-gray-300'
                            }`}
                            title={location ? t('locationActiveTooltip') : t('useLocationButton')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span>{t('useLocationButton')}</span>
                        </button>
                    </div>
                     <div className="relative flex items-center">
                        <input
                            id="url-input"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(sanitizeUrl(e.target.value))}
                            className="w-full p-4 text-lg bg-white dark:bg-gray-900/50 border border-stone-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition-shadow text-stone-900 dark:text-gray-100 pr-12"
                            placeholder={t('urlInputPlaceholder')}
                            required
                        />
                         <VoiceInputButton onTranscript={(t) => setUrl(prev => prev + sanitizeUrl(t))} language={language} className="absolute right-3" />
                     </div>
                     {locationError && <p className="text-xs text-red-500 mt-1">{locationError}</p>}
                 </div>
                 <div>
                     <label htmlFor="keyword-input" className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-1">{t('keywordInputPlaceholder')}</label>
                     <div className="relative flex items-center">
                         <input
                            id="keyword-input"
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full p-4 text-lg bg-white dark:bg-gray-900/50 border border-stone-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition-shadow text-stone-900 dark:text-gray-100 pr-12"
                            placeholder={t('keywordInputPlaceholder')}
                            required
                         />
                         <VoiceInputButton onTranscript={(t) => setKeyword(prev => prev + t)} language={language} className="absolute right-3" />
                     </div>
                 </div>
             </div>

             {/* Target Markets Input */}
             <div className="pt-4 border-t border-stone-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-1">{t('targetMarketsLabel')}</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {targetMarkets.map((market, index) => (
                        <span key={index} className="flex items-center bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                            {market}
                            <button type="button" onClick={() => removeTargetMarket(index)} className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-white">
                                &times;
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newMarket} 
                        onChange={(e) => setNewMarket(e.target.value)}
                        onKeyDown={handleKeyDownMarket}
                        placeholder={t('targetMarketPlaceholder')}
                        className="flex-grow p-3 bg-white dark:bg-gray-900/50 border border-stone-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                    <button 
                        type="button" 
                        onClick={addTargetMarket}
                        className="bg-stone-200 hover:bg-stone-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-stone-700 dark:text-gray-300 font-semibold px-4 py-2 rounded-lg"
                    >
                        {t('add')}
                    </button>
                </div>
             </div>

             {/* Website Competitors */}
             <div className="pt-4 border-t border-stone-200 dark:border-gray-700">
                <h3 className="text-md font-semibold text-stone-800 dark:text-gray-200 mb-2">{t('competitorAnalysisTitle')} (Web)</h3>
                <div className="space-y-3">
                    {competitorUrls.map((competitorUrl, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <div className="relative flex-1 flex items-center">
                                <div className="w-full">
                                    <label htmlFor={`competitor-url-${index}`} className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-1">{t('competitorUrlInputLabel', { number: index + 1 })}</label>
                                    <input
                                        id={`competitor-url-${index}`}
                                        type="url"
                                        value={competitorUrl}
                                        onChange={(e) => handleCompetitorUrlChange(index, e.target.value)}
                                        className="w-full p-3 text-base bg-white dark:bg-gray-900/50 border border-stone-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition-shadow text-stone-900 dark:text-gray-100"
                                        placeholder={t('competitorUrlInputPlaceholder')}
                                    />
                                </div>
                            </div>
                            <button type="button" onClick={() => removeCompetitorUrl(index)} className="p-2 mt-7 text-stone-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" aria-label={`Remove Competitor URL ${index+1}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    ))}
                    {competitorUrls.length < 3 && (
                        <button type="button" onClick={addCompetitorUrl} className="text-sm text-orange-600 dark:text-orange-400 hover:underline">
                            + {t('addCompetitorButton')}
                        </button>
                    )}
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-stone-200 dark:border-gray-700">
                 <div>
                    <label htmlFor="language-select" className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-1">{t('languageSelectLabel')}</label>
                    <select
                        id="language-select"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as KeywordLanguage)}
                        className="w-full p-4 text-lg bg-white dark:bg-gray-900/50 border border-stone-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition-shadow text-stone-900 dark:text-gray-100"
                    >
                        <option value="tr">Türkçe</option>
                        <option value="en">English</option>
                        <option value="de">Deutsch</option>
                        <option value="sv">Svenska</option>
                        <option value="ru">Русский</option>
                    </select>
                 </div>
                  <div>
                    <label htmlFor="currency-select" className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-1">{t('currencySelectLabel')}</label>
                    <select
                        id="currency-select"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as Currency)}
                        className="w-full p-4 text-lg bg-white dark:bg-gray-900/50 border border-stone-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition-shadow text-stone-900 dark:text-gray-100"
                    >
                        <option value="TRY">{t('currencyTRY')}</option>
                        <option value="USD">{t('currencyUSD')}</option>
                        <option value="EUR">{t('currencyEUR')}</option>
                    </select>
                 </div>
             </div>
             <div className="pt-4">
                 <button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none text-lg"
                    disabled={!keyword.trim() || !url.trim()}
                 >
                    {t('analyzeButton')}
                </button>
             </div>
        </form>
    </div>
  );
};

export default KeywordInput;
