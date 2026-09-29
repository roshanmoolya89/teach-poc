/* CombineConditions.java — the two gates are independent, so they render
   independently. Both show short-circuit evaluation. */

const ageInput = $('#age');
const diceInput = $('#dice');
const outAnd = $('#l-out-and');
const outOr = $('#l-out-or');
let hasLicense = true;

/* Paint one input pill: green for true, red for false, ghosted when Java
   never got around to reading it. */
function paintPill(id, state, label) {
  const group = $(`#${id}`);
  const rect = $('rect', group);
  const text = $(`#${id}-t`);
  text.textContent = label;

  if (state === 'unread') {
    rect.setAttribute('fill', 'var(--surface)');
    rect.setAttribute('stroke', 'var(--dim)');
    rect.setAttribute('stroke-dasharray', '4 3');
    text.setAttribute('fill', 'var(--dim)');
    group.classList.add('is-off');
  } else {
    const on = state === true;
    rect.setAttribute('fill', on ? 'var(--yes-soft)' : 'var(--no-soft)');
    rect.setAttribute('stroke', on ? 'var(--yes)' : 'var(--no)');
    rect.setAttribute('stroke-dasharray', 'none');
    text.setAttribute('fill', on ? 'var(--yes)' : 'var(--no)');
    group.classList.remove('is-off');
  }
}

function paintOut(id, wireId, on, lines) {
  const rect = $(`#${id} rect`);
  const colour = on ? 'var(--yes)' : 'var(--no)';
  rect.setAttribute('fill', on ? 'var(--yes-soft)' : 'var(--no-soft)');
  rect.setAttribute('stroke', colour);
  $(`#${wireId}`).setAttribute('stroke', colour);
  lines.forEach(([textId, value]) => {
    const el = $(`#${textId}`);
    el.textContent = value;
    el.setAttribute('fill', colour);
  });
}

function shortCircuitChip(id, readBoth) {
  const chip = $(`#${id}`);
  chip.textContent = readBoth ? 'both sides read' : 'short-circuited — right side unread';
  chip.style.color = readBoth ? '' : 'var(--amber)';
}

function render() {
  const age = Number(ageInput.value);
  const dice = Number(diceInput.value);

  $('#age-val').textContent = age;
  $('#dice-val').textContent = dice;
  setVar('age', age);
  setVar('dice', dice);
  setVar('license', String(hasLicense));

  // --- the && gate ---------------------------------------------------
  const ageOk = age >= 18;
  const andReadsSecond = ageOk;            // a false left side settles it
  const canDrive = ageOk && hasLicense;

  paintPill('a-in-0', ageOk, 'age >= 18');
  paintPill('a-in-1', andReadsSecond ? hasLicense : 'unread', 'hasLicense');
  paintOut('a-out', 'a-wire', canDrive, [
    ['a-out-t', canDrive ? '"You can drive."' : '"You cannot drive."']
  ]);

  // --- the || gate ---------------------------------------------------
  const isEven = dice % 2 === 0;
  const orReadsSecond = !isEven;           // a true left side settles it
  const isOne = dice === 1;
  const evenOrOne = isEven || isOne;

  paintPill('o-in-0', isEven, `${dice} % 2 == 0`);
  paintPill('o-in-1', orReadsSecond ? isOne : 'unread', `${dice} == 1`);
  paintOut('o-out', 'o-wire', evenOrOne, evenOrOne
    ? [['o-out-t1', 'even number,'], ['o-out-t2', 'or a one']]
    : [['o-out-t1', 'odd number,'], ['o-out-t2', 'greater than one']]);

  // --- code ------------------------------------------------------------
  markCode({
    a4: 'on',
    a5: canDrive ? 'on' : 'skip',
    a6: canDrive ? 'off' : 'on',
    a7: canDrive ? 'skip' : 'on',
    o3: 'on',
    o4: evenOrOne ? 'on' : 'skip',
    o5: evenOrOne ? 'off' : 'on',
    o6: evenOrOne ? 'skip' : 'on'
  });

  markParts({
    a0: ageOk ? 'on' : 'on-warn',
    a1: andReadsSecond ? (hasLicense ? 'on' : 'on-warn') : 'skip',
    o0: isEven ? 'on' : 'on-warn',
    o1: orReadsSecond ? (isOne ? 'on' : 'on-warn') : 'skip'
  });

  // --- readouts --------------------------------------------------------
  $('#l-fact-and').textContent = String(canDrive);
  $('#l-fact-or').textContent = String(evenOrOne);
  shortCircuitChip('l-fact-and-short', andReadsSecond);
  shortCircuitChip('l-fact-or-short', orReadsSecond);

  printOut(outAnd, canDrive ? 'You can drive.' : 'You cannot drive.');
  printOut(outOr, evenOrOne
    ? 'You rolled an even number or a one.'
    : 'You rolled an odd number greater than one.');

  syncPush();
}

ageInput.addEventListener('input', render);
diceInput.addEventListener('input', render);
segment($('#l-license'), value => { hasLicense = value; render(); });

registerSync({
  read: () => ({ age: ageInput.value, dice: diceInput.value, hasLicense }),
  write: s => {
    ageInput.value = s.age;
    diceInput.value = s.dice;
    hasLicense = s.hasLicense;
    setSegment($('#l-license'), hasLicense);
  },
  render
});

render();
