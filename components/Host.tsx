
import React from 'react';

interface HostProps {
  message: string;
  isLoading: boolean;
}

export const Host: React.FC<HostProps> = ({ message, isLoading }) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-80 z-50 flex items-end gap-3 animate-fade-in-up">
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full bg-indigo-600 border-4 border-white shadow-lg overflow-hidden flex-shrink-0 relative">
        <img 
            src="https://picsum.photos/200/200?grayscale" 
            alt="Host Ace" 
            className="w-full h-full object-cover"
        />
      </div>
      
      {/* Bubble */}
      <div className="bg-white text-slate-900 p-4 rounded-2xl rounded-bl-none shadow-xl border border-slate-200 relative flex-1">
         <div className="font-bold text-xs text-indigo-600 uppercase mb-1 tracking-wider">Host Ace</div>
         <p className="text-sm md:text-base leading-snug font-medium">
           {isLoading ? (
             <span className="animate-pulse">Thinking...</span>
           ) : (
             message
           )}
         </p>
      </div>
    </div>
  );
};
