
import React from 'react';
// Fix: Corrected import paths if they are causing issues, though they seem syntactically correct for a standard TS/React setup. The problem is more likely the empty content of the imported files.
import type { GroundingChunk } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface SourceLinksProps {
  sources: GroundingChunk[];
}

const SourceLinks: React.FC<SourceLinksProps> = ({ sources }) => {
  const { t } = useTranslations();
  const validLinks = Array.isArray(sources) ? sources.filter(s => s.web && s.web.uri && s.web.title) : [];

  if (validLinks.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 p-3 bg-stone-100 dark:bg-gray-800/50 rounded-lg border border-stone-200 dark:border-gray-700">
      <h3 className="text-md font-semibold text-stone-700 dark:text-gray-300 mb-2">{t('sourcesTitle')}</h3>
      <div className="flex flex-wrap gap-2">
        {validLinks.map((source, index) => (
            <a
              key={index}
              href={source.web!.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-stone-200 dark:bg-gray-700 text-stone-700 dark:text-gray-300 px-2.5 py-1 rounded-full hover:bg-stone-300 dark:hover:bg-gray-600 transition-colors no-underline truncate"
              title={source.web!.title}
            >
              {source.web!.title}
            </a>
        ))}
      </div>
    </div>
  );
};

export default SourceLinks;