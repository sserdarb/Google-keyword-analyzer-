
import React, { useState, useMemo } from 'react';
import type { CompetitorData, UserInput, SerpAnalysis } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { useCurrency } from '../hooks/useCurrency';

interface ResultsTableProps {
  data: CompetitorData[];
  userInput: UserInput;
  serpAnalysis?: SerpAnalysis;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ data, userInput, serpAnalysis }) => {
  const { t } = useTranslations();
  const { convertAndFormat } = useCurrency(userInput.currency);
  const { url: userUrl } = userInput;
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const serpPositions = useMemo(() => {
    const positions = new Map<string, number>();
    if (serpAnalysis) {
        // The user's own site position is in the main object
        positions.set(userInput.url, serpAnalysis.estimatedPosition);
        // The competitors' positions are in the array
        serpAnalysis.topCompetitors.forEach(comp => {
            // Ensure URL exists and is a string before setting
            if (comp.url && typeof comp.url === 'string') {
                positions.set(comp.url, comp.estimatedPosition);
            }
        });
    }
    return positions;
  }, [serpAnalysis, userInput.url]);


  if (!Array.isArray(data) || data.length === 0) {
    return <p>{t('noCompetitorData')}</p>;
  }

  const toggleRow = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };
  
  const handleExportCSV = () => {
    const headers = [
        t('tableHeaderCompetitor'), 
        t('serpPosition'),
        t('tableHeaderOverallScore'), 
        t('tableHeaderSeoScore'), 
        t('tableHeaderContentScore'), 
        t('tableHeaderUxScore'), 
        t('tableHeaderBrandAuthority')
    ];
    
    const formatCell = (cellData: any) => `"${String(cellData || '').replace(/"/g, '""')}"`;

    const csvContent = [
        headers.join(','),
        ...data.map(item => [
            formatCell(item.url),
            formatCell(serpPositions.get(item.url) || 'N/A'),
            item.overallScore,
            item.seoScore,
            item.contentScore,
            item.uxScore,
            item.brandAuthority
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'competitor_analysis.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const getSafeHostname = (url: string) => {
    if (!url || typeof url !== 'string') {
      return 'N/A';
    }
    try {
      return new URL(url).hostname;
    } catch (e) {
      return url; // Fallback to the original string if it's not a valid URL
    }
  };

  const AdvertisingBehaviorDetails: React.FC<{ competitor: CompetitorData }> = ({ competitor }) => {
    const behavior = competitor.advertisingBehavior;
    if (!behavior) return null;

    return (
        <div className="p-4 bg-stone-100 dark:bg-gray-800/50 space-y-4">
            <h4 className="font-semibold text-stone-800 dark:text-gray-200">{t('adBehaviorTitle')}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                    <p className="text-xs text-stone-500 dark:text-gray-400 font-medium">{t('estMonthlyBudget')}</p>
                    <p className="font-semibold">{convertAndFormat(behavior.estimatedMonthlyBudget)}</p>
                </div>
                <div>
                    <p className="text-xs text-stone-500 dark:text-gray-400 font-medium">{t('estAdTraffic')}</p>
                    <p className="font-semibold">{behavior.estimatedAdTraffic}</p>
                </div>
                <div className="col-span-2">
                    <p className="text-xs text-stone-500 dark:text-gray-400 font-medium">{t('topAdKeywords')}</p>
                    <p className="font-semibold italic">{behavior.topAdKeywords.join(', ')}</p>
                </div>
            </div>
            <div>
                <p className="text-xs text-stone-500 dark:text-gray-400 font-medium mb-1">{t('adCopy')}</p>
                <div className="space-y-2">
                {behavior.sampleAdCopy.map((ad, adIndex) => (
                    <div key={adIndex} className="p-2 bg-white dark:bg-gray-900 rounded-md text-xs">
                        <p className="font-semibold text-blue-600 dark:text-blue-400">{ad.headline}</p>
                        <p className="text-stone-600 dark:text-gray-400 mt-0.5">{ad.description}</p>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
         <button onClick={handleExportCSV} className="text-xs flex items-center gap-1 text-stone-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 font-semibold">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            {t('exportCSVButton')}
        </button>
      </div>
      <div className="overflow-x-auto bg-stone-50 dark:bg-gray-800/60 rounded-lg border border-stone-200 dark:border-gray-700">
        <table className="min-w-full text-sm text-left text-stone-800 dark:text-gray-300">
          <thead className="text-xs text-stone-600 dark:text-gray-300 uppercase bg-stone-100 dark:bg-gray-800/80">
            <tr>
              <th scope="col" className="px-4 py-2">{t('tableHeaderCompetitor')}</th>
              <th scope="col" className="px-4 py-2 text-center">{t('serpPosition')}</th>
              <th scope="col" className="px-4 py-2 text-center">{t('tableHeaderOverallScore')}</th>
              <th scope="col" className="px-4 py-2 text-center">{t('tableHeaderSeoScore')}</th>
              <th scope="col" className="px-4 py-2 text-center">{t('tableHeaderContentScore')}</th>
              <th scope="col" className="px-4 py-2 text-center">{t('tableHeaderUxScore')}</th>
              <th scope="col" className="px-4 py-2 text-center">{t('tableHeaderBrandAuthority')}</th>
              <th scope="col" className="px-4 py-2 w-28"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((competitor, index) => (
              <React.Fragment key={index}>
                <tr className="border-b border-stone-200 dark:border-gray-700 last:border-b-0 hover:bg-stone-100 dark:hover:bg-gray-800">
                  <td className="px-4 py-2 font-medium text-stone-900 dark:text-gray-100">
                    <a href={competitor.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-orange-600 dark:text-orange-400">
                      {getSafeHostname(competitor.url)}
                    </a>
                    {competitor.url === userUrl && <span className="ml-2 text-xs font-semibold text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded-full">{t('you')}</span>}
                  </td>
                  <td className="px-4 py-2 text-center font-mono font-bold text-lg text-stone-700 dark:text-gray-300">
                    {serpPositions.has(competitor.url) ? `#${serpPositions.get(competitor.url)}` : '-'}
                  </td>
                  <td className="px-4 py-2 text-center font-mono">{competitor.overallScore}</td>
                  <td className="px-4 py-2 text-center font-mono">{competitor.seoScore}</td>
                  <td className="px-4 py-2 text-center font-mono">{competitor.contentScore}</td>
                  <td className="px-4 py-2 text-center font-mono">{competitor.uxScore}</td>
                  <td className="px-4 py-2 text-center font-mono">{competitor.brandAuthority}</td>
                  <td className="px-4 py-2 text-center">
                    {competitor.advertisingBehavior && (
                      <button onClick={() => toggleRow(index)} className="flex items-center justify-center w-full gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline">
                        <span>{expandedRow === index ? t('showLess') : t('showMore')}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${expandedRow === index ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
                {expandedRow === index && (
                    <tr className="bg-stone-50 dark:bg-gray-800/60">
                        <td colSpan={8} className="p-0">
                           <AdvertisingBehaviorDetails competitor={competitor} />
                        </td>
                    </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;