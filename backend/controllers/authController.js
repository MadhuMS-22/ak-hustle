import jwt from 'jsonwebtoken';
import Team from '../models/Team.js';

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Register a new team
// @route   POST /api/auth/register
// @access  Public
export const registerTeam = async (req, res) => {
    try {
        const {
            teamName,
            member1Name,
            member1Email,
            member2Name,
            member2Email,
            leader,
            leaderPhone,
            password
        } = req.body;

        // Check if team already exists
        const existingTeam = await Team.findOne({
            $or: [
                { teamName },
                { 'members.member1.email': member1Email },
                { 'members.member2.email': member2Email }
            ]
        });

        if (existingTeam) {
            if (existingTeam.teamName === teamName) {
                return res.status(400).json({
                    success: false,
                    message: 'Team name already exists'
                });
            }
            if (existingTeam.members.member1.email === member1Email ||
                existingTeam.members.member2.email === member1Email) {
                return res.status(400).json({
                    success: false,
                    message: 'Member 1 email is already registered'
                });
            }
            if (existingTeam.members.member1.email === member2Email ||
                existingTeam.members.member2.email === member2Email) {
                return res.status(400).json({
                    success: false,
                    message: 'Member 2 email is already registered'
                });
            }
        }

        // Create team
        const team = await Team.create({
            teamName,
            members: {
                member1: {
                    name: member1Name,
                    email: member1Email
                },
                member2: {
                    name: member2Name,
                    email: member2Email
                }
            },
            leader,
            leaderPhone,
            password
        });

        // Generate token
        const token = generateToken(team._id);

        // Get team data without password
        const teamData = team.getPublicProfile();

        res.status(201).json({
            success: true,
            message: 'Team registered successfully',
            data: {
                team: teamData,
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `${field} already exists`
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// @desc    Login team
// @route   POST /api/auth/login
// @access  Public
export const loginTeam = async (req, res) => {
    try {
        const { teamName, password } = req.body;

        // Find team and include password
        const team = await Team.findByCredentials(teamName, password);

        // Update last login
        team.lastLogin = new Date();
        await team.save();

        // Generate token
        const token = generateToken(team._id);

        // Get team data without password
        const teamData = team.getPublicProfile();

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                team: teamData,
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);

        res.status(401).json({
            success: false,
            message: error.message || 'Invalid credentials'
        });
    }
};

// @desc    Get current team profile
// @route   GET /api/auth/profile
// @access  Private
export const getTeamProfile = async (req, res) => {
    try {
        const team = req.team;

        res.status(200).json({
            success: true,
            data: {
                team
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile'
        });
    }
};

// @desc    Update team profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateTeamProfile = async (req, res) => {
    try {
        const teamId = req.team._id;
        const updates = req.body;

        // Remove fields that shouldn't be updated directly
        delete updates.password;
        delete updates.teamName;
        delete updates.registrationDate;
        delete updates._id;

        // Check for email conflicts if emails are being updated
        if (updates.member1Email || updates.member2Email) {
            const existingTeam = await Team.findOne({
                _id: { $ne: teamId },
                $or: [
                    { 'members.member1.email': updates.member1Email },
                    { 'members.member2.email': updates.member1Email },
                    { 'members.member1.email': updates.member2Email },
                    { 'members.member2.email': updates.member2Email }
                ]
            });

            if (existingTeam) {
                return res.status(400).json({
                    success: false,
                    message: 'One or more email addresses are already in use by another team'
                });
            }
        }

        // Update team
        const updatedTeam = await Team.findByIdAndUpdate(
            teamId,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedTeam) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                team: updatedTeam
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while updating profile'
        });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const teamId = req.team._id;

        // Get team with password
        const team = await Team.findById(teamId).select('+password');

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        // Check current password
        const isCurrentPasswordValid = await team.comparePassword(currentPassword);

        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        team.password = newPassword;
        await team.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while changing password'
        });
    }
};

// @desc    Logout team (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
export const logoutTeam = async (req, res) => {
    try {
        // In a stateless JWT system, logout is handled client-side
        // by removing the token. This endpoint is for consistency.
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
};
