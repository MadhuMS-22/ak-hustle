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
                if (storedTeam) {
                    const parsedTeamData = JSON.parse(storedTeam);
                    setTeamData(parsedTeamData);
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                    setTeamData(null);
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
                setIsAuthenticated(false);
                setTeamData(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    const login = (teamData) => {
        try {
            // Store team data in localStorage
            localStorage.setItem('hustle_team', JSON.stringify(teamData));
            setTeamData(teamData);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    };

    const logout = () => {
        try {
            // Clear team data from localStorage
            localStorage.removeItem('hustle_team');
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
