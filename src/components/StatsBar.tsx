import React from 'react';
import { Timer, AlertTriangle, MousePointerClick, Sparkles } from 'lucide-react';
import { InputEntryMode } from '../types/settings.types';

interface StatsBarProps {
  readonly timerSeconds: number;
  readonly mistakesCount: number;
  readonly entryMode: InputEntryMode;
  readonly showAutoCandidates: boolean;
  readonly onToggleEntryMode: () => void;
}

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  timerSeconds,
  mistakesCount,
  entryMode,
  showAutoCandidates,
  onToggleEntryMode,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-900/60 rounded-xl text-xs sm:text-sm text-slate-600 dark:text-slate-300">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-800 dark:text-slate-100">
          <Timer className="w-4 h-4 text-blue-500" />
          <span>{formatDuration(timerSeconds)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <AlertTriangle className={`w-4 h-4 ${mistakesCount > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
          <span>Erros: <strong className={mistakesCount > 0 ? 'text-rose-600 dark:text-rose-400' : ''}>{mistakesCount}</strong></span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {showAutoCandidates && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-medium border border-indigo-200 dark:border-indigo-800">
            <Sparkles className="w-3.5 h-3.5" />
            Auto-Candidatos
          </span>
        )}

        <button
          onClick={onToggleEntryMode}
          title="Clique para alternar entre Dígito Primeiro e Célula Primeiro"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors font-medium text-slate-700 dark:text-slate-200"
        >
          <MousePointerClick className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Modo: <strong>{entryMode === 'digit-first' ? 'Dígito 1º' : 'Célula 1º'}</strong></span>
        </button>
      </div>
    </div>
  );
};
