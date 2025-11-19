
// FIX: Implement the GoogleAdsDisplay component with dynamic budget controls and performance charts.
import React, { useState, useEffect } from 'react';
import type { GoogleAdsStrategy, UserInput } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { useCurrency } from '../hooks/useCurrency';
import SectionLoader from './SectionLoader';
import KeywordAnalysisDisplay from './KeywordAnalysisDisplay';
import PerformanceChart from './PerformanceChart';

interface GoogleAdsDisplayProps {
  data: GoogleAdsStrategy;
  userInput: UserInput;
  onGenerateKeywords: () => void;
  isLoadingKeywords: boolean;
  onUpdate: (newBudget: number) => void;
  isLoading: boolean;
}

const GenerateSection: React.FC<{ onGenerate: () => void }> = ({ onGenerate }) => {
    const { t } = useTranslations();
    return (
        <div className="text-center p-8 bg-stone-50 dark:bg-gray-800/60 rounded-lg border border-stone-200 dark:border-gray-700/50">
            <p className="mb-4 text-stone-600 dark:text-gray-400">{t('sectionNotGenerated')}</p>
            <button onClick={onGenerate} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-5 rounded-lg transition-colors text-sm">
                {t('generateAnalysisButton')}
            </button>
        </div>
    );
};

const GoogleAdsDisplay: React.FC<GoogleAdsDisplayProps> = ({ data, userInput, onGenerateKeywords, isLoadingKeywords, onUpdate, isLoading }) => {
  const { t } = useTranslations();
  const { convertAndFormat } = useCurrency(userInput.currency);
  const [localBudget, setLocalBudget] = useState(data.overallMonthlyBudget || 0);

  useEffect(() => {
    setLocalBudget(data.overallMonthlyBudget || 0);
  }, [data.overallMonthlyBudget]);


  if (!data || !data.campaigns) {
    return <p>{t('loadingData')}</p>;
  }
  
  const handleUpdateClick = () => {
    onUpdate(localBudget);
  };
  
  const budgetRatio = localBudget / (data.overallMonthlyBudget || 1);

  const getCampaignTitle = (type: string) => {
    switch (type) {
      case 'Search': return t('searchCampaign');
      case 'Performance Max': return t('performanceMax');
      case 'Display': return t('displayCampaign');
      case 'Video': return t('videoCampaign');
      default: return type;
    }
  };

  return (
    <div className="space-y-8">
      <div className="p-4 bg-stone-100 dark:bg-gray-800/80 rounded-lg space-y-3">
        <label htmlFor="budget-slider-google" className="block text-sm text-center font-medium text-stone-700 dark:text-gray-300 mb-1">{t('overallMonthlyBudget')}: <span className="font-bold text-2xl text-orange-600 dark:text-orange-400">{convertAndFormat(localBudget)}</span></label>
        <div className="flex items-center gap-4">
            <input
                id="budget-slider-google"
                type="range"
                min={(data.overallMonthlyBudget || 1000) / 10}
                max={(data.overallMonthlyBudget || 1000) * 5}
                step={(data.overallMonthlyBudget || 1000) / 10}
                value={localBudget}
                onChange={(e) => setLocalBudget(Number(e.target.value))}
                className="w-full h-2 bg-stone-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                disabled={isLoading}
            />
            <button onClick={handleUpdateClick} disabled={isLoading} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors disabled:bg-gray-400 disabled:cursor-wait flex-shrink-0">
                {isLoading ? t('analyzingButton') : t('updateAnalysisButton')}
            </button>
        </div>
      </div>

      {data.campaigns.map((campaign, index) => (
        <div key={index} className="p-4 border border-stone-200 dark:border-gray-700 rounded-lg space-y-4">
          <h3 className="text-xl font-semibold text-stone-800 dark:text-gray-200">{getCampaignTitle(campaign.campaignType)}</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="p-2 rounded-md bg-stone-50 dark:bg-gray-800/60"><strong>{t('customBudgetLabel')}:</strong> {convertAndFormat(campaign.monthlyBudget * budgetRatio)}</div>
            <div className="p-2 rounded-md bg-stone-50 dark:bg-gray-800/60"><strong>{t('targetRegion')}:</strong> {campaign.targetRegion}</div>
            <div className="p-2 rounded-md bg-stone-50 dark:bg-gray-800/60 col-span-2"><strong>{t('goals')}:</strong> {campaign.goals.join(', ')}</div>
          </div>

          {/* Special Display for Search Campaigns: Bidding Strategy */}
          {campaign.campaignType === 'Search' && campaign.bidStrategy && (
            <div className="p-5 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-blue-800 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b border-blue-100 dark:border-blue-800/50 pb-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                   <h4 className="font-bold text-blue-800 dark:text-blue-300 text-lg">{t('bidStrategyTitle')}</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-white dark:bg-gray-800/60 rounded-lg border border-blue-100 dark:border-blue-900/30 shadow-sm">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">{t('strategy')}</p>
                        <p className="text-xl font-bold text-stone-800 dark:text-gray-100">{campaign.bidStrategy}</p>
                    </div>
                    {campaign.targetCpcRange && (
                        <div className="p-4 bg-white dark:bg-gray-800/60 rounded-lg border border-blue-100 dark:border-blue-900/30 shadow-sm">
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">{t('targetCpcRangeTitle')}</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-stone-800 dark:text-gray-100">{campaign.targetCpcRange.low}</span>
                                <span className="text-stone-500 dark:text-gray-400 font-medium">-</span>
                                <span className="text-2xl font-bold text-stone-800 dark:text-gray-100">{campaign.targetCpcRange.high}</span>
                                <span className="text-sm text-stone-500 dark:text-gray-400 ml-1 font-medium">({userInput.currency})</span>
                            </div>
                        </div>
                    )}
                </div>
                {campaign.bidRationale && (
                    <div className="mt-5 pt-3 border-t border-blue-100 dark:border-blue-800/30">
                         <div className="flex items-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">{t('bidRationaleTitle')}</p>
                                <p className="text-sm text-stone-700 dark:text-gray-300 italic leading-relaxed">"{campaign.bidRationale}"</p>
                            </div>
                         </div>
                    </div>
                )}
            </div>
          )}

          {campaign.campaignType === 'Search' && (
             <div className="pt-2 space-y-4">
                <h4 className="font-semibold">{t('keywordAnalysisTitle')}</h4>
                {isLoadingKeywords ? (
                    <SectionLoader />
                ) : campaign.adGroups && campaign.adGroups.length > 0 ? (
                    <KeywordAnalysisDisplay adGroups={campaign.adGroups} userInput={userInput} />
                ) : (
                    <GenerateSection onGenerate={onGenerateKeywords} />
                )}
             </div>
          )}

          {campaign.campaignType === 'Performance Max' && campaign.assetGroups && (
            <div className="pt-2">
              <h4 className="font-semibold mb-2">{t('assetGroups')}</h4>
              {campaign.assetGroups.map((ag, agIndex) => (
                <div key={agIndex} className="p-3 bg-stone-50 dark:bg-gray-800/60 rounded-lg space-y-2">
                  <p className="font-semibold text-stone-700 dark:text-gray-300">{ag.groupName}</p>
                  <p className="text-xs"><strong>Headlines:</strong> {ag.headlines.join(' | ')}</p>
                  <p className="text-xs"><strong>Descriptions:</strong> {ag.descriptions.join(' | ')}</p>
                  <p className="text-xs"><strong>Visual Concept:</strong> {ag.visualConcept}</p>
                </div>
              ))}
            </div>
          )}

          {(campaign.campaignType === 'Display' || campaign.campaignType === 'Video') && campaign.detailedTargeting && (
             <div className="pt-2">
                <h4 className="font-semibold mb-2">{t('detailedTargeting')}</h4>
                <div className="text-sm p-3 bg-stone-50 dark:bg-gray-800/60 rounded-lg space-y-1">
                    <p><strong>Demographics:</strong> {campaign.detailedTargeting.demographics}</p>
                    <p><strong>Interests:</strong> {campaign.detailedTargeting.interests}</p>
                    <p><strong>Behaviors:</strong> {campaign.detailedTargeting.behaviors}</p>
                </div>
                {campaign.visualConcept && (
                    <div className="mt-2">
                        <h5 className="font-semibold text-sm mb-1">{t('visualConcept')}:</h5>
                        <p className="text-sm text-stone-600 dark:text-gray-400">{campaign.visualConcept}</p>
                    </div>
                )}
            </div>
          )}
          
          {campaign.performanceTrend && campaign.performanceTrend.length > 0 && (
            <div className="pt-4">
                <h4 className="font-semibold text-center mb-2">{t('performanceChartTitle')}</h4>
                <PerformanceChart 
                    data={campaign.performanceTrend} 
                    lines={[{ dataKey: 'value', color: '#f97316', label: t('estClicks') }]} 
                />
            </div>
          )}

        </div>
      ))}
    </div>
  );
};

export default GoogleAdsDisplay;
