
import React from 'react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentPlayer?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries, currentPlayer }) => {
  return (
    <div className="hidden md:flex flex-col w-72 h-screen bg-slate-900/90 border-r border-slate-700 p-6 z-40 shadow-2xl overflow-hidden">
      <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-6 uppercase tracking-wider drop-shadow-sm text-center">
        Hall of Fame
      </h2>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {entries.length === 0 ? (
          <div className="text-slate-500 text-center italic mt-10 text-sm">
            No champions yet.<br/>Be the first!
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => {
              const isTop3 = index < 3;
              const isCurrent = entry.name === currentPlayer;
              
              return (
                <div 
                  key={`${entry.name}-${entry.date}`}
                  className={`
                    relative p-3 rounded-xl border flex items-center justify-between transition-all duration-300
                    ${isCurrent ? 'bg-indigo-900/30 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-800/40 border-slate-700/50'}
                    ${isTop3 ? 'hover:scale-105' : 'hover:bg-slate-800/60'}
                  `}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Rank Badge */}
                    <div className={`
                      w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm relative
                      ${index === 0 ? 'bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-400/20' : 
                        index === 1 ? 'bg-slate-300 text-slate-800' :
                        index === 2 ? 'bg-amber-700 text-amber-100' :
                        'bg-slate-700 text-slate-400'}
                    `}>
                      {index + 1}
                      {index === 0 && (
                        <span className="absolute -top-2 -right-2 text-xs transform rotate-12 filter drop-shadow-md">👑</span>
                      )}
                    </div>
                    
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className={`font-bold text-sm truncate w-full ${isCurrent ? 'text-indigo-300' : 'text-slate-200'}`}>
                        {entry.name}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end flex-shrink-0 ml-2">
                    <span className="text-lg font-black text-white tabular-nums leading-none">
                      {entry.score}
                    </span>
                    <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider mt-1">Streak</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Bottom decorative fade */}
      <div className="mt-4 pt-4 border-t border-slate-800 text-center">
         <p className="text-[10px] text-slate-600 uppercase tracking-widest">Top Streaks</p>
      </div>
    </div>
  );
};
