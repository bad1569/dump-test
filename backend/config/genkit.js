import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import dotenv from 'dotenv';
import { KnowledgeModel } from '../models/knowledgeModel.js';
import { ENV } from './env.js';

dotenv.config();

export const ai = genkit({
    plugins: [googleAI({ apiKey: ENV.GOOGLE_API_KEY })],
    enableTracingAndMetrics: ENV.NODE_ENV === 'development',
});

let knowledgeCache = null;
let cacheTimestamp = null;
let cacheVersion = 0;
const CACHE_TTL = ENV.CACHE_TTL || 60000;

export const loadKnowledgeFromDB = async () => {
    try {
        const knowledge = await KnowledgeModel.getAsObject();
        knowledgeCache = knowledge;
        cacheTimestamp = new Date();
        cacheVersion++;
        console.log('Knowledge loaded from MongoDB');
        console.log(`Sections loaded: ${Object.keys(knowledge).join(', ') || 'None'}`);
        return knowledge;
    } catch (error) {
        console.error('Failed to load knowledge from MongoDB:', error);
        return {};
    }
};

export const getKnowledge = async () => {
    if (knowledgeCache && cacheTimestamp) {
        const now = new Date();
        const age = now - cacheTimestamp;
        if (age < CACHE_TTL) {
            return knowledgeCache;
        }
    }
    return await loadKnowledgeFromDB();
};


const SECTION_AFFINITY = {
    company: [
        'company', 'blinc', 'about', 'who', 'what is blinc',
        'vision', 'mission', 'culture', 'location', 'founded',
        'blockchain', 'services', 'consulting', 'baguio'
    ],
    cryptosavers: [
        'cryptosavers', 'crypto', 'savings', 'cryptocurrency',
        'wallet', 'cwallet', 'csc', 'kyc', 'defi', 'token',
        'ethereum', 'gdpr', 'ccpa', 'cookies', 'privacy'
    ],
    internship: [
        'internship', 'intern', 'blip', 'apply', 'application',
        'requirements', 'positions', 'duration', 'hours', 'onboarding',
        'nda', 'moa', 'interview', 'certificate', 'endorsement'
    ],
    faq: [
        'faq', 'question', 'frequently', 'asked'
    ]
};

export const retrieveContext = async (query) => {
    const results = [];

    try {
        const knowledgeBase = await getKnowledge();

        if (!knowledgeBase || Object.keys(knowledgeBase).length === 0) {
            console.warn('No knowledge found in database');
            return results;
        }

        const sections = Object.entries(knowledgeBase).map(([key, data]) => ({ key, data }));

        const normalizedQuery = query.toLowerCase().replace(/[^\w\s]/g, ' ');
        const queryWords = normalizedQuery
            .split(' ')
            .filter(word => word.length > 2);

        if (queryWords.length === 0) {
            return results;
        }

        for (const section of sections) {
            if (!section.data) continue;

            const sectionStr = JSON.stringify(section.data).toLowerCase();

            let relevance = 0;
            for (const word of queryWords) {
                if (sectionStr.includes(word)) {
                    relevance++;
                }
            }

            const affinityKeywords = SECTION_AFFINITY[section.key] || [];
            for (const keyword of affinityKeywords) {
                if (normalizedQuery.includes(keyword)) {
                    relevance += 5; 
                }
            }

            if (relevance > 0) {
                results.push({
                    section: section.key,
                    relevance,
                    data: section.data
                });
            }
        }

        results.sort((a, b) => b.relevance - a.relevance);

        console.log('Context scores:', results.map(r => `${r.section}:${r.relevance}`).join(', '));

        return results.slice(0, 3);
    } catch (error) {
        console.error('Error retrieving context:', error);
        return results;
    }
};

const formatArrayAsBullets = (arr, indent = '') => {
    if (!Array.isArray(arr)) return '';
    return arr.map(item => `${indent}- ${item}`).join('\n');
};

const formatContextData = (data, depth = 0) => {
    if (typeof data === 'string') return data;
    if (typeof data === 'number' || typeof data === 'boolean') return String(data);

    if (Array.isArray(data)) {
        return formatArrayAsBullets(data);
    }

    if (typeof data === 'object' && data !== null) {
        let result = '';
        const indent = '  '.repeat(depth);

        for (const [key, value] of Object.entries(data)) {
            if (value === null || value === undefined) continue;

            const formattedKey = key.replace(/_/g, ' ').toUpperCase();

            if (Array.isArray(value)) {
                result += `${indent}${formattedKey}:\n`;
                result += formatArrayAsBullets(value, indent + '  ');
                result += '\n\n';
            } else if (typeof value === 'object' && value !== null) {
                if (value.step && value.name) {
                    result += `${indent}- Step ${value.step}: ${value.name} - ${value.description || ''}\n`;
                } else {
                    result += `${indent}${formattedKey}:\n`;
                    result += formatContextData(value, depth + 1);
                    result += '\n';
                }
            } else {
                if (String(value).trim()) {
                    result += `${indent}${formattedKey}: ${value}\n`;
                }
            }
        }
        return result;
    }

    return String(data);
};

export const getRelevantContext = async (query) => {
    try {
        const context = await retrieveContext(query);

        if (context.length === 0) {
            return null;
        }

        const MAX_CONTEXT_CHARS = 2500;
        let contextString = '';

        for (const item of context) {
            const sectionLabel = item.section.toUpperCase();
            contextString += `### ${sectionLabel} ###\n`;

            const formattedData = formatContextData(item.data);
            contextString += formattedData || 'No data available';
            contextString += '\n\n';

            if (contextString.length > MAX_CONTEXT_CHARS) {
                contextString = contextString.substring(0, MAX_CONTEXT_CHARS) + '\n...[Context truncated]';
                break;
            }
        }

        contextString = contextString
            .replace(/\n{4,}/g, '\n\n')
            .trim();

        return contextString || null;
    } catch (error) {
        console.error('Error getting relevant context:', error);
        return null;
    }
};

export const refreshKnowledgeCache = async () => {
    const oldVersion = cacheVersion;
    await loadKnowledgeFromDB();
    console.log(`🔄 Cache refreshed from version ${oldVersion} to ${cacheVersion}`);
    return {
        success: true,
        oldVersion,
        newVersion: cacheVersion,
        sections: Object.keys(knowledgeCache || {})
    };
};

export const getCacheStatus = () => {
    const now = new Date();
    return {
        isCached: knowledgeCache !== null,
        timestamp: cacheTimestamp,
        age: cacheTimestamp ? now - cacheTimestamp : null,
        sections: knowledgeCache ? Object.keys(knowledgeCache) : [],
        version: cacheVersion,
        isFresh: cacheTimestamp ? (now - cacheTimestamp) < CACHE_TTL : false
    };
};

export const getAIStatus = () => {
    return {
        isInitialized: !!ai,
        provider: 'Google AI',
        model: 'gemini-2.5-flash',
        hasApiKey: !!ENV.GOOGLE_API_KEY,
        apiKeyPrefix: ENV.GOOGLE_API_KEY ? ENV.GOOGLE_API_KEY.substring(0, 10) + '...' : null,
        activeProvider: 'gemini'
    };
};