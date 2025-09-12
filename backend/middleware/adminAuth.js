import jwt from 'jsonwebtoken';

// Middleware to protect admin routes
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
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check if it's an admin token
            if (!decoded.role || decoded.role !== 'admin') {
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
                message: 'Invalid admin token.'
            });
        }
    } catch (error) {
        console.error('Admin auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in admin authentication.'
        });
    }
};

// Middleware to check specific admin permissions
export const checkAdminPermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!req.admin.permissions || !req.admin.permissions.includes(requiredPermission)) {
            return res.status(403).json({
                success: false,
                message: `Permission denied. Required permission: ${requiredPermission}`
            });
        }

        next();
    };
};
