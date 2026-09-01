import React, { useCallback, useRef } from 'react';
import { SudokuBoardMatrix, SudokuDigit } from '../types/sudoku.types';
import { InputEntryMode } from '../types/settings.types';

interface NumberKeypadProps {
  readonly board: SudokuBoardMatrix;
  readonly selectedDigit: SudokuDigit | null;
  readonly entryMode: InputEntryMode;
  readonly onSelectDigit: (digit: SudokuDigit) => void;
  readonly onDoubleClickDigit: (digit: SudokuDigit) => void;
}

const DIGITS: readonly SudokuDigit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** Double-click threshold in milliseconds. */
const DOUBLE_CLICK_DELAY_MS = 280;

function countRemainingDigits(board: SudokuBoardMatrix): Map<SudokuDigit, number> {
  const counts = new Map<SudokuDigit, number>();
  for (const d of DIGITS) counts.set(d, 9);

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c].currentValue;
      if (val !== 0) {
        const prev = counts.get(val as SudokuDigit) ?? 9;
        counts.set(val as SudokuDigit, Math.max(0, prev - 1));
      }
    }
  }
  return counts;
}

/**
 * Renders the 1-9 digit selection bar.
 *
 * Single-click selects (or places) a digit.
 * Double-click auto-fills every cell where that digit is the sole candidate.
 */
export const NumberKeypad: React.FC<NumberKeypadProps> = ({
  board,
  selectedDigit,
  entryMode,
  onSelectDigit,
  onDoubleClickDigit,
}) => {
  const remainingCounts = countRemainingDigits(board);
  // Tracks last-click timestamp per digit to detect double-clicks manually
  // (using native onDoubleClick together with onClick causes onClick to fire twice).
  const lastClickTimeRef = useRef<Map<SudokuDigit, number>>(new Map());

  const handleDigitClick = useCallback(
    (digit: SudokuDigit) => {
      const now = Date.now();
      const last = lastClickTimeRef.current.get(digit) ?? 0;
      lastClickTimeRef.current.set(digit, now);

      if (now - last < DOUBLE_CLICK_DELAY_MS) {
        // Double-click: auto-fill singles for this digit.
        lastClickTimeRef.current.set(digit, 0); // reset to avoid triple-click triggering again
        onDoubleClickDigit(digit);
        return;
      }

      // Single click: normal selection / placement.
      onSelectDigit(digit);
    },
    [onSelectDigit, onDoubleClickDigit]
  );

  return (
    <div className="w-full max-w-[500px] mx-auto">
      <div className="grid grid-cols-9 gap-1 sm:gap-2">
        {DIGITS.map((digit) => {
          const remaining = remainingCounts.get(digit) ?? 0;
          const isSelected = selectedDigit === digit;
          const isCompleted = remaining === 0;

          return (
            <button
              key={digit}
              onClick={() => handleDigitClick(digit)}
              title={`Clique: selecionar ${digit} | Duplo-clique: preencher células onde ${digit} é o único candidato`}
              className={`relative flex flex-col items-center justify-center py-2 sm:py-3 rounded-xl font-bold transition-all duration-150 shadow-sm border ${
                isSelected
                  ? 'bg-blue-600 border-blue-700 text-white ring-2 ring-blue-400 shadow-md scale-105'
                  : isCompleted
                  ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-300'
              }`}
            >
              <span className="text-lg sm:text-2xl leading-none">{digit}</span>
              <span
                className={`text-[10px] mt-1 font-medium ${
                  isSelected
                    ? 'text-blue-100'
                    : isCompleted
                    ? 'text-slate-300 dark:text-slate-600'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {isCompleted ? '✓' : remaining}
              </span>
            </button>
          );
        })}
      </div>

      {entryMode === 'digit-first' && (
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2">
          {selectedDigit
            ? `Dígito ${selectedDigit} selecionado — clique em células para preencher · duplo-clique no número para auto-preencher candidatos únicos`
            : 'Clique em um número para selecioná-lo · duplo-clique para preencher células onde ele é o único candidato'}
        </p>
      )}
    </div>
  );
};
