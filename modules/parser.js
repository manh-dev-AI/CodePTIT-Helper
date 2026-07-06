/**
 * CodePTIT Helper - Parser Module
 * Extracts problem data from the DOM
 * Uses only stable selectors: .problem-statement, .ant-card-head-title, code, .tc-copy
 */

CPH.Parser = (() => {
  'use strict';

  const { $, $$, getCellText, hasText } = CPH.Utils;

  /**
   * Get the problem title element
   * Structure: <div class="ant-card-head-title"><span>Đề bài: <code>CODE</code> — TITLE</span></div>
   */
  const getTitleElement = () => $('.ant-card-head-title');

  /**
   * Get the problem code from the title
   */
  const getCodeFromTitle = () => {
    const codeEl = $('.ant-card-head-title code');
    return codeEl?.textContent?.trim() || CPH.Utils.getProblemCode();
  };

  /**
   * Get the problem title (just the name, without "Đề bài:" and code)
   */
  const getProblemTitle = () => {
    const titleEl = getTitleElement();
    if (!titleEl) return '';
    const fullText = titleEl.textContent.trim();
    // Pattern: "Đề bài: CODE — TITLE"
    const dashIndex = fullText.indexOf('—');
    if (dashIndex !== -1) {
      return fullText.substring(dashIndex + 1).trim();
    }
    // Fallback: remove "Đề bài:" prefix
    return fullText.replace(/^Đề bài:\s*/, '').trim();
  };

  /**
   * Get the problem statement element
   */
  const getProblemStatement = () => $('.problem-statement');

  /**
   * Get problem statement as plain text
   */
  const getProblemText = () => {
    const el = getProblemStatement();
    if (!el) return '';
    return CPH.Utils.htmlToPlainText(el.innerHTML);
  };

  /**
   * Get problem statement as HTML
   */
  const getProblemHTML = () => {
    const el = getProblemStatement();
    if (!el) return '';
    // Clone and remove tc-copy buttons
    const clone = el.cloneNode(true);
    clone.querySelectorAll('.tc-copy').forEach(btn => btn.remove());
    return clone.innerHTML;
  };

  /**
   * Get problem statement as Markdown
   */
  const getProblemMarkdown = () => {
    const el = getProblemStatement();
    if (!el) return '';
    return CPH.Utils.htmlToMarkdown(el.innerHTML);
  };

  /**
   * Find all testcase tables in the problem statement
   * Returns array of { input: string, output: string }
   */
  const getTestcases = () => {
    const statement = getProblemStatement();
    if (!statement) return [];

    const tables = $$('table', statement);
    const testcases = [];

    tables.forEach(table => {
      const rows = $$('tr', table);
      // Check if this is a testcase table (first row should have Input/Output headers)
      if (rows.length < 2) return;

      const headerCells = $$('td, th', rows[0]);
      const headerText = headerCells.map(c => c.textContent.toLowerCase().trim());
      const hasInputHeader = headerText.some(t => t.includes('input'));
      const hasOutputHeader = headerText.some(t => t.includes('output'));

      if (!hasInputHeader && !hasOutputHeader) return;

      // Extract test cases from remaining rows
      for (let i = 1; i < rows.length; i++) {
        const cells = $$('td', rows[i]);
        if (cells.length >= 2) {
          const input = getCellText(cells[0]);
          const output = getCellText(cells[cells.length - 1]);
          if (input || output) {
            testcases.push({ input, output });
          }
        }
      }
    });

    return testcases;
  };

  /**
   * Get all sample inputs concatenated
   */
  const getSampleInput = () => {
    return getTestcases().map(tc => tc.input).join('\n---\n');
  };

  /**
   * Get all sample outputs concatenated
   */
  const getSampleOutput = () => {
    return getTestcases().map(tc => tc.output).join('\n---\n');
  };

  /**
   * Get formatted testcase text
   */
  const getTestcaseText = () => {
    const testcases = getTestcases();
    if (!testcases.length) return '';

    return testcases.map((tc, idx) => {
      const header = testcases.length > 1 ? `--- Test ${idx + 1} ---\n` : '';
      return `${header}Input\n${tc.input}\n\nOutput\n${tc.output}`;
    }).join('\n\n');
  };

  /**
   * Get full problem data object
   */
  const getProblemData = () => {
    return {
      code: getCodeFromTitle(),
      title: getProblemTitle(),
      text: getProblemText(),
      html: getProblemHTML(),
      markdown: getProblemMarkdown(),
      testcases: getTestcases(),
      url: location.href,
    };
  };

  /**
   * Get the file input element
   */
  const getFileInput = () => $('input[type="file"]');

  /**
   * Get the submit button (contains text "Nộp bài")
   */
  const getSubmitButton = () => {
    const buttons = $$('button');
    return buttons.find(btn => btn.textContent.trim().includes('Nộp bài'));
  };

  return {
    getTitleElement,
    getCodeFromTitle,
    getProblemTitle,
    getProblemStatement,
    getProblemText,
    getProblemHTML,
    getProblemMarkdown,
    getTestcases,
    getSampleInput,
    getSampleOutput,
    getTestcaseText,
    getProblemData,
    getFileInput,
    getSubmitButton,
  };
})();
