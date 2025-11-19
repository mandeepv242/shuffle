
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Cup } from './components/Cup';
import { Ball } from './components/Ball';
import { Host } from './components/Host';
import { GameState, CupData } from './types';
import { SHUFFLE_SPEED_MS, TOTAL_SHUFFLES } from './constants';
import { generateHostCommentary } from './services/geminiService';
import { playSound } from './services/audioService';

const App: React.FC = () => {
  // --- State ---
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [cups, setCups] = useState<CupData[]>([{ id: 0 }, { id: 1 }, { id: 2 }]);
  const [cupPositions, setCupPositions] = useState<number[]>([0, 1, 2]); // Index is cupId, Value is PositionIndex (0-2)
  const [winningCupId, setWinningCupId] = useState<number>(1);
  const [streak, setStreak] = useState<number>(0);
  const [stats, setStats] = useState({ wins: 0, total: 0 }); // New stats state
  const [hostMessage, setHostMessage] = useState<string>("Welcome to the table! Step right up and test your eyes!");
  const [isHostThinking, setIsHostThinking] = useState<boolean>(false);
  const [lastGuessedCupId, setLastGuessedCupId] = useState<number | null>(null);

  // Refs for managing animations without re-renders triggering infinite loops
  const shuffleCountRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Helpers ---
  
  // Update the AI Host
  const updateHost = useCallback(async (context: string) => {
    setIsHostThinking(true);
    const comment = await generateHostCommentary(context, streak);
    setHostMessage(comment);
    setIsHostThinking(false);
  }, [streak]);

  // Start Game Sequence
  const handleStartGame = useCallback(() => {
    // 1. Reset Setup
    playSound('start');
    const newWinningId = Math.floor(Math.random() * 3);
    setWinningCupId(newWinningId);
    setLastGuessedCupId(null);
    setGameState(GameState.REVEALING_START);
    updateHost("The game is starting! Watch the ball carefully.");

    // 2. Show ball initially (Cups raised)
    timeoutRef.current = setTimeout(() => {
      playSound('reveal');
      setGameState(GameState.COVERING);
      
      // 3. Lower cups (Hide ball)
      timeoutRef.current = setTimeout(() => {
         startShuffling();
      }, 800); // Slightly faster start
    }, 1200);
  }, [updateHost, streak]);

  // Shuffle Logic
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
      // Pick two random positions (0, 1, 2) to swap
      const posA = Math.floor(Math.random() * 3);
      let posB = Math.floor(Math.random() * 3);
      while (posA === posB) {
        posB = Math.floor(Math.random() * 3);
      }

      // Find which cups are at these positions
      const cupIdA = newPositions.findIndex(pos => pos === posA);
      const cupIdB = newPositions.findIndex(pos => pos === posB);

      // Swap their position values
      newPositions[cupIdA] = posB;
      newPositions[cupIdB] = posA;

      return newPositions;
    });

    // Schedule next shuffle. Accelerate over time.
    // Start at SHUFFLE_SPEED_MS (250), decrease by 10ms each step, but don't go below 180ms.
    const speed = Math.max(180, SHUFFLE_SPEED_MS - (shuffleCountRef.current * 8));
    timeoutRef.current = setTimeout(performShuffleStep, speed);
  };

  // Handle User Guess
  const handleCupClick = (clickedCupId: number) => {
    if (gameState !== GameState.GUESSING) return;
    
    playSound('click');
    setLastGuessedCupId(clickedCupId);
    setGameState(GameState.REVEALED);

    const isWin = clickedCupId === winningCupId;

    // Update Stats
    setStats(prev => ({
      wins: prev.wins + (isWin ? 1 : 0),
      total: prev.total + 1
    }));

    if (isWin) {
      // Win
      setTimeout(() => playSound('win'), 100);
      setStreak(s => s + 1);
      updateHost("Player guessed correctly! They won this round.");
    } else {
      // Loss
      setTimeout(() => playSound('lose'), 100);
      setStreak(0);
      updateHost("Player guessed wrong. They lost the streak.");
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // --- Render Calculation ---
  
  // Is a specific cup raised?
  const getCupRaisedState = (cupId: number) => {
     if (gameState === GameState.REVEALING_START) {
       return cupId === winningCupId;
     }
     if (gameState === GameState.REVEALED) {
       return cupId === winningCupId || cupId === lastGuessedCupId;
     }
     return false;
  };

  // Where is the ball visually?
  // The ball is physically under the `winningCupId`. 
  // So visual position index = cupPositions[winningCupId].
  const ballVisualPosition = cupPositions[winningCupId];

  // Calculate Win Rate
  const winRate = stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col items-center justify-center relative overflow-hidden select-none">
      
      {/* Header / Scoreboard */}
      <div className="absolute top-0 w-full p-4 md:p-6 flex flex-col md:flex-row justify-between items-center md:items-start z-30 gap-4 pointer-events-none">
         <div className="text-center md:text-left pointer-events-auto">
           <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 tracking-tighter drop-shadow-lg">
             SHUFFLE
           </h1>
           <p className="text-slate-400 font-medium text-sm tracking-widest uppercase">Master the Cup</p>
         </div>

         <div className="flex gap-3 pointer-events-auto">
            {/* Tries */}
            <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-xl shadow-xl text-center min-w-[80px]">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tries</div>
                <div className="text-xl font-bold text-white">
                   {stats.total}
                </div>
            </div>

            {/* Win Rate */}
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

      {/* Game Area (The Table) */}
      <div className="relative w-full max-w-4xl h-[400px] flex items-center justify-center perspective-container">
         
         {/* Table Surface Visual */}
         <div className="absolute bottom-10 w-[90%] h-[200px] bg-emerald-900/20 rounded-[50%] blur-3xl -z-10 pointer-events-none"></div>

         {/* The Ball (Rendered independently behind cups but logically linked) */}
         {/* Only visible if the covering cup is raised or explicitly needed, kept hidden during shuffle */}
         <Ball 
           positionIndex={ballVisualPosition} 
           isHidden={gameState === GameState.SHUFFLING}
         />

         {/* The Cups */}
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

      {/* Controls / Overlay Text */}
      <div className="z-30 mt-8 h-20 flex items-center justify-center">
         {gameState === GameState.IDLE && (
           <button 
             onClick={handleStartGame}
             className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full font-bold text-lg shadow-lg hover:shadow-indigo-500/50 hover:scale-105 transition-all active:scale-95 ring-2 ring-white/20"
           >
             Start Game
           </button>
         )}

         {gameState === GameState.REVEALED && (
            <div className="flex flex-col items-center gap-2">
               <div className="text-2xl font-bold mb-2 animate-bounce">
                 {lastGuessedCupId === winningCupId ? 
                   <span className="text-green-400 drop-shadow-md">Correct! 🎉</span> : 
                   <span className="text-red-400 drop-shadow-md">Missed it! ❌</span>
                 }
               </div>
               <button 
                 onClick={handleStartGame}
                 className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-full font-semibold text-white transition-colors border border-slate-500"
               >
                 Play Again
               </button>
            </div>
         )}

         {gameState === GameState.SHUFFLING && (
            <div className="text-slate-400 font-mono text-sm animate-pulse">
               Shuffling... Keep your eyes open!
            </div>
         )}
         
         {gameState === GameState.GUESSING && (
            <div className="text-yellow-400 font-bold text-xl animate-pulse drop-shadow-lg">
               Pick a Cup!
            </div>
         )}
      </div>

      {/* AI Host */}
      <Host message={hostMessage} isLoading={isHostThinking} />

      {/* Footer Info */}
      <div className="absolute bottom-2 text-slate-600 text-xs text-center w-full">
         Powered by Google Gemini • Pure CSS Animations
      </div>
    </div>
  );
};

export default App;
