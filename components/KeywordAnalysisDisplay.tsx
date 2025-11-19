import React, { useState } from 'react';
import type { UserInput, KeywordAdGroup, KeywordData } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { useCurrency } from '../hooks/useCurrency';
import { generateMoreKeywords } from '../services/geminiService';

interface KeywordAnalysisDisplayProps {
  adGroups: KeywordAdGroup[];
  userInput: UserInput;
}

const KeywordAnalysisDisplay: React.FC<KeywordAnalysisDisplayProps> = ({ adGroups: initialAdGroups, userInput }) => {
  const { t } = useTranslations();
  const { convertAndFormat } = useCurrency(userInput.currency);
  const [adGroups, setAdGroups] = useState(initialAdGroups || []);
  const [loadingGroup, setLoadingGroup] = useState<string | null>(null);

  if (!adGroups || adGroups.length === 0) return null;

  const handleGenerateMore = async (groupName: string) => {
    setLoadingGroup(groupName);
    const group = adGroups.find(g => g.groupName === groupName);
    if (!group) return;

    try {
        const existingKws = group.keywords.map(k => k.keyword);
        const newKws = await generateMoreKeywords(userInput, groupName, existingKws);
        
        setAdGroups(prevGroups => {
            return prevGroups.map(g => {
                if (g.groupName === groupName) {
                    const uniqueNewKws = newKws.filter(newKw => !g.keywords.some(exKw => exKw.keyword === newKw.keyword));
                    return { ...g, keywords: [...g.keywords, ...uniqueNewKws] };
                }
                return g;
            });
        });

    } catch (e) {
        console.error("Failed to generate more keywords", e);
        // Optionally, set an error state to show a message to the user
    } finally {
        setLoadingGroup(null);
    }
  };


  return (
    <div className="space-y-6 pt-4">
      <div className="space-y-4">
        {adGroups.map((group, index) => (
          <div key={index} className="p-4 border border-stone-200 dark:border-gray-700/50 rounded-lg bg-stone-50 dark:bg-gray-800/60">
            <h5 className="font-semibold text-md text-stone-700 dark:text-gray-300 mb-3">{t('adGroup')}: {group.groupName}</h5>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h6 className="font-semibold text-sm text-stone-800 dark:text-gray-200">{t('suggestedKeywords')}</h6>
                        <button 
                            onClick={() => handleGenerateMore(group.groupName)} 
                            disabled={loadingGroup === group.groupName}
                            className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline disabled:opacity-50 disabled:cursor-wait"
                        >
                            {loadingGroup === group.groupName ? t('generatingKeywords') : `+ ${t('generateMoreKeywords')}`}
                        </button>
                    </div>
                    <div className="overflow-x-auto border border-stone-200 dark:border-gray-700/50 rounded-md">
                    <table className="min-w-full text-sm text-left text-stone-800 dark:text-gray-300">
                        <thead className="text-xs text-stone-600 dark:text-gray-300 uppercase bg-stone-100 dark:bg-gray-800">
                        <tr>
                            <th scope="col" className="px-3 py-2">{t('keywordHeader')}</th>
                            <th scope="col" className="px-3 py-2 text-right">{t('volumeHeader')}</th>
                            <th scope="col" className="px-3 py-2 text-right">{t('cpcHeader')}</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200/50 dark:divide-gray-700/50">
                        {group.keywords.map((kw, i) => (
                            <tr key={i}>
                            <td className="px-3 py-2 font-medium text-stone-900 dark:text-gray-100">{kw.keyword}</td>
                            <td className="px-3 py-2 text-right font-mono">{kw.monthlyVolume}</td>
                            <td className="px-3 py-2 text-right font-mono">{convertAndFormat(kw.cpc)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </div>

                 <div>
                    <h6 className="font-semibold text-sm text-stone-800 dark:text-gray-200 mb-2">{t('negativeKeywordsTitle')}</h6>
                    <div className="p-3 bg-white dark:bg-gray-900/50 rounded-md border border-stone-200 dark:border-gray-700/50">
                        <div className="flex flex-wrap gap-1">
                            {group.negativeKeywords?.map((kw, i) => (
                                <span key={i} className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 rounded-full">{kw}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <h6 className="font-semibold text-sm text-stone-800 dark:text-gray-200 mb-2">{t('adCopiesTitle')}</h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.adCopies?.map((ad, adIndex) => (
                        <div key={adIndex} className="p-3 bg-white dark:bg-gray-900/50 rounded-md border border-stone-200 dark:border-gray-700/50">
                            <p className="font-semibold text-blue-600 dark:text-blue-400">{ad.headline}</p>
                            <p className="text-sm text-stone-600 dark:text-gray-400 mt-1">{ad.description}</p>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeywordAnalysisDisplay;