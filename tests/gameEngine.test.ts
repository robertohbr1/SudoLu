import { describe, it, expect } from 'vitest';
import {
  createInitialCellMatrix,
  applyCellValueChange,
  applyCandidateToggle,
  applyCellErase,
  findTargetHintCell,
  applyUndoMove,
  applyRedoMove,
  applySingleCandidateAutoFill,
  evaluateRemainingDigits,
  hasUserEnteredDigits,
} from '../src/engine/gameEngine';
import { SudokuPuzzlePackage } from '../src/types/sudoku.types';

function createDummyPuzzlePackage(): SudokuPuzzlePackage {
  const emptyGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
  return {
    initialGrid: emptyGrid,
    solutionGrid: emptyGrid,
    difficulty: 'easy',
  };
}

describe('gameEngine', () => {
  it('initializes 9x9 reactive board correctly', () => {
    const pkg = createDummyPuzzlePackage();
    const board = createInitialCellMatrix(pkg);
    expect(board.length).toBe(9);
    expect(board[0].length).toBe(9);
    expect(board[0][0].currentValue).toBe(0);
    expect(board[0][0].manualCandidates.size).toBe(0);
  });

  it('toggles candidate notes in empty cell', () => {
    const pkg = createDummyPuzzlePackage();
    const board = createInitialCellMatrix(pkg);

    const step1 = applyCandidateToggle(board, 0, 0, 4);
    expect(step1).not.toBeNull();
    expect(step1?.nextBoard[0][0].manualCandidates.has(4)).toBe(true);

    const step2 = applyCandidateToggle(step1!.nextBoard, 0, 0, 4);
    expect(step2?.nextBoard[0][0].manualCandidates.has(4)).toBe(false);
  });

  it('applies cell value change and erases candidate from peer cells', () => {
    const pkg = createDummyPuzzlePackage();
    let board = createInitialCellMatrix(pkg);

    // Set candidate 5 in cell (0, 1) and (1, 0)
    const toggle1 = applyCandidateToggle(board, 0, 1, 5);
    const toggle2 = applyCandidateToggle(toggle1!.nextBoard, 1, 0, 5);
    board = toggle2!.nextBoard;

    expect(board[0][1].manualCandidates.has(5)).toBe(true);
    expect(board[1][0].manualCandidates.has(5)).toBe(true);

    // Now place 5 in (0, 0)
    const { nextBoard, moveRecord } = applyCellValueChange(board, 0, 0, 5, true);

    expect(nextBoard[0][0].currentValue).toBe(5);
    expect(nextBoard[0][1].manualCandidates.has(5)).toBe(false);
    expect(nextBoard[1][0].manualCandidates.has(5)).toBe(false);
    expect(moveRecord.changes.length).toBeGreaterThan(1);
  });

  it('regression: undoing move restores erased peer candidates atomically', () => {
    const pkg = createDummyPuzzlePackage();
    let board = createInitialCellMatrix(pkg);

    // Cell (0, 1) has note 7
    board = applyCandidateToggle(board, 0, 1, 7)!.nextBoard;
    expect(board[0][1].manualCandidates.has(7)).toBe(true);

    // Place 7 in cell (0, 0) - should erase note 7 from peer (0, 1)
    const { nextBoard, moveRecord } = applyCellValueChange(board, 0, 0, 7, true);
    expect(nextBoard[0][0].currentValue).toBe(7);
    expect(nextBoard[0][1].manualCandidates.has(7)).toBe(false);

    // Undo the placement
    const undoneBoard = applyUndoMove(nextBoard, moveRecord);
    expect(undoneBoard[0][0].currentValue).toBe(0);
    // Crucial: note 7 in peer (0, 1) MUST be restored!
    expect(undoneBoard[0][1].manualCandidates.has(7)).toBe(true);

    // Redo the placement
    const redoneBoard = applyRedoMove(undoneBoard, moveRecord);
    expect(redoneBoard[0][0].currentValue).toBe(7);
    expect(redoneBoard[0][1].manualCandidates.has(7)).toBe(false);
  });

  it('evaluates remaining digits and marks completion only when conflict-free', () => {
    const pkg = createDummyPuzzlePackage();
    let board = createInitialCellMatrix(pkg);

    // Put 9 fives across valid positions
    for (let i = 0; i < 9; i++) {
      const { nextBoard } = applyCellValueChange(board, i, (i * 3 + Math.floor(i / 3)) % 9, 5, false);
      board = nextBoard;
    }

    const counts = evaluateRemainingDigits(board);
    const fiveStatus = counts.get(5);
    expect(fiveStatus?.remaining).toBe(0);
    expect(fiveStatus?.isCompleted).toBe(true);
  });

  it('marks digit as NOT completed if placed 9 times with conflicts', () => {
    const pkg = createDummyPuzzlePackage();
    let board = createInitialCellMatrix(pkg);

    // Put two 5s in the same row
    board = applyCellValueChange(board, 0, 0, 5, false).nextBoard;
    board = applyCellValueChange(board, 0, 1, 5, false).nextBoard;

    const counts = evaluateRemainingDigits(board);
    const fiveStatus = counts.get(5);
    expect(fiveStatus?.isCompleted).toBe(false);
  });

  it('auto-fills cells where digit is sole auto or manual candidate', () => {
    const pkg = createDummyPuzzlePackage();
    const board = createInitialCellMatrix(pkg);

    // Constrain cell (2,2)'s autoCandidates to just [3]
    board[2][2] = {
      ...board[2][2],
      autoCandidates: new Set([3]),
    };
    // Constrain cell (4,4)'s manualCandidates to just [3]
    board[4][4] = {
      ...board[4][4],
      manualCandidates: new Set([3]),
    };

    const { nextBoard, moveRecord } = applySingleCandidateAutoFill(board, 3, true);
    expect(moveRecord).not.toBeNull();
    expect(nextBoard[2][2].currentValue).toBe(3);
    expect(nextBoard[4][4].currentValue).toBe(3);
  });

  it('erases a filled digit and supports undo/redo', () => {
    const pkg = createDummyPuzzlePackage();
    let board = createInitialCellMatrix(pkg);

    board = applyCellValueChange(board, 1, 1, 9, false).nextBoard;
    expect(board[1][1].currentValue).toBe(9);

    const eraseResult = applyCellErase(board, 1, 1);
    expect(eraseResult).not.toBeNull();
    expect(eraseResult!.nextBoard[1][1].currentValue).toBe(0);

    const undone = applyUndoMove(eraseResult!.nextBoard, eraseResult!.moveRecord);
    expect(undone[1][1].currentValue).toBe(9);
  });

  it('erases candidate notes from a cell with value 0', () => {
    const pkg = createDummyPuzzlePackage();
    let board = createInitialCellMatrix(pkg);

    board = applyCandidateToggle(board, 2, 2, 4)!.nextBoard;
    board = applyCandidateToggle(board, 2, 2, 7)!.nextBoard;
    expect(board[2][2].manualCandidates.size).toBe(2);

    const eraseResult = applyCellErase(board, 2, 2);
    expect(eraseResult).not.toBeNull();
    expect(eraseResult!.nextBoard[2][2].manualCandidates.size).toBe(0);
  });

  it('refuses to erase given cells or already empty cells', () => {
    const pkg = createDummyPuzzlePackage();
    const board = createInitialCellMatrix(pkg);
    board[0][0] = { ...board[0][0], isGiven: true, currentValue: 5 };

    expect(applyCellErase(board, 0, 0)).toBeNull();
    expect(applyCellErase(board, 3, 3)).toBeNull();
  });

  it('finds target hint cell prioritizing mistakes over empty cells', () => {
    const pkg = createDummyPuzzlePackage();
    const board = createInitialCellMatrix(pkg);
    const solution = Array.from({ length: 9 }, () => Array(9).fill(1));

    // Cell (3, 3) has an incorrect digit
    board[3][3] = { ...board[3][3], currentValue: 8 };

    const target = findTargetHintCell(board, solution, null);
    expect(target).toEqual({ row: 3, col: 3 });
  });

  it('finds first empty cell for hint when no mistakes exist', () => {
    const pkg = createDummyPuzzlePackage();
    const board = createInitialCellMatrix(pkg);
    const solution = Array.from({ length: 9 }, () => Array(9).fill(1));

    const target = findTargetHintCell(board, solution, null);
    expect(target).toEqual({ row: 0, col: 0 });
  });

  it('detects user entered digits or manual notes correctly', () => {
    const pkg = createDummyPuzzlePackage();
    const board = createInitialCellMatrix(pkg);
    // Board with only given cells or empty cells
    board[0][0] = { ...board[0][0], isGiven: true, currentValue: 5 };
    expect(hasUserEnteredDigits(board)).toBe(false);

    // User fills an editable cell with a number
    board[1][1] = { ...board[1][1], isGiven: false, currentValue: 3 };
    expect(hasUserEnteredDigits(board)).toBe(true);

    // User erases it back to 0
    board[1][1] = { ...board[1][1], isGiven: false, currentValue: 0 };
    expect(hasUserEnteredDigits(board)).toBe(false);

    // User enters a manual note
    board[2][2] = { ...board[2][2], isGiven: false, manualCandidates: new Set([4]) };
    expect(hasUserEnteredDigits(board)).toBe(true);
  });
});
