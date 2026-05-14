let puzzle = {};
let today = new Date().toISOString().slice(0,10); // YYYY-MM-DD

fetch('puzzle.json')
  .then(r => r.json())
  .then(data => {
    puzzle = data;
    document.getElementById('date').textContent = `Date: ${data.date}`;
    buildGrid(data);
    buildClues(data);
  });

function buildGrid(p) {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${p.width}, auto)`;

  p.cells.forEach((cell, idx) => {
    const div = document.createElement('div');
    div.className = 'cell';
    div.dataset.idx = idx;

    if (cell === null) { // blocked square
      div.classList.add('blocked');
      div.textContent = '';
    } else if (cell === 0) { // empty square to fill
      div.classList.add('empty');
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.maxLength = 1;
      inp.inputMode = 'uppercase';
      inp.dataset.idx = idx;
      inp.addEventListener('input', e => {
        e.target.value = e.target.value.toUpperCase();
        // store answer in a hidden attribute for later checking
        div.dataset.answer = e.target.value;
      });
      div.appendChild(inp);
    } else { // pre‑filled number (across/down clue start)
      div.classList.add('filled');
      div.textContent = cell;
    }
    grid.appendChild(div);
  });
}

function buildClues(p) {
  const cluesDiv = document.getElementById('clues');
  cluesDiv.innerHTML = '<strong>Across:</strong><ul>' +
    p.across.map(c => `<li>${c.num}. ${c.clue}</li>`).join('') +
    '</ul><strong>Down:</strong><ul>' +
    p.down.map(c => `<li>${c.num}. ${c.clue}</li>`).join('') +
    '</ul>';
}

document.getElementById('check').addEventListener('click', () => {
  let correct = true;
  const msg = document.getElementById('msg');
  puzzle.cells.forEach((cell, idx) => {
    if (cell === 0) { // only check blanks
      const div = document.querySelector(`.cell[data-idx="${idx}"]`);
      const inp = div.querySelector('input');
      const given = (inp.value || '').toUpperCase();
      const expected = puzzle.solution[idx] || '';
      if (given !== expected) {
        correct = false;
        div.style.borderColor = 'red';
      } else {
        div.style.borderColor = 'green';
      }
    }
  });
  msg.textContent = correct ? '✅ All correct!' : '❌ Some cells are wrong – check red borders.';
});