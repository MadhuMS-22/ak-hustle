import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Aptitude from "./components/Aptitude";
import Debug from "./components/Debug";
import Trace from "./components/Trace";
import Program from "./components/Program";
import GlobalTimer from "./components/GlobalTimer";
import round2Service from "../../services/round2Service";
import authService from "../../services/authService";

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
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    // Check authentication and get team info
    useEffect(() => {
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
            console.log('User not authenticated, redirecting to login');
            navigate('/login');
            return;
        }

        // Get team info from localStorage (set during login)
        const storedTeam = localStorage.getItem('hustle_team');
        if (storedTeam) {
            const teamData = JSON.parse(storedTeam);
            setTeamName(teamData.teamName || 'Unknown Team');
            setTeamId(teamData._id); // Set team ID from stored data
        }

        setIsLoading(false);
    }, [navigate]);

    useEffect(() => {
        if (teamId) {
            loadTeamProgress(teamId);
        }
    }, [teamId]);

    // Show completion modal when quiz is completed
    useEffect(() => {
        if (isQuizCompleted) {
            setShowCompletionModal(true);
        }
    }, [isQuizCompleted]);

    const loadTeamProgress = async (teamId) => {
        try {
            const response = await round2Service.getTeamProgress(teamId);
            setTeamProgress(response.team);
            setIsQuizCompleted(response.team.isQuizCompleted);

            // Set quiz start time if not already set and quiz is not completed
            if (!quizStartTime && !response.team.isQuizCompleted) {
                setQuizStartTime(new Date());
            }
        } catch (error) {
            console.error('Error loading team progress:', error);
        }
    };

    const resetQuizState = () => {
        setCurrentQuestion(0);
        setCurrentChallenge(null);
        setCompletedChallenges([]);
        setCompletedAptitudeQuestions([]);
        setIsQuizCompleted(false);
        setShowCompletionModal(false);
    };

    const handleTeamRegistration = async (name) => {
        try {
            // Reset quiz state for new team
            resetQuizState();

            const response = await round2Service.createTeam({ teamName: name });
            setTeamId(response.data._id);
            setTeamName(name);
            setQuizStartTime(new Date());
            await loadTeamProgress(response.data._id);
        } catch (error) {
            console.error('Error creating team:', error);
        }
    };

    const handleAptitudeAnswer = async (selected) => {
        try {
            console.log('Submitting aptitude answer:', { teamId, currentQuestion, selected });
            const response = await round2Service.submitAptitudeAnswer({
                teamId,
                questionIndex: currentQuestion,
                answer: selected
            });
            console.log('Aptitude response:', response);

            // Reload team progress to get updated state
            await loadTeamProgress(teamId);

            if (response.correct) {
                setCompletedAptitudeQuestions(prev => [...prev, currentQuestion]);
                console.log('Answer correct, marking question as completed');

                // Automatically move to the unlocked challenge
                const challengeMap = { 0: 'debug', 1: 'trace', 2: 'program' };
                const nextChallenge = challengeMap[currentQuestion];
                if (nextChallenge) {
                    setCurrentChallenge(nextChallenge);
                }
            } else {
                console.log('Answer incorrect, attempts left:', response.attemptsLeft);
                if (response.attemptsLeft === 0) {
                    // Show failure message
                    alert(`❌ You failed to solve the aptitude question!\n\nYou have used all 2 attempts. The challenge will be unlocked anyway.`);
                    // Automatically move to the unlocked challenge even if failed
                    const challengeMap = { 0: 'debug', 1: 'trace', 2: 'program' };
                    const nextChallenge = challengeMap[currentQuestion];
                    if (nextChallenge) {
                        setCurrentChallenge(nextChallenge);
                    }
                } else {
                    // Show partial failure message
                    alert(`❌ Incorrect answer!\n\nYou have ${response.attemptsLeft} attempt(s) remaining.`);
                }
            }
        } catch (error) {
            console.error('Error submitting aptitude answer:', error);
            console.error('Error details:', error.response?.data);
            alert(`Error submitting answer: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleCodeSubmit = async (code, timeTaken) => {
        try {
            const response = await round2Service.submitCodingSolution({
                teamId,
                challengeType: currentChallenge,
                solution: code,
                timeTaken
            });

            // Reload team progress to get updated state
            await loadTeamProgress(teamId);

            setCompletedChallenges(prev => [...prev, currentChallenge]);
            setCurrentChallenge(null);

            if (response.isQuizCompleted) {
                setIsQuizCompleted(true);
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
            alert(`Error submitting code: ${error.response?.data?.message || error.message}`);
        }
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

    const handleBackToResults = () => {
        navigate('/result');
    };

    // If no team ID, show registration
    if (!teamId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-slate-700">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-cyan-400 mb-2">
                            Round 2: Technical Challenge
                        </h1>
                        <p className="text-lg text-slate-300 mb-4">
                            Complete aptitude questions and coding challenges to progress.
                        </p>
                        <div className="w-24 h-1 bg-cyan-400 mx-auto rounded-full"></div>
                    </div>

                    <div className="bg-slate-700 rounded-xl p-6 mb-6">
                        <h2 className="text-xl font-bold text-white mb-4">Challenge Rules:</h2>
                        <ul className="text-slate-300 space-y-2">
                            <li>• Complete 3 aptitude questions and 3 coding challenges</li>
                            <li>• Each challenge has a 5-minute time limit</li>
                            <li>• Answer aptitude questions to unlock coding challenges</li>
                            <li>• Your progress will be saved automatically</li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                                Enter Team Name:
                            </label>
                            <input
                                id="name"
                                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                                placeholder="Enter your team name..."
                            />
                        </div>

                        <div className="text-center text-slate-300 mb-6">
                            <p>Ready to start? Each challenge has 5:00 to solve. Good luck!</p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    const name = document.getElementById("name").value.trim();
                                    if (name) {
                                        handleTeamRegistration(name);
                                    } else {
                                        alert('Please enter a team name');
                                    }
                                }}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                            >
                                Start Round 2
                            </button>
                            <button
                                onClick={() => navigate('/round2/admin')}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                            >
                                View Admin Page
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show loading screen while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <div className="text-cyan-400 text-xl font-semibold">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            {/* Sidebar - Integrated directly like original quiz-3 */}
            <div className="w-80 bg-slate-800 border-r border-slate-700 p-6 h-screen overflow-hidden">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-cyan-400 mb-2">Team: {teamName}</h3>
                    <div className="text-sm text-slate-400">
                        Progress: {teamProgress ? Object.values(teamProgress.completedQuestions || {}).filter(Boolean).length : 0}/6 Questions
                    </div>
                </div>

                <GlobalTimer startTime={quizStartTime} isActive={!!teamId && !isQuizCompleted} />

                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                        Quiz Questions
                    </h4>

                    {/* Sequential Question Flow */}
                    {[
                        { aptitude: 0, challenge: 'debug', challengeName: 'Debug Q1' },
                        { aptitude: 1, challenge: 'trace', challengeName: 'Output Q2' },
                        { aptitude: 2, challenge: 'program', challengeName: 'Program Q3' }
                    ].map((pair, index) => {
                        const aptitudeKey = `q${pair.aptitude + 1}`;
                        const challengeKey = `q${pair.aptitude + 4}`;

                        const aptitudeCompleted = teamProgress ? teamProgress.completedQuestions?.[aptitudeKey] : false;
                        const challengeCompleted = teamProgress ? teamProgress.completedQuestions?.[challengeKey] : false;

                        // Check if aptitude was attempted (even if failed)
                        const aptitudeAttempted = teamProgress ? (teamProgress.aptitudeAttempts?.[aptitudeKey] || 0) > 0 : false;
                        const challengeAttempted = teamProgress ? (teamProgress.codingAttempts?.[challengeKey] || 0) > 0 : false;

                        // Sequential unlocking logic
                        const aptitudeUnlocked = teamProgress ? teamProgress.unlockedQuestions?.[aptitudeKey] : (pair.aptitude === 0);
                        const challengeUnlocked = teamProgress ? teamProgress.unlockedQuestions?.[challengeKey] : false;

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
                                            : aptitudeAttempted
                                                ? 'border-yellow-600 bg-yellow-600/20'
                                                : aptitudeUnlocked
                                                    ? 'border-slate-600 bg-slate-700 cursor-pointer hover:border-cyan-300'
                                                    : 'border-slate-600 bg-slate-500/30 opacity-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="text-sm font-medium text-slate-200">
                                                Q{pair.aptitude + 1}: Aptitude
                                            </span>
                                            {!aptitudeUnlocked && (
                                                <span className="ml-2 text-xs text-slate-500">🔒 Locked</span>
                                            )}
                                            {aptitudeUnlocked && !aptitudeCompleted && (
                                                <div className="ml-2 flex items-center space-x-1">
                                                    <span className="text-xs text-cyan-400">Click to solve</span>
                                                    <span className="text-xs text-yellow-400">
                                                        (Attempts: {teamProgress?.aptitudeAttempts?.[aptitudeKey] || 0}/2)
                                                    </span>
                                                </div>
                                            )}
                                            {aptitudeAttempted && !aptitudeCompleted && (
                                                <div className="ml-2 flex items-center space-x-1">
                                                    <span className="text-xs text-yellow-400">
                                                        (Attempted: {teamProgress?.aptitudeAttempts?.[aptitudeKey] || 0}/2)
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
                                            : challengeAttempted
                                                ? 'border-yellow-600 bg-yellow-600/20'
                                                : challengeUnlocked
                                                    ? 'border-slate-600 bg-slate-700 cursor-pointer hover:border-cyan-300'
                                                    : 'border-slate-600 bg-slate-500/30 opacity-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="text-sm font-medium text-slate-200">
                                                Q{pair.aptitude + 4}: {pair.challengeName}
                                            </span>
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
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden">
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
                                Round 2 Complete!
                            </h2>
                            <p className="text-xl text-slate-300 mb-8">
                                Congratulations! You have successfully completed all challenges.
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
                                    onClick={handleBackToResults}
                                    className="mt-6 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
                                >
                                    Back to Results
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Aptitude
                        questionStep={currentQuestion}
                        onSubmit={handleAptitudeAnswer}
                        teamProgress={teamProgress}
                    />
                )}
            </div>

            {/* Completion Modal */}
            {showCompletionModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-2xl p-8 max-w-md mx-auto shadow-2xl border border-slate-700">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-3xl font-bold text-green-400 mb-4">
                                Congratulations!
                            </h2>
                            <p className="text-slate-300 text-lg mb-6">
                                You have successfully completed Round 2!
                            </p>
                            <div className="bg-slate-700 rounded-lg p-4 mb-6">
                                <p className="text-cyan-400 font-semibold">
                                    Your responses have been submitted and recorded.
                                </p>
                                <p className="text-slate-400 text-sm mt-2">
                                    Thank you for participating in the Hustle Competition!
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowCompletionModal(false);
                                    navigate('/result');
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
                            >
                                View Results
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Round2Page;