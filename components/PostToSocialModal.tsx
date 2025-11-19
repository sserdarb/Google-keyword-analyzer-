import React, { useState, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import type { ContentPillar, SocialConnections, SocialPlatform } from '../types';

interface PostToSocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: ContentPillar['postIdeas'][0];
  connections: SocialConnections;
}

const PostToSocialModal: React.FC<PostToSocialModalProps> = ({ isOpen, onClose, post, connections }) => {
  const { t } = useTranslations();
  const [postContent, setPostContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  useEffect(() => {
    if (post) {
      setPostContent(`${post.title}\n\n${post.brief}`);
      setSelectedPlatforms([]);
      setPostSuccess(false);
    }
  }, [post]);

  if (!isOpen) return null;

  const handlePlatformToggle = (platform: SocialPlatform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const handlePost = () => {
    setIsPosting(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Posting to:', selectedPlatforms, 'Content:', postContent);
      setIsPosting(false);
      setPostSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500); // Close modal after showing success message
    }, 1000);
  };
  
  const connectedPlatforms = Object.entries(connections)
    .filter(([, isConnected]) => isConnected)
    .map(([platform]) => platform as SocialPlatform);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4 text-stone-900 dark:text-gray-100">{t('postToSocialTitle')}</h3>
        
        {postSuccess ? (
          <div className="text-center p-8">
            <p className="text-green-600 dark:text-green-400 font-semibold">{t('postSuccessMessage')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="post-content" className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-1">{t('postContentLabel')}</label>
              <textarea
                id="post-content"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={6}
                className="w-full p-2 bg-white dark:bg-gray-900/50 border border-stone-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-2">{t('selectPlatformsLabel')}</label>
              <div className="flex flex-wrap gap-2">
                {connectedPlatforms.length > 0 ? connectedPlatforms.map(platform => (
                  <button
                    key={platform}
                    onClick={() => handlePlatformToggle(platform)}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                      selectedPlatforms.includes(platform)
                        ? 'bg-orange-500 text-white'
                        : 'bg-stone-200 dark:bg-gray-700 text-stone-700 dark:text-gray-300 hover:bg-stone-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {t(platform.toLowerCase() as any)}
                  </button>
                )) : <p className="text-xs text-stone-500 dark:text-gray-400">No connected platforms.</p>}
              </div>
            </div>
            <div className="text-right pt-2">
              <button onClick={handlePost} disabled={isPosting || selectedPlatforms.length === 0 || !postContent.trim()} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-5 rounded-lg transition-colors disabled:bg-gray-400">
                {isPosting ? '...' : t('postNowButton')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostToSocialModal;