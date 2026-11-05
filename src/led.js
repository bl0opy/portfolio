import { CONTENT, IDENTITY, MASTER } from './projects.js';

const CELL = 5;
const COLS = 200;
const ROWS = 142;
const LEFT = 8;
const UNLIT = 0;
const DIM = 1;
const BRIGHT = 2;
const COLORS = ['#0d0702', '#c07c0a', '#ffb000'];

// 5x7 glyphs: one byte per column, lowest bit at the top.
const FONT = {
  A: '7c1211127c', B: '7f49494936', C: '3e41414122', D: '7f4141221c', E: '7f49494941', F: '7f09090901',
  G: '3e4149497a', H: '7f0808087f', I: '00417f4100', J: '2040413f01', K: '7f08142241', L: '7f40404040',
  M: '7f020c027f', N: '7f0408107f', O: '3e4141413e', P: '7f09090906', Q: '3e4151215e', R: '7f09192946',
  S: '4649494931', T: '01017f0101', U: '3f4040403f', V: '1f2040201f', W: '3f4038403f', X: '6314081463',
  Y: '0708700807', Z: '6151494543', 0: '3e5149453e', 1: '00427f4000', 2: '4261514946', 3: '2141454b31',
  4: '1814127f10', 5: '2745454539', 6: '3c4a494930', 7: '0171090503', 8: '3649494936', 9: '064949291e',
  '.': '0060600000', ',': '0050300000', "'": '0005030000', '-': '0808080808', '+': '08083e0808',
  '/': '2010080402', ':': '0036360000',
};

function createDots() {
  const dots = new Uint8Array(COLS * ROWS);
  const set = (x, y, level) => {
    if (x >= 0 && x < COLS && y >= 0 && y < ROWS) dots[y * COLS + x] = level;
  };
  const rule = (y) => {
    for (let x = LEFT; x < COLS - LEFT; x += 2) set(x, y, DIM);
  };
  const text = (value, x, y, level, scale = 1) => {
    [...value.toUpperCase()].forEach((char, i) => {
      const glyph = FONT[char];
      if (!glyph) return;
      for (let col = 0; col < 5; col++) {
        const bits = parseInt(glyph.slice(col * 2, col * 2 + 2), 16);
        for (let row = 0; row < 7; row++) {
          if (!(bits & (1 << row))) continue;
          for (let dx = 0; dx < scale; dx++) {
            for (let dy = 0; dy < scale; dy++) set(x + (i * 6 + col) * scale + dx, y + row * scale + dy, level);
          }
        }
      }
    });
  };
  return { dots, rule, text, set };
}

function stopRow({ text, set }, entry, stopIndex, y) {
  let x = LEFT;
  entry.stops.forEach(({ label }, i) => {
    const width = label.length * 6 - 1;
    if (i === stopIndex) {
      for (let dx = -2; dx < width + 2; dx++) {
        for (let dy = -2; dy < 9; dy++) set(x + dx, y + dy, BRIGHT);
      }
      text(label, x, y, UNLIT);
    } else {
      text(label, x, y, DIM);
    }
    x += width + 10;
  });
}

function identity(screen) {
  const [first, ...rest] = CONTENT[MASTER].title.split(' ');
  screen.text(first, LEFT, 12, BRIGHT, 2);
  screen.text(rest.join(' '), LEFT, 32, BRIGHT, 2);
  screen.rule(54);
  IDENTITY.forEach((line, i) => screen.text(line, LEFT, 64 + i * 14, i === 0 ? BRIGHT : DIM));
  screen.rule(112);
}

function channel(screen, entry, index, stopIndex) {
  screen.text(`PROJECT 0${index + 1}`, LEFT, 12, DIM);
  const count = `${stopIndex + 1}/${entry.stops.length}`;
  screen.text(count, COLS - LEFT - count.length * 6 + 1, 12, DIM);
  screen.text(entry.title, LEFT, 28, BRIGHT, 2);
  screen.text(entry.tag, LEFT, 50, DIM);
  screen.rule(66);
  screen.text(entry.stops[stopIndex].label, LEFT, 80, BRIGHT, 2);
  screen.rule(112);
}

export function drawDisplay(ctx, index, stopIndex) {
  const screen = createDots();
  const entry = CONTENT[index];
  if (entry && index !== MASTER) channel(screen, entry, index, stopIndex);
  else identity(screen);
  if (entry) stopRow(screen, entry, stopIndex, 124);
  else screen.text('SCROLL TO START', LEFT, 124, DIM);

  ctx.fillStyle = '#060402';
  ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
  COLORS.forEach((color, level) => {
    ctx.fillStyle = color;
    screen.dots.forEach((value, i) => {
      if (value === level) ctx.fillRect((i % COLS) * CELL, Math.floor(i / COLS) * CELL, CELL - 1, CELL - 1);
    });
  });
}
