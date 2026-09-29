/* Switch.java — the dial, plus what happens when you take the breaks out. */

const dayInput = $('#day');
const out = $('#s-out');
let useBreak = true;

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CASE_LINE = { 1: 5, 2: 6, 3: 7, 4: 8, 5: 9, 6: 10, 7: 11 };
const DEFAULT_LINE = 12;

function render() {
  const day = Number(dayInput.value);
  const matched = day >= 1 && day <= 7;

  $('#day-val').textContent = day;
  setVar('day', day);
  $('#s-chip').textContent = `day = ${day}`;

  /* Run the switch for real. Without break, every case body from the match
     downwards executes, so the last assignment wins. */
  const ran = [];
  let dayName;
  if (matched) {
    if (useBreak) {
      ran.push(day);
      dayName = DAYS[day - 1];
    } else {
      for (let d = day; d <= 7; d++) { ran.push(d); dayName = DAYS[d - 1]; }
      ran.push('default');
      dayName = 'Invalid day';
    }
  } else {
    ran.push('default');
    dayName = 'Invalid day';
  }

  // needle: point at the matching stop, or park it greyed out for default
  const needle = $('#s-needle');
  const line = $('line', needle);
  if (matched) {
    needle.setAttribute('transform', `rotate(${(day - 1) * (360 / 7) - 90} 180 110)`);
    line.setAttribute('stroke', 'var(--amber)');
    needle.classList.remove('is-off');
  } else {
    needle.classList.add('is-off');
  }

  $$('#s-labels text').forEach(label => {
    const d = Number(label.dataset.day);
    const isMatch = d === day;
    const isFallthrough = ran.includes(d) && !isMatch;
    label.setAttribute('fill', isMatch ? 'var(--amber)' : isFallthrough ? 'var(--no)' : 'currentColor');
    label.setAttribute('font-weight', isMatch || isFallthrough ? '600' : '400');
    label.classList.toggle('is-off', !isMatch && !isFallthrough);
  });

  $('#s-default').setAttribute('fill', ran.includes('default') ? 'var(--no)' : 'currentColor');
  $('#s-default').style.opacity = ran.includes('default') ? '1' : '0.55';

  // code highlighting
  const states = { 4: 'on', 15: 'on' };
  for (let d = 1; d <= 7; d++) {
    const ln = CASE_LINE[d];
    if (d === day && matched) states[ln] = 'on';
    else if (ran.includes(d)) states[ln] = 'on-warn';
    else states[ln] = 'off';
  }
  states[DEFAULT_LINE] = ran.includes('default') ? (matched ? 'on-warn' : 'on') : 'off';
  markCode(states);

  // show or hide the break; keywords in the listing
  $$('[data-brk]').forEach(el => {
    el.style.opacity = useBreak ? '1' : '0.2';
    el.style.textDecoration = useBreak ? 'none' : 'line-through';
  });

  $('#s-fact-case').textContent = matched ? `case ${day}` : 'default';
  $('#s-fact-assign').textContent = ran.length;

  const lines = [`The day is: ${dayName}`];
  if (!useBreak && matched) {
    lines.push('');
    lines.push(`// no break: fell through ${ran.length} case bodies,`);
    lines.push('// so the last assignment is the one that sticks.');
  }
  printOut(out, lines);
  syncPush();
}

dayInput.addEventListener('input', render);
segment($('#s-break'), value => { useBreak = value; render(); });

registerSync({
  read: () => ({ day: dayInput.value, useBreak }),
  write: s => {
    dayInput.value = s.day;
    useBreak = s.useBreak;
    setSegment($('#s-break'), useBreak);
  },
  render
});

render();
