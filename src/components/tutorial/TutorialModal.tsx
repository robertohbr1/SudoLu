import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, GraduationCap, CheckCircle2 } from 'lucide-react';
import { TutorialTabKey } from '../../types/tutorial.types';
import {
  TUTORIAL_SECTIONS,
  getNextTutorialTab,
  getPreviousTutorialTab,
} from '../../utils/tutorialHelpers';
import { TutorialRulesView } from './TutorialRulesView';
import { TutorialCrossHatchView } from './TutorialCrossHatchView';
import { TutorialNotesView } from './TutorialNotesView';
import { TutorialTipsView } from './TutorialTipsView';

interface TutorialModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

function renderTabContent(activeTab: TutorialTabKey): React.ReactNode {
  if (activeTab === 'rules') return <TutorialRulesView />;
  if (activeTab === 'cross_hatch') return <TutorialCrossHatchView />;
  if (activeTab === 'notes') return <TutorialNotesView />;
  return <TutorialTipsView />;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TutorialTabKey>('rules');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isFirstTab = activeTab === 'rules';
  const isLastTab = activeTab === 'tips';

  const handleNextStep = () => {
    if (isLastTab) {
      onClose();
      return;
    }
    setActiveTab(getNextTutorialTab(activeTab));
  };

  const handlePrevStep = () => {
    setActiveTab(getPreviousTutorialTab(activeTab));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-none">
                Como Jogar Sudoku no SudoLu
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Regras, estratégias e técnica de varredura
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/30 px-2 py-1 gap-1 overflow-x-auto">
          {TUTORIAL_SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-lg text-xs font-semibold transition-all text-center ${
                activeTab === section.id
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {section.shortLabel}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {renderTabContent(activeTab)}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={handlePrevStep}
            disabled={isFirstTab}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              isFirstTab
                ? 'opacity-30 cursor-not-allowed text-slate-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          <div className="flex gap-1.5">
            {TUTORIAL_SECTIONS.map((section) => (
              <span
                key={section.id}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeTab === section.id
                    ? 'bg-blue-600 dark:bg-blue-400 w-5'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNextStep}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
          >
            {isLastTab ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Vamos Jogar!
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
