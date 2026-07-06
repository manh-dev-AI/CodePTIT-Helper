/**
 * CodePTIT Helper - Observer Module
 * Uses MutationObserver to detect when React renders the problem page
 * Does NOT use DOMContentLoaded since React renders after JS runs
 */

CPH.Observer = (() => {
  'use strict';

  let observer = null;
  let lastUrl = null;
  let processTimer = null;
  let retryCount = 0;
  const MAX_RETRIES = 50; // 50 * 200ms = 10s max wait

  /**
   * Process the current page
   * Called when URL changes or when .problem-statement appears
   */
  const processPage = () => {
    const url = location.href;

    // Only process submit pages
    if (!CPH.Utils.isSubmitPage()) {
      CPH.Toolbar.remove();
      CPH.SubmitBox.remove();
      return;
    }

    // Check if problem-statement has rendered
    const problemStatement = CPH.Utils.$('.problem-statement');
    if (!problemStatement) {
      // React hasn't rendered yet, retry
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        setTimeout(processPage, 200);
      }
      return;
    }

    // Problem is rendered
    retryCount = 0;
    const code = CPH.Parser.getCodeFromTitle();

    // Inject toolbar if not already present
    if (!CPH.Toolbar.exists()) {
      CPH.Toolbar.inject(code);
    } else {
      CPH.Toolbar.updateCode(code);
    }

    // Inject submit box if not already present
    if (!CPH.SubmitBox.exists()) {
      CPH.SubmitBox.inject();
    }

    // Save to history
    try {
      const data = CPH.Parser.getProblemData();
      if (data.code) {
        CPH.Storage.saveLastProblem(data);
        CPH.Storage.addToHistory(data);
      }
    } catch (e) {
      // Silently fail - storage is optional
    }
  };

  /**
   * Handle URL change (React client-side navigation)
   */
  const onUrlChange = () => {
    const url = location.href;
    if (url === lastUrl) return;
    lastUrl = url;
    retryCount = 0;

    // Debounce the processing
    clearTimeout(processTimer);
    processTimer = setTimeout(processPage, 300);
  };

  /**
   * Start observing the DOM for changes
   */
  const start = () => {
    lastUrl = location.href;

    // Initial process
    setTimeout(processPage, 500);

    // Observe DOM changes for React re-renders and URL changes
    observer = new MutationObserver(() => {
      onUrlChange();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also listen for popstate (back/forward navigation)
    window.addEventListener('popstate', onUrlChange);
  };

  /**
   * Stop observing
   */
  const stop = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    window.removeEventListener('popstate', onUrlChange);
    clearTimeout(processTimer);
  };

  return {
    start,
    stop,
    processPage,
  };
})();
