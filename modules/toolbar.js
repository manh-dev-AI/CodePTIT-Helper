/**
 * CodePTIT Helper - Toolbar Module
 * Injects the floating toolbar UI using Shadow DOM
 */

CPH.Toolbar = (() => {
  'use strict';

  let toolbarHost = null;
  let shadowRoot = null;
  let isCollapsed = false;
  const TOOLBAR_ID = 'codeptit-helper-toolbar';

  const ICONS = {
    copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    html: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    markdown: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M5 12V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-1"/><path d="m3 15 2 2 4-4"/></svg>',
    input: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="m8 11 4 4 4-4"/><path d="M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4"/></svg>',
    output: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21V9"/><path d="m16 13-4-4-4 4"/><path d="M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4"/></svg>',
    download: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    testcase: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M12 3v18"/></svg>',
    code: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>',
    title: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>',
    vscode: '<svg width="16" height="16" viewBox="0 0 24 24" fill="#007ACC"><path d="M23.15 2.587L18.21.22a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z"/></svg>',
    close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    chevUp: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg>',
    chevDown: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
  };

  const getStyles = () => `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    :host { all:initial; font-family:'Inter',sans-serif; position:fixed; top:80px; right:16px; z-index:999999; display:block; }
    * { box-sizing:border-box; margin:0; padding:0; }
    .toolbar { background:linear-gradient(135deg,rgba(15,23,42,.95),rgba(30,41,59,.95)); backdrop-filter:blur(20px); border:1px solid rgba(148,163,184,.15); border-radius:16px; min-width:220px; overflow:hidden; box-shadow:0 25px 50px rgba(0,0,0,.4),0 0 0 1px rgba(255,255,255,.05),inset 0 1px 0 rgba(255,255,255,.08); animation:slideIn .4s cubic-bezier(.16,1,.3,1); }
    .toolbar:hover { border-color:rgba(148,163,184,.25); }
    @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
    .toolbar-header { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:linear-gradient(135deg,rgba(220,38,38,.15),rgba(239,68,68,.08)); border-bottom:1px solid rgba(148,163,184,.1); cursor:pointer; user-select:none; transition:background .2s; gap:8px; }
    .toolbar-header:hover { background:linear-gradient(135deg,rgba(220,38,38,.25),rgba(239,68,68,.15)); }
    .toolbar-badge { display:flex; align-items:center; gap:8px; }
    .toolbar-logo { width:24px; height:24px; background:linear-gradient(135deg,#dc2626,#ef4444); border-radius:6px; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:11px; color:#fff; flex-shrink:0; }
    .toolbar-title { font-weight:600; font-size:13px; color:#f1f5f9; }
    .toolbar-code { font-family:'SF Mono','Fira Code',monospace; font-size:11px; font-weight:600; color:#fbbf24; background:rgba(251,191,36,.1); padding:2px 8px; border-radius:6px; border:1px solid rgba(251,191,36,.2); }
    .toolbar-toggle { background:none; border:none; cursor:pointer; color:#94a3b8; display:flex; padding:4px; border-radius:6px; transition:all .2s; }
    .toolbar-toggle:hover { color:#e2e8f0; background:rgba(255,255,255,.08); }
    .toolbar-body { padding:8px; display:flex; flex-direction:column; gap:2px; max-height:500px; overflow-y:auto; transition:all .3s cubic-bezier(.4,0,.2,1); }
    .toolbar-body.collapsed { max-height:0; padding:0 8px; overflow:hidden; }
    .toolbar-section-label { font-size:10px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:.8px; padding:4px 10px 6px; }
    .toolbar-divider { height:1px; background:linear-gradient(90deg,transparent,rgba(148,163,184,.15),transparent); margin:4px 8px; }
    .toolbar-btn { display:flex; align-items:center; gap:10px; width:100%; padding:8px 10px; border:none; background:transparent; color:#cbd5e1; font-family:'Inter',sans-serif; font-size:12.5px; font-weight:500; cursor:pointer; border-radius:8px; transition:all .15s; text-align:left; }
    .toolbar-btn:hover { background:rgba(255,255,255,.06); color:#f1f5f9; transform:translateX(2px); }
    .toolbar-btn:active { transform:translateX(2px) scale(.98); }
    .toolbar-btn .icon { display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:6px; background:rgba(255,255,255,.04); color:#94a3b8; flex-shrink:0; transition:all .2s; }
    .toolbar-btn:hover .icon { background:rgba(255,255,255,.08); color:#e2e8f0; }
    .toolbar-btn .shortcut { font-size:10px; color:#475569; font-family:monospace; background:rgba(255,255,255,.03); padding:2px 6px; border-radius:4px; border:1px solid rgba(255,255,255,.06); }
    .toolbar-btn.success { background:rgba(34,197,94,.12); color:#4ade80; }
    .toolbar-btn.success .icon { background:rgba(34,197,94,.2); color:#4ade80; }
    .toolbar-btn[data-action="copy-problem"] .icon{color:#60a5fa} .toolbar-btn[data-action="copy-html"] .icon{color:#c084fc} .toolbar-btn[data-action="copy-markdown"] .icon{color:#34d399} .toolbar-btn[data-action="copy-input"] .icon{color:#fbbf24} .toolbar-btn[data-action="copy-output"] .icon{color:#f97316} .toolbar-btn[data-action="copy-testcase"] .icon{color:#2dd4bf} .toolbar-btn[data-action="copy-code"] .icon{color:#f472b6} .toolbar-btn[data-action="copy-title"] .icon{color:#a78bfa} .toolbar-btn[data-action="download"] .icon{color:#38bdf8} .toolbar-btn[data-action="open-vscode"] .icon{color:#007ACC}
    .toolbar-footer { padding:8px 16px; border-top:1px solid rgba(148,163,184,.08); text-align:center; }
    .toolbar-footer-text { font-size:10px; color:#475569; }
    .toolbar-body::-webkit-scrollbar{width:4px} .toolbar-body::-webkit-scrollbar-track{background:transparent} .toolbar-body::-webkit-scrollbar-thumb{background:rgba(148,163,184,.2);border-radius:4px}
    .toolbar-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none !important; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;

  const BUTTONS = [
    { section: 'Copy', items: [
      { action:'copy-problem', label:'Copy Problem', icon:'copy', shortcut:'Alt+C' },
      { action:'copy-html', label:'Copy HTML', icon:'html' },
      { action:'copy-markdown', label:'Copy Markdown', icon:'markdown' },
    ]},
    { section: 'Testcase', items: [
      { action:'copy-input', label:'Copy Input', icon:'input', shortcut:'Alt+I' },
      { action:'copy-output', label:'Copy Output', icon:'output', shortcut:'Alt+O' },
      { action:'copy-testcase', label:'Copy Testcase', icon:'testcase' },
      { action:'download', label:'Download Files', icon:'download', shortcut:'Alt+D' },
    ]},
    { section: 'Info', items: [
      { action:'copy-code', label:'Copy Code', icon:'code' },
      { action:'copy-title', label:'Copy Title', icon:'title' },
    ]},
    { section: 'VS Code', items: [
      // Sends problem + testcases to CPH; VS Code shows language picker natively
      { action:'open-vscode', label:'Nhập vào VS Code (CPH)', icon:'vscode' },
    ]},
  ];

  const handleAction = async (action, btn) => {
    // open-vscode: send problem data directly to CPH (no browser modal needed)
    // CPH in VS Code will show its own Quick Pick to select the language
    if (action === 'open-vscode') {
      if (btn) {
        const iconEl = btn.querySelector('.icon');
        const origIcon = iconEl ? iconEl.innerHTML : '';
        btn.disabled = true;
        if (iconEl) iconEl.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>';

        const result = await CPH.Problem.openInVSCode();

        btn.disabled = false;
        if (iconEl) iconEl.innerHTML = origIcon;

        if (result.success) {
          showSuccess(btn);
          const lbl = btn.querySelector('.label');
          const origText = lbl ? lbl.textContent : '';
          if (lbl) lbl.textContent = result.method === 'cph' ? '✓ Đã gửi vào VS Code!' : '✓ Đã tải file!';
          setTimeout(() => { if (lbl) lbl.textContent = origText; }, 2000);
        } else {
          // Show error state briefly
          const lbl = btn.querySelector('.label');
          const origText = lbl ? lbl.textContent : '';
          if (lbl) lbl.textContent = '✗ CPH chưa chạy!';
          btn.style.color = '#f87171';
          setTimeout(() => {
            if (lbl) lbl.textContent = origText;
            btn.style.color = '';
          }, 3000);
        }
      } else {
        await CPH.Problem.openInVSCode();
      }
      return;
    }
    const actions = {
      'copy-problem': () => CPH.Clipboard.copyProblem(),
      'copy-html': () => CPH.Clipboard.copyHTML(),
      'copy-markdown': () => CPH.Clipboard.copyMarkdown(),
      'copy-input': () => CPH.Clipboard.copyInput(),
      'copy-output': () => CPH.Clipboard.copyOutput(),
      'copy-testcase': () => CPH.Clipboard.copyTestcase(),
      'copy-code': () => CPH.Clipboard.copyCode(),
      'copy-title': () => CPH.Clipboard.copyTitle(),
      'download': () => CPH.Download.downloadTestcases(),
    };
    const fn = actions[action];
    if (!fn) return;
    const success = await fn();
    if (success && btn) showSuccess(btn);
  };

  /* ── VS Code / CPH info tooltip ── */
  // No language modal needed — CPH shows its own language picker inside VS Code

  const showSuccess = (btn) => {
    if (btn.classList.contains('success')) return;
    const iconEl = btn.querySelector('.icon');
    const orig = iconEl.innerHTML;
    iconEl.innerHTML = ICONS.check;
    btn.classList.add('success');
    setTimeout(() => { btn.classList.remove('success'); iconEl.innerHTML = orig; }, 1200);
  };

  const buildHTML = (code) => {
    let body = '';
    BUTTONS.forEach((s, i) => {
      if (i > 0) body += '<div class="toolbar-divider"></div>';
      body += `<div><div class="toolbar-section-label">${s.section}</div>`;
      s.items.forEach(b => {
        const lbl = b.action === 'copy-code' ? `Copy Code: ${code||'—'}` : b.label;
        const sc = b.shortcut ? `<span class="shortcut">${b.shortcut}</span>` : '';
        body += `<button class="toolbar-btn" data-action="${b.action}"><span class="icon">${ICONS[b.icon]}</span><span class="label">${lbl}</span>${sc}</button>`;
      });
      body += '</div>';
    });
    return `<div class="toolbar"><div class="toolbar-header" id="th"><div class="toolbar-badge"><div class="toolbar-logo">CP</div><span class="toolbar-title">CodePTIT Helper</span></div><span class="toolbar-code">${code||'—'}</span><button class="toolbar-toggle" id="tt">${ICONS.chevUp}</button></div><div class="toolbar-body" id="tb">${body}<div class="toolbar-footer"><span class="toolbar-footer-text">v1.0 — CodePTIT Helper</span></div></div></div>`;
  };

  const inject = (code) => {
    remove();
    toolbarHost = document.createElement('div');
    toolbarHost.id = TOOLBAR_ID;
    shadowRoot = toolbarHost.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = getStyles();
    shadowRoot.appendChild(style);
    const c = document.createElement('div');
    c.innerHTML = buildHTML(code);
    shadowRoot.appendChild(c);
    document.body.appendChild(toolbarHost);
    bindEvents();
    makeDraggable();
  };

  const bindEvents = () => {
    if (!shadowRoot) return;
    const hdr = shadowRoot.getElementById('th');
    const tog = shadowRoot.getElementById('tt');
    const body = shadowRoot.getElementById('tb');
    hdr?.addEventListener('click', () => {
      isCollapsed = !isCollapsed;
      body.classList.toggle('collapsed', isCollapsed);
      tog.innerHTML = isCollapsed ? ICONS.chevDown : ICONS.chevUp;
    });
    shadowRoot.querySelectorAll('.toolbar-btn').forEach(btn => {
      btn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); handleAction(btn.dataset.action, btn); });
    });
  };

  const makeDraggable = () => {
    if (!shadowRoot || !toolbarHost) return;
    const hdr = shadowRoot.getElementById('th');
    let dragging = false, sx, sy, ir, it;
    hdr?.addEventListener('mousedown', e => {
      if (e.button !== 0 || e.target.closest('.toolbar-toggle')) return;
      dragging = true; sx = e.clientX; sy = e.clientY;
      const r = toolbarHost.getBoundingClientRect();
      ir = window.innerWidth - r.right; it = r.top;
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      toolbarHost.style.position = 'fixed';
      toolbarHost.style.top = Math.max(0, it + e.clientY - sy) + 'px';
      toolbarHost.style.right = Math.max(0, ir - (e.clientX - sx)) + 'px';
    });
    document.addEventListener('mouseup', () => { dragging = false; });
  };

  const remove = () => { document.getElementById(TOOLBAR_ID)?.remove(); toolbarHost = null; shadowRoot = null; };
  const exists = () => !!document.getElementById(TOOLBAR_ID);
  const updateCode = (code) => {
    if (!shadowRoot) return;
    const el = shadowRoot.querySelector('.toolbar-code');
    if (el) el.textContent = code || '—';
    const cb = shadowRoot.querySelector('[data-action="copy-code"] .label');
    if (cb) cb.textContent = `Copy Code: ${code||'—'}`;
  };

  return { inject, remove, exists, updateCode, handleAction };
})();
