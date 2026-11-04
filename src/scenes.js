import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {
  PROJECTS, satin, glow, mesh, at, slab, lathe, knurl, cable, plug, jack, canvasTexture, softLights,
} from './kit.js';

const ORANGE = 0xff4f00;

function stage(fov, position, target, background) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);
  const camera = new THREE.PerspectiveCamera(fov, 1.6, 0.1, 200);
  camera.position.set(...position);
  camera.lookAt(...target);
  return { scene, camera, base: new THREE.Vector3(...position), target: new THREE.Vector3(...target) };
}

function windowTexture(project, index) {
  return canvasTexture(360, 420, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#ffd9a0');
    g.addColorStop(0.55, '#ff9e45');
    g.addColorStop(1, '#d9601a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(90, 36, 8, 0.3)';
    const bars = 15;
    for (let i = 0; i < bars; i++) {
      const v = Math.abs(Math.sin(i * (1.3 + index * 0.37) + index)) * 0.8 + 0.12;
      const barH = v * 170;
      ctx.fillRect(34 + i * 20, 290 - barH, 11, barH);
    }
    ctx.fillStyle = '#4a1c04';
    ctx.font = '500 34px "Geist Mono"';
    ctx.fillText(project.name, 30, 64);
  });
}

export function sage() {
  const s = stage(24, [15, 9.5, 25], [-4.2, -0.1, 0], 0x98a59b);
  const unit = new THREE.Group();
  s.scene.add(unit);
  const body = satin(0xaab6a7, 0.58, 0.12);
  const shade = satin(0x7f8d80, 0.62, 0.08);

  unit.add(mesh(slab(8.6, 1.0, 3.6, 1.0, 0.2), shade, 0, -1.9, -0.3));
  unit.add(mesh(slab(11.6, 0.55, 6.4, 1.1, 0.2), body, -0.2, -1.2, 0.2));
  unit.add(mesh(slab(8.6, 2.1, 4, 0.9, 0.16), body, 0, 0.0, -0.4));
  unit.add(mesh(slab(9.6, 0.42, 5, 1.1, 0.18), body, 0, 1.22, -0.2));
  unit.add(mesh(slab(2.5, 1.7, 3, 0.7, 0.22), body, 3.3, 2.2, -0.7));

  PROJECTS.forEach((project, i) => {
    const x = -3.35 + i * 1.34;
    unit.add(mesh(new RoundedBoxGeometry(1.2, 1.56, 0.1, 4, 0.04), satin(0x2a2d29, 0.4), x, 0, 1.6));
    const pane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.08, 1.44),
      new THREE.MeshStandardMaterial({
        color: 0x000000, emissive: 0xffffff, emissiveMap: windowTexture(project, i), emissiveIntensity: 1,
      }),
    );
    pane.position.set(x, 0, 1.66);
    unit.add(pane);
    const knob = new THREE.Group();
    knob.add(mesh(lathe([[0.42, 0], [0.39, 0.03], [0.37, 0.26], [0.27, 0.35], [0, 0.36]]), shade));
    const mark = mesh(new THREE.BoxGeometry(0.05, 0.02, 0.2), glow(0xffb060, 1.2), 0, 0.36, 0.17);
    knob.add(mark);
    knob.position.set(x, 1.43, 1.25);
    knob.rotation.y = i * 1.1 - 2.6;
    unit.add(knob);
  });

  [[-5.2, -0.5, 2.5, 0.52], [1.9, -0.55, 2.75, 0.44]].forEach(([x, y, z, r]) => {
    unit.add(mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.2, 32), shade, x, -0.86, z));
    unit.add(mesh(new THREE.SphereGeometry(r, 48, 32), new THREE.MeshStandardMaterial({
      color: 0xfff1dd, emissive: 0xffb877, emissiveIntensity: 0.95, roughness: 0.45,
    }), x, y, z));
    const lamp = new THREE.PointLight(0xffa860, 5, 7, 2);
    lamp.position.set(x, y + 0.2, z + 0.5);
    unit.add(lamp);
  });

  for (let i = 0; i < 5; i++) {
    unit.add(mesh(new THREE.BoxGeometry(0.03, 0.62, 0.11), glow(0xff9238, 1.3), 4.56, 2.2, -1.35 + i * 0.26));
  }
  unit.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.4, 12), satin(0x2a2d29), 2.6, 3.7, -1.5));
  unit.add(mesh(new THREE.SphereGeometry(0.07, 16, 16), glow(0xffa04a, 6), 2.6, 4.42, -1.5));

  unit.add(at(jack(0.7), -3.3, -0.92, 2.95));
  unit.add(at(jack(0.7), -0.2, -0.92, 2.95));
  const cord = satin(0xe2500c, 0.45, 0.25);
  unit.add(at(plug(cord, 0.7), -3.3, -0.88, 2.95));
  unit.add(at(plug(cord, 0.7), -0.2, -0.88, 2.95));
  unit.add(cable([[-3.3, -0.1, 2.95], [-3.3, 0.25, 3.1], [-2.9, -0.35, 3.55], [-1.75, -0.9, 3.7], [-0.6, -0.35, 3.55], [-0.2, 0.25, 3.1], [-0.2, -0.1, 2.95]], 0.05, cord));

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.ShadowMaterial({ opacity: 0.34 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -3.5;
  floor.receiveShadow = true;
  s.scene.add(floor);

  softLights(s.scene, { key: 0xfff3e2, keyPos: [-5, 16, 9], keyIntensity: 1.25 });
  const spill = new THREE.PointLight(0xff8a3c, 14, 12, 2);
  spill.position.set(0, -0.4, 4.6);
  s.scene.add(spill);

  return {
    ...s,
    environment: 0.5,
    bloom: [0.12, 0.45, 0.92],
    parallax: 0.8,
    tick(t) {
      unit.position.y = Math.sin(t * 0.8) * 0.07;
    },
  };
}

export function stack() {
  const s = stage(22, [0, -0.3, 26], [0, 0, 0], 0xf7f7f5);
  const type = canvasTexture(2880, 1800, (ctx, w, h) => {
    ctx.fillStyle = '#111111';
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'center';
    ctx.font = '600 1000px "Inter Tight"';
    const size = (1000 * w * 0.97) / ctx.measureText('ayan').width;
    ctx.font = `600 ${size}px "Inter Tight"`;
    ctx.letterSpacing = `${-size * 0.03}px`;
    ctx.fillText('ayan', w / 2, h * 0.68);
  });
  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(19.8, 12.375),
    new THREE.MeshBasicMaterial({ map: type, transparent: true, toneMapped: false }),
  );
  backdrop.position.z = -5;
  s.scene.add(backdrop);

  const pucks = [
    { color: 0x151515, y: 5.5, x: 3.9, tilt: -0.34, roll: 0.06 },
    { color: 0x2f3b34, y: 2.95, x: 3.5, tilt: -0.27, roll: 0.05 },
    { color: 0x7d93a7, y: 0.4, x: 4.05, tilt: -0.2, roll: -0.04 },
    { color: 0xc1672a, y: -2.1, x: 3.55, tilt: -0.12, roll: 0.03 },
    { color: 0xa9acae, y: -4.65, x: 3.95, tilt: 0.16, roll: -0.04 },
  ];
  const profile = [[0, -0.34], [1.5, -0.34], [1.66, -0.48], [2.3, -0.52], [2.95, -0.3], [3.2, 0.02], [3.05, 0.36], [2.3, 0.56], [0, 0.6]];
  const group = new THREE.Group();
  s.scene.add(group);
  const nodes = pucks.map((p) => {
    const material = satin(p.color, 0.42, 0.35);
    const puck = new THREE.Group();
    puck.add(mesh(lathe(profile), material));
    puck.add(mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.03, 96), satin(new THREE.Color(p.color).multiplyScalar(0.5), 0.8), 0, -0.35, 0));
    puck.position.set(p.x, p.y, 0);
    puck.rotation.set(p.tilt, 0.25, p.roll);
    group.add(puck);
    return { puck, y: p.y };
  });

  const cord = satin(ORANGE, 0.42, 0.35);
  const path = [[7.4, 9, -0.6]];
  pucks.forEach((p, i) => {
    path.push([p.x + 3.04, p.y, -0.8]);
    if (i < pucks.length - 1) path.push([(p.x + pucks[i + 1].x) / 2 + 3.28, (p.y + pucks[i + 1].y) / 2, -0.55]);
  });
  path.push([7.1, -9, -0.6]);
  group.add(cable(path, 0.05, cord));

  const key = softLights(s.scene, { key: 0xffffff, keyPos: [-8, 12, 14], keyIntensity: 1.8 });
  key.shadow.radius = 18;

  let spread = 1;
  let goal = 1;
  addEventListener('wheel', (e) => {
    goal = THREE.MathUtils.clamp(goal + e.deltaY * 0.001, 0.72, 1.3);
  });

  return {
    ...s,
    environment: 0.85,
    bloom: [0, 0, 1],
    parallax: 0.7,
    tick(t) {
      spread += (goal - spread) * 0.08;
      nodes.forEach(({ puck, y }, i) => {
        puck.position.y = y * spread + Math.sin(t * 0.7 + i) * 0.05;
      });
      group.scale.y = 1;
    },
  };
}

function ringTexture(active) {
  return canvasTexture(2048, 2048, (ctx, w) => {
    ctx.translate(w / 2, w / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    PROJECTS.forEach((project, i) => {
      const a = dialAngle(i);
      ctx.save();
      ctx.rotate(-a);
      ctx.translate(0, -w * 0.43);
      if (Math.cos(a) < -0.01) {
        ctx.rotate(Math.PI);
      }
      ctx.font = '500 40px "Cormorant Garamond"';
      ctx.letterSpacing = '12px';
      ctx.fillStyle = i === active ? '#ffffff' : '#77777a';
      ctx.fillText(project.name.toUpperCase(), 0, 0);
      ctx.restore();
    });
  });
}

const dialAngle = (i) => ((2.5 - i) * Math.PI * 2) / 8 + Math.PI * 0;

export function dial() {
  const s = stage(25, [0, 27, 13.5], [0, 0, 1.5], 0x050506);

  const ground = mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshStandardMaterial({ color: 0x101012, roughness: 0.62, metalness: 0.2 }));
  ground.rotation.x = -Math.PI / 2;
  s.scene.add(ground);

  const well = mesh(lathe([[5.2, 0.01], [4.9, 0.12], [4.75, 0.14], [4.05, 0.13], [3.9, 0.02]], false), new THREE.MeshStandardMaterial({ color: 0x0d0d0f, roughness: 0.45, metalness: 0.4 }));
  well.castShadow = false;
  s.scene.add(well);

  const count = 96;
  const ticks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.035, 0.012, 0.26), new THREE.MeshBasicMaterial({ color: 0xffffff }), count);
  const scratch = new THREE.Object3D();
  s.scene.add(ticks);

  const ring = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshBasicMaterial({ map: ringTexture(0), transparent: true }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.03;
  s.scene.add(ring);

  const knob = new THREE.Group();
  s.scene.add(knob);
  const dark = new THREE.MeshStandardMaterial({ color: 0x17171a, roughness: 0.38, metalness: 0.75 });
  knob.add(mesh(lathe([[3.72, 0.02], [3.65, 0.2], [3.32, 0.32], [3.3, 0.36]], false), dark));
  knob.add(mesh(knurl(3.18, 1.45, 96, 0.06), dark, 0, 0.32, 0));
  knob.add(mesh(lathe([[3.12, 1.78], [3.05, 1.84], [2.62, 1.86], [2.56, 1.84]], false), dark));

  const brushed = canvasTexture(1024, 1024, (ctx, w) => {
    ctx.translate(w / 2, w / 2);
    for (let i = 0; i < 1440; i++) {
      const a = (i / 1440) * Math.PI * 2;
      const v = 142 + Math.sin(a * 2 + 0.6) * 52 + Math.sin(a * 4.0) * 16 + Math.random() * 26;
      ctx.strokeStyle = `rgb(${v},${v},${v})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * w, Math.sin(a) * w);
      ctx.stroke();
    }
  });
  const cap = mesh(new THREE.CircleGeometry(2.52, 128), new THREE.MeshStandardMaterial({ map: brushed, metalness: 0.85, roughness: 0.3 }), 0, 1.87, 0);
  cap.rotation.x = -Math.PI / 2;
  knob.add(cap);
  const pointer = mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 32), new THREE.MeshBasicMaterial({ color: 0xff5a10 }), 0, 1.885, -2.15);
  knob.add(pointer);

  const cord = satin(ORANGE, 0.42, 0.3);
  s.scene.add(at(jack(1.25), 6.9, 0, 3.6));
  s.scene.add(at(plug(cord, 1.25), 6.9, 0.04, 3.6));
  s.scene.add(cable([[6.9, 1.1, 3.6], [6.9, 1.8, 3.7], [7.6, 0.9, 5.2], [10, 0.12, 6.8], [15, 0.12, 8]], 0.075, cord));

  const key = new THREE.SpotLight(0xfff4e6, 620, 60, 0.42, 0.9, 1.6);
  key.position.set(-9, 20, -7);
  key.target.position.set(0, 0, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  key.shadow.radius = 10;
  key.shadow.blurSamples = 25;
  key.shadow.bias = -0.0003;
  key.shadow.normalBias = 0.03;
  s.scene.add(key, key.target);
  const rim = new THREE.SpotLight(0xdce6ff, 260, 40, 0.5, 0.8, 1.6);
  rim.position.set(10, 7, 9);
  s.scene.add(rim);

  let angle = dialAngle(0);
  let goal = angle;
  let active = 0;
  let dragging = false;
  let last = 0;
  const paintTicks = () => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      scratch.position.set(Math.sin(a) * -4.42, 0.15, Math.cos(a) * -4.42);
      scratch.rotation.y = -a;
      scratch.updateMatrix();
      ticks.setMatrixAt(i, scratch.matrix);
      const gap = Math.abs(Math.atan2(Math.sin(a - angle), Math.cos(a - angle)));
      const lit = Math.max(0, 1 - gap / 0.5);
      ticks.setColorAt(i, new THREE.Color(0.12 + lit * 3.2, 0.12 + lit * 3.2, 0.13 + lit * 3.2));
    }
    ticks.instanceMatrix.needsUpdate = true;
    ticks.instanceColor.needsUpdate = true;
  };
  paintTicks();

  addEventListener('pointerdown', (e) => { dragging = true; last = e.clientX; });
  addEventListener('pointerup', () => {
    dragging = false;
    active = THREE.MathUtils.clamp(Math.round(2.5 - (goal * 8) / (Math.PI * 2)), 0, PROJECTS.length - 1);
    goal = dialAngle(active);
    ring.material.map.dispose();
    ring.material.map = ringTexture(active);
  });
  addEventListener('pointermove', (e) => {
    if (!dragging) return;
    goal = THREE.MathUtils.clamp(goal + (last - e.clientX) * 0.006, dialAngle(5), dialAngle(0));
    last = e.clientX;
  });

  return {
    ...s,
    environment: 0.22,
    bloom: [0.42, 0.5, 1],
    parallax: 0.5,
    tick() {
      angle += (goal - angle) * 0.1;
      knob.rotation.y = angle;
      paintTicks();
    },
  };
}

export function prism() {
  const s = stage(24, [0, 0.2, 21], [0, 0, 0], 0x000000);
  const type = canvasTexture(2880, 1800, (ctx, w, h) => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f2f2f2';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fontStretch = 'expanded';
    ctx.letterSpacing = '-12px';
    ctx.font = '800 460px Archivo';
    ctx.fillText('Ayan', w / 2, h * 0.2);
    ctx.font = '800 400px Archivo';
    ctx.fillText('Chandra', w / 2, h * 0.5);
    ctx.fillText('sekaran', w / 2, h * 0.78);
  });
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(17, 10.625), new THREE.MeshBasicMaterial({ map: type, toneMapped: false }));
  backdrop.position.z = -4;
  s.scene.add(backdrop);

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0, metalness: 0, transmission: 1, thickness: 2.4, ior: 1.46, dispersion: 2.2,
    envMapIntensity: 0.9, specularIntensity: 0.8,
  });
  const cube = new THREE.Group();
  cube.add(new THREE.Mesh(new RoundedBoxGeometry(4.3, 4.3, 4.3, 10, 0.22), glass));

  const cord = satin(ORANGE, 0.4, 0.4);
  cube.add(cable([[-0.2, 0.5, 0], [0.1, -0.5, 0.2], [1.3, -1.5, 0.5], [3.1, -2.9, 2.3], [6.5, -5.6, 6.5], [13, -10, 13]], 0.075, cord));

  cube.rotation.set(0.42, 0.68, 0.14);
  s.scene.add(cube);

  const key = new THREE.DirectionalLight(0xffffff, 2);
  key.position.set(-6, 9, 12);
  s.scene.add(key);

  return {
    ...s,
    environment: 0.6,
    bloom: [0.08, 0.4, 1],
    parallax: 0.5,
    tick(t, pointer) {
      cube.rotation.y = 0.68 + Math.sin(t * 0.25) * 0.08 + pointer.x * 0.35;
      cube.rotation.x = 0.42 + pointer.y * 0.25;
    },
  };
}

export const SCENES = { sage, stack, dial, prism };
