import { describe, it, expect } from 'vitest';
import {
  areCellsPeers,
  findConflictCells,
  isBoardCompletedSuccessfully,
} from '../src/engine/validator';
import { RawNumericMatrix } from '../src/types/sudoku.types';

describe('validator', () => {
  it('correctly identifies peers (row, column, box)', () => {
    // Same cell is not peer
    expect(areCellsPeers(0, 0, 0, 0)).toBe(false);
    // Same row
    expect(areCellsPeers(0, 0, 0, 8)).toBe(true);
    // Same col
    expect(areCellsPeers(0, 0, 8, 0)).toBe(true);
    // Same 3x3 box
    expect(areCellsPeers(0, 0, 2, 2)).toBe(true);
    // Different row, col and box
    expect(areCellsPeers(0, 0, 4, 5)).toBe(false);
  });

  it('detects conflicting duplicates across row, column, and box', () => {
    const grid: RawNumericMatrix = [
      [5, 5, 0, 0, 0, 0, 0, 0, 0], // Row duplicate: (0,0) and (0,1)
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    const conflicts = findConflictCells(grid);
    expect(conflicts.has('0,0')).toBe(true);
    expect(conflicts.has('0,1')).toBe(true);
    expect(conflicts.has('0,2')).toBe(false);
  });

  it('checks successful board completion against solution matrix', () => {
    const solved: RawNumericMatrix = Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => ((r * 3 + Math.floor(r / 3) + c) % 9) + 1 as any)
    );

    expect(isBoardCompletedSuccessfully(solved, solved)).toBe(true);

    const incomplete: RawNumericMatrix = solved.map((row) => [...row]);
    (incomplete as number[][])[0][0] = 0;
    expect(isBoardCompletedSuccessfully(incomplete, solved)).toBe(false);
  });
});
