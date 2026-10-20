import {
  SudokuDigit,
  SudokuCellModel,
  SudokuBoardMatrix,
  SingleCellChange,
} from '../types/sudoku.types';
import {
  cloneBoardMatrix,
  cleanPeerCandidatesWithTracking,
  recalculateDerivations,
} from './gameEngine';

export interface SingleCandidateTarget {
  readonly row: number;
  readonly col: number;
  readonly digit: SudokuDigit;
}

/**
 * Returns active candidate set visible to the player in this cell.
 */
export function resolveVisibleCandidates(
  cell: SudokuCellModel,
  showAutoCandidates: boolean
): ReadonlySet<SudokuDigit> {
  if (showAutoCandidates) return cell.autoCandidates;
  return cell.manualCandidates;
}

/**
 * Finds all empty cells where the given digit is the sole visible candidate.
 *
 * @example
 * ```ts
 * const targets = findSingleCandidateTargetsForDigit(board, 5, false);
 * ```
 */
export function findSingleCandidateTargetsForDigit(
  board: SudokuBoardMatrix,
  digit: SudokuDigit,
  showAutoCandidates: boolean
): SingleCandidateTarget[] {
  return findSingleCandidateTargets(board, showAutoCandidates).filter(
    (target) => target.digit === digit
  );
}

/**
 * Finds all empty cells that currently display exactly one candidate.
 *
 * @example
 * ```ts
 * const targets = findSingleCandidateTargets(board, true);
 * ```
 */
export function findSingleCandidateTargets(
  board: SudokuBoardMatrix,
  showAutoCandidates: boolean
): SingleCandidateTarget[] {
  const targets: SingleCandidateTarget[] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = board[r][c];
      if (cell.isGiven || cell.currentValue !== 0) continue;
      const candidates = resolveVisibleCandidates(cell, showAutoCandidates);
      if (candidates.size !== 1) continue;
      const [digit] = Array.from(candidates);
      targets.push({ row: r, col: c, digit });
    }
  }
  return targets;
}

function executeTargetFill(
  matrix: SudokuCellModel[][],
  target: SingleCandidateTarget,
  autoEraseCandidates: boolean
): SingleCellChange[] {
  const { row, col, digit } = target;
  const prevCell = matrix[row][col];
  const primaryChange: SingleCellChange = {
    coordinate: { row, col },
    previousValue: prevCell.currentValue,
    nextValue: digit,
    previousCandidates: new Set(prevCell.manualCandidates),
    nextCandidates: new Set(),
  };

  matrix[row][col] = {
    ...prevCell,
    currentValue: digit,
    manualCandidates: new Set(),
  };

  const peerChanges = autoEraseCandidates
    ? cleanPeerCandidatesWithTracking(matrix, row, col, digit)
    : [];

  return [primaryChange, ...peerChanges];
}

/**
 * Cascadingly auto-fills all cells that have a single visible candidate.
 *
 * @example
 * ```ts
 * const { nextBoard, changes } = applySingleCandidateCascade(board, true, false);
 * ```
 */
export function applySingleCandidateCascade(
  board: SudokuBoardMatrix,
  autoEraseCandidates: boolean,
  showAutoCandidates: boolean
): { nextBoard: SudokuCellModel[][]; changes: SingleCellChange[] } {
  const next = cloneBoardMatrix(board);
  const accumulatedChanges: SingleCellChange[] = [];
  let roundTargets = findSingleCandidateTargets(next, showAutoCandidates);

  while (roundTargets.length > 0) {
    for (const target of roundTargets) {
      if (next[target.row][target.col].currentValue !== 0) continue;
      const changes = executeTargetFill(next, target, autoEraseCandidates);
      accumulatedChanges.push(...changes);
    }
    recalculateDerivations(next);
    roundTargets = findSingleCandidateTargets(next, showAutoCandidates);
  }

  return { nextBoard: next, changes: accumulatedChanges };
}
