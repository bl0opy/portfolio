import { CONTENT } from './projects.js';

const root = document.querySelector('#panel');

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function body(stop) {
  if (stop.text) {
    const specs = (stop.specs ?? []).map(([key, value]) => `<div><dt>${escape(key)}</dt><dd>${escape(value)}</dd></div>`).join('');
    return `<p class="copy">${escape(stop.text)}</p>${specs && `<dl class="specs">${specs}</dl>`}`;
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
