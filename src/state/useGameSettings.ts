import { useState, useEffect } from 'react';
import { GamePreferenceSettings, INITIAL_GAME_SETTINGS } from '../types/settings.types';

const STORAGE_KEY = 'sudolu_preferences_v1';

/**
 * Loads preferences from localStorage with fallback to defaults.
 */
function loadPersistedSettings(): GamePreferenceSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_GAME_SETTINGS;
    return { ...INITIAL_GAME_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return INITIAL_GAME_SETTINGS;
  }
}

/**
 * Hook for managing and persisting game preferences.
 */
export function useGameSettings() {
  const [settings, setSettings] = useState<GamePreferenceSettings>(loadPersistedSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage unavailable or disabled
    }
  }, [settings]);

  useEffect(() => {
    if (settings.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.isDarkMode]);

  const updateSetting = <K extends keyof GamePreferenceSettings>(
    key: K,
    value: GamePreferenceSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSetting = (
    key: keyof Omit<GamePreferenceSettings, 'entryMode'>
  ) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return {
    settings,
    updateSetting,
    toggleSetting,
  };
}
