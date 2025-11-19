import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Cup } from './components/Cup';
import { Ball } from './components/Ball';
import { Leaderboard } from './components/Leaderboard';
import { NameModal } from './components/NameModal';
import { GameState, CupData, LeaderboardEntry } from './types';
import { SHUFFLE_SPEED_MS, TOTAL_SHUFFLES, TOTAL_GAME_ROUNDS } from './constants';
import { playSound } from './services/audioService';

const LEADERBOARD_KEY = 'cup_shuffle_leaderboard_v1';

const App: React.FC = () => {
  // --- State ---
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [cups, setCups] = useState<CupData[]>([{ id: 0 }, { id: 1 }, { id: 2 }]);
  const [cupPositions, setCupPositions] = useState<number[]>([0, 1, 2]); 
  const [winningCupId, setWinningCupId] = useState<number>(1);
  
  // Session Stats
  const [streak, setStreak] = useState<number>(0);
  const [sessionBestStreak, setSessionBestStreak] = useState<number>(0);
  const [stats, setStats] = useState({ wins: 0, total: 0 }); 
  const [roundsPlayed, setRoundsPlayed] = useState<number>(0);

  const [lastGuessedCupId, setLastGuessedCupId] = useState<number | null>(null);

  // Leaderboard & Player State
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerName, setPlayerName] = useState<string>("");
  const [showNameModal, setShowNameModal] = useState<boolean>(false);

  // Refs
  const shuffleCountRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Initialization ---
  useEffect(() => {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setLeaderboard(parsed);
        }
      } catch (e) {
        console.error("Failed to parse leaderboard", e);
      }
    }
    // Show name modal on initial load
    setShowNameModal(true);
  }, []);

  // --- Helpers ---
  
  const saveToLeaderboard = (name: string, maxStreak: number) => {
    if (maxStreak === 0 || !name) return;

    setLeaderboard(prev => {
      let updated = [...prev];
      
      // Check if player exists
      const existingIndex = updated.findIndex(entry => entry.name === name);
      
      if (existingIndex !== -1) {
        // Only update if new streak is higher than personal best
        if (maxStreak > updated[existingIndex].score) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            score: maxStreak,
            date: Date.now()
          };
        }
      } else {
        // Add new player
        updated.push({
          name: name,
          score: maxStreak,
          date: Date.now()
        });
      }
      
      // Sort desc and limit to top 50
      updated.sort((a, b) => b.score - a.score);
      updated = updated.slice(0, 50);
      
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // --- Game Flow ---

  const handleNameSubmit = (name: string) => {
    setPlayerName(name);
    setShowNameModal(false);
    startNewSession(name);
  };

  const startNewSession = (name: string) => {
    // Reset everything for a fresh 10-round game
    setStats({ wins: 0, total: 0 });
    setStreak(0);
    setSessionBestStreak(0);
    setRoundsPlayed(0);
    
    // Start Round 1 immediately
    setTimeout(() => {
        startRoundLogic(name);
    }, 2000);
  };

  const startRoundLogic = (name?: string) => {
    playSound('start');
    const newWinningId = Math.floor(Math.random() * 3);
    setWinningCupId(newWinningId);
    setLastGuessedCupId(null);
    setGameState(GameState.REVEALING_START);
    
    timeoutRef.current = setTimeout(() => {
      playSound('reveal');
      setGameState(GameState.COVERING);
      
      timeoutRef.current = setTimeout(() => {
         startShuffling();
      }, 800);
    }, 1200);
  };

  const startShuffling = () => {
    setGameState(GameState.SHUFFLING);
    shuffleCountRef.current = 0;
    performShuffleStep();
  };

  const performShuffleStep = () => {
    if (shuffleCountRef.current >= TOTAL_SHUFFLES) {
      setGameState(GameState.GUESSING);
      return;
    }

    shuffleCountRef.current += 1;
    playSound('shuffle');

    setCupPositions((prevPositions) => {
      const newPositions = [...prevPositions];
      const posA = Math.floor(Math.random() * 3);
      let posB = Math.floor(Math.random() * 3);
      while (posA === posB) {
        posB = Math.floor(Math.random() * 3);
      }
      const cupIdA = newPositions.findIndex(pos => pos === posA);
      const cupIdB = newPositions.findIndex(pos => pos === posB);
      newPositions[cupIdA] = posB;
      newPositions[cupIdB] = posA;
      return newPositions;
    });

    const speed = Math.max(180, SHUFFLE_SPEED_MS - (shuffleCountRef.current * 8));
    timeoutRef.current = setTimeout(performShuffleStep, speed);
  };

  const handleCupClick = (clickedCupId: number) => {
    if (gameState !== GameState.GUESSING) return;
    
    playSound('click');
    setLastGuessedCupId(clickedCupId);
    setGameState(GameState.REVEALED);

    const isWin = clickedCupId === winningCupId;
    const currentRound = roundsPlayed + 1;

    // Update Stats
    const newStreak = isWin ? streak + 1 : 0;
    const newBest = Math.max(sessionBestStreak, newStreak);
    
    setStreak(newStreak);
    setSessionBestStreak(newBest);
    setStats(prev => ({
      wins: prev.wins + (isWin ? 1 : 0),
      total: currentRound
    }));
    setRoundsPlayed(currentRound);

    if (isWin) {
      setTimeout(() => playSound('win'), 100);
    } else {
      setTimeout(() => playSound('lose'), 100);
    }
  };

  const handleNextAction = () => {
    if (roundsPlayed >= TOTAL_GAME_ROUNDS) {
        finishSession();
    } else {
        startRoundLogic();
    }
  };

  const finishSession = () => {
      setGameState(GameState.SUMMARY);
      saveToLeaderboard(playerName, sessionBestStreak);
  };

  const handleExitToMenu = () => {
      setShowNameModal(true);
      setGameState(GameState.IDLE);
      setPlayerName("");
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // --- Render ---
  
  const getCupRaisedState = (cupId: number) => {
     if (gameState === GameState.REVEALING_START) return cupId === winningCupId;
     if (gameState === GameState.REVEALED) return cupId === winningCupId || cupId === lastGuessedCupId;
     return false;
  };

  const ballVisualPosition = cupPositions[winningCupId];
  const winRate = stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_50%_30%,#1e293b_0%,#0f172a_50%,#000000_100%)] flex relative overflow-hidden font-sans">
      
      {/* Left Sidebar: Leaderboard */}
      <Leaderboard entries={leaderboard} currentPlayer={playerName} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative min-h-screen">
        
        {/* Header / Scoreboard */}
        <div className="absolute top-0 w-full p-4 md:p-6 flex flex-col md:flex-row justify-center md:justify-between items-center z-30 gap-4 pointer-events-none">
           <div className="text-center md:text-left pointer-events-auto">
             <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 tracking-tighter drop-shadow-lg">
               SHUFFLE
             </h1>
             <p className="text-slate-400 font-medium text-sm tracking-widest uppercase">
               {playerName ? `Player: ${playerName}` : 'Master the Cup'}
             </p>
           </div>

           <div className="flex gap-3 pointer-events-auto">
             {/* Round Counter */}
             <div className="bg-indigo-900/80 backdrop-blur-md border border-indigo-500/50 px-4 py-2 rounded-xl shadow-xl text-center min-w-[100px]">
                  <div className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider">Round</div>
                  <div className="text-xl font-bold text-white">{roundsPlayed} / {TOTAL_GAME_ROUNDS}</div>
              </div>
              
              {/* Wins Counter */}
              <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-xl shadow-xl text-center min-w-[80px]">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Wins</div>
                  <div className={`text-xl font-bold ${stats.wins > 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                     {stats.wins}
                  </div>
              </div>

              {/* Win % */}
              <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-xl shadow-xl text-center min-w-[80px]">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Win %</div>
                  <div className={`text-xl font-bold ${stats.wins > 0 ? 'text-blue-400' : 'text-slate-200'}`}>
                     {winRate}%
                  </div>
              </div>
              
              {/* Streak */}
              <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-xl shadow-xl text-center min-w-[80px]">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Streak</div>
                  <div className={`text-xl font-bold ${streak > 0 ? 'text-green-400' : 'text-slate-200'}`}>
                     {streak}
                  </div>
              </div>
           </div>
        </div>

        {/* Game Table / Summary View */}
        {gameState === GameState.SUMMARY ? (
           <div className="relative w-full max-w-md p-8 bg-slate-900/90 border border-yellow-500/30 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col items-center z-50 animate-in zoom-in duration-300">
               <div className="absolute -top-10">
                  <div className="text-6xl filter drop-shadow-lg">🏆</div>
               </div>
               <h2 className="text-3xl font-black text-white mt-6 mb-2">SESSION COMPLETE</h2>
               <p className="text-slate-400 mb-8 text-center">Great hustle, {playerName}! Here is your performance report.</p>
               
               <div className="grid grid-cols-2 gap-4 w-full mb-8">
                   <div className="bg-slate-800 p-4 rounded-2xl text-center border border-slate-700">
                       <div className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">Wins</div>
                       <div className="text-3xl font-black text-blue-400">{stats.wins}/{TOTAL_GAME_ROUNDS}</div>
                   </div>
                   <div className="bg-slate-800 p-4 rounded-2xl text-center border border-slate-700">
                       <div className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">Win Rate</div>
                       <div className="text-3xl font-black text-purple-400">{winRate}%</div>
                   </div>
                   <div className="col-span-2 bg-gradient-to-r from-slate-800 to-slate-800/50 p-4 rounded-2xl text-center border border-slate-700 relative overflow-hidden">
                       <div className="absolute inset-0 bg-yellow-500/5"></div>
                       <div className="relative z-10">
                           <div className="text-yellow-500 text-xs uppercase tracking-wider font-bold mb-1">Highest Streak</div>
                           <div className="text-4xl font-black text-yellow-400">{sessionBestStreak}</div>
                       </div>
                   </div>
               </div>

               <button 
                 onClick={handleExitToMenu}
                 className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-lg rounded-xl shadow-lg shadow-indigo-900/30 transition-all hover:scale-[1.02] active:scale-95"
               >
                 SAVE & NEW GAME
               </button>
           </div>
        ) : (
           /* 3D STAGE CONTAINER */
           <div className="relative w-full max-w-4xl h-[500px] flex items-center justify-center perspective-[1200px] group">
             
             {/* TABLE PLANE (Tilted) */}
             <div 
                className="relative w-full h-full"
                style={{ transformStyle: 'preserve-3d', transform: 'rotateX(15deg)' }}
             >
                 {/* Table Surface Texture (Lightweight) */}
                 <div className="absolute inset-x-0 bottom-[20%] h-[300px] bg-white/5 rounded-[100%] blur-3xl -z-10 pointer-events-none"></div>

                 {/* BALL (Rendered first to be behind/under cups in DOM order if same Z, but we handle with Z-index too) */}
                 <Ball positionIndex={ballVisualPosition} isHidden={gameState === GameState.SHUFFLING} />
                 
                 {/* CUPS */}
                 {cups.map((cup) => (
                   <Cup
                     key={cup.id}
                     id={cup.id}
                     positionIndex={cupPositions[cup.id]}
                     isRaised={getCupRaisedState(cup.id)}
                     onClick={() => handleCupClick(cup.id)}
                     disabled={gameState !== GameState.GUESSING}
                     showHighlight={gameState === GameState.REVEALED && cup.id === winningCupId}
                   />
                 ))}
             </div>
           </div>
        )}

        {/* Controls */}
        <div className="z-30 mt-4 h-20 flex items-center justify-center">
           {gameState === GameState.IDLE && !showNameModal && (
             <div className="text-slate-400 animate-pulse">Waiting for player...</div>
           )}

           {gameState === GameState.REVEALED && (
              <div className="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-4 duration-300">
                 <div className="text-2xl font-bold mb-2">
                   {lastGuessedCupId === winningCupId ? 
                     <span className="text-green-400 drop-shadow-md flex items-center gap-2">✅ Correct!</span> : 
                     <span className="text-red-400 drop-shadow-md flex items-center gap-2">❌ Missed it!</span>
                   }
                 </div>
                 <button 
                   onClick={handleNextAction}
                   className="px-10 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-full font-black text-white transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 uppercase tracking-wide text-sm"
                 >
                   {roundsPlayed >= TOTAL_GAME_ROUNDS ? "See Results" : "Next Round"}
                 </button>
              </div>
           )}

           {gameState === GameState.SHUFFLING && (
              <div className="text-cyan-400 font-bold text-lg tracking-[0.2em] animate-pulse uppercase">
                 Shuffling...
              </div>
           )}
           
           {gameState === GameState.GUESSING && (
              <div className="text-yellow-400 font-black text-2xl animate-bounce drop-shadow-lg uppercase tracking-widest">
                 Pick a Cup!
              </div>
           )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-2 text-slate-600 text-[10px] text-center w-full tracking-widest uppercase opacity-50">
           3D CSS Engine
        </div>
      </div>

      {/* Name Input Modal */}
      <NameModal 
        isOpen={showNameModal} 
        onSubmit={handleNameSubmit} 
        initialName={playerName}
      />
    </div>
  );
};

export default App;