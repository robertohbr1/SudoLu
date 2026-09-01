import { useState, useEffect, useCallback } from 'react';
import {
  CellValue,
  DifficultyLevel,
  RawNumericMatrix,
  SingleCellChange,
  SudokuCellModel,
  SudokuDigit,
  SudokuPuzzlePackage,
  CellCoordinate,
  GameMoveRecord,
} from '../types/sudoku.types';
import { GamePreferenceSettings } from '../types/settings.types';
import { generateSudokuPuzzle } from '../engine/boardGenerator';
import { computeCellCandidates } from '../engine/candidateEvaluator';
import { findConflictCells, isBoardCompletedSuccessfully } from '../engine/validator';

/**
 * Builds the initial reactive cell matrix from raw puzzle data.
 */
function createInitialCellMatrix(puzzle: SudokuPuzzlePackage): SudokuCellModel[][] {
  const matrix: SudokuCellModel[][] = [];

  for (let r = 0; r < 9; r++) {
    const rowCells: SudokuCellModel[] = [];
    for (let c = 0; c < 9; c++) {
      const val = puzzle.initialGrid[r][c];
      const isGiven = val !== 0;
      const autoCands = isGiven ? new Set<SudokuDigit>() : computeCellCandidates(puzzle.initialGrid, r, c);

      rowCells.push({
        row: r,
        col: c,
        initialValue: val,
        currentValue: val,
        isGiven,
        manualCandidates: new Set<SudokuDigit>(),
        autoCandidates: autoCands,
        isInvalid: false,
      });
    }
    matrix.push(rowCells);
  }
  return matrix;
}

/**
 * Extracts raw 2D numeric values from current cell model matrix.
 */
export function extractRawMatrix(matrix: readonly (readonly SudokuCellModel[])[]): RawNumericMatrix {
  return matrix.map((row) => row.map((cell) => cell.currentValue));
}

function removeCandidateFromCell(cell: SudokuCellModel, digit: SudokuDigit): SudokuCellModel {
  if (!cell.manualCandidates.has(digit)) return cell;
  const nextSet = new Set(cell.manualCandidates);
  nextSet.delete(digit);
  return { ...cell, manualCandidates: nextSet };
}

/**
 * Removes placed digit from candidates in peer cells (row, column, box).
 */
function cleanPeerCandidates(
  matrix: SudokuCellModel[][],
  row: number,
  col: number,
  digit: SudokuDigit
): void {
  const boxR = Math.floor(row / 3) * 3;
  const boxC = Math.floor(col / 3) * 3;

  for (let i = 0; i < 9; i++) {
    matrix[row][i] = removeCandidateFromCell(matrix[row][i], digit);
    matrix[i][col] = removeCandidateFromCell(matrix[i][col], digit);
  }
  for (let r = boxR; r < boxR + 3; r++) {
    for (let c = boxC; c < boxC + 3; c++) {
      matrix[r][c] = removeCandidateFromCell(matrix[r][c], digit);
    }
  }
}

/**
 * Recalculates auto-candidates and validation states for all cells.
 */
function refreshMatrixDerivations(matrix: SudokuCellModel[][]): void {
  const raw = extractRawMatrix(matrix);
  const conflicts = findConflictCells(raw);

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = matrix[r][c];
      const key = `${r},${c}`;
      const isInvalid = conflicts.has(key);
      const autoCandidates = cell.currentValue === 0
        ? computeCellCandidates(raw, r, c)
        : new Set<SudokuDigit>();

      matrix[r][c] = {
        ...cell,
        isInvalid,
        autoCandidates,
      };
    }
  }
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
  const [history, setHistory] = useState<GameMoveRecord[]>([]);
  const [redoHistory, setRedoHistory] = useState<GameMoveRecord[]>([]);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [mistakesCount, setMistakesCount] = useState<number>(0);

  // Timer interval
  useEffect(() => {
    if (isWon) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isWon]);

  // Start new game
  const startNewGame = useCallback((level: DifficultyLevel) => {
    const pkg = generateSudokuPuzzle(level);
    setDifficulty(level);
    setPuzzlePackage(pkg);
    setBoard(createInitialCellMatrix(pkg));
    setSelectedCell(null);
    setSelectedDigit(null);
    setHistory([]);
    setRedoHistory([]);
    setTimerSeconds(0);
    setIsWon(false);
    setMistakesCount(0);
  }, []);

  // Restart current game
  const restartCurrentGame = useCallback(() => {
    setBoard(createInitialCellMatrix(puzzlePackage));
    setSelectedCell(null);
    setSelectedDigit(null);
    setHistory([]);
    setRedoHistory([]);
    setTimerSeconds(0);
    setIsWon(false);
    setMistakesCount(0);
  }, [puzzlePackage]);

  // Modifies a candidate number in cell
  const toggleCandidateInCell = useCallback(
    (row: number, col: number, digit: SudokuDigit) => {
      const cell = board[row][col];
      if (cell.isGiven || cell.currentValue !== 0) return;

      const nextCandidates = new Set(cell.manualCandidates);
      if (nextCandidates.has(digit)) {
        nextCandidates.delete(digit);
      } else {
        nextCandidates.add(digit);
      }

      setHistory((prev) => [
        ...prev,
        {
          changes: [{
            coordinate: { row, col },
            previousValue: cell.currentValue,
            nextValue: cell.currentValue,
            previousCandidates: new Set(cell.manualCandidates),
            nextCandidates,
          }],
        },
      ]);
      setRedoHistory([]);

      setBoard((prev) => {
        const next = prev.map((r) => [...r]);
        next[row][col] = { ...cell, manualCandidates: nextCandidates };
        return next;
      });
    },
    [board]
  );

  // Sets value on cell
  const setCellValue = useCallback(
    (row: number, col: number, digit: CellValue) => {
      const cell = board[row][col];
      if (cell.isGiven || cell.currentValue === digit) return;

      const expectedVal = puzzlePackage.solutionGrid[row][col];
      if (digit !== 0 && digit !== expectedVal) {
        setMistakesCount((prev) => prev + 1);
      }

      setHistory((prev) => [
        ...prev,
        {
          changes: [{
            coordinate: { row, col },
            previousValue: cell.currentValue,
            nextValue: digit,
            previousCandidates: new Set(cell.manualCandidates),
            nextCandidates: new Set(),
          }],
        },
      ]);
      setRedoHistory([]);

      setBoard((prev) => {
        const next = prev.map((r) => [...r]);
        next[row][col] = {
          ...cell,
          currentValue: digit,
          manualCandidates: new Set(),
        };

        if (digit !== 0 && settings.autoEraseCandidatesOnInput) {
          cleanPeerCandidates(next, row, col, digit as SudokuDigit);
        }

        refreshMatrixDerivations(next);

        const currentRaw = extractRawMatrix(next);
        if (isBoardCompletedSuccessfully(currentRaw, puzzlePackage.solutionGrid)) {
          setIsWon(true);
        }

        return next;
      });
    },
    [board, puzzlePackage, settings.autoEraseCandidatesOnInput]
  );

  // Handles clicking a cell
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      // In digit-first mode with a digit pre-selected: fill and deselect.
      // Deselecting prevents the next digit-keypad click from overwriting this cell.
      if (settings.entryMode === 'digit-first' && selectedDigit !== null) {
        setSelectedCell(null);
        if (isPencilMode && settings.allowManualCandidateEdit) {
          toggleCandidateInCell(row, col, selectedDigit);
        } else {
          setCellValue(row, col, selectedDigit);
        }
        return;
      }

      // Cell-first mode (or no digit pre-selected): just select the cell.
      setSelectedCell({ row, col });
    },
    [settings.entryMode, settings.allowManualCandidateEdit, selectedDigit, isPencilMode, toggleCandidateInCell, setCellValue]
  );

  // Handles digit selection from keypad or keyboard
  const handleDigitInput = useCallback(
    (digit: SudokuDigit) => {
      setSelectedDigit(digit);

      // In digit-first mode the digit is just pre-selected; cell clicks do the writing.
      // In cell-first mode (or when triggered by keyboard on a selected cell) we write immediately.
      if (settings.entryMode === 'digit-first') return;

      if (selectedCell) {
        if (isPencilMode && settings.allowManualCandidateEdit) {
          toggleCandidateInCell(selectedCell.row, selectedCell.col, digit);
        } else {
          setCellValue(selectedCell.row, selectedCell.col, digit);
        }
      }
    },
    [settings.entryMode, selectedCell, isPencilMode, settings.allowManualCandidateEdit, toggleCandidateInCell, setCellValue]
  );

  // Erase current selected cell
  const handleErase = useCallback(() => {
    if (!selectedCell) return;
    setCellValue(selectedCell.row, selectedCell.col, 0);
  }, [selectedCell, setCellValue]);

  // Provide hint for selected cell
  const handleHint = useCallback(() => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (board[row][col].isGiven) return;
    const correctValue = puzzlePackage.solutionGrid[row][col];
    setCellValue(row, col, correctValue);
  }, [selectedCell, board, puzzlePackage, setCellValue]);

  // Undo move (reverts all cells in the batch record atomically)
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const lastMove = history[history.length - 1];

    setHistory((prev) => prev.slice(0, -1));
    setRedoHistory((prev) => [...prev, lastMove]);

    setBoard((prev) => {
      const next = prev.map((r) => [...r]);
      for (const change of lastMove.changes) {
        const { row, col } = change.coordinate;
        next[row][col] = {
          ...next[row][col],
          currentValue: change.previousValue,
          manualCandidates: new Set(change.previousCandidates),
        };
      }
      refreshMatrixDerivations(next);
      return next;
    });

    // Focus the first affected cell so the user has visual feedback
    const first = lastMove.changes[0];
    if (first) setSelectedCell({ ...first.coordinate });
  }, [history]);

  // Redo move (re-applies all cells in the batch record atomically)
  const handleRedo = useCallback(() => {
    if (redoHistory.length === 0) return;
    const nextMove = redoHistory[redoHistory.length - 1];

    setRedoHistory((prev) => prev.slice(0, -1));
    setHistory((prev) => [...prev, nextMove]);

    setBoard((prev) => {
      const next = prev.map((r) => [...r]);
      for (const change of nextMove.changes) {
        const { row, col } = change.coordinate;
        next[row][col] = {
          ...next[row][col],
          currentValue: change.nextValue,
          manualCandidates: new Set(change.nextCandidates),
        };
      }
      refreshMatrixDerivations(next);
      return next;
    });

    const first = nextMove.changes[0];
    if (first) setSelectedCell({ ...first.coordinate });
  }, [redoHistory]);

  // Auto-fill all manual candidates with calculated possibilities
  const handleFillAllCandidates = useCallback(() => {
    setBoard((prev) => {
      const next = prev.map((r) => [...r]);
      const raw = extractRawMatrix(next);

      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (next[r][c].currentValue === 0) {
            next[r][c] = {
              ...next[r][c],
              manualCandidates: computeCellCandidates(raw, r, c),
            };
          }
        }
      }
      return next;
    });
  }, []);

  // Clear all manual notes
  const handleClearAllCandidates = useCallback(() => {
    setBoard((prev) => {
      return prev.map((row) =>
        row.map((cell) => ({
          ...cell,
          manualCandidates: new Set<SudokuDigit>(),
        }))
      );
    });
  }, []);

  /**
   * Fills every empty cell where `digit` is the ONLY auto-candidate, then
   * erases that digit from manual candidates in all peer cells (row/col/box).
   * Triggered by double-clicking a digit on the keypad.
   *
   * @example handleAutoFillSingleCandidateDigit(5)
   */
  const handleAutoFillSingleCandidateDigit = useCallback(
    (digit: SudokuDigit) => {
      setBoard((prev) => {
        // Identify all cells where this digit is the sole auto-candidate.
        const targets: Array<{ row: number; col: number; prevCell: typeof prev[0][0] }> = [];
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            const cell = prev[r][c];
            if (
              cell.currentValue === 0 &&
              !cell.isGiven &&
              cell.autoCandidates.size === 1 &&
              cell.autoCandidates.has(digit)
            ) {
              targets.push({ row: r, col: c, prevCell: cell });
            }
          }
        }

        if (targets.length === 0) return prev;

        const next = prev.map((r) => [...r]);

        for (const { row, col } of targets) {
          next[row][col] = {
            ...next[row][col],
            currentValue: digit,
            manualCandidates: new Set<SudokuDigit>(),
          };

          if (settings.autoEraseCandidatesOnInput) {
            cleanPeerCandidates(next, row, col, digit);
          }
        }

        refreshMatrixDerivations(next);

        // Build a single batch history record covering all filled cells so
        // one Undo reverts all of them atomically.
        const batchChanges: SingleCellChange[] = targets.map(({ row, col, prevCell }) => ({
          coordinate: { row, col },
          previousValue: prevCell.currentValue,
          nextValue: digit,
          previousCandidates: new Set(prevCell.manualCandidates),
          nextCandidates: new Set<SudokuDigit>(),
        }));

        setHistory((h) => [...h, { changes: batchChanges }]);
        setRedoHistory([]);

        const raw = extractRawMatrix(next);
        if (isBoardCompletedSuccessfully(raw, puzzlePackage.solutionGrid)) {
          setIsWon(true);
        }

        return next;
      });
    },
    [settings.autoEraseCandidatesOnInput, puzzlePackage.solutionGrid]
  );

  return {
    difficulty,
    board,
    selectedCell,
    selectedDigit,
    isPencilMode,
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
    handleCellClick,
    handleDigitInput,
    handleErase,
    handleHint,
    handleUndo,
    handleRedo,
    handleFillAllCandidates,
    handleClearAllCandidates,
    handleAutoFillSingleCandidateDigit,
  };
}
