import React from 'react';
import type { InstagramProfileAnalysis } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import VerticalBarChart from './VerticalBarChart';
import LineChart from './LineChart';

interface InstagramAnalysisDisplayProps {
  analysis: InstagramProfileAnalysis[];
}

const formatCount = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return num.toString();
};

const InstagramAnalysisDisplay: React.FC<InstagramAnalysisDisplayProps> = ({ analysis }) => {
  const { t } = useTranslations();

  if (!analysis || analysis.length === 0) {
    return null;
  }
  
  const userProfile = analysis.find(p => p.isUserProfile);
  const competitorProfiles = analysis.filter(p => !p.isUserProfile);

  const ProfileCard: React.FC<{ profile: InstagramProfileAnalysis }> = ({ profile }) => (
    <div className="p-4 bg-white dark:bg-gray-900/50 rounded-lg border border-stone-200 dark:border-gray-700 space-y-4">
        <div className="flex justify-between items-start">
            <h4 className="text-lg font-bold text-stone-900 dark:text-gray-100 break-all">
                <a href={profile.profileUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-orange-600 dark:text-orange-400">
                    @{profile.username}
                </a>
            </h4>
            {profile.isUserProfile && <span className="flex-shrink-0 ml-2 text-xs font-semibold text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded-full">{t('you')}</span>}
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-2 bg-stone-50 dark:bg-gray-800/60 rounded-md">
                <p className="text-xs text-stone-500 dark:text-gray-400 font-medium">{t('igFollowers')}</p>
                <p className="font-semibold text-lg">{formatCount(profile.followerCount)}</p>
            </div>
            <div className="p-2 bg-stone-50 dark:bg-gray-800/60 rounded-md">
                <p className="text-xs text-stone-500 dark:text-gray-400 font-medium">{t('igPosts')}</p>
                <p className="font-semibold text-lg">{formatCount(profile.postCount)}</p>
            </div>
        </div>
        
        {profile.historicalData && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                    <h5 className="font-semibold text-sm text-center mb-2">{t('historicalFollowerGrowth')}</h5>
                    <VerticalBarChart data={profile.historicalData.followerGrowth.map(d => ({ label: d.month, value: d.count }))} />
                </div>
                 <div>
                    <h5 className="font-semibold text-sm text-center mb-2">{t('historicalEngagementRate')}</h5>
                    <LineChart color="#ef4444" data={profile.historicalData.engagementRatePerPost.map(d => ({ date: `Post ${d.post}`, value: d.rate }))} />
                </div>
            </div>
        )}
        
        {profile.topPosts && profile.topPosts.length > 0 && (
            <div>
                <h5 className="font-semibold text-sm mb-2">{t('igTopPosts')}</h5>
                <div className="space-y-2">
                    {profile.topPosts.map(post => (
                        <div key={post.id} className="p-2 bg-stone-100 dark:bg-gray-800 rounded-md">
                            <p className="text-xs text-stone-500 dark:text-gray-500 mb-1">
                                <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {post.type.charAt(0).toUpperCase() + post.type.slice(1)} Post
                                </a>
                            </p>
                            <p className="text-sm font-medium text-stone-800 dark:text-gray-200 line-clamp-2">{post.caption}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-stone-500 dark:text-gray-400">
                               <span><strong>{t('fbLikes')}:</strong> {formatCount(post.likeCount)}</span>
                               <span><strong>{t('fbComments')}:</strong> {formatCount(post.commentCount)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );

  return (
    <div className="space-y-6">
        {userProfile && <ProfileCard profile={userProfile} />}
        {competitorProfiles.length > 0 && (
            <div className={`grid grid-cols-1 md:grid-cols-${Math.min(competitorProfiles.length, 3)} gap-6`}>
                {competitorProfiles.map(profile => (
                    <ProfileCard key={profile.profileUrl} profile={profile} />
                ))}
            </div>
        )}
    </div>
  );
};

export default InstagramAnalysisDisplay;