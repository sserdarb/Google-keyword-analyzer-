
import React, { useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import VoiceInputButton from './VoiceInputButton';
import { useLanguage } from '../hooks/useLanguage';

interface QuestionnaireProps {
  questions: string[];
  onSubmit: (answers: string) => void;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ questions, onSubmit }) => {
  const { t } = useTranslations();
  const { locale } = useLanguage();
  const [answers, setAnswers] = useState<string[]>(() => Array(questions.length).fill(''));

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleTranscript = (index: number, transcript: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = newAnswers[index] ? `${newAnswers[index]} ${transcript}` : transcript;
    setAnswers(newAnswers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const combinedAnswers = answers.map(a => a.trim()).filter(Boolean).join('. ');
    if (combinedAnswers) {
      onSubmit(combinedAnswers);
    }
  };

  const isSubmitDisabled = !answers.some(a => a.trim() !== '');

  return (
    <div className="flex flex-col max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-gray-200 mb-4">{t('clarifyingQuestionsTitle')}</h2>
        <p className="text-stone-600 dark:text-gray-400 mb-8">
            {t('clarifyingQuestionsDescription')}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((q, index) => (
                <div key={index}>
                    <label htmlFor={`question-${index}`} className="block text-md font-medium text-stone-700 dark:text-gray-300 mb-2 pl-4 border-l-2 border-orange-500 italic">
                        "{q}"
                    </label>
                    <div className="relative mt-2">
                        <textarea
                            id={`question-${index}`}
                            className="w-full h-24 p-3 bg-white dark:bg-gray-900/50 border border-stone-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition-shadow text-stone-900 dark:text-gray-100 resize-none"
                            placeholder={t('answersTextareaPlaceholder')}
                            value={answers[index]}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                        />
                        <VoiceInputButton
                            onTranscript={(t) => handleTranscript(index, t)}
                            language={locale}
                            className="absolute top-2 right-2"
                        />
                    </div>
                </div>
            ))}
            <div className="pt-4 text-right">
                <button
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={isSubmitDisabled}
                >
                    {t('generateReportButton')}
                </button>
            </div>
        </form>
    </div>
  );
};

export default Questionnaire;