
// FIX: Implement CustomerJourneyFunnel to visualize the marketing funnel.
import React from 'react';
import type { ReportData, UserInput, JourneyStage } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface CustomerJourneyFunnelProps {
  reportData: Partial<ReportData>;
  userInput: UserInput;
}

const CustomerJourneyFunnel: React.FC<CustomerJourneyFunnelProps> = ({ reportData }) => {
  const { t } = useTranslations();
  
  const journeyStages = reportData?.customerJourneyAnalysis?.funnel;

  if (!journeyStages || journeyStages.length === 0) {
      return <div>{t('noCustomerJourneyData')}</div>;
  }

  const getStageTranslation = (stage: 'Awareness' | 'Consideration' | 'Conversion') => {
      switch(stage) {
          case 'Awareness': return t('journeyAwareness');
          case 'Consideration': return t('journeyConsideration');
          case 'Conversion': return t('journeyConversion');
          default: return stage;
      }
  }

  const stageConfigs: { [key in JourneyStage['stage']]: { bgColor: string; width: string } } = {
    Awareness: { bgColor: 'bg-blue-500', width: 'w-full md:w-11/12' },
    Consideration: { bgColor: 'bg-yellow-500', width: 'w-[92%] md:w-10/12' },
    Conversion: { bgColor: 'bg-green-500', width: 'w-10/12 md:w-9/12' },
  };

  return (
    <div className="space-y-10">
        {journeyStages.map((stage) => {
            const config = stageConfigs[stage.stage];
            return (
                <div key={stage.stage}>
                    <div 
                        className={`relative h-16 ${config.width} ${config.bgColor} mx-auto flex items-center justify-center text-white font-bold text-lg tracking-wider uppercase shadow-md`}
                        style={{ clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0% 100%)' }}
                    >
                       {getStageTranslation(stage.stage)}
                    </div>
                    <div className="relative mt-[-1rem] pt-6 pb-4 px-4 bg-stone-50 dark:bg-gray-800/60 rounded-lg shadow-sm">
                        <p className="text-sm text-center text-stone-500 dark:text-gray-400 mb-4">{stage.description}</p>
                        <h5 className="font-semibold mb-2 text-md text-stone-800 dark:text-gray-200">{t('strategies')}</h5>
                        <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-gray-400 text-sm">
                            {Array.isArray(stage.tactics) && stage.tactics.map((tactic, i) => <li key={i}>{tactic}</li>)}
                        </ul>
                    </div>
                </div>
            );
        })}
    </div>
  );
};

export default CustomerJourneyFunnel;
