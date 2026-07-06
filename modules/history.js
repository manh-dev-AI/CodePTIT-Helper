/**
 * CodePTIT Helper - History Module
 * Manages submission history and AC archive
 */

CPH.History = (() => {
  'use strict';

  /**
   * Record a submission attempt
   */
  const recordSubmission = async (problemCode, status) => {
    try {
      const result = await CPH.Storage.get({ submissions: [] });
      const submissions = result.submissions || [];

      submissions.unshift({
        code: problemCode,
        status,
        timestamp: Date.now(),
        url: location.href,
      });

      // Keep last 100
      if (submissions.length > 100) submissions.length = 100;

      await CPH.Storage.save({ submissions });
    } catch (e) {
      console.error('[CodePTIT Helper] Error recording submission:', e);
    }
  };

  /**
   * Get submission history
   */
  const getSubmissions = async () => {
    const result = await CPH.Storage.get({ submissions: [] });
    return result.submissions || [];
  };

  /**
   * Get last AC submissions (unique by problem code)
   */
  const getACList = async () => {
    const submissions = await getSubmissions();
    const seen = new Set();
    return submissions.filter(s => {
      if (s.status === 'AC' && !seen.has(s.code)) {
        seen.add(s.code);
        return true;
      }
      return false;
    });
  };

  return {
    recordSubmission,
    getSubmissions,
    getACList,
  };
})();
