import { RawNumericMatrix } from '../types/sudoku.types';

/**
 * Determines whether two cells share the same row, col or 3x3 box.
 */
export function areCellsPeers(r1: number, c1: number, r2: number, c2: number): boolean {
  if (r1 === r2 && c1 === c2) return false;
  if (r1 === r2 || c1 === c2) return true;
  return Math.floor(r1 / 3) === Math.floor(r2 / 3) && Math.floor(c1 / 3) === Math.floor(c2 / 3);
}

/**
 * Identifies all cells that conflict with another cell on row, column or box.
 *
 * @example
 * ```ts
 * const invalidKeys = findConflictCells(currentGrid);
 * ```
 */
export function findConflictCells(grid: RawNumericMatrix): Set<string> {
  const conflictKeys = new Set<string>();

  for (let r1 = 0; r1 < 9; r1++) {
    for (let c1 = 0; c1 < 9; c1++) {
      const val1 = grid[r1][c1];
      if (val1 === 0) continue;

      for (let r2 = 0; r2 < 9; r2++) {
        for (let c2 = 0; c2 < 9; c2++) {
          if (!areCellsPeers(r1, c1, r2, c2)) continue;
          if (grid[r2][c2] === val1) {
            conflictKeys.add(`${r1},${c1}`);
            conflictKeys.add(`${r2},${c2}`);
          }
        }
      }
    }
  }

  return conflictKeys;
}

/**
 * Verifies if the board is completely filled without any invalid cells.
 */
export function isBoardCompletedSuccessfully(
  grid: RawNumericMatrix,
  solutionGrid: RawNumericMatrix
): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) return false;
      if (grid[r][c] !== solutionGrid[r][c]) return false;
    }
  }
  return true;
}
