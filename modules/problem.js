/**
 * CodePTIT Helper - Problem Module
 * VS Code / CPH integration + submit operations
 */

CPH.Problem = (() => {
  'use strict';

  const { $, getLanguageExt, getProblemCode } = CPH.Utils;

  /**
   * Submit code from a text string (textarea content)
   * Creates a File from text, sets on file input, triggers submit
   */
  const submitFromText = async (text) => {
    if (!text || !text.trim()) return 'Chưa nhập code';

    const ext = getLanguageExt();
    const code = getProblemCode() || 'solution';
    const fileInput = CPH.Parser.getFileInput();
    if (!fileInput) return 'Không tìm thấy input file trên trang';

    try {
      const dt = new DataTransfer();
      dt.items.add(new File([text], `${code}${ext}`, { type: 'text/plain' }));
      fileInput.files = dt.files;
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));

      // Click the real submit button after a short delay
      setTimeout(() => {
        const submitBtn = CPH.Parser.getSubmitButton();
        if (submitBtn && !submitBtn.disabled) {
          submitBtn.click();
        }
      }, 300);

      return null; // success
    } catch (e) {
      return 'Lỗi khi nộp bài: ' + e.message;
    }
  };

  /**
   * Submit code from clipboard
   */
  const submitFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      return submitFromText(text);
    } catch (e) {
      return 'Không thể truy cập clipboard: ' + e.message;
    }
  };

  /**
   * Get formatted filename base (without extension)
   * e.g., "ICPC0107_Thay_Doi_Chu_So"
   */
  const getFilenameBase = () => {
    const code = CPH.Parser.getCodeFromTitle();
    const title = CPH.Parser.getProblemTitle();
    if (!code) return 'solution';
    const parts = [code];
    if (title) parts.push(CPH.Utils.formatTitle(title));
    return parts.join('_');
  };

  /**
   * Get CPH (Competitive Programming Helper) compatible data.
   * CPH expects: { name, url, tests: [{ input, output }] }
   * "name" is the filename WITHOUT extension — CPH adds extension based on its settings.
   */
  const getCPHData = (customName) => {
    const name = customName || getFilenameBase();
    const testcases = CPH.Parser.getTestcases();
    return {
      name,
      url: location.href,
      tests: testcases.map(tc => ({
        input: tc.input,
        output: tc.output,
      })),
    };
  };

  /**
   * Open problem in VS Code via CPH extension.
   *
   * Flow:
   *   1. Build CPH data: { name (no ext), url, tests: [{input, output}] }
   *   2. POST to CPH (localhost:27121)
   *   3. CPH shows a language Quick Pick inside VS Code
   *   4. CPH creates the file in the open workspace and loads the testcases
   *   5. VS Code focuses automatically
   *
   * If CPH is not running, show a notification (no fallback download —
   * the user should install CPH to get the full experience).
   */
  const openInVSCode = async () => {
    const data = getCPHData();

    // --- Send to CPH (primary path) ---
    try {
      const cphResult = await chrome.runtime.sendMessage({
        action: 'sendToCPH',
        data,
      });
      if (cphResult?.success) {
        return { success: true, method: 'cph' };
      }
    } catch {
      // CPH not available, continue to fallback
    }

    // --- Fallback: show clear error ---
    // The user needs to have CPH (Competitive Programming Helper) extension
    // installed and VS Code open for this feature to work.
    return { success: false, error: 'CPH chưa chạy. Hãy mở VS Code và cài extension "Competitive Programming Helper".' };
  };

  return {
    submitFromText,
    submitFromClipboard,
    getFilenameBase,
    getCPHData,
    openInVSCode,
  };
})();
