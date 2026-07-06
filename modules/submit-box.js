/**
 * CodePTIT Helper - Submit Box Module
 * Injects a code paste + submit widget into the problem page using Shadow DOM.
 * Allows user to paste code into a textarea and submit directly.
 */

CPH.SubmitBox = (() => {
  'use strict';

  let hostEl = null;
  const HOST_ID = 'codeptit-helper-submitbox';

  const getStyles = () => `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    :host {
      all: initial;
      display: block;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      margin-top: 16px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .submit-card {
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.97), rgba(30, 41, 59, 0.97));
      border: 1px solid rgba(148, 163, 184, 0.15);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.06);
      animation: cardIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes cardIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .submit-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(16, 185, 129, 0.06));
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }
    .submit-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .submit-header-icon {
      width: 22px; height: 22px;
      background: linear-gradient(135deg, #22c55e, #10b981);
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 12px; font-weight: 700;
    }
    .submit-header-title {
      font-size: 13px; font-weight: 600; color: #e2e8f0;
    }
    .submit-lang {
      font-size: 11px; font-weight: 500; color: #94a3b8;
      background: rgba(255, 255, 255, 0.04);
      padding: 3px 10px; border-radius: 6px;
      border: 1px solid rgba(148, 163, 184, 0.1);
    }

    .submit-body { padding: 12px 16px; }

    .code-textarea {
      width: 100%;
      min-height: 180px;
      max-height: 400px;
      resize: vertical;
      background: #0c1222;
      border: 1px solid rgba(148, 163, 184, 0.12);
      border-radius: 10px;
      padding: 12px 14px;
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
      font-size: 13px;
      line-height: 1.6;
      color: #e2e8f0;
      tab-size: 4;
      outline: none;
      transition: border-color 0.2s;
    }
    .code-textarea::placeholder {
      color: #475569;
      font-family: 'Inter', sans-serif;
      font-style: italic;
    }
    .code-textarea:focus {
      border-color: rgba(34, 197, 94, 0.5);
      box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.08);
    }
    .code-textarea::-webkit-scrollbar { width: 6px; }
    .code-textarea::-webkit-scrollbar-track { background: transparent; }
    .code-textarea::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.2); border-radius: 4px; }

    .submit-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      border-top: 1px solid rgba(148, 163, 184, 0.08);
    }
    .char-count {
      font-size: 11px; color: #475569; font-family: monospace;
    }
    .submit-actions {
      display: flex; gap: 8px; align-items: center;
    }
    .btn-clear {
      padding: 7px 14px;
      border: 1px solid rgba(148, 163, 184, 0.15);
      border-radius: 8px;
      background: transparent;
      color: #94a3b8;
      font-family: 'Inter', sans-serif;
      font-size: 12px; font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-clear:hover {
      background: rgba(255, 255, 255, 0.04);
      color: #e2e8f0;
    }
    .btn-paste {
      padding: 7px 14px;
      border: 1px solid rgba(96, 165, 250, 0.25);
      border-radius: 8px;
      background: rgba(96, 165, 250, 0.08);
      color: #60a5fa;
      font-family: 'Inter', sans-serif;
      font-size: 12px; font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
      display: flex; align-items: center; gap: 5px;
    }
    .btn-paste:hover {
      background: rgba(96, 165, 250, 0.15);
      border-color: rgba(96, 165, 250, 0.4);
    }
    .btn-submit {
      padding: 8px 20px;
      border: none;
      border-radius: 8px;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: #fff;
      font-family: 'Inter', sans-serif;
      font-size: 13px; font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(34, 197, 94, 0.25);
      display: flex; align-items: center; gap: 6px;
    }
    .btn-submit:hover {
      background: linear-gradient(135deg, #16a34a, #15803d);
      box-shadow: 0 4px 16px rgba(34, 197, 94, 0.35);
      transform: translateY(-1px);
    }
    .btn-submit:active {
      transform: translateY(0) scale(0.98);
    }
    .btn-submit:disabled {
      opacity: 0.5; cursor: not-allowed;
      transform: none; box-shadow: none;
    }
    .btn-submit.success {
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
      box-shadow: 0 2px 8px rgba(14, 165, 233, 0.25);
    }
    .btn-submit.error {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
    }

    .status-msg {
      font-size: 11px;
      padding: 6px 12px;
      border-radius: 6px;
      margin-top: 8px;
      display: none;
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .status-msg.show { display: block; }
    .status-msg.success {
      background: rgba(34, 197, 94, 0.1);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }
    .status-msg.error {
      background: rgba(239, 68, 68, 0.1);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
  `;

  const ICONS = {
    send: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    paste: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    code: '⚡',
  };

  const buildHTML = () => `
    <div class="submit-card">
      <div class="submit-header">
        <div class="submit-header-left">
          <div class="submit-header-icon">${ICONS.code}</div>
          <span class="submit-header-title">Nộp bài nhanh</span>
        </div>
        <span class="submit-lang" id="sb-lang">—</span>
      </div>
      <div class="submit-body">
        <textarea class="code-textarea" id="sb-code"
          placeholder="Dán code của bạn vào đây...&#10;&#10;Hỗ trợ: Ctrl+V để dán, sau đó bấm Nộp bài"
          spellcheck="false" autocomplete="off" autocorrect="off"></textarea>
        <div class="status-msg" id="sb-status"></div>
      </div>
      <div class="submit-footer">
        <span class="char-count" id="sb-count">0 ký tự</span>
        <div class="submit-actions">
          <button class="btn-clear" id="sb-clear">Xoá</button>
          <button class="btn-paste" id="sb-paste">${ICONS.paste} Dán</button>
          <button class="btn-submit" id="sb-submit" disabled>${ICONS.send} Nộp bài</button>
        </div>
      </div>
    </div>
  `;

  /**
   * Show status message
   */
  const showStatus = (shadow, message, type = 'success') => {
    const el = shadow.getElementById('sb-status');
    if (!el) return;
    el.textContent = message;
    el.className = `status-msg show ${type}`;
    setTimeout(() => { el.className = 'status-msg'; }, 4000);
  };

  /**
   * Update language display from the website's current selector
   */
  const updateLangDisplay = (shadow) => {
    const langEl = shadow.getElementById('sb-lang');
    if (!langEl) return;
    const selItem = document.querySelector('.ant-select-content');
    langEl.textContent = selItem?.textContent?.trim() || '—';
  };

  /**
   * Inject the submit box into the page.
   * Finds the submit card area and inserts our widget after it.
   */
  const inject = () => {
    if (document.getElementById(HOST_ID)) return; // already injected

    // Find a good place to insert: after the last .ant-card on the page
    const cards = [...document.querySelectorAll('.ant-card')];
    const lastCard = cards[cards.length - 1];
    if (!lastCard) return;

    // Create shadow DOM host
    hostEl = document.createElement('div');
    hostEl.id = HOST_ID;

    const shadow = hostEl.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = getStyles();
    shadow.appendChild(style);

    const container = document.createElement('div');
    container.innerHTML = buildHTML();
    shadow.appendChild(container);

    // Insert after the last card
    lastCard.parentNode.insertBefore(hostEl, lastCard.nextSibling);

    // Bind events
    bindEvents(shadow);

    // Update language
    updateLangDisplay(shadow);

    // Watch for language selector changes
    const langObserver = new MutationObserver(() => updateLangDisplay(shadow));
    const selectEl = document.querySelector('.ant-select');
    if (selectEl) {
      langObserver.observe(selectEl, { childList: true, subtree: true, characterData: true });
    }
  };

  /**
   * Bind all event handlers
   */
  const bindEvents = (shadow) => {
    const textarea = shadow.getElementById('sb-code');
    const submitBtn = shadow.getElementById('sb-submit');
    const clearBtn = shadow.getElementById('sb-clear');
    const pasteBtn = shadow.getElementById('sb-paste');
    const charCount = shadow.getElementById('sb-count');

    // Update char count + enable/disable submit
    textarea?.addEventListener('input', () => {
      const len = textarea.value.length;
      charCount.textContent = `${len} ký tự`;
      submitBtn.disabled = len === 0;
    });

    // Allow Tab in textarea
    textarea?.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 4;
        textarea.dispatchEvent(new Event('input'));
      }
      // Ctrl+Enter to submit
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        submitBtn.click();
      }
    });

    // Clear button
    clearBtn?.addEventListener('click', () => {
      textarea.value = '';
      textarea.dispatchEvent(new Event('input'));
      textarea.focus();
    });

    // Paste button
    pasteBtn?.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          textarea.value = text;
          textarea.dispatchEvent(new Event('input'));
          showStatus(shadow, '✓ Đã dán code từ clipboard', 'success');
        }
      } catch {
        showStatus(shadow, '✗ Không thể đọc clipboard — hãy dùng Ctrl+V', 'error');
      }
    });

    // Submit button
    submitBtn?.addEventListener('click', async () => {
      const code = textarea.value;
      if (!code.trim()) {
        showStatus(shadow, '✗ Chưa nhập code', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Đang nộp...';

      const error = await CPH.Problem.submitFromText(code);

      if (error) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${ICONS.send} Nộp bài`;
        submitBtn.classList.add('error');
        showStatus(shadow, `✗ ${error}`, 'error');
        setTimeout(() => submitBtn.classList.remove('error'), 2000);
      } else {
        submitBtn.innerHTML = '✓ Đã nộp!';
        submitBtn.classList.add('success');
        showStatus(shadow, '✓ Bài đã được nộp thành công!', 'success');
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `${ICONS.send} Nộp bài`;
          submitBtn.classList.remove('success');
        }, 3000);
      }
    });
  };

  /**
   * Remove the submit box
   */
  const remove = () => {
    document.getElementById(HOST_ID)?.remove();
    hostEl = null;
  };

  /**
   * Check if submit box exists
   */
  const exists = () => !!document.getElementById(HOST_ID);

  return { inject, remove, exists };
})();
