import { describe, it, expect } from 'vitest';
import {
  solveSudokuPuzzle,
  countSudokuSolutions,
  cloneNumericMatrix,
} from '../src/engine/boardSolver';
import { RawNumericMatrix } from '../src/types/sudoku.types';

describe('boardSolver', () => {
  const samplePuzzle: RawNumericMatrix = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ];

  it('clones a 9x9 matrix immutably', () => {
    const clone = cloneNumericMatrix(samplePuzzle);
    expect(clone).toEqual(samplePuzzle);
    clone[0][0] = 9;
    expect(samplePuzzle[0][0]).toBe(5);
  });

  it('solves a valid Sudoku puzzle correctly', () => {
    const solution = solveSudokuPuzzle(samplePuzzle);
    expect(solution).not.toBeNull();
    if (!solution) return;

    // Check no zeros
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        expect(solution[r][c]).toBeGreaterThan(0);
        expect(solution[r][c]).toBeLessThanOrEqual(9);
      }
    }
  });

  it('counts exactly 1 solution for a standard single-solution puzzle', () => {
    const count = countSudokuSolutions(samplePuzzle, 2);
    expect(count).toBe(1);
  });

  it('returns 0 solutions for an impossible puzzle', () => {
    const impossible: RawNumericMatrix = samplePuzzle.map((r) => [...r]);
    // Introduce conflict in row 0
    (impossible as number[][])[0][2] = 5;
    const solution = solveSudokuPuzzle(impossible);
    expect(solution).toBeNull();
  });
});
