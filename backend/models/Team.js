import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const teamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: [true, 'Team name is required'],
        trim: true,
        minlength: [3, 'Team name must be at least 3 characters long'],
        maxlength: [50, 'Team name cannot exceed 50 characters']
    },
    members: {
        member1: {
            name: {
                type: String,
                required: [true, 'Member 1 name is required'],
                trim: true,
                maxlength: [50, 'Member name cannot exceed 50 characters']
            },
            email: {
                type: String,
                required: [true, 'Member 1 email is required'],
                trim: true,
                lowercase: true,
                match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
            }
        },
        member2: {
            name: {
                type: String,
                required: [true, 'Member 2 name is required'],
                trim: true,
                maxlength: [50, 'Member name cannot exceed 50 characters']
            },
            email: {
                type: String,
                required: [true, 'Member 2 email is required'],
                trim: true,
                lowercase: true,
                match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
            }
        }
    },
    leader: {
        type: String,
        required: [true, 'Team leader must be selected'],
        enum: ['member1', 'member2'],
        default: 'member1'
    },
    leaderPhone: {
        type: String,
        required: [true, 'Leader phone number is required'],
        trim: true,
        match: [/^\+?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false // Don't include password in queries by default
    },
    isActive: {
        type: Boolean,
        default: true
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    },
    competitionStatus: {
        type: String,
        enum: ['Registered', 'Round1', 'Round2', 'Round3', 'Eliminated', 'Selected'],
        default: 'Registered'
    },
    hasCompletedCycle: {
        type: Boolean,
        default: false
    },
    resultsAnnounced: {
        type: Boolean,
        default: false
    },
    scores: {
        round1: {
            type: Number,
            default: 0
        },
        round2: {
            type: Number,
            default: 0
        },
        round3: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            default: 0
        }
    },
    // Round 3 specific fields
    round3Score: {
        type: Number,
        default: 0
    },
    round3Time: {
        type: Number,
        default: 0
    },
    round3Program: {
        type: String,
        default: ''
    },
    round3QuestionOrder: {
        type: Number,
        default: null
    },
    round3QuestionOrderName: {
        type: String,
        default: ''
    },
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
    round3Completed: {
        type: Boolean,
        default: false
    },
    round3SubmittedAt: {
        type: Date
    },
    // Quiz/Round 2 specific fields
    startTime: {
        type: Date,
        default: null
    },
    endTime: {
        type: Date,
        default: null
    },
    totalTimeTaken: {
        type: Number,
        default: 0
    },
    isQuizCompleted: {
        type: Boolean,
        default: false
    },
    totalScore: {
        type: Number,
        default: 0
    },
    unlockedQuestions: {
        q1: { type: Boolean, default: true },
        q2: { type: Boolean, default: false },
        q3: { type: Boolean, default: false },
        q4: { type: Boolean, default: false },
        q5: { type: Boolean, default: false },
        q6: { type: Boolean, default: false }
    },
    completedQuestions: {
        q1: { type: Boolean, default: false },
        q2: { type: Boolean, default: false },
        q3: { type: Boolean, default: false },
        q4: { type: Boolean, default: false },
        q5: { type: Boolean, default: false },
        q6: { type: Boolean, default: false }
    },
    scores: {
        q1: { type: Number, default: 0 },
        q2: { type: Number, default: 0 },
        q3: { type: Number, default: 0 },
        q4: { type: Number, default: 0 },
        q5: { type: Number, default: 0 },
        q6: { type: Number, default: 0 }
    },
    aptitudeAttempts: {
        q1: { type: Number, default: 0 },
        q2: { type: Number, default: 0 },
        q3: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

// Index for faster queries
teamSchema.index({ teamName: 1 }, { unique: true });
teamSchema.index({ 'members.member1.email': 1 });
teamSchema.index({ 'members.member2.email': 1 });

// Pre-save middleware to hash password
teamSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to check password
teamSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get public profile
teamSchema.methods.getPublicProfile = function () {
    const teamObject = this.toObject();
    delete teamObject.password;
    return teamObject;
};

// Static method to find team by credentials
teamSchema.statics.findByCredentials = async function (teamName, password) {
    const team = await this.findOne({ teamName }).select('+password');

    if (!team) {
        throw new Error('Invalid team name or password');
    }

    const isMatch = await team.comparePassword(password);

    if (!isMatch) {
        throw new Error('Invalid team name or password');
    }

    return team;
};

// Validation to ensure member emails are different
teamSchema.pre('save', function (next) {
    if (this.members.member1.email === this.members.member2.email) {
        next(new Error('Member emails must be different'));
    } else {
        next();
    }
});

const Team = mongoose.model('Team', teamSchema);

export default Team;