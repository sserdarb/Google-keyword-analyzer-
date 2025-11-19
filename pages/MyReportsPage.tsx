import React from 'react';
import type { SavedReport } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface MyReportsPageProps {
  reports: SavedReport[];
  onView: (report: SavedReport) => void;
  onDelete: (reportId: string) => void;
  onLoginRequest: () => void;
}

const MyReportsPage: React.FC<MyReportsPageProps> = ({ reports, onView, onDelete, onLoginRequest }) => {
  const { t } = useTranslations();
  const isLoggedIn = reports.length > 0 || !!localStorage.getItem('auth_session'); // A simple check

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-stone-900 dark:text-gray-100">{t('myReports')}</h1>

      <div className="space-y-4">
        {!isLoggedIn ? (
             <div className="text-center py-16 px-4 bg-white dark:bg-gray-900/50 rounded-xl border border-stone-200 dark:border-gray-700/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-stone-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="mt-4 text-stone-600 dark:text-gray-400">{t('noSavedReportsGuest')}</p>
                 <button onClick={onLoginRequest} className="mt-4 font-semibold text-sm bg-orange-500 hover:bg-orange-600 text-white py-2 px-5 rounded-full transition-colors">
                    {t('loginButton')}
                </button>
            </div>
        ) : reports.length > 0 ? (
          reports.map(report => (
            <div key={report.id} className="p-4 bg-white dark:bg-gray-900/50 rounded-xl border border-stone-200 dark:border-gray-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-grow">
                <p className="font-semibold text-lg text-stone-800 dark:text-gray-200">{report.userInput.keyword}</p>
                <p className="text-sm text-stone-500 dark:text-gray-400 break-all">{report.userInput.url}</p>
                <p className="text-xs text-stone-500 dark:text-gray-500 mt-1">
                  {t('reportSavedOn')} {new Date(report.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => onView(report)} 
                  className="w-full sm:w-auto text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 text-sm rounded-lg transition-colors"
                >
                  {t('viewReport')}
                </button>
                <button 
                  onClick={() => onDelete(report.id)} 
                  className="p-2 text-stone-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                  aria-label={t('deleteReport')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 px-4 bg-white dark:bg-gray-900/50 rounded-xl border border-stone-200 dark:border-gray-700/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-stone-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-stone-600 dark:text-gray-400">{t('noSavedReports')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReportsPage;