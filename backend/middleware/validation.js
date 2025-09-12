import { body, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg,
                value: error.value
            }))
        });
    }
    next();
};

// Registration validation rules
export const validateRegistration = [
    body('teamName')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Team name must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9\s\-_]+$/)
        .withMessage('Team name can only contain letters, numbers, spaces, hyphens, and underscores'),

    body('member1Name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Member 1 name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z0-9\s\-_.]+$/)
        .withMessage('Member 1 name can only contain letters, numbers, spaces, hyphens, underscores, and dots'),

    body('member1Email')
        .isEmail()
        .withMessage('Please provide a valid email for member 1')
        .normalizeEmail(),

    body('member2Name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Member 2 name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z0-9\s\-_.]+$/)
        .withMessage('Member 2 name can only contain letters, numbers, spaces, hyphens, underscores, and dots'),

    body('member2Email')
        .isEmail()
        .withMessage('Please provide a valid email for member 2')
        .normalizeEmail(),

    body('leader')
        .isIn(['member1', 'member2'])
        .withMessage('Leader must be either member1 or member2'),

    body('leaderPhone')
        .trim()
        .matches(/^\+?[\d\s\-\(\)]{10,}$/)
        .withMessage('Please provide a valid phone number'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),

    // Custom validation to ensure member emails are different
    body().custom((value, { req }) => {
        if (req.body.member1Email === req.body.member2Email) {
            throw new Error('Member emails must be different');
        }
        return true;
    }),

    handleValidationErrors
];

// Login validation rules
export const validateLogin = [
    body('teamName')
        .trim()
        .notEmpty()
        .withMessage('Team name is required'),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    handleValidationErrors
];

// Update team validation rules
export const validateTeamUpdate = [
    body('member1Name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Member 1 name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Member 1 name can only contain letters and spaces'),

    body('member1Email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email for member 1')
        .normalizeEmail(),

    body('member2Name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Member 2 name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Member 2 name can only contain letters and spaces'),

    body('member2Email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email for member 2')
        .normalizeEmail(),

    body('leaderPhone')
        .optional()
        .trim()
        .matches(/^\+?[\d\s\-\(\)]{10,}$/)
        .withMessage('Please provide a valid phone number'),

    handleValidationErrors
];
