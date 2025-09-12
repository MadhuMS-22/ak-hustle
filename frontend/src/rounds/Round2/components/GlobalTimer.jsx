import React, { useState, useEffect } from 'react';

const GlobalTimer = ({ startTime }) => {
    const [timeElapsed, setTimeElapsed] = useState(0);

    useEffect(() => {
        if (!startTime) return;

        const interval = setInterval(() => {
            setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
            <div className="text-white text-sm font-mono">
                <span className="text-gray-300">Time:</span>
                <span className="ml-2 text-blue-400 font-bold">
                    {formatTime(timeElapsed)}
                </span>
            </div>
        </div>
    );
};

export default GlobalTimer;
