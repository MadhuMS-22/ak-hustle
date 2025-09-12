import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Mock admin credentials (in production, this would be in a database)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: '$2a$10$rCYtgCeMEH52y34/wVw8XuIz3bVoR8iDZIH3h7LkeYcdmmg.Vw4By', // password: "password"
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'admin']
};

// Admin login
export const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Check if admin exists
        if (username !== ADMIN_CREDENTIALS.username) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password (simple comparison for testing)
        if (password !== 'password') {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: 'admin',
                username: ADMIN_CREDENTIALS.username,
                role: ADMIN_CREDENTIALS.role,
                permissions: ADMIN_CREDENTIALS.permissions
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Log admin login attempt
        console.log(`Admin login attempt: ${username} at ${new Date().toISOString()}`);

        res.status(200).json({
            success: true,
            message: 'Admin login successful',
            data: {
                token,
                admin: {
                    id: 'admin',
                    username: ADMIN_CREDENTIALS.username,
                    role: ADMIN_CREDENTIALS.role,
                    permissions: ADMIN_CREDENTIALS.permissions
                }
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during admin login'
        });
    }
};

// Admin logout
export const adminLogout = async (req, res) => {
    try {
        // Log admin logout
        console.log(`Admin logout at ${new Date().toISOString()}`);

        res.status(200).json({
            success: true,
            message: 'Admin logout successful'
        });

    } catch (error) {
        console.error('Admin logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during admin logout'
        });
    }
};

// Validate admin token
export const validateAdminToken = async (req, res) => {
    try {
        // If we reach here, the token is valid (middleware already verified it)
        res.status(200).json({
            success: true,
            message: 'Admin token is valid',
            data: {
                admin: {
                    id: req.admin.id,
                    username: req.admin.username,
                    role: req.admin.role,
                    permissions: req.admin.permissions
                }
            }
        });

    } catch (error) {
        console.error('Admin token validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during token validation'
        });
    }
};
