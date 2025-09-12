import apiService from './api.js';

// Get API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5009/api';

class AdminAuthService {
    // Admin login
    async adminLogin(credentials) {
        try {
            console.log('Admin login attempt with credentials:', credentials);
            const response = await apiService.post('/admin/login', credentials);
            console.log('Admin login response:', response);

            // Store admin token if login successful
            if (response.success && response.data.token) {
                this.setAdminToken(response.data.token);
                this.setAdminData(response.data.admin);
                console.log('Admin token and data stored');
            }

            return response;
        } catch (error) {
            console.error('Admin login error:', error);
            throw error;
        }
    }

    // Admin logout
    async adminLogout() {
        try {
            const response = await apiService.post('/admin/logout');

            // Remove admin data regardless of response
            this.removeAdminToken();
            this.removeAdminData();

            return response;
        } catch (error) {
            // Remove admin data even if logout fails
            this.removeAdminToken();
            this.removeAdminData();
            throw error;
        }
    }

    // Check if admin is authenticated
    isAdminAuthenticated() {
        const token = this.getAdminToken();
        const adminData = this.getAdminData();
        return !!(token && adminData);
    }

    // Get admin token
    getAdminToken() {
        return localStorage.getItem('hustle_admin_token');
    }

    // Set admin token
    setAdminToken(token) {
        localStorage.setItem('hustle_admin_token', token);
    }

    // Remove admin token
    removeAdminToken() {
        localStorage.removeItem('hustle_admin_token');
    }

    // Get admin data
    getAdminData() {
        const adminData = localStorage.getItem('hustle_admin_data');
        return adminData ? JSON.parse(adminData) : null;
    }

    // Set admin data
    setAdminData(adminData) {
        localStorage.setItem('hustle_admin_data', JSON.stringify(adminData));
    }

    // Remove admin data
    removeAdminData() {
        localStorage.removeItem('hustle_admin_data');
    }

    // Validate admin token
    async validateAdminToken() {
        try {
            // Create a custom request with admin headers
            const response = await fetch(`${API_BASE_URL}/admin/validate`, {
                method: 'GET',
                headers: this.getAdminHeaders()
            });

            if (!response.ok) {
                throw new Error('Token validation failed');
            }

            const data = await response.json();
            return data.success;
        } catch (error) {
            // If validation fails, clear admin data
            this.removeAdminToken();
            this.removeAdminData();
            return false;
        }
    }

    // Get admin headers for API requests
    getAdminHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        const token = this.getAdminToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return headers;
    }
}

// Create and export admin auth service instance
const adminAuthService = new AdminAuthService();
export default adminAuthService;
