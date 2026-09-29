/* Shared helpers for every topic page:
   DOM shortcuts, code highlighting, the sidebar, and the second-tab preview. */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const TOPIC_ID = document.body.dataset.topic || '';
const PREVIEW_MODE = new URLSearchParams(location.search).get('view') === 'preview';

/* ------------------------------------------------------------ code + output */

/* Write the current value of a variable everywhere it appears in the code
   listing, e.g. <i class="v" data-var="marks">45</i> */
function setVar(name, value) {
  $$(`[data-var="${name}"]`).forEach(el => { el.textContent = value; });
}

/* Apply highlight states to the code listing.
   states = { lineId: "on" | "on-warn" | "on-amber" | "off" | "skip" | null } */
function markCode(states) {
  $$('[data-line]').forEach(el => {
    el.classList.remove('on', 'on-warn', 'on-amber', 'off', 'skip');
    const state = states[el.dataset.line];
    if (state) el.classList.add(state);
  });
}

/* Same idea for inline pieces such as the two halves of a ternary. */
function markParts(states) {
  $$('[data-part]').forEach(el => {
    el.classList.remove('on', 'on-warn', 'on-amber', 'off', 'skip');
    const state = states[el.dataset.part];
    if (state) el.classList.add(state);
  });
}

/* Print lines into a .console block. Pass a string or an array of strings. */
function printOut(el, lines) {
  const list = Array.isArray(lines) ? lines : [lines];
  el.textContent = list.join('\n');
}

/* Two-button on/off control. Calls onChange(true|false). */
function segment(el, onChange) {
  $$('button', el).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('button', el).forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      onChange(btn.dataset.value === 'true');
    });
  });
}

/* Force a segment control into a given position without firing its handler. */
function setSegment(el, value) {
  $$('button', el).forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.value === String(value)));
  });
}

/* ------------------------------------------------------------------ sidebar */

const TOPICS = [
  {
    group: 'Conditionals',
    items: [
      { id: 'ternary', href: 'ternary.html', label: 'Ternary operator', file: 'Ternary.java' },
      { id: 'if-else', href: 'if-else.html', label: 'if / else', file: 'IsRaining.java' },
      { id: 'else-if', href: 'else-if.html', label: 'else if chain', file: 'GradeChecker.java' },
      { id: 'switch', href: 'switch.html', label: 'switch', file: 'Switch.java' },
      { id: 'logical', href: 'logical-operators.html', label: '&& and ||', file: 'CombineConditions.java' }
    ]
  },
  {
    group: 'Loops',
    items: [
      { id: 'for', href: 'for-loop.html', label: 'for loop', file: 'loops/For.java' }
    ]
  },
  {
    group: 'Layout',
    items: [
      { id: 'flexbox', href: 'flexbox.html', label: 'Flexbox playground', file: 'CSS' }
    ]
  }
];

function buildSidebar() {
  const nav = $('#sidebar');
  if (!nav) return;

  const parts = [
    `<a class="side-home${TOPIC_ID === 'index' ? ' current' : ''}" href="index.html">`,
    '<span class="side-title">Java course</span>',
    '<span class="side-sub">interactive topics</span>',
    '</a>'
  ];

  TOPICS.forEach(section => {
    parts.push(`<p class="side-group">${section.group}</p>`);
    parts.push('<ul class="side-list">');
    section.items.forEach(item => {
      const current = item.id === TOPIC_ID;
      parts.push(
        `<li><a href="${item.href}"${current ? ' class="current" aria-current="page"' : ''}>` +
        `<span class="side-label">${item.label}</span>` +
        `<span class="side-file">${item.file}</span>` +
        '</a></li>'
      );
    });
    parts.push('</ul>');
  });

  nav.innerHTML = parts.join('');
}

/* ------------------------------------------------------- second-tab preview */

/* The preview tab is the same page opened with ?view=preview. It hides
   everything but the diagram and takes its values from the controlling tab
   over postMessage, which works on file:// where BroadcastChannel does not. */

let previewWindow = null;
let syncApi = null;

/* In the preview tab the interactive widgets are pointless, but what they are
   set to is exactly what the room needs to see. Hide the blocks that hold
   controls and show their current values as chips instead; everything else in
   the panel (the code listing, the generated CSS, the output) stays. */
function hideControlBlocks() {
  $$('.panel-controls > div').forEach(block => {
    if ($('.controls, .grid2, .item-picker, .btn-row', block)) {
      block.classList.add('block-controls');
    }
  });
}

/* Read the current value of one .ctrl group, whatever kind of input it holds. */
function readControl(ctrl) {
  const labelEl = $('label', ctrl) || $('.ctrl-label', ctrl);
  if (!labelEl) return null;

  const valSpan = $('.val', labelEl);
  let name = labelEl.textContent;
  if (valSpan) name = name.replace(valSpan.textContent, '');
  name = name.replace(/\s+/g, ' ').trim();

  const select = $('select', ctrl);
  const seg = $('.seg', ctrl);
  const range = $('input[type="range"]', ctrl);

  let value;
  if (select) value = select.value;
  else if (seg) {
    const pressed = $('button[aria-pressed="true"]', seg);
    value = pressed ? pressed.textContent.trim() : '';
  } else if (valSpan) value = valSpan.textContent;
  else if (range) value = range.value;
  else return null;

  const input = select || range;
  return { name, value, muted: Boolean(input && input.disabled) };
}

/* One chip strip per workbench, so a page with two demos keeps them apart. */
function renderPreviewSettings() {
  $$('.workbench').forEach(bench => {
    const preview = $('.panel-preview', bench);
    const controls = $('.panel-controls', bench);
    if (!preview || !controls) return;

    let strip = $('.preview-settings', preview);
    if (!strip) {
      strip = document.createElement('div');
      strip.className = 'preview-settings';
      preview.appendChild(strip);
    }

    /* Only the first control block becomes chips. On the flexbox page that is
       the container, and the per-item values are already in the CSS below. */
    const firstBlock = $('.block-controls', controls);
    if (!firstBlock) { strip.innerHTML = ''; return; }

    strip.innerHTML = $$('.ctrl', firstBlock)
      .map(readControl)
      .filter(Boolean)
      .map(item =>
        `<span class="pset${item.muted ? ' is-muted' : ''}">` +
        `<span class="pset-k">${item.name}</span>` +
        `<span class="pset-v">${item.value}</span></span>`
      )
      .join('');
  });
}

function registerSync(api) {
  syncApi = api;

  if (PREVIEW_MODE) {
    document.body.classList.add('is-preview');
    hideControlBlocks();
    window.addEventListener('message', event => {
      const msg = event.data;
      if (!msg || msg.type !== 'state') return;
      syncApi.write(msg.state);
      syncApi.render();
    });
    // ask the controlling tab for the current values
    if (window.opener) {
      window.opener.postMessage({ type: 'hello', topic: TOPIC_ID }, '*');
    } else {
      const badge = $('#preview-badge');
      if (badge) badge.textContent = 'Open this from a topic page to control it';
    }
    return;
  }

  window.addEventListener('message', event => {
    const msg = event.data;
    if (msg && msg.type === 'hello' && msg.topic === TOPIC_ID) syncPush();
  });

  buildPopButton();
}

/* Called at the end of every render. On the controlling tab it ships the new
   state out; in the preview tab it refreshes the settings chips. */
function syncPush() {
  if (PREVIEW_MODE) { renderPreviewSettings(); return; }
  if (!syncApi || !previewWindow || previewWindow.closed) return;
  previewWindow.postMessage({ type: 'state', state: syncApi.read() }, '*');
}

function buildPopButton() {
  const slot = $('#pop-slot');
  if (!slot) return;

  const button = document.createElement('button');
  button.className = 'btn btn-pop';
  button.type = 'button';
  slot.appendChild(button);

  const label = () => {
    const open = previewWindow && !previewWindow.closed;
    button.textContent = open ? 'Close preview tab' : 'Preview in 2nd tab';
    button.classList.toggle('is-live', Boolean(open));
  };

  button.addEventListener('click', () => {
    if (previewWindow && !previewWindow.closed) {
      previewWindow.close();
      previewWindow = null;
      label();
      return;
    }
    const url = location.pathname + '?view=preview';
    previewWindow = window.open(url, 'java-course-preview');
    if (!previewWindow) {
      button.textContent = 'Popup blocked — allow popups';
      return;
    }
    label();
    // the new tab says hello once it is ready, but push anyway in case it is
    // a tab that was already open
    setTimeout(syncPush, 600);
  });

  label();
  setInterval(label, 1500);
}

document.addEventListener('DOMContentLoaded', buildSidebar);
if (document.readyState !== 'loading') buildSidebar();
