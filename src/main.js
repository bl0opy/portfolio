import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { SCENES as OBJECTS } from './scenes.js';
import { MIXERS } from './console.js';

const SCENES = { ...MIXERS, ...OBJECTS };

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
document.body.prepend(renderer.domElement);

const environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.03).texture;
const pointer = new THREE.Vector2();
const eased = new THREE.Vector2();
const clock = new THREE.Clock();
let current = null;
let composer = null;
let name = null;
let bokeh = null;
let quality = Math.min(devicePixelRatio, 1.5);
let frames = 0;
let sampleStart = 0;

function fit(width = innerWidth, height = innerHeight, ratio = quality) {
  renderer.setPixelRatio(ratio);
  renderer.setSize(width, height, width === innerWidth && height === innerHeight);
  if (!current) return;
  current.camera.aspect = width / height;
  current.camera.updateProjectionMatrix();
  composer.setPixelRatio(ratio);
  composer.setSize(width, height);
}

function show(next) {
  current?.leave?.();
  bokeh = null;
  name = next;
  current = SCENES[next]();
  current.scene.environment = environment;
  current.scene.environmentIntensity = current.environment;
  renderer.shadowMap.autoUpdate = !current.staticShadows;
  renderer.shadowMap.needsUpdate = true;
  const target = new THREE.WebGLRenderTarget(1, 1, { samples: 4, type: THREE.HalfFloatType });
  composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(current.scene, current.camera));
  if (current.focus) {
    const [aperture, maxblur] = current.focus;
    const focus = current.camera.position.distanceTo(current.target);
    bokeh = new BokehPass(current.scene, current.camera, { focus, aperture, maxblur });
    composer.addPass(bokeh);
  }
  const [strength, radius, threshold] = current.bloom;
  if (strength > 0) composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), strength, radius, threshold));
  composer.addPass(new OutputPass());
  fit();
  document.querySelectorAll('#bar button').forEach((b) => b.setAttribute('aria-pressed', b.textContent === next));
  history.replaceState(null, '', `?scene=${next}`);
}

function frame(t) {
  eased.lerp(pointer, 0.05);
  current.camera.position.copy(current.base);
  current.camera.position.x += eased.x * current.parallax;
  current.camera.position.y += eased.y * current.parallax * 0.5;
  current.camera.lookAt(current.target);
  current.tick(t, eased);
  if (current.shadowsDirty) {
    renderer.shadowMap.needsUpdate = true;
    current.shadowsDirty = false;
  }
  if (bokeh && current.dof) {
    bokeh.uniforms.focus.value = current.dof.focus;
    bokeh.uniforms.maxblur.value = current.dof.maxblur;
  }
  composer.render();
}

// Renders one frame at a fixed size and posts it to tools/dev_server.py.
window.capture = async (scene, { name: file = scene, channel = null, stop = 0, width = 1440, height = 900 } = {}) => {
  show(scene);
  fit(width, height, 2);
  pointer.set(0, 0);
  eased.set(0, 0);
  if (channel !== null) current.goTo?.(channel, stop);
  current.snap?.();
  renderer.shadowMap.needsUpdate = true;
  for (let i = 0; i < 40; i++) frame(i * 0.016);
  const blob = await new Promise((resolve) => renderer.domElement.toBlob(resolve, 'image/jpeg', 0.92));
  const response = await fetch(`/${file}.jpg`, { method: 'POST', body: blob });
  fit();
  return { file, bytes: blob.size, status: response.status };
};

// Average GPU-synced frame time in ms, independent of requestAnimationFrame throttling.
window.bench = (count = 20) => {
  const gl = renderer.getContext();
  const pixel = new Uint8Array(4);
  const start = performance.now();
  for (let i = 0; i < count; i++) {
    frame(clock.getElapsedTime());
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  }
  return { ms: +((performance.now() - start) / count).toFixed(1), ratio: renderer.getPixelRatio() };
};

const ndc = new THREE.Vector2();
function dispatch(type, e) {
  const box = renderer.domElement.getBoundingClientRect();
  ndc.set(((e.clientX - box.left) / box.width) * 2 - 1, 1 - ((e.clientY - box.top) / box.height) * 2);
  const cursor = current?.onPointer?.(type, e, ndc);
  if (cursor !== undefined) renderer.domElement.style.cursor = cursor;
}
['pointerdown', 'pointermove', 'pointerup', 'pointercancel'].forEach((type) => {
  renderer.domElement.addEventListener(type, (e) => {
    if (type === 'pointerdown') renderer.domElement.setPointerCapture(e.pointerId);
    dispatch(type, e);
  });
});
renderer.domElement.addEventListener('wheel', (e) => {
  e.preventDefault();
  current?.onWheel?.(e.deltaY);
}, { passive: false });
addEventListener('keydown', (e) => current?.onKey?.(e.key));

addEventListener('resize', () => fit());
addEventListener('pointermove', (e) => {
  pointer.set((e.clientX / innerWidth) * 2 - 1, 1 - (e.clientY / innerHeight) * 2);
});

await Promise.all(['600 100px "Inter Tight"', '800 100px Archivo', '500 40px "Cormorant Garamond"', '500 30px "Geist Mono"', '76px "Permanent Marker"'].map((f) => document.fonts.load(f)));

const bar = document.querySelector('#bar');
Object.keys(SCENES).forEach((key) => {
  const button = document.createElement('button');
  button.textContent = key;
  button.addEventListener('click', () => show(key));
  bar.append(button);
});

const requested = new URLSearchParams(location.search).get('scene');
show(requested in SCENES ? requested : 'vintage');
function adapt(now) {
  frames += 1;
  if (now - sampleStart < 2000) return;
  const fps = (frames * 1000) / (now - sampleStart);
  frames = 0;
  sampleStart = now;
  if (fps < 40 && quality > 1) {
    quality = Math.max(1, quality - 0.25);
    fit();
  }
}

renderer.setAnimationLoop((now) => {
  frame(clock.getElapsedTime());
  adapt(now);
});
window.ready = true;
