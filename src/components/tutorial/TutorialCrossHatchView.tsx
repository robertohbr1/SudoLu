import React, { useState } from 'react';
import { SudokuDigit } from '../../types/sudoku.types';
import { CrossHatchCellCoordinate, CrossHatchDemoState } from '../../types/tutorial.types';
import { isCoordinateBlockedByRay } from '../../utils/tutorialHelpers';

const CROSS_HATCH_SCENARIOS: readonly CrossHatchDemoState[] = [
  {
    digit: 1,
    targetBoxIndex: 2,
    existingPlacements: [{ row: 0, col: 1 }, { row: 1, col: 4 }, { row: 7, col: 7 }],
    targetWinningCell: { row: 2, col: 8 },
  },
  {
    digit: 2,
    targetBoxIndex: 2,
    existingPlacements: [{ row: 0, col: 2 }, { row: 2, col: 5 }, { row: 6, col: 6 }],
    targetWinningCell: { row: 1, col: 7 },
  },
  {
    digit: 3,
    targetBoxIndex: 2,
    existingPlacements: [{ row: 1, col: 0 }, { row: 2, col: 3 }, { row: 5, col: 8 }],
    targetWinningCell: { row: 0, col: 6 },
  },
  {
    digit: 4,
    targetBoxIndex: 2,
    existingPlacements: [{ row: 0, col: 0 }, { row: 1, col: 3 }, { row: 8, col: 7 }],
    targetWinningCell: { row: 2, col: 6 },
  },
  {
    digit: 5,
    targetBoxIndex: 2,
    existingPlacements: [{ row: 1, col: 2 }, { row: 2, col: 4 }, { row: 4, col: 6 }],
    targetWinningCell: { row: 0, col: 8 },
  },
  {
    digit: 6,
    targetBoxIndex: 2,
    existingPlacements: [{ row: 0, col: 3 }, { row: 2, col: 1 }, { row: 7, col: 8 }],
    targetWinningCell: { row: 1, col: 6 },
  },
  {
    digit: 7,
    targetBoxIndex: 2,
    existingPlacements: [{ row: 0, col: 4 }, { row: 1, col: 1 }, { row: 6, col: 7 }],
    targetWinningCell: { row: 2, col: 8 },
  },
  {
    digit: 8,
    targetBoxIndex: 2,
    existingPlacements: [{ row: 1, col: 5 }, { row: 2, col: 0 }, { row: 5, col: 6 }],
    targetWinningCell: { row: 0, col: 7 },
  },
  {
    digit: 9,
    targetBoxIndex: 2,
    existingPlacements: [{ row: 0, col: 5 }, { row: 2, col: 2 }, { row: 3, col: 8 }],
    targetWinningCell: { row: 1, col: 7 },
  },
];

function isCellInTargetBlock(row: number, col: number): boolean {
  return row >= 0 && row <= 2 && col >= 6 && col <= 8;
}

function getBoxFillerDigits(
  scenario: CrossHatchDemoState
): ReadonlyMap<string, number> {
  const fillers = new Map<string, number>();
  const available = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => d !== scenario.digit);
  let idx = 0;

  for (let r = 0; r <= 2; r++) {
    for (let c = 6; c <= 8; c++) {
      const isTarget =
        r === scenario.targetWinningCell.row && c === scenario.targetWinningCell.col;
      if (isTarget) continue;
      const blocked = isCoordinateBlockedByRay(r, c, scenario.existingPlacements);
      if (!blocked) {
        fillers.set(`${r},${c}`, available[idx % available.length]);
        idx++;
      }
    }
  }
  return fillers;
}

function resolveCellContent(
  row: number,
  col: number,
  scenario: CrossHatchDemoState,
  fillers: ReadonlyMap<string, number>,
  isPlaced: boolean
): number | string {
  const isExisting = scenario.existingPlacements.some(
    (p: CrossHatchCellCoordinate) => p.row === row && p.col === col
  );
  if (isExisting) return scenario.digit;
  if (row === scenario.targetWinningCell.row && col === scenario.targetWinningCell.col) {
    return isPlaced ? scenario.digit : '';
  }
  return fillers.get(`${row},${col}`) ?? '';
}

function resolveCellBackground(
  row: number,
  col: number,
  scenario: CrossHatchDemoState,
  isRay: boolean,
  inBlock: boolean,
  isPlaced: boolean
): string {
  if (row === scenario.targetWinningCell.row && col === scenario.targetWinningCell.col) {
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
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [isDigitPlaced, setIsDigitPlaced] = useState(false);

  const scenario = CROSS_HATCH_SCENARIOS[scenarioIndex];
  const activeDigit: SudokuDigit = scenario.digit;
  const fillers = getBoxFillerDigits(scenario);

  const handleActionClick = () => {
    if (!isDigitPlaced) {
      setIsDigitPlaced(true);
      return;
    }
    setIsDigitPlaced(false);
    setScenarioIndex((prev) => (prev + 1) % CROSS_HATCH_SCENARIOS.length);
  };

  const handleSelectDigit = (idx: number) => {
    setScenarioIndex(idx);
    setIsDigitPlaced(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60">
        <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-1">
          Estratégia de Varredura por Dígito (1 ao 9)
        </h4>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          1. Selecione o dígito <strong>{activeDigit}</strong> e trace os feixes onde ele já existe (linhas e colunas vermelhas).
          <br />
          2. No bloco superior direito (em amarelo), todas as outras casas estão bloqueadas pelos feixes ou já ocupadas.
          <br />
          3. Apenas a <strong>célula verde</strong> pode receber o <strong>{activeDigit}</strong>! Avance do 1 ao 9 para praticar a varredura.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {CROSS_HATCH_SCENARIOS.map((item, idx) => (
          <button
            key={item.digit}
            onClick={() => handleSelectDigit(idx)}
            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
              idx === scenarioIndex
                ? 'bg-blue-600 text-white shadow-sm scale-110'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
            }`}
          >
            {item.digit}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-2">
        <button
          onClick={handleActionClick}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all ${
            isDigitPlaced
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 animate-pulse'
          }`}
        >
          {isDigitPlaced
            ? `Próximo Dígito (${(activeDigit % 9) + 1}) →`
            : `▶ Inserir o ${activeDigit} na Célula Única`}
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
                    const isRay = isCoordinateBlockedByRay(r, c, scenario.existingPlacements);
                    const inTargetBlock = isCellInTargetBlock(r, c);
                    const bgClass = resolveCellBackground(
                      r,
                      c,
                      scenario,
                      isRay,
                      inTargetBlock,
                      isDigitPlaced
                    );
                    const content = resolveCellContent(r, c, scenario, fillers, isDigitPlaced);

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
