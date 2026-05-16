let puzzle = {};
let today = new Date().toISOString().slice(0,10); // YYYY-MM-DD

fetch('puzzle.json')
  .then(r => r.json())
  .then(data => {
    console.log('Puzzle loaded:', data);
    puzzle = data;
    document.getElementById('date').textContent = `Date: ${data.date}`;
    buildGrid(data);
    buildClues(data);
  })
  .catch(err => {
    console.error('Failed to load puzzle.json', err);
    document.getElementById('date').textContent = 'Error loading puzzle';
  });

function buildGrid(p) {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  // Set explicit column and row tracks based on cell size
  const cellSize = '2.2rem'; // must match .cell width/height
  grid.style.gridTemplateColumns = `repeat(${p.width}, ${cellSize})`;
  grid.style.gridTemplateRows = `repeat(${p.height}, ${cellSize})`;

  p.cells.forEach((cell, idx) => {
    console.log(`Processing cell idx=${idx}, value=${cell}`);
    const div = document.createElement('div');
    div.className = 'cell';
    div.dataset.idx = idx;
    div.style.position = 'relative';

    if (cell === null) { // blocked square
      div.classList.add('blocked');
      div.innerHTML = '&nbsp;';
    } else { // editable square (may have a clue number)
      div.classList.add('editable');
      // Clue number span if needed
      if (cell > 0) {
        const numSpan = document.createElement('span');
        numSpan.textContent = cell;
        numSpan.style.position = 'absolute';
        numSpan.style.top = '2px';
        numSpan.style.left = '2px';
        numSpan.style.fontSize = '0.7em';
        numSpan.style.color = '#555';
        // Ensure it's above the input
        numSpan.style.zIndex = '2';
        div.appendChild(numSpan);
      }
      // Input field
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.maxLength = 1;
      inp.inputMode = 'uppercase';
      inp.dataset.idx = idx;
      inp.style.position = 'absolute';
      inp.style.top = '0';
      inp.style.left = '0';
      inp.style.right = '0';
      inp.style.bottom = '0';
      inp.style.border = '1px solid #999';
      inp.style.borderRadius = '2px';
      inp.style.background = 'transparent'; // important: see the number underneath
      inp.style.fontSize = '1.2rem';
      inp.style.textAlign = 'center';
      inp.style.textTransform = 'uppercase';
      inp.style.outline = 'none';
      inp.style.boxSizing = 'border-box';
      inp.style.padding = '0';
      // Input should be below number
      inp.style.zIndex = '1';
      inp.addEventListener('input', e => {
        e.target.value = e.target.value.toUpperCase();
        div.dataset.answer = e.target.value;
      });
      div.appendChild(inp);
    }
    grid.appendChild(div);
  });
  // Debug: show number of inputs created
  setTimeout(() => {
    const inputs = document.querySelectorAll('#grid input');
    console.log(`Total inputs found: ${inputs.length}`);
    inputs.forEach((inp, i) => {
      console.log(`Input ${i}: idx=${inp.dataset.idx}, value='${inp.value}'`);
    });
  }, 100);
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
    if (cell !== null) { // only check editable squares (0 or >0)
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