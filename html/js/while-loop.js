/* While.java — counting digits by chopping one off per lap.
   state.phase is the move that has just happened. */

const numberInput = $('#number');
const out = $('#w-out');
const phaseText = $('#w-phase');

const SVG_NS = 'http://www.w3.org/2000/svg';
const BOX_W = 40, BOX_H = 46, BOX_GAP = 8, BOX_Y = 36;

let config = { number: 1234 };
let state = null;
let timer = null;

function readConfig() {
  return { number: Number(numberInput.value) };
}

function reset() {
  stopTimer();
  config = readConfig();
  state = { number: null, digits: null, phase: 'idle', pass: null, bodyRuns: 0, checkRuns: 0, lines: [] };
  drawDigits();
  render();
  phaseText.textContent = 'Press Step to walk through it one move at a time.';
}

function stopTimer() {
  if (timer) { clearInterval(timer); timer = null; }
  $('#w-run').disabled = false;
}

/* One move of the machine. Returns false once the program is finished. */
function step() {
  switch (state.phase) {
    case 'idle':
      state.number = config.number;
      state.digits = 0;
      state.phase = 'init';
      phaseText.textContent = `number = ${state.number}, digits = 0 — set up before the loop starts.`;
      break;

    case 'init':
    case 'inc':
      state.checkRuns++;
      state.pass = state.number > 0;
      state.phase = 'cond';
      phaseText.textContent = state.pass
        ? `Check ${state.checkRuns}: is ${state.number} > 0? Yes — run the body.`
        : `Check ${state.checkRuns}: is ${state.number} > 0? No — the loop ends here.`;
      break;

    case 'cond':
      if (state.pass) {
        const before = state.number;
        state.number = Math.floor(before / 10);
        state.phase = 'div';
        phaseText.textContent = `${before} / 10 is ${state.number} — integer division drops the last digit.`;
      } else {
        state.lines.push(`Digits: ${state.digits}`);
        state.phase = 'done';
        phaseText.textContent = `After the loop: print digits, which is ${state.digits}.`;
      }
      break;

    case 'div':
      state.digits++;
      state.bodyRuns++;
      state.phase = 'inc';
      phaseText.textContent = `digits++ — digits is now ${state.digits}. Back to the check.`;
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
  $('#w-run').disabled = true;
  timer = setInterval(() => { if (!step()) stopTimer(); }, 420);
}

/* ------------------------------------------------------------------ drawing */

function drawDigits() {
  const group = $('#w-digits');
  group.textContent = '';

  const chars = String(config.number).split('');
  const width = chars.length * BOX_W + (chars.length - 1) * BOX_GAP;
  const left = 180 - width / 2;

  chars.forEach((ch, k) => {
    const x = left + k * (BOX_W + BOX_GAP);

    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', BOX_Y);
    rect.setAttribute('width', BOX_W);
    rect.setAttribute('height', BOX_H);
    rect.setAttribute('rx', 7);
    rect.setAttribute('stroke-width', '2.5');
    rect.setAttribute('class', 'd-box');
    rect.dataset.pos = k;

    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', x + BOX_W / 2);
    label.setAttribute('y', BOX_Y + 31);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('class', 'd-text d-box');
    label.setAttribute('font-size', '22');
    label.setAttribute('font-weight', '500');
    label.dataset.pos = k;
    label.textContent = ch;

    group.appendChild(rect);
    group.appendChild(label);
  });
}

function render() {
  const started = state.number !== null;
  const total = String(config.number).length;
  // digits still standing; 0 itself counts as nothing left once the loop is going
  const left = !started ? total : state.number > 0 ? String(state.number).length : (config.number === 0 ? 1 : 0);

  $('#number-val').textContent = config.number;
  setVar('number', config.number);

  $$('#w-digits rect').forEach(rect => {
    const chopped = Number(rect.dataset.pos) >= left;
    rect.setAttribute('fill', chopped ? 'none' : 'var(--accent-soft)');
    rect.setAttribute('stroke', chopped ? 'var(--dim)' : 'var(--accent)');
    rect.setAttribute('stroke-dasharray', chopped ? '5 4' : 'none');
    rect.classList.toggle('is-off', chopped);
  });
  $$('#w-digits text').forEach(label => {
    const chopped = Number(label.dataset.pos) >= left;
    label.setAttribute('fill', chopped ? 'var(--dim)' : 'var(--accent)');
    label.classList.toggle('is-off', chopped);
  });

  // the two variables, with the one that just changed lit up
  $('#w-number').textContent = started ? state.number : '—';
  $('#w-count').textContent = started ? state.digits : '—';
  const lit = (on) => on ? ['var(--amber-soft)', 'var(--amber)'] : ['var(--surface)', 'var(--line)'];
  const [nFill, nStroke] = lit(state.phase === 'div');
  const [dFill, dStroke] = lit(state.phase === 'inc');
  $('#w-box-number').setAttribute('fill', nFill);
  $('#w-box-number').setAttribute('stroke', nStroke);
  $('#w-box-digits').setAttribute('fill', dFill);
  $('#w-box-digits').setAttribute('stroke', dStroke);

  // the last answer the condition gave
  const check = $('#w-check');
  if (state.pass === null) {
    check.textContent = '';
  } else if (state.pass && state.phase === 'cond') {
    check.textContent = `${state.number} > 0 is true → go round again`;
    check.setAttribute('fill', 'var(--yes)');
    check.setAttribute('opacity', '1');
  } else if (!state.pass) {
    check.textContent = `${state.number} > 0 is false → exit`;
    check.setAttribute('fill', 'var(--no)');
    check.setAttribute('opacity', '1');
  } else {
    check.textContent = `${state.bodyRuns} lap${state.bodyRuns === 1 ? '' : 's'} so far`;
    check.setAttribute('fill', 'currentColor');
    check.setAttribute('opacity', '0.65');
  }

  // code
  markParts({ cond: state.phase === 'cond' ? 'on-amber' : null });
  markCode({
    1: state.phase === 'init' ? 'on' : null,
    2: state.phase === 'init' ? 'on' : null,
    5: state.phase === 'div' ? 'on' : null,
    6: state.phase === 'inc' ? 'on' : null,
    8: state.phase === 'done' ? 'on' : null
  });

  $('#w-fact-number').textContent = started ? state.number : '—';
  $('#w-fact-body').textContent = state.bodyRuns;
  $('#w-fact-check').textContent = state.checkRuns;

  if (state.lines.length) {
    printOut(out, state.lines);
  } else {
    out.innerHTML = '<span class="muted">// nothing printed yet</span>';
  }

  syncPush();
}

numberInput.addEventListener('input', reset);
$('#w-step').addEventListener('click', () => { stopTimer(); step(); });
$('#w-run').addEventListener('click', runAll);
$('#w-reset').addEventListener('click', reset);

registerSync({
  read: () => ({ config, state, phaseText: phaseText.textContent }),
  write: s => {
    const changed = config.number !== s.config.number;
    config = s.config;
    state = s.state;
    numberInput.value = config.number;
    phaseText.textContent = s.phaseText;
    if (changed) drawDigits();
  },
  render
});

reset();
