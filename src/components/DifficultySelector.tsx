import React from 'react';
import { DifficultyLevel } from '../types/sudoku.types';

interface DifficultySelectorProps {
  readonly currentDifficulty: DifficultyLevel;
  readonly onSelectDifficulty: (difficulty: DifficultyLevel) => void;
}

const DIFFICULTIES: readonly { key: DifficultyLevel; label: string }[] = [
  { key: 'easy', label: 'Fácil' },
  { key: 'medium', label: 'Médio' },
  { key: 'hard', label: 'Difícil' },
  { key: 'expert', label: 'Especialista' },
];

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  currentDifficulty,
  onSelectDifficulty,
}) => {
  return (
    <div className="flex bg-slate-200/80 dark:bg-slate-800/80 p-1 rounded-xl text-sm font-medium">
      {DIFFICULTIES.map(({ key, label }) => {
        const isActive = currentDifficulty === key;
        return (
          <button
            key={key}
            onClick={() => onSelectDifficulty(key)}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all duration-150 ${
              isActive
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
