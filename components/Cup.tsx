
import React from 'react';

interface CupProps {
  id: number;
  positionIndex: number; // 0 (Left), 1 (Center), 2 (Right)
  isRaised: boolean;
  onClick: () => void;
  disabled: boolean;
  showHighlight?: boolean;
}

export const Cup: React.FC<CupProps> = ({
  id,
  positionIndex,
  isRaised,
  onClick,
  disabled,
  showHighlight
}) => {
  // Calculate position based on index (0, 1, 2)
  // We'll use absolute positioning percentages to be responsive
  // 0 -> 15%, 1 -> 50%, 2 -> 85%
  const leftPositions = ['15%', '50%', '85%'];
  
  return (
    <div
      className="absolute top-1/2 w-24 h-32 sm:w-32 sm:h-40 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-in-out cursor-pointer z-20 select-none touch-manipulation"
      style={{
        left: leftPositions[positionIndex],
        transform: `translate(-50%, ${isRaised ? '-140%' : '-50%'})`, // Lift up logic
      }}
      onClick={!disabled ? onClick : undefined}
    >
      {/* Cup Body */}
      <div className={`relative w-full h-full drop-shadow-2xl group ${disabled ? '' : 'hover:scale-105'} transition-transform`}>
        {/* Main Cup Shape */}
        
        {/* Cup Rim */}
        <div className="absolute bottom-0 w-full h-6 bg-red-700 rounded-full border-2 border-red-900 z-10"></div>
        
        {/* Cup Body Gradient */}
        <div 
          className={`w-full h-full rounded-t-xl rounded-b-[3rem] border-x-2 border-t-2 border-red-900 bg-gradient-to-br from-red-500 via-red-600 to-red-800 shadow-inner flex items-center justify-center
            ${showHighlight ? 'ring-4 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]' : ''}
          `}
        >
           {/* Decorative Stripe */}
           <div className="w-full h-4 bg-white/20 absolute top-8"></div>
           
           {/* ID for debugging (optional, maybe hide in production or keep for style) */}
           <span className="text-red-900/30 font-black text-4xl select-none">{id + 1}</span>
        </div>
        
        {/* Reflection */}
        <div className="absolute top-4 right-4 w-2 h-20 bg-white/20 rounded-full transform -rotate-12 blur-[1px]"></div>
      </div>
      
      {/* Shadow on the table when lifted */}
      <div 
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/40 rounded-[100%] blur-md transition-all duration-200"
        style={{
           opacity: isRaised ? 0.2 : 0.6,
           transform: `translateX(-50%) scale(${isRaised ? 0.8 : 1})`
        }}
      ></div>
    </div>
  );
};
