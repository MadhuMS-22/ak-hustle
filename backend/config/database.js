import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        console.log("Mongo URI from ENV:", process.env.MONGODB_URI);
        
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log("Database connection error occurred");
        console.error('Database connection error:', error.message);
        process.exit(1);
    }
};

export default connectDB;
