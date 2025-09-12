import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminAuthService from '../services/adminAuthService';

const ProtectedAdminRoute = ({ children }) => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check if admin token exists
                if (!adminAuthService.isAdminAuthenticated()) {
                    setIsAuthenticated(false);
                    setLoading(false);
                    return;
                }

                // Validate token with server
                const isValid = await adminAuthService.validateAdminToken();

                if (isValid) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                    // Clear invalid admin data
                    adminAuthService.removeAdminToken();
                    adminAuthService.removeAdminData();
                }
            } catch (error) {
                console.error('Auth validation error:', error);
                setIsAuthenticated(false);
                // Clear admin data on error
                adminAuthService.removeAdminToken();
                adminAuthService.removeAdminData();
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-lg">Verifying admin access...</p>
                </div>
            </div>
        );
    }

    // Redirect to admin login if not authenticated
    if (!isAuthenticated) {
        navigate('/admin/login');
        return null;
    }

    // Render protected content if authenticated
    return children;
};

export default ProtectedAdminRoute;
