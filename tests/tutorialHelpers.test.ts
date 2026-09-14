import { describe, it, expect } from 'vitest';
import {
  getNextTutorialTab,
  getPreviousTutorialTab,
  isCellInRuleScope,
  isCoordinateBlockedByRay,
  eliminateCandidateNumber,
} from '../src/utils/tutorialHelpers';

describe('tutorialHelpers', () => {
  it('navigates forward through tutorial tabs', () => {
    expect(getNextTutorialTab('rules')).toBe('cross_hatch');
    expect(getNextTutorialTab('cross_hatch')).toBe('notes');
    expect(getNextTutorialTab('notes')).toBe('tips');
    expect(getNextTutorialTab('tips')).toBe('tips');
  });

  it('navigates backward through tutorial tabs', () => {
    expect(getPreviousTutorialTab('tips')).toBe('notes');
    expect(getPreviousTutorialTab('notes')).toBe('cross_hatch');
    expect(getPreviousTutorialTab('cross_hatch')).toBe('rules');
    expect(getPreviousTutorialTab('rules')).toBe('rules');
  });

  it('checks rule scope for rows, cols and 3x3 boxes', () => {
    expect(isCellInRuleScope(2, 5, 'row', 2)).toBe(true);
    expect(isCellInRuleScope(3, 5, 'row', 2)).toBe(false);

    expect(isCellInRuleScope(4, 7, 'col', 7)).toBe(true);
    expect(isCellInRuleScope(4, 6, 'col', 7)).toBe(false);

    // Box 4 is middle box (rows 3..5, cols 3..5)
    expect(isCellInRuleScope(4, 4, 'box', 4)).toBe(true);
    expect(isCellInRuleScope(1, 1, 'box', 4)).toBe(false);
  });

  it('detects if cell coordinate is blocked by laser rays', () => {
    const placements = [
      { row: 1, col: 4 },
      { row: 5, col: 7 },
    ];
    expect(isCoordinateBlockedByRay(1, 0, placements)).toBe(true);
    expect(isCoordinateBlockedByRay(8, 7, placements)).toBe(true);
    expect(isCoordinateBlockedByRay(0, 0, placements)).toBe(false);
  });

  it('eliminates a candidate number when placed', () => {
    const initial = [2, 5, 7] as const;
    const remaining = eliminateCandidateNumber(initial, 7);
    expect(remaining).toEqual([2, 5]);
    expect(eliminateCandidateNumber(remaining, 5)).toEqual([2]);
  });
});
