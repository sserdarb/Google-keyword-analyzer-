// FIX: Implement the StrategyWorkbench component with a real-time chat interface.
import React, { useState, useRef, useEffect } from 'react';
import type { ReportData, UserInput, Message } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { refineStrategyStream } from '../services/geminiService';
import VoiceInputButton from './VoiceInputButton';
import { useLanguage } from '../hooks/useLanguage';

interface StrategyWorkbenchProps {
  reportData: Partial<ReportData>;
  userInput: UserInput;
}

const StrategyWorkbench: React.FC<StrategyWorkbenchProps> = ({ reportData, userInput }) => {
  const { t } = useTranslations();
  const { locale } = useLanguage();
  const [history, setHistory] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!currentQuestion.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: currentQuestion.trim() };
    const currentHistory = [...history];
    setHistory(prev => [...prev, userMessage]);
    setCurrentQuestion('');
    setIsLoading(true);
    setError(null);

    try {
        const stream = await refineStrategyStream(userInput, reportData, currentHistory, userMessage.text);
        const reader = stream.getReader();
        let currentResponse = '';
        const modelMessageId = (Date.now() + 1).toString();

        setHistory(prev => [...prev, { id: modelMessageId, role: 'model', text: '' }]);

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            currentResponse += value;
            
            setHistory(prev => prev.map(msg => 
                msg.id === modelMessageId ? { ...msg, text: currentResponse } : msg
            ));
        }

    } catch (err: any) {
      setError(err.message || t('errorRefiningStrategy'));
      setHistory(prev => [...prev, { id: 'error-' + Date.now(), role: 'model', text: t('errorRefiningStrategy') }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-96 flex flex-col">
        <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-2 space-y-4">
            <div className="p-3 bg-stone-50 dark:bg-gray-800/60 rounded-lg text-stone-700 dark:text-gray-300">
                <p>{t('strategyWorkbenchWelcome')}</p>
            </div>
            {history.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl ${msg.role === 'user' ? 'bg-orange-500 text-white' : 'bg-stone-200 dark:bg-gray-700'}`}>
                       <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                     <div className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-gray-700">
                        <div className="flex items-center space-x-1">
                           <div className="w-2 h-2 bg-stone-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                           <div className="w-2 h-2 bg-stone-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                           <div className="w-2 h-2 bg-stone-400 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        <form onSubmit={handleSubmit} className="mt-4 flex items-center space-x-2">
            <div className="relative flex-grow">
                 <input
                    type="text"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    placeholder={t('strategyWorkbenchPlaceholder')}
                    className="w-full p-3 pr-20 bg-white dark:bg-gray-800 border border-stone-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                 />
                 <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <VoiceInputButton onTranscript={t => setCurrentQuestion(prev => prev + t)} language={locale} />
                    <button type="submit" disabled={isLoading || !currentQuestion.trim()} className="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                    </button>
                 </div>
            </div>
        </form>
         {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default StrategyWorkbench;