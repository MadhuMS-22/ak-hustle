import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/api";
import authService from "../../services/authService";

import Aptitude from "./components/Aptitude";
import Debug from "./components/Debug";
import Trace from "./components/Trace";
import Program from "./components/Program";
import QuestionSidebar from "./components/QuestionSidebar";
import GlobalTimer from "./components/GlobalTimer";
import ChallengeSelection from "./components/ChallengeSelection";

const Round2Page = () => {
    const navigate = useNavigate();
    const [teamId, setTeamId] = useState(null);
    const [step, setStep] = useState(0);
    const [teamName, setTeamName] = useState('');
    const [quizStartTime, setQuizStartTime] = useState(null);
    const [currentChallenge, setCurrentChallenge] = useState(null);
    const [completedChallenges, setCompletedChallenges] = useState([]);
    const [completedAptitudeQuestions, setCompletedAptitudeQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [teamProgress, setTeamProgress] = useState(null);
    const [isQuizCompleted, setIsQuizCompleted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check authentication and get team info
    useEffect(() => {
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
            console.log('User not authenticated, redirecting to login');
            navigate('/login');
            return;
        }

        // Get team data from localStorage
        const teamData = authService.getTeamData();
        if (teamData) {
            setTeamId(teamData._id);
            setTeamName(teamData.teamName);
            setQuizStartTime(new Date());

            // Load team progress
            loadTeamProgress(teamData._id);
        } else {
            console.log('No team data found, redirecting to login');
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        if (teamId) {
            apiService.get(`/competition/team/${teamId}`).then((res) => {
                if (res.data.success) {
                    setStep(res.data.team.competitionStatus === 'round1_completed' ? 1 : 0);
                }
            });
        }
    }, [teamId]);

    const loadTeamProgress = async (teamId) => {
        try {
            setIsLoading(true);
            const response = await apiService.get(`/quiz/team/${teamId}/progress`);
            setTeamProgress(response.data.team);
            setIsQuizCompleted(response.data.team.isQuizCompleted);
        } catch (error) {
            console.error('Error loading team progress:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAptSubmit = async (selected) => {
        try {
            console.log('Submitting aptitude answer:', { teamId, currentQuestion, selected });
            const response = await apiService.post("/quiz/apt/answer", { teamId, step: currentQuestion, selected });
            console.log('Aptitude response:', response.data);

            // Reload team progress to get updated state
            await loadTeamProgress(teamId);

            if (response.data.correct) {
                setCompletedAptitudeQuestions(prev => [...prev, currentQuestion]);
                console.log('Answer correct, marking question as completed');

                // Automatically move to the unlocked challenge
                const challengeMap = { 0: 'debug', 1: 'trace', 2: 'program' };
                const nextChallenge = challengeMap[currentQuestion];
                if (nextChallenge) {
                    setCurrentChallenge(nextChallenge);
                }
            } else {
                console.log('Answer incorrect, attempts left:', response.data.attemptsLeft);
                if (response.data.attemptsLeft === 0) {
                    // Automatically move to the unlocked challenge even if failed
                    const challengeMap = { 0: 'debug', 1: 'trace', 2: 'program' };
                    const nextChallenge = challengeMap[currentQuestion];
                    if (nextChallenge) {
                        setCurrentChallenge(nextChallenge);
                    }
                }
            }
        } catch (error) {
            console.error('Error submitting aptitude answer:', error);
            console.error('Error details:', error.response?.data);
            alert(`Error submitting answer: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleCodeSubmit = async (code, timeTaken) => {
        try {
            const response = await apiService.post("/quiz/code/submit", { teamId, challengeType: currentChallenge, code, timeTaken });

            // Reload team progress to get updated state
            await loadTeamProgress(teamId);

            setCompletedChallenges(prev => [...prev, currentChallenge]);
            setCurrentChallenge(null);

            if (response.data.isQuizCompleted) {
                setIsQuizCompleted(true);
                // Update team status to round2_completed
                await apiService.put(`/competition/status`, {
                    competitionStatus: 'round2_completed',
                    scores: { round2: response.data.score || 85 }
                });
            } else {
                // Automatically move to the next aptitude question
                const challengeToAptitudeMap = { 'debug': 1, 'trace': 2, 'program': 3 };
                const nextAptitude = challengeToAptitudeMap[currentChallenge];
                if (nextAptitude && nextAptitude <= 2) {
                    setCurrentQuestion(nextAptitude);
                }
            }
        } catch (error) {
            console.error('Error submitting code:', error);
            alert(`Error submitting code: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleChallengeSelect = (challengeId) => {
        setCurrentChallenge(challengeId);
    };

    const handleQuestionClick = (questionStep) => {
        console.log('Question clicked:', questionStep, 'Completed:', completedAptitudeQuestions);
        if (!completedAptitudeQuestions.includes(questionStep)) {
            setCurrentQuestion(questionStep);
            console.log('Setting current question to:', questionStep);
        }
    };

    const handleChallengeClick = (challengeId) => {
        // Find which aptitude question unlocks this challenge
        const challengeMap = {
            'debug': 0,
            'trace': 1,
            'program': 2
        };
        const requiredAptitude = challengeMap[challengeId];

        console.log('Challenge clicked:', challengeId, 'Required aptitude:', requiredAptitude, 'Completed aptitudes:', completedAptitudeQuestions, 'Completed challenges:', completedChallenges);

        if (completedAptitudeQuestions.includes(requiredAptitude) && !completedChallenges.includes(challengeId)) {
            setCurrentChallenge(challengeId);
            console.log('Setting current challenge to:', challengeId);
        }
    };

    const handleBackToTeam = () => {
        navigate('/team');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading Round 2...</p>
                </div>
            </div>
        );
    }

    if (!teamId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-slate-700">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-cyan-400 mb-2">
                            Round 2 - Code Challenge
                        </h1>
                        <p className="text-lg text-slate-300 mb-4">
                            Complete 5 C programming puzzles. Each question has a 5-minute timer.
                        </p>
                        <div className="w-24 h-1 bg-cyan-400 mx-auto rounded-full"></div>
                    </div>

                    <div className="bg-slate-700 rounded-xl p-6 mb-6">
                        <h2 className="text-xl font-bold text-white mb-4">Game Rules:</h2>
                        <ul className="text-slate-300 space-y-2">
                            <li>• Complete 5 different C programming puzzles</li>
                            <li>• Each question has a 5-minute time limit</li>
                            <li>• Select the correct code blocks to complete each program</li>
                            <li>• Your progress and answers will be saved automatically</li>
                        </ul>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleBackToTeam}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                        >
                            Back to Team Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            <div className="w-80 bg-slate-800 border-r border-slate-700 p-6 h-screen overflow-hidden">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-cyan-400 mb-2">Team: {teamName}</h3>
                    <div className="text-sm text-slate-400">
                        Progress: {teamProgress ? Object.values(teamProgress.completedQuestions).filter(Boolean).length : 0}/6 Questions
                    </div>
                </div>

                <GlobalTimer startTime={quizStartTime} isActive={!!teamId && !isQuizCompleted} />

                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Quiz Questions</h4>

                    {/* Sequential Question Flow */}
                    {[
                        { aptitude: 0, challenge: 'debug', challengeName: 'Debug Q1' },
                        { aptitude: 1, challenge: 'trace', challengeName: 'Output Q2' },
                        { aptitude: 2, challenge: 'program', challengeName: 'Program Q3' }
                    ].map((pair, index) => {
                        const aptitudeKey = `q${pair.aptitude + 1}`;
                        const challengeKey = `q${pair.aptitude + 4}`;

                        const aptitudeCompleted = teamProgress ? teamProgress.completedQuestions[aptitudeKey] : false;
                        const challengeCompleted = teamProgress ? teamProgress.completedQuestions[challengeKey] : false;

                        // Sequential unlocking logic
                        const aptitudeUnlocked = teamProgress ? teamProgress.unlockedQuestions[aptitudeKey] : (pair.aptitude === 0);
                        const challengeUnlocked = teamProgress ? teamProgress.unlockedQuestions[challengeKey] : false;

                        const isCurrentAptitude = currentQuestion === pair.aptitude && !aptitudeCompleted;
                        const isCurrentChallenge = currentChallenge === pair.challenge;

                        return (
                            <div key={pair.aptitude} className="space-y-2">
                                {/* Aptitude Question */}
                                <div
                                    onClick={() => {
                                        console.log('Sidebar aptitude clicked:', pair.aptitude, 'Completed:', aptitudeCompleted, 'Unlocked:', aptitudeUnlocked);
                                        if (aptitudeUnlocked && !aptitudeCompleted) {
                                            handleQuestionClick(pair.aptitude);
                                        }
                                    }}
                                    className={`p-3 rounded-lg border transition-all duration-200 ${isCurrentAptitude
                                        ? 'border-cyan-400 shadow-lg bg-slate-700 cursor-pointer'
                                        : aptitudeCompleted
                                            ? 'border-green-600 bg-green-600/20'
                                            : aptitudeUnlocked
                                                ? 'border-slate-600 bg-slate-700 cursor-pointer hover:border-cyan-300'
                                                : 'border-slate-600 bg-slate-500/30 opacity-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="text-sm font-medium text-slate-200">Q{pair.aptitude + 1}: Aptitude</span>
                                            {!aptitudeUnlocked && (
                                                <span className="ml-2 text-xs text-slate-500">🔒 Locked</span>
                                            )}
                                            {aptitudeUnlocked && !aptitudeCompleted && (
                                                <div className="ml-2 flex items-center space-x-1">
                                                    <span className="text-xs text-cyan-400">Click to solve</span>
                                                    <span className="text-xs text-yellow-400">
                                                        ({teamProgress ? 2 - teamProgress.aptitudeAttempts[`q${pair.aptitude + 1}`] : 2}/2 chances)
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {aptitudeCompleted && <span className="text-green-400 text-sm">✓</span>}
                                    </div>
                                </div>

                                {/* Connected Challenge */}
                                <div
                                    onClick={() => {
                                        console.log('Sidebar challenge clicked:', pair.challenge, 'Unlocked:', challengeUnlocked, 'Completed:', challengeCompleted);
                                        if (challengeUnlocked && !challengeCompleted) {
                                            handleChallengeClick(pair.challenge);
                                        }
                                    }}
                                    className={`p-3 rounded-lg border transition-all duration-200 ml-4 ${isCurrentChallenge
                                        ? 'border-cyan-400 shadow-lg bg-slate-700'
                                        : challengeCompleted
                                            ? 'border-green-600 bg-green-600/20'
                                            : challengeUnlocked
                                                ? 'border-slate-600 bg-slate-700 cursor-pointer hover:border-cyan-300'
                                                : 'border-slate-600 bg-slate-500/30 opacity-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="text-sm font-medium text-slate-200">Q{pair.aptitude + 4}: {pair.challengeName}</span>
                                            {!challengeUnlocked && (
                                                <span className="ml-2 text-xs text-slate-500">🔒 Locked</span>
                                            )}
                                            {challengeUnlocked && !challengeCompleted && (
                                                <span className="ml-2 text-xs text-cyan-400">Click to solve</span>
                                            )}
                                        </div>
                                        {challengeCompleted && <span className="text-green-400 text-sm">✓</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6">
                    <button
                        onClick={handleBackToTeam}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
                    >
                        Back to Team Page
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {currentChallenge ? (
                    currentChallenge === 'debug' ? (
                        <Debug onSubmit={handleCodeSubmit} teamId={teamId} />
                    ) : currentChallenge === 'trace' ? (
                        <Trace onSubmit={handleCodeSubmit} teamId={teamId} />
                    ) : currentChallenge === 'program' ? (
                        <Program onSubmit={handleCodeSubmit} teamId={teamId} />
                    ) : null
                ) : isQuizCompleted ? (
                    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
                        <div className="text-center">
                            <div className="text-8xl mb-6">🎉</div>
                            <h2 className="text-5xl text-cyan-400 font-bold mb-4">
                                Round 2 Completed!
                            </h2>
                            <p className="text-xl text-slate-300 mb-8">
                                Congratulations! You have successfully completed Round 2.
                            </p>
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md mx-auto shadow-2xl">
                                <p className="text-slate-300 text-lg mb-4">
                                    Thank you for participating in Round 2!
                                </p>
                                <div className="text-cyan-400 font-semibold">
                                    All challenges completed successfully!
                                </div>
                                <div className="mt-4 text-slate-400 text-sm">
                                    Your responses have been submitted and recorded.
                                </div>
                                <button
                                    onClick={handleBackToTeam}
                                    className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
                                >
                                    Back to Team Page
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Aptitude questionStep={currentQuestion} onSubmit={handleAptSubmit} teamProgress={teamProgress} />
                )}
            </div>
        </div>
    );
};

export default Round2Page;
