import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const requiredEnvVars = ['GOOGLE_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.warn(`⚠️ Missing required environment variables: ${missingEnvVars.join(', ')}`);
    if (process.env.NODE_ENV === 'production') {
        throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }
}

export const ENV = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    PORT: parseInt(process.env.PORT) || 3000,
    DB_URL: process.env.MONGODB_URI || process.env.DB_URL || 'mongodb://localhost:27017/blinc_chatbot',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100, // requests per window
    MAX_MESSAGE_LENGTH: parseInt(process.env.MAX_MESSAGE_LENGTH) || 1000,
    CACHE_TTL: parseInt(process.env.CACHE_TTL) || 60000, // 1 minute
};