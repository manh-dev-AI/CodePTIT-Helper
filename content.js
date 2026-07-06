/**
 * CodePTIT Helper - Content Script Entry Point
 * Bootstraps the extension on code.ptit.edu.vn
 */

(() => {
  'use strict';

  // Prevent double initialization
  if (window.__CODEPTIT_HELPER_LOADED__) return;
  window.__CODEPTIT_HELPER_LOADED__ = true;

  console.log('[CodePTIT Helper] v1.0.0 loaded');

  // Start the observer (waits for React to render .problem-statement)
  CPH.Observer.start();

  // Listen for messages from background script and popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Keyboard shortcuts forwarded from background
    if (message.type === 'keyboard-shortcut') {
      const actionMap = {
        'copy-problem': 'copy-problem',
        'copy-input': 'copy-input',
        'copy-output': 'copy-output',
        'download-testcase': 'download',
      };
      const action = actionMap[message.command];
      if (action) {
        CPH.Toolbar.handleAction(action, null).then(() => {
          sendResponse({ success: true });
        });
      }
      return true;
    }

    // Actions from popup
    if (message.type === 'popup-action') {
      CPH.Toolbar.handleAction(message.action, null).then(() => {
        sendResponse({ success: true });
      }).catch(() => {
        sendResponse({ success: false });
      });
      return true;
    }
  });
})();
