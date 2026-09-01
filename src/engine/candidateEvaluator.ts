import { CellValue, RawNumericMatrix, SudokuDigit } from '../types/sudoku.types';

const VALID_DIGIT_LIST: readonly SudokuDigit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * Checks if a coordinate is within the 9x9 Sudoku boundaries.
 * 
 * @example
 * ```ts
 * validateCoordinateBounds(0, 8); // ok
 * ```
 */
export function validateCoordinateBounds(row: number, col: number): void {
  if (row < 0 || row > 8 || col < 0 || col > 8) {
    throw new RangeError(
      `Invalid coordinate: row=${row}, col=${col}. Expected integers within [0, 8].`
    );
  }
}

/**
 * Extracts all non-zero digits present in the specified row.
 */
function collectRowDigits(grid: RawNumericMatrix, row: number): Set<CellValue> {
  return new Set(grid[row].filter((num) => num !== 0));
}

/**
 * Extracts all non-zero digits present in the specified column.
 */
function collectColDigits(grid: RawNumericMatrix, col: number): Set<CellValue> {
  const digits = new Set<CellValue>();
  for (let r = 0; r < 9; r++) {
    const val = grid[r][col];
    if (val !== 0) digits.add(val);
  }
  return digits;
}

/**
 * Extracts all non-zero digits present in the 3x3 box enclosing (row, col).
 */
function collectBoxDigits(grid: RawNumericMatrix, row: number, col: number): Set<CellValue> {
  const digits = new Set<CellValue>();
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;

  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      const val = grid[r][c];
      if (val !== 0) digits.add(val);
    }
  }
  return digits;
}

/**
 * Computes all mathematically possible candidates (1-9) for a single cell.
 *
 * @example
 * ```ts
 * const candidates = computeCellCandidates(grid, 0, 0);
 * ```
 */
export function computeCellCandidates(
  grid: RawNumericMatrix,
  row: number,
  col: number
): Set<SudokuDigit> {
  validateCoordinateBounds(row, col);

  if (grid[row][col] !== 0) {
    return new Set<SudokuDigit>();
  }

  const occupied = new Set<CellValue>([
    ...collectRowDigits(grid, row),
    ...collectColDigits(grid, col),
    ...collectBoxDigits(grid, row, col),
  ]);

  const candidates = new Set<SudokuDigit>();
  for (const digit of VALID_DIGIT_LIST) {
    if (!occupied.has(digit)) {
      candidates.add(digit);
    }
  }
  return candidates;
}

/**
 * Computes candidate sets for all 81 cells on the board.
 *
 * @example
 * ```ts
 * const allCandidates = computeAllBoardCandidates(grid);
 * ```
 */
export function computeAllBoardCandidates(
  grid: RawNumericMatrix
): ReadonlyMap<string, ReadonlySet<SudokuDigit>> {
  const result = new Map<string, ReadonlySet<SudokuDigit>>();

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const key = `${r},${c}`;
      result.set(key, computeCellCandidates(grid, r, c));
    }
  }
  return result;
}
