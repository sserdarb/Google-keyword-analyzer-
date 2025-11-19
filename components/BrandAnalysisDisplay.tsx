
import React, { useState } from 'react';
import type { BrandAnalysis } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import PieChart from './PieChart';
import VerticalBarChart from './VerticalBarChart';

interface BrandAnalysisDisplayProps {
  data: BrandAnalysis;
}

const BrandAnalysisDisplay: React.FC<BrandAnalysisDisplayProps> = ({ data }) => {
  const { t } = useTranslations();
  const [openPainPoint, setOpenPainPoint] = useState<number | null>(null);

  // Thanks to the normalization layer, we can be much more confident in the data structure.
  // We still add optional chaining as a best practice for safe rendering.
  if (!data) {
    return null;
  }

  const { brandIdentity, brandVoice, targetAudiencePersona: persona } = data;

  const parsedPainPoints = (typeof persona?.painPoints === 'string' && persona.painPoints)
    ? persona.painPoints.split('\n').filter(p => p.trim() !== '').map(p => {
        const parts = p.split(':');
        const title = parts[0]?.trim();
        const description = parts.slice(1).join(':').trim();
        return { title, description };
    }).filter(p => p.title)
    : [];

  return (
    <div className="space-y-4">
      {brandIdentity && (
        <div>
          <h4 className="text-lg font-semibold text-stone-800 dark:text-gray-200">{t('brandIdentityTitle')}</h4>
          <p className="text-stone-600 dark:text-gray-400">{brandIdentity}</p>
        </div>
      )}

      {brandVoice && (
        <div>
          <h4 className="text-lg font-semibold text-stone-800 dark:text-gray-200">{t('brandVoiceTitle')}</h4>
          <p className="text-stone-600 dark:text-gray-400">{brandVoice}</p>
        </div>
      )}
      
      {persona && (
        <div>
          <h4 className="text-lg font-semibold text-stone-800 dark:text-gray-200">{t('targetAudiencePersonaTitle')}</h4>
          <div className="text-stone-600 dark:text-gray-400 space-y-3 text-sm p-4 bg-stone-50 dark:bg-gray-800/60 rounded-lg">
            {persona.name && <p className="font-bold text-base text-stone-800 dark:text-gray-200">{persona.name}</p>}

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                <div className="space-y-4">
                    {persona.demographics && Object.keys(persona.demographics).length > 0 && (
                      <div>
                        <p className="font-semibold text-stone-700 dark:text-gray-300">{t('personaDemographics')}:</p>
                        <div className="pl-2 mt-2">
                            <div className="space-y-2">
                                {Object.entries(persona.demographics).map(([key, value]) => (
                                    value && (
                                        <div key={key} className="flex">
                                            <span className="font-semibold text-stone-700 dark:text-gray-300 capitalize w-28 flex-shrink-0">{t(`persona${key.charAt(0).toUpperCase() + key.slice(1)}`)}:</span>
                                            <span className="text-stone-600 dark:text-gray-400">{String(value)}</span>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                      </div>
                    )}
                     {persona.motivations && (
                      <div className="pt-2">
                        <p className="font-semibold text-stone-700 dark:text-gray-300">{t('personaMotivations')}:</p>
                        <p className="whitespace-pre-wrap pl-2 text-stone-600 dark:text-gray-400">{persona.motivations}</p>
                      </div>
                    )}

                    {parsedPainPoints.length > 0 ? (
                      <div className="pt-2">
                        <p className="font-semibold text-stone-700 dark:text-gray-300 mb-2">{t('personaPainPoints')}:</p>
                        <div className="space-y-2">
                            {parsedPainPoints.map((point, index) => (
                                <div key={index} className="border border-stone-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setOpenPainPoint(openPainPoint === index ? null : index)}
                                        className="w-full flex justify-between items-center p-3 text-left font-semibold text-stone-800 dark:text-gray-200 bg-stone-100/50 dark:bg-gray-900/30 hover:bg-stone-100 dark:hover:bg-gray-900/50"
                                    >
                                        <span>{point.title}</span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className={`h-5 w-5 transition-transform duration-200 ${openPainPoint === index ? 'rotate-180' : ''}`}
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                    {openPainPoint === index && (
                                        <div className="p-3 border-t border-stone-200 dark:border-gray-700">
                                            <p>{point.description || t('noDetailsAvailable')}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                      </div>
                    ) : (persona.painPoints && typeof persona.painPoints === 'string' &&
                        <div className="pt-2">
                          <p className="font-semibold text-stone-700 dark:text-gray-300">{t('personaPainPoints')}:</p>
                          <p className="whitespace-pre-wrap pl-2 text-stone-600 dark:text-gray-400">{persona.painPoints}</p>
                        </div>
                    )}
                </div>
                 <div className="space-y-6">
                    {persona.genderDistribution && persona.genderDistribution.length > 0 && (
                        <div>
                            <h5 className="text-md font-semibold text-center text-stone-700 dark:text-gray-300 mb-2">{t('genderDistributionTitle')}</h5>
                            <PieChart data={persona.genderDistribution} />
                        </div>
                    )}
                    {persona.ageDistribution && persona.ageDistribution.length > 0 && (
                         <div>
                            <h5 className="text-md font-semibold text-center text-stone-700 dark:text-gray-300 mb-2">{t('ageDistributionTitle')}</h5>
                            <VerticalBarChart data={persona.ageDistribution} />
                        </div>
                    )}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandAnalysisDisplay;
