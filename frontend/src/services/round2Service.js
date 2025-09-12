import apiService from './api';

const round2Service = {
    // Get team progress for Round 2
    getTeamProgress: async (teamId) => {
        try {
            const response = await apiService.get(`/quiz/team/${teamId}/progress`);
            return response.data;
        } catch (error) {
            console.error('Error fetching team progress:', error);
            throw error;
        }
    },

    // Submit aptitude answer
    submitAptitudeAnswer: async (teamId, step, selected) => {
        try {
            const response = await apiService.post('/quiz/apt/answer', {
                teamId,
                step,
                selected
            });
            return response.data;
        } catch (error) {
            console.error('Error submitting aptitude answer:', error);
            throw error;
        }
    },

    // Submit code challenge
    submitCodeChallenge: async (teamId, challengeType, code, timeTaken) => {
        try {
            const response = await apiService.post('/quiz/code/submit', {
                teamId,
                challengeType,
                code,
                timeTaken
            });
            return response.data;
        } catch (error) {
            console.error('Error submitting code challenge:', error);
            throw error;
        }
    },

    // Get quiz questions
    getQuizQuestions: async () => {
        try {
            const response = await apiService.get('/quiz/questions');
            return response.data;
        } catch (error) {
            console.error('Error fetching quiz questions:', error);
            throw error;
        }
    },

    // Get team status
    getTeamStatus: async (teamId) => {
        try {
            const response = await apiService.get(`/teams/${teamId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching team status:', error);
            throw error;
        }
    }
};

export default round2Service;