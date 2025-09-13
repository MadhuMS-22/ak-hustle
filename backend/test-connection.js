import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config.env' });

const testConnection = async () => {
    try {
        console.log('Testing MongoDB connection...');
        console.log('MongoDB URI:', process.env.MONGODB_URI);

        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            heartbeatFrequencyMS: 10000,
            maxIdleTimeMS: 30000,
        };

        await mongoose.connect(process.env.MONGODB_URI, options);
        console.log('✅ MongoDB connection successful!');

        // Test a simple operation
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📊 Available collections:', collections.map(c => c.name));

        // Check connection state
        console.log('🔗 Connection state:', mongoose.connection.readyState);
        console.log('🏠 Host:', mongoose.connection.host);
        console.log('📝 Database:', mongoose.connection.name);

        // Close connection
        await mongoose.connection.close();
        console.log('✅ Connection test completed successfully!');

    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        process.exit(1);
    }
};

testConnection();
