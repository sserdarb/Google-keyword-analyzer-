// FIX: Implement the AdminPage component for administrative tasks.

import React, { useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import AdminPasswordSettings from '../components/AdminPasswordSettings';
import UserManagement from '../components/UserManagement';
import AdminHtmlReportViewer from '../components/AdminHtmlReportViewer';
import ApiManagement from '../components/ApiManagement';

interface AdminPageProps {
  onLogout: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onLogout }) => {
    const { t } = useTranslations();
    const [activeTab, setActiveTab] = useState<'users' | 'html_reports' | 'api' | 'settings'>('users');
    
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-stone-900 dark:text-gray-100">{t('adminPanelTitle')}</h1>
                <button
                    onClick={onLogout}
                    className="bg-stone-200 hover:bg-stone-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-stone-700 dark:text-gray-300 font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    {t('logoutButton')}
                </button>
            </div>
            
            <div className="border-b border-stone-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'users'
                                ? 'border-orange-500 text-orange-600 dark:text-orange-500'
                                : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                        }`}
                    >
                        {t('userManagement')}
                    </button>
                     <button
                        onClick={() => setActiveTab('html_reports')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'html_reports'
                                ? 'border-orange-500 text-orange-600 dark:text-orange-500'
                                : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                        }`}
                    >
                        {t('htmlReports')}
                    </button>
                    <button
                        onClick={() => setActiveTab('api')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'api'
                                ? 'border-orange-500 text-orange-600 dark:text-orange-500'
                                : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                        }`}
                    >
                        {t('apiManagement')}
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'settings'
                                ? 'border-orange-500 text-orange-600 dark:text-orange-500'
                                : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                        }`}
                    >
                        {t('changeAdminPassword')}
                    </button>
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'users' && <UserManagement />}
                {activeTab === 'html_reports' && <AdminHtmlReportViewer />}
                {activeTab === 'api' && <ApiManagement />}
                {activeTab === 'settings' && <AdminPasswordSettings />}
            </div>
        </div>
    );
};

export default AdminPage;