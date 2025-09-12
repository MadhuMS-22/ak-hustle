import React from 'react';

const QuestionSidebar = ({ currentStep, teamName }) => {
    const questions = [
        { step: 0, type: 'Aptitude', title: 'Question 1', completed: currentStep > 0 },
        { step: 1, type: 'Debug', title: 'Debug Challenge', completed: currentStep > 1 },
        { step: 2, type: 'Aptitude', title: 'Question 2', completed: currentStep > 2 },
        { step: 3, type: 'Trace', title: 'Trace Challenge', completed: currentStep > 3 },
        { step: 4, type: 'Aptitude', title: 'Question 3', completed: currentStep > 4 },
        { step: 5, type: 'Program', title: 'Program Challenge', completed: currentStep > 5 },
    ];

    const getTypeColor = (type) => {
        switch (type) {
            case 'Aptitude': return 'bg-blue-600';
            case 'Debug': return 'bg-cyan-600';
            case 'Trace': return 'bg-green-600';
            case 'Program': return 'bg-orange-600';
            default: return 'bg-slate-600';
        }
    };

    const getCurrentColor = (step, currentStep) => {
        if (step === currentStep) return 'bg-cyan-400 text-slate-900';
        if (step < currentStep) return 'bg-green-600 text-white';
        return 'bg-slate-700 text-slate-300';
    };

    return (
        <div className="w-80 bg-slate-800 border-r border-slate-700 p-6 h-screen overflow-hidden">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-cyan-400 mb-2">Team: {teamName}</h3>
                <div className="text-sm text-slate-400">Progress: {currentStep}/6</div>
            </div>

            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Questions</h4>
                {questions.map((question, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg border transition-all duration-200 ${question.step === currentStep
                            ? 'border-cyan-400 shadow-lg'
                            : 'border-slate-600'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(question.type)}`}>
                                {question.type}
                            </div>
                            {question.completed && (
                                <div className="text-green-400 text-sm">✓</div>
                            )}
                        </div>
                        <div className={`text-sm font-medium ${getCurrentColor(question.step, currentStep)}`}>
                            {question.title}
                        </div>
                        {question.step === currentStep && (
                            <div className="text-xs text-cyan-400 mt-1">Current</div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-8 p-4 bg-slate-700 rounded-lg">
                <h5 className="text-sm font-semibold text-slate-300 mb-2">Instructions</h5>
                <ul className="text-xs text-slate-400 space-y-1">
                    <li>• Complete aptitude questions to unlock challenges</li>
                    <li>• Each coding challenge has a 5-minute timer</li>
                    <li>• Your progress is saved automatically</li>
                </ul>
            </div>
        </div>
    );
};

export default QuestionSidebar;