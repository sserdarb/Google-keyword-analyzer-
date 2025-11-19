
import React, { useState, useEffect } from 'react';
import type { AdvancedAdsStrategy, UserInput, AdvancedCampaignDetails } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { useCurrency } from '../hooks/useCurrency';
import PerformanceChart from './PerformanceChart';

interface AdvancedAdsDisplayProps {
  data: AdvancedAdsStrategy;
  userInput: UserInput;
  onUpdate: (newBudget: number) => void;
  isLoading: boolean;
}

const VisualConceptDisplay: React.FC<{ text: string }> = ({ text }) => {
    const { t } = useTranslations();
    const [isExpanded, setIsExpanded] = useState(false);
    // Safely handle non-string input just in case
    const safeText = typeof text === 'string' ? text : JSON.stringify(text);
    const shouldTruncate = safeText.length > 120;

    return (
        <div>
            <h5 className="font-semibold text-sm mb-1">{t('visualConcept')}</h5>
            <div className="relative">
                <p className={`text-sm text-stone-600 dark:text-gray-400 italic bg-stone-50 dark:bg-gray-800/60 p-3 rounded-md border border-stone-200 dark:border-gray-700 transition-all duration-300 ${isExpanded ? '' : 'line-clamp-3'}`}>
                    {safeText}
                </p>
                {shouldTruncate && (
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)} 
                        className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline mt-1 focus:outline-none"
                    >
                        {isExpanded ? t('showLess') : t('showMore')}
                    </button>
                )}
            </div>
        </div>
    );
};

const CampaignCard: React.FC<{ campaign: AdvancedCampaignDetails, budgetRatio: number, userInput: UserInput }> = ({ campaign, budgetRatio, userInput }) => {
    const { t } = useTranslations();
    const { convertAndFormat } = useCurrency(userInput.currency);
    
    const calculatedBudget = campaign.monthlyBudget * budgetRatio;
    const estimatedClicks = campaign.estimatedCpc ? Math.round(calculatedBudget / campaign.estimatedCpc) : undefined;
    const estimatedImpressions = campaign.estimatedCpm ? Math.round((calculatedBudget / campaign.estimatedCpm) * 1000) : undefined;

    const getCampaignTitle = (type: string) => {
        const keyMap: { [key: string]: string } = {
            'Display/Remarketing': 'displayRemarketing',
            'YouTube Ads': 'youtubeAds',
            'Mobile App Ads': 'mobileAppAds',
            'Meta Advantage+': 'metaAdvantagePlus',
            'Telegram Ads': 'telegramAds',
            'Yandex Ads': 'yandexAds',
            'Bing Ads': 'bingAds',
            'LinkedIn Ads': 'linkedinAds',
            'TikTok Ads': 'tiktokAds',
        };
        return t(keyMap[type] || type);
    };

    if (!campaign.isRelevant) return null;

    return (
        <div className="p-5 border border-stone-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900/30 shadow-sm hover:shadow-md transition-shadow space-y-5">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-gray-700/50 pb-3">
                <h3 className="text-lg font-bold text-stone-800 dark:text-gray-200">{getCampaignTitle(campaign.campaignType)}</h3>
                <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">Recommended</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-stone-50 dark:bg-gray-800/60 flex flex-col space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-stone-600 dark:text-gray-400">{t('customBudgetLabel')}</span>
                            <span className="font-bold text-stone-800 dark:text-gray-200">{convertAndFormat(calculatedBudget)}</span>
                        </div>
                        {/* Estimated Results Section */}
                        <div className="pt-2 border-t border-stone-200 dark:border-gray-700 flex justify-between text-xs">
                            {estimatedClicks !== undefined && (
                                <div className="text-center">
                                    <span className="block text-stone-500 dark:text-gray-400">{t('estClicks')}</span>
                                    <span className="font-semibold text-stone-800 dark:text-gray-200">{new Intl.NumberFormat().format(estimatedClicks)}</span>
                                </div>
                            )}
                             {estimatedImpressions !== undefined && (
                                <div className="text-center">
                                    <span className="block text-stone-500 dark:text-gray-400">{t('estImpressions')}</span>
                                    <span className="font-semibold text-stone-800 dark:text-gray-200">{new Intl.NumberFormat().format(estimatedImpressions)}</span>
                                </div>
                            )}
                             {estimatedClicks === undefined && estimatedImpressions === undefined && (
                                 <span className="text-stone-500 dark:text-gray-400 italic">Estimates unavailable</span>
                             )}
                        </div>
                    </div>
                    <div>
                        <h5 className="font-semibold text-sm mb-1 text-stone-700 dark:text-gray-300">Targeting</h5>
                        <p className="text-sm text-stone-600 dark:text-gray-400 leading-relaxed">{String(campaign.targeting || '')}</p>
                    </div>
                    <div>
                        <h5 className="font-semibold text-sm mb-1 text-stone-700 dark:text-gray-300">Suggested Formats</h5>
                        <p className="text-sm text-stone-600 dark:text-gray-400">{String(campaign.suggestedAdFormats || '')}</p>
                    </div>

                    {/* Ad Copies */}
                    {campaign.adCopy && campaign.adCopy.length > 0 && (
                        <div>
                            <h5 className="font-semibold text-sm mb-2 text-stone-700 dark:text-gray-300">{t('adCopy')}</h5>
                            <div className="space-y-2">
                                {campaign.adCopy.map((ad, i) => (
                                    <div key={i} className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                                        <p className="font-semibold text-blue-700 dark:text-blue-300 text-sm mb-1">{ad.headline}</p>
                                        <p className="text-xs text-stone-600 dark:text-gray-400 leading-snug">{ad.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Visual Concept */}
                    {campaign.visualConcept && <VisualConceptDisplay text={String(campaign.visualConcept)} />}

                    {/* Platform Specifics */}
                    {campaign.campaignType === 'YouTube Ads' && (
                        <div className="pt-2 border-t border-stone-100 dark:border-gray-700/50 mt-2">
                             {campaign.targetChannels && campaign.targetChannels.length > 0 && (
                                <div className="mt-2">
                                    <h5 className="font-semibold text-xs uppercase text-stone-500 dark:text-gray-500 mb-1">{t('targetChannelsTitle')}</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {campaign.targetChannels.map((channel, i) => (
                                            <a key={i} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(channel)}`} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-md hover:bg-red-100 transition-colors">
                                                {channel}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {campaign.campaignType === 'TikTok Ads' && (
                        <div className="pt-2 border-t border-stone-100 dark:border-gray-700/50 mt-2 space-y-3">
                             {campaign.creativeAdFormats && (
                                <div>
                                    <h5 className="font-semibold text-xs uppercase text-stone-500 dark:text-gray-500 mb-1">{t('creativeAdFormatsTitle')}</h5>
                                    <ul className="list-disc list-inside text-xs text-stone-600 dark:text-gray-400">
                                        {campaign.creativeAdFormats.map((f, i) => <li key={i}>{f}</li>)}
                                    </ul>
                                </div>
                             )}
                             {campaign.trendingAudioSuggestions && (
                                <div>
                                     <h5 className="font-semibold text-xs uppercase text-stone-500 dark:text-gray-500 mb-1">{t('trendingAudioTitle')}</h5>
                                     <div className="flex flex-wrap gap-2">
                                        {campaign.trendingAudioSuggestions.map((audio, i) => (
                                            <span key={i} className="text-xs px-2 py-1 bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 rounded-md">
                                                ♫ {audio}
                                            </span>
                                        ))}
                                     </div>
                                </div>
                             )}
                        </div>
                    )}
                </div>

                {/* Chart Area */}
                <div className="flex flex-col justify-end h-full min-h-[200px]">
                    {campaign.performanceTrend && campaign.performanceTrend.length > 0 ? (
                        <div>
                            <h4 className="font-semibold text-center text-xs uppercase text-stone-400 dark:text-gray-500 mb-2">{t('performanceChartTitle')}</h4>
                            <PerformanceChart 
                                data={campaign.performanceTrend} 
                                lines={[{ dataKey: 'value', color: '#f97316', label: 'Est. Impact' }]} 
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-stone-400 text-sm italic">No trend data available</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AdvancedAdsDisplay: React.FC<AdvancedAdsDisplayProps> = ({ data, userInput, onUpdate, isLoading }) => {
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
  
  const relevantCampaigns = data.campaigns.filter(c => c.isRelevant);
  const irrelevantCampaigns = data.campaigns.filter(c => !c.isRelevant);

  const getCampaignTitle = (type: string) => {
    const keyMap: { [key: string]: string } = {
        'Display/Remarketing': 'displayRemarketing',
        'YouTube Ads': 'youtubeAds',
        'Mobile App Ads': 'mobileAppAds',
        'Meta Advantage+': 'metaAdvantagePlus',
        'Telegram Ads': 'telegramAds',
        'Yandex Ads': 'yandexAds',
        'Bing Ads': 'bingAds',
        'LinkedIn Ads': 'linkedinAds',
        'TikTok Ads': 'tiktokAds',
    };
    return t(keyMap[type] || type);
  };

  return (
    <div className="space-y-8">
      {/* Budget Control */}
      <div className="p-6 bg-stone-100 dark:bg-gray-800/80 rounded-xl space-y-4 shadow-inner">
        <label htmlFor="budget-slider-advanced" className="block text-center">
            <span className="text-sm font-medium text-stone-500 dark:text-gray-400 uppercase tracking-wide">{t('overallMonthlyBudget')}</span>
            <div className="font-bold text-3xl text-orange-600 dark:text-orange-400 mt-1">{convertAndFormat(localBudget)}</div>
        </label>
        <div className="flex items-center gap-4 max-w-2xl mx-auto">
            <input
                id="budget-slider-advanced"
                type="range"
                min={data.overallMonthlyBudget > 0 ? data.overallMonthlyBudget / 10 : 100}
                max={data.overallMonthlyBudget > 0 ? data.overallMonthlyBudget * 5 : 50000}
                step={data.overallMonthlyBudget > 0 ? data.overallMonthlyBudget / 10 : 100}
                value={localBudget}
                onChange={(e) => setLocalBudget(Number(e.target.value))}
                className="w-full h-2 bg-stone-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-orange-500"
                disabled={isLoading}
            />
            <button onClick={handleUpdateClick} disabled={isLoading} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg text-sm transition-colors disabled:bg-gray-400 disabled:cursor-wait flex-shrink-0 shadow-md">
                {isLoading ? t('analyzingButton') : t('updateAnalysisButton')}
            </button>
        </div>
      </div>

      {/* Relevant Campaigns Grid */}
      {relevantCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {relevantCampaigns.map((campaign, index) => (
                <CampaignCard key={index} campaign={campaign} budgetRatio={budgetRatio} userInput={userInput} />
            ))}
          </div>
      ) : (
          <p className="text-center text-stone-500">No recommended advanced campaigns found for this budget/niche.</p>
      )}
      
      {/* Irrelevant Campaigns / Other Channels */}
      {irrelevantCampaigns.length > 0 && (
        <div className="pt-8 border-t border-stone-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-stone-600 dark:text-gray-400 mb-4">Other Considered Channels</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {irrelevantCampaigns.map((campaign, index) => (
                    <div key={index} className="p-4 bg-stone-50 dark:bg-gray-800/40 rounded-lg border border-stone-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-stone-700 dark:text-gray-300">{getCampaignTitle(campaign.campaignType)}</p>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full">N/A</span>
                        </div>
                        <p className="text-xs text-stone-500 dark:text-gray-500 italic leading-relaxed">"{String(campaign.relevanceReasoning || '')}"</p>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAdsDisplay;
