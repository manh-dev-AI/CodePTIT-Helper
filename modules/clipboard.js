/**
 * CodePTIT Helper - Clipboard Module
 * Handles all clipboard copy operations
 */

CPH.Clipboard = (() => {
  'use strict';

  /**
   * Copy text to clipboard with fallback
   */
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        return true;
      } catch {
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  /**
   * Copy problem as plain text
   */
  const copyProblem = async () => {
    const text = CPH.Parser.getProblemText();
    if (!text) return false;
    return copyText(text);
  };

  /**
   * Copy problem as HTML
   */
  const copyHTML = async () => {
    const html = CPH.Parser.getProblemHTML();
    if (!html) return false;
    try {
      const blob = new Blob([html], { type: 'text/html' });
      const item = new ClipboardItem({ 'text/html': blob, 'text/plain': new Blob([CPH.Parser.getProblemText()], { type: 'text/plain' }) });
      await navigator.clipboard.write([item]);
      return true;
    } catch {
      return copyText(html);
    }
  };

  /**
   * Copy problem as Markdown
   */
  const copyMarkdown = async () => {
    const md = CPH.Parser.getProblemMarkdown();
    if (!md) return false;
    return copyText(md);
  };

  /**
   * Copy sample input
   */
  const copyInput = async () => {
    const input = CPH.Parser.getSampleInput();
    if (!input) return false;
    return copyText(input);
  };

  /**
   * Copy sample output
   */
  const copyOutput = async () => {
    const output = CPH.Parser.getSampleOutput();
    if (!output) return false;
    return copyText(output);
  };

  /**
   * Copy testcase (Input + Output formatted)
   */
  const copyTestcase = async () => {
    const text = CPH.Parser.getTestcaseText();
    if (!text) return false;
    return copyText(text);
  };

  /**
   * Copy problem code (e.g., ICPC0107)
   */
  const copyCode = async () => {
    const code = CPH.Parser.getCodeFromTitle();
    if (!code) return false;
    return copyText(code);
  };

  /**
   * Copy problem title
   */
  const copyTitle = async () => {
    const title = CPH.Parser.getProblemTitle();
    if (!title) return false;
    return copyText(title);
  };

  return {
    copyText,
    copyProblem,
    copyHTML,
    copyMarkdown,
    copyInput,
    copyOutput,
    copyTestcase,
    copyCode,
    copyTitle,
  };
})();
