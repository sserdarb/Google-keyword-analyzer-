import { useMemo } from 'react';
import { useTranslations } from './useTranslations';
import type { Currency } from '../types';

export const useCurrency = (currency: Currency) => {
    const { locale } = useTranslations();

    const convertAndFormat = useMemo(() => {
        return (value?: string | number) => {
            if (value === undefined || value === null) return 'N/A';
            
            let numericValue: number;

            if (typeof value === 'string') {
                // Remove currency symbols, commas, and parse the number
                const cleanedValue = value.replace(/[^\d.-]/g, '');
                numericValue = parseFloat(cleanedValue);
            } else {
                numericValue = value;
            }

            if (isNaN(numericValue)) return 'N/A';
            
            try {
                return new Intl.NumberFormat(locale, {
                    style: 'currency',
                    currency: currency,
                    minimumFractionDigits: currency === 'TRY' ? 2 : 2, // Example logic, adjust as needed
                    maximumFractionDigits: 2,
                }).format(numericValue);
            } catch (e) {
                console.error("Currency formatting error:", e);
                // Fallback for invalid currency codes
                return `${currency} ${numericValue.toFixed(2)}`;
            }
        };
    }, [currency, locale]);

    return { convertAndFormat };
};
