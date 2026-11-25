const IDLE = 9000;
const HOME_DELAY = 900;
const touch = matchMedia('(pointer: coarse)').matches;
const intro = document.querySelector('#intro');
const coach = document.querySelector('#coach');
const coachText = coach.querySelector('span');
const coachIcon = coach.querySelector('i');

const WORDS = touch
  ? {
    home: ['swipe', 'Swipe up on the mixer to slide along it'],
    card: ['card', 'Swipe the card up for more, or the mixer to move on'],
    master: ['swipe', 'Swipe up on the mixer to reach the projects'],
    next: ['swipe', 'Swipe up on the mixer for the next project'],
    end: ['home', 'That’s everything. Tap ⌂ to go back to the start'],
  }
  : {
    home: ['wheel', 'Scroll down to slide along the mixer'],
    card: ['card', 'Scroll the card for more, or the mixer to move on'],
    master: ['wheel', 'Scroll the mixer, or press →, to reach the projects'],
    next: ['wheel', 'Scroll the mixer, or press →, for the next project'],
    end: ['home', 'That’s everything. Press ⌂ to go back to the start'],
  };

let open = true;
let stage = 'home';
let key = '';
let timer = 0;
const shown = new Set();

function hide() {
  coach.classList.remove('on');
}

function show() {
  if (open || document.hidden) return;
  const [icon, text] = WORDS[stage];
  coachIcon.className = `i-${icon}`;
  coachText.textContent = text;
  coach.classList.toggle('wide', stage === 'home');
  shown.add(key);
  coach.classList.add('on');
}

function arm() {
  clearTimeout(timer);
  if (open || (shown.has(key) && stage !== 'home')) return;
  timer = setTimeout(show, stage === 'home' ? HOME_DELAY : IDLE);
}

function activity() {
  if (open) return;
  hide();
  arm();
}

// Called by the console whenever the channel or the card's section changes.
export function setStage(next, state) {
  const changed = state !== key;
  stage = next;
  key = state;
  if (changed) {
    hide();
    arm();
  }
}

export const guideOpen = () => open;

function begin() {
  if (!open) return;
  open = false;
  intro.classList.add('gone');
  intro.setAttribute('aria-hidden', 'true');
  setTimeout(() => { intro.hidden = true; }, 500);
  arm();
}

export function initGuide() {
  if (touch) {
    intro.querySelectorAll('[data-touch]').forEach((node) => { node.textContent = node.dataset.touch; });
    intro.querySelector('i.i-wheel').className = 'i-swipe';
  }
  intro.hidden = false;
  intro.addEventListener('click', begin);
  intro.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
  addEventListener('keydown', (e) => {
    if (open && (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape')) {
      e.preventDefault();
      begin();
    }
  });
  intro.querySelector('button').focus({ preventScroll: true });
  ['wheel', 'keydown', 'pointerdown', 'touchstart'].forEach((type) => {
    addEventListener(type, activity, { passive: true, capture: true });
  });
}
