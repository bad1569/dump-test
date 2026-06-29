import { ai, getRelevantContext } from '../config/genkit.js';
import { ENV } from '../config/env.js';

const rateLimitStore = new Map();

const getRateLimitInfo = (ip) => {
    const now = Date.now();
    const record = rateLimitStore.get(ip);

    if (!record) {
        return { count: 0, resetTime: now + ENV.RATE_LIMIT_WINDOW };
    }

    if (now > record.resetTime) {
        rateLimitStore.delete(ip);
        return { count: 0, resetTime: now + ENV.RATE_LIMIT_WINDOW };
    }

    return record;
};

const updateRateLimit = (ip) => {
    const now = Date.now();
    const record = rateLimitStore.get(ip);

    if (!record || now > record.resetTime) {
        rateLimitStore.set(ip, {
            count: 1,
            resetTime: now + ENV.RATE_LIMIT_WINDOW
        });
        return { count: 1, resetTime: now + ENV.RATE_LIMIT_WINDOW };
    }

    record.count++;
    rateLimitStore.set(ip, record);
    return record;
};

setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitStore) {
        if (now > record.resetTime) {
            rateLimitStore.delete(ip);
        }
    }
}, 60000);

const formatBulletPoints = (text) => {
    if (!text) return text;

    let result = text.replace(/:\s*([-•*])\s+(?=[A-Za-z0-9])/g, ':\n$1 ');

    result = result.replace(/ ([-•*]) (?=[A-Za-z0-9])/g, (match, marker, offset, str) => {
        const prevChar = str[offset - 1];
        if (prevChar === '\n') return match;
        return '\n' + marker + ' ';
    });

    result = result
        .replace(/^[ \t]*•[ \t]*/gm, '§B§')
        .replace(/^[ \t]*\*[ \t]*/gm, '§B§')
        .replace(/^[ \t]*-[ \t]*/gm, '§B§');

    const lines = result
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .map(l => l.startsWith('§B§') ? '• ' + l.slice(3) : l);

    return lines.join('\n').trim();
};

const countWords = (text) => text.trim().split(/\s+/).filter(Boolean).length;

const SYSTEM_PROMPT_TEMPLATE = (context) => `You are the official BLINC Assistant AI for BLINC Technologies.

CRITICAL RULES:
1. IDENTITY: If asked who you are, state you are the BLINC Assistant AI.
2. CORE FOCUS: Answer questions about BLINC Technologies, its internship program (BLIP), and Cryptosavers Club.
3. NO OFF-TOPIC: Politely refuse math, general coding, or questions unrelated to BLINC or Cryptosavers. Say you only handle BLINC and Cryptosavers inquiries.
4. USE PROVIDED KNOWLEDGE ONLY: Do not answer from general knowledge. Only use the knowledge section below.
5. MISSING INFO: If the answer is not in the knowledge below, say exactly: "I do not have that information."

FORMAT RULES — FOLLOW EXACTLY:
- Responses must be 60–150 words. Write complete sentences; never cut off mid-sentence.
- When listing two or more items, place EACH item on its OWN separate line starting with "•".
- NEVER put two or more bullet items on the same line.
- NEVER use dashes (-) or numbers for lists. Use only "•".
- When a sentence introduces a list with a colon, the first bullet MUST be on a NEW line after the colon.
- No filler phrases. Be direct and clear.

CORRECT format when a list follows a sentence:
The available positions include:
- Web Development
- UI/UX Design
- Quality Assurance and Testing

WRONG format (never do this):
The available positions include: • Web Development • UI/UX Design • Quality Assurance and Testing

KNOWLEDGE:
${context || 'No specific context found. Answer only about BLINC Technologies, BLIP internship, or Cryptosavers Club.'}`;

const getConciseResponse = async (message, context, maxAttempts = 2) => {
    const systemPrompt = SYSTEM_PROMPT_TEMPLATE(context);
    let response = null;
    let lastError = null;
    let attempts = 0;

    while (attempts < maxAttempts) {
        const userPrompt = attempts === 0
            ? message
            : `Your previous answer was too long. Answer again in under 150 words, same rules apply: ${message}`;

        try {
            const result = await ai.generate({
                model: 'googleai/gemini-2.5-flash',
                system: systemPrompt,
                messages: [{
                    role: 'user',
                    content: [{ text: userPrompt }]
                }],
                config: {
                    temperature: attempts === 0 ? 0.2 : 0.1,
                }
            });

            const formatted = formatBulletPoints(result.text);

            if (countWords(formatted) <= 160) {
                response = formatted;
                break;
            }
        } catch (error) {
            console.error(`AI generation failed on attempt ${attempts + 1}:`, error.message);
            lastError = error;
        }

        attempts++;
    }

    if (response) return response;
    if (lastError) throw lastError;

    try {
        const summaryResult = await ai.generate({
            model: 'googleai/gemini-2.5-flash',
            system: 'Summarize the following in under 150 words. Use "•" for bullet points, one per line, always on a new line after any introducing colon. Write complete sentences only.',
            messages: [{
                role: 'user',
                content: [{ text: message }]
            }],
            config: { temperature: 0.1 }
        });
        return formatBulletPoints(summaryResult.text);
    } catch (e) {
        return "I apologize, but I'm having trouble providing a response right now. Please try rephrasing your question.";
    }
};

export const handleChat = async (req, res) => {
    const { message } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

    try {
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                reply: "Message is required and must be a string.",
                error: 'INVALID_INPUT'
            });
        }

        const trimmedMessage = message.trim();
        if (trimmedMessage.length === 0) {
            return res.status(400).json({
                reply: "Message cannot be empty.",
                error: 'EMPTY_MESSAGE'
            });
        }

        if (trimmedMessage.length > ENV.MAX_MESSAGE_LENGTH) {
            return res.status(400).json({
                reply: `Message exceeds maximum length of ${ENV.MAX_MESSAGE_LENGTH} characters.`,
                error: 'MESSAGE_TOO_LONG'
            });
        }

        const rateInfo = getRateLimitInfo(clientIp);
        if (rateInfo.count >= ENV.RATE_LIMIT_MAX) {
            const resetTime = new Date(rateInfo.resetTime).toISOString();
            return res.status(429).json({
                reply: `Rate limit exceeded. Please try again after ${resetTime}.`,
                error: 'RATE_LIMIT_EXCEEDED',
                resetTime
            });
        }
        updateRateLimit(clientIp);

        const context = await getRelevantContext(trimmedMessage);
        const reply = await getConciseResponse(trimmedMessage, context);

        console.log(`Chat request from ${clientIp}:`, {
            messageLength: trimmedMessage.length,
            contextUsed: !!context,
            responseLength: reply.length,
            wordCount: countWords(reply),
            timestamp: new Date().toISOString()
        });

        res.json({
            reply,
            source: 'knowledge-base',
            contextUsed: !!context,
            wordCount: countWords(reply),
            provider: 'gemini',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("Controller Error:", error);

        if (error.message?.includes('API key') || error.message?.includes('GOOGLE_API_KEY')) {
            return res.status(503).json({
                reply: "The AI service is temporarily unavailable. Please try again later.",
                error: 'AI_SERVICE_ERROR'
            });
        }

        if (error.message?.includes('model') || error.message?.includes('Model')) {
            return res.status(503).json({
                reply: "The AI model is currently unavailable. Please try again later.",
                error: 'MODEL_UNAVAILABLE'
            });
        }

        res.status(500).json({
            reply: "I am currently undergoing maintenance. Please try again later.",
            error: 'INTERNAL_SERVER_ERROR',
            timestamp: new Date().toISOString()
        });
    }
};