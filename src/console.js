import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {
  PROJECTS, satin, metal, mesh, at, slab, cable, plug, jack, softLights,
} from './kit.js';
import {
  ORANGE, W, D, STRIP, ACTIVE, LADDER, stripX, level, FINISHES, panelTexture, grainTexture, woodTexture,
  tapeStrip, knob, faderCap, meterColor, drawDisplay, vuFace,
} from './mixer.js';
import { CONTENT } from './projects.js';
import { showPanel, hidePanel, themePanel } from './panel.js';

const FADER_BOTTOM = 3.65;
const FADER_TRAVEL = 3.3;
const STEP_COOLDOWN = 450;
const VU_SWING = Math.PI * 0.24;
const stillMotion = matchMedia('(prefers-reduced-motion: reduce)');

function meterSignal(t, i, base, drive) {
  const beat = (t * 2.2 + i * 0.37) % 1;
  const wobble = 0.5 + 0.5 * Math.sin(t * 7.3 + i) * Math.sin(t * 3.1 + i * 2);
  return Math.min(1, (0.25 + 0.75 * base * drive) * (0.3 + 0.75 * Math.exp(-beat * 4) + 0.35 * wobble));
}
const hint = () => document.querySelector('#hint');
const stopValue = (channel, stop) => stop / (CONTENT[channel].stops.length - 1);
const nearestStop = (channel, value) => Math.round(value * (CONTENT[channel].stops.length - 1));

function patchPoints(x, lift) {
  return [
    [-7.25, 0.9, 3], [-7.1, 1.25, 3.2], [-5.7, 0.5, 3.5], [(x - 7.25) / 2 + 0.2, 0.75 + lift * 0.4, 0.9],
    [(x - 1.5) * 0.8, 1.45 + lift * 0.7, -3], [x - 0.05, 1.45 + lift, -4.8], [x, 0.9 + lift, -4.85],
  ];
}

function proxy(geometry, x, y, z, data) {
  const m = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
  m.position.set(x, y, z);
  m.userData = data;
  return m;
}

function console3d(f) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(f.background);
  scene.fog = new THREE.Fog(f.background, 30, 75);
  const camera = new THREE.PerspectiveCamera(f.camera[0], 1.6, 0.1, 200);
  camera.position.set(...f.camera[1]);
  camera.lookAt(...f.camera[2]);

  const tableMap = f.tablePlain ? null : woodTexture(f.table);
  if (tableMap) tableMap.repeat.set(5, 5);
  const table = mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({
    map: tableMap, color: f.tablePlain ? f.table : 0xffffff, roughness: 0.68,
  }), 0, -0.92, 0);
  table.rotation.x = -Math.PI / 2;
  table.castShadow = false;
  scene.add(table);

  const unit = new THREE.Group();
  scene.add(unit);
  const chassis = satin(f.chassis, 0.5, 0.15);
  unit.add(mesh(slab(W + 0.5, 0.92, D + 0.5, 0.26, 0.09), chassis, 0, -0.46, 0));

  const face = mesh(new THREE.PlaneGeometry(W, D).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({
    map: panelTexture(f), roughness: f.panelRough, metalness: f.panelMetal, roughnessMap: grainTexture(f),
  }), 0, 0.002, 0);
  face.castShadow = false;
  unit.add(face);

  [[-8.75, -5.25], [8.75, -5.25], [-8.75, 5.25], [8.75, 5.25]].forEach(([x, z]) => {
    unit.add(mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.05, 24), metal(0x77787a, 0.35), x, 0.03, z));
    const slot = mesh(new THREE.BoxGeometry(0.17, 0.008, 0.024), new THREE.MeshBasicMaterial({ color: 0x0a0a0a }), x, 0.056, z);
    slot.rotation.y = x * z;
    unit.add(slot);
  });

  if (f.cheeks) {
    const walnut = woodTexture('#4a2a14');
    walnut.repeat.set(0.3, 0.4);
    const material = new THREE.MeshStandardMaterial({ map: walnut, roughness: 0.46 });
    [-1, 1].forEach((side) => unit.add(mesh(slab(0.62, 1.9, D + 1.8, 0.14, 0.06), material, side * (W / 2 + 0.56), -0.12, -0.4)));
  }

  const hits = [];
  const faders = [];
  const meters = [];
  PROJECTS.forEach((project, i) => {
    const x = stripX(i);
    const value = level(project.commits);

    unit.add(at(jack(0.85), x, 0.002, -4.85));
    [[0.62, -3.65, 0], [0.46, -2.45, 1], [0.46, -1.5, 2]].forEach(([r, z, row]) => {
      unit.add(at(knob(f, row, r * 0.68, 0.9 - value * 1.8 - row * 0.6 + i * 0.35, false), x, 0.002, z));
    });

    [-0.38, 0.38].forEach((dx) => {
      const button = new THREE.MeshStandardMaterial({ color: 0x26262a, roughness: 0.34 });
      unit.add(mesh(new RoundedBoxGeometry(0.56, 0.13, 0.32, 3, 0.04), button, x + dx, 0.07, -0.84));
    });

    const well = mesh(new THREE.BoxGeometry(0.16, 0.012, 4.34), new THREE.MeshStandardMaterial({ color: 0x030303, roughness: 0.8 }), x + 0.3, 0.008, 2.0);
    well.castShadow = false;
    unit.add(well);

    const cap = at(faderCap(f, false), x + 0.3, 0.02, FADER_BOTTOM);
    unit.add(cap);
    const grip = proxy(new THREE.BoxGeometry(1.1, 0.9, 1.0), x + 0.3, 0.3, FADER_BOTTOM, { type: 'fader', channel: i });
    unit.add(grip);
    hits.push(grip);
    faders.push({ cap, grip, value: 0, goal: 0 });

    const socket = proxy(new THREE.CylinderGeometry(0.5, 0.5, 1.6, 12), x, 0.8, -4.85, { type: 'pick', channel: i });
    unit.add(socket);
    hits.push(socket);
    const label = proxy(new THREE.BoxGeometry(STRIP, 0.3, 0.8), x, 0.1, 4.72, { type: 'pick', channel: i });
    unit.add(label);
    hits.push(label);

    if (f.meter !== 'vu') {
      const off = new THREE.Color(0x070708);
      const on = Array.from({ length: LADDER }, (_, s) => meterColor(f, s).multiplyScalar(f.meterGain));
      const dots = new THREE.InstancedMesh(new THREE.BoxGeometry(0.17, 0.018, 0.17), new THREE.MeshBasicMaterial({ color: 0xffffff }), LADDER);
      const dummy = new THREE.Object3D();
      for (let s = 0; s < LADDER; s++) {
        dummy.position.set(x - 0.82, 0.012, 3.82 - s * 0.255);
        dummy.updateMatrix();
        dots.setMatrixAt(s, dummy.matrix);
        dots.setColorAt(s, off);
      }
      unit.add(dots);
      let shown = -1;
      meters.push({
        base: value,
        rest: value * 0.88,
        level: value * 0.88,
        apply(level) {
          const lit = Math.round(level * (LADDER - 1));
          if (lit === shown) return;
          shown = lit;
          for (let s = 0; s < LADDER; s++) dots.setColorAt(s, s < lit ? on[s] : off);
          dots.instanceColor.needsUpdate = true;
        },
      });
    }
  });

  unit.add(tapeStrip());

  unit.add(mesh(slab(3.36, 0.06, 2.48, 0.06, 0.02), new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.3 }), -7.25, 0.03, -1.72));
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 710;
  const displayCtx = canvas.getContext('2d');
  drawDisplay(displayCtx, -1, 0);
  const displayMap = new THREE.CanvasTexture(canvas);
  displayMap.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.14, 2.26).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({
    color: 0x050505, roughness: 0.14, emissive: 0xffffff, emissiveMap: displayMap, emissiveIntensity: 1.25,
  }));
  screen.position.set(-7.25, 0.062, -1.72);
  unit.add(screen);

  unit.add(at(knob(f, 1, 0.72, -0.8, false), -7.25, 0.002, 1.05));
  unit.add(at(jack(1), -7.25, 0.002, 3.0));

  const cord = satin(ORANGE, 0.44, 0.3);
  unit.add(at(plug(cord, 0.85), -7.25, 0.05, 3.0));
  const patchPlug = at(plug(cord, 0.85), stripX(ACTIVE), 0.05, -4.85);
  unit.add(patchPlug);
  let patchCable = cable(patchPoints(stripX(ACTIVE), 0), 0.058, cord);
  unit.add(patchCable);

  if (f.meter !== 'vu') {
    const black = satin(0x101010, 0.55, 0.15);
    [0, 4].forEach((i) => {
      const x = stripX(i);
      unit.add(cable([[x, -0.5, -5.7], [x + 0.2, -0.75, -7], [x + 0.7, -0.88, -11], [x + 1, -0.88, -30]], 0.05, black));
    });
  } else {
    const bridge = new THREE.MeshStandardMaterial({
      color: 0xc6c7c8, metalness: 0.55, roughness: 0.42, roughnessMap: grainTexture(f),
    });
    unit.add(mesh(new RoundedBoxGeometry(W + 0.5, 3.7, 1.1, 4, 0.08), bridge, 0, 1.4, -6.25));
    PROJECTS.forEach((project, i) => {
      const x = stripX(i);
      const dial = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.25), new THREE.MeshStandardMaterial({
        roughness: 0.2, color: 0x000000, emissive: 0xffffff, emissiveMap: vuFace(project), emissiveIntensity: 1,
      }));
      dial.position.set(x, 2, -5.69);
      unit.add(dial);
      const needle = new THREE.Mesh(
        new THREE.BoxGeometry(0.018, 0.98, 0.006).translate(0, 0.49, 0),
        new THREE.MeshBasicMaterial({ color: 0x141008 }),
      );
      needle.position.set(x, 1.35, -5.67);
      unit.add(needle);
      unit.add(mesh(new THREE.BoxGeometry(0.24, 0.1, 0.04), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 }), x, 1.42, -5.66));
      meters.push({
        base: level(project.commits),
        rest: 0,
        level: 0,
        apply(value) {
          needle.rotation.z = VU_SWING - value * VU_SWING * 2;
        },
      });
    });
  }

  const key = softLights(scene, { key: f.key, keyPos: f.keyPos, keyIntensity: f.keyIntensity, range: 16 });
  key.shadow.radius = 8;
  key.shadow.normalBias = 0.02;

  const base = camera.position.clone();
  const target = new THREE.Vector3(...f.camera[2]);
  const goalPos = base.clone();
  const goalTarget = target.clone();
  const dof = { focus: base.distanceTo(target), maxblur: 0 };
  const raycaster = new THREE.Raycaster();
  const grabPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.2);
  const point = new THREE.Vector3();
  const stops = CONTENT.map(() => 0);
  const patch = { from: stripX(ACTIVE), to: stripX(ACTIVE), t: 1 };
  let channel = -1;
  let drag = null;
  let swipe = null;
  let lastStep = 0;
  let wheel = 0;
  let last = 0;
  themePanel(f.ui ?? {});

  function refresh() {
    drawDisplay(displayCtx, channel, channel < 0 ? 0 : stops[channel]);
    displayMap.needsUpdate = true;
    if (channel < 0) hidePanel();
    else showPanel(channel, stops[channel], (stop) => setStop(channel, stop));
  }

  function setStop(i, stop) {
    if (stops[i] === stop && faders[i].goal === stopValue(i, stop)) return;
    stops[i] = stop;
    faders[i].goal = stopValue(i, stop);
    refresh();
  }

  function select(next) {
    if (next === channel) return;
    if (channel >= 0) faders[channel].cap.userData.body.color.set(faders[channel].cap.userData.base);
    channel = next;
    if (channel < 0) {
      goalPos.set(...f.camera[1]);
      goalTarget.set(...f.camera[2]);
    } else {
      const x = stripX(channel);
      const view = f.focusView;
      goalPos.set(x + view.pos[0], view.pos[1], view.pos[2]);
      goalTarget.set(x + view.target[0], view.target[1], view.target[2]);
      faders[channel].cap.userData.body.color.set(ORANGE);
      patch.from = patchPlug.position.x;
      patch.to = x;
      patch.t = 0;
      hint().hidden = true;
    }
    refresh();
  }

  function step(direction) {
    const now = performance.now();
    if (now - lastStep < STEP_COOLDOWN) return;
    lastStep = now;
    select(THREE.MathUtils.clamp(channel + direction, -1, CONTENT.length - 1));
  }

  function updateCable(x, lift) {
    unit.remove(patchCable);
    patchCable.geometry.dispose();
    patchCable = cable(patchPoints(x, lift), 0.058, cord);
    unit.add(patchCable);
    patchPlug.position.set(x, 0.05 + lift, -4.85);
  }

  function dragFader(i, ndc) {
    raycaster.setFromCamera(ndc, camera);
    if (!raycaster.ray.intersectPlane(grabPlane, point)) return;
    const value = THREE.MathUtils.clamp((FADER_BOTTOM - point.z) / FADER_TRAVEL, 0, 1);
    faders[i].goal = value;
    const stop = nearestStop(i, value);
    if (stop !== stops[i]) {
      stops[i] = stop;
      refresh();
    }
  }

  function pick(ndc) {
    raycaster.setFromCamera(ndc, camera);
    return raycaster.intersectObjects(hits, false)[0]?.object.userData ?? null;
  }

  hint().hidden = false;
  drawDisplay(displayCtx, -1, 0);

  return {
    scene,
    camera,
    base,
    target,
    dof,
    environment: f.environment,
    bloom: f.bloom,
    parallax: 0.3,
    focus: f.focus,
    staticShadows: true,
    shadowsDirty: true,
    goTo(next, stop = 0) {
      select(next);
      setStop(next, stop);
    },
    snap() {
      base.copy(goalPos);
      target.copy(goalTarget);
      faders.forEach((fader) => { fader.value = fader.goal; });
      patch.t = 1;
      updateCable(patch.to, 0);
    },
    leave() {
      hidePanel();
      hint().hidden = true;
    },
    onWheel(delta) {
      wheel += delta;
      if (Math.abs(wheel) < 40) return;
      step(Math.sign(wheel));
      wheel = 0;
    },
    onKey(key) {
      if (key === 'ArrowRight') select(Math.min(channel + 1, CONTENT.length - 1));
      else if (key === 'ArrowLeft') select(Math.max(channel - 1, -1));
      else if (key === 'Escape') select(-1);
      else if (channel >= 0 && key === 'ArrowUp') setStop(channel, Math.min(stops[channel] + 1, CONTENT[channel].stops.length - 1));
      else if (channel >= 0 && key === 'ArrowDown') setStop(channel, Math.max(stops[channel] - 1, 0));
    },
    onPointer(type, e, ndc) {
      if (type === 'pointerdown') {
        const hit = pick(ndc);
        if (hit?.type === 'fader') {
          select(hit.channel);
          drag = hit.channel;
          dragFader(drag, ndc);
          return 'grabbing';
        }
        if (hit?.type === 'pick') {
          select(hit.channel);
          return 'pointer';
        }
        swipe = e.clientY;
        return undefined;
      }
      if (type === 'pointermove') {
        if (drag !== null) {
          dragFader(drag, ndc);
          return 'grabbing';
        }
        if (swipe !== null) {
          if (Math.abs(e.clientY - swipe) > 60) {
            step(e.clientY < swipe ? 1 : -1);
            swipe = e.clientY;
          }
          return undefined;
        }
        const hit = pick(ndc);
        if (hit?.type === 'fader') return 'grab';
        return hit?.type === 'pick' ? 'pointer' : 'default';
      }
      if (drag !== null) {
        const stop = nearestStop(drag, faders[drag].goal);
        faders[drag].goal = stopValue(drag, stop);
        drag = null;
      }
      swipe = null;
      return 'default';
    },
    tick(t) {
      const dt = t > last ? Math.min(t - last, 0.1) : 0.016;
      last = t;
      const ease = 1 - Math.exp(-dt * 3.2);
      base.lerp(goalPos, ease);
      target.lerp(goalTarget, ease);
      faders.forEach((fader) => {
        if (Math.abs(fader.goal - fader.value) > 0.001) this.shadowsDirty = true;
        fader.value += (fader.goal - fader.value) * (1 - Math.exp(-dt * 16));
        const z = FADER_BOTTOM - fader.value * FADER_TRAVEL;
        fader.cap.position.z = z;
        fader.grip.position.z = z;
      });
      meters.forEach((meter, i) => {
        const drive = 0.45 + 0.55 * faders[i].value;
        let goal = meter.rest;
        if (i === channel) goal = stillMotion.matches ? meter.base * drive * 0.8 : meterSignal(t, i, meter.base, drive);
        const speed = goal > meter.level ? 14 : 5;
        meter.level += (goal - meter.level) * (1 - Math.exp(-dt * speed));
        meter.apply(meter.level);
      });
      if (patch.t < 1) {
        this.shadowsDirty = true;
        patch.t = Math.min(patch.t + dt * 1.7, 1);
        const smooth = patch.t * patch.t * (3 - 2 * patch.t);
        updateCable(THREE.MathUtils.lerp(patch.from, patch.to, smooth), Math.sin(patch.t * Math.PI) * 1.5);
      }
      dof.focus = camera.position.distanceTo(target);
      const blur = channel < 0 || !f.focus ? 0 : f.focus[1];
      dof.maxblur += (blur - dof.maxblur) * ease;
    },
  };
}

export const MIXERS = Object.fromEntries(Object.entries(FINISHES).map(([name, f]) => [name, () => console3d(f)]));
