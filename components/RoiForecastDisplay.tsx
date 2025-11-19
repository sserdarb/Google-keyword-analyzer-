// FIX: Implement RoiForecastDisplay component to show potential ROI scenarios.
import React from 'react';
import type { ReportData, UserInput } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { useCurrency } from '../hooks/useCurrency';

interface RoiForecastDisplayProps {
  reportData: Partial<ReportData>;
  userInput: UserInput;
  totalBudget: number;
}

const RoiForecastDisplay: React.FC<RoiForecastDisplayProps> = ({ reportData, userInput, totalBudget }) => {
  const { t } = useTranslations();
  const { convertAndFormat } = useCurrency(userInput.currency);
  
  const forecast = reportData.roiForecast;

  if (!forecast) {
      return <div>{t('noRoiData')}</div>;
  }
  
  const estimatedReturn = totalBudget * forecast.estimatedRoas;

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/40 rounded-lg text-center">
                <p className="text-sm text-yellow-700 dark:text-yellow-300 uppercase font-semibold">{t('roiForecastRoasLabel')}</p>
                <p className="text-4xl font-bold text-yellow-800 dark:text-yellow-200">{forecast.estimatedRoas}x</p>
            </div>
             <div className="p-4 bg-green-50 dark:bg-green-900/40 rounded-lg text-center">
                <p className="text-sm text-green-700 dark:text-green-300 uppercase font-semibold">{t('estimatedReturnTitle')}</p>
                <p className="text-4xl font-bold text-green-800 dark:text-green-200">{convertAndFormat(estimatedReturn)}</p>
            </div>
        </div>
        <p className="text-sm text-center text-stone-500 dark:text-gray-500 italic">{forecast.notes}</p>
        
        <div>
            <h4 className="font-semibold mb-2 text-md">{t('roiForecastKeyImpactsTitle')}</h4>
            <div className="space-y-2">
                {Array.isArray(forecast.optimizations) && forecast.optimizations.map((opt, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-md bg-white dark:bg-gray-900/50 text-sm border border-stone-200 dark:border-gray-700">
                        <span className="text-stone-600 dark:text-gray-400">{opt.area}</span>
                        <span className="font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2.5 py-1 rounded-full">{opt.impact}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default RoiForecastDisplay;