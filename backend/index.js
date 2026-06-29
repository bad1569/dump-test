import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { connectDB, getDBStatus } from './config/database.js';
import { loadKnowledgeFromDB, getCacheStatus, getAIStatus } from './config/genkit.js';
import { ENV } from './config/env.js';

dotenv.config();

const app = express();
const PORT = ENV.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

app.get('/ai-status', async (req, res) => {
    try {
        const status = getAIStatus();

        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            provider: {
                gemini: {
                    available: !!ENV.GOOGLE_API_KEY,
                    initialized: status.isInitialized || false,
                    hasApiKey: status.hasApiKey || false,
                    apiKeyPrefix: status.apiKeyPrefix || null,
                    model: status.model || 'gemini-2.5-flash',
                }
            },
            activeProvider: 'gemini',
            ai: status,
        });
    } catch (error) {
        console.error('Error getting AI status:', error);
        res.status(500).json({
            status: 'ERROR',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.get('/health', async (req, res) => {
    try {
        const dbStatus = getDBStatus();
        const cacheStatus = getCacheStatus();

        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            environment: ENV.NODE_ENV,
            port: PORT,
            database: dbStatus,
            cache: cacheStatus,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: '1.0.0'
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.get('/', (req, res) => {
    res.json({
        name: 'BLINC Chatbot API',
        version: '1.0.0',
        status: 'operational',
        timestamp: new Date().toISOString()
    });
});

app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
    });
});

app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    const isDevelopment = ENV.NODE_ENV === 'development';
    res.status(err.status || 500).json({
        error: isDevelopment ? err.message : 'Internal server error',
        ...(isDevelopment && { stack: err.stack }),
        timestamp: new Date().toISOString()
    });
});

const startServer = async () => {
    try {
        await connectDB();
        console.log('MongoDB Connected');

        await loadKnowledgeFromDB();
        console.log('Knowledge Cache Loaded');

        const cacheInfo = getCacheStatus();
        if (cacheInfo.sections.length > 0) {
            console.log(`Knowledge Sections: ${cacheInfo.sections.join(', ')}`);
        } else {
            console.log('No knowledge found in database');
            console.log('Use Admin API to add knowledge: PUT /api/admin/knowledge/:section');
        }

        if (!process.env.VERCEL) {
            app.listen(PORT, () => {
                console.log(`\n🚀 BLINC Server running on port ${PORT}`);
                console.log(`Environment: ${ENV.NODE_ENV || 'development'}`);
                console.log(`\n API Endpoints:`);
                console.log(`   - Health:        http://localhost:${PORT}/health`);
                console.log(`   - Chat:          http://localhost:${PORT}/api/chat`);
                console.log(`   - Admin:         http://localhost:${PORT}/api/admin/knowledge`);
                console.log(`   - AI Status:     http://localhost:${PORT}/ai-status`);
            });
        }
    } catch (error) {
        console.error('Failed to start server:', error);
        if (!process.env.VERCEL) {
            process.exit(1);
        }
    }
};

let initializationPromise = null;

export const initializeServer = async () => {
    if (!initializationPromise) {
        initializationPromise = startServer();
    }
    return initializationPromise;
};

if (!process.env.VERCEL) {
    initializeServer().catch((error) => {
        console.error('Server initialization failed:', error);
        process.exit(1);
    });
}

export default app;