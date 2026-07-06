/**
 * CodePTIT Helper - Popup Script
 * Handles popup UI interactions, history display, and theme toggle
 */

document.addEventListener('DOMContentLoaded', async () => {
  'use strict';

  // Elements
  const currentProblemEl = document.getElementById('current-problem');
  const historyListEl = document.getElementById('history-list');
  const actionGrid = document.getElementById('action-grid');
  const themeToggle = document.getElementById('theme-toggle');

  /**
   * Load and display the last opened problem
   */
  const loadCurrentProblem = async () => {
    try {
      const result = await chrome.storage.local.get({ lastProblem: null });
      const problem = result.lastProblem;
      if (problem) {
        currentProblemEl.innerHTML = `
          <span class="problem-code">${problem.code}</span>
          <span class="problem-name">${problem.title || problem.code}</span>
        `;
        currentProblemEl.style.cursor = 'pointer';
        currentProblemEl.addEventListener('click', () => {
          chrome.tabs.create({ url: problem.url });
        });
      }
    } catch (e) {
      console.error('Error loading current problem:', e);
    }
  };

  /**
   * Load and display history
   */
  const loadHistory = async () => {
    try {
      const result = await chrome.storage.local.get({ history: [] });
      const history = result.history || [];

      if (!history.length) return;

      historyListEl.innerHTML = '';
      history.slice(0, 10).forEach(item => {
        const el = document.createElement('a');
        el.className = 'history-item';
        el.href = item.url;
        el.target = '_blank';
        el.innerHTML = `
          <span class="history-code">${item.code}</span>
          <span class="history-title">${item.title || '—'}</span>
        `;
        el.addEventListener('click', (e) => {
          e.preventDefault();
          chrome.tabs.create({ url: item.url });
        });
        historyListEl.appendChild(el);
      });
    } catch (e) {
      console.error('Error loading history:', e);
    }
  };

  /**
   * Handle action button clicks (sends message to content script)
   */
  const setupActions = () => {
    actionGrid.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const action = btn.dataset.action;
        try {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (!tab?.url?.includes('code.ptit.edu.vn')) {
            showBtnFeedback(btn, false);
            return;
          }
          const response = await chrome.tabs.sendMessage(tab.id, {
            type: 'popup-action',
            action: action,
          });
          showBtnFeedback(btn, response?.success);
        } catch (e) {
          showBtnFeedback(btn, false);
        }
      });
    });
  };

  /**
   * Show button feedback
   */
  const showBtnFeedback = (btn, success) => {
    if (success) {
      btn.classList.add('success');
      setTimeout(() => btn.classList.remove('success'), 1200);
    }
  };

  /**
   * Theme toggle (for future use)
   */
  themeToggle?.addEventListener('click', async () => {
    // Toggle stored preference
    const result = await chrome.storage.local.get({ darkMode: true });
    const newMode = !result.darkMode;
    await chrome.storage.local.set({ darkMode: newMode });
    // For now, always dark mode
  });

  // Initialize
  await loadCurrentProblem();
  await loadHistory();
  setupActions();
});
