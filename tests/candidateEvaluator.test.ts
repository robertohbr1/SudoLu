import { describe, it, expect } from 'vitest';
import {
  computeCellCandidates,
  computeAllBoardCandidates,
  validateCoordinateBounds,
} from '../src/engine/candidateEvaluator';
import { RawNumericMatrix } from '../src/types/sudoku.types';

describe('candidateEvaluator', () => {
  it('throws RangeError when coordinates are out of bounds', () => {
    expect(() => validateCoordinateBounds(-1, 4)).toThrow(RangeError);
    expect(() => validateCoordinateBounds(9, 4)).toThrow(RangeError);
    expect(() => validateCoordinateBounds(2, -1)).toThrow(RangeError);
    expect(() => validateCoordinateBounds(2, 9)).toThrow(RangeError);
  });

  it('returns empty set if cell is already occupied', () => {
    const grid: RawNumericMatrix = [
      [5, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    const candidates = computeCellCandidates(grid, 0, 0);
    expect(candidates.size).toBe(0);
  });

  it('excludes digits present in the same row, column, or 3x3 box', () => {
    const grid: RawNumericMatrix = [
      [0, 1, 2, 0, 0, 0, 0, 0, 0],
      [3, 4, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [5, 0, 0, 0, 0, 0, 0, 0, 0],
      [6, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 7],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    // Cell (0, 0):
    // Row 0 has: 1, 2
    // Col 0 has: 3, 5, 6
    // Box (0,0) has: 1, 2, 3, 4
    // Occupied = 1, 2, 3, 4, 5, 6 -> remaining = [7, 8, 9]
    const candidates = computeCellCandidates(grid, 0, 0);
    expect(Array.from(candidates).sort()).toEqual([7, 8, 9]);
  });

  it('computes candidates for all 81 board cells', () => {
    const emptyGrid: RawNumericMatrix = Array.from({ length: 9 }, () => Array(9).fill(0));
    const all = computeAllBoardCandidates(emptyGrid);
    expect(all.size).toBe(81);
    expect(all.get('0,0')?.size).toBe(9);
  });
});
