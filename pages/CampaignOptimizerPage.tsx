import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslations } from '../hooks/useTranslations';
import type { CampaignPerformanceData, OptimizationTip } from '../types';
import { analyzeCampaignPerformance } from '../services/geminiService';

// Basic CSV to JSON parser
const parseCSV = (csvText: string): CampaignPerformanceData[] => {
    const lines = csvText.split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        const values = line.split(',');
        const obj: { [key: string]: string } = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] ? values[index].trim() : '';
        });
        data.push(obj);
    }
    return data;
};

const CampaignOptimizerPage: React.FC = () => {
    const { t } = useTranslations();
    const [files, setFiles] = useState<File[]>([]);
    const [optimizationTips, setOptimizationTips] = useState<OptimizationTip[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(acceptedFiles);
        setOptimizationTips(null);
        setError(null);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/csv': ['.csv'] },
        maxFiles: 1
    });

    const handleAnalyze = async () => {
        if (files.length === 0) return;
        setIsLoading(true);
        setError(null);
        setOptimizationTips(null);
        
        try {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const csvText = event.target?.result as string;
                    const parsedData = parseCSV(csvText);
                    if (parsedData.length === 0) {
                        throw new Error(t('csvErrorEmpty'));
                    }
                    const tips = await analyzeCampaignPerformance(parsedData);
                    setOptimizationTips(tips);
                } catch (err: any) {
                    setError(err.message || t('csvErrorAnalyze'));
                } finally {
                    setIsLoading(false);
                }
            };
            reader.onerror = () => {
                setError(t('csvErrorRead'));
                setIsLoading(false);
            };
            reader.readAsText(file);
        } catch (err: any) {
            setError(err.message || t('csvErrorUnexpected'));
            setIsLoading(false);
        }
    };

    const PriorityPill: React.FC<{ priority: 'High' | 'Medium' | 'Low' }> = ({ priority }) => {
        const map = {
            High: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
            Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            Low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        };
        return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${map[priority]}`}>{t(`priority${priority}`)}</span>;
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-stone-900 dark:text-gray-100">{t('campaignOptimizerTitle')}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                    <p className="text-stone-600 dark:text-gray-400">{t('campaignOptimizerDescription')}</p>
                    <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-stone-300 dark:border-gray-600 hover:border-orange-400'}`}>
                        <input {...getInputProps()} />
                        <div className="text-center text-stone-500 dark:text-gray-400">
                            <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            <p className="mt-2">{isDragActive ? t('dropzoneActive') : t('dropzoneIdle')}</p>
                        </div>
                    </div>
                    {files.length > 0 && (
                        <div className="p-3 bg-stone-100 dark:bg-gray-800 rounded-md text-sm">
                            <strong>{t('selectedFileLabel')}</strong> {files[0].name}
                        </div>
                    )}
                    <button onClick={handleAnalyze} disabled={files.length === 0 || isLoading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {isLoading ? t('analyzingButton') : t('getOptimizationTipsButton')}
                    </button>
                </div>

                <div className="space-y-4">
                    {isLoading && <div className="flex items-center justify-center p-8"><div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-orange-500"></div></div>}
                    {error && <div className="p-4 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-lg">{error}</div>}
                    {optimizationTips && (
                        <div className="space-y-4">
                             <h2 className="text-2xl font-semibold">{t('optimizationRecommendationsTitle')}</h2>
                            {optimizationTips.map((tip, index) => (
                                <div key={index} className="p-4 bg-white dark:bg-gray-900/50 rounded-lg border border-stone-200 dark:border-gray-700">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-semibold text-stone-900 dark:text-gray-100">{tip.title}</h3>
                                        <PriorityPill priority={tip.priority} />
                                    </div>
                                    <p className="text-sm text-stone-500 dark:text-gray-400 mb-1"><strong className="text-stone-600 dark:text-gray-300">Observation:</strong> {tip.observation}</p>
                                    <p className="text-sm text-stone-700 dark:text-gray-200"><strong className="text-stone-600 dark:text-gray-300">Recommendation:</strong> {tip.recommendation}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampaignOptimizerPage;