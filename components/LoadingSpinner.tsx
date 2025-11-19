
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from '../hooks/useTranslations';

const LoadingSpinner: React.FC = () => {
    const { t } = useTranslations();
    const steps = useMemo(() => [
        t('loadingMessage1'),
        t('loadingMessage2'),
        t('loadingMessageTrends'),
        t('loadingMessage7'),
        t('loadingMessage8'),
        t('loadingMessage3'),
        t('loadingMessage4'),
        t('loadingMessage5'),
        t('loadingMessage9'),
        t('loadingMessage10'),
        t('loadingMessage6'),
    ], [t]);

    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    useEffect(() => {
        // Reset to first step when language changes or component mounts
        setCurrentStepIndex(0); 
        
        const intervalId = setInterval(() => {
            setCurrentStepIndex(prevIndex => {
                if (prevIndex < steps.length - 1) {
                    return prevIndex + 1;
                }
                clearInterval(intervalId);
                return prevIndex;
            });
        }, 2000); 

        return () => clearInterval(intervalId);
    }, [steps]);

    const getStepStatus = (index: number): 'completed' | 'in_progress' | 'pending' => {
        if (index < currentStepIndex) {
            return 'completed';
        }
        if (index === currentStepIndex) {
            return 'in_progress';
        }
        return 'pending';
    };

    const StatusIcon: React.FC<{ status: 'completed' | 'in_progress' | 'pending' }> = ({ status }) => {
        switch (status) {
            case 'completed':
                return (
                    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'in_progress':
                return (
                    <div className="w-6 h-6 flex items-center justify-center">
                       <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-orange-500"></div>
                    </div>
                );
            case 'pending':
                return (
                    <svg className="w-6 h-6 text-stone-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 110-18 9 9 0 010 18z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] w-full max-w-md mx-auto">
            <div className="w-full space-y-4">
                {steps.map((step, index) => {
                    const status = getStepStatus(index);
                    const isCompleted = status === 'completed';
                    const isInProgress = status === 'in_progress';

                    return (
                        <div key={index} className="flex items-center space-x-4 transition-all duration-500">
                            <div className="flex-shrink-0">
                                <StatusIcon status={status} />
                            </div>
                            <p className={`text-left text-base sm:text-lg transition-all duration-300 ${
                                isCompleted ? 'text-gray-400 dark:text-gray-500 line-through' : 
                                isInProgress ? 'text-gray-800 dark:text-gray-200 font-semibold' : 
                                'text-gray-500 dark:text-gray-400'
                            }`}>
                                {step}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LoadingSpinner;