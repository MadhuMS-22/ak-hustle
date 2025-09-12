// API configuration and base service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5009/api';

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Get auth token from localStorage
    getToken() {
        return localStorage.getItem('hustle_token');
    }

    // Set auth token in localStorage
    setToken(token) {
        localStorage.setItem('hustle_token', token);
    }

    // Remove auth token from localStorage
    removeToken() {
        localStorage.removeItem('hustle_token');
    }

    // Get headers with auth token if available
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        const token = this.getToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return headers;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        const config = {
            headers: this.getHeaders(),
            ...options,
        };

        // console.log('API Request:', { url, config });

        try {
            const response = await fetch(url, config);

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response received:', text);
                throw new Error(`Expected JSON response but received ${contentType || 'unknown content type'}. Response: ${text.substring(0, 200)}...`);
            }

            const data = await response.json();
            // console.log('API Response:', { status: response.status, data });

            if (!response.ok) {
                // Include validation errors in the error message
                if (data.errors && Array.isArray(data.errors)) {
                    const errorMessages = data.errors.map(err => `${err.field}: ${err.message}`).join(', ');
                    throw new Error(`${data.message || 'Validation failed'}. Details: ${errorMessages}`);
                }
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // GET request
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Create and export API service instance
const apiService = new ApiService();
export default apiService;
