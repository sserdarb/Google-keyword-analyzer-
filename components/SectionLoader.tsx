import React from 'react';
import { useTranslations } from '../hooks/useTranslations';

const SectionLoader: React.FC = () => {
  const { t } = useTranslations();
  return (
    <div className="w-full min-h-[200px] bg-stone-50 dark:bg-gray-800/60 rounded-lg flex items-center justify-center animate-pulse p-8 border border-stone-200 dark:border-gray-700/50">
      <div className="flex items-center space-x-3 text-stone-500 dark:text-gray-400">
        <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-orange-500"></div>
        <span className="font-semibold">{t('loadingData')}</span>
      </div>
    </div>
  );
};

export default SectionLoader;