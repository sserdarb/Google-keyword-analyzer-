
import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { UserInput, ReportData, CampaignPerformanceData, Message, KeywordData, BrandAnalysis, CompetitorData, SwotOpportunity, Recommendation, ContentPillar, JourneyStage, SeoCheck, GoogleAdsStrategy, GroundingChunk, SeoAnalysis, GoogleAdsCampaignDetails, SocialMediaCampaign, RoiForecast, AdvancedAdsStrategy, AdvancedCampaignDetails, MarketingPlanTask, TrendsAnalysis, StrategicRecommendations, ContentStrategy, CustomerJourneyAnalysis, TrendTimeRange, ContentCalendarItem } from '../types';
import { 
    clarifyingQuestionsSchema, 
    structuringAndBrandSchema,
    marketingPlanSchema, 
    optimizationTipsSchema,
    moreKeywordsSchema,
    seoAnalysisSchema,
    keywordAnalysisSchema,
    googleAdsStrategyReportSchema,
    socialMediaCampaignReportSchema,
    advancedAdsStrategyReportSchema,
    roiForecastReportSchema,
    contentStrategyReportSchema,
    brandAnalysisReportSchema,
    strategicRecommendationsReportSchema,
    customerJourneyReportSchema,
    trendsAnalysisSchema,
    contentCalendarSchema,
} from './schemas';

// As per guidelines, the API key must come from process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = 'gemini-2.5-pro';
const modelFlash = 'gemini-2.5-flash';
const modelLite = 'gemini-flash-lite-latest';

// Helper function to parse JSON response from Gemini
const parseJsonResponse = <T>(responseText: string | undefined): T | null => {
    if (!responseText) return null;
    try {
        // Improved regex to be more flexible with whitespace and optional 'json' identifier
        const match = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        let textToParse = match ? match[1] : responseText;
        if (!match) {
            const jsonStartIndex = textToParse.indexOf('{');
            const jsonEndIndex = textToParse.lastIndexOf('}');
            if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
                textToParse = textToParse.substring(jsonStartIndex, jsonEndIndex + 1);
            }
        }
        return JSON.parse(textToParse) as T;
    } catch (e) {
         try {
            return JSON.parse(responseText) as T;
        } catch (e2) {
            console.error("Failed to parse JSON response:", e2, "\nRaw response:", responseText);
            throw new Error(`Failed to parse JSON response:\n${e2}\n\nRaw response:\n ${responseText.substring(0, 100)}...`);
        }
    }
};

const generateContentWithRetry = async (params: any, retries = 3, delay = 5000): Promise<any> => {
    let lastError: any = new Error("Unknown error in generateContentWithRetry");
    const primaryModel = params.model;
    let currentDelay = delay;

    // Stage 1: Try Primary Model
    for (let i = 0; i < retries; i++) {
        try {
            return await ai.models.generateContent(params);
        } catch (e: any) {
            lastError = e;
            const errorString = e.toString();
            const isRetryable = errorString.includes('503') || errorString.includes('overloaded') || errorString.includes('500') || errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED') || errorString.includes('fetch');
            
            if (isRetryable) {
                if (i < retries - 1) {
                    console.warn(`A retryable API error occurred with ${primaryModel} (Code ${errorString.includes('429') ? '429' : '5xx'}). Retrying in ${currentDelay / 1000}s... (Attempt ${i + 1}/${retries})`);
                    await new Promise(resolve => setTimeout(resolve, currentDelay));
                    currentDelay *= 1.5; // Exponential backoff
                }
            } else {
                console.error(`Non-retryable API call failed for model ${primaryModel}:`, e);
                throw e;
            }
        }
    }

    // Stage 2: Fallback Logic (Pro -> Flash, Flash -> Flash Lite)
    let fallbackModel = '';
    if (primaryModel === model) {
        fallbackModel = modelFlash;
    } else if (primaryModel === modelFlash) {
        fallbackModel = modelLite;
    }

    if (fallbackModel) {
        console.warn(`All retries with ${primaryModel} failed. Switching to fallback model: ${fallbackModel}`);
        const fallbackParams = { ...params, model: fallbackModel };
        currentDelay = 5000; // Reset delay for fallback

        for (let i = 0; i < retries; i++) {
            try {
                return await ai.models.generateContent(fallbackParams);
            } catch (e: any) {
                lastError = e;
                const errorString = e.toString();
                const isRetryable = errorString.includes('503') || errorString.includes('overloaded') || errorString.includes('500') || errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED') || errorString.includes('fetch');
                
                if (isRetryable) {
                    if (i < retries - 1) {
                        console.warn(`A retryable API error occurred with fallback ${fallbackModel}. Retrying in ${currentDelay / 1000}s... (Attempt ${i + 1}/${retries})`);
                        await new Promise(resolve => setTimeout(resolve, currentDelay));
                        currentDelay *= 1.5;
                    }
                } else {
                     console.error(`Non-retryable API call failed for fallback model ${fallbackModel}:`, e);
                     throw e;
                }
            }
        }
        
        // Stage 3: Last Resort (Flash -> Flash Lite if we started with Pro and failed Flash)
        if (fallbackModel === modelFlash) {
             const finalFallbackModel = modelLite;
             console.warn(`Flash fallback failed. Switching to LAST RESORT: ${finalFallbackModel}`);
             const finalFallbackParams = { ...params, model: finalFallbackModel };
             currentDelay = 5000;
             
             for (let i = 0; i < retries; i++) {
                 try {
                     return await ai.models.generateContent(finalFallbackParams);
                 } catch (e: any) {
                     lastError = e;
                     if (i < retries - 1) await new Promise(resolve => setTimeout(resolve, currentDelay));
                 }
             }
        }
    }
    
    console.error(`All attempts failed.`);
    const finalErrorString = lastError.toString();
    if (finalErrorString.includes('429') || finalErrorString.includes('RESOURCE_EXHAUSTED')) {
        throw new Error("API_QUOTA_EXCEEDED");
    }
    throw lastError;
};

export const normalizeReportData = (report: Partial<ReportData>): Partial<ReportData> => {
    const normalized = report || {};

    const ensureArray = <T>(value: T | T[] | undefined | null): T[] => {
        if (Array.isArray(value)) return value;
        if (value) return [value];
        return [];
    };

    const forceStringArray = (arr: any[] | undefined | null): string[] => {
        if (!Array.isArray(arr)) return [];
        return arr.map(item => {
            if (typeof item === 'string') return item;
            if (item && typeof item === 'object') {
                if (item.description && item.category) return `${item.category}: ${item.description}`;
                if (item.point && item.explanation) return `${item.point}: ${item.explanation}`;
                if (item.title && item.description) return `${item.title}: ${item.description}`;
                return JSON.stringify(item);
            }
            return String(item);
        }).filter(Boolean);
    };
    
    const safeString = (val: any): string => {
        if (typeof val === 'string') return val;
        if (Array.isArray(val)) return val.join(', ');
        if (val && typeof val === 'object') return JSON.stringify(val);
        return String(val || '');
    };
    
    const normalizeSeoCheck = (checks: any[] | undefined | null) => {
        return ensureArray(checks).map(item => ({
            ...item,
            actionPlan: forceStringArray(item.actionPlan)
        }));
    };

    return {
        ...normalized,
        marketingPlan: ensureArray(normalized.marketingPlan),
        competitorAnalysis: ensureArray(normalized.competitorAnalysis).map(c => ({
            ...c,
            advertisingBehavior: c.advertisingBehavior ? {
                ...c.advertisingBehavior,
                topAdKeywords: ensureArray(c.advertisingBehavior.topAdKeywords),
                sampleAdCopy: ensureArray(c.advertisingBehavior.sampleAdCopy)
            } : undefined,
        })),
        seoAnalysis: normalized.seoAnalysis ? {
            ...normalized.seoAnalysis,
            onPage: normalizeSeoCheck(normalized.seoAnalysis.onPage),
            technicalSeo: normalizeSeoCheck(normalized.seoAnalysis.technicalSeo),
            offPage: normalizeSeoCheck(normalized.seoAnalysis.offPage),
            contentAnalysis: normalized.seoAnalysis.contentAnalysis ? {
                ...normalized.seoAnalysis.contentAnalysis,
                recommendations: forceStringArray(normalized.seoAnalysis.contentAnalysis.recommendations),
            } : { recommendations: [] } as any,
            serpAnalysis: normalized.seoAnalysis.serpAnalysis ? {
                ...normalized.seoAnalysis.serpAnalysis,
                topCompetitors: ensureArray(normalized.seoAnalysis.serpAnalysis.topCompetitors).map(c => ({
                    ...c,
                    strengths: forceStringArray(c.strengths)
                })),
            } : { topCompetitors: [] } as any,
        } : undefined,
        swotAnalysis: normalized.swotAnalysis ? {
            ...normalized.swotAnalysis,
            strengths: forceStringArray(normalized.swotAnalysis.strengths),
            weaknesses: forceStringArray(normalized.swotAnalysis.weaknesses),
            opportunities: ensureArray(normalized.swotAnalysis.opportunities).map(op => ({
                ...op,
                contentIdeas: ensureArray((op as any).contentIdeas)
            })),
            threats: forceStringArray(normalized.swotAnalysis.threats),
        } : undefined,
        brandAnalysis: normalized.brandAnalysis ? {
            ...normalized.brandAnalysis,
            targetAudiencePersona: normalized.brandAnalysis.targetAudiencePersona ? {
                ...normalized.brandAnalysis.targetAudiencePersona,
                ageDistribution: ensureArray(normalized.brandAnalysis.targetAudiencePersona.ageDistribution),
                genderDistribution: ensureArray(normalized.brandAnalysis.targetAudiencePersona.genderDistribution),
            } : undefined,
        } : undefined,
        strategicRecommendations: normalized.strategicRecommendations ? {
            ...normalized.strategicRecommendations,
            brandStrategy: ensureArray(normalized.strategicRecommendations.brandStrategy),
            salesStrategy: ensureArray(normalized.strategicRecommendations.salesStrategy),
        } : undefined,
        contentStrategy: normalized.contentStrategy ? {
            ...normalized.contentStrategy,
            pillars: ensureArray(normalized.contentStrategy.pillars).map((pillar, pIndex) => ({
                ...pillar,
                postIdeas: ensureArray(pillar.postIdeas).map((idea, iIndex) => ({
                    ...idea,
                    id: `post-${pIndex}-${iIndex}-${Math.random().toString(36).substring(7)}`
                }))
            })),
            contentFormats: ensureArray(normalized.contentStrategy.contentFormats),
            suggestedTopics: forceStringArray(normalized.contentStrategy.suggestedTopics),
            contentCalendar: ensureArray(normalized.contentStrategy.contentCalendar),
        } : undefined,
        googleAdsStrategy: normalized.googleAdsStrategy ? {
            ...normalized.googleAdsStrategy,
            campaigns: ensureArray(normalized.googleAdsStrategy.campaigns).map(campaign => ({
                ...campaign,
                goals: forceStringArray(campaign.goals),
                // Ensure bid strategy fields are strings/objects as expected
                bidStrategy: safeString(campaign.bidStrategy),
                targetCpcRange: campaign.targetCpcRange ? {
                    low: safeString(campaign.targetCpcRange.low),
                    high: safeString(campaign.targetCpcRange.high)
                } : undefined,
                bidRationale: safeString(campaign.bidRationale),
                adGroups: ensureArray(campaign.adGroups).map(group => ({
                    ...group,
                    keywords: ensureArray(group.keywords),
                    negativeKeywords: forceStringArray(group.negativeKeywords),
                    adCopies: ensureArray((group as any).adCopies),
                })),
                assetGroups: ensureArray(campaign.assetGroups).map(group => ({
                    ...group,
                    headlines: forceStringArray(group.headlines),
                    descriptions: forceStringArray(group.descriptions)
                })),
                performanceTrend: ensureArray(campaign.performanceTrend),
                abTestSuggestions: ensureArray(campaign.abTestSuggestions),
            }))
        } : undefined,
        socialMediaCampaign: normalized.socialMediaCampaign ? {
            ...normalized.socialMediaCampaign,
            platforms: ensureArray(normalized.socialMediaCampaign.platforms).map(platform => ({
                ...platform,
                contentIdeas: ensureArray(platform.contentIdeas),
                adCopy: ensureArray(platform.adCopy),
                targeting: safeString(platform.targeting),
            })),
            performanceTrend: ensureArray(normalized.socialMediaCampaign.performanceTrend),
        } : undefined,
         advancedAdsStrategy: normalized.advancedAdsStrategy ? {
            ...normalized.advancedAdsStrategy,
            campaigns: ensureArray(normalized.advancedAdsStrategy.campaigns).map(campaign => ({
                ...campaign,
                // Force string types for fields that might be hallucinatory arrays/objects
                targeting: safeString(campaign.targeting),
                suggestedAdFormats: safeString(campaign.suggestedAdFormats),
                relevanceReasoning: safeString(campaign.relevanceReasoning),
                visualConcept: safeString(campaign.visualConcept),
                
                performanceTrend: ensureArray(campaign.performanceTrend),
                targetChannels: forceStringArray(campaign.targetChannels),
                targetVideos: forceStringArray(campaign.targetVideos),
                creativeAdFormats: forceStringArray(campaign.creativeAdFormats),
                trendingAudioSuggestions: forceStringArray(campaign.trendingAudioSuggestions),
                influencerCollaborationIdeas: forceStringArray(campaign.influencerCollaborationIdeas),
                abTestSuggestions: ensureArray(campaign.abTestSuggestions),
                adCopy: ensureArray(campaign.adCopy),
            }))
        } : undefined,
        customerJourneyAnalysis: normalized.customerJourneyAnalysis ? {
            ...normalized.customerJourneyAnalysis,
            funnel: ensureArray(normalized.customerJourneyAnalysis.funnel).map(stage => ({
                ...stage,
                tactics: forceStringArray(stage.tactics)
            })),
        } : undefined,
        roiForecast: normalized.roiForecast ? {
            ...normalized.roiForecast,
            optimizations: ensureArray(normalized.roiForecast.optimizations),
        } : undefined,
        groundingSources: ensureArray(normalized.groundingSources),
    };
};

export const generateClarifyingQuestions = async (userInput: UserInput): Promise<string[]> => {
    const prompt = `Based on the user's goal to analyze the keyword "${userInput.keyword}" for their website "${userInput.url}" against competitors (${userInput.competitorUrls.join(', ')}), generate 3-5 short, clarifying questions to better understand their specific goals, target audience, and unique selling propositions. The language for the questions should be ${userInput.language}.`;

    const response = await generateContentWithRetry({
        model: modelFlash,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: clarifyingQuestionsSchema,
        },
    });

    const result = parseJsonResponse<{ questions: string[] }>(response.text);
    return result?.questions || [];
};

export const generateInitialReport = async (
    userInput: UserInput,
    answers: string,
): Promise<{ report: ReportData, analysisSummary: string }> => {
    const { keyword, url, language, currency, competitorUrls, location, targetMarkets } = userInput;

    const locationPromptText = location ? `The user's physical location is latitude ${location.latitude}, longitude ${location.longitude}.` : '';
    const targetMarketText = targetMarkets && targetMarkets.length > 0 
        ? `CRITICAL: The analysis MUST be strictly focused on the following Target Markets: ${targetMarkets.join(', ')}. All search volumes, competition levels, and trend data must be specific to these regions.` 
        : 'The target market is global/general.';

    const baseContext = `
        You are an expert digital marketing strategist.
        The user is analyzing the keyword "${keyword}" for their website "${url}".
        The target language is "${language}" and currency is "${currency}".
        ${locationPromptText}
        ${targetMarketText}
        User's answers to clarifying questions: "${answers}".
    `;

    const competitorList = competitorUrls.length > 0 ? `their specified competitors: ${competitorUrls.join(', ')}` : "no other competitors were specified.";
    const toolAnalysisPrompt = `${baseContext}
        Act as a market research assistant. Your primary goal is to gather raw, REAL-TIME information using the Google Search tool provided.
        1.  **Competitor Research:** Analyze ONLY the following websites: the user's site "${url}" and ${competitorList}. Use Google Search to find *current* information about their offerings, pricing strategies, and recent ad campaigns or promotions within the specified target markets.
        2.  **SWOT Research:** Perform Google searches for reviews, news articles, and forum discussions about "${url}" to conduct a grounded SWOT analysis.
        3.  **Keyword Research:** Perform Google searches to find related long-tail, LSI, and question-based keywords for "${keyword}" that are trending *now* in the ${targetMarkets.join(', ') || 'target'} market.
        
        CRITICAL: Compile all findings into a single, comprehensive text summary in "${language}". Do not use JSON. Include specific data points found.
    `;
    
    // Robust fallback mechanism for Tool-Based Analysis
    let analysisSummary = "";
    let allGroundingSources: GroundingChunk[] = [];

    try {
        const informationGatheringResult = await generateContentWithRetry({
            model: modelFlash,
            contents: toolAnalysisPrompt,
            config: { tools: [{ googleSearch: {} }] }
        });
        analysisSummary = informationGatheringResult.text;
        allGroundingSources = informationGatheringResult.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    } catch (e: any) {
        console.warn("Tool-based analysis failed, falling back to basic analysis.", e);
        // If quota exceeded, re-throw to stop the process
        if (e.message === 'API_QUOTA_EXCEEDED') throw e;
        
        // Fallback to a non-tool generation (simulated analysis)
        const fallbackPrompt = `${baseContext}
        Act as a market research assistant. Provide a comprehensive analysis based on your internal knowledge about the keyword "${keyword}" and the general market for "${url}" in ${targetMarkets.join(', ') || 'the user\'s region'}.
        Include a simulated analysis of competitors (${competitorList}) based on general industry standards.
        Compile all findings into a single, comprehensive text summary in "${language}".`;
        
        const fallbackResponse = await generateContentWithRetry({
            model: modelFlash,
            contents: fallbackPrompt
        });
        analysisSummary = fallbackResponse.text;
    }
    
    const enrichedContext = `${baseContext}\n--- Foundational Analysis Summary ---\n${analysisSummary}\n--- End of Summary ---`;

    const structuringAndBrandPrompt = `${enrichedContext}\nBased on the summary, generate a JSON object with keys: "competitorAnalysis", "swotAnalysis". All text must be in "${language}". For "competitorAnalysis", you MUST include the user's primary website "${url}" as the very first item in the array and scores must be between 0 and 100. For "swotAnalysis", you MUST provide at least 3 items for EACH of the four categories: strengths, weaknesses, opportunities, and threats.`;

    const response = await generateContentWithRetry({
        model: model,
        contents: structuringAndBrandPrompt,
        config: { responseMimeType: 'application/json', responseSchema: structuringAndBrandSchema }
    });
    
    let report = parseJsonResponse<ReportData>(response.text);
    if (!report) throw new Error("Failed to generate the core report structure.");

    const uniqueSources = Array.from(new Map(allGroundingSources.map((item: GroundingChunk) => [item.web?.uri || item.maps?.uri, item])).values()).filter((item: GroundingChunk) => item.web?.uri || item.maps?.uri);
    report.groundingSources = uniqueSources;

    return { report, analysisSummary };
};

export const generateSeoAnalysis = async (analysisSummary: string, userInput: UserInput, answers: string): Promise<SeoAnalysis> => {
    const context = `You are an expert digital marketing strategist. The user is analyzing the keyword "${userInput.keyword}" for their website "${userInput.url}". The target language is "${userInput.language}". Target Markets: ${userInput.targetMarkets.join(', ')}. User's answers to clarifying questions: "${answers}".\n\n--- Foundational Analysis Summary ---\n${analysisSummary}\n--- End of Summary ---`;
    
    const prompt = `${context}
    
    **TASK:** Perform a real-time SEO analysis of the user's website and key competitors using Google Search.
    1.  Search for the site's current title tags and meta descriptions.
    2.  Check for recent indexing issues or technical errors mentioned in public forums or tools.
    3.  Analyze the top 3-4 organic results for "${userInput.keyword}" to populate the 'serpAnalysis'.
    
    Based on your findings and the summary, generate a JSON object with the following structure:
    \`\`\`json
    {
      "seoAnalysis": {
        "onPage": [ { "check": "Title Tags", "status": "Pass/Fail/Warning", "recommendation": "Optimize title...", "priority": "Medium", "explanation": "...", "actionPlan": ["..."] } ],
        "technicalSeo": [ { "check": "Mobile", "status": "Pass/Fail/Warning", "recommendation": "...", "priority": "Low" } ],
        "offPage": [ { "check": "Backlinks", "status": "Pass/Fail/Warning", "recommendation": "...", "priority": "High", "explanation": "Low domain authority affects ranking.", "actionPlan": ["Submit to directories", "Guest post"] } ],
        "contentAnalysis": {
          "keywordDensity": "...",
          "readabilityScore": "...",
          "wordCount": 0,
          "recommendations": ["..."]
        },
        "serpAnalysis": {
          "estimatedPosition": 0,
          "topCompetitors": [
            { "url": "...", "estimatedPosition": 1, "strengths": ["..."] }
          ]
        }
      }
    }
    \`\`\`
    
    **CRITICAL INSTRUCTION:** 
    Identify the top 3 most critical 'Fail' or 'Warning' statuses across onPage, technicalSeo, and offPage. 
    Set their 'priority' to 'High'.
    For these 'High' priority items ONLY, provide a detailed 'explanation' of why this is a critical issue and an 'actionPlan' array containing specific, step-by-step actionable fixes.
    
    Return ONLY the JSON object in a markdown code block. All text values must be in "${userInput.language}".
    `;
    
    try {
        const response = await generateContentWithRetry({
            model: modelFlash, // Use flash for tool use + speed
            contents: prompt,
            config: { 
                // Note: We cannot use responseMimeType: 'application/json' WITH tools in some environments, 
                // so we rely on prompt engineering and the parseJsonResponse helper.
                tools: [{ googleSearch: {} }] 
            },
        });
        
        const result = parseJsonResponse<{ seoAnalysis: SeoAnalysis }>(response.text);
        if (!result?.seoAnalysis) throw new Error("Failed to generate valid SEO analysis.");
        return result.seoAnalysis;
    } catch (e: any) {
        console.warn("Tool-based SEO analysis failed, falling back to simulation mode.", e);
        if (e.message === 'API_QUOTA_EXCEEDED') throw e;

        const fallbackPrompt = `${context}
        **TASK:** As real-time SEO tools are currently unavailable due to high demand, perform a **simulated** SEO audit based on standard best practices for a website in this niche ("${userInput.keyword}").
        
        Generate a JSON object with the same structure as requested, but populate the "status" and "recommendations" based on common issues found in this industry.
        Identify top 3 critical issues, mark priority 'High', and provide 'explanation' and 'actionPlan'.
        Ensure the output is valid JSON in "${userInput.language}".
        \`\`\`json
        {
          "seoAnalysis": {
            "onPage": [ { "check": "Title Tags", "status": "Warning", "recommendation": "Optimize title tags...", "priority": "Medium" } ],
            "technicalSeo": [ { "check": "Mobile Responsiveness", "status": "Pass", "recommendation": "Maintain mobile...", "priority": "Low" } ],
            "offPage": [ { "check": "Backlinks", "status": "Fail", "recommendation": "Build more backlinks...", "priority": "High", "explanation": "Lack of backlinks hurts authority.", "actionPlan": ["Reach out to industry blogs", "Create shareable infographics"] } ],
            "contentAnalysis": {
              "keywordDensity": "1.2%",
              "readabilityScore": "High",
              "wordCount": 800,
              "recommendations": ["Increase word count...", "Add headers..."]
            },
            "serpAnalysis": {
              "estimatedPosition": 10,
              "topCompetitors": [
                { "url": "example-competitor.com", "estimatedPosition": 1, "strengths": ["Strong domain authority"] }
              ]
            }
          }
        }
        \`\`\`
        `;

        const fallbackResponse = await generateContentWithRetry({
            model: modelFlash,
            contents: fallbackPrompt
        });

        const result = parseJsonResponse<{ seoAnalysis: SeoAnalysis }>(fallbackResponse.text);
        if (!result?.seoAnalysis) throw new Error("Failed to generate valid SEO analysis (fallback).");
        return result.seoAnalysis;
    }
};

export const generateTrendsAnalysis = async (userInput: UserInput, timeRange: TrendTimeRange = '12m'): Promise<TrendsAnalysis> => {
    const getBrandName = (url: string) => {
        try {
            return new URL(url).hostname.replace(/^www\./, '');
        } catch {
            return url;
        }
    };

    const userBrand = getBrandName(userInput.url);
    const competitorBrands = userInput.competitorUrls.map(getBrandName);
    const brandsToAnalyze = [userBrand, ...competitorBrands].slice(0, 4);
    const timeRangePrompt = timeRange === '5y' ? "over the last 5 years" : "over the last 12 months";
    const markets = userInput.targetMarkets.length > 0 ? userInput.targetMarkets.join(', ') : 'Global';

    const prompt = `
        You are a market trends analyst. Your task is to analyze search interest in ${markets} ${timeRangePrompt} using your knowledge and available tools, and respond in "${userInput.language}".
        Generate a response with the following structure:
        1.  **keywordInterest**: A series object for the keyword "${userInput.keyword}". The 'name' must be "Primary Keyword". The 'data' array must contain 12 points representing estimated search interest (0-100) distributed evenly across the requested time range (${timeRangePrompt}), with a "date" (e.g., "Jan" or "2023") and "value".
        2.  **brandInterest**: An array of series objects, one for EACH of the following brands: ${brandsToAnalyze.join(', ')}. Each object must have a 'name' (the brand name) and a 'data' array with 12 interest points matching the same timeline.
        3.  **relatedTopics**: A list of 5-7 "rising" or "breakout" related search queries or topics that are gaining popularity in the target markets.
        
        The entire output must be a single valid JSON object wrapped in a \`\`\`json code block. The JSON object must have a single key "trendsAnalysis" which contains "keywordInterest", "brandInterest", and "relatedTopics".
    `;
    
    try {
        const response = await generateContentWithRetry({
            model: modelFlash,
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }] 
            },
        });
        
        const result = parseJsonResponse<{ trendsAnalysis: TrendsAnalysis }>(response.text);
        if (!result?.trendsAnalysis) throw new Error("Failed to generate valid Trends analysis.");
        return result.trendsAnalysis;
    } catch (e: any) {
        console.warn("Tool-based trends analysis failed, falling back to basic analysis.", e);
        if (e.message === 'API_QUOTA_EXCEEDED') throw e;

        const fallbackPrompt = `${prompt}\n\nIMPORTANT: As real-time search tools are currently unavailable, please provide your best ESTIMATES based on your internal knowledge of seasonality and general popularity trends for these terms in the specified markets.`;

        const fallbackResponse = await generateContentWithRetry({
            model: modelFlash,
            contents: fallbackPrompt,
        });
        
        const result = parseJsonResponse<{ trendsAnalysis: TrendsAnalysis }>(fallbackResponse.text);
        if (!result?.trendsAnalysis) throw new Error("Failed to generate valid Trends analysis (fallback).");
        return result.trendsAnalysis;
    }
}

export const generateKeywordAnalysis = async (analysisSummary: string, userInput: UserInput, answers: string): Promise<Partial<GoogleAdsCampaignDetails>> => {
    const context = `You are an expert digital marketing strategist. The user is analyzing the keyword "${userInput.keyword}" for their website "${userInput.url}". The target language is "${userInput.language}" and currency is "${userInput.currency}". Target Markets: ${userInput.targetMarkets.join(', ')}. User's answers to clarifying questions: "${answers}".\n\n--- Foundational Analysis Summary ---\n${analysisSummary}\n--- End of Summary ---`;
    
    const prompt = `${context}
    
    **TASK:** Use Google Search to find REAL-TIME data for the keyword "${userInput.keyword}" specifically in the target markets: ${userInput.targetMarkets.join(', ')}.
    1.  Find 3-4 distinct themes or categories for ad groups.
    2.  For each ad group, identify 3-5 highly relevant keywords that are currently popular or high-volume in these regions.
    3.  Estimate their CPC based on current market data found via search for these specific locations.
    
    Based on this real-time research, generate a detailed keyword analysis JSON object with the following structure:
    \`\`\`json
    {
      "adGroups": [
        {
          "groupName": "...",
          "keywords": [
            { "keyword": "...", "monthlyVolume": "...", "cpc": "...", "difficulty": "..." }
          ],
          "negativeKeywords": ["..."],
          "adCopies": [
             { "headline": "...", "description": "..." }
          ]
        }
      ]
    }
    \`\`\`
    Return ONLY the JSON object in a markdown code block. The text must be in "${userInput.language}".
    `;

    try {
        const response = await generateContentWithRetry({
            model: modelFlash, // Use flash for tool use
            contents: prompt,
            config: { 
                // We use tools to get real-time keyword data (e.g., from "best tools for X" lists or recent articles)
                tools: [{ googleSearch: {} }] 
            },
        });
        
        const result = parseJsonResponse<Partial<GoogleAdsCampaignDetails>>(response.text);
        if (!result) throw new Error("Failed to generate valid Keyword analysis.");
        return result;
    } catch (e: any) {
        console.warn("Tool-based Keyword analysis failed, falling back to estimated data.", e);
        if (e.message === 'API_QUOTA_EXCEEDED') throw e;

        const fallbackPrompt = `${context}
        **TASK:** As real-time search tools are unavailable, provide **estimated** keyword data based on your internal knowledge of the market for "${userInput.keyword}" in ${userInput.targetMarkets.join(', ') || 'global markets'}.
        
        Generate a structured JSON response with "adGroups" containing relevant keywords, estimated volumes, and CPCs in ${userInput.currency}.
        Ensure the output is valid JSON in "${userInput.language}".
        \`\`\`json
        {
          "adGroups": [
            {
              "groupName": "Example Group",
              "keywords": [
                { "keyword": "example keyword", "monthlyVolume": "1000-5000", "cpc": "1.50", "difficulty": "Medium" }
              ],
              "negativeKeywords": ["free", "cheap"],
              "adCopies": [
                 { "headline": "Example Headline", "description": "Example description." }
              ]
            }
          ]
        }
        \`\`\`
        `;
        
        const fallbackResponse = await generateContentWithRetry({
            model: modelFlash,
            contents: fallbackPrompt
        });
        
        const result = parseJsonResponse<Partial<GoogleAdsCampaignDetails>>(fallbackResponse.text);
        if (!result) throw new Error("Failed to generate valid Keyword analysis (fallback).");
        return result;
    }
};

export const generateGoogleAdsStrategy = async (analysisSummary: string, reportData: Partial<ReportData>, userInput: UserInput, answers: string, budget?: number): Promise<GoogleAdsStrategy> => {
    const context = `You are an expert digital marketing strategist. The user is analyzing the keyword "${userInput.keyword}" for their website "${userInput.url}". The target language is "${userInput.language}" and currency is "${userInput.currency}". Target Markets: ${userInput.targetMarkets.join(', ')}. User's answers to clarifying questions: "${answers}".\n\n--- Foundational Analysis Summary ---\n${analysisSummary}\n--- End of Summary ---`;
    const budgetPrompt = budget ? `\nThe total monthly budget for this entire Google Ads strategy MUST be exactly ${budget} ${userInput.currency}. Distribute this budget logically across the proposed campaigns for the target markets.` : '';
    const prompt = `${context}${budgetPrompt}\nBased on the summary, generate a JSON object for a "googleAdsStrategy". 
    
    Create campaign structures.
    OMIT the detailed adGroups/keyword analysis for any 'Search' campaigns, as this will be generated separately.
    
    **CRITICAL INSTRUCTION FOR SEARCH CAMPAIGNS:**
    For 'Search' campaigns, you MUST provide:
    1. A specific 'bidStrategy' (e.g., Maximize Clicks, Target CPA, Manual CPC).
    2. A 'targetCpcRange' object. **You MUST set the low estimate to '1.50' and the high estimate to '2.50'** (in ${userInput.currency}, just return the number as a string).
    3. A 'bidRationale' explaining that a target CPC range of 1.50-2.50 balances competitive visibility with budget efficiency, allowing the campaign to capture high-intent traffic without exhausting funds too quickly in this specific market.
    
    For each campaign, you MUST provide 2-3 specific A/B test suggestions (variable, versionA, versionB, reasoning). 
    You MUST generate a realistic, estimated 6-month performance trend for each campaign based on the proposed strategy, budget, and specific target market costs.
    The entire output must be a valid JSON object in the language "${userInput.language}".`;

    const response = await generateContentWithRetry({
        model: model,
        contents: prompt,
        config: { responseMimeType: 'application/json', responseSchema: googleAdsStrategyReportSchema },
    });

    const result = parseJsonResponse<{ googleAdsStrategy: GoogleAdsStrategy }>(response.text);
    if (!result?.googleAdsStrategy) throw new Error("Failed to generate valid Google Ads strategy.");
    return result.googleAdsStrategy;
};

export const generateSocialMediaCampaign = async (analysisSummary: string, reportData: Partial<ReportData>, userInput: UserInput, answers: string, budget?: number): Promise<SocialMediaCampaign> => {
    const context = `You are an expert digital marketing strategist. The user is analyzing the keyword "${userInput.keyword}" for their website "${userInput.url}". The target language is "${userInput.language}" and currency is "${userInput.currency}". Target Markets: ${userInput.targetMarkets.join(', ')}. User's answers to clarifying questions: "${answers}".\n\n--- Foundational Analysis Summary ---\n${analysisSummary}\n--- End of Summary ---`;
    const budgetPrompt = budget ? `\nThe total monthly budget for this social media campaign MUST be exactly ${budget} ${userInput.currency}.` : '';
    const prompt = `${context}${budgetPrompt}\nBased on the summary, generate a highly detailed and actionable JSON object for a "socialMediaCampaign". You MUST create a tailored strategy for ALL relevant platforms based on the summary (e.g., Instagram, Facebook, LinkedIn, TikTok). For each platform, provide a strategy that is specifically adapted to the user's business, target audience in the specified markets, and goals.

For EACH platform, you MUST provide:
1.  **Targeting**: A comprehensive targeting strategy specifically for this platform and target market location. You MUST include specific **Interests** (keywords, pages, brands), **Behaviors** (device usage, purchase behavior), and **Demographics** that align perfectly with the 'Target Audience Persona' identified in the analysis.
2.  **Content Ideas**: At least 3 structured and creative content ideas (each with a title and brief).
3.  **Ad Copy**: At least 1 compelling ad copy.
4.  **Visual Concept**: A clear visual concept for the content.

Finally, you MUST generate a realistic, estimated 6-month performance trend for the overall campaign. The entire output must be a valid JSON object in the language "${userInput.language}".`;
    
    const response = await generateContentWithRetry({
        model: model,
        contents: prompt,
        config: { responseMimeType: 'application/json', responseSchema: socialMediaCampaignReportSchema },
    });
    
    const result = parseJsonResponse<{ socialMediaCampaign: SocialMediaCampaign }>(response.text);
    if (!result?.socialMediaCampaign) throw new Error("Failed to generate valid Social Media Campaign.");
    return result.socialMediaCampaign;
};

export const generateAdvancedAdsStrategy = async (analysisSummary: string, reportData: Partial<ReportData>, userInput: UserInput, answers: string, budget?: number): Promise<AdvancedAdsStrategy> => {
    const context = `You are an expert digital marketing strategist. The user is analyzing the keyword "${userInput.keyword}" for their website "${userInput.url}". The target language is "${userInput.language}" and currency is "${userInput.currency}". Target Markets: ${userInput.targetMarkets.join(', ')}. User's answers to clarifying questions: "${answers}".\n\n--- Foundational Analysis Summary ---\n${analysisSummary}\n--- End of Summary ---`;
    const budgetPrompt = budget ? `\nThe total overall monthly budget for all RELEVANT advanced ad campaigns combined MUST be ${budget} ${userInput.currency}. Distribute this budget logically.` : '';
    const prompt = `${context}${budgetPrompt}\nBased on the summary, generate a JSON object for an "advancedAdsStrategy".
    
    **MANDATORY INSTRUCTION:** You MUST include an item in the 'campaigns' array for EVERY single one of the following types: 'Display/Remarketing', 'YouTube Ads', 'Mobile App Ads', 'Meta Advantage+', 'Telegram Ads', 'Yandex Ads', 'Bing Ads', 'TikTok Ads'. Do not skip any.
    
    For EACH type:
    1.  Evaluate if it is relevant for the user's business in the specified target markets. Set 'isRelevant' to true or false.
    2.  Provide a brief 'relevanceReasoning'.
    3.  If relevant, provide detailed targeting, suggested ad formats, 1 sample ad copy (headline and description), and a **VERY CONCISE** visual concept description (maximum 15 words, do NOT repeat text).
    4.  **CRITICAL:** You MUST provide an 'estimatedCpc' AND/OR 'estimatedCpm' for each relevant campaign type, based on current market rates in the target countries (${userInput.targetMarkets.join(', ')}). Use ${userInput.currency}.
    
    **CRITICAL INSTRUCTIONS FOR 'YouTube Ads'**: If YouTube Ads are relevant, you MUST provide a more detailed and data-driven strategy. Your suggestions for target channels and videos should be based on successful content identified in the analysis. Specifically:
    1.  **suggestedAdFormats**: List specific, recommended YouTube ad formats (e.g., "Skippable in-stream, In-feed video ads, Bumper ads").
    2.  **targetChannels**: Provide a list of 3-5 real, specific YouTube channel names that the target audience likely watches, informed by the competitor analysis.
    3.  **targetVideos**: Provide a list of 3-5 real, specific YouTube video titles (or themes based on top-performing videos from the analysis) that would be excellent placements for the ads.
    
    **CRITICAL INSTRUCTIONS FOR 'TikTok Ads'**: If TikTok Ads are relevant, you MUST provide a more detailed strategy tailored to the user's business and target audience. Specifically:
    1.  **creativeAdFormats**: Provide a list of 2-3 creative ad format ideas (e.g., "Day-in-the-life style video," "Unboxing and first impressions," "Educational how-to tutorial").
    2.  **trendingAudioSuggestions**: Provide a list of 2-3 types of trending audio or specific audio concepts that would align with the brand (e.g., "Upbeat trending pop song," "Voiceover with a popular meme sound").
    3.  **influencerCollaborationIdeas**: Provide a list of 2-3 actionable influencer collaboration ideas, including the type of influencer to target (e.g., "Partner with micro-influencers in the [user's niche] space," "Collaborate with a local comedian for a humorous take on the product").

    The entire output must be a valid JSON object in the language "${userInput.language}".`;
    
    const response = await generateContentWithRetry({
        model: model,
        contents: prompt,
        config: { responseMimeType: 'application/json', responseSchema: advancedAdsStrategyReportSchema },
    });
    
    const result = parseJsonResponse<{ advancedAdsStrategy: AdvancedAdsStrategy }>(response.text);
    if (!result?.advancedAdsStrategy) throw new Error("Failed to generate valid Advanced Ads Strategy.");
    return result.advancedAdsStrategy;
};

export const generateRoiForecast = async (reportData: Partial<ReportData>): Promise<RoiForecast> => {
    const context = `You are an expert financial analyst specializing in marketing ROI. You have been given a comprehensive marketing report. Your task is to synthesize the budget information and strategic recommendations from all advertising sections (Google Ads, Social Media, Advanced Ads) to create a holistic ROI forecast.
    
    --- Full Report Data (use this for your calculations) ---
    ${JSON.stringify(reportData)}
    --- End of Report Data ---`;
    
    const prompt = `${context}\nBased on ALL the provided report data, generate a comprehensive JSON object for an "roiForecast". Your forecast must include:
    1.  'estimatedRoas': A single, realistic number (e.g., 3.5) representing the estimated Return On Ad Spend across all campaigns.
    2.  'notes': A brief explanation of the key assumptions you made to arrive at this forecast (e.g., industry benchmarks, conversion rates, market stability).
    3.  'optimizations': A list of 3-4 high-impact optimization areas to improve the forecasted ROI.
    The entire output must be a valid JSON object.`;
    
    const response = await generateContentWithRetry({
        model: model,
        contents: prompt,
        config: { responseMimeType: 'application/json', responseSchema: roiForecastReportSchema },
    });
    
    const result = parseJsonResponse<{ roiForecast: RoiForecast }>(response.text);
    if (!result?.roiForecast) throw new Error("Failed to generate valid ROI Forecast.");
    return result.roiForecast;
};

export const refineStrategyStream = async (userInput: UserInput, reportData: Partial<ReportData>, history: Message[], question: string): Promise<ReadableStream<string>> => {
    const context = `
        You are a helpful marketing strategy assistant.
        The user has a full marketing report. Here is a summary:
        - Keyword: ${userInput.keyword}
        - User's URL: ${userInput.url}
        - Target Markets: ${userInput.targetMarkets.join(', ')}
        - Key Competitors: ${reportData.competitorAnalysis?.slice(1, 3).map(c => c.url).join(', ')}
        - Core Strategy: ${Array.isArray(reportData.strategicRecommendations?.brandStrategy) ? reportData.strategicRecommendations.brandStrategy.map(s => typeof s === 'string' ? s : s.title).join('; ') : ''}

        The user is asking follow-up questions in a chat. Keep your answers concise and directly related to the user's question, using the report data as context.
    `;
    
    const chat: Chat = ai.chats.create({ model: modelFlash, config: { systemInstruction: context }});
    
    const stream = await chat.sendMessageStream({
        message: question,
        history: history.map(h => ({
            role: h.role,
            parts: [{ text: h.text }]
        }))
    });

    return new ReadableStream({
        async start(controller) {
            for await (const chunk of stream) {
                const text = chunk.text;
                if (text) {
                    controller.enqueue(text);
                }
            }
            controller.close();
        }
    });
};

export const generateMarketingPlan = async (reportData: Partial<ReportData>, userInput: UserInput): Promise<MarketingPlanTask[]> => {
    // Create a concise summary of the report to avoid an overly large prompt.
    const summary = `
        - Primary Keyword: ${userInput.keyword}
        - Target Audience: ${reportData.brandAnalysis?.targetAudiencePersona?.name || 'Not defined'}
        - Key SWOT Opportunity: ${reportData.swotAnalysis?.opportunities?.[0]?.opportunity || 'Not defined'}
        - Top Content Pillar: ${reportData.contentStrategy?.pillars?.[0]?.pillar || 'Not defined'}
        - Primary Google Ads Campaign: ${reportData.googleAdsStrategy?.campaigns?.[0]?.campaignType || 'Not defined'}
        - Primary Social Media Platform: ${reportData.socialMediaCampaign?.platforms?.[0]?.platform || 'Not defined'}
        
        Raw Analysis Summary (excerpt): ${reportData.analysisSummary ? reportData.analysisSummary.substring(0, 2000) : 'Not available'}
    `;

    const prompt = `
        Based on this summary of a marketing report, create a detailed, actionable 4-week marketing plan in the language "${userInput.language}".
        The plan should be broken down by week and day (e.g., Monday, Tuesday).
        For each day, specify the channel (e.g., SEO, Blog, Twitter, Google Ads), the specific task, a brief detail on how to execute it, and a priority level (High, Medium, Low).
        Ensure you provide tasks for at least 3-4 days per week for all 4 weeks.
        
        Report Summary:
        ${summary}
    `;
    const response = await generateContentWithRetry({
        model: modelFlash,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: marketingPlanSchema,
        },
    });

    const result = parseJsonResponse<{ plan: MarketingPlanTask[] }>(response.text);
    if (!result || !result.plan) {
        throw new Error("Could not generate a marketing plan.");
    }
    return result.plan;
};

export const analyzeCampaignPerformance = async (data: CampaignPerformanceData[]) => {
    const prompt = `
      Analyze the following CSV data from a marketing campaign. The data represents performance over time.
      Identify key trends, underperforming areas, and high-performing segments.
      Provide a list of 3-5 actionable optimization tips. Each tip should include a title, a brief observation from the data, a clear recommendation, and a priority level (High, Medium, Low).
      
      CSV Data:
      ${JSON.stringify(data.slice(0, 20))}
    `; 

    const response = await generateContentWithRetry({
        model: modelFlash,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: optimizationTipsSchema,
        },
    });
    
    const tips = parseJsonResponse<any[]>(response.text);
    if (!tips) {
        throw new Error("Could not analyze campaign performance.");
    }
    return tips;
};

export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return base64ImageBytes;
        } else {
            throw new Error("Image generation failed: No image data received from the API.");
        }
    } catch (e: any) {
        console.error("Image generation API call failed:", e);
        const errorMessage = e.message || "An unknown error occurred during image generation.";
        throw new Error(errorMessage);
    }
};


export const generateMoreKeywords = async (userInput: UserInput, adGroupName: string, existingKeywords: string[]): Promise<KeywordData[]> => {
    const prompt = `
        For a Google Ads ad group named "${adGroupName}" targeting the main keyword "${userInput.keyword}" in ${userInput.targetMarkets.join(', ')}, generate 5-7 MORE keywords.
        These new keywords should be thematically related but distinct from the existing keywords.
        Do not include any of these existing keywords in your response: ${existingKeywords.join(', ')}.
        For each new keyword, provide its estimated monthly search volume in the target market, CPC in ${userInput.currency}, and difficulty (Low, Medium, High).
        The language of the keywords must be ${userInput.language}.
    `;

    const response = await generateContentWithRetry({
        model: modelFlash,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: moreKeywordsSchema,
        },
    });

    const newKeywords = parseJsonResponse<KeywordData[]>(response.text);
    if (!newKeywords) {
        throw new Error("Could not generate more keywords.");
    }
    return newKeywords;
};

export const generateBlogPostDraft = async (topic: string, primaryKeyword: string, targetAudience: string, language: string): Promise<string> => {
    const prompt = `
        Write a blog post draft in ${language} about the topic: "${topic}".
        The primary keyword to target is "${primaryKeyword}".
        The target audience is ${targetAudience}.
        The draft should be well-structured with a title (starting with #), headings (starting with ##), and paragraphs.
        The tone should be engaging and informative.
        The output should be in Markdown format.
    `;

    const response = await generateContentWithRetry({
        model: modelFlash,
        contents: prompt
    });

    return response.text;
};

export const generateBrandAnalysis = async (analysisSummary: string, userInput: UserInput, answers: string): Promise<BrandAnalysis> => {
    const context = `You are an expert brand strategist. The user is analyzing the keyword "${userInput.keyword}" for their website "${userInput.url}".`;
    const prompt = `${context} Your answers to clarifying questions: "${answers}".\n\n--- Foundational Analysis Summary ---\n${analysisSummary}\n--- End of Summary ---\nBased on the summary, generate a JSON object for a "brandAnalysis". It MUST include: 1. "brandIdentity": A concise definition. 2. "brandVoice": A description of the tone. 3. "targetAudiencePersona": A detailed persona including 'name', 'demographics' (age, gender, location, occupation, income), 'ageDistribution', 'genderDistribution', 'motivations', and 'painPoints'. For 'painPoints', format as a single string with each point on a new line like 'Title: Description'. All text MUST be in the user's target language: "${userInput.language}".`;
    
    const response = await generateContentWithRetry({
        model: model,
        contents: prompt,
        config: { responseMimeType: 'application/json', responseSchema: brandAnalysisReportSchema },
    });
    
    const result = parseJsonResponse<{ brandAnalysis: BrandAnalysis }>(response.text);
    if (!result?.brandAnalysis) throw new Error("Failed to generate valid Brand Analysis.");
    return result.brandAnalysis;
};

export const generateStrategicRecommendations = async (analysisSummary: string, userInput: UserInput, answers: string): Promise<StrategicRecommendations> => {
    const context = `You are an expert digital marketing strategist. The user is analyzing the keyword "${userInput.keyword}" for their website "${userInput.url}". Your answers to clarifying questions: "${answers}".\n\n--- Foundational Analysis Summary ---\n${analysisSummary}\n--- End of Summary ---`;
    const prompt = `${context}\nBased on the summary, generate a JSON object for "strategicRecommendations". It must contain two keys: "brandStrategy" and "salesStrategy". Each key should be an array of at least 3-4 concise, actionable recommendation strings. All text must be in "${userInput.language}".`;
    
    const response = await generateContentWithRetry({
        model: modelFlash,
        contents: prompt,
        config: { responseMimeType: 'application/json', responseSchema: strategicRecommendationsReportSchema },
    });
    
    const result = parseJsonResponse<{ strategicRecommendations: StrategicRecommendations }>(response.text);
    if (!result?.strategicRecommendations) throw new Error("Failed to generate valid Strategic Recommendations.");
    return result.strategicRecommendations;
};

export const generateContentStrategy = async (analysisSummary: string, userInput: UserInput, answers: string): Promise<ContentStrategy> => {
    const context = `You are an expert content strategist. The user is analyzing the keyword "${userInput.keyword}" for their website "${userInput.url}". Your answers to clarifying questions: "${answers}".\n\n--- Foundational Analysis Summary ---\n${analysisSummary}\n--- End of Summary ---`;
    const prompt = `${context}\nBased on the summary, generate a JSON object for a "contentStrategy". It MUST include: 1. "pillars": An array of 3-4 content pillars, each with a 'pillar' name, 'description', and an array of 3 'postIdeas' (each with a 'title' and 'brief'). 2. "contentFormats": An array of 4-5 suggested content formats, each with a 'format' name and 'description'. 3. "suggestedTopics": An array of 5-7 additional topic strings. All text must be in "${userInput.language}".`;
    
    const response = await generateContentWithRetry({
        model: model,
        contents: prompt,
        config: { responseMimeType: 'application/json', responseSchema: contentStrategyReportSchema },
    });
    
    const result = parseJsonResponse<{ contentStrategy: ContentStrategy }>(response.text);
    if (!result?.contentStrategy) throw new Error("Failed to generate valid Content Strategy.");
    return result.contentStrategy;
};


export const generateCustomerJourney = async (analysisSummary: string, userInput: UserInput, answers: string): Promise<CustomerJourneyAnalysis> => {
    const context = `You are a customer experience expert. The user is analyzing the keyword "${userInput.keyword}" for their website "${userInput.url}". Your answers to clarifying questions: "${answers}".\n\n--- Foundational Analysis Summary ---\n${analysisSummary}\n--- End of Summary ---`;
    const prompt = `${context}\nBased on the summary, generate a JSON object for a "customerJourneyAnalysis". It must contain a "funnel" array with exactly three objects, one for each stage: 'Awareness', 'Consideration', and 'Conversion'. Each stage object MUST have a 'description' and an array of at least 3-4 specific 'tactics' (as strings) relevant to that stage for the user's business. All text must be in "${userInput.language}".`;
    
    const response = await generateContentWithRetry({
        model: modelFlash,
        contents: prompt,
        config: { responseMimeType: 'application/json', responseSchema: customerJourneyReportSchema },
    });
    
    const result = parseJsonResponse<{ customerJourneyAnalysis: CustomerJourneyAnalysis }>(response.text);
    if (!result?.customerJourneyAnalysis) throw new Error("Failed to generate valid Customer Journey Analysis.");
    return result.customerJourneyAnalysis;
};

export const generateContentCalendar = async (contentStrategy: ContentStrategy, userInput: UserInput): Promise<ContentCalendarItem[]> => {
    const prompt = `
        Based on the following content strategy pillars:
        ${contentStrategy.pillars.map(p => `- ${p.pillar}`).join('\n')}
        
        Create a detailed 4-week content calendar (28 days total) for the user.
        For each item, specify the 'week' (1-4), 'day' (e.g., "Monday"), 'platform' (e.g., Instagram, Blog), 'contentFormat' (e.g., Reel, Article), and a 'topic' or caption draft.
        Ensure variety in platforms and formats.
        The output must be a JSON object with a 'calendar' array containing these items.
        Language: ${userInput.language}
    `;

    const response = await generateContentWithRetry({
        model: modelFlash,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: contentCalendarSchema,
        },
    });

    const result = parseJsonResponse<{ calendar: ContentCalendarItem[] }>(response.text);
    if (!result || !result.calendar) {
        throw new Error("Could not generate content calendar.");
    }
    return result.calendar;
};
