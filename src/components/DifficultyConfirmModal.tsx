import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { DifficultyLevel } from '../types/sudoku.types';

export interface DifficultyConfirmModalProps {
  readonly isOpen: boolean;
  readonly targetDifficulty: DifficultyLevel | null;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
  expert: 'Especialista',
};

/**
 * Resolve o rótulo legível em português para o nível de dificuldade selecionado.
 *
 * @example
 * getDifficultyLabel('hard') // => 'Difícil'
 */
export function getDifficultyLabel(difficulty: DifficultyLevel | null): string {
  if (!difficulty) {
    return '';
  }
  return DIFFICULTY_LABELS[difficulty];
}

/**
 * Modal de confirmação exibido antes de descartar uma partida em andamento ao iniciar um novo desafio.
 *
 * @example
 * <DifficultyConfirmModal isOpen={true} targetDifficulty="medium" onConfirm={confirm} onCancel={cancel} />
 */
export const DifficultyConfirmModal: React.FC<DifficultyConfirmModalProps> = ({
  isOpen,
  targetDifficulty,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen || !targetDifficulty) return null;

  const difficultyLabel = getDifficultyLabel(targetDifficulty);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="difficulty-confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
        <button
          type="button"
          onClick={onCancel}
          title="Cancelar"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 mx-auto bg-amber-100 dark:bg-amber-950/60 text-amber-500 rounded-2xl flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h2
          id="difficulty-confirm-modal-title"
          className="text-xl font-bold text-slate-900 dark:text-white"
        >
          Iniciar novo desafio?
        </h2>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Você tem uma partida em andamento. Deseja descartar o progresso atual e iniciar um novo jogo no nível{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">{difficultyLabel}</span>?
        </p>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="py-2.5 px-4 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            Continuar Jogo
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-md shadow-blue-500/20 transition"
          >
            Novo Desafio
          </button>
        </div>
      </div>
    </div>
  );
};
