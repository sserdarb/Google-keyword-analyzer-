import React, { useState, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import type { ApiSettings } from '../types';

const API_SETTINGS_KEY = 'api_settings';

const getApiSettings = (): ApiSettings => {
    try {
        const settings = localStorage.getItem(API_SETTINGS_KEY);
        return settings ? JSON.parse(settings) : {};
    } catch (e) {
        console.error("Failed to parse API settings from localStorage", e);
        return {};
    }
};

const saveApiSettings = (settings: ApiSettings): void => {
    try {
        localStorage.setItem(API_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error("Failed to save API settings to localStorage", e);
    }
};

const ApiManagement: React.FC = () => {
    const { t } = useTranslations();
    const [settings, setSettings] = useState<ApiSettings>({});
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        setSettings(getApiSettings());
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        saveApiSettings(settings);
        setSuccessMessage(t('settingsSavedSuccess'));
        setTimeout(() => setSuccessMessage(''), 4000);
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900/50 rounded-xl border border-stone-200 dark:border-gray-700/50">
            <h2 className="text-xl font-semibold text-stone-800 dark:text-gray-200 mb-2">{t('apiManagement')}</h2>
            <p className="text-sm text-stone-600 dark:text-gray-400 mb-6">{t('apiSettingsDescription')}</p>
            
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label htmlFor="youtubeApiKey" className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-1">
                        {t('youtubeApiKeyLabel')}
                    </label>
                    <input
                        id="youtubeApiKey"
                        name="youtubeApiKey"
                        type="password"
                        value={settings.youtubeApiKey || ''}
                        onChange={handleChange}
                        className="w-full p-3 bg-white dark:bg-gray-900/50 border border-stone-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        placeholder="Enter YouTube API Key"
                    />
                </div>
                <div>
                    <label htmlFor="facebookApiKey" className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-1">
                        {t('facebookApiKeyLabel')}
                    </label>
                    <input
                        id="facebookApiKey"
                        name="facebookApiKey"
                        type="password"
                        value={settings.facebookApiKey || ''}
                        onChange={handleChange}
                        className="w-full p-3 bg-white dark:bg-gray-900/50 border border-stone-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        placeholder="Enter Facebook API Key"
                    />
                </div>
                
                {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
                
                <div className="text-right pt-2">
                    <button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        {t('saveSettingsButton')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ApiManagement;