import mongoose from 'mongoose';

const roundCodesSchema = new mongoose.Schema({
    round: {
        type: Number,
        required: true,
        unique: true,
        enum: [2, 3]
    },
    code: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'Code must be at least 3 characters long'],
        maxlength: [20, 'Code cannot exceed 20 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: String,
        default: 'admin'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    // Track how many teams have used this code
    usageCount: {
        type: Number,
        default: 0
    },
    // Track completion count for this round
    completionCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for faster queries (round already has unique index)
roundCodesSchema.index({ isActive: 1 });

// Pre-save middleware to update updatedAt
roundCodesSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Static method to get active code for a round
roundCodesSchema.statics.getActiveCode = async function (round) {
    const roundCode = await this.findOne({ round, isActive: true });
    return roundCode;
};

// Static method to create or update round code
roundCodesSchema.statics.setRoundCode = async function (round, code) {
    const existingCode = await this.findOne({ round });

    if (existingCode) {
        existingCode.code = code;
        existingCode.updatedAt = Date.now();
        return await existingCode.save();
    } else {
        return await this.create({ round, code });
    }
};

// Instance method to increment usage count
roundCodesSchema.methods.incrementUsage = async function () {
    this.usageCount += 1;
    return await this.save();
};

// Instance method to increment completion count
roundCodesSchema.methods.incrementCompletion = async function () {
    this.completionCount += 1;
    return await this.save();
};

const RoundCodes = mongoose.model('RoundCodes', roundCodesSchema);

export default RoundCodes;
