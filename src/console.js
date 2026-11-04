import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {
  PROJECTS, satin, metal, mesh, at, slab, cable, plug, jack, softLights,
} from './kit.js';
import {
  ORANGE, W, D, STRIP, LADDER, MASTER_X, MASTER_KNOB_Z, MASTER_KNOB_R, FADER_TOP, FADER_TRAVEL, STEEL, stripX, level,
  panelTexture, grainTexture, tapeStrip, knob, faderCap, drawDisplay,
} from './mixer.js';
import { CONTENT, MASTER } from './projects.js';
import { showPanel, hidePanel } from './panel.js';

const KNOB_SWEEP = Math.PI * 1.5;
const STEP_COOLDOWN = 600;
const WHEEL_TRAVEL = 300;
const WHEEL_QUIET = 140;
const WHEEL_MAX_LOCK = 2600;
const WHEEL_NEW_SWIPE = 30;
const WHEEL_DECAY = 2.5;
const SWIPE_TRAVEL = 120;
const PEEK = 0.12;
const HOME = -1;
const INITIAL_PATCH = 2;
const ROUTE = [HOME, MASTER, ...PROJECTS.map((_, i) => i)];
const stillMotion = matchMedia('(prefers-reduced-motion: reduce)');
const hint = document.querySelector('#hint');

const stopValue = (entry, stop) => stop / (CONTENT[entry].stops.length - 1);
const nearestStop = (entry, value) => Math.round(value * (CONTENT[entry].stops.length - 1));

function meterSignal(t, i, base, drive) {
  const beat = (t * 2.2 + i * 0.37) % 1;
  const wobble = 0.5 + 0.5 * Math.sin(t * 7.3 + i) * Math.sin(t * 3.1 + i * 2);
  return Math.min(1, (0.25 + 0.75 * base * drive) * (0.3 + 0.75 * Math.exp(-beat * 4) + 0.35 * wobble));
}

function patchPoints(x, lift) {
  return [
    [MASTER_X, 0.9, 3], [MASTER_X + 0.15, 1.25, 3.2], [-5.7, 0.5, 3.5], [(x + MASTER_X) / 2 + 0.2, 0.75 + lift * 0.4, 0.9],
    [(x - 1.5) * 0.8, 1.45 + lift * 0.7, -3], [x - 0.05, 1.45 + lift, -4.8], [x, 0.9 + lift, -4.85],
  ];
}

function proxy(geometry, x, y, z, data) {
  const m = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
  m.position.set(x, y, z);
  m.userData = data;
  return m;
}

function views(entry, portrait) {
  if (entry === HOME) {
    return portrait
      ? { position: [-4.3, 30, 22], target: [-4.3, 0, 2.5] }
      : { position: [-1.5, 20, 18.5], target: [0.3, 0, 0.2] };
  }
  if (entry === MASTER && portrait) return { position: [-6.4, 27, 20], target: [-6.4, 0, 4.6] };
  if (entry === MASTER) return { position: [MASTER_X + 1.4, 13.5, 10.5], target: [MASTER_X + 2.9, 0, -0.6] };
  const x = entry === MASTER ? MASTER_X : stripX(entry);
  return portrait
    ? { position: [x + 0.25, 15, 9.8], target: [x + 0.25, 0, 4] }
    : { position: [x + 1, 8, 12], target: [x + 2.4, 0, 0.8] };
}

export function createConsole() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(STEEL.background);
  const camera = new THREE.PerspectiveCamera(STEEL.fov, 1.6, 0.1, 200);

  const table = mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({
    color: STEEL.background, roughness: 0.68,
  }), 0, -0.92, 0);
  table.rotation.x = -Math.PI / 2;
  table.castShadow = false;
  scene.add(table);

  const unit = new THREE.Group();
  scene.add(unit);
  unit.add(mesh(slab(W + 0.5, 0.92, D + 0.5, 0.26, 0.09), satin(STEEL.chassis, 0.5, 0.15), 0, -0.46, 0));

  const face = mesh(new THREE.PlaneGeometry(W, D).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({
    map: panelTexture(), roughness: 0.32, metalness: 1, roughnessMap: grainTexture(),
  }), 0, 0.002, 0);
  face.castShadow = false;
  unit.add(face);

  [[-8.75, -5.25], [8.75, -5.25], [-8.75, 5.25], [8.75, 5.25]].forEach(([x, z]) => {
    unit.add(mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.05, 24), metal(0x77787a, 0.35), x, 0.03, z));
    const slot = mesh(new THREE.BoxGeometry(0.17, 0.008, 0.024), new THREE.MeshBasicMaterial({ color: 0x0a0a0a }), x, 0.056, z);
    slot.rotation.y = x * z;
    unit.add(slot);
  });

  const hits = [];
  const controls = [];
  const meters = [];
  const off = new THREE.Color(0x070708);

  PROJECTS.forEach((project, i) => {
    const x = stripX(i);
    const value = level(project.commits);

    unit.add(at(jack(0.85), x, 0.002, -4.85));
    [[0.62, -3.65, 0], [0.46, -2.45, 1], [0.46, -1.5, 2]].forEach(([r, z, row]) => {
      unit.add(at(knob(r * 0.68, 0.9 - value * 1.8 - row * 0.6 + i * 0.35), x, 0.002, z));
    });

    [-0.38, 0.38].forEach((dx) => {
      const button = new THREE.MeshStandardMaterial({ color: 0x26262a, roughness: 0.34 });
      unit.add(mesh(new RoundedBoxGeometry(0.56, 0.13, 0.32, 3, 0.04), button, x + dx, 0.07, -0.84));
    });

    const well = mesh(new THREE.BoxGeometry(0.16, 0.012, 3.9), new THREE.MeshStandardMaterial({ color: 0x030303, roughness: 0.8 }), x + 0.3, 0.008, 2.135);
    well.castShadow = false;
    unit.add(well);

    const cap = at(faderCap(), x + 0.3, 0.02, FADER_TOP);
    unit.add(cap);
    const grip = proxy(new THREE.BoxGeometry(1.1, 0.9, 1.0), x + 0.3, 0.3, FADER_TOP, { type: 'fader', entry: i });
    unit.add(grip);
    hits.push(grip);
    controls[i] = {
      cap,
      value: 0,
      goal: 0,
      place(v) {
        const z = FADER_TOP + v * FADER_TRAVEL;
        cap.position.z = z;
        grip.position.z = z;
      },
    };

    const socket = proxy(new THREE.CylinderGeometry(0.5, 0.5, 1.6, 12), x, 0.8, -4.85, { type: 'pick', entry: i });
    unit.add(socket);
    hits.push(socket);
    const label = proxy(new THREE.BoxGeometry(STRIP, 0.3, 0.8), x, 0.1, 4.72, { type: 'pick', entry: i });
    unit.add(label);
    hits.push(label);

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
      apply(v) {
        const lit = Math.round(v * (LADDER - 1));
        if (lit === shown) return;
        shown = lit;
        for (let s = 0; s < LADDER; s++) dots.setColorAt(s, s < lit ? STEEL.meter : off);
        dots.instanceColor.needsUpdate = true;
      },
    });
  });

  unit.add(tapeStrip());

  unit.add(mesh(slab(3.36, 0.06, 2.48, 0.06, 0.02), new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.3 }), MASTER_X, 0.03, -1.72));
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 710;
  const displayCtx = canvas.getContext('2d');
  const displayMap = new THREE.CanvasTexture(canvas);
  displayMap.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.14, 2.26).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({
    color: 0x050505, roughness: 0.14, emissive: 0xffffff, emissiveMap: displayMap, emissiveIntensity: 1.25,
  }));
  screen.position.set(MASTER_X, 0.062, -1.72);
  unit.add(screen);

  const masterKnob = at(knob(MASTER_KNOB_R, KNOB_SWEEP / 2), MASTER_X, 0.002, MASTER_KNOB_Z);
  unit.add(masterKnob);
  const masterGrip = proxy(new THREE.CylinderGeometry(0.85, 0.85, 1.1, 16), MASTER_X, 0.5, MASTER_KNOB_Z, { type: 'knob', entry: MASTER });
  unit.add(masterGrip);
  hits.push(masterGrip);
  controls[MASTER] = {
    value: 0,
    goal: 0,
    place(v) {
      masterKnob.rotation.y = (0.5 - v) * KNOB_SWEEP;
    },
  };
  const nameplate = proxy(new THREE.BoxGeometry(3.4, 0.3, 4.4), MASTER_X, 0.1, -3.05, { type: 'pick', entry: MASTER });
  unit.add(nameplate);
  hits.push(nameplate);

  unit.add(at(jack(1), MASTER_X, 0.002, 3));
  const cord = satin(ORANGE, 0.44, 0.3);
  unit.add(at(plug(cord, 0.85), MASTER_X, 0.05, 3));
  const patchPlug = at(plug(cord, 0.85), stripX(INITIAL_PATCH), 0.05, -4.85);
  unit.add(patchPlug);
  let patchCable = cable(patchPoints(stripX(INITIAL_PATCH), 0), 0.058, cord);
  unit.add(patchCable);

  const black = satin(0x101010, 0.55, 0.15);
  [0, 4].forEach((i) => {
    const x = stripX(i);
    unit.add(cable([[x, -0.5, -5.7], [x + 0.2, -0.75, -7], [x + 0.7, -0.88, -11], [x + 1, -0.88, -30]], 0.05, black));
  });

  const key = softLights(scene, { key: STEEL.key.color, keyPos: STEEL.key.position, keyIntensity: STEEL.key.intensity, range: 16 });
  key.shadow.radius = 8;
  key.shadow.normalBias = 0.02;

  const base = new THREE.Vector3();
  const target = new THREE.Vector3();
  const goalPos = new THREE.Vector3();
  const goalTarget = new THREE.Vector3();
  const leanPos = new THREE.Vector3();
  const leanTarget = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const grabPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.2);
  const point = new THREE.Vector3();
  const stops = CONTENT.map(() => 0);
  const patch = { from: stripX(INITIAL_PATCH), to: stripX(INITIAL_PATCH), t: 1 };
  let entry = HOME;
  let portrait = false;
  let drag = null;
  let swipe = null;
  let lastStep = 0;
  let wheel = 0;
  let lastWheel = 0;
  let lastDelta = 0;
  let settling = false;
  let last = 0;

  function aim() {
    const view = views(entry, portrait);
    goalPos.set(...view.position);
    goalTarget.set(...view.target);
  }

  function refresh() {
    drawDisplay(displayCtx, entry, entry === HOME ? 0 : stops[entry]);
    displayMap.needsUpdate = true;
    if (entry === HOME) hidePanel();
    else showPanel(entry, stops[entry], (stop) => setStop(entry, stop));
  }

  function setStop(i, stop) {
    if (stops[i] === stop && controls[i].goal === stopValue(i, stop)) return;
    stops[i] = stop;
    controls[i].goal = stopValue(i, stop);
    refresh();
  }

  function select(next) {
    if (next === entry) return;
    controls[entry]?.cap?.userData.body.color.set(STEEL.fader);
    entry = next;
    aim();
    controls[entry]?.cap?.userData.body.color.set(ORANGE);
    if (entry >= 0 && entry < MASTER) {
      patch.from = patchPlug.position.x;
      patch.to = stripX(entry);
      patch.t = 0;
    }
    hint.hidden = entry !== HOME;
    refresh();
  }

  function step(direction) {
    const index = ROUTE.indexOf(entry) + direction;
    if (index >= 0 && index < ROUTE.length) select(ROUTE[index]);
  }

  function throttledStep(direction) {
    const now = performance.now();
    if (now - lastStep < STEP_COOLDOWN) return;
    lastStep = now;
    step(direction);
  }

  function updateCable(x, lift) {
    unit.remove(patchCable);
    patchCable.geometry.dispose();
    patchCable = cable(patchPoints(x, lift), 0.058, cord);
    unit.add(patchCable);
    patchPlug.position.set(x, 0.05 + lift, -4.85);
  }

  function setValue(i, value) {
    controls[i].goal = value;
    const stop = nearestStop(i, value);
    if (stop !== stops[i]) {
      stops[i] = stop;
      refresh();
    }
  }

  function dragControl(ndc, e) {
    if (drag.type === 'knob') {
      setValue(drag.entry, THREE.MathUtils.clamp(drag.start + (drag.y - e.clientY) * 0.006, 0, 1));
      return;
    }
    raycaster.setFromCamera(ndc, camera);
    if (!raycaster.ray.intersectPlane(grabPlane, point)) return;
    setValue(drag.entry, THREE.MathUtils.clamp((point.z - FADER_TOP) / FADER_TRAVEL, 0, 1));
  }

  function pick(ndc) {
    raycaster.setFromCamera(ndc, camera);
    return raycaster.intersectObjects(hits, false)[0]?.object.userData ?? null;
  }

  aim();
  base.copy(goalPos);
  target.copy(goalTarget);
  camera.position.copy(base);
  camera.lookAt(target);
  hint.textContent = matchMedia('(pointer: coarse)').matches ? 'Swipe to start. Slide a fader to read.' : 'Scroll to start. Slide a fader to read.';
  hint.hidden = false;
  refresh();

  return {
    scene,
    camera,
    base,
    target,
    environment: STEEL.environment,
    bloom: STEEL.bloom,
    parallax: 0.3,
    shadowsDirty: true,
    layout(aspect) {
      const next = aspect < 0.9;
      if (next === portrait) return;
      portrait = next;
      aim();
      base.copy(goalPos);
      target.copy(goalTarget);
    },
    goTo(next, stop = 0) {
      select(next);
      if (next !== HOME) setStop(next, stop);
    },
    snap() {
      base.copy(goalPos);
      target.copy(goalTarget);
      controls.forEach((control) => { control.value = control.goal; });
      patch.t = 1;
      updateCable(patch.to, 0);
      this.shadowsDirty = true;
    },
    onWheel(delta) {
      const now = performance.now();
      const gap = now - lastWheel;
      lastWheel = now;
      const size = Math.abs(delta);
      const rising = size > WHEEL_NEW_SWIPE && size > lastDelta * 2;
      lastDelta = size;
      if (settling) {
        const held = now - lastStep;
        if (held < STEP_COOLDOWN || (gap < WHEEL_QUIET && !rising && held < WHEEL_MAX_LOCK)) return;
        settling = false;
      }
      if (Math.sign(delta) !== Math.sign(wheel)) wheel = 0;
      wheel += delta;
      if (Math.abs(wheel) < WHEEL_TRAVEL) return;
      throttledStep(Math.sign(wheel));
      wheel = 0;
      settling = true;
    },
    onKey(key) {
      if (key === 'ArrowRight') step(1);
      else if (key === 'ArrowLeft') step(-1);
      else if (key === 'Escape') select(HOME);
      else if (entry !== HOME && key === 'ArrowDown') setStop(entry, Math.min(stops[entry] + 1, CONTENT[entry].stops.length - 1));
      else if (entry !== HOME && key === 'ArrowUp') setStop(entry, Math.max(stops[entry] - 1, 0));
    },
    onPointer(type, e, ndc) {
      if (type === 'pointerdown') {
        const hit = pick(ndc);
        if (hit?.type === 'fader' || hit?.type === 'knob') {
          select(hit.entry);
          drag = { ...hit, y: e.clientY, start: controls[hit.entry].goal };
          if (hit.type === 'fader') dragControl(ndc, e);
          return 'grabbing';
        }
        if (hit?.type === 'pick') {
          select(hit.entry);
          return 'pointer';
        }
        swipe = e.clientY;
        return undefined;
      }
      if (type === 'pointermove') {
        if (drag) {
          dragControl(ndc, e);
          return 'grabbing';
        }
        if (swipe !== null) {
          if (Math.abs(e.clientY - swipe) > SWIPE_TRAVEL) {
            throttledStep(e.clientY < swipe ? 1 : -1);
            swipe = e.clientY;
          }
          return undefined;
        }
        const hit = pick(ndc);
        if (hit?.type === 'fader' || hit?.type === 'knob') return 'grab';
        return hit?.type === 'pick' ? 'pointer' : 'default';
      }
      if (drag) {
        controls[drag.entry].goal = stopValue(drag.entry, nearestStop(drag.entry, controls[drag.entry].goal));
        drag = null;
      }
      swipe = null;
      return 'default';
    },
    tick(t) {
      const dt = t > last ? Math.min(t - last, 0.1) : 0.016;
      last = t;
      const ease = 1 - Math.exp(-dt * 3.2);
      if (performance.now() - lastWheel > WHEEL_QUIET) wheel *= Math.exp(-dt * WHEEL_DECAY);
      leanPos.copy(goalPos);
      leanTarget.copy(goalTarget);
      const neighbor = ROUTE[ROUTE.indexOf(entry) + Math.sign(wheel)];
      if (neighbor !== undefined) {
        const view = views(neighbor, portrait);
        const amount = (Math.abs(wheel) / WHEEL_TRAVEL) * PEEK;
        leanPos.lerp(point.set(...view.position), amount);
        leanTarget.lerp(point.set(...view.target), amount);
      }
      base.lerp(leanPos, ease);
      target.lerp(leanTarget, ease);
      controls.forEach((control) => {
        if (Math.abs(control.goal - control.value) > 0.001) this.shadowsDirty = true;
        control.value += (control.goal - control.value) * (1 - Math.exp(-dt * 16));
        control.place(control.value);
      });
      meters.forEach((meter, i) => {
        const drive = 1 - 0.55 * controls[i].value;
        let goal = meter.rest;
        if (i === entry) goal = stillMotion.matches ? meter.base * drive * 0.8 : meterSignal(t, i, meter.base, drive);
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
    },
  };
}
