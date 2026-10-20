import { describe, it, expect } from 'vitest';
import {
  composeMoveWithCascade,
  composeFillAllNotesMove,
  composeClearAllNotesMove,
  CascadeSettings,
} from '../src/engine/moveComposer';
import {
  createInitialCellMatrix,
  applyCellValueChange,
  applyUndoMove,
  applyRedoMove,
} from '../src/engine/gameEngine';
import { SudokuCellModel, SudokuPuzzlePackage } from '../src/types/sudoku.types';

function createEmptyBoard(): SudokuCellModel[][] {
  const emptyGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
  const pkg: SudokuPuzzlePackage = { initialGrid: emptyGrid, solutionGrid: emptyGrid, difficulty: 'easy' };
  return createInitialCellMatrix(pkg);
}

const manualCascadeOn: CascadeSettings = {
  autoFillSingleCandidate: true,
  autoEraseCandidatesOnInput: true,
  showAutoCandidates: false,
};

describe('moveComposer', () => {
  it('merges player change and cascade into a single record', () => {
    const board = createEmptyBoard();
    board[0][1] = { ...board[0][1], manualCandidates: new Set([5, 3]) };
    const placed = applyCellValueChange(board, 0, 0, 5, true);

    const { nextBoard, moveRecord } = composeMoveWithCascade(placed.nextBoard, placed.moveRecord.changes, manualCascadeOn);

    expect(nextBoard[0][1].currentValue).toBe(3);
    expect(moveRecord?.changes[0].coordinate).toEqual({ row: 0, col: 0 });
  });

  // Regression: undo used to leave (0,1) with note {3} instead of {5,3}, so the
  // auto-fill immediately re-filled it and "Voltar um passo" seemed broken.
  it('undo of a merged cascade restores the exact original board', () => {
    const board = createEmptyBoard();
    board[0][1] = { ...board[0][1], manualCandidates: new Set([5, 3]) };
    const placed = applyCellValueChange(board, 0, 0, 5, true);
    const { nextBoard, moveRecord } = composeMoveWithCascade(placed.nextBoard, placed.moveRecord.changes, manualCascadeOn);

    const undone = applyUndoMove(nextBoard, moveRecord!);

    expect(undone[0][0].currentValue).toBe(0);
    expect(undone[0][1].currentValue).toBe(0);
    expect([...undone[0][1].manualCandidates].sort()).toEqual([3, 5]);
  });

  it('redo re-applies the merged record', () => {
    const board = createEmptyBoard();
    board[0][1] = { ...board[0][1], manualCandidates: new Set([5, 3]) };
    const placed = applyCellValueChange(board, 0, 0, 5, true);
    const { nextBoard, moveRecord } = composeMoveWithCascade(placed.nextBoard, placed.moveRecord.changes, manualCascadeOn);

    const redone = applyRedoMove(applyUndoMove(nextBoard, moveRecord!), moveRecord!);

    expect(redone[0][0].currentValue).toBe(5);
    expect(redone[0][1].currentValue).toBe(3);
  });

  it('returns null record when nothing changed', () => {
    const { moveRecord } = composeMoveWithCascade(createEmptyBoard(), [], manualCascadeOn);
    expect(moveRecord).toBeNull();
  });

  it('fill-all-notes is recorded and fully undoable', () => {
    const board = createEmptyBoard();
    const { nextBoard, moveRecord } = composeFillAllNotesMove(board, { ...manualCascadeOn, autoFillSingleCandidate: false });

    expect(nextBoard[4][4].manualCandidates.size).toBe(9);
    const undone = applyUndoMove(nextBoard, moveRecord!);
    expect(undone[4][4].manualCandidates.size).toBe(0);
  });

  it('clear-all-notes is recorded and fully undoable', () => {
    const board = createEmptyBoard();
    board[2][2] = { ...board[2][2], manualCandidates: new Set([1, 2]) };
    const { nextBoard, moveRecord } = composeClearAllNotesMove(board);

    expect(nextBoard[2][2].manualCandidates.size).toBe(0);
    expect(applyUndoMove(nextBoard, moveRecord!)[2][2].manualCandidates.size).toBe(2);
  });
});
