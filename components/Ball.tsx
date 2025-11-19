import React from 'react';

interface BallProps {
  positionIndex: number; // The visual slot (0, 1, 2) where the ball currently is
  isHidden?: boolean;
}

export const Ball: React.FC<BallProps> = ({ positionIndex, isHidden }) => {
  const leftPositions = ['20%', '50%', '80%'];
  const TILT_COMPENSATION = 'rotateX(-15deg)';

  return (
    <div
      className="absolute top-1/2 w-10 h-10 sm:w-12 sm:h-12 transition-all duration-200 ease-linear z-10 pointer-events-none"
      style={{
        left: leftPositions[positionIndex],
        transform: `translate(-50%, -50%) ${TILT_COMPENSATION}`,
        opacity: isHidden ? 0 : 1,
      }}
    >
        {/* Ball Shadow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-black/60 rounded-[100%] blur-sm"></div>

        {/* Ball Body */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-t from-yellow-600 via-yellow-400 to-yellow-200 shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.4),0_0_10px_rgba(255,200,0,0.3)]">
            {/* Highlight */}
            <div className="absolute top-2 left-3 w-4 h-3 bg-white/80 rounded-[100%] blur-[2px] transform -rotate-45"></div>
        </div>
    </div>
  );
};
