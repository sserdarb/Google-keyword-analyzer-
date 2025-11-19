
import React, { useState, useEffect } from 'react';
import type { SocialMediaCampaign, UserInput } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import PerformanceChart from './PerformanceChart';
import { useCurrency } from '../hooks/useCurrency';

interface SocialMediaDisplayProps {
  data: SocialMediaCampaign;
  userInput: UserInput;
  onUpdate: (newBudget: number) => void;
  isLoading: boolean;
}

const SocialMediaDisplay: React.FC<SocialMediaDisplayProps> = ({ data, userInput, onUpdate, isLoading }) => {
  const { t } = useTranslations();
  const { convertAndFormat } = useCurrency(userInput.currency);
  const [localBudget, setLocalBudget] = useState(data.monthlyBudget || 0);

  useEffect(() => {
    setLocalBudget(data.monthlyBudget || 0);
  }, [data.monthlyBudget]);

  if (!data) {
    return <p>{t('loadingData')}</p>;
  }
  
  const handleUpdateClick = () => {
    onUpdate(localBudget);
  };

  // Calculate impact based on budget change ratio
  const budgetRatio = localBudget / (data.monthlyBudget || 1);
  const estimatedReach = Math.round((data.estimatedReachPerMonth || 0) * budgetRatio);
  const estimatedEngagements = Math.round((data.estimatedEngagementsPerMonth || 0) * budgetRatio);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4 p-4 bg-stone-50 dark:bg-gray-800/60 rounded-lg border border-stone-200 dark:border-gray-700/50">
          <h4 className="font-semibold text-stone-800 dark:text-gray-200">{t('performanceEstimations')}</h4>
          <div className="space-y-4">
            <div>
              <label htmlFor="budget-slider-social" className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-2">
                {t('customBudgetLabel')}: <span className="font-bold text-orange-600 dark:text-orange-400 text-lg">{convertAndFormat(localBudget)}</span>
              </label>
               <div className="flex items-center gap-4">
                    <input
                        id="budget-slider-social"
                        type="range"
                        min={(data.monthlyBudget || 1000) / 10} // 10%
                        max={(data.monthlyBudget || 1000) * 5}  // 500%
                        step={(data.monthlyBudget || 1000) / 10} // 10% steps
                        value={localBudget}
                        onChange={(e) => setLocalBudget(Number(e.target.value))}
                        className="w-full h-2 bg-stone-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleUpdateClick} 
                        disabled={isLoading} 
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors disabled:bg-gray-400 disabled:cursor-wait flex-shrink-0 shadow-sm"
                    >
                        {isLoading ? t('analyzingButton') : t('updateAnalysisButton')}
                    </button>
                </div>
                <div className="flex justify-between text-xs text-stone-500 dark:text-gray-500 mt-1 px-1">
                    <span>10%</span>
                    <span>100%</span>
                    <span>500%</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-stone-200 dark:border-gray-700 shadow-sm">
                <p className="text-xs text-stone-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">{t('estReach')}</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{new Intl.NumberFormat().format(estimatedReach)}</p>
              </div>
              <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-stone-200 dark:border-gray-700 shadow-sm">
                <p className="text-xs text-stone-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">{t('estEngagements')}</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{new Intl.NumberFormat().format(estimatedEngagements)}</p>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-stone-200 dark:border-gray-700">
            <h5 className="font-semibold text-sm mb-1 text-stone-700 dark:text-gray-300">{t('targetAudience')}:</h5>
            <p className="text-sm text-stone-600 dark:text-gray-400 leading-relaxed">{data.targetAudience}</p>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-900/50 rounded-lg border border-stone-200 dark:border-gray-700/50">
           <h4 className="font-semibold text-center mb-4 text-stone-800 dark:text-gray-200">{t('performanceChartTitle')}</h4>
           <PerformanceChart 
                data={data.performanceTrend} 
                lines={[
                    { dataKey: 'reach', color: '#3b82f6', label: t('estReach') },
                    { dataKey: 'engagements', color: '#10b981', label: t('estEngagements') }
                ]} 
            />
        </div>
      </div>

      {data.platforms.map((platform, index) => (
        <div key={index} className="p-5 border border-stone-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900/30 shadow-sm">
          <h4 className="text-lg font-bold text-stone-800 dark:text-gray-200 mb-4 border-b border-stone-100 dark:border-gray-800 pb-2">{platform.platform}</h4>
          {platform.targeting && (
            <div className="mb-5">
                <h5 className="font-semibold text-sm mb-2 text-stone-700 dark:text-gray-300">{t('detailedTargeting')}:</h5>
                <div className="text-sm text-stone-600 dark:text-gray-400 p-3 bg-stone-50 dark:bg-gray-800/60 rounded-lg border border-stone-200 dark:border-gray-700/50 whitespace-pre-line leading-relaxed">
                    {platform.targeting}
                </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold text-sm mb-2 text-stone-700 dark:text-gray-300">{t('contentIdeas')}:</h5>
              <div className="space-y-3">
                {platform.contentIdeas.map((idea, i) => (
                    <div key={i} className="p-3 bg-stone-50 dark:bg-gray-800/60 rounded-lg border border-stone-100 dark:border-gray-700/50 hover:bg-stone-100 dark:hover:bg-gray-800 transition-colors">
                        <p className="font-semibold text-sm text-stone-800 dark:text-gray-200 mb-1">{idea.title}</p>
                        <p className="text-xs text-stone-600 dark:text-gray-400">{idea.brief}</p>
                    </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="font-semibold text-sm mb-2 text-stone-700 dark:text-gray-300">{t('adCopy')}:</h5>
              {platform.adCopy.map((ad, adIndex) => (
                <div key={adIndex} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30 mb-4">
                  <p className="font-semibold text-blue-700 dark:text-blue-300 text-sm mb-1">{ad.headline}</p>
                  <p className="text-xs text-stone-600 dark:text-gray-400 leading-relaxed">{ad.description}</p>
                </div>
              ))}
              <div>
                <h5 className="font-semibold text-sm mb-1 text-stone-700 dark:text-gray-300">{t('visualConcept')}:</h5>
                <p className="text-sm text-stone-600 dark:text-gray-400 italic p-2 bg-stone-50 dark:bg-gray-800/40 rounded-md">{platform.visualConcept}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SocialMediaDisplay;
