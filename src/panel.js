import { CONTENT } from './projects.js';

const root = document.querySelector('#panel');

function body(stop) {
  if (stop.text) return `<p class="copy">${stop.text}</p>`;
  if (stop.images) {
    const items = stop.images.map((i) => `<img src="${i.src}" alt="${i.alt}">`).join('');
    return `<div class="gallery" data-count="${stop.images.length}">${items}</div>`;
  }
  const items = stop.links.map((l) => `<li><a href="${l.url}" target="_blank" rel="noopener">${l.label}<span aria-hidden="true">↗</span></a></li>`).join('');
  return `<ul class="links">${items}</ul>`;
}

export function showPanel(channel, stopIndex, onStop) {
  const project = CONTENT[channel];
  const rail = project.stops.map((stop, j) => (
    `<button type="button" data-stop="${j}" aria-pressed="${j === stopIndex}">${stop.label}</button>`
  )).reverse().join('');
  root.innerHTML = `
    <header><span>CH 0${channel + 1}</span><span>${project.tag}</span></header>
    <h2>${project.title}</h2>
    <div class="stop">${body(project.stops[stopIndex])}</div>
    <nav class="rail" aria-label="Fader stops">${rail}</nav>`;
  root.querySelectorAll('[data-stop]').forEach((button) => {
    button.addEventListener('click', () => onStop(Number(button.dataset.stop)));
  });
  root.hidden = false;
}

export function hidePanel() {
  root.hidden = true;
  root.innerHTML = '';
}

export function themePanel(ui) {
  Object.entries(ui).forEach(([key, value]) => root.style.setProperty(`--${key}`, value));
}
