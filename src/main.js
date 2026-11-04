import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SCENES } from './scenes.js';

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

function fit(width = innerWidth, height = innerHeight, ratio = Math.min(devicePixelRatio, 2)) {
  renderer.setPixelRatio(ratio);
  renderer.setSize(width, height, width === innerWidth && height === innerHeight);
  if (!current) return;
  current.camera.aspect = width / height;
  current.camera.updateProjectionMatrix();
  composer.setPixelRatio(ratio);
  composer.setSize(width, height);
}

function show(next) {
  name = next;
  current = SCENES[next]();
  current.scene.environment = environment;
  current.scene.environmentIntensity = current.environment;
  const target = new THREE.WebGLRenderTarget(1, 1, { samples: 4, type: THREE.HalfFloatType });
  composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(current.scene, current.camera));
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
  composer.render();
}

// Renders one frame at a fixed size and posts it to tools/dev_server.py.
window.capture = async (scene, width = 1440, height = 900) => {
  show(scene);
  fit(width, height, 2);
  pointer.set(0, 0);
  eased.set(0, 0);
  for (let i = 0; i < 40; i++) frame(i * 0.016);
  const blob = await new Promise((resolve) => renderer.domElement.toBlob(resolve, 'image/jpeg', 0.92));
  const response = await fetch(`/${scene}.jpg`, { method: 'POST', body: blob });
  fit();
  return { scene, bytes: blob.size, status: response.status };
};

addEventListener('resize', () => fit());
addEventListener('pointermove', (e) => {
  pointer.set((e.clientX / innerWidth) * 2 - 1, 1 - (e.clientY / innerHeight) * 2);
});

await Promise.all(['600 100px "Inter Tight"', '800 100px Archivo', '500 40px "Cormorant Garamond"', '500 30px "Geist Mono"'].map((f) => document.fonts.load(f)));

const bar = document.querySelector('#bar');
Object.keys(SCENES).forEach((key) => {
  const button = document.createElement('button');
  button.textContent = key;
  button.addEventListener('click', () => show(key));
  bar.append(button);
});

show(new URLSearchParams(location.search).get('scene') in SCENES ? new URLSearchParams(location.search).get('scene') : 'sage');
renderer.setAnimationLoop(() => frame(clock.getElapsedTime()));
window.ready = true;
