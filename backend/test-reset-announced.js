const jwt = require('jsonwebtoken');

// JWT secret from config.env
const JWT_SECRET = '6bc9576301ada3899a3de18914aeff5ee7c28ea66799d96c9ec51e68d8e929b97315a93df0618d01f99cf28f22d1c5890f74af88eceb4a074851178fe5a81daa';

// Create a test admin token
const adminToken = jwt.sign(
    {
        teamId: 'test-admin-id',
        isAdmin: true
    },
    JWT_SECRET,
    { expiresIn: '7d' }
);

console.log('Admin Token:', adminToken);

// Test the API endpoint
const testAPI = async () => {
    try {
        const response = await fetch('http://localhost:5009/api/admin/resetAnnouncedResults', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            }
        });

        const data = await response.json();
        console.log('API Response:', data);
    } catch (error) {
        console.error('API Error:', error);
    }
};

testAPI();
