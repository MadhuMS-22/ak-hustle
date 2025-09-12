import React from 'react';

const ChallengeSelection = ({ onSelectChallenge }) => {
    const challenges = [
        {
            id: 'debug',
            title: 'Debug Challenge',
            description: 'Find and fix bugs in C code',
            icon: '🐛',
            color: 'bg-cyan-600',
            hoverColor: 'hover:bg-cyan-700'
        },
        {
            id: 'trace',
            title: 'Trace Challenge',
            description: 'Trace through recursive functions',
            icon: '🔍',
            color: 'bg-green-600',
            hoverColor: 'hover:bg-green-700'
        },
        {
            id: 'program',
            title: 'Program Challenge',
            description: 'Write complete C programs',
            icon: '💻',
            color: 'bg-orange-600',
            hoverColor: 'hover:bg-orange-700'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-bold text-cyan-400 mb-2">
                            Choose Your Challenge
                        </h2>
                        <p className="text-lg text-slate-300">
                            Select any coding challenge to continue. Each challenge has a 5-minute timer.
                        </p>
                        <div className="w-24 h-1 bg-cyan-400 mx-auto rounded-full mt-4"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {challenges.map((challenge) => (
                            <div
                                key={challenge.id}
                                onClick={() => onSelectChallenge(challenge.id)}
                                className={`${challenge.color} ${challenge.hoverColor} rounded-xl p-6 cursor-pointer transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl`}
                            >
                                <div className="text-center">
                                    <div className="text-4xl mb-4">{challenge.icon}</div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        {challenge.title}
                                    </h3>
                                    <p className="text-white/80 text-sm">
                                        {challenge.description}
                                    </p>
                                    <div className="mt-4 text-white/60 text-xs">
                                        5-minute timer
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-sm">
                            You can attempt any challenge. Complete all three to finish the quiz!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChallengeSelection;