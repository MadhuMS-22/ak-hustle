import React, { useState } from 'react';
import adminAuthService from '../services/adminAuthService';

const TestAdminLogin = () => {
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const testLogin = async () => {
        setLoading(true);
        setResult('Testing admin login...');

        try {
            const response = await adminAuthService.adminLogin({
                username: 'admin',
                password: 'password'
            });

            setResult(`Success: ${JSON.stringify(response, null, 2)}`);
        } catch (error) {
            setResult(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const testValidation = async () => {
        setLoading(true);
        setResult('Testing token validation...');

        try {
            const isValid = await adminAuthService.validateAdminToken();
            setResult(`Token validation result: ${isValid}`);
        } catch (error) {
            setResult(`Validation error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Admin Login Test</h1>

                <div className="space-y-4">
                    <button
                        onClick={testLogin}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-4"
                    >
                        Test Login
                    </button>

                    <button
                        onClick={testValidation}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                        Test Validation
                    </button>
                </div>

                <div className="mt-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Result:</h2>
                    <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-auto">
                        {result}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default TestAdminLogin;
