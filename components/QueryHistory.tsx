
import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from '../hooks/useTranslations';
// Fix: Corrected import paths if they are causing issues, though they seem syntactically correct for a standard TS/React setup. The problem is more likely the empty content of the imported files.
import type { QueryHistoryItem, UserInput } from '../types';

interface QueryHistoryProps {
  history: QueryHistoryItem[];
  onHistoryClick: (item: UserInput) => void;
  onDelete: (id: string) => void;
}

const QueryHistory: React.FC<QueryHistoryProps> = ({ history, onHistoryClick, onDelete }) => {
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-stone-200 dark:bg-gray-700 text-stone-800 dark:text-gray-200 hover:bg-stone-300 dark:hover:bg-gray-600 transition-colors"
        aria-label={t('queryHistoryTitle')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-lg shadow-xl z-20">
          <div className="p-3 border-b border-stone-200 dark:border-gray-700">
            <h3 className="font-semibold text-stone-900 dark:text-gray-200">{t('queryHistoryTitle')}</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between hover:bg-stone-100 dark:hover:bg-gray-700/60 transition-colors">
                <button
                  onClick={() => {
                    onHistoryClick(item);
                    setIsOpen(false);
                  }}
                  className="flex-grow text-left p-3"
                >
                  <p className="font-medium text-stone-900 dark:text-gray-100 truncate" title={item.keyword}>
                    {item.keyword}
                  </p>
                  <p className="text-sm text-stone-500 dark:text-gray-400 truncate" title={item.url}>
                    {item.url}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-gray-500 mt-1">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                    className="p-3 text-stone-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 flex-shrink-0"
                    aria-label="Delete history item"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                    </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryHistory;