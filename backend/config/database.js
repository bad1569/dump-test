import mongoose from 'mongoose';
import { ENV } from './env.js';

let isConnected = false;
let connectionPromise = null;

export const connectDB = async () => {
    try {
        if (isConnected && mongoose.connection.readyState === 1) {
            console.log('MongoDB is Connected');
            return mongoose.connection;
        }

        if (connectionPromise) {
            return connectionPromise;
        }

        connectionPromise = mongoose.connect(ENV.DB_URL, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4, 
        });

        const conn = await connectionPromise;
        
        isConnected = true;
        console.log(`Connected to MongoDB: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
        
        connectionPromise = null;
        return conn;
    } catch (error) {
        connectionPromise = null;
        console.error("MONGODB Connection error:", error);
        throw error; 
    }
};

export const closeDB = async () => {
    try {
        if (isConnected && mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            isConnected = false;
            connectionPromise = null;
            console.log('MongoDB connection closed');
        }
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
    }
};

export const getConnection = () => {
    if (!isConnected || mongoose.connection.readyState !== 1) {
        throw new Error('Database not connected. Call connectDB first.');
    }
    return mongoose.connection;
};

export const getDBStatus = () => {
    return {
        isConnected,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host || 'Not connected',
        database: mongoose.connection.name || 'Not connected'
    };
};

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
    isConnected = false;
    connectionPromise = null;
});

mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
    isConnected = true;
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});


process.on('SIGINT', async () => {
    await closeDB();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await closeDB();
    process.exit(0);
});