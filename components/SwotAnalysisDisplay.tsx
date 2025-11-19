import React from 'react';
import type { SwotAnalysis, SwotOpportunity } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface SwotAnalysisDisplayProps {
  data: SwotAnalysis;
}

const SwotAnalysisDisplay: React.FC<SwotAnalysisDisplayProps> = ({ data }) => {
  const { t } = useTranslations();
  if (!data) return null;

  const SWOTCard: React.FC<{ title: string; items: string[]; className: string }> = ({ title, items, className }) => (
    <div className={`p-4 rounded-lg ${className}`}>
      <h4 className="font-semibold mb-2">{title}</h4>
      <ul className="space-y-1 list-disc list-inside text-sm">
        {Array.isArray(items) && items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    </div>
  );
  
  const OpportunitiesCard: React.FC<{ title: string; items: SwotOpportunity[]; className: string }> = ({ title, items, className }) => (
    <div className={`p-4 rounded-lg ${className}`}>
        <h4 className="font-semibold mb-2">{title}</h4>
        <ul className="space-y-4 text-sm">
            {Array.isArray(items) && items.map((item, index) => (
                <li key={index} className="space-y-2">
                    <div className="flex items-start gap-2">
                        <span className="mt-1 text-blue-400">&#9670;</span>
                        <span className="font-semibold">{item.opportunity}</span>
                    </div>
                    <div className="pl-6 mt-1 space-y-2 text-xs opacity-95">
                        {Array.isArray(item.contentIdeas) && item.contentIdeas.map((idea, i) => (
                            <div key={i} className="p-2 bg-blue-100/50 dark:bg-blue-900/20 rounded-md">
                                <p className="font-semibold text-blue-800 dark:text-blue-300">{idea.title}</p>
                                <p className="mt-0.5 text-blue-700 dark:text-blue-400">{idea.brief}</p>
                            </div>
                        ))}
                    </div>
                </li>
            ))}
        </ul>
    </div>
);


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SWOTCard title={t('swotStrengths')} items={data.strengths} className="bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-300" />
      <SWOTCard title={t('swotWeaknesses')} items={data.weaknesses} className="bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-300" />
      <OpportunitiesCard title={t('swotOpportunities')} items={data.opportunities} className="bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300" />
      <SWOTCard title={t('swotThreats')} items={data.threats} className="bg-yellow-50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300" />
    </div>
  );
};

export default SwotAnalysisDisplay;