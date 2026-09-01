import { describe, it, expect } from 'vitest';
import {
  generateSolvedSudokuBoard,
  generateSudokuPuzzle,
  createEmptyGrid,
} from '../src/engine/boardGenerator';
import { countSudokuSolutions } from '../src/engine/boardSolver';

describe('boardGenerator', () => {
  it('creates an empty 9x9 matrix', () => {
    const grid = createEmptyGrid();
    expect(grid.length).toBe(9);
    expect(grid[0].length).toBe(9);
    expect(grid.every((row) => row.every((c) => c === 0))).toBe(true);
  });

  it('generates a completely filled valid solution board', () => {
    const solution = generateSolvedSudokuBoard();
    expect(solution.length).toBe(9);
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        expect(solution[r][c]).toBeGreaterThan(0);
      }
    }
  });

  it('generates a puzzle with a guaranteed unique solution for each difficulty', () => {
    const puzzle = generateSudokuPuzzle('easy');
    expect(puzzle.difficulty).toBe('easy');
    expect(puzzle.initialGrid.length).toBe(9);
    expect(puzzle.solutionGrid.length).toBe(9);

    const solutionsCount = countSudokuSolutions(puzzle.initialGrid, 2);
    expect(solutionsCount).toBe(1);
  });
});
