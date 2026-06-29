import { pipeline, env } from '@huggingface/transformers';
import { ai as genkitAI } from './genkit.js';
import { ENV } from './env.js';

env.allowLocalModels = true;
env.allowRemoteModels = true;
env.localModelPath = './models/';

class AIService {
    constructor() {
        this.generator = null;
        this.modelLoaded = false;
        this.useLocalAI = ENV.USE_LOCAL_AI !== 'false';
        this.modelName = ENV.LOCAL_MODEL || 'onnx-community/Llama-3.2-1B-Instruct';
        this.currentProvider = 'gemini';
        this.modelLoading = false;
    }

    async initLocalModel() {
        if (this.modelLoaded) return true;
        if (this.modelLoading) {
            return new Promise((resolve) => {
                const checkLoaded = setInterval(() => {
                    if (this.modelLoaded) {
                        clearInterval(checkLoaded);
                        resolve(true);
                    }
                }, 500);
            });
        }

        this.modelLoading = true;
        try {
            console.log(`Loading local model: ${this.modelName}...`);
            console.log('This may take a moment on first run (downloading model)...');

            this.generator = await pipeline(
                'text-generation',
                this.modelName,
                {
                    device: 'cpu',
                    dtype: 'q4',
                    progress_callback: (progress) => {
                        if (progress.status === 'downloading') {
                            console.log(`📥 Downloading: ${Math.round(progress.progress * 100)}%`);
                        }
                    }
                }
            );

            this.modelLoaded = true;
            this.currentProvider = 'local';
            console.log('Local AI model loaded successfully');
            this.modelLoading = false;
            return true;
        } catch (error) {
            console.error('Failed to load local model:', error.message);
            this.modelLoaded = false;
            this.currentProvider = 'gemini';
            this.modelLoading = false;
            return false;
        }
    }

    async generateLocalResponse(systemPrompt, userMessage, config = {}) {
        if (!this.modelLoaded) {
            const loaded = await this.initLocalModel();
            if (!loaded) {
                throw new Error('Local model not available');
            }
        }

        const context = systemPrompt
            .split('\n')
            .filter(line => {
                const trimmed = line.trim();
                return trimmed && 
                       !trimmed.startsWith('CRITICAL RULES:') &&
                       !trimmed.startsWith('CONCISENESS RULES') &&
                       !trimmed.startsWith('FORMAT EXAMPLE') &&
                       !trimmed.startsWith('WRONG format') &&
                       !trimmed.startsWith('Correct bullet') &&
                       !trimmed.startsWith('---');
            })
            .slice(0, 10)
            .join(' ')
            .substring(0, 500);

        const fullPrompt = `Context: ${context}

Question: ${userMessage}

Provide a short, concise answer with bullet points if listing items. Keep it brief.

Answer:`;

        const result = await this.generator(fullPrompt, {
            max_new_tokens: config.maxNewTokens || 150,
            temperature: config.temperature || 0.2,
            top_p: config.topP || 0.9,
            do_sample: true,
        });

        let generatedText = result[0]?.generated_text || '';
        
        if (generatedText.includes('Answer:')) {
            generatedText = generatedText.split('Answer:')[1]?.trim() || generatedText;
        }
        
        const endMarkers = ['Context:', 'Question:', 'Answer:', 'Note:', '---', '```'];
        for (const marker of endMarkers) {
            if (generatedText.includes(marker)) {
                generatedText = generatedText.split(marker)[0].trim();
            }
        }

        generatedText = generatedText
            .replace(/^As an AI.*?[,.]/i, '')
            .replace(/^I don't have.*?[,.]/i, '')
            .replace(/^As a language model.*?[,.]/i, '')
            .replace(/^I'm an AI.*?[,.]/i, '')
            .replace(/Note:.*$/s, '')
            .replace(/---/g, '')
            .replace(/\[.*?\]/g, '')
            .replace(/\d+\.\s*/g, '')
            .replace(/\s{2,}/g, ' ')
            .trim();

        const words = generatedText.split(/\s+/);
        if (words.length > 200) {
            const truncated = words.slice(0, 150).join(' ');
            const lastPeriod = truncated.lastIndexOf('.');
            const lastNewline = truncated.lastIndexOf('\n');
            const cutPoint = Math.max(lastPeriod, lastNewline);
            generatedText = cutPoint > 0 ? truncated.substring(0, cutPoint + 1) : truncated + '...';
        }

        generatedText = generatedText
            .replace(/([^.\n])(\s*[-•*]\s*)/g, '$1\n$2')
            .replace(/[•*]/g, '-')
            .replace(/- /g, '\n- ')
            .replace(/^\n/, '')
            .trim();

        if (!generatedText || generatedText.length < 10 || generatedText.includes('language model')) {
            generatedText = "The BLINC internship program offers positions in Virtual Assistance, Web Development, and Design. Requirements include:\n- Currently enrolled in related Bachelor's program\n- Basic technical skills\n- Strong communication skills\n\nFor more details, please contact our recruitment team.";
        }

        return { text: generatedText };
    }

    async generate(options) {
        const { system, messages, config = {} } = options;
        const userMessage = messages?.find(m => m.role === 'user')?.content?.[0]?.text || '';

        if (this.useLocalAI) {
            try {
                console.log('Using local model...');
                const response = await this.generateLocalResponse(system, userMessage, {
                    temperature: config.temperature || 0.2,
                    maxNewTokens: config.maxNewTokens || 150,
                });
                this.currentProvider = 'local';
                return response;
            } catch (localError) {
                console.warn('Local AI failed, falling back to Gemini:', localError.message);
                this.currentProvider = 'gemini';
            }
        }

        console.log('Using Gemini API...');
        try {
            const result = await genkitAI.generate({
                model: options.model || 'googleai/gemini-2.5-flash',
                system: system,
                messages: messages,
                config: {
                    temperature: config.temperature || 0.3,
                    ...config
                }
            });
            this.currentProvider = 'gemini';
            return result;
        } catch (geminiError) {
            if (this.useLocalAI) {
                console.warn('Gemini failed, attempting local fallback...');
                try {
                    const response = await this.generateLocalResponse(system, userMessage, {
                        temperature: 0.2,
                        maxNewTokens: 150,
                    });
                    this.currentProvider = 'local';
                    return response;
                } catch (finalError) {
                    console.error('Both providers failed:', finalError.message);
                    throw finalError;
                }
            }
            throw geminiError;
        }
    }

    getStatus() {
        return {
            currentProvider: this.currentProvider,
            localModelLoaded: this.modelLoaded,
            useLocalAI: this.useLocalAI,
            modelName: this.modelName,
            geminiAvailable: !!genkitAI,
            modelLoading: this.modelLoading,
        };
    }

    async toggleProvider(useLocal) {
        this.useLocalAI = useLocal;
        if (useLocal && !this.modelLoaded) {
            await this.initLocalModel();
        }
        return this.getStatus();
    }

    async reloadLocalModel() {
        this.modelLoaded = false;
        this.modelLoading = false;
        this.generator = null;
        return await this.initLocalModel();
    }
}

const aiService = new AIService();

if (ENV.USE_LOCAL_AI !== 'false') {
    aiService.initLocalModel().catch(err => {
        console.warn('Background model loading failed:', err.message);
        console.log('The chatbot will use Gemini API instead.');
    });
}

export { aiService };