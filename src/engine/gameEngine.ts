import {
  CellValue,
  SudokuDigit,
  SudokuCellModel,
  SudokuBoardMatrix,
  RawNumericMatrix,
  CellCoordinate,
  SingleCellChange,
  GameMoveRecord,
  SudokuPuzzlePackage,
} from '../types/sudoku.types';
import { computeCellCandidates } from './candidateEvaluator';
import { findConflictCells } from './validator';

export interface DigitRemainingStatus {
  readonly remaining: number;
  readonly isCompleted: boolean;
}

/**
 * Deeply clones a reactive cell model matrix.
 *
 * @example
 * ```ts
 * const cloned = cloneBoardMatrix(board);
 * ```
 */
export function cloneBoardMatrix(board: SudokuBoardMatrix): SudokuCellModel[][] {
  return board.map((row) =>
    row.map((cell) => ({
      ...cell,
      manualCandidates: new Set(cell.manualCandidates),
      autoCandidates: new Set(cell.autoCandidates),
    }))
  );
}

/**
 * Extracts raw 2D numeric values from current cell model matrix.
 *
 * @example
 * ```ts
 * const raw = extractRawMatrix(board);
 * ```
 */
export function extractRawMatrix(matrix: SudokuBoardMatrix): RawNumericMatrix {
  return matrix.map((row) => row.map((cell) => cell.currentValue));
}

/**
 * Builds the initial reactive cell matrix from raw puzzle data.
 *
 * @example
 * ```ts
 * const board = createInitialCellMatrix(puzzlePackage);
 * ```
 */
export function createInitialCellMatrix(puzzle: SudokuPuzzlePackage): SudokuCellModel[][] {
  const matrix: SudokuCellModel[][] = [];
  for (let r = 0; r < 9; r++) {
    const rowCells: SudokuCellModel[] = [];
    for (let c = 0; c < 9; c++) {
      const val = puzzle.initialGrid[r][c];
      const isGiven = val !== 0;
      const autoCandidates = isGiven
        ? new Set<SudokuDigit>()
        : computeCellCandidates(puzzle.initialGrid, r, c);

      rowCells.push({
        row: r,
        col: c,
        initialValue: val,
        currentValue: val,
        isGiven,
        manualCandidates: new Set<SudokuDigit>(),
        autoCandidates,
        isInvalid: false,
      });
    }
    matrix.push(rowCells);
  }
  return matrix;
}

/**
 * Recalculates auto-candidates and validation states for all cells in place.
 *
 * @example
 * ```ts
 * recalculateDerivations(matrix);
 * ```
 */
export function recalculateDerivations(matrix: SudokuCellModel[][]): void {
  const raw = extractRawMatrix(matrix);
  const conflicts = findConflictCells(raw);

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = matrix[r][c];
      const isInvalid = conflicts.has(`${r},${c}`);
      const autoCandidates = cell.currentValue === 0
        ? computeCellCandidates(raw, r, c)
        : new Set<SudokuDigit>();

      matrix[r][c] = { ...cell, isInvalid, autoCandidates };
    }
  }
}

function collectPeerCoordinates(row: number, col: number): CellCoordinate[] {
  const coords: CellCoordinate[] = [];
  const boxR = Math.floor(row / 3) * 3;
  const boxC = Math.floor(col / 3) * 3;
  for (let i = 0; i < 9; i++) {
    if (i !== col) coords.push({ row, col: i });
    if (i !== row) coords.push({ row: i, col });
  }
  for (let r = boxR; r < boxR + 3; r++) {
    for (let c = boxC; c < boxC + 3; c++) {
      if (r !== row && c !== col) coords.push({ row: r, col: c });
    }
  }
  return coords;
}

function getDistinctPeerCoordinates(row: number, col: number): CellCoordinate[] {
  const seen = new Set<string>();
  const peers: CellCoordinate[] = [];
  const rawList = collectPeerCoordinates(row, col);
  for (const coord of rawList) {
    const key = `${coord.row},${coord.col}`;
    if (seen.has(key)) continue;
    seen.add(key);
    peers.push(coord);
  }
  return peers;
}

/**
 * Removes `digit` from manual candidates in all peers of `(row, col)` and returns change records.
 *
 * @example
 * ```ts
 * const peerChanges = cleanPeerCandidatesWithTracking(matrix, 0, 0, 5);
 * ```
 */
export function cleanPeerCandidatesWithTracking(
  matrix: SudokuCellModel[][],
  row: number,
  col: number,
  digit: SudokuDigit
): SingleCellChange[] {
  const peers = getDistinctPeerCoordinates(row, col);
  const changes: SingleCellChange[] = [];
  for (const { row: pr, col: pc } of peers) {
    const peerCell = matrix[pr][pc];
    if (!peerCell.manualCandidates.has(digit)) continue;
    const nextCandidates = new Set(peerCell.manualCandidates);
    nextCandidates.delete(digit);
    changes.push({
      coordinate: { row: pr, col: pc },
      previousValue: peerCell.currentValue,
      nextValue: peerCell.currentValue,
      previousCandidates: new Set(peerCell.manualCandidates),
      nextCandidates,
    });
    matrix[pr][pc] = { ...peerCell, manualCandidates: nextCandidates };
  }
  return changes;
}

/**
 * Applies a numeric digit to a cell, cleans peer candidates, and records history.
 *
 * @example
 * ```ts
 * const { nextBoard, moveRecord } = applyCellValueChange(board, 0, 0, 5, true);
 * ```
 */
export function applyCellValueChange(
  board: SudokuBoardMatrix,
  row: number,
  col: number,
  digit: CellValue,
  autoEraseCandidates: boolean
): { nextBoard: SudokuCellModel[][]; moveRecord: GameMoveRecord } {
  const cell = board[row][col];
  const next = cloneBoardMatrix(board);
  next[row][col] = { ...cell, currentValue: digit, manualCandidates: new Set() };

  const cellChange: SingleCellChange = {
    coordinate: { row, col },
    previousValue: cell.currentValue,
    nextValue: digit,
    previousCandidates: new Set(cell.manualCandidates),
    nextCandidates: new Set(),
  };

  const peerChanges = (digit !== 0 && autoEraseCandidates)
    ? cleanPeerCandidatesWithTracking(next, row, col, digit as SudokuDigit)
    : [];

  recalculateDerivations(next);
  return {
    nextBoard: next,
    moveRecord: { changes: [cellChange, ...peerChanges] },
  };
}

/**
 * Toggles a manual candidate note in an empty cell.
 *
 * @example
 * ```ts
 * const result = applyCandidateToggle(board, 0, 0, 3);
 * ```
 */
export function applyCandidateToggle(
  board: SudokuBoardMatrix,
  row: number,
  col: number,
  digit: SudokuDigit
): { nextBoard: SudokuCellModel[][]; moveRecord: GameMoveRecord } | null {
  const cell = board[row][col];
  if (cell.isGiven || cell.currentValue !== 0) return null;

  const nextCandidates = new Set(cell.manualCandidates);
  if (nextCandidates.has(digit)) {
    nextCandidates.delete(digit);
  } else {
    nextCandidates.add(digit);
  }

  const next = cloneBoardMatrix(board);
  next[row][col] = { ...cell, manualCandidates: nextCandidates };

  const moveRecord: GameMoveRecord = {
    changes: [{
      coordinate: { row, col },
      previousValue: cell.currentValue,
      nextValue: cell.currentValue,
      previousCandidates: new Set(cell.manualCandidates),
      nextCandidates,
    }],
  };
  return { nextBoard: next, moveRecord };
}

/**
 * Undoes a game move record, restoring all affected cells and candidates.
 *
 * @example
 * ```ts
 * const prevBoard = applyUndoMove(currentBoard, lastMove);
 * ```
 */
export function applyUndoMove(
  board: SudokuBoardMatrix,
  moveRecord: GameMoveRecord
): SudokuCellModel[][] {
  const next = cloneBoardMatrix(board);
  // Reverse order: a batch can touch the same cell more than once (e.g. a peer
  // note is erased by cascade fill A, then the cell itself is filled later).
  // Only reverting newest-first restores the true original state.
  const reversedChanges = [...moveRecord.changes].reverse();
  for (const change of reversedChanges) {
    const { row, col } = change.coordinate;
    next[row][col] = {
      ...next[row][col],
      currentValue: change.previousValue,
      manualCandidates: new Set(change.previousCandidates),
    };
  }
  recalculateDerivations(next);
  return next;
}

/**
 * Redoes a game move record, re-applying all cell and candidate changes.
 *
 * @example
 * ```ts
 * const redoneBoard = applyRedoMove(currentBoard, moveRecord);
 * ```
 */
export function applyRedoMove(
  board: SudokuBoardMatrix,
  moveRecord: GameMoveRecord
): SudokuCellModel[][] {
  const next = cloneBoardMatrix(board);
  for (const change of moveRecord.changes) {
    const { row, col } = change.coordinate;
    next[row][col] = {
      ...next[row][col],
      currentValue: change.nextValue,
      manualCandidates: new Set(change.nextCandidates),
    };
  }
  recalculateDerivations(next);
  return next;
}

function findSingleCandidateCells(
  board: SudokuCellModel[][],
  digit: SudokuDigit
): CellCoordinate[] {
  const targets: CellCoordinate[] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = board[r][c];
      const hasSingleAuto = cell.autoCandidates.size === 1 && cell.autoCandidates.has(digit);
      const hasSingleManual = cell.manualCandidates.size === 1 && cell.manualCandidates.has(digit);
      const isMatch = cell.currentValue === 0 && !cell.isGiven && (hasSingleAuto || hasSingleManual);
      if (isMatch) targets.push({ row: r, col: c });
    }
  }
  return targets;
}

/**
 * Auto-fills all cells where the given digit is the sole candidate (auto or manual).
 *
 * @example
 * ```ts
 * const { nextBoard, moveRecord } = applySingleCandidateAutoFill(board, 5, true);
 * ```
 */
export function applySingleCandidateAutoFill(
  board: SudokuBoardMatrix,
  digit: SudokuDigit,
  autoEraseCandidates: boolean
): { nextBoard: SudokuCellModel[][]; moveRecord: GameMoveRecord | null } {
  const targets = findSingleCandidateCells(cloneBoardMatrix(board), digit);
  if (targets.length === 0) return { nextBoard: cloneBoardMatrix(board), moveRecord: null };

  const next = cloneBoardMatrix(board);
  const allChanges: SingleCellChange[] = [];

  for (const { row, col } of targets) {
    const prevCell = next[row][col];
    allChanges.push({
      coordinate: { row, col },
      previousValue: prevCell.currentValue,
      nextValue: digit,
      previousCandidates: new Set(prevCell.manualCandidates),
      nextCandidates: new Set(),
    });
    next[row][col] = { ...prevCell, currentValue: digit, manualCandidates: new Set() };
    if (autoEraseCandidates) {
      const peerChanges = cleanPeerCandidatesWithTracking(next, row, col, digit);
      allChanges.push(...peerChanges);
    }
  }

  recalculateDerivations(next);
  return { nextBoard: next, moveRecord: { changes: allChanges } };
}

/**
 * Calculates remaining placements for digits 1-9 and completion status.
 *
 * @example
 * ```ts
 * const counts = evaluateRemainingDigits(board);
 * ```
 */
export function evaluateRemainingDigits(
  board: SudokuBoardMatrix
): ReadonlyMap<SudokuDigit, DigitRemainingStatus> {
  const result = new Map<SudokuDigit, DigitRemainingStatus>();
  for (let d = 1; d <= 9; d++) {
    const digit = d as SudokuDigit;
    let placedCount = 0;
    let conflictCount = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = board[r][c];
        if (cell.currentValue !== digit) continue;
        placedCount++;
        if (cell.isInvalid) conflictCount++;
      }
    }
    const remaining = Math.max(0, 9 - placedCount);
    const isCompleted = placedCount === 9 && conflictCount === 0;
    result.set(digit, { remaining, isCompleted });
  }
  return result;
}

/**
 * Clears cell content (digit or manual candidate notes) and records history.
 *
 * @example
 * ```ts
 * const result = applyCellErase(board, 0, 0);
 * ```
 */
export function applyCellErase(
  board: SudokuBoardMatrix,
  row: number,
  col: number
): { nextBoard: SudokuCellModel[][]; moveRecord: GameMoveRecord } | null {
  const cell = board[row][col];
  if (cell.isGiven || (cell.currentValue === 0 && cell.manualCandidates.size === 0)) {
    return null;
  }

  const next = cloneBoardMatrix(board);
  next[row][col] = { ...cell, currentValue: 0, manualCandidates: new Set() };

  const cellChange: SingleCellChange = {
    coordinate: { row, col },
    previousValue: cell.currentValue,
    nextValue: 0,
    previousCandidates: new Set(cell.manualCandidates),
    nextCandidates: new Set(),
  };

  recalculateDerivations(next);
  return { nextBoard: next, moveRecord: { changes: [cellChange] } };
}

function findMistakeCell(
  board: SudokuBoardMatrix,
  solutionGrid: RawNumericMatrix
): CellCoordinate | null {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = board[r][c];
      if (!cell.isGiven && cell.currentValue !== 0 && cell.currentValue !== solutionGrid[r][c]) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

function findFirstEmptyCell(board: SudokuBoardMatrix): CellCoordinate | null {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c].currentValue === 0) return { row: r, col: c };
    }
  }
  return null;
}

/**
 * Finds the most relevant cell to apply a hint to.
 *
 * @example
 * ```ts
 * const target = findTargetHintCell(board, solution, { row: 0, col: 0 });
 * ```
 */
export function findTargetHintCell(
  board: SudokuBoardMatrix,
  solutionGrid: RawNumericMatrix,
  selectedCell: CellCoordinate | null
): CellCoordinate | null {
  if (selectedCell) {
    const { row, col } = selectedCell;
    const cell = board[row][col];
    if (!cell.isGiven && cell.currentValue !== solutionGrid[row][col]) {
      return selectedCell;
    }
  }
  return findMistakeCell(board, solutionGrid) ?? findFirstEmptyCell(board);
}

/**
 * Verifies if any editable cell on the board has a user-entered digit or note.
 *
 * @example
 * ```ts
 * const hasDigits = hasUserEnteredDigits(board);
 * ```
 */
export function hasUserEnteredDigits(board: SudokuBoardMatrix): boolean {
  return board.some((row) =>
    row.some((cell) => !cell.isGiven && (cell.currentValue !== 0 || cell.manualCandidates.size > 0))
  );
}
