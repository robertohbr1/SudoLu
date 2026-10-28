import { describe, it, expect } from 'vitest';
import { getDifficultyLabel } from '../src/components/DifficultyConfirmModal';

describe('DifficultyConfirmModal helpers', () => {
  it('returns empty string when targetDifficulty is null', () => {
    expect(getDifficultyLabel(null)).toBe('');
  });

  it('returns correct Portuguese label for each difficulty level', () => {
    expect(getDifficultyLabel('easy')).toBe('Fácil');
    expect(getDifficultyLabel('medium')).toBe('Médio');
    expect(getDifficultyLabel('hard')).toBe('Difícil');
    expect(getDifficultyLabel('expert')).toBe('Especialista');
  });
});
