
// FIX: Implement the ReportView with a parallax scroll, intelligent PDF export, and correct layout.
import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { ReportData, UserInput, SocialConnections, SocialPlatform, TrendTimeRange } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import ResultsTable from './ResultsTable';
import BarChart from './RadarChart';
import SeoAnalysisDisplay from './SeoAnalysisDisplay';
import SwotAnalysisDisplay from './SwotAnalysisDisplay';
import BrandAnalysisDisplay from './BrandAnalysisDisplay';
import StrategicRecommendationsDisplay from './StrategicRecommendationsDisplay';
import ContentStrategyDisplay from './ContentStrategyDisplay';
import GoogleAdsDisplay from './GoogleAdsDisplay';
import SocialMediaDisplay from './SocialMediaDisplay';
import AdvancedAdsDisplay from './AdvancedAdsDisplay';
import CustomerJourneyFunnel from './CustomerJourneyFunnel';
import RoiForecastDisplay from './RoiForecastDisplay';
import StrategyWorkbench from './StrategyWorkbench';
import SourceLinks from './SourceLinks';
import SectionLoader from './SectionLoader';
import CampaignPlanner from './CampaignPlanner';
import MarketingPlanDisplay from './MarketingPlanDisplay';
import TrendsAnalysisDisplay from './TrendsAnalysisDisplay';


interface ReportViewProps {
  reportData: Partial<ReportData>;
  userInput: UserInput;
  onNewAnalysis: () => void;
  onSaveReport: (userInput: UserInput, reportData: ReportData) => void;
  onSaveHtmlReport: (htmlContent: string, userInput: UserInput) => void;
  isLoggedIn: boolean;
  hideActions?: boolean;
  onGenerateSeo: () => void;
  onGenerateTrends: (timeRange?: TrendTimeRange) => void;
  onGenerateKeywords: () => void;
  onGenerateGoogleAds: () => void;
  onGenerateSocialMedia: () => void;
  onGenerateAdvancedAds: () => void;
  onGenerateRoi: () => void;
  onGenerateMarketingPlan: () => void;
  onGenerateBrand: () => void;
  onGenerateStrategy: () => void;
  onGenerateContent: () => void;
  onGenerateJourney: () => void;
  onUpdateGoogleAds: (newBudget: number) => void;
  onUpdateSocialMedia: (newBudget: number) => void;
  onUpdateAdvancedAds: (newBudget: number) => void;
  loadingSections: { 
      seo: boolean; 
      keywords: boolean; 
      googleAds: boolean;
      socialMedia: boolean;
      advancedAds: boolean;
      roi: boolean;
      trends: boolean;
      marketingPlan: boolean;
      brand: boolean;
      strategy: boolean;
      content: boolean;
      journey: boolean;
  };
  isGlobalLoading: boolean; // New prop to control global loading state
  socialConnections: SocialConnections;
  onConnectSocial: (platform: SocialPlatform, connect: boolean) => void;
}

const ReportView: React.FC<ReportViewProps> = ({ 
    reportData, userInput, onNewAnalysis, onSaveReport, onSaveHtmlReport, isLoggedIn, hideActions = false, 
    onGenerateSeo, onGenerateTrends, onGenerateKeywords, onGenerateGoogleAds, onGenerateSocialMedia, onGenerateAdvancedAds, onGenerateRoi,
    onGenerateMarketingPlan, onGenerateBrand, onGenerateStrategy, onGenerateContent, onGenerateJourney,
    onUpdateGoogleAds, onUpdateSocialMedia, onUpdateAdvancedAds, loadingSections, isGlobalLoading, socialConnections, onConnectSocial
}) => {
  const { t } = useTranslations();
  const [reportSaved, setReportSaved] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingHtml, setIsExportingHtml] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  
  const [brandColor, setBrandColor] = useState('#f97316'); // Default orange
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  const [trendTimeRange, setTrendTimeRange] = useState<TrendTimeRange>('12m');

  useEffect(() => {
    window.scrollTo(0, 0); // Ensure view starts at the top
    
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        },
        { rootMargin: '-30% 0px -70% 0px', threshold: 0 }
    );

    const currentRefs = sectionRefs.current;
    Object.keys(currentRefs).forEach(key => {
        const el = currentRefs[key];
        if (el) observer.observe(el);
    });

    return () => {
        const refsToUnobserve = sectionRefs.current;
        Object.keys(refsToUnobserve).forEach(key => {
            const el = refsToUnobserve[key];
            if (el) observer.unobserve(el);
        });
    };
  }, []); // Run only on mount

  const handleSave = () => {
    if (!reportData.seoAnalysis || !reportData.googleAdsStrategy || !reportData.socialMediaCampaign || !reportData.roiForecast) {
      alert("Please generate all report sections before saving.");
      return;
    }
    onSaveReport(userInput, reportData as ReportData);
    setReportSaved(true);
    setTimeout(() => setReportSaved(false), 3000);
  };

  const handleDownloadHtml = () => {
    setIsExportingHtml(true);
    const reportContainer = document.querySelector('.report-content');
    if (!reportContainer) {
      setIsExportingHtml(false);
      return;
    }

    // Clone the container and remove interactive elements for the static file
    const reportClone = reportContainer.cloneNode(true) as HTMLElement;
    reportClone.querySelectorAll('.no-print, button, input, textarea, a[href="#"]').forEach(el => el.remove());

    const reportContent = reportClone.outerHTML;
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="${userInput.language}" class="${currentTheme}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${t('reportTitle')} for ${userInput.keyword}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <script>
            tailwind.config = {
              darkMode: 'class',
            }
          </script>
          <style>
            body { font-family: sans-serif; }
            .report-content { max-width: 1024px; margin: 0 auto; padding: 2rem; }
          </style>
        </head>
        <body class="bg-stone-50 dark:bg-gray-900 text-stone-900 dark:text-gray-100">
          ${reportContent}
        </body>
      </html>
    `;
    
    // Save a copy for admin
    onSaveHtmlReport(fullHtml, userInput);

    // Trigger download for user
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `StrategistAI_Report_${userInput.keyword}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExportingHtml(false);
  };


  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    const reportContainer = document.querySelector('.report-content') as HTMLElement;
    if (!reportContainer) {
        setIsExportingPdf(false);
        return;
    }

    const sections = Array.from(reportContainer.querySelectorAll('[data-pdf-section="true"]')) as HTMLElement[];
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    let yPos = margin;
    let pageCount = 1;

    // Add logo to the first page
    if (brandLogo) {
        try {
            const img = new Image();
            img.src = brandLogo;
            await new Promise(resolve => { img.onload = resolve; });
            const ratio = img.width / img.height;
            const logoHeight = 15;
            const logoWidth = logoHeight * ratio;
            pdf.addImage(brandLogo, 'PNG', pdfWidth - margin - logoWidth, margin, logoWidth, logoHeight);
        } catch (e) { console.error("Error adding logo:", e); }
    }

    // Add main title to the first page
    pdf.setFontSize(22);
    pdf.setTextColor(brandColor);
    pdf.text(t('reportTitle'), margin, yPos + 7, { maxWidth: pdfWidth - margin * 2 - (brandLogo ? 30 : 0) });
    yPos += 15;
    pdf.setFontSize(14);
    pdf.setTextColor('#333');
    pdf.text(t('reportSubtitle', { keyword: userInput.keyword }), margin, yPos, { maxWidth: pdfWidth - margin * 2 });
    yPos += 15;


    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        
        // Hide elements not for PDF
        const elementsToHide = Array.from(section.querySelectorAll('.no-print'));
        elementsToHide.forEach(el => (el as HTMLElement).style.display = 'none');
        
        const canvas = await html2canvas(section, { 
            scale: 2, 
            backgroundColor: null,
            onclone: (doc) => {
                const isDark = document.documentElement.classList.contains('dark');
                if (isDark) {
                     doc.documentElement.classList.remove('dark');
                }
            }
        });
        
        // Restore hidden elements
        elementsToHide.forEach(el => (el as HTMLElement).style.display = '');

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        let finalImgWidth = pdfWidth - margin * 2;
        let finalImgHeight = finalImgWidth / ratio;

        if (yPos + finalImgHeight > pdfHeight - margin) {
            pdf.addPage();
            pageCount++;
            yPos = margin;
            
            // Add header to new page
            pdf.setFontSize(8);
            pdf.setTextColor('#888');
            pdf.text(`${t('reportTitle')} | ${userInput.keyword}`, margin, margin/2);
            pdf.text(`Page ${pageCount}`, pdfWidth - margin, margin/2, { align: 'right' });
        }
        
        pdf.addImage(imgData, 'PNG', margin, yPos, finalImgWidth, finalImgHeight);
        yPos += finalImgHeight + 10; 
    }

    setIsExportingPdf(false);
    pdf.save(`StrategistAI_Report_${userInput.keyword}.pdf`);
  };
  
  const handleBrandingSave = () => {
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBrandLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    setIsBrandingModalOpen(false);
  };
  
  const handleTrendRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newRange = e.target.value as TrendTimeRange;
      setTrendTimeRange(newRange);
      onGenerateTrends(newRange);
  };
  
  const BrandingModal = () => (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={() => setIsBrandingModalOpen(false)}>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm m-4 space-y-4" onClick={e => e.stopPropagation()}>
             <h3 className="text-lg font-bold text-stone-900 dark:text-gray-100">{t('customizeReport')}</h3>
             <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-1">{t('brandLogo')}</label>
                <input id="logo-upload" type="file" accept="image/png, image/jpeg" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"/>
             </div>
             <div>
                <label htmlFor="brand-color-picker" className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-1">{t('brandColor')}</label>
                <input id="brand-color-picker" type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-full h-10 p-1 border border-stone-300 dark:border-gray-600 rounded-lg" />
             </div>
             <div className="text-right">
                <button onClick={handleBrandingSave} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-5 rounded-lg">{t('savePasswordButton')}</button>
             </div>
        </div>
      </div>
  );
  
  const sections = [
    { id: 'overview', label: t('tabOverview') },
    { id: 'trends', label: t('tabTrends') },
    { id: 'seo', label: t('tabSeo') },
    { id: 'swot', label: t('tabSwot') },
    { id: 'brand', label: t('tabBrand') },
    { id: 'strategy', label: t('tabStrategy') },
    { id: 'content', label: t('tabContent') },
    { id: 'google-ads', label: t('googleAdsStrategyTitle') },
    { id: 'social-media', label: t('socialMediaCampaign') },
    { id: 'advanced-ads', label: t('advancedAdsStrategyTitle') },
    { id: 'journey', label: t('tabJourney') },
    { id: 'roi', label: t('roiForecastTitle') },
    { id: 'planner', label: t('campaignPlannerTitle') },
    { id: 'marketing-plan', label: t('marketingPlanTitle') },
    { id: 'workbench', label: t('strategyWorkbenchTitle') }
  ];
  
  const renderSection = (
    title: string,
    id: string,
    content: React.ReactNode,
    isLoading: boolean,
    data: any,
    onGenerate?: () => void,
    pdfSection: boolean = true,
    headerRightContent?: React.ReactNode
  ) => {
    const hasData = data && (Array.isArray(data) ? data.length > 0 : true);
    
    return (
      <div id={id} ref={el => sectionRefs.current[id] = el} className="space-y-4" data-pdf-section={pdfSection}>
        <div className="flex justify-between items-center border-b-2 border-orange-500 pb-2">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-gray-100">{title}</h2>
            {headerRightContent}
        </div>
        {isLoading ? <SectionLoader /> : (hasData ? content : (onGenerate && <GenerateSection onGenerate={onGenerate} />))}
      </div>
    );
  };
  
  const GenerateSection: React.FC<{ onGenerate: () => void, buttonText?: string }> = ({ onGenerate, buttonText }) => (
    <div className="text-center p-8 bg-stone-50 dark:bg-gray-800/60 rounded-lg border border-stone-200 dark:border-gray-700/50">
        <p className="mb-4 text-stone-600 dark:text-gray-400">{t('sectionNotGenerated')}</p>
        <button 
          onClick={onGenerate} 
          disabled={isGlobalLoading}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-5 rounded-lg transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
            {isGlobalLoading ? 'Please wait...' : (buttonText || t('generateAnalysisButton'))}
        </button>
    </div>
  );

  const totalBudget = (reportData.googleAdsStrategy?.overallMonthlyBudget || 0) +
                      (reportData.socialMediaCampaign?.monthlyBudget || 0) +
                      (reportData.advancedAdsStrategy?.overallMonthlyBudget || 0);

  return (
    <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        <div className="md:w-1/4 lg:w-1/5">
            <div className="sticky top-28 space-y-4">
                <div className="space-y-1">
                    {sections.map(section => (
                        <a key={section.id} href={`#${section.id}`} 
                           onClick={(e) => { e.preventDefault(); document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                           className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeSection === section.id ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300' : 'text-stone-600 dark:text-gray-400 hover:bg-stone-100 dark:hover:bg-gray-800'}`}>
                           {section.label}
                        </a>
                    ))}
                </div>
                {!hideActions && (
                    <div className="pt-4 border-t border-stone-200 dark:border-gray-700 space-y-2 no-print">
                        <button onClick={onNewAnalysis} className="w-full text-center bg-stone-200 hover:bg-stone-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-stone-700 dark:text-gray-300 font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                            {t('startNewAnalysisButton')}
                        </button>
                         <button onClick={() => setIsBrandingModalOpen(true)} className="w-full text-center bg-stone-200 hover:bg-stone-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-stone-700 dark:text-gray-300 font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                            {t('customizeReport')}
                        </button>
                        <button onClick={handleDownloadPdf} disabled={isExportingPdf} className="w-full text-center bg-stone-200 hover:bg-stone-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-stone-700 dark:text-gray-300 font-bold py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50">
                           {isExportingPdf ? t('exportingPdf') : t('downloadPdfButton')}
                        </button>
                         <button onClick={handleDownloadHtml} disabled={isExportingHtml} className="w-full text-center bg-stone-200 hover:bg-stone-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-stone-700 dark:text-gray-300 font-bold py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50">
                           {isExportingHtml ? t('exportingHtml') : t('downloadHtmlButton')}
                        </button>
                        {isLoggedIn && (
                            <button onClick={handleSave} disabled={reportSaved} className="w-full text-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm disabled:bg-green-400">
                                {reportSaved ? t('reportSaved') : t('saveReportButton')}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
        <div className="flex-grow min-w-0 report-content">
            <div className="space-y-12">
                {/* Header */}
                <div className="text-center" data-pdf-section="true">
                    <h1 className="text-3xl font-bold text-stone-900 dark:text-gray-100" style={{ color: brandColor }}>{t('reportTitle')}</h1>
                    <p className="text-stone-600 dark:text-gray-400 mt-1">{t('reportSubtitle', { keyword: userInput.keyword })}</p>
                </div>

                {/* Competitor Analysis */}
                {reportData.competitorAnalysis && (
                    renderSection(
                        t('competitorAnalysisTitle'),
                        'overview',
                        <div className="space-y-6">
                            <ResultsTable 
                                data={reportData.competitorAnalysis} 
                                userInput={userInput} 
                                serpAnalysis={reportData.seoAnalysis?.serpAnalysis} 
                            />
                            <BarChart data={reportData.competitorAnalysis} userUrl={userInput.url} brandColor={brandColor}/>
                        </div>,
                        false,
                        reportData.competitorAnalysis
                    )
                )}

                {/* Trends Analysis */}
                {renderSection(
                    t('trendsAnalysisTitle'), 
                    'trends', 
                    <TrendsAnalysisDisplay data={reportData.trendsAnalysis!} />, 
                    loadingSections.trends, 
                    reportData.trendsAnalysis, 
                    () => onGenerateTrends(trendTimeRange), 
                    true,
                    <select 
                        value={trendTimeRange}
                        onChange={handleTrendRangeChange}
                        disabled={isGlobalLoading}
                        className="text-sm border border-stone-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-stone-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500 no-print"
                    >
                        <option value="12m">{t('trendLast12Months')}</option>
                        <option value="5y">{t('trendLast5Years')}</option>
                    </select>
                )}

                {/* SEO */}
                {renderSection(t('seoAuditTitle'), 'seo', <SeoAnalysisDisplay data={reportData.seoAnalysis!} />, loadingSections.seo, reportData.seoAnalysis, onGenerateSeo)}

                {/* SWOT */}
                {renderSection(t('swotAnalysisTitle'), 'swot', <SwotAnalysisDisplay data={reportData.swotAnalysis!} />, false, reportData.swotAnalysis)}
                
                {/* Brand */}
                {renderSection(t('brandAnalysisTitle'), 'brand', <BrandAnalysisDisplay data={reportData.brandAnalysis!} />, loadingSections.brand, reportData.brandAnalysis, onGenerateBrand)}

                {/* Strategy */}
                {renderSection(t('strategicRecommendationsTitle'), 'strategy', <StrategicRecommendationsDisplay data={reportData.strategicRecommendations!} />, loadingSections.strategy, reportData.strategicRecommendations, onGenerateStrategy)}

                {/* Content */}
                {renderSection(t('contentStrategyTitle'), 'content', <ContentStrategyDisplay data={reportData.contentStrategy!} reportData={reportData} userInput={userInput} socialConnections={socialConnections} onConnectSocial={onConnectSocial} />, loadingSections.content, reportData.contentStrategy, onGenerateContent)}

                {/* Google Ads */}
                {renderSection(t('googleAdsStrategyTitle'), 'google-ads', <GoogleAdsDisplay data={reportData.googleAdsStrategy!} userInput={userInput} onGenerateKeywords={onGenerateKeywords} isLoadingKeywords={loadingSections.keywords} onUpdate={onUpdateGoogleAds} isLoading={loadingSections.googleAds} />, loadingSections.googleAds, reportData.googleAdsStrategy, onGenerateGoogleAds)}

                {/* Social Media */}
                {renderSection(t('socialMediaCampaign'), 'social-media', <SocialMediaDisplay data={reportData.socialMediaCampaign!} userInput={userInput} onUpdate={onUpdateSocialMedia} isLoading={loadingSections.socialMedia} />, loadingSections.socialMedia, reportData.socialMediaCampaign, onGenerateSocialMedia)}
                
                {/* Advanced Ads */}
                {renderSection(t('advancedAdsStrategyTitle'), 'advanced-ads', <AdvancedAdsDisplay data={reportData.advancedAdsStrategy!} userInput={userInput} onUpdate={onUpdateAdvancedAds} isLoading={loadingSections.advancedAds} />, loadingSections.advancedAds, reportData.advancedAdsStrategy, onGenerateAdvancedAds)}

                {/* Journey */}
                {renderSection(t('customerJourneyTitle'), 'journey', <CustomerJourneyFunnel reportData={reportData} userInput={userInput} />, loadingSections.journey, reportData.customerJourneyAnalysis, onGenerateJourney)}

                {/* ROI */}
                {renderSection(
                    t('roiForecastTitle'), 
                    'roi', 
                    <RoiForecastDisplay reportData={reportData} userInput={userInput} totalBudget={totalBudget} />, 
                    loadingSections.roi, 
                    reportData.roiForecast, 
                    (reportData.googleAdsStrategy && reportData.socialMediaCampaign && reportData.advancedAdsStrategy) ? onGenerateRoi : undefined
                )}
                
                 {/* Campaign Planner */}
                {reportData.contentStrategy && renderSection(t('campaignPlannerTitle'), 'planner', <CampaignPlanner reportData={reportData} />, false, reportData.contentStrategy, undefined, false)}

                {/* 4 Week Plan */}
                {renderSection(
                    t('marketingPlanTitle'), 
                    'marketing-plan', 
                    <MarketingPlanDisplay plan={reportData.marketingPlan!} />, 
                    loadingSections.marketingPlan, 
                    (reportData.marketingPlan && reportData.marketingPlan.length > 0) ? reportData.marketingPlan : null, 
                    onGenerateMarketingPlan
                )}

                {/* Workbench */}
                <div id="workbench" ref={el => sectionRefs.current['workbench'] = el} className="space-y-4 no-print">
                    <h2 className="text-2xl font-bold text-stone-900 dark:text-gray-100 border-b-2 border-orange-500 pb-2">{t('strategyWorkbenchTitle')}</h2>
                    <StrategyWorkbench reportData={reportData} userInput={userInput} />
                </div>
                
                {/* Sources */}
                {reportData.groundingSources && <SourceLinks sources={reportData.groundingSources} />}

            </div>
        </div>
        {isBrandingModalOpen && <BrandingModal />}
    </div>
  );
};

export default ReportView;
