import mongoose from 'mongoose';

// Connection retry configuration
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

const connectDB = async (retryCount = 0) => {
    try {
        console.log("Mongo URI from ENV:", process.env.MONGODB_URI);

        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        // MongoDB connection options to prevent disconnections
        const options = {
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
            heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
            maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
        };

        const conn = await mongoose.connect(process.env.MONGODB_URI, options);

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to MongoDB');
        });

        mongoose.connection.on('error', (err) => {
            console.error('Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected from MongoDB');
            // Attempt to reconnect after a short delay
            setTimeout(() => {
                console.log('Attempting to reconnect to MongoDB...');
                connectDB();
            }, 5000);
        });

        // Handle reconnection
        mongoose.connection.on('reconnected', () => {
            console.log('Mongoose reconnected to MongoDB');
        });

        // Handle application termination
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('Mongoose connection closed through app termination');
            process.exit(0);
        });

        // Keep the process alive
        process.on('uncaughtException', (err) => {
            console.error('Uncaught Exception:', err);
            // Don't exit, just log the error
        });

    } catch (error) {
        console.log("Database connection error occurred");
        console.error('Database connection error:', error.message);

        // Retry connection if we haven't exceeded max retries
        if (retryCount < MAX_RETRIES) {
            console.log(`Retrying connection in ${RETRY_DELAY / 1000} seconds... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
            setTimeout(() => {
                connectDB(retryCount + 1);
            }, RETRY_DELAY);
        } else {
            console.error('Max retry attempts reached. Exiting...');
            process.exit(1);
        }
    }
};

// Connection health check function
export const checkConnection = () => {
    return mongoose.connection.readyState === 1; // 1 = connected
};

// Get connection status
export const getConnectionStatus = () => {
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    return states[mongoose.connection.readyState] || 'unknown';
};

export default connectDB;
