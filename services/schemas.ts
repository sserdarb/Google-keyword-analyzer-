
import { Type } from "@google/genai";

const adCopySchema = {
    type: Type.OBJECT,
    properties: {
        headline: { type: Type.STRING },
        description: { type: Type.STRING }
    },
    required: ['headline', 'description']
};

const keywordAdGroupSchema = {
    type: Type.OBJECT,
    properties: {
        groupName: { type: Type.STRING },
        keywords: {
            type: Type.ARRAY,
            description: "MUST contain at least 3-5 relevant keywords. Do not return an empty array.",
            items: {
                type: Type.OBJECT,
                properties: {
                    keyword: { type: Type.STRING },
                    monthlyVolume: { type: Type.STRING },
                    cpc: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                },
                required: ['keyword', 'monthlyVolume', 'cpc', 'difficulty']
            }
        },
        negativeKeywords: {
            type: Type.ARRAY,
            description: "MUST contain at least 5-10 relevant negative keywords.",
            items: { type: Type.STRING }
        },
        adCopies: {
            type: Type.ARRAY,
            description: "MUST contain exactly 2 distinct ad copies.",
            items: adCopySchema
        }
    },
    required: ['groupName', 'keywords', 'negativeKeywords', 'adCopies']
};

const seoCheckSchema = {
    type: Type.OBJECT,
    properties: {
        check: { type: Type.STRING },
        status: { type: Type.STRING, enum: ['Pass', 'Fail', 'Warning'] },
        recommendation: { type: Type.STRING },
        priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'], description: "Assign 'High' only to the top 3 most critical failures/warnings." },
        explanation: { type: Type.STRING, description: "A detailed explanation of why this issue impacts SEO (only for High priority items)." },
        actionPlan: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Step-by-step actionable fixes (only for High priority items)." }
    },
    required: ['check', 'status', 'recommendation']
};

const demographicDistributionSchema = {
    type: Type.ARRAY,
    description: "An array of objects representing a demographic breakdown. The sum of all values should be 100.",
    items: {
        type: Type.OBJECT,
        properties: {
            label: { type: Type.STRING, description: "The demographic category (e.g., '18-24', 'Male')." },
            value: { type: Type.NUMBER, description: "The percentage value for this category." }
        },
        required: ['label', 'value']
    }
};

const abTestSuggestionSchema = {
    type: Type.OBJECT,
    properties: {
        variable: { type: Type.STRING, description: "The element to test, e.g., 'Headline', 'Visual'." },
        versionA: { type: Type.STRING, description: "The control version." },
        versionB: { type: Type.STRING, description: "The variation to test." },
        reasoning: { type: Type.STRING, description: "The hypothesis behind this test." }
    },
    required: ['variable', 'versionA', 'versionB', 'reasoning']
};


export const clarifyingQuestionsSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
    },
    required: ['questions']
};

export const structuringAndBrandSchema = {
  type: Type.OBJECT,
  properties: {
    competitorAnalysis: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                url: { type: Type.STRING },
                overallScore: { type: Type.NUMBER, description: "A score from 0 to 100." },
                seoScore: { type: Type.NUMBER, description: "A score from 0 to 100." },
                contentScore: { type: Type.NUMBER, description: "A score from 0 to 100." },
                uxScore: { type: Type.NUMBER, description: "A score from 0 to 100." },
                brandAuthority: { type: Type.NUMBER, description: "A score from 0 to 100." },
                advertisingBehavior: {
                    type: Type.OBJECT,
                    description: "Simulated analysis of competitor's advertising strategy.",
                    properties: {
                        estimatedMonthlyBudget: { type: Type.NUMBER, description: "Estimated monthly ad spend in the user's currency." },
                        estimatedAdTraffic: { type: Type.STRING, description: "Estimated monthly visits from paid ads, e.g., '1.5K visits/month'." },
                        topAdKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3-5 keywords they likely bid on." },
                        sampleAdCopy: {
                            type: Type.ARRAY,
                            description: "1-2 sample ad copies they might be running.",
                            items: adCopySchema
                        }
                    },
                    required: ['estimatedMonthlyBudget', 'estimatedAdTraffic', 'topAdKeywords', 'sampleAdCopy']
                }
            },
            required: ['url', 'overallScore', 'seoScore', 'contentScore', 'uxScore', 'brandAuthority', 'advertisingBehavior']
        }
    },
    swotAnalysis: {
        type: Type.OBJECT,
        properties: {
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "MUST contain at least 3 strengths. Do not return an empty array." },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "MUST contain at least 3 weaknesses. Do not return an empty array." },
            opportunities: {
                type: Type.ARRAY,
                description: "MUST contain at least 3 opportunities. Do not return an empty array.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        opportunity: { type: Type.STRING },
                        contentIdeas: {
                            type: Type.ARRAY,
                            description: "2-3 specific, actionable content ideas that directly leverage this opportunity.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING, description: "A catchy title for the content piece." },
                                    brief: { type: Type.STRING, description: "A short brief explaining what the content is about." }
                                },
                                required: ['title', 'brief']
                            }
                        }
                    },
                    required: ['opportunity', 'contentIdeas'],
                }
            },
            threats: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "MUST contain at least 3 threats. Do not return an empty array."
            },
        },
    },
  },
  required: ['competitorAnalysis', 'swotAnalysis']
};

export const seoAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        seoAnalysis: {
            type: Type.OBJECT,
            properties: {
                onPage: { type: Type.ARRAY, items: seoCheckSchema },
                technicalSeo: { type: Type.ARRAY, items: seoCheckSchema },
                offPage: { type: Type.ARRAY, items: seoCheckSchema },
                contentAnalysis: {
                    type: Type.OBJECT,
                    properties: {
                        keywordDensity: { type: Type.STRING, description: "e.g., '1.5%'" },
                        readabilityScore: { type: Type.STRING, description: "e.g., 'Grade 8' or a Flesch-Kincaid score." },
                        wordCount: { type: Type.NUMBER },
                        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['keywordDensity', 'readabilityScore', 'wordCount', 'recommendations']
                },
                serpAnalysis: {
                    type: Type.OBJECT,
                    properties: {
                        estimatedPosition: { type: Type.NUMBER, description: "Estimated search engine ranking position for the main keyword." },
                        topCompetitors: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    url: { type: Type.STRING },
                                    estimatedPosition: { type: Type.NUMBER },
                                    strengths: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ['url', 'estimatedPosition', 'strengths']
                            }
                        }
                    },
                    required: ['estimatedPosition', 'topCompetitors']
                }
            },
            required: ['onPage', 'technicalSeo', 'offPage', 'contentAnalysis', 'serpAnalysis']
        }
    },
    required: ['seoAnalysis']
};


export const keywordAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        adGroups: {
            type: Type.ARRAY,
            description: "MUST contain 3-4 ad groups.",
            items: keywordAdGroupSchema
        }
    },
    required: ['adGroups']
};

export const moreKeywordsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            keyword: { type: Type.STRING },
            monthlyVolume: { type: Type.STRING },
            cpc: { type: Type.STRING },
            difficulty: { type: Type.STRING },
        },
        required: ['keyword', 'monthlyVolume', 'cpc', 'difficulty']
    }
};

export const googleAdsStrategyReportSchema = {
    type: Type.OBJECT,
    properties: {
        googleAdsStrategy: {
            type: Type.OBJECT,
            properties: {
                overallMonthlyBudget: { type: Type.NUMBER, description: "The total recommended monthly budget for all Google Ads campaigns, in the user's currency." },
                campaigns: {
                    type: Type.ARRAY,
                    description: "An array of recommended Google Ads campaigns. MUST include a 'Search' campaign. Can also include 'Performance Max' and 'Display'.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            campaignType: { type: Type.STRING, enum: ['Search', 'Performance Max', 'Display', 'Video'] },
                            monthlyBudget: { type: Type.NUMBER },
                            targetRegion: { type: Type.STRING },
                            goals: { type: Type.ARRAY, items: { type: Type.STRING } },
                            searchIntent: { type: Type.STRING, description: "The user's primary search intent. MUST be in the requested language." },
                            monthlyVolume: { type: Type.STRING, description: "The estimated total monthly search volume for the main keyword." },
                            averageCpc: { type: Type.STRING, description: "The average CPC for the main keyword, in the user's currency." },
                            
                            // Bidding strategy details
                            bidStrategy: { type: Type.STRING, description: "Recommended bidding strategy (e.g., Maximize Clicks, Target CPA)." },
                            targetCpcRange: { 
                                type: Type.OBJECT,
                                properties: {
                                    low: { type: Type.STRING, description: "Low end estimate in user currency." },
                                    high: { type: Type.STRING, description: "High end estimate in user currency." }
                                },
                                required: ['low', 'high']
                            },
                            bidRationale: { type: Type.STRING, description: "Explanation of why this strategy is chosen." },

                            assetGroups: { type: Type.ARRAY, items: {
                                type: Type.OBJECT,
                                properties: {
                                    groupName: { type: Type.STRING },
                                    headlines: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    descriptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    visualConcept: { type: Type.STRING, description: "A brief, 1-2 sentence concept for any ad visuals." }
                                },
                                required: ['groupName', 'headlines', 'descriptions', 'visualConcept']
                            }},
                            detailedTargeting: {
                                type: Type.OBJECT,
                                properties: {
                                    demographics: { type: Type.STRING },
                                    interests: { type: Type.STRING },
                                    behaviors: { type: Type.STRING },
                                },
                            },
                            visualConcept: { type: Type.STRING, description: "A brief, 1-2 sentence concept for any ad visuals." },
                            performanceTrend: {
                                type: Type.ARRAY,
                                description: "A 6-month estimated performance trend. MUST contain 6 items.",
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        month: { type: Type.STRING },
                                        value: { type: Type.NUMBER, description: "Represents clicks for Search, impressions for Display, or views for Video." }
                                    },
                                    required: ['month', 'value']
                                }
                            },
                             abTestSuggestions: {
                                type: Type.ARRAY,
                                description: "A list of 2-3 A/B test ideas for this specific campaign.",
                                items: abTestSuggestionSchema
                            }
                        },
                        required: ['campaignType', 'monthlyBudget', 'targetRegion', 'goals', 'performanceTrend']
                    }
                }
            },
            required: ['overallMonthlyBudget', 'campaigns']
        }
    },
    required: ['googleAdsStrategy']
};


export const socialMediaCampaignReportSchema = {
    type: Type.OBJECT,
    properties: {
        socialMediaCampaign: {
            type: Type.OBJECT,
            properties: {
                monthlyBudget: { type: Type.NUMBER },
                estimatedReachPerMonth: { type: Type.NUMBER },
                estimatedEngagementsPerMonth: { type: Type.NUMBER },
                targetAudience: { type: Type.STRING },
                platforms: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            platform: { type: Type.STRING },
                            contentIdeas: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        brief: { type: Type.STRING }
                                    },
                                    required: ['title', 'brief']
                                }
                            },
                            adCopy: { type: Type.ARRAY, items: adCopySchema },
                            visualConcept: { type: Type.STRING },
                            targeting: { type: Type.STRING }
                        },
                        required: ['platform', 'contentIdeas', 'adCopy', 'visualConcept', 'targeting']
                    }
                },
                performanceTrend: {
                    type: Type.ARRAY,
                    description: "A 6-month estimated performance trend. MUST contain 6 items.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            month: { type: Type.STRING },
                            reach: { type: Type.NUMBER },
                            engagements: { type: Type.NUMBER }
                        },
                        required: ['month', 'reach', 'engagements']
                    }
                }
            },
            required: ['monthlyBudget', 'estimatedReachPerMonth', 'estimatedEngagementsPerMonth', 'targetAudience', 'platforms', 'performanceTrend']
        }
    },
    required: ['socialMediaCampaign']
};


export const advancedAdsStrategyReportSchema = {
    type: Type.OBJECT,
    properties: {
        advancedAdsStrategy: {
            type: Type.OBJECT,
            properties: {
                 overallMonthlyBudget: { type: Type.NUMBER, description: "The total recommended monthly budget for ALL relevant campaigns combined, in the user's currency." },
                 campaigns: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            campaignType: { type: Type.STRING, enum: ['Display/Remarketing', 'YouTube Ads', 'Mobile App Ads', 'Meta Advantage+', 'Telegram Ads', 'Yandex Ads', 'Bing Ads', 'TikTok Ads'] },
                            isRelevant: { type: Type.BOOLEAN },
                            relevanceReasoning: { type: Type.STRING },
                            monthlyBudget: { type: Type.NUMBER },
                            estimatedCpc: { type: Type.NUMBER, description: "Estimated average Cost Per Click (CPC) for this campaign type in the user's currency. If CPM is more relevant, convert to an equivalent CPC or estimate cost per action." },
                            estimatedCpm: { type: Type.NUMBER, description: "Estimated average Cost Per Mille (CPM) for this campaign type in the user's currency." },
                            targeting: { type: Type.STRING },
                            suggestedAdFormats: { type: Type.STRING },
                            adCopy: {
                                type: Type.ARRAY,
                                description: "1 sample ad copy (headline and description).",
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        headline: { type: Type.STRING },
                                        description: { type: Type.STRING }
                                    },
                                    required: ['headline', 'description']
                                }
                            },
                            visualConcept: { type: Type.STRING, description: "A VERY SHORT, concise description of the visual (max 15 words). Do not loop or repeat text." },
                            performanceTrend: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        month: { type: Type.STRING },
                                        value: { type: Type.NUMBER }
                                    },
                                    required: ['month', 'value']
                                }
                            },
                            targetChannels: { type: Type.ARRAY, items: { type: Type.STRING } },
                            targetVideos: { type: Type.ARRAY, items: { type: Type.STRING } },
                            creativeAdFormats: { type: Type.ARRAY, items: { type: Type.STRING } },
                            trendingAudioSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                            influencerCollaborationIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
                            abTestSuggestions: {
                                type: Type.ARRAY,
                                description: "A list of 1-2 A/B test ideas for this specific advanced campaign.",
                                items: abTestSuggestionSchema
                            }
                        },
                         required: ['campaignType', 'isRelevant', 'relevanceReasoning']
                    }
                 }
            },
            required: ['overallMonthlyBudget', 'campaigns']
        }
    },
    required: ['advancedAdsStrategy']
};

export const brandAnalysisReportSchema = {
    type: Type.OBJECT,
    properties: {
        brandAnalysis: {
            type: Type.OBJECT,
            properties: {
                brandIdentity: { type: Type.STRING },
                brandVoice: { type: Type.STRING },
                targetAudiencePersona: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        demographics: {
                            type: Type.OBJECT,
                            properties: {
                                age: { type: Type.STRING },
                                gender: { type: Type.STRING },
                                location: { type: Type.STRING },
                                occupation: { type: Type.STRING },
                                income: { type: Type.STRING },
                            }
                        },
                        ageDistribution: demographicDistributionSchema,
                        genderDistribution: demographicDistributionSchema,
                        motivations: { type: Type.STRING },
                        painPoints: { type: Type.STRING, description: "A string with each point on a new line, formatted as 'Pain Point Title: Description'." },
                    },
                     required: ['name', 'demographics', 'motivations', 'painPoints', 'ageDistribution', 'genderDistribution']
                },
            },
             required: ['brandIdentity', 'brandVoice', 'targetAudiencePersona']
        }
    },
    required: ['brandAnalysis']
};

export const strategicRecommendationsReportSchema = {
    type: Type.OBJECT,
    properties: {
        strategicRecommendations: {
            type: Type.OBJECT,
            properties: {
                brandStrategy: { type: Type.ARRAY, items: { 
                    oneOf: [
                        { type: Type.STRING },
                        { 
                            type: Type.OBJECT, 
                            properties: {
                                title: { type: Type.STRING },
                                description: { type: Type.STRING }
                            },
                            required: ['title', 'description']
                        }
                    ]
                }},
                salesStrategy: { type: Type.ARRAY, items: { 
                     oneOf: [
                        { type: Type.STRING },
                        { 
                            type: Type.OBJECT, 
                            properties: {
                                title: { type: Type.STRING },
                                description: { type: Type.STRING }
                            },
                             required: ['title', 'description']
                        }
                    ]
                }},
            },
            required: ['brandStrategy', 'salesStrategy']
        }
    },
    required: ['strategicRecommendations']
};

export const contentStrategyReportSchema = {
    type: Type.OBJECT,
    properties: {
        contentStrategy: {
            type: Type.OBJECT,
            properties: {
                pillars: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            pillar: { type: Type.STRING },
                            description: { type: Type.STRING },
                            postIdeas: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        brief: { type: Type.STRING }
                                    },
                                    required: ['title', 'brief']
                                }
                            }
                        },
                        required: ['pillar', 'description', 'postIdeas']
                    }
                },
                contentFormats: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            format: { type: Type.STRING },
                            description: { type: Type.STRING }
                        },
                        required: ['format', 'description']
                    }
                },
                suggestedTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['pillars', 'contentFormats', 'suggestedTopics']
        }
    },
    required: ['contentStrategy']
};

export const customerJourneyReportSchema = {
    type: Type.OBJECT,
    properties: {
        customerJourneyAnalysis: {
            type: Type.OBJECT,
            properties: {
                funnel: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            stage: { type: Type.STRING, enum: ['Awareness', 'Consideration', 'Conversion'] },
                            description: { type: Type.STRING },
                            tactics: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ['stage', 'description', 'tactics']
                    }
                }
            },
            required: ['funnel']
        }
    },
    required: ['customerJourneyAnalysis']
};

export const roiForecastReportSchema = {
    type: Type.OBJECT,
    properties: {
        roiForecast: {
            type: Type.OBJECT,
            properties: {
                estimatedRoas: { type: Type.NUMBER },
                notes: { type: Type.STRING },
                optimizations: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            area: { type: Type.STRING },
                            impact: { type: Type.STRING }
                        },
                        required: ['area', 'impact']
                    }
                }
            },
            required: ['estimatedRoas', 'notes', 'optimizations']
        }
    },
    required: ['roiForecast']
};

export const marketingPlanSchema = {
    type: Type.OBJECT,
    properties: {
        plan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    week: { type: Type.INTEGER },
                    day: { type: Type.STRING },
                    channel: { type: Type.STRING },
                    task: { type: Type.STRING },
                    details: { type: Type.STRING },
                    priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                },
                required: ['week', 'day', 'channel', 'task', 'details', 'priority']
            }
        }
    },
    required: ['plan']
};

export const optimizationTipsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            observation: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
        },
        required: ['title', 'observation', 'recommendation', 'priority']
    }
};

export const trendsAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        trendsAnalysis: {
            type: Type.OBJECT,
            properties: {
                keywordInterest: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        data: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    date: { type: Type.STRING },
                                    value: { type: Type.NUMBER }
                                },
                                required: ['date', 'value']
                            }
                        }
                    },
                    required: ['name', 'data']
                },
                brandInterest: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            data: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        date: { type: Type.STRING },
                                        value: { type: Type.NUMBER }
                                    },
                                    required: ['date', 'value']
                                }
                            }
                        },
                        required: ['name', 'data']
                    }
                },
                relatedTopics: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['keywordInterest', 'brandInterest', 'relatedTopics']
        }
    },
    required: ['trendsAnalysis']
};

export const contentCalendarSchema = {
    type: Type.OBJECT,
    properties: {
        calendar: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    week: { type: Type.INTEGER },
                    day: { type: Type.STRING },
                    platform: { type: Type.STRING },
                    contentFormat: { type: Type.STRING },
                    topic: { type: Type.STRING },
                },
                required: ['week', 'day', 'platform', 'contentFormat', 'topic']
            }
        }
    },
    required: ['calendar']
};
