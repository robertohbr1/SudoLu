import React, { useState } from 'react';
import { SudokuDigit } from '../../types/sudoku.types';
import { eliminateCandidateNumber } from '../../utils/tutorialHelpers';

export const TutorialNotesView: React.FC = () => {
  const [neighborValue, setNeighborValue] = useState<SudokuDigit | null>(null);
  const [isResolved, setIsResolved] = useState(false);

  const initialCandidates: readonly SudokuDigit[] = [2, 7];
  const activeCandidates = neighborValue
    ? eliminateCandidateNumber(initialCandidates, neighborValue)
    : initialCandidates;

  const handleSimulateNeighbor = () => {
    if (neighborValue === null) {
      setNeighborValue(7);
      return;
    }
    setNeighborValue(null);
    setIsResolved(false);
  };

  const handleResolveSingle = () => {
    if (activeCandidates.length === 1) {
      setIsResolved(true);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-900/60">
        <h4 className="text-sm font-bold text-purple-900 dark:text-purple-200 mb-1">
          Quando a Varredura Travar: Use as Anotações (Modo Lápis)
        </h4>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          Se você varrer de 1 a 9 e não encontrar nenhuma casa com número garantido,
          ative as <strong>Anotações (Lápis)</strong>. Anote as possibilidades nas células.
          Quando você preencher outra casa vizinha, os números conflitantes são eliminados até restar apenas um!
        </p>
      </div>

      <div className="flex justify-center gap-2">
        <button
          onClick={handleSimulateNeighbor}
          className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all"
        >
          {neighborValue === null ? '1. Jogar 7 na casa vizinha' : '↺ Desfazer jogada vizinha'}
        </button>
        {neighborValue !== null && !isResolved && (
          <button
            onClick={handleResolveSingle}
            className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md animate-pulse transition-all"
          >
            2. Confirmar o 2 restante!
          </button>
        )}
      </div>

      <div className="max-w-xs mx-auto w-full bg-slate-200 dark:bg-slate-800 p-2 rounded-xl shadow-lg border border-slate-300 dark:border-slate-700">
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-2">
          Demonstração em 3 células vizinhas na mesma linha:
        </p>
        <div className="grid grid-cols-3 gap-2">
          {/* Célula Alvo com Anotações */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 mb-1 font-medium">Sua Célula</span>
            <div
              className={`w-20 h-20 rounded-xl flex items-center justify-center border-2 transition-all ${
                isResolved
                  ? 'bg-emerald-500 text-white border-emerald-400 font-bold text-2xl animate-pop-in'
                  : activeCandidates.length === 1
                  ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-400 ring-2 ring-amber-400 animate-pulse-glow'
                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'
              }`}
            >
              {isResolved ? (
                '2'
              ) : (
                <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-1 text-[11px] font-bold">
                  <span className={activeCandidates.includes(2) ? 'text-blue-600 dark:text-blue-400' : 'invisible'}>
                    2
                  </span>
                  <span className="invisible">3</span>
                  <span className="invisible">4</span>
                  <span className="invisible">5</span>
                  <span className="invisible">6</span>
                  <span
                    className={`col-start-1 row-start-3 transition-all ${
                      neighborValue === 7
                        ? 'line-through text-rose-500 opacity-30'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    7
                  </span>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-500 mt-1">
              {isResolved
                ? 'Número Confirmado!'
                : activeCandidates.length === 1
                ? 'Único candidato!'
                : 'Anotações: 2 e 7'}
            </span>
          </div>

          {/* Célula Vizinha */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 mb-1 font-medium">Vizinha 1</span>
            <div
              className={`w-20 h-20 rounded-xl flex items-center justify-center border-2 text-2xl font-bold transition-all ${
                neighborValue === 7
                  ? 'bg-indigo-600 text-white border-indigo-400 animate-pop-in'
                  : 'bg-white dark:bg-slate-900 border-dashed border-slate-300 dark:border-slate-700 text-slate-400'
              }`}
            >
              {neighborValue ?? '?'}
            </div>
            <span className="text-[10px] text-slate-500 mt-1">
              {neighborValue ? 'Preenchida com 7' : 'Vazia'}
            </span>
          </div>

          {/* Célula Fixa */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 mb-1 font-medium">Vizinha 2</span>
            <div className="w-20 h-20 rounded-xl flex items-center justify-center border-2 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-2xl">
              5
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Dígito inicial</span>
          </div>
        </div>
      </div>
    </div>
  );
};
