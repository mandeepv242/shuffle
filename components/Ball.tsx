
import React from 'react';

interface BallProps {
  positionIndex: number; // The visual slot (0, 1, 2) where the ball currently is
  isHidden?: boolean;
}

export const Ball: React.FC<BallProps> = ({ positionIndex, isHidden }) => {
  const leftPositions = ['15%', '50%', '85%'];

  return (
    <div
      className="absolute top-1/2 w-10 h-10 sm:w-12 sm:h-12 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-in-out z-10 pointer-events-none"
      style={{
        left: leftPositions[positionIndex],
        marginTop: '2rem',
        opacity: isHidden ? 0 : 1
      }}
    >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.5),0_4px_8px_rgba(0,0,0,0.4)]">
            {/* Highlight */}
            <div className="absolute top-2 left-2 w-3 h-3 bg-white/60 rounded-full blur-[1px]"></div>
        </div>
    </div>
  );
};
