/* IsRaining.java — one boolean, two blocks, exactly one runs. */

const out = $('#r-out');
let isRaining = true;

function render() {
  setVar('isRaining', String(isRaining));
  $('#r-input').textContent = `isRaining = ${isRaining}`;

  // diagram: light the door that opens, dim the other
  $('#r-door-if').classList.toggle('is-off', !isRaining);
  $('#r-door-else').classList.toggle('is-off', isRaining);
  $('#r-dot-if').style.display = isRaining ? '' : 'none';
  $('#r-dot-else').style.display = isRaining ? 'none' : '';

  // the dashed outline follows whichever door is shut
  $('#r-door-if rect').setAttribute('stroke-dasharray', isRaining ? 'none' : '5 4');
  $('#r-door-else rect').setAttribute('stroke-dasharray', isRaining ? '5 4' : 'none');
  $('#r-door-if rect').setAttribute('fill', isRaining ? 'var(--yes-soft)' : 'var(--surface)');
  $('#r-door-else rect').setAttribute('fill', isRaining ? 'var(--surface)' : 'var(--yes-soft)');
  $('#r-door-if rect').setAttribute('stroke', isRaining ? 'var(--yes)' : 'var(--dim)');
  $('#r-door-else rect').setAttribute('stroke', isRaining ? 'var(--dim)' : 'var(--yes)');

  markCode({
    3: 'on',
    4: isRaining ? 'on' : 'skip',
    5: 'on',
    6: isRaining ? 'skip' : 'on'
  });

  $('#r-fact').textContent = isRaining ? 'if' : 'else';

  printOut(out, isRaining
    ? "It's raining. Don't forget your umbrella!"
    : "It's not raining. Enjoy your day!");
  syncPush();
}

segment($('#r-toggle'), value => { isRaining = value; render(); });

registerSync({
  read: () => ({ isRaining }),
  write: s => { isRaining = s.isRaining; setSegment($('#r-toggle'), isRaining); },
  render
});

render();
