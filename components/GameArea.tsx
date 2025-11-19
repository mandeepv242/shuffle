import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Cup } from './Cup';
import Commentary from './Commentary';
import { GameState, CupData } from '../types';
import { SHUFFLE_SPEED_MS, TOTAL_SHUFFLES } from '../constants';
import { generateHostCommentary } from '../services/geminiService';
import { motion } from 'framer-motion';

interface GameCupData extends CupData {
  hasBall: boolean;
}

const GameArea: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [cups, setCups] = useState<GameCupData[]>([
    { id: 0, hasBall: false },
    { id: 1, hasBall: true }, // Middle starts with ball
    { id: 2, hasBall: false },
  ]);
  
  // `positions` maps Cup ID to Slot Index (0, 1, 2)
  // positions[0] = 2 means Cup #0 is in the Right slot.
  const [positions, setPositions] = useState<number[]>([0, 1, 2]);
  
  const [streak, setStreak] = useState(0);
  const [commentary, setCommentary] = useState("Initializing connection...");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [revealedCupId, setRevealedCupId] = useState<number | null>(null);

  // Sound effect refs (optional, but good practice to prep structure)
  const shuffleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch initial AI greeting
  useEffect(() => {
    updateCommentary(GameState.IDLE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateCommentary = async (state: GameState) => {
    setIsAiThinking(true);
    const text = await generateHostCommentary(state, streak);
    setCommentary(text);
    setIsAiThinking(false);
  };

  const startGame = () => {
    if (gameState === GameState.SHUFFLING) return;
    
    setRevealedCupId(null); // Hide ball
    setGameState(GameState.SHUFFLING);
    updateCommentary(GameState.SHUFFLING);
    
    let moves = 0;
    const maxMoves = TOTAL_SHUFFLES + Math.floor(Math.random() * 5); // Randomize slightly

    shuffleIntervalRef.current = setInterval(() => {
      performShuffleStep();
      moves++;
      if (moves >= maxMoves) {
        finishShuffling();
      }
    }, SHUFFLE_SPEED_MS);
  };

  const performShuffleStep = () => {
    setPositions(prev => {
      const newPositions = [...prev];
      // Pick two random slots to swap
      const slotA = Math.floor(Math.random() * 3);
      let slotB = Math.floor(Math.random() * 3);
      while (slotB === slotA) slotB = Math.floor(Math.random() * 3);

      // Find which cups are in these slots
      const cupA = newPositions.findIndex(pos => pos === slotA);
      const cupB = newPositions.findIndex(pos => pos === slotB);

      // Swap their target slots
      newPositions[cupA] = slotB;
      newPositions[cupB] = slotA;

      return newPositions;
    });
  };

  const finishShuffling = () => {
    if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);
    setGameState(GameState.GUESSING);
    updateCommentary(GameState.GUESSING);
  };

  const handleCupClick = (clickedCupId: number) => {
    if (gameState !== GameState.GUESSING) return;

    setRevealedCupId(clickedCupId);
    const isWin = cups.find(c => c.id === clickedCupId)?.hasBall;

    if (isWin) {
      setGameState(GameState.WIN);
      const newStreak = streak + 1;
      setStreak(newStreak);
      updateCommentary(GameState.WIN);
    } else {
      setGameState(GameState.LOSE);
      setStreak(0);
      updateCommentary(GameState.LOSE);
      
      // Reveal the actual ball after a delay if they lost
      setTimeout(() => {
         const winner = cups.find(c => c.hasBall);
         if (winner) setRevealedCupId(winner.id);
      }, 1000);
    }
  };

  // Helper to find current slot of a cup ID for rendering
  const getSlotForCup = (id: number) => positions[id];

  return (
    <div className="flex flex-col items-center w-full max-w-4xl px-4">
      
      {/* Header / HUD */}
      <div className="flex justify-between w-full max-w-2xl mb-6 text-cyan-400 font-display uppercase tracking-widest border-b border-cyan-900/50 pb-2">
        <span>Mode: <span className="text-white">{gameState}</span></span>
        <span>Streak: <span className="text-yellow-400">{streak}</span></span>
      </div>

      <Commentary text={commentary} isLoading={isAiThinking} />

      {/* Game Table */}
      <div className="relative w-full max-w-2xl h-[350px] bg-slate-900/80 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Table Felt Texture/Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

        {/* Cups Container */}
        <div className="absolute inset-x-4 bottom-4 h-full">
            {cups.map((cup) => (
                <Cup 
                    key={cup.id}
                    id={cup.id}
                    positionIndex={getSlotForCup(cup.id)}
                    isRaised={
                        // Reveal if it's the specific revealed cup, OR if game over and it has the ball
                        revealedCupId === cup.id || 
                        (gameState === GameState.LOSE && cup.hasBall && revealedCupId !== null)
                    }
                    disabled={gameState !== GameState.GUESSING}
                    onClick={() => handleCupClick(cup.id)}
                    showHighlight={
                        (gameState === GameState.WIN && cup.hasBall) ||
                        (gameState === GameState.LOSE && cup.hasBall)
                    }
                />
            ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8">
        {(gameState === GameState.IDLE || gameState === GameState.WIN || gameState === GameState.LOSE) && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="
              px-12 py-4 
              bg-cyan-600 hover:bg-cyan-500 
              text-white font-bold font-display text-xl 
              rounded-full shadow-[0_0_20px_rgba(8,145,178,0.6)] 
              transition-all
              border border-cyan-400
            "
          >
            {gameState === GameState.IDLE ? "START GAME" : "PLAY AGAIN"}
          </motion.button>
        )}
        
        {gameState === GameState.SHUFFLING && (
            <div className="text-cyan-500 animate-pulse font-display tracking-widest">SHUFFLING SEQUENCE ACTIVE...</div>
        )}
         {gameState === GameState.GUESSING && (
            <div className="text-yellow-500 animate-bounce font-display tracking-widest">SELECT A TARGET</div>
        )}
      </div>

    </div>
  );
};

export default GameArea;