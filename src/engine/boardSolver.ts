import { CellValue, RawNumericMatrix, SudokuDigit } from '../types/sudoku.types';
import { computeCellCandidates } from './candidateEvaluator';

export type MutableMatrix = CellValue[][];

/**
 * Creates a deep copy of a 9x9 matrix.
 */
export function cloneNumericMatrix(grid: RawNumericMatrix): MutableMatrix {
  return grid.map((row) => [...row]);
}

interface EmptyCellInfo {
  readonly row: number;
  readonly col: number;
  readonly candidates: SudokuDigit[];
}

/**
 * Finds the empty cell with the fewest candidates (MRV heuristic).
 */
function findBestCellToBranch(grid: MutableMatrix): EmptyCellInfo | null {
  let optimal: EmptyCellInfo | null = null;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== 0) continue;
      const candidates = Array.from(computeCellCandidates(grid, r, c));
      if (candidates.length === 0) {
        return { row: r, col: c, candidates: [] };
      }
      if (!optimal || candidates.length < optimal.candidates.length) {
        optimal = { row: r, col: c, candidates };
      }
      if (optimal.candidates.length === 1) return optimal;
    }
  }
  return optimal;
}

/**
 * Recursively solves the board using backtracking with MRV.
 */
function backtrackSolver(grid: MutableMatrix): boolean {
  const cell = findBestCellToBranch(grid);
  if (!cell) return true;
  if (cell.candidates.length === 0) return false;

  for (const digit of cell.candidates) {
    grid[cell.row][cell.col] = digit;
    if (backtrackSolver(grid)) return true;
    grid[cell.row][cell.col] = 0;
  }
  return false;
}

/**
 * Solves a Sudoku grid, returning the completed matrix or null if unsolvable.
 *
 * @example
 * ```ts
 * const solved = solveSudokuPuzzle(myPuzzle);
 * ```
 */
export function solveSudokuPuzzle(grid: RawNumericMatrix): RawNumericMatrix | null {
  const copy = cloneNumericMatrix(grid);
  const success = backtrackSolver(copy);
  return success ? copy : null;
}

/**
 * Backtracking helper to count solutions up to a given limit.
 */
function backtrackCounter(grid: MutableMatrix, limit: number, currentCount: { total: number }): void {
  if (currentCount.total >= limit) return;

  const cell = findBestCellToBranch(grid);
  if (!cell) {
    currentCount.total += 1;
    return;
  }

  for (const digit of cell.candidates) {
    grid[cell.row][cell.col] = digit;
    backtrackCounter(grid, limit, currentCount);
    grid[cell.row][cell.col] = 0;
    if (currentCount.total >= limit) break;
  }
}

/**
 * Counts the number of solutions for a grid up to maxLimit.
 *
 * @example
 * ```ts
 * const count = countSudokuSolutions(grid, 2);
 * ```
 */
export function countSudokuSolutions(grid: RawNumericMatrix, maxLimit = 2): number {
  const copy = cloneNumericMatrix(grid);
  const counter = { total: 0 };
  backtrackCounter(copy, maxLimit, counter);
  return counter.total;
}
