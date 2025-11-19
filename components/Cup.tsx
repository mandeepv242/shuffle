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
  // 3D Positioning Logic
  // We use left percentages for X position
  const leftPositions = ['20%', '50%', '80%'];
  
  // The cup stands upright (counter-rotated) while the table is tilted.
  // Table tilt is approx 15deg (defined in parent).
  const TILT_COMPENSATION = 'rotateX(-15deg)';

  return (
    <div
      className="absolute top-1/2 w-24 h-24 sm:w-32 sm:h-32 transition-all duration-200 ease-linear z-20"
      style={{
        left: leftPositions[positionIndex],
        transform: `translate(-50%, -50%)`, // Center the wrapper on its coordinate
        transformStyle: 'preserve-3d',
        cursor: disabled ? 'default' : 'pointer',
      }}
      onClick={!disabled ? onClick : undefined}
    >
      {/* SHADOW - Lies flat on the table */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-8 bg-black/40 rounded-[100%] blur-md transition-all duration-300"
        style={{
           transform: `translate(-50%, ${isRaised ? '40px' : '10px'}) scale(${isRaised ? 0.6 : 1.2})`,
           opacity: isRaised ? 0.2 : 0.5,
        }}
      />

      {/* CUP BODY - Stands upright via counter-rotation */}
      <div 
        className="relative w-full h-full transition-all duration-300 ease-out"
        style={{
          transform: `${TILT_COMPENSATION} translateY(${isRaised ? '-120px' : '-20px'})`,
          transformStyle: 'preserve-3d'
        }}
      >
        <div className={`relative group w-24 h-32 sm:w-28 sm:h-36 mx-auto ${!disabled ? 'hover:scale-105' : ''} transition-transform duration-200`}>
            
            {/* Main Cup Front (Upside Down: Rounded Top Base, Flat Bottom Rim) */}
            <div 
              className={`
                absolute inset-0 
                bg-gradient-to-br from-red-500 via-red-600 to-red-800 
                rounded-t-[3rem] rounded-b-2xl
                border-x border-t border-white/10
                shadow-[inset_10px_0_20px_rgba(0,0,0,0.2),inset_-5px_0_10px_rgba(255,255,255,0.1)]
                flex items-center justify-center overflow-hidden
                ${showHighlight ? 'ring-4 ring-yellow-400/80 shadow-[0_0_30px_rgba(250,204,21,0.5)]' : 'shadow-xl'}
                z-10
              `}
            >
               {/* Reflection/Sheen */}
               <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-black/20 to-transparent opacity-40 pointer-events-none"></div>
               <div className="absolute top-4 right-8 w-3 h-20 bg-white/10 rounded-full blur-[2px] transform -rotate-3 pointer-events-none"></div>
               
               {/* Decorative ridges - now near the bottom (rim) and top (base) */}
               <div className="absolute bottom-8 w-full h-[1px] bg-black/20"></div>
               <div className="absolute bottom-10 w-full h-[1px] bg-black/20"></div>
               <div className="absolute top-8 w-full h-[1px] bg-black/10"></div>
            </div>

            {/* Cup Rim (The Lip) - Now at Bottom */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[110%] h-7 bg-red-700 rounded-[100%] border border-red-500 shadow-lg z-20">
               {/* Subtle highlight on rim */}
               <div className="absolute top-[1px] left-[10%] w-[80%] h-[2px] bg-white/20 rounded-full blur-[1px]"></div>
            </div>
            
        </div>
      </div>
    </div>
  );
};
