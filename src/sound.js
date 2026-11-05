const BEAT_URL = 'assets/audio/track.dat';
const BEAT_KEY = 'q7Vd2xKpR9mZt4LcWb8YhN3sFe6JuGa1';
const BEAT_LENGTH = 108;
const BEAT_LEVEL = 0.18;
const BEAT_FADE = 1.2;
const EFFECTS_LEVEL = 0.55;
const button = document.querySelector('#sound');

let context = null;
let output = null;
let beatGain = null;
let noise = null;
let muted = false;

try {
  muted = localStorage.getItem('sound') === 'off';
} catch {
  muted = false;
}

const vary = (value) => value * (0.94 + Math.random() * 0.12);

function burst({ length, level, frequency, q = 1, delay = 0 }) {
  const start = context.currentTime + delay;
  const source = context.createBufferSource();
  source.buffer = noise;
  const filter = context.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = vary(frequency);
  filter.Q.value = q;
  const gain = context.createGain();
  gain.gain.setValueAtTime(level, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  source.connect(filter).connect(gain).connect(output);
  source.start(start, Math.random() * 0.5, length);
}

function tone({ type = 'sine', from, to = from, length, level, delay = 0 }) {
  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(vary(from), start);
  oscillator.frequency.exponentialRampToValueAtTime(to, start + length);
  const gain = context.createGain();
  gain.gain.setValueAtTime(level, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  oscillator.connect(gain).connect(output);
  oscillator.start(start);
  oscillator.stop(start + length);
}

const playable = () => context?.state === 'running' && !muted;

export function plugOut() {
  if (!playable()) return;
  burst({ length: 0.018, level: 0.2, frequency: 2400 });
  tone({ from: 240, to: 110, length: 0.05, level: 0.1 });
}

export function plugIn() {
  if (!playable()) return;
  burst({ length: 0.014, level: 0.26, frequency: 3200 });
  burst({ length: 0.008, level: 0.16, frequency: 5200, q: 2, delay: 0.016 });
  tone({ from: 150, to: 55, length: 0.1, level: 0.26 });
  tone({ type: 'triangle', from: 60, length: 0.2, level: 0.03, delay: 0.02 });
}

export function knobClick() {
  if (!playable()) return;
  burst({ length: 0.007, level: 0.26, frequency: 4200, q: 2 });
  tone({ from: 900, to: 480, length: 0.009, level: 0.06 });
}

export function faderTick() {
  if (!playable()) return;
  burst({ length: 0.01, level: 0.12, frequency: 1800 });
}

function fadeBeat() {
  beatGain.gain.setTargetAtTime(muted ? 0 : BEAT_LEVEL, context.currentTime, BEAT_FADE / 3);
}

// Decoded rather than streamed, because an audio element leaves a gap at the loop point.
async function loadBeat() {
  const response = await fetch(BEAT_URL);
  if (!response.ok) return;
  const bytes = new Uint8Array(await response.arrayBuffer());
  for (let i = 0; i < bytes.length; i++) bytes[i] ^= BEAT_KEY.charCodeAt(i % BEAT_KEY.length);
  const source = context.createBufferSource();
  source.buffer = await context.decodeAudioData(bytes.buffer);
  source.loop = true;
  source.loopEnd = Math.min(BEAT_LENGTH, source.buffer.duration);
  source.connect(beatGain);
  source.start();
}

function start() {
  if (context) return;
  context = new AudioContext();
  output = context.createGain();
  output.gain.value = EFFECTS_LEVEL;
  output.connect(context.destination);
  noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
  const samples = noise.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  beatGain = context.createGain();
  beatGain.gain.value = 0;
  beatGain.connect(context.destination);
  loadBeat().catch(() => {});
  context.addEventListener('statechange', show);
}

function show() {
  const on = playable();
  const label = on ? 'Sound on' : 'Sound off';
  button.setAttribute('aria-pressed', String(on));
  button.setAttribute('aria-label', label);
  button.title = label;
}

function apply() {
  if (!context) return;
  context.resume().then(() => {
    fadeBeat();
    show();
  });
}

function unlock(e) {
  if (muted || e.target === button) return;
  start();
  apply();
  ['pointerdown', 'pointerup', 'keydown'].forEach((type) => removeEventListener(type, unlock));
}

export function initSound() {
  ['pointerdown', 'pointerup', 'keydown'].forEach((type) => addEventListener(type, unlock));
  button.addEventListener('click', () => {
    muted = playable();
    try {
      localStorage.setItem('sound', muted ? 'off' : 'on');
    } catch {
      // Nothing to do when storage is blocked: the choice lasts for this visit.
    }
    if (!muted) start();
    apply();
    show();
  });
  document.addEventListener('visibilitychange', () => {
    if (!context || muted) return;
    if (document.hidden) context.suspend();
    else apply();
  });
  show();
  button.hidden = false;
}
