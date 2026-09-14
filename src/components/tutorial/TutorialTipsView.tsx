import React from 'react';
import { MousePointer, Zap, Keyboard, Sparkles } from 'lucide-react';

interface TipCardItem {
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly description: string;
}

const GAME_TIPS: readonly TipCardItem[] = [
  {
    icon: <MousePointer className="w-5 h-5 text-blue-500" />,
    title: 'Modo Dígito Primeiro',
    description:
      'Perfeito para a sua estratégia de varredura! Selecione o número 1 e vá clicando nas casas dos blocos onde ele é o único possível, sem precisar re-selecionar o número.',
  },
  {
    icon: <Zap className="w-5 h-5 text-amber-500" />,
    title: 'Duplo-Clique no Dígito',
    description:
      'Dê um duplo-clique em qualquer número do teclado virtual para preencher de uma só vez todas as células onde ele é o único candidato matematicamente possível!',
  },
  {
    icon: <Sparkles className="w-5 h-5 text-purple-500" />,
    title: 'Auto-Notas e Candidatos',
    description:
      'Quando o jogo estiver difícil e a varredura travar, use o botão de Lápis Mágico na barra de ferramentas para calcular todas as anotações válidas automaticamente.',
  },
  {
    icon: <Keyboard className="w-5 h-5 text-emerald-500" />,
    title: 'Atalhos de Teclado no PC',
    description:
      'Use 1–9 para preencher, N para alternar o modo Lápis, Setas do teclado para navegar, Ctrl+Z para desfazer e H para receber uma Dica inteligente.',
  },
];

export const TutorialTipsView: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {GAME_TIPS.map((tip) => (
        <div
          key={tip.title}
          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex flex-col gap-1.5"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 shadow-sm">
              {tip.icon}
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              {tip.title}
            </h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {tip.description}
          </p>
        </div>
      ))}
    </div>
  );
};
