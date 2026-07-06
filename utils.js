/**
 * CodePTIT Helper - Utility functions
 * Shared helpers used across all modules
 */

const CPH = window.CPH || {};
window.CPH = CPH;

CPH.Utils = (() => {
  'use strict';

  // Special whitespace characters that CodePTIT sometimes uses
  const WHITESPACE_RE = /[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g;

  /**
   * querySelector shorthand
   */
  const $ = (selector, root = document) => root.querySelector(selector);

  /**
   * querySelectorAll shorthand (returns real array)
   */
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  /**
   * Check if element has non-empty text
   */
  const hasText = (el) => !!el?.textContent?.trim();

  /**
   * Get clean text from a cell, replacing special whitespace
   */
  const getCellText = (cell) => {
    // Clone the cell to avoid modifying the original DOM
    const clone = cell.cloneNode(true);
    // Remove tc-copy buttons from clone
    clone.querySelectorAll('.tc-copy').forEach(btn => btn.remove());
    return clone.innerText.replace(WHITESPACE_RE, ' ').trimEnd();
  };

  /**
   * Remove Vietnamese diacritics and format as filename-safe string
   */
  const removeDiacritics = (text) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');

  /**
   * Format title for filename: remove diacritics, special chars, PascalCase words, underscore separated
   */
  const formatTitle = (text) =>
    removeDiacritics(text)
      .replace(/[^A-Za-z0-9]+/g, ' ')
      .trim()
      .replace(/\S+/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase())
      .replace(/ /g, '_');

  /**
   * Extract problem code from URL path
   * e.g., /submit/ICPC0107 -> ICPC0107
   */
  const getProblemCode = () => {
    const match = location.pathname.match(/\/submit\/([A-Za-z0-9_]+)/);
    return match ? match[1] : null;
  };

  /**
   * Check if current page is a submit/problem page
   */
  const isSubmitPage = () => /\/submit\/[A-Za-z0-9_]+/.test(location.pathname);

  /**
   * Check if current page is the courses page
   */
  const isCoursesPage = () => /\/courses/.test(location.pathname);

  /**
   * Debounce function
   */
  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  /**
   * Wait for an element to appear in the DOM
   */
  const waitForElement = (selector, timeout = 10000) => {
    return new Promise((resolve, reject) => {
      const el = $(selector);
      if (el) return resolve(el);

      const observer = new MutationObserver(() => {
        const el = $(selector);
        if (el) {
          observer.disconnect();
          clearTimeout(timer);
          resolve(el);
        }
      });

      const timer = setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for ${selector}`));
      }, timeout);

      observer.observe(document.body, { childList: true, subtree: true });
    });
  };

  /**
   * Convert HTML to plain text, preserving structure
   */
  const htmlToPlainText = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    // Remove tc-copy buttons
    div.querySelectorAll('.tc-copy').forEach(btn => btn.remove());
    return div.innerText.replace(WHITESPACE_RE, ' ').trim();
  };

  /**
   * Convert HTML to Markdown
   */
  const htmlToMarkdown = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    // Remove tc-copy buttons
    div.querySelectorAll('.tc-copy').forEach(btn => btn.remove());
    return convertNodeToMd(div).trim();
  };

  /**
   * Recursive HTML node to Markdown converter
   */
  const convertNodeToMd = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const tag = node.tagName.toLowerCase();
    const children = [...node.childNodes].map(convertNodeToMd).join('');

    switch (tag) {
      case 'h1': return `# ${children.trim()}\n\n`;
      case 'h2': return `## ${children.trim()}\n\n`;
      case 'h3': return `### ${children.trim()}\n\n`;
      case 'h4': return `#### ${children.trim()}\n\n`;
      case 'strong':
      case 'b':
        return `**${children.trim()}**`;
      case 'em':
      case 'i':
        return `*${children.trim()}*`;
      case 'code':
        return `\`${children.trim()}\``;
      case 'pre':
        return `\`\`\`\n${children.trim()}\n\`\`\`\n\n`;
      case 'br':
        return '\n';
      case 'p':
        return `${children.trim()}\n\n`;
      case 'ul':
        return children;
      case 'ol':
        return children;
      case 'li':
        return `- ${children.trim()}\n`;
      case 'table':
        return convertTableToMd(node);
      case 'a': {
        const href = node.getAttribute('href');
        return href ? `[${children.trim()}](${href})` : children;
      }
      case 'img': {
        const alt = node.getAttribute('alt') || '';
        const src = node.getAttribute('src') || '';
        return `![${alt}](${src})`;
      }
      case 'div':
      case 'span':
      case 'section':
        return children;
      default:
        return children;
    }
  };

  /**
   * Convert HTML table to Markdown table
   */
  const convertTableToMd = (tableEl) => {
    const rows = [...tableEl.querySelectorAll('tr')];
    if (!rows.length) return '';

    const result = [];
    rows.forEach((row, idx) => {
      const cells = [...row.querySelectorAll('td, th')];
      const cellTexts = cells.map(c => {
        const clone = c.cloneNode(true);
        clone.querySelectorAll('.tc-copy').forEach(btn => btn.remove());
        return clone.innerText.replace(WHITESPACE_RE, ' ').trim().replace(/\n/g, ' ');
      });
      result.push(`| ${cellTexts.join(' | ')} |`);
      if (idx === 0) {
        result.push(`| ${cellTexts.map(() => '---').join(' | ')} |`);
      }
    });
    return result.join('\n') + '\n\n';
  };

  /**
   * Get the compiler/language extension
   */
  const getLanguageExt = () => {
    const selItem = $('.ant-select-content');
    const text = selItem?.textContent?.toLowerCase() || '';
    if (text.includes('py')) return '.py';
    if (text.includes('java')) return '.java';
    if (text.includes('c++') || text.includes('cpp')) return '.cpp';
    if (text.includes('c')) return '.c';
    return '.txt';
  };

  return {
    $,
    $$,
    hasText,
    getCellText,
    removeDiacritics,
    formatTitle,
    getProblemCode,
    isSubmitPage,
    isCoursesPage,
    debounce,
    waitForElement,
    htmlToPlainText,
    htmlToMarkdown,
    getLanguageExt,
    WHITESPACE_RE,
  };
})();
