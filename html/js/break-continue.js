/* BreakContinue.java — ten laps, one skipped, and an early exit.
   state.phase is the move that has just happened. */

const skipInput = $('#skip');
const stopInput = $('#stop');
const out = $('#b-out');
const phaseText = $('#b-phase');

const SVG_NS = 'http://www.w3.org/2000/svg';
const LAST = 10;
const STOP_Y = 100, STOP_R = 13;

let config = { skip: 3, stop: 6 };
let state = null;
let timer = null;

function readConfig() {
  return { skip: Number(skipInput.value), stop: Number(stopInput.value) };
}

function stopX(i) {
  return 27 + (i - 1) * 34;
}

function reset() {
  stopTimer();
  config = readConfig();
  // marks records what happened at each i: printed, skipped or broke
  state = { i: null, phase: 'idle', hit: false, how: null, marks: {}, printed: 0, skipped: 0, lines: [] };
  render();
  phaseText.textContent = 'Press Step to walk through it one move at a time.';
}

function stopTimer() {
  if (timer) { clearInterval(timer); timer = null; }
  $('#b-run').disabled = false;
}

/* One move of the machine. Returns false once the loop is finished. */
function step() {
  const { skip, stop } = config;

  switch (state.phase) {
    case 'idle':
      state.i = 1;
      state.phase = 'init';
      phaseText.textContent = 'int i = 1 — runs once, before anything else.';
      break;

    case 'init':
    case 'upd':
      if (state.i <= LAST) {
        state.phase = 'cond';
        phaseText.textContent = `Is ${state.i} <= 10? Yes — start the body.`;
      } else {
        state.phase = 'done';
        state.how = 'cond';
        phaseText.textContent = `Is ${state.i} <= 10? No — the loop ends the normal way.`;
      }
      break;

    case 'cond':
      state.hit = state.i === skip;
      state.phase = 'ifc';
      if (state.hit) {
        state.marks[state.i] = 'skipped';
        state.skipped++;
        phaseText.textContent = `Is ${state.i} == ${skip}? Yes — continue: drop the rest of this lap and go to i++.`;
      } else {
        phaseText.textContent = `Is ${state.i} == ${skip}? No — carry on to the next line.`;
      }
      break;

    case 'ifc':
      if (state.hit) {
        state.i++;
        state.phase = 'upd';
        phaseText.textContent = `i++ still runs after continue — i is now ${state.i}.`;
        break;
      }
      state.hit = state.i === stop;
      if (state.hit) {
        state.marks[state.i] = 'broke';
        state.phase = 'done';
        state.how = 'break';
        phaseText.textContent = `Is ${state.i} == ${stop}? Yes — break: the loop is over, no more laps.`;
      } else {
        state.phase = 'ifb';
        phaseText.textContent = `Is ${state.i} == ${stop}? No — carry on to the print.`;
      }
      break;

    case 'ifb':
      state.lines.push(String(state.i));
      state.marks[state.i] = 'printed';
      state.printed++;
      state.phase = 'print';
      phaseText.textContent = `Neither fired, so ${state.i} is printed.`;
      break;

    case 'print':
      state.i++;
      state.phase = 'upd';
      phaseText.textContent = `i++ — i is now ${state.i}. Back to the check.`;
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
  $('#b-run').disabled = true;
  timer = setInterval(() => { if (!step()) stopTimer(); }, 260);
}

/* ------------------------------------------------------------------ drawing */

function drawStops() {
  const group = $('#b-stops');

  for (let i = 1; i <= LAST; i++) {
    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', stopX(i));
    circle.setAttribute('cy', STOP_Y);
    circle.setAttribute('class', 'd-box');
    circle.dataset.value = i;

    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', stopX(i));
    label.setAttribute('y', STOP_Y + 4);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('class', 'd-text d-box');
    label.setAttribute('font-size', '11');
    label.setAttribute('font-weight', '500');
    label.dataset.label = i;
    label.textContent = i;

    group.appendChild(circle);
    group.appendChild(label);
  }
}

const STOP_LOOK = {
  printed: ['var(--accent-soft)', 'var(--accent)'],
  skipped: ['var(--amber-soft)', 'var(--amber)'],
  broke: ['var(--no-soft)', 'var(--no)']
};

function render() {
  const { skip, stop } = config;
  const broke = state.how === 'break';
  const running = state.i !== null && state.phase !== 'done';

  $('#skip-val').textContent = skip;
  $('#stop-val').textContent = stop;
  setVar('skip', skip);
  setVar('stop', stop);

  // where continue and break are waiting, dim until they actually fire
  const sx = stopX(skip);
  $('#b-skip-arc').setAttribute('d', `M${sx + 5},84 Q${sx + 17},64 ${sx + 29},84`);
  $('#b-skip-t').setAttribute('x', sx);
  $('#b-skip').classList.toggle('is-off', state.marks[skip] !== 'skipped');

  const bx = stopX(stop);
  $('#b-stop-wall').setAttribute('x1', bx + 17);
  $('#b-stop-wall').setAttribute('x2', bx + 17);
  $('#b-stop-t').setAttribute('x', bx);
  $('#b-stop').classList.toggle('is-off', !broke);

  $$('#b-stops circle').forEach(circle => {
    const value = Number(circle.dataset.value);
    const mark = state.marks[value];
    const current = running && value === state.i && !mark;
    const [fill, stroke] = STOP_LOOK[mark] || ['var(--surface)', current ? 'var(--accent)' : 'var(--dim)'];
    circle.setAttribute('fill', fill);
    circle.setAttribute('stroke', stroke);
    circle.setAttribute('stroke-width', current ? '3.5' : '2.5');
    circle.setAttribute('r', current ? STOP_R + 2 : STOP_R);
    circle.classList.toggle('is-off', broke && value > state.i);
  });
  $$('#b-stops text').forEach(label => {
    const value = Number(label.dataset.label);
    const mark = state.marks[value];
    label.setAttribute('fill', mark ? STOP_LOOK[mark][1] : 'currentColor');
    label.classList.toggle('is-off', broke && value > state.i);
  });

  const status = $('#b-status');
  if (broke) {
    status.textContent = state.i === LAST
      ? `break at i = ${state.i} → loop over`
      : `break at i = ${state.i} → ${state.i + 1} to ${LAST} never run`;
  } else if (state.how === 'cond') {
    status.textContent = `i = ${state.i} → condition false → exit`;
  } else {
    status.textContent = '';
  }

  // code
  const skippedLap = state.phase === 'ifc' && state.hit;
  markParts({
    init: state.phase === 'init' ? 'on' : null,
    cond: state.phase === 'cond' || state.how === 'cond' ? 'on-amber' : null,
    upd: state.phase === 'upd' ? 'on-amber' : null
  });
  markCode({
    2: state.phase === 'ifc' ? (state.hit ? 'on-amber' : 'off') : null,
    3: broke ? 'on-warn' : skippedLap ? 'skip' : state.phase === 'ifb' ? 'off' : null,
    4: broke || skippedLap ? 'skip' : state.phase === 'print' ? 'on' : null
  });

  $('#b-fact-i').textContent = state.i === null ? '—' : state.i;
  $('#b-fact-printed').textContent = state.printed;
  $('#b-fact-skipped').textContent = state.skipped;

  if (state.lines.length) {
    printOut(out, state.phase === 'done' ? state.lines.concat(['', '// loop finished']) : state.lines);
    out.scrollTop = out.scrollHeight;
  } else if (state.phase === 'done') {
    out.innerHTML = '<span class="muted">// loop finished, nothing printed</span>';
  } else {
    out.innerHTML = '<span class="muted">// nothing printed yet</span>';
  }

  syncPush();
}

[skipInput, stopInput].forEach(input => input.addEventListener('input', reset));
$('#b-step').addEventListener('click', () => { stopTimer(); step(); });
$('#b-run').addEventListener('click', runAll);
$('#b-reset').addEventListener('click', reset);

registerSync({
  read: () => ({ config, state, phaseText: phaseText.textContent }),
  write: s => {
    config = s.config;
    state = s.state;
    skipInput.value = config.skip;
    stopInput.value = config.stop;
    phaseText.textContent = s.phaseText;
  },
  render
});

drawStops();
reset();
