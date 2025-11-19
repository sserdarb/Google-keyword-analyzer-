
import React, { useState, useEffect } from 'react';
import { generateBlogPostDraft } from '../services/geminiService';
import type { ReportData, UserInput } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface BlogPostDraftModalProps {
  topic: string;
  reportData: Partial<ReportData>;
  userInput: UserInput;
  onClose: () => void;
}

const BlogPostDraftModal: React.FC<BlogPostDraftModalProps> = ({ topic, reportData, userInput, onClose }) => {
  const { t } = useTranslations();
  const [draft, setDraft] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchDraft = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const generatedDraft = await generateBlogPostDraft(
          topic,
          userInput.keyword,
          reportData.brandAnalysis?.targetAudiencePersona?.name || 'the target audience',
          userInput.language
        );
        setDraft(generatedDraft);
      } catch (err: any) {
        setError(err.message || 'Failed to generate draft.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDraft();
  }, [topic, reportData, userInput]);
  
  const handleCopyToClipboard = () => {
    if (draft) {
      navigator.clipboard.writeText(draft);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const renderContent = () => {
      if (!draft) return null;
      // Basic markdown to HTML conversion
      return draft.split('\n').map((line, index) => {
          if (line.startsWith('# ')) {
              return <h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
          }
          if (line.startsWith('## ')) {
              return <h2 key={index} className="text-xl font-semibold mt-4 mb-2">{line.substring(3)}</h2>
          }
          if (line.trim() === '') {
              return <br key={index} />;
          }
          return <p key={index} className="mb-4">{line}</p>;
      }).filter(Boolean);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-3xl m-4 flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="text-lg font-bold text-stone-900 dark:text-gray-100">{t('blogPostDraftTitle')}</h3>
          <div className="flex items-center gap-2">
            <button onClick={handleCopyToClipboard} className={`text-sm font-semibold py-2 px-4 rounded-lg transition-colors ${isCopied ? 'bg-green-100 text-green-800' : 'bg-stone-200 hover:bg-stone-300'}`}>
              {isCopied ? t('copied') : t('copyToClipboard')}
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto pr-4 text-stone-700 dark:text-gray-300">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-orange-500"></div>
            </div>
          )}
          {error && <p className="text-red-500">{error}</p>}
          {draft && renderContent()}
        </div>
      </div>
    </div>
  );
};

export default BlogPostDraftModal;