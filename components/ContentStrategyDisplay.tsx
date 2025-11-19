// FIX: Implement the ContentStrategyDisplay to correctly render all strategy parts.
import React, { useState } from 'react';
import type { ContentStrategy, ReportData, UserInput, ContentPillar, SocialConnections, SocialPlatform } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { generateImageFromPrompt, generateBlogPostDraft } from '../services/geminiService';
import BlogPostDraftModal from './BlogPostDraftModal';
import PostToSocialModal from './PostToSocialModal';

interface ContentStrategyDisplayProps {
  data: ContentStrategy;
  reportData: Partial<ReportData>;
  userInput: UserInput;
  socialConnections: SocialConnections;
  onConnectSocial: (platform: SocialPlatform, connect: boolean) => void;
}

const ContentStrategyDisplay: React.FC<ContentStrategyDisplayProps> = ({ data, reportData, userInput, socialConnections, onConnectSocial }) => {
  const { t } = useTranslations();
  const [imageModalState, setImageModalState] = useState<{ isOpen: boolean; currentPrompt: string }>({ isOpen: false, currentPrompt: '' });
  const [editablePrompt, setEditablePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [blogModalState, setBlogModalState] = useState<{ isOpen: boolean; topic: string }>({ isOpen: false, topic: '' });
  const [postModalState, setPostModalState] = useState<{ isOpen: boolean; post: ContentPillar['postIdeas'][0] | null }>({ isOpen: false, post: null });

  if (!data) {
    return <p>{t('noContentStrategyData')}</p>;
  }
  
  const getIconForFormat = (format: string) => {
    const lowerFormat = format.toLowerCase();
    if (lowerFormat.includes('video') || lowerFormat.includes('reel') || lowerFormat.includes('short')) {
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
    if (lowerFormat.includes('blog') || lowerFormat.includes('article') || lowerFormat.includes('yazı')) {
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    }
    if (lowerFormat.includes('podcast')) {
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
    }
    if (lowerFormat.includes('infographic') || lowerFormat.includes('infografik')) {
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>;
    }
     if (lowerFormat.includes('social media') || lowerFormat.includes('sosyal medya') || lowerFormat.includes('post')) {
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V10a2 2 0 012-2h8z" /></svg>;
    }
    return <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
  };

  const openImageModal = (prompt: string) => {
    setImageModalState({ isOpen: true, currentPrompt: prompt });
    setEditablePrompt(prompt);
    setGeneratedImage(null);
    setGenerationError(null);
  };

  const closeImageModal = () => {
    setImageModalState({ isOpen: false, currentPrompt: '' });
  };
  
  const openBlogModal = (topic: string) => {
    setBlogModalState({ isOpen: true, topic });
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    setGeneratedImage(null);
    setGenerationError(null);
    try {
        const imageData = await generateImageFromPrompt(editablePrompt);
        setGeneratedImage(imageData);
    } catch (err: any) {
        setGenerationError(err.message || "An unexpected error occurred");
    } finally {
        setIsGeneratingImage(false);
    }
  };
  
  const handleOpenShareModal = (post: ContentPillar['postIdeas'][0]) => {
    setPostModalState({ isOpen: true, post });
  };

  const platforms: SocialPlatform[] = ['Facebook', 'Instagram', 'Twitter'];

  const platformIcons: Record<SocialPlatform, React.ReactNode> = {
    Facebook: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z"/></svg>,
    Instagram: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01" /></svg>,
    Twitter: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.602.75zm-.86 13.028h1.36L4.323 2.145H2.865z"/></svg>,
  };

  const ImageGenModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={closeImageModal}>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 text-stone-900 dark:text-gray-100">{t('generateImage')}</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="prompt-textarea" className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-1">{t('visualPrompt')}</label>
                    <textarea
                        id="prompt-textarea"
                        value={editablePrompt}
                        onChange={(e) => setEditablePrompt(e.target.value)}
                        rows={3}
                        className="w-full p-2 bg-white dark:bg-gray-900/50 border border-stone-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                </div>
                <div className="text-right">
                    <button onClick={handleGenerateImage} disabled={isGeneratingImage || !editablePrompt.trim()} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-5 rounded-lg transition-colors disabled:bg-gray-400">
                        {isGeneratingImage ? t('generatingImage') : t('generateImage')}
                    </button>
                </div>
                <div className="w-full aspect-square bg-stone-100 dark:bg-gray-900 rounded-md flex items-center justify-center">
                    {isGeneratingImage && <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-orange-500"></div>}
                    {generationError && <p className="text-red-500 text-sm p-4">{generationError}</p>}
                    {generatedImage && <img src={`data:image/jpeg;base64,${generatedImage}`} alt={editablePrompt} className="w-full h-full object-cover rounded-md" />}
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <>
      {postModalState.isOpen && postModalState.post && (
        <PostToSocialModal 
          isOpen={postModalState.isOpen}
          onClose={() => setPostModalState({ isOpen: false, post: null })}
          post={postModalState.post}
          connections={socialConnections}
        />
      )}
      {imageModalState.isOpen && <ImageGenModal />}
      {blogModalState.isOpen && (
          <BlogPostDraftModal 
            topic={blogModalState.topic}
            reportData={reportData}
            userInput={userInput}
            onClose={() => setBlogModalState({ isOpen: false, topic: '' })}
          />
      )}
      <div className="space-y-8">
        <div className="no-print">
            <h3 className="text-xl font-semibold text-stone-800 dark:text-gray-200 mb-4">{t('socialIntegrationsTitle')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {platforms.map(platform => (
                    <div key={platform} className="p-4 bg-stone-50 dark:bg-gray-800/60 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3 text-stone-700 dark:text-gray-300">
                        {platformIcons[platform]}
                        <span className="font-semibold">{t(platform.toLowerCase() as any)}</span>
                        </div>
                        <button
                        onClick={() => onConnectSocial(platform, !socialConnections[platform])}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                            socialConnections[platform]
                            ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900'
                            : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900'
                        }`}
                        >
                        {socialConnections[platform] ? t('disconnectButton') : t('connectButton')}
                        </button>
                    </div>
                ))}
            </div>
        </div>
        {data.pillars && data.pillars.length > 0 && (
            <div>
                <h3 className="text-xl font-semibold text-stone-800 dark:text-gray-200 mb-4">{t('contentPillarsTitle')}</h3>
                <div className="space-y-6">
                {data.pillars.map((pillar, index) => (
                    <div key={index} className="p-4 border-l-4 border-orange-500 bg-stone-50 dark:bg-gray-800/60 rounded-r-lg">
                    <h4 className="text-lg font-semibold text-stone-800 dark:text-gray-200">{pillar.pillar}</h4>
                    <p className="text-sm text-stone-600 dark:text-gray-400 mt-1 mb-3">{pillar.description}</p>
                    <ul className="space-y-1 list-none text-sm">
                        {pillar.postIdeas.map((idea, i) => (
                        <li key={idea.id} className="flex items-start justify-between group py-2 border-b border-stone-100 dark:border-gray-800/80 last:border-none">
                            <div>
                                <p className="font-medium text-stone-800 dark:text-gray-200">{idea.title}</p>
                                <p className="text-xs text-stone-500 dark:text-gray-500 mt-0.5">{idea.brief}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 pl-4 no-print">
                               <button 
                                    onClick={() => handleOpenShareModal(idea)} 
                                    title={t('sharePostButton')}
                                    className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-stone-200 dark:bg-gray-700 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-400"
                                >
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                                </button>
                               <button 
                                    onClick={() => openBlogModal(idea.title)} 
                                    title={t('draftWithAI')}
                                    className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-stone-200 dark:bg-gray-700 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-400"
                                >
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                </button>
                                <button 
                                    onClick={() => openImageModal(idea.title)} 
                                    title={t('generateImage')}
                                    className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-stone-200 dark:bg-gray-700 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-400"
                                >
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        </li>
                        ))}
                    </ul>
                    </div>
                ))}
                </div>
            </div>
        )}

        {data.contentFormats && data.contentFormats.length > 0 && (
            <div>
                <h3 className="text-xl font-semibold text-stone-800 dark:text-gray-200 mb-4">{t('contentFormatsTitle')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.contentFormats.map((format, index) => (
                         <div key={index} className="p-4 bg-stone-50 dark:bg-gray-800/60 rounded-lg flex items-start gap-4 border border-stone-200 dark:border-gray-700/50">
                            <div className="flex-shrink-0 h-12 w-12 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-lg flex items-center justify-center">
                                {getIconForFormat(format.format)}
                            </div>
                            <div>
                                <h4 className="font-semibold text-stone-800 dark:text-gray-200">{format.format}</h4>
                                <p className="text-sm text-stone-600 dark:text-gray-400 mt-1">{format.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {data.suggestedTopics && data.suggestedTopics.length > 0 && (
            <div>
                <h3 className="text-xl font-semibold text-stone-800 dark:text-gray-200 mb-4">{t('suggestedTopicsTitle')}</h3>
                <div className="flex flex-wrap gap-2">
                    {data.suggestedTopics.map((topic, index) => (
                        <span key={index} className="px-3 py-1 text-sm bg-stone-200 dark:bg-gray-700 rounded-full">{topic}</span>
                    ))}
                </div>
            </div>
        )}
      </div>
    </>
  );
};

export default ContentStrategyDisplay;