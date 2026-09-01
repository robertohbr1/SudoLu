import { CellValue, DifficultyLevel, RawNumericMatrix, SudokuDigit, SudokuPuzzlePackage } from '../types/sudoku.types';
import { countSudokuSolutions, MutableMatrix, solveSudokuPuzzle } from './boardSolver';

/**
 * Shuffles an array in place using Fisher-Yates algorithm.
 */
function shuffleNumbers<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Fills a 3x3 box with a random permutation of numbers 1-9.
 */
function fillDiagonalBox(grid: MutableMatrix, startRow: number, startCol: number): void {
  const digits = shuffleNumbers<SudokuDigit>([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  let idx = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      grid[startRow + r][startCol + c] = digits[idx++];
    }
  }
}

/**
 * Creates an empty 9x9 grid with all zeros.
 */
export function createEmptyGrid(): MutableMatrix {
  return Array.from({ length: 9 }, () => Array(9).fill(0) as CellValue[]);
}

/**
 * Generates a complete, valid Sudoku solution grid.
 */
export function generateSolvedSudokuBoard(): RawNumericMatrix {
  while (true) {
    const grid = createEmptyGrid();
    fillDiagonalBox(grid, 0, 0);
    fillDiagonalBox(grid, 3, 3);
    fillDiagonalBox(grid, 6, 6);

    const solution = solveSudokuPuzzle(grid);
    if (solution) return solution;
  }
}

/**
 * Returns target clue ranges for each difficulty setting.
 */
function getClueRangeForDifficulty(level: DifficultyLevel): { min: number; max: number } {
  switch (level) {
    case 'easy':
      return { min: 38, max: 42 };
    case 'medium':
      return { min: 32, max: 36 };
    case 'hard':
      return { min: 27, max: 31 };
    case 'expert':
      return { min: 23, max: 26 };
  }
}

/**
 * Generates a full puzzle package with guaranteed single solution.
 *
 * @example
 * ```ts
 * const puzzle = generateSudokuPuzzle('medium');
 * ```
 */
export function generateSudokuPuzzle(level: DifficultyLevel): SudokuPuzzlePackage {
  const solution = generateSolvedSudokuBoard();
  const puzzle = solution.map((r) => [...r]);
  const range = getClueRangeForDifficulty(level);
  const targetClues = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }
  const shuffledPositions = shuffleNumbers(positions);

  let currentClues = 81;
  for (const [r, c] of shuffledPositions) {
    if (currentClues <= targetClues) break;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;

    if (countSudokuSolutions(puzzle, 2) !== 1) {
      puzzle[r][c] = backup;
    } else {
      currentClues--;
    }
  }

  return {
    initialGrid: puzzle,
    solutionGrid: solution,
    difficulty: level,
  };
}
