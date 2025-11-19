import React from 'react';
import { useTranslations } from '../hooks/useTranslations';

interface ErrorDisplayProps {
  error: string | null;
  onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
    const { t } = useTranslations();

    const renderErrorMessage = () => {
        if (!error) return null;

        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = error.split(urlRegex);

        return parts.map((part, index) => {
            if (part.match(urlRegex)) {
                return (
                    <a
                        key={index}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 dark:text-orange-400 underline hover:text-orange-700"
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    return (
        <div className="text-center p-8 max-w-2xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">{t('errorTitle')}</h2>
            <div className="text-stone-700 dark:text-gray-300 mb-6 break-words">
                {renderErrorMessage()}
            </div>
            <button
                onClick={onRetry}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
                {t('startOverButton')}
            </button>
        </div>
    );
};

export default ErrorDisplay;
