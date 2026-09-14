import { SudokuDigit } from './sudoku.types';

export type TutorialTabKey = 'rules' | 'cross_hatch' | 'notes' | 'tips';

export type RuleScopeMode = 'row' | 'col' | 'box';

export interface TutorialTabItem {
  readonly id: TutorialTabKey;
  readonly title: string;
  readonly shortLabel: string;
}

export interface CrossHatchCellCoordinate {
  readonly row: number;
  readonly col: number;
}

export interface CrossHatchDemoState {
  readonly digit: SudokuDigit;
  readonly targetBoxIndex: number;
  readonly existingPlacements: readonly CrossHatchCellCoordinate[];
  readonly targetWinningCell: CrossHatchCellCoordinate;
}
