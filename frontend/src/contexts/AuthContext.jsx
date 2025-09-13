import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check authentication status on mount
    useEffect(() => {
        const checkAuthStatus = () => {
            try {
                const storedTeam = localStorage.getItem('hustle_team');
                const storedToken = localStorage.getItem('hustle_token');

                // Check both team data and token for authentication
                if (storedTeam && storedToken) {
                    const parsedTeamData = JSON.parse(storedTeam);
                    setTeamData(parsedTeamData);
                    setIsAuthenticated(true);
                } else {
                    // Clear both if either is missing
                    localStorage.removeItem('hustle_team');
                    localStorage.removeItem('hustle_token');
                    setIsAuthenticated(false);
                    setTeamData(null);
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
                // Clear both on error
                localStorage.removeItem('hustle_team');
                localStorage.removeItem('hustle_token');
                setIsAuthenticated(false);
                setTeamData(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    const login = (teamData, token = null) => {
        try {
            // Store team data in localStorage
            localStorage.setItem('hustle_team', JSON.stringify(teamData));

            // Store token if provided
            if (token) {
                localStorage.setItem('hustle_token', token);
            }

            setTeamData(teamData);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    };

    const logout = () => {
        try {
            // Clear both team data and token from localStorage
            localStorage.removeItem('hustle_team');
            localStorage.removeItem('hustle_token');
            setTeamData(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Error during logout:', error);
            throw error;
        }
    };

    const value = {
        isAuthenticated,
        teamData,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
