/* Ternary.java — (marks >= passMark) ? "Pass" : "Fail" */

const marksInput = $('#marks');
const passInput = $('#passmark');
const out = $('#t-out');

function render() {
  const marks = Number(marksInput.value);
  const passMark = Number(passInput.value);
  const passed = marks >= passMark;
  const result = passed ? '"Pass"' : '"Fail"';

  $('#marks-val').textContent = marks;
  $('#passmark-val').textContent = passMark;
  setVar('marks', marks);
  setVar('passmark', passMark);

  // diagram
  $('#t-input').textContent = `marks = ${marks}`;
  $('#t-cond').textContent = `marks >= ${passMark} ?`;
  $('#t-path-true').classList.toggle('is-off', !passed);
  $('#t-label-true').classList.toggle('is-off', !passed);
  $('#t-box-pass').classList.toggle('is-off', !passed);
  $('#t-path-false').classList.toggle('is-off', passed);
  $('#t-label-false').classList.toggle('is-off', passed);
  $('#t-box-fail').classList.toggle('is-off', passed);

  // code: light up the half that is taken, strike out the half that is not
  markParts({
    true: passed ? 'on' : 'skip',
    false: passed ? 'skip' : 'on-warn'
  });

  $('#t-fact-cond').textContent = String(passed);
  $('#t-fact-result').textContent = result;

  printOut(out, `The student has: ${passed ? 'Pass' : 'Fail'}`);
  syncPush();
}

marksInput.addEventListener('input', render);
passInput.addEventListener('input', render);

registerSync({
  read: () => ({ marks: marksInput.value, passmark: passInput.value }),
  write: s => { marksInput.value = s.marks; passInput.value = s.passmark; },
  render
});

render();
