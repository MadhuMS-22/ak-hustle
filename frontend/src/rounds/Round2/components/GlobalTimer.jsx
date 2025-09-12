import React, { useState, useEffect } from 'react';

const GlobalTimer = ({ startTime, isActive }) => {
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        let interval = null;

        if (isActive && startTime) {
            interval = setInterval(() => {
                const now = new Date();
                const elapsed = Math.floor((now - new Date(startTime)) / 1000);
                setElapsedTime(elapsed);
            }, 1000);
        } else if (!isActive && startTime) {
            // When quiz is completed, show final time
            const now = new Date();
            const elapsed = Math.floor((now - new Date(startTime)) / 1000);
            setElapsedTime(elapsed);
        }

        return () => clearInterval(interval);
    }, [isActive, startTime]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    if (!startTime) return null;

    return (
        <div className="bg-slate-700 rounded-lg p-3 mb-4 border border-slate-600">
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-300">
                    {isActive ? 'Quiz Time:' : 'Final Time:'}
                </span>
                <span className={`text-lg font-mono font-bold ${isActive ? 'text-cyan-400' : 'text-green-400'}`}>
                    {formatTime(elapsedTime)}
                </span>
            </div>
        </div>
    );
};

export default GlobalTimer;