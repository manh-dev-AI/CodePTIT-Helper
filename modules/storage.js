/**
 * CodePTIT Helper - Storage Module
 * Handles chrome.storage operations for persisting user data
 */

CPH.Storage = (() => {
  'use strict';

  /**
   * Save data to chrome.storage.local
   */
  const save = (data) => {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, resolve);
    });
  };

  /**
   * Get data from chrome.storage.local
   */
  const get = (keys) => {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, resolve);
    });
  };

  /**
   * Remove data from chrome.storage.local
   */
  const remove = (keys) => {
    return new Promise((resolve) => {
      chrome.storage.local.remove(keys, resolve);
    });
  };

  /**
   * Save the last opened problem
   */
  const saveLastProblem = async (problemData) => {
    await save({
      lastProblem: {
        code: problemData.code,
        title: problemData.title,
        url: problemData.url,
        timestamp: Date.now(),
      }
    });
  };

  /**
   * Get the last opened problem
   */
  const getLastProblem = async () => {
    const result = await get({ lastProblem: null });
    return result.lastProblem;
  };

  /**
   * Add a problem to history
   */
  const addToHistory = async (problemData) => {
    const result = await get({ history: [] });
    const history = result.history || [];

    // Remove duplicate if exists
    const filtered = history.filter(h => h.code !== problemData.code);

    // Add to front
    filtered.unshift({
      code: problemData.code,
      title: problemData.title,
      url: problemData.url,
      timestamp: Date.now(),
    });

    // Keep last 50
    if (filtered.length > 50) filtered.length = 50;

    await save({ history: filtered });
  };

  /**
   * Get problem history
   */
  const getHistory = async () => {
    const result = await get({ history: [] });
    return result.history || [];
  };

  /**
   * Save dark mode preference
   */
  const saveDarkMode = async (enabled) => {
    await save({ darkMode: enabled });
  };

  /**
   * Get dark mode preference
   */
  const getDarkMode = async () => {
    const result = await get({ darkMode: false });
    return result.darkMode;
  };

  /**
   * Save settings
   */
  const saveSettings = async (settings) => {
    await save({ settings });
  };

  /**
   * Get settings with defaults
   */
  const getSettings = async () => {
    const result = await get({
      settings: {
        showToolbar: true,
        autoSaveHistory: true,
        keyboardShortcuts: true,
      }
    });
    return result.settings;
  };

  return {
    save,
    get,
    remove,
    saveLastProblem,
    getLastProblem,
    addToHistory,
    getHistory,
    saveDarkMode,
    getDarkMode,
    saveSettings,
    getSettings,
  };
})();
