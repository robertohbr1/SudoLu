import React from 'react';
import { SudokuCellModel, SudokuDigit } from '../types/sudoku.types';
import { GamePreferenceSettings } from '../types/settings.types';

export type CandidateVisualState = 'hidden' | 'matched' | 'single' | 'normal';

interface SudokuCellProps {
  readonly cell: SudokuCellModel;
  readonly isSelected: boolean;
  readonly isPeer: boolean;
  readonly isMatchingDigit: boolean;
  readonly activeDigit: SudokuDigit | null;
  readonly settings: GamePreferenceSettings;
  readonly onClick: (row: number, col: number) => void;
}

const DIGIT_POSITIONS: readonly SudokuDigit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const CANDIDATE_STATE_CLASSES: Record<CandidateVisualState, string> = {
  hidden: 'invisible',
  matched:
    'bg-blue-600 dark:bg-blue-500 text-white font-extrabold rounded-full shadow-sm ring-1 ring-blue-400/60 scale-105',
  single:
    'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-extrabold rounded-full shadow-sm ring-1 ring-emerald-400/60 scale-105',
  normal: 'text-slate-700 dark:text-slate-200 font-bold',
};

function getCellBackgroundClass(
  isSelected: boolean,
  isInvalid: boolean,
  isMatchingDigit: boolean,
  isPeer: boolean,
  isSingleCandidateCell: boolean
): string {
  if (isInvalid) return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300';
  if (isSelected) {
    return 'bg-blue-200 dark:bg-blue-800/80 text-blue-900 dark:text-blue-50 ring-2 ring-blue-500 z-10';
  }
  if (isMatchingDigit) {
    return 'bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100 ring-1 ring-inset ring-blue-400/50';
  }
  if (isSingleCandidateCell) {
    return 'bg-emerald-50/70 dark:bg-emerald-950/30 text-slate-800 dark:text-slate-200';
  }
  if (isPeer) return 'bg-slate-100/90 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200';
  return 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-blue-50/50 dark:hover:bg-slate-800/60';
}

/**
 * Retorna o conjunto de candidatos visíveis na célula conforme as configurações.
 *
 * @example
 * resolveActiveCandidates(cell, settings)
 */
export function resolveActiveCandidates(
  cell: SudokuCellModel,
  settings: GamePreferenceSettings
): ReadonlySet<SudokuDigit> {
  if (settings.showAutoCandidates) {
    return cell.autoCandidates;
  }
  return cell.manualCandidates;
}

/**
 * Determina o estado visual de um número candidato (1-9) dentro de uma célula vazia.
 *
 * @example
 * resolveCandidateVisualState(new Set([2, 5]), 5, 5, true) // => 'matched'
 */
export function resolveCandidateVisualState(
  activeCandidates: ReadonlySet<SudokuDigit>,
  candidateDigit: SudokuDigit,
  activeDigit: SudokuDigit | null,
  highlightMatchingDigits: boolean
): CandidateVisualState {
  if (!activeCandidates.has(candidateDigit)) {
    return 'hidden';
  }
  if (highlightMatchingDigits && activeDigit !== null && candidateDigit === activeDigit) {
    return 'matched';
  }
  if (activeCandidates.size === 1) {
    return 'single';
  }
  return 'normal';
}

export const SudokuCell: React.FC<SudokuCellProps> = ({
  cell,
  isSelected,
  isPeer,
  isMatchingDigit,
  activeDigit,
  settings,
  onClick,
}) => {
  const activeCandidates = resolveActiveCandidates(cell, settings);
  const isSingleCandidateCell = cell.currentValue === 0 && activeCandidates.size === 1;

  const bgClass = getCellBackgroundClass(
    isSelected,
    cell.isInvalid && settings.highlightConflicts,
    isMatchingDigit && settings.highlightMatchingDigits,
    isPeer && settings.highlightPeerCells,
    isSingleCandidateCell
  );

  return (
    <button
      onClick={() => onClick(cell.row, cell.col)}
      className={`relative w-full aspect-square flex items-center justify-center transition-colors duration-100 focus:outline-none select-none border border-slate-200/70 dark:border-slate-800/70 ${bgClass}`}
    >
      {cell.currentValue !== 0 ? (
        <span
          className={`text-xl sm:text-2xl md:text-3xl font-semibold leading-none ${
            cell.isGiven
              ? 'font-bold text-slate-900 dark:text-slate-100'
              : 'text-blue-600 dark:text-blue-400'
          }`}
        >
          {cell.currentValue}
        </span>
      ) : (
        <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-0.5 gap-[1px] pointer-events-none">
          {DIGIT_POSITIONS.map((num) => {
            const visualState = resolveCandidateVisualState(
              activeCandidates,
              num,
              activeDigit,
              settings.highlightMatchingDigits
            );
            return (
              <span
                key={num}
                className={`w-full h-full flex items-center justify-center text-[9px] sm:text-[10px] md:text-xs leading-none transition-transform duration-100 ${CANDIDATE_STATE_CLASSES[visualState]}`}
              >
                {num}
              </span>
            );
          })}
        </div>
      )}
    </button>
  );
};
