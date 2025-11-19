import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentaryProps {
  text: string;
  isLoading: boolean;
}

const Commentary: React.FC<CommentaryProps> = ({ text, isLoading }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8 min-h-[80px] relative flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-cyan-950/20 border border-cyan-800/30 rounded-lg skew-x-[-10deg] backdrop-blur-sm" />
      
      <AnimatePresence mode='wait'>
        {isLoading ? (
           <motion.div
             key="loader"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="flex space-x-1 z-10"
           >
             {[0, 1, 2].map(i => (
               <div key={i} className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.15}s`}} />
             ))}
           </motion.div>
        ) : (
          <motion.p
            key={text}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            className="text-cyan-100 font-display text-center text-lg md:text-xl tracking-wide z-10"
          >
            <span className="text-cyan-400 mr-2">AI_DEALER &gt;</span>
            {text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Commentary;