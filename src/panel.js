import { CONTENT } from './projects.js';

const root = document.querySelector('#panel');
const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function body(stop) {
  if (stop.text) {
    const specs = (stop.specs ?? []).map(([key, value]) => `<div><dt>${escape(key)}</dt><dd>${escape(value)}</dd></div>`).join('');
    return `<p class="copy">${escape(stop.text)}</p>${specs && `<dl class="specs">${specs}</dl>`}`;
  }
  const items = stop.links.map((l) => `<li><a href="${l.url}" target="_blank" rel="noopener">${escape(l.label)}<span aria-hidden="true">↗</span></a></li>`).join('');
  return `<ul class="links">${items}</ul>`;
}

export function showPanel(entry, stopIndex, onStop) {
  const project = CONTENT[entry];
  const rail = project.stops.map((stop, j) => (
    `<button type="button" data-stop="${j}" aria-pressed="${j === stopIndex}">${stop.label}</button>`
  )).join('');
  root.innerHTML = `
    <header><span>${project.code ?? `CH 0${entry + 1}`}</span><span>${escape(project.tag)}</span></header>
    <h2 class="${project.title.length > 12 ? 'long' : ''}">${escape(project.title)}</h2>
    <div class="stop">${body(project.stops[stopIndex])}</div>
    <nav class="rail" aria-label="Sections">${rail}</nav>`;
  root.querySelectorAll('[data-stop]').forEach((button) => {
    button.addEventListener('click', () => onStop(Number(button.dataset.stop)));
  });
  root.hidden = false;
}

export function hidePanel() {
  root.hidden = true;
  root.innerHTML = '';
}

// Plain page for devices or networks where the 3D console cannot load.
export function renderFallback() {
  const ordered = [CONTENT[CONTENT.length - 1], ...CONTENT.slice(0, -1)];
  const sections = ordered.map((project) => `
    <section>
      <h2>${escape(project.title)}</h2>
      <p class="tag">${escape(project.tag)}</p>
      ${project.stops.map(body).join('')}
    </section>`).join('');
  document.querySelector('#hint').hidden = true;
  const page = document.createElement('main');
  page.id = 'fallback';
  page.innerHTML = sections;
  document.body.append(page);
  document.documentElement.classList.add('plain');
}
