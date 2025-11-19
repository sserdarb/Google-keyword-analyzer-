import React from 'react';
import type { StrategicRecommendations, Recommendation } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface StrategicRecommendationsDisplayProps {
  data: StrategicRecommendations;
}

const StrategicRecommendationsDisplay: React.FC<StrategicRecommendationsDisplayProps> = ({ data }) => {
  const { t } = useTranslations();
  if (!data) return null;

  const renderRecommendation = (item: Recommendation, index: number) => {
    if (typeof item === 'string') {
        return <li key={index}>{item}</li>;
    }
    // Handle the case where the AI returns a more structured object
    if (item && typeof item === 'object' && item.title && item.description) {
        return (
            <li key={index}>
                <span className="font-semibold">{item.title}:</span> {item.description}
            </li>
        );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h4 className="text-lg font-semibold text-stone-800 dark:text-gray-200 mb-2">{t('brandStrategyTitle')}</h4>
        <ul className="space-y-2 list-disc list-inside text-stone-600 dark:text-gray-400">
          {Array.isArray(data.brandStrategy) && data.brandStrategy.map(renderRecommendation)}
        </ul>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-stone-800 dark:text-gray-200 mb-2">{t('salesStrategyTitle')}</h4>
        <ul className="space-y-2 list-disc list-inside text-stone-600 dark:text-gray-400">
          {Array.isArray(data.salesStrategy) && data.salesStrategy.map(renderRecommendation)}
        </ul>
      </div>
    </div>
  );
};

export default StrategicRecommendationsDisplay;