
// FIX: Implement the SeoAnalysisDisplay component to show the new SEO score and all analysis details.
import React from 'react';
import type { SeoAnalysis, SerpCompetitor, SeoCheck } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import DonutChart from './DonutChart';

interface SeoAnalysisDisplayProps {
  data: SeoAnalysis;
}

const SeoAnalysisDisplay: React.FC<SeoAnalysisDisplayProps> = ({ data }) => {
  const { t } = useTranslations();
  if (!data) {
      return <p>{t('loadingData')}</p>;
  }

  const { onPage, technicalSeo, offPage, contentAnalysis, serpAnalysis } = data;

  // Collect all high priority issues
  const criticalIssues = [
      ...onPage,
      ...technicalSeo,
      ...offPage
  ].filter(item => item.priority === 'High');

  const getStatusCounts = (items: SeoCheck[]) => {
    return items.reduce((acc, item) => {
        if (item.status === 'Pass') acc.pass++;
        else if (item.status === 'Fail') acc.fail++;
        else if (item.status === 'Warning') acc.warning++;
        return acc;
    }, { pass: 0, fail: 0, warning: 0 });
  };

  const onPageStats = getStatusCounts(onPage);
  const technicalStats = getStatusCounts(technicalSeo);


  const StatusPill: React.FC<{ status: 'Pass' | 'Fail' | 'Warning' }> = ({ status }) => {
    const statusMap = {
      Pass: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      Fail: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
      Warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    };
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${statusMap[status]}`}>{t(status.toLowerCase() as any)}</span>;
  };

  const CheckList: React.FC<{ items: { check: string, status: 'Pass' | 'Fail' | 'Warning', recommendation: string }[] }> = ({ items }) => (
     <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
            <tbody className="divide-y divide-stone-200 dark:divide-gray-700/50">
                {items.map((item, index) => (
                    <tr key={index}>
                        <td className="p-3 font-medium text-stone-800 dark:text-gray-200">{item.check}</td>
                        <td className="p-3 w-32"><StatusPill status={item.status} /></td>
                        <td className="p-3 text-stone-600 dark:text-gray-400 text-xs">{item.recommendation}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );

  const StatCard: React.FC<{ label: string, value: string | number }> = ({ label, value }) => (
      <div className="p-4 bg-stone-100 dark:bg-gray-900/50 rounded-lg text-center">
          <p className="text-sm text-stone-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-base font-bold text-stone-900 dark:text-gray-100">{value}</p>
      </div>
  );
  
  const getSafeHostname = (url: string) => {
    if (!url || typeof url !== 'string') return url || 'N/A';
    try { return new URL(url).hostname.replace('www.', ''); } catch (e) { return url; }
  };

  return (
    <div className="space-y-8">
        {/* Critical Issues Section */}
        {criticalIssues.length > 0 && (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50">
                <h4 className="text-xl font-bold text-red-800 dark:text-red-300 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    {t('criticalIssuesTitle')}
                </h4>
                <div className="space-y-6">
                    {criticalIssues.map((issue, index) => (
                        <div key={index} className="bg-white dark:bg-gray-900/80 p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                            <div className="flex justify-between items-start mb-2">
                                <h5 className="font-bold text-stone-800 dark:text-gray-100 text-lg">{issue.check}</h5>
                                <StatusPill status={issue.status} />
                            </div>
                            <p className="text-stone-700 dark:text-gray-300 mb-3 text-sm">{issue.explanation || issue.recommendation}</p>
                            
                            {issue.actionPlan && issue.actionPlan.length > 0 && (
                                <div className="bg-stone-50 dark:bg-gray-800/50 p-3 rounded-md">
                                    <p className="text-xs font-bold uppercase text-stone-500 dark:text-gray-400 mb-2">{t('actionPlanTitle')}</p>
                                    <ul className="list-decimal list-inside space-y-1 text-sm text-stone-700 dark:text-gray-300">
                                        {issue.actionPlan.map((step, i) => (
                                            <li key={i}>{step}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white dark:bg-gray-900/50 rounded-lg border border-stone-200 dark:border-gray-700/50 shadow-sm flex flex-col items-center">
                <h4 className="text-lg font-semibold text-stone-800 dark:text-gray-200 mb-2">{t('onPageSeo')}</h4>
                <DonutChart stats={onPageStats} />
            </div>
             <div className="p-4 bg-white dark:bg-gray-900/50 rounded-lg border border-stone-200 dark:border-gray-700/50 shadow-sm flex flex-col items-center">
                <h4 className="text-lg font-semibold text-stone-800 dark:text-gray-200 mb-2">{t('technicalSeoTitle')}</h4>
                <DonutChart stats={technicalStats} />
            </div>
        </div>

        {/* SERP & Content Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 bg-white dark:bg-gray-900/50 rounded-lg border border-stone-200 dark:border-gray-700/50 shadow-sm space-y-4">
                <h4 className="text-lg font-semibold text-stone-800 dark:text-gray-200">{t('serpAnalysisTitle')}</h4>
                <div className="grid grid-cols-2 gap-4">
                    <StatCard label={t('estimatedPosition')} value={`#${serpAnalysis.estimatedPosition}`} />
                    <div className="p-4 bg-stone-100 dark:bg-gray-900/50 rounded-lg col-span-2">
                        <p className="text-sm text-stone-500 dark:text-gray-400 text-center mb-2">{t('topCompetitorsInSerp')}</p>
                        <div className="space-y-2">
                            {serpAnalysis.topCompetitors.map((comp, i) =>(
                                <div key={i} className="p-2 bg-white dark:bg-gray-800 rounded-md text-xs">
                                    <p className="font-semibold text-orange-600 dark:text-orange-400">#{comp.estimatedPosition} - {getSafeHostname(comp.url)}</p>
                                    <p className="text-stone-600 dark:text-gray-400 mt-0.5">
                                        <span className="font-medium">Strengths:</span> {comp.strengths.join(', ')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
             <div className="p-4 bg-white dark:bg-gray-900/50 rounded-lg border border-stone-200 dark:border-gray-700/50 shadow-sm space-y-4">
                <h4 className="text-lg font-semibold text-stone-800 dark:text-gray-200">{t('contentAnalysisTitle')}</h4>
                <div className="grid grid-cols-3 gap-4">
                    <StatCard label={t('keywordDensity')} value={contentAnalysis.keywordDensity} />
                    <StatCard label={t('readabilityScore')} value={contentAnalysis.readabilityScore} />
                    <StatCard label={t('wordCount')} value={contentAnalysis.wordCount} />
                </div>
                <div>
                    <h5 className="font-semibold text-sm mb-1">{t('seoContentRecommendations')}</h5>
                    <ul className="list-disc list-inside space-y-1 text-xs text-stone-700 dark:text-gray-300">
                        {contentAnalysis.recommendations.map((rec, i) => <li key={i} className="font-semibold">{rec}</li>)}
                    </ul>
                </div>
            </div>
        </div>

        {/* On-Page SEO */}
        <div className="p-4 bg-white dark:bg-gray-900/50 rounded-lg border border-stone-200 dark:border-gray-700/50 shadow-sm">
            <h4 className="text-lg font-semibold text-stone-800 dark:text-gray-200 mb-4">{t('onPageSeo')}</h4>
            <CheckList items={onPage} />
        </div>
        
        {/* Technical SEO */}
        <div className="p-4 bg-white dark:bg-gray-900/50 rounded-lg border border-stone-200 dark:border-gray-700/50 shadow-sm">
            <h4 className="text-lg font-semibold text-stone-800 dark:text-gray-200 mb-4">{t('technicalSeoTitle')}</h4>
            <CheckList items={technicalSeo} />
        </div>

        {/* Off-Page SEO (Added if missing in original) */}
        <div className="p-4 bg-white dark:bg-gray-900/50 rounded-lg border border-stone-200 dark:border-gray-700/50 shadow-sm">
            <h4 className="text-lg font-semibold text-stone-800 dark:text-gray-200 mb-4">{t('offPageSeo')}</h4>
            <CheckList items={offPage} />
        </div>
    </div>
  );
};

export default SeoAnalysisDisplay;
