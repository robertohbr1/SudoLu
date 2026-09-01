export type SudokuDigit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type CellValue = SudokuDigit | 0;

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export interface CellCoordinate {
  readonly row: number;
  readonly col: number;
}

export interface SudokuCellModel {
  readonly row: number;
  readonly col: number;
  readonly initialValue: CellValue;
  readonly currentValue: CellValue;
  readonly isGiven: boolean;
  readonly manualCandidates: ReadonlySet<SudokuDigit>;
  readonly autoCandidates: ReadonlySet<SudokuDigit>;
  readonly isInvalid: boolean;
}

export type SudokuBoardMatrix = readonly (readonly SudokuCellModel[])[];

export type RawNumericMatrix = readonly (readonly CellValue[])[];

/** Snapshot of one cell's state before and after a move. */
export interface SingleCellChange {
  readonly coordinate: CellCoordinate;
  readonly previousValue: CellValue;
  readonly nextValue: CellValue;
  readonly previousCandidates: ReadonlySet<SudokuDigit>;
  readonly nextCandidates: ReadonlySet<SudokuDigit>;
}

/**
 * A history record that may contain changes to one or more cells.
 * Batch records (e.g. double-click auto-fill) are undone/redone atomically.
 */
export interface GameMoveRecord {
  readonly changes: ReadonlyArray<SingleCellChange>;
}

export interface SudokuPuzzlePackage {
  readonly initialGrid: RawNumericMatrix;
  readonly solutionGrid: RawNumericMatrix;
  readonly difficulty: DifficultyLevel;
}
