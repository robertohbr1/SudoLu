import React from 'react';
import { Settings, Moon, Sun, RotateCcw, PlusCircle, GraduationCap } from 'lucide-react';

interface HeaderProps {
  readonly isDarkMode: boolean;
  readonly onToggleDarkMode: () => void;
  readonly onOpenSettings: () => void;
  readonly onOpenTutorial: () => void;
  readonly onRestart: () => void;
  readonly onNewGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleDarkMode,
  onOpenSettings,
  onOpenTutorial,
  onRestart,
  onNewGame,
}) => {
  return (
    <header className="flex items-center justify-between py-4 px-2 sm:px-4 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl shadow-md shadow-blue-500/20">
          9
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
            Sudo<span className="text-blue-600 dark:text-blue-400">Lu</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sudoku Inteligente para PC</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRestart}
          title="Reiniciar jogo atual"
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenTutorial}
          title="Aprenda a jogar Sudoku com dicas e animações"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800/60 shadow-sm transition-all"
        >
          <GraduationCap className="w-4 h-4" />
          <span className="hidden sm:inline">Como Jogar</span>
        </button>

        <button
          onClick={onNewGame}
          title="Novo jogo"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Jogo</span>
        </button>

        <button
          onClick={onToggleDarkMode}
          title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        <button
          onClick={onOpenSettings}
          title="Configurações de jogo e possibilidades"
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
