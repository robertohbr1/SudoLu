import React from 'react';
import { Undo2, Redo2, Eraser, Edit3, Lightbulb, ListPlus, Trash2 } from 'lucide-react';

interface ActionToolbarProps {
  readonly isPencilMode: boolean;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly onTogglePencilMode: () => void;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly onErase: () => void;
  readonly onHint: () => void;
  readonly onFillCandidates: () => void;
  readonly onClearCandidates: () => void;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  isPencilMode,
  canUndo,
  canRedo,
  onTogglePencilMode,
  onUndo,
  onRedo,
  onErase,
  onHint,
  onFillCandidates,
  onClearCandidates,
}) => {
  return (
    <div className="w-full max-w-[500px] mx-auto flex items-center justify-between gap-1 sm:gap-2 px-1">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        title="Desfazer jogada (Ctrl+Z)"
        className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
      >
        <Undo2 className="w-5 h-5 mb-0.5" />
        <span>Desfazer</span>
      </button>

      <button
        onClick={onRedo}
        disabled={!canRedo}
        title="Refazer jogada (Ctrl+Y)"
        className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
      >
        <Redo2 className="w-5 h-5 mb-0.5" />
        <span>Refazer</span>
      </button>

      <button
        onClick={onErase}
        title="Apagar número ou notas da célula (Backspace/Del)"
        className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
      >
        <Eraser className="w-5 h-5 mb-0.5" />
        <span>Apagar</span>
      </button>

      <button
        onClick={onTogglePencilMode}
        title="Alternar modo de anotações/candidatos (Tecla N)"
        className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-medium transition-all ${
          isPencilMode
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
        }`}
      >
        <div className="relative">
          <Edit3 className="w-5 h-5 mb-0.5" />
          <span
            className={`absolute -top-1 -right-2 text-[9px] font-bold px-1 rounded-full ${
              isPencilMode ? 'bg-amber-400 text-slate-900' : 'bg-slate-400 text-white'
            }`}
          >
            {isPencilMode ? 'ON' : 'OFF'}
          </span>
        </div>
        <span>Lápis</span>
      </button>

      <button
        onClick={onHint}
        title="Revelar dica para a célula selecionada"
        className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
      >
        <Lightbulb className="w-5 h-5 mb-0.5 text-amber-500" />
        <span>Dica</span>
      </button>

      <button
        onClick={onFillCandidates}
        title="Preencher automaticamente todos os números possíveis nas células"
        className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
      >
        <ListPlus className="w-5 h-5 mb-0.5 text-indigo-500" />
        <span>Auto-Notas</span>
      </button>

      <button
        onClick={onClearCandidates}
        title="Limpar todas as anotações manuais"
        className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
      >
        <Trash2 className="w-5 h-5 mb-0.5 text-slate-400" />
        <span>Limpar Notas</span>
      </button>
    </div>
  );
};
