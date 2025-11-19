

import React from 'react';
import type { CompetitorData } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface BarChartProps {
  data: CompetitorData[];
  userUrl: string;
  brandColor: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, userUrl, brandColor }) => {
  const { t } = useTranslations();

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full"><p>{t('noCompetitorData')}</p></div>;
  }

  const attributes = [
    { key: 'seoScore', label: t('tableHeaderSeoScore') },
    { key: 'contentScore', label: t('tableHeaderContentScore') },
    { key: 'uxScore', label: t('tableHeaderUxScore') },
    { key: 'brandAuthority', label: t('tableHeaderBrandAuthority') },
  ];
  
  const competitorColors = ['#3b82f6', '#10b981', '#8b5cf6'];

  const getSafeHostname = (url: string) => {
    if (!url || typeof url !== 'string') return url || 'N/A';
    try { return new URL(url).hostname.replace('www.', ''); } catch (e) { return url; }
  };
  
  return (
    <div className="w-full space-y-6">
      <div className="space-y-4">
        {attributes.map((attr) => (
          <div key={attr.key}>
            <h4 className="text-sm font-semibold text-stone-700 dark:text-gray-300 mb-2">{attr.label}</h4>
            <div className="space-y-2">
              {data.map((competitor) => {
                const isUser = competitor.url === userUrl;
                const value = competitor[attr.key as keyof CompetitorData] as number || 0;
                // Assign colors: user gets brand color, others cycle through competitorColors
                const color = isUser ? brandColor : competitorColors[data.filter(c => c.url !== userUrl).indexOf(competitor) % competitorColors.length];
                
                return (
                  <div key={competitor.url} className="flex items-center gap-2 text-sm">
                    <div className="w-28 text-right truncate text-stone-600 dark:text-gray-400" title={getSafeHostname(competitor.url)}>
                      {getSafeHostname(competitor.url)}{isUser ? ` (${t('you')})` : ''}
                    </div>
                    <div className="flex-grow bg-stone-200 dark:bg-gray-700 rounded-full h-5">
                      <div
                        className="h-5 rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold"
                        style={{ width: `${value}%`, backgroundColor: color, transition: 'width 0.5s ease-in-out' }}
                      >
                       {value}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;