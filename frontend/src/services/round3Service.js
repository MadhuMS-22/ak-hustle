import apiService from './api.js';
import adminAuthService from './adminAuthService.js';

class Round3Service {
    // Submit Round 3 results
    async submitRound3(round3Data) {
        try {
            const response = await apiService.post('/round3/submit', round3Data);
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Get Round 3 scores (public)
    async getRound3Scores() {
        try {
            const response = await apiService.get('/round3/scores');
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Admin: Fetch all Round 3 results
    async fetchRound3Results() {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5009/api'}/round3/admin/results`, {
                method: 'GET',
                headers: adminAuthService.getAdminHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    // Admin: Set Round 3 score for a team
    async setRound3Score(teamId, score) {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5009/api'}/round3/admin/update-score/${teamId}`, {
                method: 'POST',
                headers: adminAuthService.getAdminHeaders(),
                body: JSON.stringify({ score })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            throw error;
        }
    }
}

// Create and export Round3 service instance
const round3Service = new Round3Service();
export default round3Service;
