import React, { useState, useEffect } from 'react';
import type { SavedHtmlReport } from '../types';
import { useTranslations } from '../hooks/useTranslations';

const AdminHtmlReportViewer: React.FC = () => {
    const { t } = useTranslations();
    const [htmlReports, setHtmlReports] = useState<SavedHtmlReport[]>([]);

    useEffect(() => {
        try {
            const reportsStr = localStorage.getItem('saved_html_reports');
            if(reportsStr) {
                setHtmlReports(JSON.parse(reportsStr));
            }
        } catch (e) {
            console.error("Could not load HTML reports from localStorage", e);
        }
    }, []);
    
    const viewReportInNewTab = (htmlContent: string) => {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-900/50 rounded-xl border border-stone-200 dark:border-gray-700/50">
            <h2 className="text-xl font-bold text-stone-900 dark:text-gray-100 mb-4">{t('htmlReports')}</h2>
            <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
                {htmlReports.length > 0 ? htmlReports.map(report => (
                    <div 
                        key={report.id} 
                        className="flex justify-between items-center p-3 bg-stone-50 dark:bg-gray-800/60 rounded-lg hover:shadow-md hover:bg-stone-100 dark:hover:bg-gray-800 transition-all"
                    >
                        <div>
                            <p className="font-semibold text-stone-800 dark:text-gray-200">{report.userInput.keyword}</p>
                            <p className="text-sm text-stone-500 dark:text-gray-400">{report.userInput.url}</p>
                            <p className="text-xs text-stone-500 dark:text-gray-500 mt-1">{new Date(report.timestamp).toLocaleString()}</p>
                        </div>
                        <button onClick={() => viewReportInNewTab(report.htmlContent)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-3 text-sm rounded-lg">
                            {t('viewReport')}
                        </button>
                    </div>
                )) : (
                    <div className="text-center py-12">
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

export default AdminHtmlReportViewer;
