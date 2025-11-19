import React from 'react';
import type { YouTubeChannelAnalysis } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface YouTubeAnalysisDisplayProps {
  analysis: YouTubeChannelAnalysis[];
}

const formatCount = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return num.toString();
};

const YouTubeAnalysisDisplay: React.FC<YouTubeAnalysisDisplayProps> = ({ analysis }) => {
  const { t } = useTranslations();

  if (!analysis || analysis.length === 0) {
    return null;
  }
  
  const userChannel = analysis.find(c => c.isUserChannel);
  const competitorChannels = analysis.filter(c => !c.isUserChannel);

  const ChannelCard: React.FC<{ channel: YouTubeChannelAnalysis }> = ({ channel }) => (
    <div className="p-4 bg-white dark:bg-gray-900/50 rounded-lg border border-stone-200 dark:border-gray-700 space-y-4">
        <div className="flex justify-between items-start">
            <h4 className="text-lg font-bold text-stone-900 dark:text-gray-100 break-all">
                <a href={channel.channelUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-orange-600 dark:text-orange-400">
                    {channel.channelTitle}
                </a>
            </h4>
            {channel.isUserChannel && <span className="flex-shrink-0 ml-2 text-xs font-semibold text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded-full">{t('you')}</span>}
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-stone-50 dark:bg-gray-800/60 rounded-md">
                <p className="text-xs text-stone-500 dark:text-gray-400 font-medium">{t('ytSubscribers')}</p>
                <p className="font-semibold text-lg">{formatCount(channel.subscriberCount)}</p>
            </div>
            <div className="p-2 bg-stone-50 dark:bg-gray-800/60 rounded-md">
                <p className="text-xs text-stone-500 dark:text-gray-400 font-medium">{t('ytTotalVideos')}</p>
                <p className="font-semibold text-lg">{channel.totalVideos}</p>
            </div>
            <div className="p-2 bg-stone-50 dark:bg-gray-800/60 rounded-md">
                <p className="text-xs text-stone-500 dark:text-gray-400 font-medium">{t('ytTotalViews')}</p>
                <p className="font-semibold text-lg">{formatCount(channel.totalViews)}</p>
            </div>
        </div>
        
        <div>
            <h5 className="font-semibold text-sm mb-2">{t('ytTopVideos')}</h5>
            <div className="space-y-2">
                {channel.topVideos.map(video => (
                    <div key={video.id} className="p-2 bg-stone-100 dark:bg-gray-800 rounded-md">
                        <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-stone-800 dark:text-gray-200 hover:underline">{video.title}</a>
                        <div className="flex items-center gap-4 mt-1 text-xs text-stone-500 dark:text-gray-400">
                           <span><strong>{t('ytViewCount')}:</strong> {formatCount(video.viewCount)}</span>
                           <span><strong>{t('ytLikeCount')}:</strong> {formatCount(video.likeCount)}</span>
                           <span><strong>{t('ytCommentCount')}:</strong> {formatCount(video.commentCount)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );

  return (
    <div className="space-y-6">
        {userChannel && <ChannelCard channel={userChannel} />}
        {competitorChannels.length > 0 && (
            <div className={`grid grid-cols-1 md:grid-cols-${Math.min(competitorChannels.length, 3)} gap-6`}>
                {competitorChannels.map(channel => (
                    <ChannelCard key={channel.channelUrl} channel={channel} />
                ))}
            </div>
        )}
    </div>
  );
};

export default YouTubeAnalysisDisplay;