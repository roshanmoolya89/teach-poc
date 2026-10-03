/* DoWhile.java — a menu that is shown before anything is checked.
   state.phase is the move that has just happened. */

const quitInput = $('#quit');
const out = $('#d-out');
const phaseText = $('#d-phase');

const QUIT = 2;

let config = { quitOn: 1 };
let state = null;
let timer = null;

function readConfig() {
  return { quitOn: Number(quitInput.value) };
}

/* What the user types on a given try: Play until the chosen try, then Quit. */
function typedOn(attempt) {
  return attempt >= config.quitOn ? QUIT : 1;
}

function reset() {
  stopTimer();
  config = readConfig();
  state = { choice: null, phase: 'idle', pass: null, bodyRuns: 0, checkRuns: 0, lines: [] };
  render();
  phaseText.textContent = 'Press Step to walk through it one move at a time.';
}

function stopTimer() {
  if (timer) { clearInterval(timer); timer = null; }
  $('#d-run').disabled = false;
}

/* One move of the machine. Returns false once the loop is finished. */
function step() {
  switch (state.phase) {
    case 'idle':
      state.lines.push('Menu: 1. Play  2. Quit');
      state.phase = 'print';
      phaseText.textContent = 'No check yet — do goes straight into the body and shows the menu.';
      break;

    case 'print':
      state.bodyRuns++;
      state.choice = typedOn(state.bodyRuns);
      state.lines.push(`> ${state.choice}`);
      state.phase = 'read';
      phaseText.textContent = `The user types ${state.choice}, so choice is now ${state.choice}.`;
      break;

    case 'read':
      state.checkRuns++;
      state.pass = state.choice !== QUIT;
      state.phase = state.pass ? 'cond' : 'done';
      phaseText.textContent = state.pass
        ? `Check ${state.checkRuns}: is ${state.choice} != 2? Yes — go round again.`
        : `Check ${state.checkRuns}: is ${state.choice} != 2? No — the loop ends here.`;
      break;

    case 'cond':
      state.lines.push('Menu: 1. Play  2. Quit');
      state.phase = 'print';
      phaseText.textContent = `Lap ${state.bodyRuns + 1}: back to the top of the body, menu shown again.`;
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
  $('#d-run').disabled = true;
  timer = setInterval(() => { if (!step()) stopTimer(); }, 420);
}

/* ------------------------------------------------------------------ drawing */

function paint(el, fill, stroke) {
  el.setAttribute('fill', fill);
  el.setAttribute('stroke', stroke);
}

function render() {
  const inBody = state.phase === 'print' || state.phase === 'read';
  const checked = state.phase === 'cond' || state.phase === 'done';

  $('#quit-val').textContent = config.quitOn;
  // before anything is typed, show what the first answer is going to be
  setVar('choice', state.choice === null ? typedOn(1) : state.choice);

  paint($('#d-body'), inBody ? 'var(--accent-soft)' : 'var(--surface)', inBody ? 'var(--accent)' : 'var(--line)');
  paint($('#d-cond'), checked ? 'var(--amber-soft)' : 'var(--surface)', checked ? 'var(--amber)' : 'var(--line)');
  paint($('#d-box-choice'),
    state.phase === 'read' ? 'var(--amber-soft)' : 'var(--surface)',
    state.phase === 'read' ? 'var(--amber)' : 'var(--line)');

  $('#d-again').classList.toggle('is-off', state.phase !== 'cond');
  $('#d-exit').classList.toggle('is-off', state.phase !== 'done');
  $('#d-choice').textContent = state.choice === null ? '?' : state.choice;

  // code
  markParts({ cond: checked ? 'on-amber' : null });
  markCode({
    3: state.phase === 'print' ? 'on' : null,
    4: state.phase === 'read' ? 'on' : null
  });

  $('#d-fact-choice').textContent = state.choice === null ? '—' : state.choice;
  $('#d-fact-body').textContent = state.bodyRuns;
  $('#d-fact-check').textContent = state.checkRuns;

  if (state.lines.length) {
    printOut(out, state.phase === 'done' ? state.lines.concat(['', '// loop finished']) : state.lines);
    out.scrollTop = out.scrollHeight;
  } else {
    out.innerHTML = '<span class="muted">// nothing printed yet</span>';
  }

  syncPush();
}

quitInput.addEventListener('input', reset);
$('#d-step').addEventListener('click', () => { stopTimer(); step(); });
$('#d-run').addEventListener('click', runAll);
$('#d-reset').addEventListener('click', reset);

registerSync({
  read: () => ({ config, state, phaseText: phaseText.textContent }),
  write: s => {
    config = s.config;
    state = s.state;
    quitInput.value = config.quitOn;
    phaseText.textContent = s.phaseText;
  },
  render
});

reset();
