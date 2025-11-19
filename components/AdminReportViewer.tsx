

import React, { useState } from 'react';
import type { SavedReport } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import ReportView from './ReportView';

interface AdminReportViewerProps {
  reports: SavedReport[];
}

const AdminReportViewer: React.FC<AdminReportViewerProps> = ({ reports }) => {
    const { t } = useTranslations();
    const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);

    if (selectedReport) {
        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-stone-900 dark:text-gray-100">
                        {t('reportTitle')}
                    </h2>
                    <button 
                        onClick={() => setSelectedReport(null)} 
                        className="flex items-center gap-2 font-semibold text-sm text-stone-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                        {t('backToList')}
                    </button>
                </div>
                <ReportView 
                    reportData={selectedReport.reportData}
                    userInput={selectedReport.userInput}
                    onNewAnalysis={() => setSelectedReport(null)}
                    onSaveReport={() => {}}
                    onSaveHtmlReport={() => {}}
                    isLoggedIn={true}
                    hideActions={true}
                    onGenerateSeo={() => {}}
                    onGenerateTrends={() => {}}
                    onGenerateKeywords={() => {}}
                    onGenerateGoogleAds={() => {}}
                    onGenerateSocialMedia={() => {}}
                    onGenerateAdvancedAds={() => {}}
                    onGenerateRoi={() => {}}
                    onGenerateMarketingPlan={() => {}}
                    onUpdateGoogleAds={() => {}}
                    onUpdateSocialMedia={() => {}}
                    onUpdateAdvancedAds={() => {}}
                    loadingSections={{ 
                        seo: false, 
                        keywords: false,
                        googleAds: false,
                        socialMedia: false,
                        advancedAds: false,
                        roi: false,
                        trends: false,
                        marketingPlan: false,
                    }}
                    socialConnections={{}}
                    onConnectSocial={() => {}}
                />
            </div>
        )
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-900/50 rounded-xl border border-stone-200 dark:border-gray-700/50">
            <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
                {reports.length > 0 ? reports.map(report => (
                    <div 
                        key={report.id} 
                        className="flex justify-between items-center p-3 bg-stone-50 dark:bg-gray-800/60 rounded-lg hover:shadow-md hover:bg-stone-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
                        onClick={() => setSelectedReport(report)}
                    >
                        <div>
                            <p className="font-semibold text-stone-800 dark:text-gray-200">{report.userInput.keyword}</p>
                            <p className="text-sm text-stone-500 dark:text-gray-400">{report.userInput.url}</p>
                            <p className="text-xs text-stone-500 dark:text-gray-500 mt-1">{new Date(report.timestamp).toLocaleString()}</p>
                        </div>
                        <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-3 text-sm rounded-lg">
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

export default AdminReportViewer;