import React, { useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import * as authService from '../services/authService';

type AuthView = 'login' | 'signup' | 'forgotPassword';

interface AuthPageProps {
  onLogin: (email: string, pass: string) => Promise<string | null>;
  onSignUp: (email: string, pass: string, phone: string) => Promise<string | null>;
  onExit: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onSignUp, onExit }) => {
    const { t } = useTranslations();
    const [view, setView] = useState<AuthView>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setPhone('');
        setError(null);
        setSuccessMessage(null);
    };
    
    const handleViewChange = (newView: AuthView) => {
        setView(newView);
        resetForm();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        try {
            if (view === 'login') {
                const loginError = await onLogin(email, password);
                if (loginError) setError(loginError);
            } else if (view === 'signup') {
                if (password !== confirmPassword) {
                    setError(t('signupPasswordMismatchError'));
                    return;
                }
                const signUpError = await onSignUp(email, password, phone);
                if (signUpError) {
                    setError(signUpError);
                } else {
                    // Show success message instead of auto-login
                    setSuccessMessage(t('accountPendingApproval'));
                }
            } else if (view === 'forgotPassword') {
                const messageKey = await authService.requestPasswordReset(email);
                setSuccessMessage(t(messageKey));
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderTitle = () => {
        if (view === 'login') return t('loginTitle');
        if (view === 'signup') return t('signupTitle');
        return t('resetPasswordTitle');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onExit}>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-stone-900 dark:text-gray-200 text-center">
                    {renderTitle()}
                </h2>

                {successMessage ? (
                    <div className="text-center">
                        <p className="text-green-600 dark:text-green-400">{successMessage}</p>
                        <button onClick={() => handleViewChange('login')} className="text-sm text-orange-600 dark:text-orange-400 hover:underline mt-4">
                            {t('backToLogin')}
                        </button>
                    </div>
                ) : (
                    <>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {view === 'forgotPassword' && (
                                <p className="text-sm text-center text-stone-600 dark:text-gray-400">{t('resetPasswordDescription')}</p>
                            )}
                            <div>
                                <label htmlFor="auth-email" className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-1">{t('emailLabel')}</label>
                                <input
                                    id="auth-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 bg-white dark:bg-gray-900/50 border border-stone-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                    required
                                />
                            </div>
                            {view !== 'forgotPassword' && (
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label htmlFor="auth-password" className="block text-sm font-medium text-stone-700 dark:text-gray-300">{t('passwordLabel')}</label>
                                        {view === 'login' && (
                                            <button type="button" onClick={() => handleViewChange('forgotPassword')} className="text-xs text-orange-600 dark:text-orange-400 hover:underline">
                                                {t('forgotPasswordLink')}
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        id="auth-password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-3 bg-white dark:bg-gray-900/50 border border-stone-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                        required
                                    />
                                </div>
                            )}
                            {view === 'signup' && (
                                <>
                                    <div>
                                        <label htmlFor="auth-confirm-password" className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-1">{t('confirmPasswordLabel')}</label>
                                        <input
                                            id="auth-confirm-password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full p-3 bg-white dark:bg-gray-900/50 border border-stone-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="auth-phone" className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-1">{t('phoneLabel')}</label>
                                        <input
                                            id="auth-phone"
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full p-3 bg-white dark:bg-gray-900/50 border border-stone-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                </>
                            )}
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <div className="pt-4">
                                <button type="submit" disabled={isLoading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400">
                                    {isLoading ? '...' : (view === 'login' ? t('loginButton') : view === 'signup' ? t('signupButton') : t('sendResetLinkButton'))}
                                </button>
                            </div>
                        </form>
                        <div className="text-center mt-6">
                            {view === 'login' && (
                                <button onClick={() => handleViewChange('signup')} className="text-sm text-orange-600 dark:text-orange-400 hover:underline">
                                    {t('dontHaveAccount')}
                                </button>
                            )}
                             {view === 'signup' && (
                                <button onClick={() => handleViewChange('login')} className="text-sm text-orange-600 dark:text-orange-400 hover:underline">
                                    {t('alreadyHaveAccount')}
                                </button>
                            )}
                             {view === 'forgotPassword' && (
                                <button onClick={() => handleViewChange('login')} className="text-sm text-orange-600 dark:text-orange-400 hover:underline">
                                    {t('backToLogin')}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthPage;
