import React from 'react';
import type { FacebookPageAnalysis } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface FacebookAnalysisDisplayProps {
  analysis: FacebookPageAnalysis[];
}

const formatCount = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return num.toString();
};

const FacebookAnalysisDisplay: React.FC<FacebookAnalysisDisplayProps> = ({ analysis }) => {
  const { t } = useTranslations();

  if (!analysis || analysis.length === 0) {
    return null;
  }
  
  const userPage = analysis.find(p => p.isUserPage);
  const competitorPages = analysis.filter(p => !p.isUserPage);

  const PageCard: React.FC<{ page: FacebookPageAnalysis }> = ({ page }) => (
    <div className="p-4 bg-white dark:bg-gray-900/50 rounded-lg border border-stone-200 dark:border-gray-700 space-y-4">
        <div className="flex justify-between items-start">
            <h4 className="text-lg font-bold text-stone-900 dark:text-gray-100 break-all">
                <a href={page.pageUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-orange-600 dark:text-orange-400">
                    {page.pageName}
                </a>
            </h4>
            {page.isUserPage && <span className="flex-shrink-0 ml-2 text-xs font-semibold text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded-full">{t('you')}</span>}
        </div>

        <div className="p-2 bg-stone-50 dark:bg-gray-800/60 rounded-md text-center">
            <p className="text-xs text-stone-500 dark:text-gray-400 font-medium">{t('fbFanCount')}</p>
            <p className="font-semibold text-xl">{formatCount(page.fanCount)}</p>
        </div>
        
        <div>
            <h5 className="font-semibold text-sm mb-2">{t('fbTopPosts')}</h5>
            <div className="space-y-2">
                {page.topPosts.map(post => (
                    <div key={post.id} className="p-2 bg-stone-100 dark:bg-gray-800 rounded-md">
                        <p className="text-xs text-stone-500 dark:text-gray-500 mb-1">
                            <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {post.type.charAt(0).toUpperCase() + post.type.slice(1)} Post
                            </a>
                        </p>
                        <p className="text-sm font-medium text-stone-800 dark:text-gray-200">{post.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-stone-500 dark:text-gray-400">
                           <span><strong>{t('fbLikes')}:</strong> {formatCount(post.likeCount)}</span>
                           <span><strong>{t('fbComments')}:</strong> {formatCount(post.commentCount)}</span>
                           <span><strong>{t('fbShares')}:</strong> {formatCount(post.shareCount)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );

  return (
    <div className="space-y-6">
        {userPage && <PageCard page={userPage} />}
        {competitorPages.length > 0 && (
            <div className={`grid grid-cols-1 md:grid-cols-${Math.min(competitorPages.length, 3)} gap-6`}>
                {competitorPages.map(page => (
                    <PageCard key={page.pageUrl} page={page} />
                ))}
            </div>
        )}
    </div>
  );
};

export default FacebookAnalysisDisplay;