import React from 'react';
import { useTranslations } from '../hooks/useTranslations';

interface DonutChartProps {
  stats: { pass: number; fail: number; warning: number };
}

const DonutChart: React.FC<DonutChartProps> = ({ stats }) => {
  const { t } = useTranslations();
  const { pass, fail, warning } = stats;
  const total = pass + fail + warning;
  if (total === 0) return null;

  const passPercent = (pass / total) * 100;
  const failPercent = (fail / total) * 100;
  const warningPercent = (warning / total) * 100;
  
  const passOffset = 25;
  const failOffset = 25 - passPercent;
  const warningOffset = 25 - passPercent - failPercent;

  const legendItems = [
    { label: t('pass'), count: pass, color: 'text-green-500' },
    { label: t('fail'), count: fail, color: 'text-red-500' },
    { label: t('warning'), count: warning, color: 'text-yellow-500' },
  ];

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 42 42" className="w-full h-full">
          {/* Background circle */}
          <circle cx="21" cy="21" r="15.915" fill="transparent" strokeWidth="6" className="stroke-stone-200 dark:stroke-gray-700" />

          {/* Data arcs */}
          {pass > 0 && <circle cx="21" cy="21" r="15.915" fill="transparent" strokeWidth="6" strokeDasharray={`${passPercent} ${100-passPercent}`} strokeDashoffset={passOffset} transform="rotate(-90 21 21)" className="stroke-green-500" />}
          {fail > 0 && <circle cx="21" cy="21" r="15.915" fill="transparent" strokeWidth="6" strokeDasharray={`${failPercent} ${100-failPercent}`} strokeDashoffset={failOffset} transform="rotate(-90 21 21)" className="stroke-red-500" />}
          {warning > 0 && <circle cx="21" cy="21" r="15.915" fill="transparent" strokeWidth="6" strokeDasharray={`${warningPercent} ${100-warningPercent}`} strokeDashoffset={warningOffset} transform="rotate(-90 21 21)" className="stroke-yellow-500" />}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-stone-800 dark:text-gray-200">{total}</span>
          <span className="text-xs text-stone-500 dark:text-gray-400">Checks</span>
        </div>
      </div>
      <div className="flex justify-center gap-4 text-xs">
        {legendItems.map(item => (
          <div key={item.label} className="flex items-center">
            <span className={`w-2.5 h-2.5 rounded-full mr-1.5 ${item.color.replace('text-','bg-')}`}></span>
            <span className="font-semibold text-stone-700 dark:text-gray-300">{item.label}:</span>
            <span className="ml-1 text-stone-600 dark:text-gray-400">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;