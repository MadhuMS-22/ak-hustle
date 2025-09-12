import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    round2Team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Round2Team',
        required: false
    },
    questionNumber: {
        type: String,
        required: true,
        enum: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6']
    },
    questionType: {
        type: String,
        required: true,
        enum: ['aptitude', 'debug', 'trace', 'program']
    },
    step: {
        type: Number,
        required: true,
        enum: [0, 1, 2, 3] // 0=aptitude, 1=debug, 2=trace, 3=program
    },
    challengeType: {
        type: String,
        required: true,
        enum: ['aptitude', 'debug', 'trace', 'program']
    },
    originalQuestion: {
        type: String,
        required: true
    },
    userSolution: {
        type: String,
        required: true
    },
    timeTaken: {
        type: Number,
        required: true
    },
    attemptNumber: {
        type: Number,
        default: 1
    },
    isCorrect: {
        type: Boolean,
        default: false
    },
    score: {
        type: Number,
        default: 0
    },
    isAutoSaved: {
        type: Boolean,
        default: false
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
submissionSchema.index({ team: 1 });
submissionSchema.index({ round2Team: 1 });
submissionSchema.index({ questionNumber: 1 });

export default mongoose.model('Submission', submissionSchema);

