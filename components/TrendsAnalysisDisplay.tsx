import React from 'react';
import type { TrendsAnalysis, PerformanceTrendItem } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import PerformanceChart from './PerformanceChart';

interface TrendsAnalysisDisplayProps {
  data: TrendsAnalysis;
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

const TrendsAnalysisDisplay: React.FC<TrendsAnalysisDisplayProps> = ({ data }) => {
  const { t } = useTranslations();
  if (!data || !data.keywordInterest) return null;

  const allSeries = [data.keywordInterest, ...(data.brandInterest || [])];
  const months = data.keywordInterest.data.map(d => d.date);

  const chartData: any[] = months.map((month, index) => {
      const dataPoint: { month: string; [key: string]: string | number } = { month };
      allSeries.forEach(series => {
          // Use series name as key, handle potential undefined data
          dataPoint[series.name] = series.data[index]?.value ?? 0;
      });
      return dataPoint;
  });

  const lines = allSeries.map((series, index) => ({
      dataKey: series.name,
      color: COLORS[index % COLORS.length],
      label: series.name
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 bg-white dark:bg-gray-900/50 rounded-lg border border-stone-200 dark:border-gray-700/50 shadow-sm">
           <h4 className="text-lg font-semibold text-stone-800 dark:text-gray-200 mb-2 text-center">{t('interestOverTime')}</h4>
           <PerformanceChart data={chartData} lines={lines as any} />
        </div>
        <div className="p-4 bg-white dark:bg-gray-900/50 rounded-lg border border-stone-200 dark:border-gray-700/50 shadow-sm">
           <h4 className="text-lg font-semibold text-stone-800 dark:text-gray-200 mb-4">{t('relatedTopics')}</h4>
           <div className="flex flex-wrap gap-2">
            {data.relatedTopics.map((topic, index) => (
                <span key={index} className="px-3 py-1.5 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 rounded-full font-medium">
                    {topic}
                </span>
            ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default TrendsAnalysisDisplay;