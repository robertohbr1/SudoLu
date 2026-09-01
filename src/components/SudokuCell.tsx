import React from 'react';
import { SudokuCellModel, SudokuDigit } from '../types/sudoku.types';
import { GamePreferenceSettings } from '../types/settings.types';

interface SudokuCellProps {
  readonly cell: SudokuCellModel;
  readonly isSelected: boolean;
  readonly isPeer: boolean;
  readonly isMatchingDigit: boolean;
  readonly isCandidateMatch: boolean;
  readonly settings: GamePreferenceSettings;
  readonly onClick: (row: number, col: number) => void;
}

const DIGIT_POSITIONS: readonly SudokuDigit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function getCellBackgroundClass(
  isSelected: boolean,
  isInvalid: boolean,
  isMatchingDigit: boolean,
  isPeer: boolean
): string {
  if (isInvalid) return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300';
  if (isSelected) return 'bg-blue-200 dark:bg-blue-800/80 text-blue-900 dark:text-blue-50 ring-2 ring-blue-500 z-10';
  if (isMatchingDigit) return 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100';
  if (isPeer) return 'bg-slate-100/90 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200';
  return 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-blue-50/50 dark:hover:bg-slate-800/60';
}

function resolveActiveCandidates(
  cell: SudokuCellModel,
  settings: GamePreferenceSettings
): ReadonlySet<SudokuDigit> {
  if (settings.showAutoCandidates) {
    return cell.autoCandidates;
  }
  return cell.manualCandidates;
}

export const SudokuCell: React.FC<SudokuCellProps> = ({
  cell,
  isSelected,
  isPeer,
  isMatchingDigit,
  isCandidateMatch,
  settings,
  onClick,
}) => {
  const bgClass = getCellBackgroundClass(
    isSelected,
    cell.isInvalid && settings.highlightConflicts,
    isMatchingDigit && settings.highlightMatchingDigits,
    isPeer && settings.highlightPeerCells
  );

  const activeCandidates = resolveActiveCandidates(cell, settings);

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
        <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-0.5 pointer-events-none">
          {DIGIT_POSITIONS.map((num) => {
            const hasCand = activeCandidates.has(num);
            const isMatchedCand = isCandidateMatch && hasCand;
            return (
              <span
                key={num}
                className={`flex items-center justify-center text-[9px] sm:text-[10px] md:text-xs leading-none font-medium ${
                  hasCand
                    ? isMatchedCand
                      ? 'text-blue-600 dark:text-blue-400 font-bold scale-110'
                      : 'text-slate-500 dark:text-slate-400'
                    : 'invisible'
                }`}
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
