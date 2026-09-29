/* GradeChecker.java — the chain stops at the first test that comes back true. */

const marksInput = $('#marks');
const out = $('#g-out');

const STEPS = [
  { min: 90, grade: 'Grade A', line: 4 },
  { min: 75, grade: 'Grade B', line: 6 },
  { min: 60, grade: 'Grade C', line: 8 }
];
const FALLBACK = { grade: 'Needs improvement', line: 10 };

function render() {
  const marks = Number(marksInput.value);
  $('#marks-val').textContent = marks;
  setVar('marks', marks);
  $('#g-input').textContent = `marks = ${marks}`;

  // walk the chain exactly the way Java does, and stop when one matches
  let matched = -1;
  let checks = 0;
  for (let i = 0; i < STEPS.length; i++) {
    checks++;
    if (marks >= STEPS[i].min) { matched = i; break; }
  }
  const hit = matched === -1 ? FALLBACK : STEPS[matched];

  // diagram
  STEPS.forEach((step, i) => {
    const group = $(`#g-step-${i}`);
    const rect = $('rect', group);
    const note = $(`#g-mark-${i}`);
    const reached = i < checks;

    group.classList.toggle('is-off', !reached);

    if (i === matched) {
      rect.setAttribute('fill', 'var(--yes-soft)');
      rect.setAttribute('stroke', 'var(--yes)');
      note.textContent = 'yes — stop';
      note.setAttribute('fill', 'var(--yes)');
    } else {
      rect.setAttribute('fill', 'var(--surface)');
      rect.setAttribute('stroke', 'var(--line)');
      note.textContent = reached ? 'no' : '';
      note.setAttribute('fill', 'var(--no)');
    }
  });

  const elseGroup = $('#g-step-3');
  const elseRect = $('rect', elseGroup);
  elseGroup.classList.toggle('is-off', matched !== -1);
  elseRect.setAttribute('fill', matched === -1 ? 'var(--yes-soft)' : 'var(--surface)');
  elseRect.setAttribute('stroke', matched === -1 ? 'var(--yes)' : 'var(--line)');

  // code: faded = checked and false, struck through = never reached
  const states = {};
  const testLines = [3, 5, 7];
  testLines.forEach((line, i) => {
    if (i < checks) states[line] = i === matched ? 'on' : 'off';
    else states[line] = 'skip';
  });
  [4, 6, 8].forEach((line, i) => { states[line] = i === matched ? 'on' : 'skip'; });
  states[9] = matched === -1 ? 'on' : 'off';
  states[10] = matched === -1 ? 'on' : 'skip';
  markCode(states);

  $('#g-fact-grade').textContent = hit.grade.replace('Grade ', '');
  $('#g-fact-checks').textContent = checks;

  printOut(out, hit.grade);
  syncPush();
}

marksInput.addEventListener('input', render);

registerSync({
  read: () => ({ marks: marksInput.value }),
  write: s => { marksInput.value = s.marks; },
  render
});

render();
