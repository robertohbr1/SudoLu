import {
  SudokuDigit,
  SudokuCellModel,
  SudokuBoardMatrix,
  SingleCellChange,
  GameMoveRecord,
} from '../types/sudoku.types';
import { GamePreferenceSettings } from '../types/settings.types';
import { applySingleCandidateCascade } from './autoFillEngine';
import { computeCellCandidates } from './candidateEvaluator';
import { applyRedoMove, extractRawMatrix } from './gameEngine';

export type CascadeSettings = Pick<
  GamePreferenceSettings,
  'autoFillSingleCandidate' | 'autoEraseCandidatesOnInput' | 'showAutoCandidates'
>;

/** Board after a move plus the history record to push (null = nothing changed). */
export interface ComposedMove {
  readonly nextBoard: SudokuCellModel[][];
  readonly moveRecord: GameMoveRecord | null;
}

/**
 * Appends the automatic single-candidate cascade (when enabled) to the
 * player's changes, producing ONE history record.
 *
 * Why: the cascade used to be recorded separately by an effect that re-ran on
 * every board change, so "Voltar um passo" restored a single-candidate cell
 * and the effect instantly re-filled it. Keeping action + consequences in the
 * same record lets undo revert them together.
 *
 * @example
 * const { nextBoard, moveRecord } = composeMoveWithCascade(board, changes, settings);
 */
export function composeMoveWithCascade(
  board: SudokuCellModel[][],
  baseChanges: readonly SingleCellChange[],
  settings: CascadeSettings
): ComposedMove {
  if (!settings.autoFillSingleCandidate) {
    return { nextBoard: board, moveRecord: toMoveRecord(baseChanges) };
  }
  const cascade = applySingleCandidateCascade(
    board,
    settings.autoEraseCandidatesOnInput,
    settings.showAutoCandidates
  );
  return {
    nextBoard: cascade.nextBoard,
    moveRecord: toMoveRecord([...baseChanges, ...cascade.changes]),
  };
}

function toMoveRecord(changes: readonly SingleCellChange[]): GameMoveRecord | null {
  return changes.length > 0 ? { changes: [...changes] } : null;
}

function areDigitSetsEqual(
  left: ReadonlySet<SudokuDigit>,
  right: ReadonlySet<SudokuDigit>
): boolean {
  if (left.size !== right.size) return false;
  return [...left].every((digit) => right.has(digit));
}

function buildNoteChange(
  cell: SudokuCellModel,
  nextCandidates: ReadonlySet<SudokuDigit>
): SingleCellChange {
  return {
    coordinate: { row: cell.row, col: cell.col },
    previousValue: cell.currentValue,
    nextValue: cell.currentValue,
    previousCandidates: new Set(cell.manualCandidates),
    nextCandidates: new Set(nextCandidates),
  };
}

function collectNoteChanges(
  board: SudokuBoardMatrix,
  resolveNextNotes: (cell: SudokuCellModel) => ReadonlySet<SudokuDigit>
): SingleCellChange[] {
  const changes: SingleCellChange[] = [];
  for (const cell of board.flat()) {
    if (cell.currentValue !== 0) continue;
    const nextNotes = resolveNextNotes(cell);
    if (areDigitSetsEqual(cell.manualCandidates, nextNotes)) continue;
    changes.push(buildNoteChange(cell, nextNotes));
  }
  return changes;
}

function applyNoteChanges(
  board: SudokuBoardMatrix,
  changes: readonly SingleCellChange[]
): SudokuCellModel[][] {
  return applyRedoMove(board, { changes });
}

/**
 * Fills every empty cell's notes with its computed candidates (recorded, so
 * it can be undone), then runs the cascade when enabled.
 *
 * @example
 * const { nextBoard, moveRecord } = composeFillAllNotesMove(board, settings);
 */
export function composeFillAllNotesMove(
  board: SudokuBoardMatrix,
  settings: CascadeSettings
): ComposedMove {
  const raw = extractRawMatrix(board);
  const changes = collectNoteChanges(board, (cell) =>
    computeCellCandidates(raw, cell.row, cell.col)
  );
  return composeMoveWithCascade(applyNoteChanges(board, changes), changes, settings);
}

/**
 * Erases all manual notes as a single undoable record.
 *
 * @example
 * const { nextBoard, moveRecord } = composeClearAllNotesMove(board);
 */
export function composeClearAllNotesMove(board: SudokuBoardMatrix): ComposedMove {
  const changes = collectNoteChanges(board, () => new Set<SudokuDigit>());
  return { nextBoard: applyNoteChanges(board, changes), moveRecord: toMoveRecord(changes) };
}
