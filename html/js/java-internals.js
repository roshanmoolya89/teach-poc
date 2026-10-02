/* How Java runs — Hello.java followed from a text file to a line of output.
   Each stage names the diagram parts that are busy while it happens. */

const out = $('#j-out');
const caption = $('#j-caption');

/* lit:  data-node ids that are active during the stage
   src / byte: highlight state for the two code listings
   b3: true once only the println instruction is still of interest */
const STAGES = [
  {
    lit: [],
    file: '—',
    actor: '—',
    text: 'Press Step to follow Hello.java from a text file to a running program.'
  },
  {
    lit: ['src'],
    file: 'Hello.java',
    actor: 'you',
    src: 'on',
    text: '<b>Write.</b> You type Hello.java. It is plain text, and the computer cannot run it as it is.'
  },
  {
    lit: ['a-src', 'javac', 'a-tool'],
    file: 'Hello.java',
    actor: 'javac',
    src: 'on-amber',
    text: '<b>Compile.</b> javac reads the source, checks it for mistakes and translates it. javac is a Java program itself, so the JVM is what runs it.'
  },
  {
    lit: ['a-out', 'byte'],
    file: 'Hello.class',
    actor: 'javac',
    byte: 'on',
    text: '<b>Bytecode.</b> Out comes Hello.class. These are instructions for the JVM, not for your processor, so the same file works on any operating system.'
  },
  {
    lit: ['a-load', 'jre', 'jvm', 'c-load'],
    file: 'Hello.class',
    actor: 'class loader',
    byte: 'on-amber',
    text: '<b>Load.</b> java Hello starts the JVM. The class loader finds Hello.class and brings it into memory, along with the library classes it uses, such as System and String.'
  },
  {
    lit: ['jvm', 'c-verify'],
    file: 'Hello.class',
    actor: 'verifier',
    byte: 'on-amber',
    text: '<b>Verify.</b> Before anything runs, the verifier checks that the bytecode is well formed and does nothing illegal.'
  },
  {
    lit: ['jvm', 'c-exec'],
    file: 'Hello.class',
    actor: 'interpreter + JIT',
    byte: 'on',
    text: '<b>Execute.</b> The interpreter runs the bytecode one instruction at a time. Code that runs often is compiled into real machine code by the JIT compiler.'
  },
  {
    lit: ['a-os', 'os'],
    file: 'machine code',
    actor: 'OS + CPU',
    b3: true,
    text: '<b>Run.</b> println becomes a request to the operating system, which puts the text on screen. Only the JVM had to know which OS this is.'
  }
];

const LAST = STAGES.length - 1;
const COMPILED = 3;   // first stage at which Hello.class exists
const STARTED = 4;    // first stage after "java Hello" is typed

let stage = 0;
let timer = null;

function stopTimer() {
  if (timer) { clearInterval(timer); timer = null; }
}

function go(next) {
  stage = Math.max(0, Math.min(LAST, next));
  render();
}

function runAll() {
  stopTimer();
  if (stage === LAST) stage = 0;
  go(stage + 1);
  timer = setInterval(() => {
    go(stage + 1);
    if (stage === LAST) { stopTimer(); render(); }
  }, 1600);
  render();
}

function render() {
  const current = STAGES[stage];
  const earlier = STAGES.slice(0, stage).flatMap(s => s.lit);

  // diagram: amber for now, teal for already done
  $$('[data-node]').forEach(el => {
    const now = current.lit.includes(el.dataset.node);
    el.classList.toggle('is-now', now);
    el.classList.toggle('is-done', !now && earlier.includes(el.dataset.node));
  });

  caption.innerHTML = current.text;
  $('#j-fact-stage').textContent = stage;
  $('#j-fact-file').textContent = current.file;
  $('#j-fact-actor').textContent = current.actor;

  // code: the listing that matters at this stage is the one lit up
  const src = current.src || null;
  const byte = current.byte || null;
  markCode({
    s1: src, s2: src, s3: src, s4: src, s5: src,
    b1: byte, b2: byte, b3: current.b3 ? 'on' : byte, b4: byte
  });
  $('#j-byte').hidden = stage < COMPILED;
  $('#j-byte-empty').hidden = stage >= COMPILED;

  // terminal: the commands typed so far
  const lines = [];
  if (stage >= 2) lines.push('$ javac Hello.java');
  if (stage >= STARTED) lines.push('$ java Hello');
  if (stage === LAST) lines.push('Hello, Java!');
  if (lines.length) printOut(out, lines);
  else out.innerHTML = '<span class="muted">// nothing typed yet</span>';

  $('#j-step').disabled = stage === LAST;
  $('#j-back').disabled = stage === 0;
  $('#j-run').disabled = Boolean(timer);

  syncPush();
}

$('#j-step').addEventListener('click', () => { stopTimer(); go(stage + 1); });
$('#j-back').addEventListener('click', () => { stopTimer(); go(stage - 1); });
$('#j-run').addEventListener('click', runAll);
$('#j-reset').addEventListener('click', () => { stopTimer(); go(0); });

// the preview tab is driven from the controlling tab, not from its own keys
document.addEventListener('keydown', event => {
  if (PREVIEW_MODE || event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.key === 'ArrowRight') { stopTimer(); go(stage + 1); }
  if (event.key === 'ArrowLeft') { stopTimer(); go(stage - 1); }
});

registerSync({
  read: () => ({ stage }),
  write: s => { stage = s.stage; },
  render
});

render();
