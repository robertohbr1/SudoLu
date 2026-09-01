# 🟦 SudoLu — Sudoku Inteligente para PC

<div align="center">

![SudoLu Banner](https://img.shields.io/badge/SudoLu-Sudoku%20para%20PC-2563eb?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgc3Ryb2tlPScjZmZmJyBzdHJva2Utd2lkdGg9JzInPjxyZWN0IHdpZHRoPScxOCcgaGVpZ2h0PScxOCcgeD0nMycgeT0nMycgcng9JzInLz48cGF0aCBkPSdNMyA5aDE4TTMgMTVoMThNOSAzdjE4TTE1IDN2MTgnLz48L3N2Zz4=)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=flat-square&logo=tailwindcss)
![Vitest](https://img.shields.io/badge/Vitest-14%20testes-6E9F18?style=flat-square&logo=vitest)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**Uma experiência de Sudoku completa para PC — com geração de puzzles, candidatos automáticos, anotações manuais, atalhos de teclado, tema escuro e muito mais.**

[▶ Demo Local](#-como-rodar-localmente) · [Funcionalidades](#-funcionalidades) · [Atalhos de Teclado](#%EF%B8%8F-atalhos-de-teclado-para-pc) · [Arquitetura](#-arquitetura)

</div>

---

## ✨ Funcionalidades

### 🎯 Seleção de Dificuldade
- **4 níveis**: Fácil (38–42 dicas), Médio (32–36), Difícil (27–31) e Especialista (23–26).
- Gerador algorítmico com **backtracking + heurística MRV** que garante **solução única** para cada puzzle.

### 🔢 Números Possíveis (Candidatos / Anotações)
| Modo | Descrição |
|------|-----------|
| **Auto-Candidatos** | Exibe em tempo real todos os números matematicamente válidos em cada célula vazia |
| **Anotações Manuais (Lápis)** | Adicione ou remova candidatos individualmente com o Modo Lápis |
| **Auto-Notas** | Preenche automaticamente todas as células vazias com seus candidatos válidos em um clique |
| **Duplo-Clique no Dígito** | Preenche todas as células onde aquele número é o **único candidato possível** |

### 🖱️ Modos de Entrada
| Modo | Comportamento |
|------|---------------|
| **Dígito Primeiro** *(padrão)* | Selecione um número (1–9) → clique nas células para preencher rapidamente |
| **Célula Primeiro** | Selecione uma célula → insira o dígito pelo teclado ou keypad |

### ⌨️ Atalhos de Teclado para PC
| Tecla | Ação |
|-------|------|
| `1`–`9` / Numpad | Inserir dígito |
| `Backspace` / `Delete` / `0` | Apagar célula ou anotações |
| `↑` `↓` `←` `→` | Navegar entre células |
| `N` ou `P` | Alternar modo Lápis (anotações) |
| `Ctrl+Z` | Desfazer jogada |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Refazer jogada |
| `H` | Dica para a célula selecionada |

### 🛠️ Configurações Personalizáveis
- ✅ Exibição automática de candidatos (auto-candidatos)
- ✅ Permissão para edição manual de candidatos (anotações)
- ✅ Remoção automática de candidatos ao preencher uma célula
- ✅ Destaque de dígitos iguais no tabuleiro
- ✅ Destaque de linha, coluna e bloco 3×3 da célula selecionada
- ✅ Destaque visual de conflitos e erros
- ✅ Modo Claro / Escuro (persistido)
- ✅ Preferências salvas no `localStorage`

### 🏆 Outros Recursos
- Cronômetro e contador de erros
- Desfazer / Refazer com suporte a **operações em lote** (um único Ctrl+Z desfaz o duplo-clique)
- Dica: revela o número correto da célula selecionada
- Modal de vitória com animação de confete (canvas-confetti)
- Interface totalmente responsiva

---

## 🗂️ Arquitetura

```
src/
├── types/
│   ├── sudoku.types.ts        # Tipos do domínio (CellModel, GameMoveRecord, etc.)
│   └── settings.types.ts      # Configurações e preferências do jogador
├── engine/
│   ├── boardGenerator.ts      # Gerador de puzzles por dificuldade
│   ├── boardSolver.ts         # Resolvedor com backtracking + MRV
│   ├── candidateEvaluator.ts  # Cálculo de candidatos válidos por célula
│   └── validator.ts           # Detecção de conflitos e condição de vitória
├── state/
│   ├── useSudokuGame.ts       # Hook principal de estado do jogo
│   └── useGameSettings.ts     # Hook de preferências com persistência
├── components/
│   ├── SudokuBoard.tsx        # Grade 9×9 com blocos 3×3
│   ├── SudokuCell.tsx         # Célula individual com mini-grade de candidatos
│   ├── NumberKeypad.tsx       # Teclado 1–9 com duplo-clique
│   ├── ActionToolbar.tsx      # Barra de ações (desfazer, lápis, dica, etc.)
│   ├── DifficultySelector.tsx # Seletor de dificuldade
│   ├── StatsBar.tsx           # Cronômetro, erros, modo de entrada
│   ├── SettingsModal.tsx      # Modal de configurações
│   ├── VictoryModal.tsx       # Modal de vitória com confete
│   └── Header.tsx             # Cabeçalho com ações globais
├── utils/
│   └── keyboardShortcuts.ts   # Hook de atalhos de teclado para PC
├── App.tsx
└── main.tsx
tests/
├── boardGenerator.test.ts
├── boardSolver.test.ts
├── candidateEvaluator.test.ts
└── validator.test.ts
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- **Node.js** ≥ 18
- **npm** ≥ 9

### Instalação e Execução

```bash
# Clonar o repositório
git clone https://github.com/robertohbr1/SudoLu.git
cd SudoLu

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
# Acesse: http://localhost:5173
```

### Outros Comandos

```bash
# Executar todos os testes unitários
npm test

# Gerar build de produção
npm run build

# Pré-visualizar o build de produção
npm run preview
```

---

## 🧪 Testes

O projeto inclui **14 testes unitários** cobrindo o motor do jogo:

```
✓ tests/validator.test.ts          (3 testes)
✓ tests/candidateEvaluator.test.ts (4 testes)
✓ tests/boardSolver.test.ts        (4 testes)
✓ tests/boardGenerator.test.ts     (3 testes)

Test Files  4 passed (4)
     Tests  14 passed (14)
```

---

## 🛠️ Stack de Tecnologia

| Tecnologia | Uso |
|------------|-----|
| [React 19](https://react.dev) | Interface do usuário |
| [TypeScript 5.7](https://www.typescriptlang.org) | Tipagem estática estrita |
| [Vite 6](https://vite.dev) | Build tool e dev server |
| [Tailwind CSS 3](https://tailwindcss.com) | Estilização utilitária |
| [Lucide React](https://lucide.dev) | Ícones |
| [canvas-confetti](https://github.com/catdad/canvas-confetti) | Animação de vitória |
| [Vitest](https://vitest.dev) | Testes unitários |

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">
  Desenvolvido com ❤️ por <a href="https://github.com/robertohbr1">robertohbr1</a>
</div>
