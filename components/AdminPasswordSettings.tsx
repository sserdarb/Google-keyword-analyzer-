
import React, { useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';

const AdminPasswordSettings: React.FC = () => {
    const { t } = useTranslations();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!password) {
            setError(t('errorPasswordRequired'));
            return;
        }

        if (password !== confirmPassword) {
            setError(t('errorPasswordsDoNotMatch'));
            return;
        }

        try {
            localStorage.setItem('adminPassword', password);
            setSuccessMessage(t('passwordChangedSuccessfully'));
            setPassword('');
            setConfirmPassword('');
            setTimeout(() => setSuccessMessage(''), 4000); // Clear message after a few seconds
        } catch (err) {
            setError(t('errorSavingPassword'));
            console.error(err);
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white dark:bg-gray-900/50 rounded-xl border border-stone-200 dark:border-gray-700/50">
            <h2 className="text-xl font-semibold text-stone-800 dark:text-gray-200 mb-4">{t('changeAdminPassword')}</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-1">
                        {t('newPassword')}
                    </label>
                    <input
                        id="new-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-gray-900/50 border border-stone-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition-shadow text-stone-900 dark:text-gray-100"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-1">
                        {t('confirmNewPassword')}
                    </label>
                    <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-gray-900/50 border border-stone-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition-shadow text-stone-900 dark:text-gray-100"
                        required
                    />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
                <div className="text-right">
                    <button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        {t('savePasswordButton')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminPasswordSettings;
