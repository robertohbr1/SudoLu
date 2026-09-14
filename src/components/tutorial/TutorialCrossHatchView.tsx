import React, { useState } from 'react';
import { SudokuDigit } from '../../types/sudoku.types';
import { CrossHatchCellCoordinate } from '../../types/tutorial.types';
import { isCoordinateBlockedByRay } from '../../utils/tutorialHelpers';

const DEMO_PLACEMENTS_1: readonly CrossHatchCellCoordinate[] = [
  { row: 0, col: 1 }, // Bloco superior esquerdo (linha 0)
  { row: 1, col: 4 }, // Segunda linha do bloco central (linha 1)
  { row: 7, col: 7 }, // Bloco inferior (coluna 7)
];

const TARGET_WINNING_CELL: CrossHatchCellCoordinate = { row: 2, col: 8 };

function isCellInTargetBlock(row: number, col: number): boolean {
  return row >= 0 && row <= 2 && col >= 6 && col <= 8;
}

function resolveCellContent(
  row: number,
  col: number,
  isPlaced: boolean
): number | string {
  if (row === 0 && col === 1) return 1;
  if (row === 1 && col === 4) return 1; // 1 na segunda linha do bloco central
  if (row === 7 && col === 7) return 1; // 1 no bloco inferior (coluna 7)
  if (row === 0 && col === 6) return 4;
  if (row === 0 && col === 7) return 7;
  if (row === 1 && col === 6) return 9;
  if (row === 1 && col === 8) return 5;
  if (row === 2 && col === 6) return 3;
  if (row === 2 && col === 7) return 8;
  if (row === 2 && col === 8) return isPlaced ? 1 : '';
  return '';
}

function resolveCellBackground(
  row: number,
  col: number,
  isRay: boolean,
  inBlock: boolean,
  isPlaced: boolean
): string {
  if (row === TARGET_WINNING_CELL.row && col === TARGET_WINNING_CELL.col) {
    return isPlaced
      ? 'bg-emerald-500 text-white font-black animate-pop-in ring-2 ring-emerald-300'
      : 'bg-emerald-200 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500 animate-pulse-glow';
  }
  if (inBlock) {
    return 'bg-amber-100 dark:bg-amber-950/60 text-slate-800 dark:text-slate-100';
  }
  if (isRay) {
    return 'bg-rose-100/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400';
  }
  return 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400';
}

export const TutorialCrossHatchView: React.FC = () => {
  const [isDigitPlaced, setIsDigitPlaced] = useState(false);
  const activeDigit: SudokuDigit = 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60">
        <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-1">
          Estratégia de Varredura por Dígito (1 ao 9)
        </h4>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          1. Selecione o dígito <strong>{activeDigit}</strong> e trace os feixes onde ele já existe (linhas e colunas vermelhas).
          <br />
          2. Veja os 1s existentes: um no bloco esquerdo (linha 0), outro na <strong>segunda linha do bloco central</strong> (linha 1), e outro no bloco inferior (coluna 7).
          <br />
          3. No bloco superior direito (em amarelo), todas as casas estão bloqueadas pelos feixes ou ocupadas. Apenas a <strong>célula verde</strong> pode receber o 1!
        </p>
      </div>

      <div className="flex justify-center gap-2">
        <button
          onClick={() => setIsDigitPlaced((prev) => !prev)}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all ${
            isDigitPlaced
              ? 'bg-slate-700 text-white hover:bg-slate-800'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 animate-pulse'
          }`}
        >
          {isDigitPlaced ? '↺ Reiniciar Animação' : '▶ Inserir o 1 na Célula Única'}
        </button>
      </div>

      <div className="w-64 sm:w-72 aspect-square mx-auto bg-slate-300 dark:bg-slate-800 p-1 rounded-xl shadow-lg border-2 border-slate-400 dark:border-slate-700">
        <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full">
          {[0, 1, 2].map((boxRow) =>
            [0, 1, 2].map((boxCol) => (
              <div
                key={`ch-box-${boxRow}-${boxCol}`}
                className={`grid grid-cols-3 grid-rows-3 gap-[1px] rounded overflow-hidden ${
                  boxRow === 0 && boxCol === 2
                    ? 'ring-2 ring-amber-500 bg-amber-400 dark:bg-amber-600'
                    : 'bg-slate-400 dark:bg-slate-700'
                }`}
              >
                {[0, 1, 2].map((innerRow) =>
                  [0, 1, 2].map((innerCol) => {
                    const r = boxRow * 3 + innerRow;
                    const c = boxCol * 3 + innerCol;
                    const isRay = isCoordinateBlockedByRay(r, c, DEMO_PLACEMENTS_1);
                    const inTargetBlock = isCellInTargetBlock(r, c);
                    const bgClass = resolveCellBackground(r, c, isRay, inTargetBlock, isDigitPlaced);
                    const content = resolveCellContent(r, c, isDigitPlaced);

                    return (
                      <div
                        key={`ch-cell-${r}-${c}`}
                        className={`aspect-square flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-200 ${bgClass}`}
                      >
                        {content}
                      </div>
                    );
                  })
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
