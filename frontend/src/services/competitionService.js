import apiService from './api.js';

class CompetitionService {
    // Get competition leaderboard
    async getLeaderboard() {
        try {
            const response = await apiService.get('/competition/leaderboard');
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Get competition statistics
    async getStats() {
        try {
            const response = await apiService.get('/competition/stats');
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Get team's competition status
    async getStatus() {
        try {
            const response = await apiService.get('/competition/status');
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Update team's competition status
    async updateStatus(statusData) {
        try {
            const response = await apiService.put('/competition/status', statusData);
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Submit Round 3 results
    async submitRound3(round3Data) {
        try {
            const response = await apiService.post('/round3/submit', round3Data);
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Get Round 3 scores
    async getRound3Scores() {
        try {
            const response = await apiService.get('/round3/scores');
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Verify Round 3 access code
    async verifyRound3Code(code) {
        try {
            const response = await apiService.post('/competition/verify-round3-code', { code });
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Health check
    async healthCheck() {
        try {
            const response = await apiService.get('/health');
            return response;
        } catch (error) {
            throw error;
        }
    }
}

// Create and export competition service instance
const competitionService = new CompetitionService();
export default competitionService;
