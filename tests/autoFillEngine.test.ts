import { describe, it, expect } from 'vitest';
import {
  findSingleCandidateTargets,
  findSingleCandidateTargetsForDigit,
  applySingleCandidateCascade,
} from '../src/engine/autoFillEngine';
import { createInitialCellMatrix } from '../src/engine/gameEngine';
import { SudokuPuzzlePackage } from '../src/types/sudoku.types';

function createDummyPuzzlePackage(): SudokuPuzzlePackage {
  const emptyGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
  return {
    initialGrid: emptyGrid,
    solutionGrid: emptyGrid,
    difficulty: 'easy',
  };
}

describe('autoFillEngine', () => {
  it('returns empty targets when cells have no candidates', () => {
    const pkg = createDummyPuzzlePackage();
    const board = createInitialCellMatrix(pkg);
    const targets = findSingleCandidateTargets(board, false);
    expect(targets).toHaveLength(0);
  });

  it('detects single manual candidate when showAutoCandidates is false', () => {
    const pkg = createDummyPuzzlePackage();
    const board = createInitialCellMatrix(pkg);
    board[1][1] = {
      ...board[1][1],
      manualCandidates: new Set([4]),
    };

    const targets = findSingleCandidateTargets(board, false);
    expect(targets).toHaveLength(1);
    expect(targets[0]).toEqual({ row: 1, col: 1, digit: 4 });
  });

  it('filters single candidate targets by specific digit', () => {
    const pkg = createDummyPuzzlePackage();
    const board = createInitialCellMatrix(pkg);
    board[1][1] = { ...board[1][1], manualCandidates: new Set([4]) };
    board[2][2] = { ...board[2][2], manualCandidates: new Set([7]) };

    const fourTargets = findSingleCandidateTargetsForDigit(board, 4, false);
    expect(fourTargets).toEqual([{ row: 1, col: 1, digit: 4 }]);
  });

  it('ignores manual candidates when showAutoCandidates is true', () => {
    const pkg = createDummyPuzzlePackage();
    const board = createInitialCellMatrix(pkg);
    board[1][1] = {
      ...board[1][1],
      manualCandidates: new Set([4]),
      autoCandidates: new Set([1, 2, 3]),
    };

    const targets = findSingleCandidateTargets(board, true);
    expect(targets.some((t) => t.row === 1 && t.col === 1)).toBe(false);
  });

  it('detects single autoCandidate when showAutoCandidates is true', () => {
    const pkg = createDummyPuzzlePackage();
    const board = createInitialCellMatrix(pkg);
    board[2][3] = {
      ...board[2][3],
      autoCandidates: new Set([7]),
    };

    const targets = findSingleCandidateTargets(board, true);
    const found = targets.find((t) => t.row === 2 && t.col === 3);
    expect(found).toBeDefined();
    expect(found?.digit).toBe(7);
  });

  it('auto-fills single candidate and removes digit from peer candidates', () => {
    const pkg = createDummyPuzzlePackage();
    const board = createInitialCellMatrix(pkg);

    // Target cell (0, 0) has manual candidate 9
    board[0][0] = { ...board[0][0], manualCandidates: new Set([9]) };
    // Peer cell (0, 1) has notes 9 and 3
    board[0][1] = { ...board[0][1], manualCandidates: new Set([9, 3]) };

    const { nextBoard, changes } = applySingleCandidateCascade(board, true, false);

    expect(nextBoard[0][0].currentValue).toBe(9);
    expect(nextBoard[0][0].manualCandidates.size).toBe(0);
    // Peer cell should have lost 9, leaving only 3
    // But since 3 is now a single candidate, cascade should also fill (0, 1) with 3!
    expect(nextBoard[0][1].currentValue).toBe(3);
    expect(changes.length).toBeGreaterThanOrEqual(2);
  });
});
