
import React from 'react';
import { useTranslations } from '../hooks/useTranslations';
import KeywordInput from './KeywordInput';
// Fix: Corrected import paths if they are causing issues, though they seem syntactically correct for a standard TS/React setup. The problem is more likely the empty content of the imported files.
import type { UserInput } from '../types';

interface WelcomeScreenProps {
  onSubmit: (data: UserInput) => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => {
    return (
        <div className="bg-white/50 dark:bg-gray-800/30 p-6 rounded-xl border border-stone-200 dark:border-gray-700/50">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-stone-900 dark:text-gray-200 mb-2">{title}</h3>
            <p className="text-stone-600 dark:text-gray-400">{description}</p>
        </div>
    );
};

const TestimonialCard: React.FC<{ quote: string; name: string; title: string; }> = ({ quote, name, title }) => {
    return (
        <div className="bg-white/50 dark:bg-gray-800/30 p-6 rounded-xl border border-stone-200 dark:border-gray-700/50 flex flex-col">
             <svg className="w-10 h-10 text-stone-300 dark:text-gray-600 mb-4" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                <path d="M9.352,4C4.456,4,4,4.456,4,9.352v9.296C4,23.544,8.456,28,13.352,28 L13.352,18.704L9.352,18.704L9.352,9.352 M22.648,4C17.752,4,17.296,4.456,17.296,9.352v9.296C17.296,23.544,21.752,28,26.648,28 L26.648,18.704L22.648,18.704L22.648,9.352" />
            </svg>
            <p className="text-stone-600 dark:text-gray-400 flex-grow">"{quote}"</p>
            <div className="mt-4 pt-4 border-t border-stone-200 dark:border-gray-700">
                <p className="font-semibold text-stone-900 dark:text-gray-200">{name}</p>
                <p className="text-sm text-stone-500 dark:text-gray-500">{title}</p>
            </div>
        </div>
    );
};


const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSubmit }) => {
  const { t } = useTranslations();

  const features = [
      {
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
          title: t('feature1Title'),
          description: t('feature1Description')
      },
      {
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
          title: t('feature2Title'),
          description: t('feature2Description')
      },
      {
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
          title: t('feature3Title'),
          description: t('feature3Description')
      }
  ];

  const testimonials = [
      {
          quote: t('testimonial1Quote'),
          name: t('testimonial1Name'),
          title: t('testimonial1Title'),
      },
      {
          quote: t('testimonial2Quote'),
          name: t('testimonial2Name'),
          title: t('testimonial2Title'),
      },
      {
          quote: t('testimonial3Quote'),
          name: t('testimonial3Name'),
          title: t('testimonial3Title'),
      }
  ];

  return (
    <div className="space-y-16">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-stone-900 dark:text-gray-100 mb-3">{t('welcomeTitle')}</h2>
        <p className="max-w-2xl mx-auto text-stone-600 dark:text-gray-400">{t('welcomeDescription')}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
          {features.map(feature => <FeatureCard key={feature.title} {...feature} />)}
      </div>

      <div className="pt-8 border-t border-stone-200 dark:border-gray-700">
        <KeywordInput onSubmit={onSubmit} />
      </div>

      <div className="pt-8 border-t border-stone-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-center text-stone-900 dark:text-gray-100 mb-8">{t('testimonialsTitle')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map(testimonial => <TestimonialCard key={testimonial.name} {...testimonial} />)}
          </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;