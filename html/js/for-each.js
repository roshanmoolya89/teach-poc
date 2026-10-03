/* ForEach.java — the array handed over one element at a time.
   state.phase is the move that has just happened. */

const countInput = $('#count');
const out = $('#e-out');
const phaseText = $('#e-phase');

const SVG_NS = 'http://www.w3.org/2000/svg';
const ALL_SCORES = [80, 65, 92, 71, 58, 99];
const CELL_W = 44, CELL_H = 40, CELL_GAP = 6, CELL_Y = 42;

let config = { count: 3 };
let state = null;
let timer = null;

function readConfig() {
  return { count: Number(countInput.value) };
}

function scores() {
  return ALL_SCORES.slice(0, config.count);
}

function cellX(k) {
  const width = config.count * CELL_W + (config.count - 1) * CELL_GAP;
  return 180 - width / 2 + k * (CELL_W + CELL_GAP);
}

function reset() {
  stopTimer();
  config = readConfig();
  state = { k: -1, s: null, phase: 'idle', visited: 0, lines: [] };
  drawCells();
  render();
  phaseText.textContent = 'Press Step to walk through it one move at a time.';
}

function stopTimer() {
  if (timer) { clearInterval(timer); timer = null; }
  $('#e-run').disabled = false;
}

/* Move on to the next element, or finish if there is none. */
function takeNext() {
  const list = scores();
  if (state.k + 1 >= list.length) {
    state.phase = 'done';
    phaseText.textContent = list.length === 0
      ? 'The array is empty, so there is nothing to hand over. The body never runs.'
      : 'No items left — the loop ends by itself.';
    return;
  }
  state.k++;
  state.s = list[state.k];
  state.phase = 'take';
  phaseText.textContent = `Item ${state.k + 1} of ${list.length}: its value, ${state.s}, is copied into s.`;
}

/* One move of the machine. Returns false once the loop is finished. */
function step() {
  switch (state.phase) {
    case 'idle':
      state.phase = 'init';
      phaseText.textContent = `scores is created with ${config.count} item${config.count === 1 ? '' : 's'}.`;
      break;

    case 'init':
    case 'body':
      takeNext();
      break;

    case 'take':
      state.lines.push(String(state.s));
      state.visited++;
      state.phase = 'body';
      phaseText.textContent = `Body runs with s = ${state.s}.`;
      break;

    case 'done':
      return false;
  }

  render();
  return state.phase !== 'done';
}

function runAll() {
  if (state.phase === 'done') reset();
  stopTimer();
  $('#e-run').disabled = true;
  timer = setInterval(() => { if (!step()) stopTimer(); }, 420);
}

/* ------------------------------------------------------------------ drawing */

function drawCells() {
  const group = $('#e-cells');
  group.textContent = '';

  scores().forEach((value, k) => {
    const x = cellX(k);

    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', CELL_Y);
    rect.setAttribute('width', CELL_W);
    rect.setAttribute('height', CELL_H);
    rect.setAttribute('rx', 6);
    rect.setAttribute('stroke', 'var(--accent)');
    rect.setAttribute('stroke-width', '2.5');
    rect.setAttribute('class', 'd-box');
    rect.dataset.pos = k;

    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', x + CELL_W / 2);
    label.setAttribute('y', CELL_Y + 26);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('class', 'd-text');
    label.setAttribute('font-size', '15');
    label.dataset.pos = k;
    label.textContent = value;

    // the index is there, but for-each never shows it to you
    const index = document.createElementNS(SVG_NS, 'text');
    index.setAttribute('x', x + CELL_W / 2);
    index.setAttribute('y', CELL_Y + CELL_H + 13);
    index.setAttribute('text-anchor', 'middle');
    index.setAttribute('class', 'd-text');
    index.setAttribute('font-size', '9');
    index.setAttribute('fill', 'var(--dim)');
    index.textContent = `[${k}]`;

    group.appendChild(rect);
    group.appendChild(label);
    group.appendChild(index);
  });
}

function render() {
  const list = scores();
  const holding = state.phase === 'take' || state.phase === 'body';

  $('#count-val').textContent = config.count;
  setVar('scores', list.join(', '));
  $('#e-empty').style.display = list.length ? 'none' : '';

  $$('#e-cells rect').forEach(rect => {
    const pos = Number(rect.dataset.pos);
    const current = holding && pos === state.k;
    const passed = pos < state.k || (state.phase === 'done' && pos <= state.k);
    rect.setAttribute('fill', current ? 'var(--accent)' : passed ? 'var(--accent-soft)' : 'var(--surface)');
  });
  $$('#e-cells text[data-pos]').forEach(label => {
    const current = holding && Number(label.dataset.pos) === state.k;
    label.setAttribute('fill', current ? 'var(--surface)' : 'var(--accent)');
    label.setAttribute('font-weight', current ? '600' : '500');
  });

  // the copy from the current cell down into s
  const link = $('#e-link');
  link.style.display = holding ? '' : 'none';
  if (holding) {
    const x = cellX(state.k) + CELL_W / 2;
    $('#e-line').setAttribute('x1', x);
    $('#e-dot').setAttribute('cx', x);
  }

  const fresh = state.phase === 'take';
  $('#e-box-s').setAttribute('fill', fresh ? 'var(--amber-soft)' : 'var(--surface)');
  $('#e-box-s').setAttribute('stroke', fresh ? 'var(--amber)' : holding ? 'var(--accent)' : 'var(--line)');
  $('#e-s').textContent = state.s === null ? '—' : state.s;
  $('#e-exit').classList.toggle('is-off', state.phase !== 'done');

  // code
  markParts({
    item: state.phase === 'take' ? 'on-amber' : null,
    coll: state.phase === 'done' ? 'on-amber' : null
  });
  markCode({
    1: state.phase === 'init' ? 'on' : null,
    4: state.phase === 'body' ? 'on' : null
  });

  $('#e-fact-s').textContent = state.s === null ? '—' : state.s;
  $('#e-fact-visited').textContent = state.visited;
  $('#e-fact-left').textContent = list.length - state.visited;

  if (state.lines.length) {
    printOut(out, state.phase === 'done' ? state.lines.concat(['', '// loop finished']) : state.lines);
  } else if (state.phase === 'done') {
    out.innerHTML = '<span class="muted">// loop finished, nothing printed</span>';
  } else {
    out.innerHTML = '<span class="muted">// nothing printed yet</span>';
  }

  syncPush();
}

countInput.addEventListener('input', reset);
$('#e-step').addEventListener('click', () => { stopTimer(); step(); });
$('#e-run').addEventListener('click', runAll);
$('#e-reset').addEventListener('click', reset);

registerSync({
  read: () => ({ config, state, phaseText: phaseText.textContent }),
  write: s => {
    const changed = config.count !== s.config.count;
    config = s.config;
    state = s.state;
    countInput.value = config.count;
    phaseText.textContent = s.phaseText;
    if (changed) drawCells();
  },
  render
});

reset();
