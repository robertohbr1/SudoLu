import { useEffect } from 'react';
import { CellCoordinate, SudokuDigit } from '../types/sudoku.types';

interface KeyboardBindings {
  readonly selectedCell: CellCoordinate | null;
  readonly onSelectCell: (coord: CellCoordinate) => void;
  readonly onDigitInput: (digit: SudokuDigit) => void;
  readonly onErase: () => void;
  readonly onTogglePencilMode: () => void;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly onHint: () => void;
}

function computeArrowNavigation(
  current: CellCoordinate | null,
  deltaRow: number,
  deltaCol: number
): CellCoordinate {
  if (!current) return { row: 0, col: 0 };
  const nextRow = Math.min(8, Math.max(0, current.row + deltaRow));
  const nextCol = Math.min(8, Math.max(0, current.col + deltaCol));
  return { row: nextRow, col: nextCol };
}

export function useKeyboardShortcuts(bindings: KeyboardBindings) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is inside an input field
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement)?.tagName)) {
        return;
      }

      // Undo / Redo
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          bindings.onRedo();
        } else {
          bindings.onUndo();
        }
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        bindings.onRedo();
        return;
      }

      // Number keys 1-9
      const digitMatch = event.key.match(/^[1-9]$/);
      if (digitMatch) {
        event.preventDefault();
        bindings.onDigitInput(parseInt(digitMatch[0], 10) as SudokuDigit);
        return;
      }

      // Erase / Clear
      if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
        event.preventDefault();
        bindings.onErase();
        return;
      }

      // Pencil mode toggle
      if (event.key.toLowerCase() === 'n' || event.key.toLowerCase() === 'p') {
        event.preventDefault();
        bindings.onTogglePencilMode();
        return;
      }

      // Hint
      if (event.key.toLowerCase() === 'h') {
        event.preventDefault();
        bindings.onHint();
        return;
      }

      // Arrow navigation
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        bindings.onSelectCell(computeArrowNavigation(bindings.selectedCell, -1, 0));
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        bindings.onSelectCell(computeArrowNavigation(bindings.selectedCell, 1, 0));
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        bindings.onSelectCell(computeArrowNavigation(bindings.selectedCell, 0, -1));
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        bindings.onSelectCell(computeArrowNavigation(bindings.selectedCell, 0, 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bindings]);
}
