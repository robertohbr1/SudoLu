import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Timer, AlertTriangle, RotateCcw, X } from 'lucide-react';
import { DifficultyLevel } from '../types/sudoku.types';

interface VictoryModalProps {
  readonly isOpen: boolean;
  readonly difficulty: DifficultyLevel;
  readonly timerSeconds: number;
  readonly mistakesCount: number;
  readonly onPlayAgain: () => void;
  readonly onClose?: () => void;
}

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
  expert: 'Especialista',
};

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  difficulty,
  timerSeconds,
  mistakesCount,
  onPlayAgain,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
        {onClose && (
          <button
            onClick={onClose}
            title="Fechar e ver tabuleiro"
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-950/60 text-amber-500 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
          <Trophy className="w-9 h-9" />
        </div>

        <h2 id="victory-modal-title" className="text-2xl font-black text-slate-900 dark:text-white">
          Parabéns!
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Você concluiu o desafio com sucesso!</p>

        <div className="grid grid-cols-2 gap-3 my-6 text-left">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Dificuldade</div>
            <div className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {DIFFICULTY_LABELS[difficulty]}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Timer className="w-3.5 h-3.5 text-blue-500" /> Tempo
            </div>
            <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-100 mt-0.5">
              {formatDuration(timerSeconds)}
            </div>
          </div>

          <div className="col-span-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Erros cometidos
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{mistakesCount}</span>
          </div>
        </div>

        <button
          onClick={onPlayAgain}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition"
        >
          <RotateCcw className="w-4 h-4" />
          Jogar Novamente
        </button>
      </div>
    </div>
  );
};
