import jwt from 'jsonwebtoken';
import Team from '../models/Team.js';

// Middleware to protect routes
export const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get team from token
            const team = await Team.findById(decoded.id).select('-password');

            if (!team) {
                return res.status(401).json({
                    success: false,
                    message: 'Token is no longer valid. Team not found.'
                });
            }

            if (!team.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Account has been deactivated.'
                });
            }

            // Add team to request object
            req.team = team;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in authentication.'
        });
    }
};

// Middleware to check if team is eligible for specific rounds
export const checkRoundEligibility = (requiredStatus) => {
    return (req, res, next) => {
        const team = req.team;

        if (!team) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        const statusHierarchy = {
            'registered': 0,
            'round1_completed': 1,
            'round2_completed': 2,
            'round3_completed': 3,
            'disqualified': -1
        };

        const teamStatusLevel = statusHierarchy[team.competitionStatus] || -1;
        const requiredLevel = statusHierarchy[requiredStatus] || 0;

        if (teamStatusLevel < requiredLevel) {
            return res.status(403).json({
                success: false,
                message: `You must complete the previous rounds to access this feature. Current status: ${team.competitionStatus}`
            });
        }

        next();
    };
};

// Middleware to check if team is not disqualified
export const checkNotDisqualified = (req, res, next) => {
    if (req.team && req.team.competitionStatus === 'disqualified') {
        return res.status(403).json({
            success: false,
            message: 'Your team has been disqualified from the competition.'
        });
    }
    next();
};

// Middleware to check admin access
export const adminAuth = async (req, res, next) => {
    try {
        let token;

        // Check for token in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No admin token provided.'
            });
        }

        try {
            // Verify admin token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check if this is an admin token (has admin role)
            if (decoded.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
            }

            // Add admin info to request object
            req.admin = {
                id: decoded.id,
                username: decoded.username,
                role: decoded.role,
                permissions: decoded.permissions
            };

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
    } catch (error) {
        console.error('Admin auth error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in admin authentication.'
        });
    }
};