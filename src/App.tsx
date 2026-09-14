import React, { useState } from 'react';
import { Header } from './components/Header';
import { DifficultySelector } from './components/DifficultySelector';
import { StatsBar } from './components/StatsBar';
import { SudokuBoard } from './components/SudokuBoard';
import { ActionToolbar } from './components/ActionToolbar';
import { NumberKeypad } from './components/NumberKeypad';
import { SettingsModal } from './components/SettingsModal';
import { VictoryModal } from './components/VictoryModal';
import { TutorialModal } from './components/tutorial/TutorialModal';
import { useGameSettings } from './state/useGameSettings';
import { useSudokuGame } from './state/useSudokuGame';
import { useKeyboardShortcuts } from './utils/keyboardShortcuts';

export const App: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const { settings, updateSetting, toggleSetting } = useGameSettings();
  const game = useSudokuGame(settings);

  useKeyboardShortcuts({
    selectedCell: game.selectedCell,
    onSelectCell: game.setSelectedCell,
    onDigitInput: game.handleDigitInput,
    onErase: game.handleErase,
    onTogglePencilMode: () => game.setIsPencilMode((prev) => !prev),
    onUndo: game.handleUndo,
    onRedo: game.handleRedo,
    onHint: game.handleHint,
  });

  const handleToggleEntryMode = () => {
    updateSetting(
      'entryMode',
      settings.entryMode === 'digit-first' ? 'cell-first' : 'digit-first'
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-6 py-2 sm:py-4 flex-1 flex flex-col justify-between">
        {/* Top Section */}
        <div className="space-y-3">
          <Header
            isDarkMode={settings.isDarkMode}
            onToggleDarkMode={() => toggleSetting('isDarkMode')}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenTutorial={() => setIsTutorialOpen(true)}
            onRestart={game.restartCurrentGame}
            onNewGame={() => game.startNewGame(game.difficulty)}
          />

          <DifficultySelector
            currentDifficulty={game.difficulty}
            onSelectDifficulty={game.startNewGame}
          />

          <StatsBar
            timerSeconds={game.timerSeconds}
            mistakesCount={game.mistakesCount}
            entryMode={settings.entryMode}
            showAutoCandidates={settings.showAutoCandidates}
            onToggleEntryMode={handleToggleEntryMode}
          />
        </div>

        {/* Board Section */}
        <main className="my-2 sm:my-4 flex items-center justify-center">
          <SudokuBoard
            board={game.board}
            selectedCell={game.selectedCell}
            selectedDigit={game.selectedDigit}
            settings={settings}
            onCellClick={game.handleCellClick}
          />
        </main>

        {/* Controls Section */}
        <div className="space-y-3 pb-4">
          <ActionToolbar
            isPencilMode={game.isPencilMode}
            canUndo={game.canUndo}
            canRedo={game.canRedo}
            onTogglePencilMode={() => game.setIsPencilMode((prev) => !prev)}
            onUndo={game.handleUndo}
            onRedo={game.handleRedo}
            onErase={game.handleErase}
            onHint={game.handleHint}
            onFillCandidates={game.handleFillAllCandidates}
            onClearCandidates={game.handleClearAllCandidates}
          />

          <NumberKeypad
            board={game.board}
            selectedDigit={game.selectedDigit}
            entryMode={settings.entryMode}
            onSelectDigit={game.handleDigitInput}
            onDoubleClickDigit={game.handleAutoFillSingleCandidateDigit}
          />
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onUpdateSetting={updateSetting}
        onToggleSetting={toggleSetting}
        onClose={() => setIsSettingsOpen(false)}
      />

      <VictoryModal
        isOpen={game.isWon}
        difficulty={game.difficulty}
        timerSeconds={game.timerSeconds}
        mistakesCount={game.mistakesCount}
        onPlayAgain={() => game.startNewGame(game.difficulty)}
      />

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </div>
  );
};
