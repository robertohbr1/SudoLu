import { describe, it, expect } from 'vitest';
import {
  resolveCandidateVisualState,
  resolveActiveCandidates,
} from '../src/components/SudokuCell';
import { resolveActiveDigit } from '../src/components/SudokuBoard';
import { createInitialCellMatrix } from '../src/engine/gameEngine';
import { INITIAL_GAME_SETTINGS } from '../src/types/settings.types';
import { SudokuDigit, SudokuPuzzlePackage } from '../src/types/sudoku.types';

function createSampleBoard() {
  const initialGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
  initialGrid[0][0] = 7;
  const pkg: SudokuPuzzlePackage = {
    initialGrid,
    solutionGrid: initialGrid,
    difficulty: 'easy',
  };
  return createInitialCellMatrix(pkg);
}

describe('SudokuCell & SudokuBoard candidate highlight', () => {
  it('marks only the candidate matching activeDigit as matched', () => {
    const candidates = new Set<SudokuDigit>([2, 5, 8]);
    expect(resolveCandidateVisualState(candidates, 5, 5, true)).toBe('matched');
    expect(resolveCandidateVisualState(candidates, 2, 5, true)).toBe('normal');
    expect(resolveCandidateVisualState(candidates, 8, 5, true)).toBe('normal');
    expect(resolveCandidateVisualState(candidates, 1, 5, true)).toBe('hidden');
  });

  it('marks sole candidate as single when not matching activeDigit', () => {
    const candidates = new Set<SudokuDigit>([4]);
    expect(resolveCandidateVisualState(candidates, 4, null, true)).toBe('single');
    expect(resolveCandidateVisualState(candidates, 4, 9, true)).toBe('single');
    expect(resolveCandidateVisualState(candidates, 4, 4, true)).toBe('matched');
  });

  it('does not mark candidate as matched when highlightMatchingDigits is disabled', () => {
    const candidates = new Set<SudokuDigit>([3, 5]);
    expect(resolveCandidateVisualState(candidates, 5, 5, false)).toBe('normal');
  });

  it('resolves autoCandidates when showAutoCandidates is enabled, otherwise manualCandidates', () => {
    const board = createSampleBoard();
    const cell = {
      ...board[0][1],
      manualCandidates: new Set<SudokuDigit>([1, 2]),
      autoCandidates: new Set<SudokuDigit>([3, 4, 5]),
    };

    expect(
      resolveActiveCandidates(cell, { ...INITIAL_GAME_SETTINGS, showAutoCandidates: false })
    ).toEqual(new Set([1, 2]));
    expect(
      resolveActiveCandidates(cell, { ...INITIAL_GAME_SETTINGS, showAutoCandidates: true })
    ).toEqual(new Set([3, 4, 5]));
  });

  it('resolves activeDigit from selectedDigit or filled selectedCell', () => {
    const board = createSampleBoard();
    expect(resolveActiveDigit(5, null, board)).toBe(5);
    expect(resolveActiveDigit(null, { row: 0, col: 0 }, board)).toBe(7);
    expect(resolveActiveDigit(3, { row: 0, col: 0 }, board)).toBe(7);
    expect(resolveActiveDigit(3, { row: 0, col: 1 }, board)).toBe(3);
  });
});
