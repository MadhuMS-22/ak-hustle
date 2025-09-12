import apiService from './api.js';

class AuthService {
    // Register a new team
    async register(teamData) {
        try {
            const response = await apiService.post('/auth/register', teamData);

            // Store token if registration successful
            if (response.success && response.data.token) {
                apiService.setToken(response.data.token);
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

    // Login team
    async login(credentials) {
        try {
            const response = await apiService.post('/auth/login', credentials);

            // Store token if login successful
            if (response.success && response.data.token) {
                apiService.setToken(response.data.token);
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

    // Get team profile
    async getProfile() {
        try {
            const response = await apiService.get('/auth/profile');
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Update team profile
    async updateProfile(profileData) {
        try {
            const response = await apiService.put('/auth/profile', profileData);
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Change password
    async changePassword(passwordData) {
        try {
            const response = await apiService.put('/auth/change-password', passwordData);
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Logout team
    async logout() {
        try {
            const response = await apiService.post('/auth/logout');

            // Remove token regardless of response
            apiService.removeToken();

            return response;
        } catch (error) {
            // Remove token even if logout fails
            apiService.removeToken();
            throw error;
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!apiService.getToken();
    }

    // Get stored token
    getToken() {
        return apiService.getToken();
    }
}

// Create and export auth service instance
const authService = new AuthService();
export default authService;
