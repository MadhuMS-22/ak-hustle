import mongoose from 'mongoose';

const round2TeamSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    teamName: {
        type: String,
        required: true
    },
    currentStep: {
        type: Number,
        default: 0
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date,
        default: null
    },
    totalTimeTaken: {
        type: Number,
        default: 0 // in seconds
    },
    isQuizCompleted: {
        type: Boolean,
        default: false
    },
    // Track attempts for each aptitude question
    aptitudeAttempts: {
        q1: { type: Number, default: 0 },
        q2: { type: Number, default: 0 },
        q3: { type: Number, default: 0 }
    },
    // Track scores for each question
    scores: {
        q1: { type: Number, default: 0 }, // Aptitude Q1
        q2: { type: Number, default: 0 }, // Aptitude Q2
        q3: { type: Number, default: 0 }, // Aptitude Q3
        q4: { type: Number, default: 0 }, // Debug Q4
        q5: { type: Number, default: 0 }, // Trace Q5
        q6: { type: Number, default: 0 }  // Program Q6
    },
    // Track which questions are unlocked
    unlockedQuestions: {
        q1: { type: Boolean, default: true },  // Always unlocked
        q2: { type: Boolean, default: false },
        q3: { type: Boolean, default: false },
        q4: { type: Boolean, default: false }, // Unlocked when Q1 is solved
        q5: { type: Boolean, default: false }, // Unlocked when Q2 is solved
        q6: { type: Boolean, default: false }  // Unlocked when Q3 is solved
    },
    // Track which questions are completed
    completedQuestions: {
        q1: { type: Boolean, default: false },
        q2: { type: Boolean, default: false },
        q3: { type: Boolean, default: false },
        q4: { type: Boolean, default: false },
        q5: { type: Boolean, default: false },
        q6: { type: Boolean, default: false }
    },
    totalScore: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for efficient queries
round2TeamSchema.index({ teamId: 1 });
round2TeamSchema.index({ teamName: 1 });

export default mongoose.model('Round2Team', round2TeamSchema);
