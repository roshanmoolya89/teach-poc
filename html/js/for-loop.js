/* For.java — a for loop walked one move at a time.
   Phases mirror what Java actually does: init once, then check / body / update. */

const startInput = $('#start');
const endInput = $('#end');
const stepInput = $('#step');
const out = $('#f-out');
const phaseText = $('#f-phase');

const CX = 180, CY = 118, R = 64;
const CIRCUMFERENCE = 2 * Math.PI * R;
const SVG_NS = 'http://www.w3.org/2000/svg';

let config = { start: 1, end: 5, step: 1 };
let state = null;
let timer = null;

function readConfig() {
  return {
    start: Number(startInput.value),
    end: Number(endInput.value),
    step: Number(stepInput.value)
  };
}

/* How many times the body will run, worked out up front so the track can be
   drawn before anything executes. */
function lapCount({ start, end, step }) {
  if (start > end) return 0;
  return Math.floor((end - start) / step) + 1;
}

function reset() {
  stopTimer();
  config = readConfig();
  state = { i: null, phase: 'idle', bodyRuns: 0, checkRuns: 0, lines: [] };
  drawStops();
  render();
  phaseText.textContent = 'Press Step to walk through it one move at a time.';
}

function stopTimer() {
  if (timer) { clearInterval(timer); timer = null; }
  $('#f-run').disabled = false;
}

/* One move of the machine. Returns false once the loop is finished. */
function step() {
  const { end, step: inc } = config;

  switch (state.phase) {
    case 'idle':
      state.i = config.start;
      state.phase = 'cond';
      phaseText.textContent = `int i = ${config.start} — runs once, before anything else.`;
      break;

    case 'cond': {
      state.checkRuns++;
      const pass = state.i <= end;
      state.phase = pass ? 'body' : 'done';
      phaseText.textContent = pass
        ? `Check ${state.checkRuns}: is ${state.i} <= ${end}? Yes — run the body.`
        : `Check ${state.checkRuns}: is ${state.i} <= ${end}? No — the loop ends here.`;
      break;
    }

    case 'body':
      state.lines.push(`Iteration: ${state.i}`);
      state.bodyRuns++;
      state.phase = 'upd';
      phaseText.textContent = `Body run ${state.bodyRuns}, printing with i = ${state.i}.`;
      break;

    case 'upd':
      state.i += inc;
      state.phase = 'cond';
      phaseText.textContent = `i += ${inc} — i is now ${state.i}. Back to the check.`;
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
  $('#f-run').disabled = true;
  timer = setInterval(() => { if (!step()) stopTimer(); }, 320);
}

/* ------------------------------------------------------------------ drawing */

function drawStops() {
  const group = $('#f-stops');
  group.textContent = '';

  const laps = lapCount(config);
  const dotR = laps > 9 ? 12 : laps > 6 ? 14 : 15;

  for (let k = 0; k < laps; k++) {
    const value = config.start + k * config.step;
    const angle = (-90 + k * (360 / laps)) * Math.PI / 180;
    const x = CX + R * Math.cos(angle);
    const y = CY + R * Math.sin(angle);

    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', dotR);
    circle.setAttribute('fill', 'var(--surface)');
    circle.setAttribute('stroke', 'var(--accent)');
    circle.setAttribute('stroke-width', '2.5');
    circle.dataset.value = value;

    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', x);
    label.setAttribute('y', y + 4);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('class', 'd-text');
    label.setAttribute('font-size', laps > 9 ? '10' : '12');
    label.setAttribute('fill', 'var(--accent)');
    label.dataset.label = value;
    label.textContent = value;

    group.appendChild(circle);
    group.appendChild(label);
  }
}

function render() {
  const { start, end, step: inc } = config;
  const laps = lapCount(config);

  $('#start-val').textContent = start;
  $('#end-val').textContent = end;
  $('#step-val').textContent = inc;
  setVar('start', start);
  setVar('end', end);
  setVar('step', inc);

  $('#f-header').textContent = `for (int i = ${start}; i <= ${end}; i += ${inc})`;

  // progress around the track
  const done = laps === 0 ? 0 : state.bodyRuns / laps;
  const track = $('#f-track');
  track.setAttribute('stroke-dasharray', `${CIRCUMFERENCE * done} ${CIRCUMFERENCE}`);

  // the stop we are standing on
  $$('#f-stops circle').forEach(circle => {
    const value = Number(circle.dataset.value);
    const current = state.phase === 'body' && value === state.i;
    const passed = state.i !== null && value < state.i;
    circle.setAttribute('fill', current ? 'var(--accent)' : passed ? 'var(--accent-soft)' : 'var(--surface)');
    circle.setAttribute('r', current ? (laps > 9 ? 14 : 17) : (laps > 9 ? 12 : 15));
  });
  $$('#f-stops text').forEach(label => {
    const current = state.phase === 'body' && Number(label.dataset.label) === state.i;
    label.setAttribute('fill', current ? 'var(--surface)' : 'var(--accent)');
    label.setAttribute('font-weight', current ? '600' : '500');
  });

  // centre caption and exit marker
  $('#f-centre-1').textContent = laps === 0 ? 'body never' : 'same body,';
  $('#f-centre-2').textContent = laps === 0 ? 'runs' : `${laps} lap${laps === 1 ? '' : 's'}`;
  $('#f-exit-t').textContent = `i = ${start + laps * inc} → exit`;
  $('#f-exit').classList.toggle('is-off', state.phase !== 'done');

  // code
  markParts({
    init: state.phase === 'idle' ? null : 'on',
    cond: state.phase === 'cond' ? 'on-amber' : null,
    upd: state.phase === 'upd' ? 'on-amber' : null
  });
  markCode({ 2: state.phase === 'body' ? 'on' : null });

  $('#f-fact-i').textContent = state.i === null ? '—' : state.i;
  $('#f-fact-body').textContent = state.bodyRuns;
  $('#f-fact-check').textContent = state.checkRuns;

  if (state.lines.length) {
    printOut(out, state.phase === 'done' ? state.lines.concat(['', '// loop finished']) : state.lines);
  } else {
    out.innerHTML = '<span class="muted">// nothing printed yet</span>';
  }

  syncPush();
}

[startInput, endInput, stepInput].forEach(input => input.addEventListener('input', reset));
$('#f-step').addEventListener('click', () => { stopTimer(); step(); });
$('#f-run').addEventListener('click', runAll);
$('#f-reset').addEventListener('click', reset);

registerSync({
  read: () => ({ config, state, phaseText: phaseText.textContent }),
  write: s => {
    const trackChanged = JSON.stringify(config) !== JSON.stringify(s.config);
    config = s.config;
    state = s.state;
    startInput.value = config.start;
    endInput.value = config.end;
    stepInput.value = config.step;
    phaseText.textContent = s.phaseText;
    if (trackChanged) drawStops();
  },
  render
});

reset();
