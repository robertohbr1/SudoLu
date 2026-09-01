import React from 'react';
import { CellCoordinate, SudokuBoardMatrix, SudokuDigit } from '../types/sudoku.types';
import { GamePreferenceSettings } from '../types/settings.types';
import { areCellsPeers } from '../engine/validator';
import { SudokuCell } from './SudokuCell';

interface SudokuBoardProps {
  readonly board: SudokuBoardMatrix;
  readonly selectedCell: CellCoordinate | null;
  readonly selectedDigit: SudokuDigit | null;
  readonly settings: GamePreferenceSettings;
  readonly onCellClick: (row: number, col: number) => void;
}

function resolveActiveDigit(
  selectedDigit: SudokuDigit | null,
  selectedCell: CellCoordinate | null,
  board: SudokuBoardMatrix
): SudokuDigit | null {
  if (selectedDigit !== null) return selectedDigit;
  if (!selectedCell) return null;
  const val = board[selectedCell.row][selectedCell.col].currentValue;
  return val !== 0 ? (val as SudokuDigit) : null;
}

export const SudokuBoard: React.FC<SudokuBoardProps> = ({
  board,
  selectedCell,
  selectedDigit,
  settings,
  onCellClick,
}) => {
  const activeDigit = resolveActiveDigit(selectedDigit, selectedCell, board);

  return (
    <div className="w-full max-w-[500px] aspect-square mx-auto bg-slate-400 dark:bg-slate-700 p-1.5 rounded-2xl shadow-xl border-2 border-slate-400 dark:border-slate-700">
      <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-full h-full bg-slate-400 dark:bg-slate-700 rounded-xl overflow-hidden">
        {[0, 1, 2].map((boxRow) =>
          [0, 1, 2].map((boxCol) => (
            <div
              key={`box-${boxRow}-${boxCol}`}
              className="grid grid-cols-3 grid-rows-3 gap-[1px] bg-slate-300 dark:bg-slate-800 rounded-lg overflow-hidden"
            >
              {[0, 1, 2].map((innerRow) =>
                [0, 1, 2].map((innerCol) => {
                  const r = boxRow * 3 + innerRow;
                  const c = boxCol * 3 + innerCol;
                  const cell = board[r][c];
                  const isSelected = selectedCell?.row === r && selectedCell?.col === c;
                  const isPeer = selectedCell ? areCellsPeers(selectedCell.row, selectedCell.col, r, c) : false;
                  const isMatchingDigit = activeDigit !== null && cell.currentValue === activeDigit;
                  const isCandidateMatch = activeDigit !== null && cell.currentValue === 0;

                  return (
                    <SudokuCell
                      key={`cell-${r}-${c}`}
                      cell={cell}
                      isSelected={isSelected}
                      isPeer={isPeer}
                      isMatchingDigit={isMatchingDigit}
                      isCandidateMatch={isCandidateMatch}
                      settings={settings}
                      onClick={onCellClick}
                    />
                  );
                })
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
