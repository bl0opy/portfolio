import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { createConsole } from './console.js';

await Promise.all(['800 100px Archivo', '500 30px "Geist Mono"', '76px "Permanent Marker"'].map((f) => document.fonts.load(f)));

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.shadowMap.autoUpdate = false;
renderer.shadowMap.needsUpdate = true;
document.body.prepend(renderer.domElement);

const pointer = new THREE.Vector2();
const eased = new THREE.Vector2();
const clock = new THREE.Clock();
const ndc = new THREE.Vector2();
let quality = Math.min(devicePixelRatio, 1.5);
let frames = 0;
let sampleStart = 0;

const mixer = createConsole();
mixer.scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.03).texture;
mixer.scene.environmentIntensity = mixer.environment;

const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { samples: 4, type: THREE.HalfFloatType }));
composer.addPass(new RenderPass(mixer.scene, mixer.camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), ...mixer.bloom));
composer.addPass(new OutputPass());

function fit(width = innerWidth, height = innerHeight, ratio = quality) {
  renderer.setPixelRatio(ratio);
  renderer.setSize(width, height, width === innerWidth && height === innerHeight);
  mixer.camera.aspect = width / height;
  mixer.camera.updateProjectionMatrix();
  mixer.layout(mixer.camera.aspect);
  composer.setPixelRatio(ratio);
  composer.setSize(width, height);
}

function frame(t) {
  eased.lerp(pointer, 0.05);
  mixer.camera.position.copy(mixer.base);
  mixer.camera.position.x += eased.x * mixer.parallax;
  mixer.camera.position.y += eased.y * mixer.parallax * 0.5;
  mixer.camera.lookAt(mixer.target);
  mixer.tick(t);
  if (mixer.shadowsDirty) {
    renderer.shadowMap.needsUpdate = true;
    mixer.shadowsDirty = false;
  }
  composer.render();
}

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

// Renders one frame at a fixed size and posts it to tools/dev_server.py.
window.capture = async ({ name, entry = null, stop = 0, width = 1440, height = 900 }) => {
  fit(width, height, 2);
  pointer.set(0, 0);
  eased.set(0, 0);
  if (entry !== null) mixer.goTo(entry, stop);
  mixer.snap();
  for (let i = 0; i < 40; i++) frame(i * 0.016);
  const blob = await new Promise((resolve) => renderer.domElement.toBlob(resolve, 'image/jpeg', 0.92));
  const response = await fetch(`/${name}.jpg`, { method: 'POST', body: blob });
  fit();
  return { name, bytes: blob.size, status: response.status };
};

function dispatch(type, e) {
  const box = renderer.domElement.getBoundingClientRect();
  ndc.set(((e.clientX - box.left) / box.width) * 2 - 1, 1 - ((e.clientY - box.top) / box.height) * 2);
  const cursor = mixer.onPointer(type, e, ndc);
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
  mixer.onWheel(e.deltaY);
}, { passive: false });
addEventListener('keydown', (e) => mixer.onKey(e.key));
addEventListener('resize', () => fit());
addEventListener('pointermove', (e) => {
  pointer.set((e.clientX / innerWidth) * 2 - 1, 1 - (e.clientY / innerHeight) * 2);
});

fit();
renderer.setAnimationLoop((now) => {
  frame(clock.getElapsedTime());
  adapt(now);
});
window.ready = true;
