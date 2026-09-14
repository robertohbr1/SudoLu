# 🟦 SudoLu — Sudoku Inteligente para PC

<div align="center">

![SudoLu Banner](https://img.shields.io/badge/SudoLu-Sudoku%20para%20PC-2563eb?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgc3Ryb2tlPScjZmZmJyBzdHJva2Utd2lkdGg9JzInPjxyZWN0IHdpZHRoPScxOCcgaGVpZ2h0PScxOCcgeD0nMycgeT0nMycgcng9JzInLz48cGF0aCBkPSdNMyA5aDE4TTMgMTVoMThNOSAzdjE4TTE1IDN2MTgnLz48L3N2Zz4=)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=flat-square&logo=tailwindcss)
![Vitest](https://img.shields.io/badge/Vitest-35%20testes-6E9F18?style=flat-square&logo=vitest)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**Uma experiência de Sudoku completa para PC — com geração de puzzles, candidatos automáticos, anotações manuais, atalhos de teclado, tema escuro e muito mais.**

[▶ Demo Local](#-como-rodar-localmente) · [Funcionalidades](#-funcionalidades) · [Atalhos de Teclado](#%EF%B8%8F-atalhos-de-teclado-para-pc) · [Arquitetura](#-arquitetura)

</div>

---

## ✨ Funcionalidades

### 🎯 Seleção de Dificuldade
- **4 níveis**: Fácil (38–42 dicas), Médio (32–36), Difícil (27–31) e Especialista (23–26).
- Gerador algorítmico com **backtracking + heurística MRV** que garante **solução única** para cada puzzle.

### 🎓 Aprenda a Jogar (Tutorial Interativo com Animações)
O SudoLu conta com um assistente visual completo para ensinar as regras e estratégias do jogo:
- **Regras Fundamentais Animadas**: Demonstração visual interativa das regras de Linhas, Colunas e Blocos 3×3.
- **Estratégia de Varredura por Dígito (1 ao 9)**: Simulação animada do método de varredura cruzada (*cross-hatching*), onde um número (ex: 1) emite feixes pelas linhas e colunas bloqueando opções até sobrar apenas uma célula em um bloco 3×3. Ao resolver, o ciclo avança do 1 ao 9 e reinicia.
- **Técnica das Anotações (Modo Lápis)**: Demonstração de eliminação de candidatos quando a varredura visual direta não é suficiente. Mostra em tempo real como o preenchimento de uma casa vizinha elimina notas até revelar um candidato único (*naked single*).
- **Dicas e Atalhos Práticos**: Guia de uso com o Modo Dígito Primeiro, Duplo-Clique para auto-preenchimento, Auto-Notas e atalhos de teclado.

### 🔢 Números Possíveis (Candidatos / Anotações)
| Modo | Descrição |
|------|-----------|
| **Auto-Candidatos** | Exibe em tempo real todos os números matematicamente válidos em cada célula vazia |
| **Anotações Manuais (Lápis)** | Adicione ou remova candidatos individualmente com o Modo Lápis |
| **Auto-Notas** | Preenche automaticamente todas as células vazias com seus candidatos válidos em um clique |
| **Destaque Dinâmico de Candidatos** | Ao selecionar um número no teclado ou tabuleiro, ele e suas ocorrências nas auto-notas recebem badges circulares azuis destacados |
| **Duplo-Clique no Dígito** | Preenche todas as células onde aquele número é o **único candidato possível** |

### 🖱️ Modos de Entrada
| Modo | Comportamento |
|------|---------------|
| **Célula Primeiro** *(padrão)* | Selecione uma célula → insira o dígito pelo teclado ou keypad |
| **Dígito Primeiro** | Selecione um número (1–9) → clique nas células para preencher rapidamente |

### ⌨️ Atalhos de Teclado para PC
| Tecla | Ação |
|-------|------|
| `1`–`9` / Numpad | Inserir dígito |
| `Backspace` / `Delete` / `0` | Apagar célula ou anotações |
| `↑` `↓` `←` `→` | Navegar entre células |
| `N` ou `P` | Alternar modo Lápis (anotações) |
| `Ctrl+Z` | Desfazer jogada |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Refazer jogada |
| `H` | Dica inteligente |

### 🛠️ Configurações Personalizáveis
- ✅ Exibição automática de candidatos (auto-candidatos)
- ✅ Permissão para edição manual de candidatos (anotações)
- ✅ Remoção automática de candidatos ao preencher uma célula
- ✅ Destaque de dígitos iguais no tabuleiro e nas auto-notas
- ✅ Destaque de linha, coluna e bloco 3×3 da célula selecionada
- ✅ Destaque visual de conflitos e erros
- ✅ Modo Claro / Escuro (persistido)
- ✅ Preferências salvas no `localStorage`

### 🏆 Outros Recursos
- Cronômetro e contador de erros
- Desfazer / Refazer com suporte a **operações em lote** (um único Ctrl+Z desfaz o duplo-clique)
- **Dica Inteligente**: revela o valor da célula selecionada ou encontra a célula com erro/vazia automaticamente
- **Apagar Abrangente**: remove dígitos e anotações, além de modo Borracha visual ao clicar sem célula selecionada
- Modal de vitória com animação de confete (canvas-confetti)
- Interface totalmente responsiva

---

## 🗂️ Arquitetura

```
src/
├── types/
│   ├── sudoku.types.ts        # Tipos do domínio (CellModel, GameMoveRecord, etc.)
│   ├── settings.types.ts      # Configurações e preferências do jogador
│   └── tutorial.types.ts      # Tipos e estruturas do tutorial interativo
├── engine/
│   ├── boardGenerator.ts      # Gerador de puzzles por dificuldade
│   ├── boardSolver.ts         # Resolvedor com backtracking + MRV
│   ├── candidateEvaluator.ts  # Cálculo de candidatos válidos por célula
│   ├── gameEngine.ts          # Lógica do jogo (movimentos, apagar, dicas, auto-fill)
│   └── validator.ts           # Detecção de conflitos e condição de vitória
├── state/
│   ├── useSudokuGame.ts       # Hook principal de estado do jogo
│   └── useGameSettings.ts     # Hook de preferências com persistência
├── components/
│   ├── SudokuBoard.tsx        # Grade 9×9 com blocos 3×3
│   ├── SudokuCell.tsx         # Célula individual com mini-grade e destaque de candidatos
│   ├── NumberKeypad.tsx       # Teclado 1–9 com duplo-clique
│   ├── ActionToolbar.tsx      # Barra de ações (desfazer, borracha, lápis, dica, etc.)
│   ├── DifficultySelector.tsx # Seletor de dificuldade
│   ├── StatsBar.tsx           # Cronômetro, erros, modo de entrada
│   ├── SettingsModal.tsx      # Modal de configurações
│   ├── VictoryModal.tsx       # Modal de vitória com confete
│   ├── Header.tsx             # Cabeçalho com ações globais e botão de tutorial
│   └── tutorial/              # Módulo de tutorial interativo com animações
│       ├── TutorialModal.tsx
│       ├── TutorialRulesView.tsx
│       ├── TutorialCrossHatchView.tsx
│       ├── TutorialNotesView.tsx
│       └── TutorialTipsView.tsx
├── utils/
│   ├── formatters.ts          # Formatadores de tempo e dados
│   ├── keyboardShortcuts.ts   # Hook de atalhos de teclado para PC
│   └── tutorialHelpers.ts     # Lógica pura de navegação e demonstração do tutorial
├── App.tsx
└── main.tsx
tests/
├── boardGenerator.test.ts
├── boardSolver.test.ts
├── candidateEvaluator.test.ts
├── tutorialHelpers.test.ts
└── validator.test.ts
iniciar-sudolu.bat             # Inicializador rápido para Windows (servidor + navegador padrão)
create-shortcut.ps1            # Script de criação do atalho na Área de Trabalho (suporta OneDrive)
sudolu.ico                     # Ícone do aplicativo para Windows
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

### ⚡ Execução Rápida no Windows (Atalho na Área de Trabalho)

Para iniciar o jogo diretamente como um aplicativo no Windows:

1. **Gerar o atalho no Desktop**:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\create-shortcut.ps1
   ```
   *Cria automaticamente o atalho com ícone personalizado na Área de Trabalho (compatível com pastas locais e sincronizadas via OneDrive).*

2. **Iniciar o jogo**:
   Dê um duplo-clique no atalho **SudoLu** na Área de Trabalho ou execute [`iniciar-sudolu.bat`](iniciar-sudolu.bat).
   - Inicia o servidor local Vite e abre uma janela no seu navegador padrão em `http://localhost:5173`.
   - Se o servidor já estiver ativo, detecta automaticamente e apenas abre uma nova aba no navegador sem duplicar o processo.

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

O projeto conta com **35 testes unitários** automatizados com Vitest:

```
✓ tests/boardSolver.test.ts        (4 testes)
✓ tests/boardGenerator.test.ts     (3 testes)
✓ tests/gameEngine.test.ts         (12 testes)
✓ tests/candidateEvaluator.test.ts (4 testes)
✓ tests/validator.test.ts          (5 testes)
✓ tests/formatters.test.ts         (4 testes)
✓ tests/keyboardShortcuts.test.ts  (3 testes)

Test Files  7 passed (7)
     Tests  35 passed (35)
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
