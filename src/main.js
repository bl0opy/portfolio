import { renderFallback } from './panel.js';

function hasWebGL() {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
  }
}

try {
  if (!hasWebGL()) throw new Error('WebGL2 unavailable');
  await import('./app.js');
} catch (error) {
  console.warn('Showing the plain site:', error.message);
  renderFallback();
}
