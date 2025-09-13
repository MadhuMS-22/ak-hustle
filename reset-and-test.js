import mongoose from 'mongoose';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hustel', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Import models
const Team = mongoose.model('Team', new mongoose.Schema({
    teamName: String,
    members: {
        member1: { name: String, email: String },
        member2: { name: String, email: String }
    },
    leader: String,
    leaderPhone: String,
    password: String,
    isActive: { type: Boolean, default: true },
    registrationDate: { type: Date, default: Date.now },
    lastLogin: Date,
    competitionStatus: {
        type: String,
        enum: ['Registered', 'Round1', 'Round2', 'Round3', 'Eliminated', 'Selected'],
        default: 'Registered'
    },
    hasCompletedCycle: { type: Boolean, default: false },
    resultsAnnounced: { type: Boolean, default: false },
    scores: {
        round1: { type: Number, default: 0 },
        round2: { type: Number, default: 0 },
        round3: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    round3Score: { type: Number, default: 0 },
    round3Time: { type: Number, default: 0 },
    round3Program: { type: String, default: '' },
    round3QuestionOrder: { type: Number, default: null },
    round3QuestionOrderName: { type: String, default: '' },
    round3QuestionResults: [{
        questionIndex: Number,
        blockIndex: Number,
        selectedAnswer: String,
        isCorrect: Boolean,
        timeTaken: Number
    }],
    round3IndividualScores: [{
        questionIndex: Number,
        score: Number,
        timeTaken: Number
    }],
    round3Completed: { type: Boolean, default: false },
    round3SubmittedAt: Date
}));

const Submission = mongoose.model('Submission', new mongoose.Schema({
    teamId: String,
    round: Number,
    score: Number,
    submittedAt: { type: Date, default: Date.now }
}));

const RoundCodes = mongoose.model('RoundCodes', new mongoose.Schema({
    round: { type: Number, required: true },
    code: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
    completionCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}));

// Reset all data
const resetAllData = async () => {
    try {
        console.log('🔄 Starting data reset...');

        // Clear all existing data
        await Team.deleteMany({});
        await Submission.deleteMany({});
        await RoundCodes.deleteMany({});

        console.log('✅ Cleared all existing data');

        // Create sample teams for testing
        const sampleTeams = [
            {
                teamName: "Team Alpha",
                members: {
                    member1: { name: "John Doe", email: "john@example.com" },
                    member2: { name: "Jane Smith", email: "jane@example.com" }
                },
                leader: "member1",
                leaderPhone: "+1234567890",
                password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
                competitionStatus: "Registered",
                hasCompletedCycle: false,
                resultsAnnounced: false,
                scores: { round1: 0, round2: 0, round3: 0, total: 0 },
                isActive: true
            },
            {
                teamName: "Team Beta",
                members: {
                    member1: { name: "Alice Johnson", email: "alice@example.com" },
                    member2: { name: "Bob Wilson", email: "bob@example.com" }
                },
                leader: "member2",
                leaderPhone: "+1234567891",
                password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
                competitionStatus: "Registered",
                hasCompletedCycle: false,
                resultsAnnounced: false,
                scores: { round1: 0, round2: 0, round3: 0, total: 0 },
                isActive: true
            },
            {
                teamName: "Team Gamma",
                members: {
                    member1: { name: "Charlie Brown", email: "charlie@example.com" },
                    member2: { name: "Diana Prince", email: "diana@example.com" }
                },
                leader: "member1",
                leaderPhone: "+1234567892",
                password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
                competitionStatus: "Registered",
                hasCompletedCycle: false,
                resultsAnnounced: false,
                scores: { round1: 0, round2: 0, round3: 0, total: 0 },
                isActive: true
            },
            {
                teamName: "Team Delta",
                members: {
                    member1: { name: "Eve Adams", email: "eve@example.com" },
                    member2: { name: "Frank Miller", email: "frank@example.com" }
                },
                leader: "member2",
                leaderPhone: "+1234567893",
                password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
                competitionStatus: "Registered",
                hasCompletedCycle: false,
                resultsAnnounced: false,
                scores: { round1: 0, round2: 0, round3: 0, total: 0 },
                isActive: true
            },
            {
                teamName: "Team Echo",
                members: {
                    member1: { name: "Grace Lee", email: "grace@example.com" },
                    member2: { name: "Henry Kim", email: "henry@example.com" }
                },
                leader: "member1",
                leaderPhone: "+1234567894",
                password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
                competitionStatus: "Registered",
                hasCompletedCycle: false,
                resultsAnnounced: false,
                scores: { round1: 0, round2: 0, round3: 0, total: 0 },
                isActive: true
            }
        ];

        const createdTeams = await Team.insertMany(sampleTeams);
        console.log(`✅ Created ${createdTeams.length} sample teams`);

        console.log('\n🎉 Data reset completed successfully!');
        console.log('\n📋 Test Data Summary:');
        console.log('- All teams reset to "Registered" status');
        console.log('- All submissions cleared');
        console.log('- All round codes cleared');
        console.log('- 5 sample teams created for testing');

        console.log('\n🔑 Test Credentials:');
        console.log('┌─────────────┬─────────────────────┬──────────┐');
        console.log('│ Team Name   │ Email               │ Password │');
        console.log('├─────────────┼─────────────────────┼──────────┤');
        console.log('│ Team Alpha  │ john@example.com    │ password │');
        console.log('│ Team Beta   │ alice@example.com   │ password │');
        console.log('│ Team Gamma  │ charlie@example.com │ password │');
        console.log('│ Team Delta  │ eve@example.com     │ password │');
        console.log('│ Team Echo   │ grace@example.com   │ password │');
        console.log('└─────────────┴─────────────────────┴──────────┘');

        console.log('\n🧪 Testing Instructions:');
        console.log('1. Backend will start on http://localhost:5009');
        console.log('2. Frontend will start on http://localhost:5173');
        console.log('3. Admin login: Use admin credentials');
        console.log('4. Team login: Use any team credentials above');
        console.log('5. Test the two-step flow: Advance teams → Announce results');
        console.log('\n⚠️  Note: If admin section shows old data:');
        console.log('   - Click "Reset Announced Rounds" button in admin dashboard');
        console.log('   - Or refresh the page to reload fresh data');

    } catch (error) {
        console.error('❌ Error resetting data:', error);
    }
};

// Start backend server
const startBackend = () => {
    console.log('\n🚀 Starting backend server...');
    const backend = spawn('npm', ['start'], {
        cwd: path.join(__dirname, 'backend'),
        stdio: 'pipe',
        shell: true
    });

    backend.stdout.on('data', (data) => {
        console.log(`[Backend] ${data.toString().trim()}`);
    });

    backend.stderr.on('data', (data) => {
        console.error(`[Backend Error] ${data.toString().trim()}`);
    });

    return backend;
};

// Start frontend server
const startFrontend = () => {
    console.log('\n🚀 Starting frontend server...');
    const frontend = spawn('npm', ['run', 'dev'], {
        cwd: path.join(__dirname, 'frontend'),
        stdio: 'pipe',
        shell: true
    });

    frontend.stdout.on('data', (data) => {
        console.log(`[Frontend] ${data.toString().trim()}`);
    });

    frontend.stderr.on('data', (data) => {
        console.error(`[Frontend Error] ${data.toString().trim()}`);
    });

    return frontend;
};

// Main function
const main = async () => {
    try {
        console.log('🎯 Hustel Competition - Reset & Test Script');
        console.log('==========================================\n');

        // Connect to database and reset data
        await connectDB();
        await resetAllData();
        await mongoose.connection.close();

        // Start servers
        const backend = startBackend();
        const frontend = startFrontend();

        console.log('\n✅ Both servers are starting...');
        console.log('📱 Frontend: http://localhost:5173');
        console.log('🔧 Backend: http://localhost:5009');
        console.log('\n⏹️  Press Ctrl+C to stop both servers');

        // Handle process termination
        process.on('SIGINT', () => {
            console.log('\n🛑 Stopping servers...');
            backend.kill();
            frontend.kill();
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

// Run the script
main();
