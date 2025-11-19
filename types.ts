
// types.ts

export type Locale = 'tr' | 'en' | 'sv' | 'de' | 'ru';

export type KeywordLanguage = 'tr' | 'en' | 'sv' | 'de' | 'ru';

export type Currency = 'TRY' | 'USD' | 'EUR';

export type TrendTimeRange = '12m' | '5y';

export interface User {
  id: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved';
}

export interface UserInput {
  keyword: string;
  url: string;
  language: KeywordLanguage;
  currency: Currency;
  competitorUrls: string[];
  targetMarkets: string[]; // New field for countries/cities
  location?: { latitude: number; longitude: number };
}

export interface QueryHistoryItem extends UserInput {
  id: string;
  timestamp: number;
}

export interface CompetitorData {
  url: string;
  overallScore: number;
  seoScore: number;
  contentScore: number;
  uxScore: number;
  brandAuthority: number;
  advertisingBehavior?: {
    estimatedMonthlyBudget: number;
    estimatedAdTraffic: string;
    topAdKeywords: string[];
    sampleAdCopy: AdCopy[];
  };
}

export interface KeywordData {
  keyword: string;
  monthlyVolume: string;
  cpc: string;
  difficulty: string;
}

export interface KeywordAdGroup {
  groupName: string;
  keywords: KeywordData[];
  negativeKeywords: string[];
  adCopies: AdCopy[];
}

export interface SeoCheck {
  check: string;
  status: 'Pass' | 'Fail' | 'Warning';
  recommendation: string;
  priority?: 'High' | 'Medium' | 'Low';
  explanation?: string;
  actionPlan?: string[];
}

export interface ContentAnalysis {
    keywordDensity: string;
    readabilityScore: string;
    wordCount: number;
    recommendations: string[];
}

export interface SerpCompetitor {
    url: string;
    estimatedPosition: number;
    strengths: string[];
}

export interface SerpAnalysis {
    estimatedPosition: number;
    topCompetitors: SerpCompetitor[];
}

export interface SeoAnalysis {
  onPage: SeoCheck[];
  technicalSeo: SeoCheck[];
  offPage: SeoCheck[];
  contentAnalysis: ContentAnalysis;
  serpAnalysis: SerpAnalysis;
}

export interface TrendDataPoint {
  date: string; // e.g., "Jan 2023"
  value: number; // 0-100
}

export interface TrendSeries {
    name: string;
    data: TrendDataPoint[];
}

export interface TrendsAnalysis {
  keywordInterest: TrendSeries;
  brandInterest?: TrendSeries[];
  relatedTopics: string[];
}

export interface SwotOpportunity {
    opportunity: string;
    contentIdeas: { title: string; brief: string }[];
}
  
export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: SwotOpportunity[];
  threats: string[];
}

export interface DemographicDistribution {
  label: string;
  value: number; // percentage
}

export interface TargetAudiencePersona {
  name: string;
  demographics: {
    age?: string;
    gender?: string;
    location?: string;
    occupation?: string;
    income?: string;
  };
  ageDistribution?: DemographicDistribution[];
  genderDistribution?: DemographicDistribution[];
  motivations: string;
  painPoints: string;
}

export interface BrandAnalysis {
  brandIdentity: string;
  brandVoice: string;
  targetAudiencePersona: TargetAudiencePersona;
}

export interface Recommendation {
    title: string;
    description: string;
}

export interface StrategicRecommendations {
  brandStrategy: (string | Recommendation)[];
  salesStrategy: (string | Recommendation)[];
}

export interface ContentPillar {
  pillar: string;
  description: string;
  postIdeas: { id: string; title: string; brief: string }[];
}

export interface ContentFormat {
  format: string;
  description: string;
}

export interface ContentCalendarItem {
    week: number;
    day: string;
    platform: string;
    contentFormat: string;
    topic: string;
}

export interface ContentStrategy {
  pillars: ContentPillar[];
  contentFormats: ContentFormat[];
  suggestedTopics: string[];
  contentCalendar?: ContentCalendarItem[];
}

export interface AdCopy {
  headline: string;
  description: string;
}

export interface PerformanceTrendItem {
    month: string;
    value?: number; // for google ads
    engagements?: number; // for social media
    reach?: number; // for social media
}

export interface GoogleAdsAssetGroup {
    groupName: string;
    headlines: string[];
    descriptions: string[];
    visualConcept: string;
}

export interface ABTestSuggestion {
  variable: string;
  versionA: string;
  versionB: string;
  reasoning: string;
}

export interface GoogleAdsCampaignDetails {
    campaignType: 'Search' | 'Performance Max' | 'Display' | 'Video';
    monthlyBudget: number;
    targetRegion: string;
    goals: string[];
    searchIntent?: string;
    monthlyVolume?: string;
    averageCpc?: string;
    // New bidding strategy fields
    bidStrategy?: string;
    targetCpcRange?: { low: string; high: string };
    bidRationale?: string;
    
    adGroups?: KeywordAdGroup[];
    assetGroups?: GoogleAdsAssetGroup[];
    detailedTargeting?: {
        demographics: string;
        interests: string;
        behaviors: string;
    };
    visualConcept?: string;
    performanceTrend?: PerformanceTrendItem[];
    abTestSuggestions?: ABTestSuggestion[];
}

export interface GoogleAdsStrategy {
    overallMonthlyBudget: number;
    campaigns: GoogleAdsCampaignDetails[];
}

export interface SocialMediaPlatform {
    platform: string;
    contentIdeas: { title: string; brief: string }[];
    adCopy: AdCopy[];
    visualConcept: string;
    targeting: string;
}

export interface SocialMediaCampaign {
    monthlyBudget: number;
    estimatedReachPerMonth: number;
    estimatedEngagementsPerMonth: number;
    targetAudience: string;
    platforms: SocialMediaPlatform[];
    performanceTrend: PerformanceTrendItem[];
}

export type AdvancedCampaignType = 'Display/Remarketing' | 'YouTube Ads' | 'Mobile App Ads' | 'Meta Advantage+' | 'Telegram Ads' | 'Yandex Ads' | 'Bing Ads' | 'TikTok Ads';

export interface AdvancedCampaignDetails {
    campaignType: AdvancedCampaignType;
    isRelevant: boolean;
    relevanceReasoning: string;
    monthlyBudget: number;
    estimatedCpc?: number; // Added for calculation
    estimatedCpm?: number; // Added for calculation
    targeting: string;
    suggestedAdFormats: string;
    performanceTrend: PerformanceTrendItem[];
    targetChannels?: string[];
    targetVideos?: string[];
    creativeAdFormats?: string[];
    trendingAudioSuggestions?: string[];
    influencerCollaborationIdeas?: string[];
    abTestSuggestions?: ABTestSuggestion[];
    adCopy?: AdCopy[];
    visualConcept?: string;
}

export interface AdvancedAdsStrategy {
    overallMonthlyBudget: number;
    campaigns: AdvancedCampaignDetails[];
}

export interface JourneyStage {
    stage: 'Awareness' | 'Consideration' | 'Conversion';
    description: string;
    tactics: string[];
}

export interface CustomerJourneyAnalysis {
    funnel: JourneyStage[];
}

export interface RoiOptimization {
    area: string;
    impact: string;
}

export interface RoiForecast {
    estimatedRoas: number;
    notes: string;
    optimizations: RoiOptimization[];
}

export interface GroundingChunk {
    web?: {
      uri: string;
      title: string;
    };
    maps?: any; 
}

export interface MarketingPlanTask {
  week: number;
  day: string;
  channel: string;
  task: string;
  details: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface YouTubeVideo {
  id: string;
  url: string;
  title: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

export interface YouTubeChannelAnalysis {
  isUserChannel: boolean;
  channelUrl: string;
  channelTitle: string;
  subscriberCount: number;
  totalVideos: number;
  totalViews: number;
  topVideos: YouTubeVideo[];
}

export interface FacebookPost {
  id: string;
  url: string;
  type: string;
  content: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
}

export interface FacebookPageAnalysis {
  isUserPage: boolean;
  pageUrl: string;
  pageName: string;
  fanCount: number;
  topPosts: FacebookPost[];
}

export interface InstagramPost {
  id: string;
  url: string;
  type: string;
  caption: string;
  likeCount: number;
  commentCount: number;
}

export interface HistoricalData {
    followerGrowth: { month: string; count: number }[];
    engagementRatePerPost: { post: number; rate: number }[];
}

export interface InstagramProfileAnalysis {
  isUserProfile: boolean;
  profileUrl: string;
  username: string;
  followerCount: number;
  postCount: number;
  historicalData?: HistoricalData;
  topPosts: InstagramPost[];
}

export interface LinkedInPost {
  id: string;
  url: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

export interface LinkedInPageAnalysis {
  isUserPage: boolean;
  pageUrl: string;
  pageName: string;
  followerCount: number;
  historicalData?: HistoricalData;
  topPosts: LinkedInPost[];
}

export interface ReportData {
  analysisSummary?: string;
  competitorAnalysis?: CompetitorData[];
  seoAnalysis?: SeoAnalysis;
  swotAnalysis?: SwotAnalysis;
  brandAnalysis?: BrandAnalysis;
  strategicRecommendations?: StrategicRecommendations;
  contentStrategy?: ContentStrategy;
  googleAdsStrategy?: GoogleAdsStrategy;
  socialMediaCampaign?: SocialMediaCampaign;
  advancedAdsStrategy?: AdvancedAdsStrategy;
  customerJourneyAnalysis?: CustomerJourneyAnalysis;
  roiForecast?: RoiForecast;
  marketingPlan?: MarketingPlanTask[];
  trendsAnalysis?: TrendsAnalysis;
  groundingSources?: GroundingChunk[];
  youtubeAnalysis?: YouTubeChannelAnalysis[];
  facebookAnalysis?: FacebookPageAnalysis[];
  instagramAnalysis?: InstagramProfileAnalysis[];
  linkedinAnalysis?: LinkedInPageAnalysis[];
}

export interface SavedReport {
  id: string;
  userId: string;
  timestamp: number;
  userInput: UserInput;
  reportData: ReportData;
}

export interface SavedHtmlReport {
  id: string;
  timestamp: number;
  userInput: UserInput;
  htmlContent: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export type CampaignPerformanceData = { [key: string]: string };

export interface OptimizationTip {
    title: string;
    observation: string;
    recommendation: string;
    priority: 'High' | 'Medium' | 'Low';
}

export type SocialPlatform = 'Facebook' | 'Instagram' | 'Twitter';

export interface SocialConnections {
  Facebook?: boolean;
  Instagram?: boolean;
  Twitter?: boolean;
}

export interface ApiSettings {
  youtubeApiKey?: string;
  facebookApiKey?: string;
  instagramApiKey?: string;
  linkedinApiKey?: string;
}

export interface GoogleApiConnections {
  youtube: 'connected' | 'disconnected' | 'connecting';
}
