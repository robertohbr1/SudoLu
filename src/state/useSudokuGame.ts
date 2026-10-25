import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CellValue,
  DifficultyLevel,
  SudokuCellModel,
  SudokuDigit,
  SudokuPuzzlePackage,
  CellCoordinate,
  GameMoveRecord,
} from '../types/sudoku.types';
import { GamePreferenceSettings } from '../types/settings.types';
import { generateSudokuPuzzle } from '../engine/boardGenerator';
import { isBoardCompletedSuccessfully } from '../engine/validator';
import {
  createInitialCellMatrix,
  extractRawMatrix,
  findTargetHintCell,
  applySingleCandidateAutoFill,
  applyCellValueChange,
  applyCellErase,
  applyCandidateToggle,
  applyUndoMove,
  applyRedoMove,
  cloneBoardMatrix,
} from '../engine/gameEngine';
import {
  ComposedMove,
  composeMoveWithCascade,
  composeFillAllNotesMove,
  composeClearAllNotesMove,
} from '../engine/moveComposer';

function countBatchMistakes(
  changes: GameMoveRecord['changes'],
  solutionGrid: SudokuPuzzlePackage['solutionGrid']
): number {
  let mistakes = 0;
  for (const change of changes) {
    if (change.nextValue === 0 || change.nextValue === change.previousValue) continue;
    const expected = solutionGrid[change.coordinate.row][change.coordinate.col];
    if (change.nextValue !== expected) mistakes += 1;
  }
  return mistakes;
}

export function useSudokuGame(settings: GamePreferenceSettings) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [puzzlePackage, setPuzzlePackage] = useState<SudokuPuzzlePackage>(() =>
    generateSudokuPuzzle('medium')
  );
  const [board, setBoard] = useState<SudokuCellModel[][]>(() =>
    createInitialCellMatrix(puzzlePackage)
  );
  const [selectedCell, setSelectedCell] = useState<CellCoordinate | null>(null);
  const [selectedDigit, setSelectedDigit] = useState<SudokuDigit | null>(null);
  const [isPencilMode, setIsPencilMode] = useState<boolean>(false);
  const [isEraserMode, setIsEraserMode] = useState<boolean>(false);
  const [history, setHistory] = useState<GameMoveRecord[]>([]);
  const [redoHistory, setRedoHistory] = useState<GameMoveRecord[]>([]);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  // Bumped on new game / restart so the auto-fill effect runs on fresh boards
  // without having to depend on `board` itself (see effect below).
  const [boardEpoch, setBoardEpoch] = useState<number>(0);
  const boardRef = useRef<SudokuCellModel[][]>(board);

  const cascadeSettings = {
    autoFillSingleCandidate: settings.autoFillSingleCandidate,
    autoEraseCandidatesOnInput: settings.autoEraseCandidatesOnInput,
    showAutoCandidates: settings.showAutoCandidates,
  };

  // Timer interval
  useEffect(() => {
    if (isWon) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isWon]);

  // Keeps the ref in sync for the auto-fill effect (declared before it on purpose).
  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  // In digit-first mode, no cell should remain selected.
  useEffect(() => {
    if (settings.entryMode === 'digit-first') {
      setSelectedCell(null);
    }
  }, [settings.entryMode]);

  /**
    * Single entry point for every board mutation that must be undoable:
    * pushes ONE history record (player action + automatic consequences).
    */
  const commitMove = useCallback(
    (composed: ComposedMove) => {
      const record = composed.moveRecord;
      if (!record) return;
      // Updated eagerly so a re-run before re-render never works on a stale board.
      boardRef.current = composed.nextBoard;
      setHistory((prev) => [...prev, record]);
      setRedoHistory([]);
      setBoard(composed.nextBoard);
      const raw = extractRawMatrix(composed.nextBoard);
      if (isBoardCompletedSuccessfully(raw, puzzlePackage.solutionGrid)) setIsWon(true);
    },
    [puzzlePackage.solutionGrid]
  );

  const resetToPuzzle = useCallback((pkg: SudokuPuzzlePackage) => {
    const initialBoard = createInitialCellMatrix(pkg);
    boardRef.current = initialBoard;
    setBoard(initialBoard);
    setSelectedCell(null);
    setSelectedDigit(null);
    setIsEraserMode(false);
    setHistory([]);
    setRedoHistory([]);
    setTimerSeconds(0);
    setIsWon(false);
    setMistakesCount(0);
    setBoardEpoch((prev) => prev + 1);
  }, []);

  // Start new game
  const startNewGame = useCallback(
    (level: DifficultyLevel) => {
      const pkg = generateSudokuPuzzle(level);
      setDifficulty(level);
      setPuzzlePackage(pkg);
      resetToPuzzle(pkg);
    },
    [resetToPuzzle]
  );

  // Restart current game
  const restartCurrentGame = useCallback(() => {
    resetToPuzzle(puzzlePackage);
  }, [puzzlePackage, resetToPuzzle]);

  // Modifies a candidate number in cell
  const toggleCandidateInCell = useCallback(
    (row: number, col: number, digit: SudokuDigit) => {
      if (isWon) return;
      const toggled = applyCandidateToggle(board, row, col, digit);
      if (!toggled) return;
      // Removing a note may leave a single candidate; its auto-fill joins this record.
      const composed = composeMoveWithCascade(
        toggled.nextBoard,
        toggled.moveRecord.changes,
        cascadeSettings
      );
      if (composed.moveRecord) {
        const cascadeMistakes = countBatchMistakes(
          composed.moveRecord.changes,
          puzzlePackage.solutionGrid
        );
        if (cascadeMistakes > 0) setMistakesCount((prev) => prev + cascadeMistakes);
      }
      commitMove(composed);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [board, isWon, puzzlePackage.solutionGrid, commitMove, settings]
  );

  // Sets value on cell
  const setCellValue = useCallback(
    (row: number, col: number, digit: CellValue) => {
      if (isWon) return;
      const cell = board[row][col];
      if (cell.isGiven || cell.currentValue === digit) return;

      const placed = applyCellValueChange(
        board,
        row,
        col,
        digit,
        settings.autoEraseCandidatesOnInput
      );
      const composed = composeMoveWithCascade(
        placed.nextBoard,
        placed.moveRecord.changes,
        cascadeSettings
      );
      if (composed.moveRecord) {
        const batchMistakes = countBatchMistakes(
          composed.moveRecord.changes,
          puzzlePackage.solutionGrid
        );
        if (batchMistakes > 0) setMistakesCount((prev) => prev + batchMistakes);
      }
      commitMove(composed);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [board, isWon, puzzlePackage.solutionGrid, commitMove, settings]
  );

  // Erase specific cell (digit or manual notes)
  const eraseCellAt = useCallback(
    (row: number, col: number) => {
      if (isWon) return;
      const erased = applyCellErase(board, row, col);
      if (!erased) return;
      commitMove({ nextBoard: erased.nextBoard, moveRecord: erased.moveRecord });
    },
    [board, isWon, commitMove]
  );

  // Handles clicking a cell
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (isWon) return;

      if (isEraserMode) {
        eraseCellAt(row, col);
        setSelectedCell(settings.entryMode === 'digit-first' ? null : { row, col });
        return;
      }

      // In digit-first mode: never keep a cell selected.
      if (settings.entryMode === 'digit-first') {
        setSelectedCell(null);
        if (selectedDigit !== null) {
          if (isPencilMode && settings.allowManualCandidateEdit) {
            toggleCandidateInCell(row, col, selectedDigit);
          } else {
            setCellValue(row, col, selectedDigit);
          }
        }
        return;
      }

      // Cell-first mode: select the cell.
      setSelectedCell({ row, col });
    },
    [
      isWon,
      isEraserMode,
      eraseCellAt,
      settings.entryMode,
      settings.allowManualCandidateEdit,
      selectedDigit,
      isPencilMode,
      toggleCandidateInCell,
      setCellValue,
    ]
  );

  // Handles digit selection from keypad
  const handleDigitInput = useCallback(
    (digit: SudokuDigit) => {
      if (isWon) return;
      setIsEraserMode(false);

      if (settings.entryMode === 'digit-first') {
        setSelectedCell(null);
        setSelectedDigit((prev) => (prev === digit ? null : digit));
        return;
      }

      setSelectedDigit(digit);
      if (selectedCell) {
        if (isPencilMode && settings.allowManualCandidateEdit) {
          toggleCandidateInCell(selectedCell.row, selectedCell.col, digit);
        } else {
          setCellValue(selectedCell.row, selectedCell.col, digit);
        }
      }
    },
    [
      isWon,
      settings.entryMode,
      selectedCell,
      isPencilMode,
      settings.allowManualCandidateEdit,
      toggleCandidateInCell,
      setCellValue,
    ]
  );

  // Handles physical keyboard digit input
  const handleKeyboardDigitInput = useCallback(
    (digit: SudokuDigit) => {
      if (isWon) return;
      setIsEraserMode(false);

      if (settings.entryMode === 'digit-first') {
        setSelectedCell(null);
        setSelectedDigit((prev) => (prev === digit ? null : digit));
        return;
      }

      setSelectedDigit(digit);
      if (selectedCell) {
        if (isPencilMode && settings.allowManualCandidateEdit) {
          toggleCandidateInCell(selectedCell.row, selectedCell.col, digit);
        } else {
          setCellValue(selectedCell.row, selectedCell.col, digit);
        }
      }
    },
    [
      isWon,
      settings.entryMode,
      selectedCell,
      isPencilMode,
      settings.allowManualCandidateEdit,
      toggleCandidateInCell,
      setCellValue,
    ]
  );

  // Erase current selected cell or toggle eraser mode
  const handleErase = useCallback(() => {
    if (isWon) return;
    if (settings.entryMode === 'cell-first' && selectedCell) {
      eraseCellAt(selectedCell.row, selectedCell.col);
      setIsEraserMode(false);
      return;
    }
    setSelectedCell(null);
    setSelectedDigit(null);
    setIsEraserMode((prev) => !prev);
  }, [isWon, settings.entryMode, selectedCell, eraseCellAt]);

  // Provide hint for selected cell or optimal target cell
  const handleHint = useCallback(() => {
    if (isWon) return;
    const target = findTargetHintCell(board, puzzlePackage.solutionGrid, selectedCell);
    if (!target) return;
    setIsEraserMode(false);
    setSelectedCell(settings.entryMode === 'digit-first' ? null : target);
    const correctValue = puzzlePackage.solutionGrid[target.row][target.col] as SudokuDigit;
    setCellValue(target.row, target.col, correctValue);
  }, [isWon, settings.entryMode, selectedCell, board, puzzlePackage, setCellValue]);

  // Undo move (reverts all cells in the batch record atomically, newest change first)
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const lastMove = history[history.length - 1];
    const undoneBoard = applyUndoMove(board, lastMove);

    boardRef.current = undoneBoard;
    setHistory((prev) => prev.slice(0, -1));
    setRedoHistory((prev) => [...prev, lastMove]);
    setBoard(undoneBoard);
    // Undoing a winning move must reopen the game.
    setIsWon(false);

    if (settings.entryMode === 'digit-first') {
      setSelectedCell(null);
    } else {
      const first = lastMove.changes[0];
      if (first) setSelectedCell({ ...first.coordinate });
    }
  }, [board, history, settings.entryMode]);

  // Redo move (re-applies all cells in the batch record atomically)
  const handleRedo = useCallback(() => {
    if (redoHistory.length === 0) return;
    const nextMove = redoHistory[redoHistory.length - 1];
    const redoneBoard = applyRedoMove(board, nextMove);

    boardRef.current = redoneBoard;
    setRedoHistory((prev) => prev.slice(0, -1));
    setHistory((prev) => [...prev, nextMove]);
    setBoard(redoneBoard);

    const raw = extractRawMatrix(redoneBoard);
    if (isBoardCompletedSuccessfully(raw, puzzlePackage.solutionGrid)) {
      setIsWon(true);
    }

    if (settings.entryMode === 'digit-first') {
      setSelectedCell(null);
    } else {
      const first = nextMove.changes[0];
      if (first) setSelectedCell({ ...first.coordinate });
    }
  }, [board, redoHistory, puzzlePackage.solutionGrid, settings.entryMode]);

  // Auto-fill all manual candidates with calculated possibilities (undoable)
  const handleFillAllCandidates = useCallback(() => {
    if (isWon) return;
    commitMove(composeFillAllNotesMove(board, cascadeSettings));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, isWon, commitMove, settings]);

  // Clear all manual notes (undoable)
  const handleClearAllCandidates = useCallback(() => {
    if (isWon) return;
    commitMove(composeClearAllNotesMove(board));
  }, [board, isWon, commitMove]);

  /**
   * Fills every empty cell where `digit` is the ONLY candidate, then
   * erases that digit from manual candidates in all peer cells (row/col/box).
   * Triggered by double-clicking a digit on the keypad.
   *
   * @example handleAutoFillSingleCandidateDigit(5)
   */
  const handleAutoFillSingleCandidateDigit = useCallback(
    (digit: SudokuDigit) => {
      if (isWon) return;
      const { nextBoard, moveRecord } = applySingleCandidateAutoFill(
        board,
        digit,
        settings.autoEraseCandidatesOnInput
      );
      if (!moveRecord) return;
      const composed = composeMoveWithCascade(nextBoard, moveRecord.changes, cascadeSettings);
      if (composed.moveRecord) {
        const batchMistakes = countBatchMistakes(
          composed.moveRecord.changes,
          puzzlePackage.solutionGrid
        );
        if (batchMistakes > 0) setMistakesCount((prev) => prev + batchMistakes);
      }
      commitMove(composed);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [board, isWon, puzzlePackage.solutionGrid, commitMove, settings]
  );

  useEffect(() => {
    if (!settings.autoFillSingleCandidate) return;
    commitMove(composeMoveWithCascade(cloneBoardMatrix(boardRef.current), [], cascadeSettings));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    settings.autoFillSingleCandidate,
    settings.showAutoCandidates,
    settings.autoEraseCandidatesOnInput,
    boardEpoch,
  ]);

  return {
    difficulty,
    board,
    selectedCell,
    selectedDigit,
    isPencilMode,
    isEraserMode,
    timerSeconds,
    isWon,
    mistakesCount,
    canUndo: history.length > 0,
    canRedo: redoHistory.length > 0,
    startNewGame,
    restartCurrentGame,
    setSelectedCell,
    setSelectedDigit,
    setIsPencilMode,
    setIsEraserMode,
    handleCellClick,
    handleDigitInput,
    handleKeyboardDigitInput,
    handleErase,
    handleHint,
    handleUndo,
    handleRedo,
    handleFillAllCandidates,
    handleClearAllCandidates,
    handleAutoFillSingleCandidateDigit,
  };
}
