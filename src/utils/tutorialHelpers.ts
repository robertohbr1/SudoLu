import {
  TutorialTabKey,
  TutorialTabItem,
  RuleScopeMode,
  CrossHatchCellCoordinate,
} from '../types/tutorial.types';
import { SudokuDigit } from '../types/sudoku.types';

export const TUTORIAL_SECTIONS: readonly TutorialTabItem[] = [
  { id: 'rules', title: 'Regras Básicas do Sudoku', shortLabel: 'Regras' },
  { id: 'cross_hatch', title: 'Estratégia da Varredura (1 ao 9)', shortLabel: 'Varredura' },
  { id: 'notes', title: 'Técnica das Anotações (Modo Lápis)', shortLabel: 'Anotações' },
  { id: 'tips', title: 'Dicas de Jogo no SudoLu', shortLabel: 'Dicas' },
];

/**
 * Returns the next tab in tutorial sequence or current if at the end.
 */
export function getNextTutorialTab(activeTab: TutorialTabKey): TutorialTabKey {
  const keys: readonly TutorialTabKey[] = ['rules', 'cross_hatch', 'notes', 'tips'];
  const currentIndex = keys.indexOf(activeTab);
  if (currentIndex < 0 || currentIndex >= keys.length - 1) {
    return activeTab;
  }
  return keys[currentIndex + 1];
}

/**
 * Returns the previous tab in tutorial sequence or current if at the start.
 */
export function getPreviousTutorialTab(activeTab: TutorialTabKey): TutorialTabKey {
  const keys: readonly TutorialTabKey[] = ['rules', 'cross_hatch', 'notes', 'tips'];
  const currentIndex = keys.indexOf(activeTab);
  if (currentIndex <= 0) {
    return activeTab;
  }
  return keys[currentIndex - 1];
}

/**
 * Determines whether a cell belongs to the highlighted rule scope.
 */
export function isCellInRuleScope(
  row: number,
  col: number,
  mode: RuleScopeMode,
  focusIndex: number
): boolean {
  if (mode === 'row') {
    return row === focusIndex;
  }
  if (mode === 'col') {
    return col === focusIndex;
  }
  const boxIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);
  return boxIndex === focusIndex;
}

/**
 * Checks if a coordinate is blocked by laser rays from an existing digit placement.
 */
export function isCoordinateBlockedByRay(
  row: number,
  col: number,
  placements: readonly CrossHatchCellCoordinate[]
): boolean {
  return placements.some((p) => p.row === row || p.col === col);
}

/**
 * Filters candidates after placing a number in the same region.
 */
export function eliminateCandidateNumber(
  candidateList: readonly SudokuDigit[],
  placedDigit: SudokuDigit
): readonly SudokuDigit[] {
  return candidateList.filter((cand) => cand !== placedDigit);
}
