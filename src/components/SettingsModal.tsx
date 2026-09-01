import React from 'react';
import { X, Sparkles, Edit3, Eraser, CheckSquare, Eye, Palette } from 'lucide-react';
import { GamePreferenceSettings } from '../types/settings.types';

interface SettingsModalProps {
  readonly isOpen: boolean;
  readonly settings: GamePreferenceSettings;
  readonly onUpdateSetting: <K extends keyof GamePreferenceSettings>(
    key: K,
    value: GamePreferenceSettings[K]
  ) => void;
  readonly onToggleSetting: (key: keyof Omit<GamePreferenceSettings, 'entryMode'>) => void;
  readonly onClose: () => void;
}

interface SwitchItemProps {
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly description: string;
  readonly checked: boolean;
  readonly onChange: () => void;
}

const SwitchItem: React.FC<SwitchItemProps> = ({
  icon,
  title,
  description,
  checked,
  onChange,
}) => (
  <label className="flex items-start justify-between gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mt-0.5">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">{description}</p>
      </div>
    </div>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="mt-1 w-5 h-5 rounded text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
    />
  </label>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSetting,
  onToggleSetting,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Configurações do Jogo</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Modo de Entrada</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSetting('entryMode', 'digit-first')}
                className={`p-3 rounded-xl border text-left transition ${
                  settings.entryMode === 'digit-first'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-300 ring-1 ring-blue-600'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-semibold text-sm">Dígito Primeiro</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Selecione o número 1-9 e depois clique nas células para preencher rapidamente.
                </div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSetting('entryMode', 'cell-first')}
                className={`p-3 rounded-xl border text-left transition ${
                  settings.entryMode === 'cell-first'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-300 ring-1 ring-blue-600'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-semibold text-sm">Célula Primeiro</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Selecione uma célula e depois digite o número no teclado ou keypad.
                </div>
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Possibilidades e Candidatos
            </h4>
            <div className="space-y-2">
              <SwitchItem
                icon={<Sparkles className="w-5 h-5" />}
                title="Apresentar números possíveis automaticamente"
                description="Calcula e exibe em tempo real todos os candidatos matematicamente válidos em cada célula vazia."
                checked={settings.showAutoCandidates}
                onChange={() => onToggleSetting('showAutoCandidates')}
              />

              <SwitchItem
                icon={<Edit3 className="w-5 h-5" />}
                title="Permitir alterar números possíveis na célula (Anotações)"
                description="Permite usar o modo Lápis para adicionar ou remover manualmente os números candidatos em qualquer célula."
                checked={settings.allowManualCandidateEdit}
                onChange={() => onToggleSetting('allowManualCandidateEdit')}
              />

              <SwitchItem
                icon={<Eraser className="w-5 h-5" />}
                title="Remoção automática de candidatos ao preencher"
                description="Ao colocar um número em uma célula, remove esse número dos candidatos da mesma linha, coluna e bloco 3x3."
                checked={settings.autoEraseCandidatesOnInput}
                onChange={() => onToggleSetting('autoEraseCandidatesOnInput')}
              />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Assistência Visual</h4>
            <div className="space-y-2">
              <SwitchItem
                icon={<Eye className="w-5 h-5" />}
                title="Destacar números iguais"
                description="Realça no tabuleiro todas as células com o mesmo número selecionado."
                checked={settings.highlightMatchingDigits}
                onChange={() => onToggleSetting('highlightMatchingDigits')}
              />

              <SwitchItem
                icon={<CheckSquare className="w-5 h-5" />}
                title="Destacar linha, coluna e bloco"
                description="Ilumina a linha, coluna e bloco 3x3 da célula que estiver selecionada."
                checked={settings.highlightPeerCells}
                onChange={() => onToggleSetting('highlightPeerCells')}
              />

              <SwitchItem
                icon={<Palette className="w-5 h-5" />}
                title="Destacar conflitos e erros"
                description="Alerta visualmente números duplicados ou em desacordo com as regras do Sudoku."
                checked={settings.highlightConflicts}
                onChange={() => onToggleSetting('highlightConflicts')}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};
