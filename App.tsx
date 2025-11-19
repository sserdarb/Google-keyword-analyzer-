
// FIX: Implement the main App component to manage state and render views.
import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import Questionnaire from './components/Questionnaire';
import LoadingSpinner from './components/LoadingSpinner';
import ReportView from './components/ReportView';
import ThemeSwitcher from './components/ThemeSwitcher';
import LanguageSwitcher from './components/LanguageSwitcher';
import QueryHistory from './components/QueryHistory';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import UserMenu from './components/UserMenu';
import MyReportsPage from './pages/MyReportsPage';
import CampaignOptimizerPage from './pages/CampaignOptimizerPage';
import ErrorDisplay from './components/ErrorDisplay';
// FIX: Imported `generateClarifyingQuestions` to resolve usage error.
import { generateInitialReport, generateSeoAnalysis, generateKeywordAnalysis, normalizeReportData, generateClarifyingQuestions, generateGoogleAdsStrategy, generateSocialMediaCampaign, generateRoiForecast, generateAdvancedAdsStrategy, generateMarketingPlan, generateTrendsAnalysis, generateBrandAnalysis, generateStrategicRecommendations, generateContentStrategy, generateCustomerJourney } from './services/geminiService';
import * as authService from './services/authService';
import type { UserInput, ReportData, QueryHistoryItem, SavedReport, User, SeoAnalysis, SavedHtmlReport, GoogleAdsStrategy, SocialMediaCampaign, RoiForecast, AdvancedAdsStrategy, SocialConnections, SocialPlatform, ApiSettings, GoogleApiConnections, TrendTimeRange } from './types';
import { useTranslations } from './hooks/useTranslations';

type AppState = 'welcome' | 'questionnaire' | 'loading' | 'report' | 'error' | 'admin_panel' | 'campaign_optimizer' | 'my_reports' | 'auth';
type Theme = 'light' | 'dark';

const getApiSettings = (): ApiSettings => {
    try {
        const settings = localStorage.getItem('api_settings');
        return settings ? JSON.parse(settings) : {};
    } catch (e) {
        console.error("Failed to parse API settings from localStorage", e);
        return {};
    }
};

const isValidUserInput = (input: any): boolean => {
    return input && typeof input === 'object' && typeof input.keyword === 'string' && typeof input.url === 'string';
};

const App: React.FC = () => {
    const { t } = useTranslations();
    const [appState, setAppState] = useState<AppState>('welcome');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userInput, setUserInput] = useState<UserInput | null>(null);
    const [clarifyingQuestions, setClarifyingQuestions] = useState<string[]>([]);
    const [reportData, setReportData] = useState<Partial<ReportData> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [theme, setTheme] = useState<Theme>('light');
    const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
    const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
    const [authRedirect, setAuthRedirect] = useState<AppState | null>(null);
    
    // New state for on-demand generation
    const [analysisSummary, setAnalysisSummary] = useState<string | null>(null);
    const [questionAnswers, setQuestionAnswers] = useState<string>('');
    const [loadingSections, setLoadingSections] = useState({ 
        seo: false, 
        keywords: false,
        googleAds: false,
        socialMedia: false,
        advancedAds: false,
        roi: false,
        trends: false,
        marketingPlan: false,
        brand: false,
        strategy: false,
        content: false,
        journey: false,
    });
    
    // Computed property to check if ANY section is currently loading
    const isAnySectionLoading = Object.values(loadingSections).some(isLoading => isLoading);

    const [socialConnections, setSocialConnections] = useState<SocialConnections>({});
    const [googleApiConnections, setGoogleApiConnections] = useState<GoogleApiConnections>({ youtube: 'disconnected' });


    useEffect(() => {
        // Theme and user session initialization
        const savedTheme = localStorage.getItem('theme') as Theme;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
        
        const user = authService.getCurrentUser();
        if (user) {
            // Re-fetch user from storage to get latest status
            const users = authService.getAllUsers();
            const fullUser = users.find(u => u.id === user.id);
            if (fullUser) setCurrentUser(fullUser);
        }

        try {
            const savedHistory = localStorage.getItem('queryHistory');
            if (savedHistory) {
                const parsed = JSON.parse(savedHistory);
                // Validate history items to ensure they have string properties
                const validHistory = Array.isArray(parsed) ? parsed.filter((item: any) => isValidUserInput(item)) : [];
                setQueryHistory(validHistory);
            }
        } catch (e) {
            console.error("Failed to load query history from localStorage:", e);
        }

        try {
            const savedConnections = localStorage.getItem('socialConnections');
            if (savedConnections) {
                setSocialConnections(JSON.parse(savedConnections));
            }
        } catch (e) {
            console.error("Failed to load social connections from localStorage:", e);
        }

    }, []);

    useEffect(() => {
        // Load user-specific reports when currentUser changes
        if (currentUser) {
            try {
                const reportsStr = localStorage.getItem(`savedReports_${currentUser.id}`);
                if (reportsStr) {
                    const reports = JSON.parse(reportsStr);
                    const validReports = Array.isArray(reports) ? reports.filter((report: any) => isValidUserInput(report.userInput)) : [];
                    setSavedReports(validReports);
                }
            } catch (e) {
                console.error("Failed to load user reports from localStorage:", e);
                setSavedReports([]);
            }
        } else {
            // Clear reports if user logs out
            setSavedReports([]);
        }
    }, [currentUser]);


    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    const addToHistory = (input: UserInput) => {
        const newItem: QueryHistoryItem = { ...input, id: `${input.keyword}-${input.url}-${Date.now()}`, timestamp: Date.now() };
        setQueryHistory(prev => {
            const updatedHistory = [newItem, ...prev.filter(item => item.id !== newItem.id)].slice(0, 20);
            localStorage.setItem('queryHistory', JSON.stringify(updatedHistory));
            return updatedHistory;
        });
    };
    
    const handleDeleteHistoryItem = (id: string) => {
        setQueryHistory(prev => {
            const updatedHistory = prev.filter(item => item.id !== id);
            try {
                localStorage.setItem('queryHistory', JSON.stringify(updatedHistory));
            } catch (e) {
                console.error("Failed to update query history in localStorage:", e);
            }
            return updatedHistory;
        });
    };

    const handleError = (err: any, messagePrefix = '') => {
        // Check for specific API quota error or rate limit
        if (err.message === 'API_QUOTA_EXCEEDED' || err.toString().includes('429') || err.toString().includes('RESOURCE_EXHAUSTED')) {
             setError(t('apiQuotaError'));
        } else {
             const fullMessage = `${messagePrefix}${err.message || 'An unknown error occurred.'}`;
             console.error(fullMessage, err);
             setError(fullMessage);
        }
        setAppState('error');
    };

    const handleWelcomeSubmit = async (data: UserInput) => {
        // Guest user limit
        const guestAnalyses = parseInt(localStorage.getItem('guest_analyses') || '0');
        if (!currentUser && guestAnalyses >= 1) {
            navigateToAuth('welcome');
            return;
        }

        // Pending user check
        if (currentUser && currentUser.status === 'pending') {
            alert(t('accountPendingApproval'));
            return;
        }

        setUserInput(data);
        setError(null);
        setAppState('loading');
        try {
            const questions = await generateClarifyingQuestions(data);
            if (questions?.length > 0) {
                setClarifyingQuestions(questions);
                setAppState('questionnaire');
            } else {
                await handleQuestionnaireSubmit("");
            }
        } catch (err: any) {
            handleError(err);
        }
    };
    
    const handleHistoryClick = (item: UserInput) => { handleWelcomeSubmit(item); };

    const handleQuestionnaireSubmit = async (answers: string) => {
        if (!userInput) return;

        // Increment guest counter if not logged in
        if (!currentUser) {
            const guestAnalyses = parseInt(localStorage.getItem('guest_analyses') || '0');
            localStorage.setItem('guest_analyses', (guestAnalyses + 1).toString());
        }

        addToHistory(userInput);
        setQuestionAnswers(answers);
        setAppState('loading');

        try {
            const { report, analysisSummary } = await generateInitialReport(userInput, answers);

            // Normalize and process the final report
            const finalReport = normalizeReportData({ ...report });

            setAnalysisSummary(analysisSummary);
            setReportData(finalReport);
            setAppState('report');

        } catch (err: any) {
            handleError(err);
        }
    };
    
    const handleGenerateBrand = async () => {
        if (!analysisSummary || !userInput) return;
        setLoadingSections(prev => ({ ...prev, brand: true }));
        try {
            const brandData = await generateBrandAnalysis(analysisSummary, userInput, questionAnswers);
            setReportData(prev => normalizeReportData({ ...prev, brandAnalysis: brandData }));
        } catch (err: any) {
            handleError(err, 'Failed to generate Brand Analysis: ');
        } finally {
            setLoadingSections(prev => ({ ...prev, brand: false }));
        }
    };

    const handleGenerateStrategy = async () => {
        if (!analysisSummary || !userInput) return;
        setLoadingSections(prev => ({ ...prev, strategy: true }));
        try {
            const strategyData = await generateStrategicRecommendations(analysisSummary, userInput, questionAnswers);
            setReportData(prev => normalizeReportData({ ...prev, strategicRecommendations: strategyData }));
        } catch (err: any) {
            handleError(err, 'Failed to generate Strategic Recommendations: ');
        } finally {
            setLoadingSections(prev => ({ ...prev, strategy: false }));
        }
    };

    const handleGenerateContent = async () => {
        if (!analysisSummary || !userInput) return;
        setLoadingSections(prev => ({ ...prev, content: true }));
        try {
            const contentData = await generateContentStrategy(analysisSummary, userInput, questionAnswers);
            setReportData(prev => normalizeReportData({ ...prev, contentStrategy: contentData }));
        } catch (err: any) {
            handleError(err, 'Failed to generate Content Strategy: ');
        } finally {
            setLoadingSections(prev => ({ ...prev, content: false }));
        }
    };

    const handleGenerateJourney = async () => {
        if (!analysisSummary || !userInput) return;
        setLoadingSections(prev => ({ ...prev, journey: true }));
        try {
            const journeyData = await generateCustomerJourney(analysisSummary, userInput, questionAnswers);
            setReportData(prev => normalizeReportData({ ...prev, customerJourneyAnalysis: journeyData }));
        } catch (err: any) {
            handleError(err, 'Failed to generate Customer Journey: ');
        } finally {
            setLoadingSections(prev => ({ ...prev, journey: false }));
        }
    };

    const handleGenerateSeo = async () => {
        if (!analysisSummary || !userInput) return;
        setLoadingSections(prev => ({ ...prev, seo: true }));
        try {
            const seoData = await generateSeoAnalysis(analysisSummary, userInput, questionAnswers);
            setReportData(prev => normalizeReportData({ ...prev, seoAnalysis: seoData }));
        } catch (err: any) {
            handleError(err, 'Failed to generate SEO Analysis: ');
        } finally {
            setLoadingSections(prev => ({ ...prev, seo: false }));
        }
    };

    const handleGenerateTrends = async (timeRange: TrendTimeRange = '12m') => {
        if (!userInput) return;
        setLoadingSections(prev => ({ ...prev, trends: true }));
        try {
            const trendsData = await generateTrendsAnalysis(userInput, timeRange);
            setReportData(prev => normalizeReportData({ ...prev, trendsAnalysis: trendsData }));
        } catch (err: any) {
            handleError(err, 'Failed to generate Trends Analysis: ');
        } finally {
            setLoadingSections(prev => ({ ...prev, trends: false }));
        }
    };

    const handleGenerateMarketingPlan = async () => {
        if (!reportData || !userInput) return;
        setLoadingSections(prev => ({ ...prev, marketingPlan: true }));
        try {
            const planData = await generateMarketingPlan(reportData, userInput);
            setReportData(prev => normalizeReportData({ ...prev, marketingPlan: planData }));
        } catch (err: any) {
            handleError(err, 'Failed to generate Marketing Plan: ');
        } finally {
            setLoadingSections(prev => ({ ...prev, marketingPlan: false }));
        }
    };

    const handleGenerateGoogleAds = async () => {
        if (!analysisSummary || !userInput || !reportData) return;
        setLoadingSections(prev => ({ ...prev, googleAds: true }));
        try {
            const adsData = await generateGoogleAdsStrategy(analysisSummary, reportData, userInput, questionAnswers);
            setReportData(prev => normalizeReportData({ ...prev, googleAdsStrategy: adsData }));
        } catch (err: any) {
            handleError(err, 'Failed to generate Google Ads Strategy: ');
        } finally {
            setLoadingSections(prev => ({ ...prev, googleAds: false }));
        }
    };
    
    const handleGenerateSocialMedia = async () => {
        if (!analysisSummary || !userInput || !reportData) return;
        setLoadingSections(prev => ({ ...prev, socialMedia: true }));
        try {
            const socialData = await generateSocialMediaCampaign(analysisSummary, reportData, userInput, questionAnswers);
            setReportData(prev => normalizeReportData({ ...prev, socialMediaCampaign: socialData }));
        } catch (err: any) {
            handleError(err, 'Failed to generate Social Media Campaign: ');
        } finally {
            setLoadingSections(prev => ({ ...prev, socialMedia: false }));
        }
    };

    const handleGenerateAdvancedAds = async () => {
        if (!analysisSummary || !userInput || !reportData) return;
        setLoadingSections(prev => ({ ...prev, advancedAds: true }));
        try {
            const advancedAdsData = await generateAdvancedAdsStrategy(analysisSummary, reportData, userInput, questionAnswers);
            setReportData(prev => normalizeReportData({ ...prev, advancedAdsStrategy: advancedAdsData }));
        } catch (err: any) {
            handleError(err, 'Failed to generate Advanced Ads Strategy: ');
        } finally {
            setLoadingSections(prev => ({ ...prev, advancedAds: false }));
        }
    };
    
    const handleGenerateRoi = async () => {
        if (!analysisSummary || !userInput || !reportData) return;
        setLoadingSections(prev => ({ ...prev, roi: true }));
        try {
            // Pass the entire report context for a holistic ROI analysis
            const roiData = await generateRoiForecast(reportData);
            setReportData(prev => normalizeReportData({ ...prev, roiForecast: roiData }));
        } catch (err: any) {
            handleError(err, 'Failed to generate ROI Forecast: ');
        } finally {
            setLoadingSections(prev => ({ ...prev, roi: false }));
        }
    };

    const handleGenerateKeywords = async () => {
        if (!analysisSummary || !userInput) return;
        setLoadingSections(prev => ({ ...prev, keywords: true }));
        try {
            const keywordData = await generateKeywordAnalysis(analysisSummary, userInput, questionAnswers);
            setReportData(prev => {
                if (!prev || !prev.googleAdsStrategy) return prev;
                
                const updatedCampaigns = prev.googleAdsStrategy.campaigns.map(campaign => {
                    if (campaign.campaignType === 'Search') {
                        return { ...campaign, ...keywordData };
                    }
                    return campaign;
                });

                return normalizeReportData({
                    ...prev,
                    googleAdsStrategy: {
                        ...prev.googleAdsStrategy,
                        campaigns: updatedCampaigns,
                    },
                });
            });
        } catch (err: any) {
            handleError(err, 'Failed to generate Keyword Analysis: ');
        } finally {
            setLoadingSections(prev => ({ ...prev, keywords: false }));
        }
    };

    const handleUpdateGoogleAdsStrategy = async (newBudget: number) => {
        if (!analysisSummary || !userInput || !reportData) return;
        setLoadingSections(prev => ({ ...prev, googleAds: true }));
        try {
            const adsData = await generateGoogleAdsStrategy(analysisSummary, reportData, userInput, questionAnswers, newBudget);
            setReportData(prev => normalizeReportData({ ...prev, googleAdsStrategy: adsData }));
        } catch (err: any) {
            handleError(err, 'Failed to update Google Ads Strategy: ');
        } finally {
            setLoadingSections(prev => ({ ...prev, googleAds: false }));
        }
    };
    
    const handleUpdateSocialMediaCampaign = async (newBudget: number) => {
        if (!analysisSummary || !userInput || !reportData) return;
        setLoadingSections(prev => ({ ...prev, socialMedia: true }));
        try {
            const socialData = await generateSocialMediaCampaign(analysisSummary, reportData, userInput, questionAnswers, newBudget);
            setReportData(prev => normalizeReportData({ ...prev, socialMediaCampaign: socialData }));
        } catch (err: any) {
            handleError(err, 'Failed to update Social Media Campaign: ');
        } finally {
            setLoadingSections(prev => ({ ...prev, socialMedia: false }));
        }
    };
    
    const handleUpdateAdvancedAdsStrategy = async (newBudget: number) => {
        if (!analysisSummary || !userInput || !reportData) return;
        setLoadingSections(prev => ({ ...prev, advancedAds: true }));
        try {
            const advancedAdsData = await generateAdvancedAdsStrategy(analysisSummary, reportData, userInput, questionAnswers, newBudget);
            setReportData(prev => normalizeReportData({ ...prev, advancedAdsStrategy: advancedAdsData }));
        } catch (err: any) {
            handleError(err, 'Failed to update Advanced Ads Strategy: ');
        } finally {
            setLoadingSections(prev => ({ ...prev, advancedAds: false }));
        }
    };

    const handleNewAnalysis = () => {
        setAppState('welcome');
        setUserInput(null);
        setReportData(null);
        setError(null);
        setClarifyingQuestions([]);
        setAnalysisSummary(null);
        setQuestionAnswers('');
    };

    const navigateToAuth = (from?: AppState) => {
        if (from) {
            setAuthRedirect(from);
        }
        setAppState('auth');
    };

    const handleLogin = async (email: string, pass: string) => {
        const result = await authService.login(email, pass);
        if (typeof result === 'string') {
            switch(result) {
                case 'invalidCredentials': return t('loginError');
                case 'accountPending': return t('loginAccountPending');
                default: return t('loginGenericError');
            }
        } else {
            setCurrentUser(result);
            setAppState(authRedirect || 'welcome');
            setAuthRedirect(null);
            return null; // Success
        }
    };

    const handleSignUp = async (email: string, pass: string, phone: string) => {
        const result = await authService.signUp(email, pass, phone);
        if (typeof result === 'string') {
             return t(result === 'userExists' ? 'signupUserExistsError' : 'loginGenericError');
        } else {
            // Do not log in, show pending message instead
            return null; // Indicates success, AuthPage will handle the message
        }
    };
    
    const handleLogout = () => {
        authService.logout();
        setCurrentUser(null);
        setAppState('welcome');
    };

    const saveReport = (userInputToSave: UserInput, reportDataToSave: ReportData) => {
        if (!currentUser) return; // Should not happen if button is shown
        
        const reportId = `${userInputToSave.keyword}-${userInputToSave.url}-${Date.now()}`;
        const newSavedReport: SavedReport = { id: reportId, userId: currentUser.id, timestamp: Date.now(), userInput: userInputToSave, reportData: reportDataToSave };

        // Save for current user
        const updatedUserReports = [newSavedReport, ...savedReports.filter(r => r.id !== reportId)];
        setSavedReports(updatedUserReports);
        localStorage.setItem(`savedReports_${currentUser.id}`, JSON.stringify(updatedUserReports));

        // Save to global list for admin (simulation of a backend)
        try {
            const allReportsStr = localStorage.getItem('all_user_reports');
            const allReports: SavedReport[] = allReportsStr ? JSON.parse(allReportsStr) : [];
            const updatedAllReports = [newSavedReport, ...allReports];
            localStorage.setItem('all_user_reports', JSON.stringify(updatedAllReports.slice(0, 50))); // Cap at 50
        } catch (e) {
            console.error("Failed to save to global reports:", e);
        }
    };

    const saveHtmlReport = (htmlContent: string, userInput: UserInput) => {
        const reportId = `html-${userInput.keyword}-${Date.now()}`;
        const newHtmlReport: SavedHtmlReport = {
            id: reportId,
            timestamp: Date.now(),
            userInput: userInput,
            htmlContent: htmlContent,
        };
        try {
            const allHtmlReportsStr = localStorage.getItem('saved_html_reports');
            const allHtmlReports: SavedHtmlReport[] = allHtmlReportsStr ? JSON.parse(allHtmlReportsStr) : [];
            const updatedAllHtmlReports = [newHtmlReport, ...allHtmlReports];
            localStorage.setItem('saved_html_reports', JSON.stringify(updatedAllHtmlReports.slice(0, 50))); // Cap at 50
        } catch (e) {
            console.error("Failed to save HTML report to localStorage:", e);
        }
    };
    
    const deleteReport = (reportId: string) => {
        if (!currentUser) return;
        const updatedReports = savedReports.filter(r => r.id !== reportId);
        setSavedReports(updatedReports);
        localStorage.setItem(`savedReports_${currentUser.id}`, JSON.stringify(updatedReports));
    };
    
    const viewReport = (report: SavedReport) => {
        setUserInput(report.userInput);
        setReportData(normalizeReportData(report.reportData));
        setAppState('report');
    };
    
    const handleConnectSocial = (platform: SocialPlatform, connect: boolean) => {
        setSocialConnections(prev => {
            const updated = { ...prev, [platform]: connect };
            localStorage.setItem('socialConnections', JSON.stringify(updated));
            return updated;
        });
    };

    const renderContent = () => {
        switch (appState) {
            case 'welcome': return <WelcomeScreen onSubmit={handleWelcomeSubmit} />;
            case 'questionnaire': return <Questionnaire questions={clarifyingQuestions} onSubmit={handleQuestionnaireSubmit} />;
            case 'loading': return <LoadingSpinner />;
            case 'report': 
                return userInput ? (
                    <ReportView 
                        reportData={reportData || {}} 
                        userInput={userInput} 
                        onNewAnalysis={handleNewAnalysis} 
                        onSaveReport={saveReport}
                        onSaveHtmlReport={saveHtmlReport}
                        isLoggedIn={!!currentUser} 
                        onGenerateSeo={handleGenerateSeo}
                        onGenerateTrends={handleGenerateTrends}
                        onGenerateKeywords={handleGenerateKeywords}
                        onGenerateGoogleAds={handleGenerateGoogleAds}
                        onGenerateSocialMedia={handleGenerateSocialMedia}
                        onGenerateAdvancedAds={handleGenerateAdvancedAds}
                        onGenerateRoi={handleGenerateRoi}
                        onGenerateMarketingPlan={handleGenerateMarketingPlan}
                        onGenerateBrand={handleGenerateBrand}
                        onGenerateStrategy={handleGenerateStrategy}
                        onGenerateContent={handleGenerateContent}
                        onGenerateJourney={handleGenerateJourney}
                        onUpdateGoogleAds={handleUpdateGoogleAdsStrategy}
                        onUpdateSocialMedia={handleUpdateSocialMediaCampaign}
                        onUpdateAdvancedAds={handleUpdateAdvancedAdsStrategy}
                        loadingSections={loadingSections}
                        isGlobalLoading={isAnySectionLoading} // Pass this to disable buttons when any action is running
                        socialConnections={socialConnections}
                        onConnectSocial={handleConnectSocial}
                    />
                ) : <WelcomeScreen onSubmit={handleWelcomeSubmit} />;
            case 'admin_panel': return <AdminPage onLogout={handleLogout} />;
            case 'my_reports': return <MyReportsPage reports={savedReports} onView={viewReport} onDelete={deleteReport} onLoginRequest={() => navigateToAuth('my_reports')}/>;
            case 'campaign_optimizer': return <CampaignOptimizerPage />;
            case 'auth': return <AuthPage onLogin={handleLogin} onSignUp={handleSignUp} onExit={() => { setAppState(authRedirect || 'welcome'); setAuthRedirect(null); }} />;
            case 'error': return <ErrorDisplay error={error} onRetry={handleNewAnalysis} />;
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-gray-900 text-stone-900 dark:text-gray-100 font-sans transition-colors duration-300">
            <header className="p-4 sm:p-6 sticky top-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-b border-stone-200 dark:border-gray-700 z-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <button onClick={handleNewAnalysis} className="flex items-center space-x-2">
                        <svg className="w-8 h-8 text-orange-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.25c.99-1.5 4.5-3 6.75 0 2.25 3-1.5 7.5-6.75 12-5.25-4.5-9-9-6.75-12C7.5-.75 11.01.75 12 2.25z" fill="currentColor"/></svg>
                        <span className="text-xl font-bold text-stone-900 dark:text-gray-100">{t('appTitle')}</span>
                    </button>
                    <div className="flex items-center space-x-3">
                        {currentUser && <button onClick={() => setAppState('my_reports')} className="font-semibold text-sm text-stone-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400">{t('myReports')}</button>}
                        <button onClick={() => setAppState('campaign_optimizer')} className="font-semibold text-sm text-stone-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400">{t('campaignOptimizerTitle')}</button>
                        <QueryHistory history={queryHistory} onHistoryClick={handleHistoryClick} onDelete={handleDeleteHistoryItem} />
                        <LanguageSwitcher />
                        <ThemeSwitcher theme={theme} setTheme={setTheme} />
                        {currentUser ? (
                           <UserMenu user={currentUser} onLogout={handleLogout} onAdminClick={() => setAppState('admin_panel')} />
                        ) : (
                           <button onClick={() => navigateToAuth()} className="font-semibold text-sm bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-full transition-colors">{t('loginButton')}</button>
                        )}
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
                {renderContent()}
            </main>
            <footer className="text-center p-6 text-sm text-stone-500 dark:text-gray-500 border-t border-stone-200 dark:border-gray-700 mt-12">
                <p>&copy; {new Date().getFullYear()} {t('appTitle')}. {t('footerRights')}</p>
            </footer>
        </div>
    );
};

export default App;
