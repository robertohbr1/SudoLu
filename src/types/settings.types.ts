export type InputEntryMode = 'cell-first' | 'digit-first';

export interface GamePreferenceSettings {
  readonly showAutoCandidates: boolean;
  readonly allowManualCandidateEdit: boolean;
  readonly autoEraseCandidatesOnInput: boolean;
  readonly autoFillSingleCandidate: boolean;
  readonly highlightMatchingDigits: boolean;
  readonly highlightPeerCells: boolean;
  readonly highlightConflicts: boolean;
  readonly entryMode: InputEntryMode;
  readonly isDarkMode: boolean;
}

export const INITIAL_GAME_SETTINGS: GamePreferenceSettings = {
  showAutoCandidates: false,
  allowManualCandidateEdit: true,
  autoEraseCandidatesOnInput: true,
  autoFillSingleCandidate: false,
  highlightMatchingDigits: true,
  highlightPeerCells: true,
  highlightConflicts: true,
  entryMode: 'digit-first',
  isDarkMode: false,
};
