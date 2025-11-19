
import React, { useState, useEffect } from 'react';

interface NameModalProps {
  isOpen: boolean;
  initialName: string;
  onSubmit: (name: string) => void;
}

export const NameModal: React.FC<NameModalProps> = ({ isOpen, initialName, onSubmit }) => {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState(false);

  useEffect(() => {
    setName(initialName);
  }, [initialName, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(true);
      return;
    }
    onSubmit(name.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl transform scale-100 transition-all">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">WHO CHALLENGES?</h2>
          <p className="text-slate-400">Enter your name to enter the arena.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(false);
              }}
              placeholder="Your Name"
              maxLength={12}
              autoFocus
              className={`
                w-full bg-slate-800/50 border-2 rounded-xl px-6 py-4 text-xl text-center text-white placeholder-slate-600 font-bold outline-none transition-all
                ${error ? 'border-red-500 focus:border-red-400' : 'border-slate-700 focus:border-indigo-500 group-hover:border-slate-600'}
              `}
            />
            {error && (
              <p className="absolute -bottom-6 left-0 right-0 text-center text-red-500 text-sm font-medium animate-pulse">
                Please enter a name!
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-lg rounded-xl shadow-lg shadow-indigo-900/30 transform transition-all active:scale-95 hover:-translate-y-0.5"
          >
            ENTER THE GAME
          </button>
        </form>
      </div>
    </div>
  );
};
