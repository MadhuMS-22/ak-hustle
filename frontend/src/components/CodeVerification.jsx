import React, { useState } from 'react';
import competitionService from '../services/competitionService';

const CodeVerification = ({ onCodeVerified, onCancel, roundNumber }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsVerifying(true);

        try {
            // Call the onCodeVerified function with the entered code
            onCodeVerified(code);
        } catch (error) {
            console.error('Code verification error:', error);
            setError(error.message || 'Failed to verify code. Please try again.');
            setCode('');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Round {roundNumber} Access Code</h2>
                    <p className="text-gray-300">
                        Enter the access code to start Round {roundNumber}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
                            Access Code
                        </label>
                        <input
                            type="text"
                            id="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Enter access code"
                            required
                            autoComplete="off"
                            disabled={isVerifying}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-900/30 border border-red-600 rounded-lg p-3">
                            <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50"
                            disabled={isVerifying}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 flex items-center justify-center"
                            disabled={isVerifying || !code.trim()}
                        >
                            {isVerifying ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </>
                            ) : (
                                'Verify & Start'
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">
                        🔒 This code is required to access Round {roundNumber}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CodeVerification;
