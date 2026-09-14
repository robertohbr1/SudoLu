import React, { useState } from 'react';
import { RuleScopeMode } from '../../types/tutorial.types';
import { isCellInRuleScope } from '../../utils/tutorialHelpers';

const SAMPLE_ROW_DIGITS: readonly number[] = [5, 3, 4, 6, 7, 8, 9, 1, 2];

function resolveRuleDescription(mode: RuleScopeMode): string {
  if (mode === 'row') {
    return 'Cada uma das 9 linhas horizontais deve conter os números de 1 a 9 sem repetição.';
  }
  if (mode === 'col') {
    return 'Cada uma das 9 colunas verticais deve conter os números de 1 a 9 sem repetição.';
  }
  return 'Cada um dos 9 blocos de 3×3 células deve conter os números de 1 a 9 sem repetição.';
}

function resolveCellRuleDisplay(
  row: number,
  col: number,
  mode: RuleScopeMode,
  isScopeCell: boolean
): number | null {
  if (!isScopeCell) return null;
  if (mode === 'row') return SAMPLE_ROW_DIGITS[col];
  if (mode === 'col') return SAMPLE_ROW_DIGITS[row];
  const boxInnerIndex = (row % 3) * 3 + (col % 3);
  return SAMPLE_ROW_DIGITS[boxInnerIndex];
}

export const TutorialRulesView: React.FC = () => {
  const [scopeMode, setScopeMode] = useState<RuleScopeMode>('row');
  const focusIndex = scopeMode === 'box' ? 4 : 3;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setScopeMode('row')}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            scopeMode === 'row'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          1. Regra das Linhas
        </button>
        <button
          onClick={() => setScopeMode('col')}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            scopeMode === 'col'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          2. Regra das Colunas
        </button>
        <button
          onClick={() => setScopeMode('box')}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            scopeMode === 'box'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          3. Regra dos Blocos 3×3
        </button>
      </div>

      <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 text-center">
        <p className="text-sm sm:text-base font-medium text-blue-900 dark:text-blue-100">
          {resolveRuleDescription(scopeMode)}
        </p>
      </div>

      <div className="w-64 sm:w-72 aspect-square mx-auto bg-slate-300 dark:bg-slate-800 p-1 rounded-xl shadow-lg border-2 border-slate-400 dark:border-slate-700">
        <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full">
          {[0, 1, 2].map((boxRow) =>
            [0, 1, 2].map((boxCol) => (
              <div
                key={`rule-box-${boxRow}-${boxCol}`}
                className="grid grid-cols-3 grid-rows-3 gap-[1px] bg-slate-400 dark:bg-slate-700 rounded overflow-hidden"
              >
                {[0, 1, 2].map((innerRow) =>
                  [0, 1, 2].map((innerCol) => {
                    const r = boxRow * 3 + innerRow;
                    const c = boxCol * 3 + innerCol;
                    const inScope = isCellInRuleScope(r, c, scopeMode, focusIndex);
                    const digit = resolveCellRuleDisplay(r, c, scopeMode, inScope);

                    return (
                      <div
                        key={`cell-${r}-${c}`}
                        className={`aspect-square flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                          inScope
                            ? 'bg-blue-500 text-white scale-100 ring-1 ring-blue-300 shadow-inner'
                            : 'bg-white dark:bg-slate-900 text-slate-300 dark:text-slate-700'
                        }`}
                      >
                        {digit ?? ''}
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
