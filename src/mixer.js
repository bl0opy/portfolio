import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {
  PROJECTS, satin, metal, mesh, at, slab, lathe, knurl, cable, plug, jack, canvasTexture, softLights,
} from './kit.js';

const ORANGE = 0xff4f00;
const W = 18;
const D = 11;
const STRIP = 14.5 / 6;
const ACTIVE = 2;
const LADDER = 16;
const stripX = (i) => -5.5 + STRIP * (i + 0.5);
const level = (commits) => Math.log(commits) / Math.log(177);

const FINISHES = {
  concrete: {
    panel: '#bdbdb8', panelMetal: 0, panelRough: 0.74, ink: '#161616', chassis: 0x2a2a2a, grain: 'speckle',
    knob: 'black', capColors: null, fader: 0x161616, background: 0x8f8e8a, table: '#8f8e8a', tablePlain: true,
    meter: 'amber', meterGain: 1.35, key: 0xffffff, keyPos: [-7, 18, 8], keyIntensity: 1.25, environment: 0.42, bloom: [0.12, 0.4, 1],
    camera: [28, [-1.5, 20, 18.5], [0.3, 0, 0.2]],
  },
  studio: {
    panel: '#17181a', panelMetal: 0.45, panelRough: 0.5, ink: '#d9d9d3', chassis: 0x0c0c0d, grain: 'speckle',
    knob: 'cap', capColors: [0xc8321e, 0x2f5f9e, 0x3f7d4f], fader: 0xd6d6d0, background: 0x050506, table: '#17110c',
    meter: 'studio', meterGain: 1.7, key: 0xffe6c8, keyPos: [-9, 13, -6], keyIntensity: 3.2, environment: 0.28, bloom: [0.28, 0.45, 1],
    camera: [30, [-6.5, 5.6, 12], [0.6, 0, 0.6]], focus: [0.0009, 0.007],
  },
  vintage: {
    panel: '#6d8598', panelMetal: 0.12, panelRough: 0.42, ink: '#0f1418', chassis: 0x20262b, grain: 'speckle',
    knob: 'marconi', capColors: [0xa8281c, 0x8b8f92, 0x8b8f92], fader: 0x141414, background: 0x1a120c, table: '#2b1b10',
    meter: 'vu', cheeks: true, key: 0xffdcb0, keyPos: [-6, 16, 10], keyIntensity: 2.2, environment: 0.4, bloom: [0.25, 0.5, 1],
    camera: [28, [2.5, 13, 20.5], [0, 0.2, -0.8]],
  },
  silver: {
    panel: '#c2c3c4', panelMetal: 1, panelRough: 0.36, ink: '#111111', chassis: 0x8a8b8c, grain: 'brushed',
    knob: 'silver', capColors: null, fader: 0x111111, background: 0xc9c9c7, table: '#c4c4c2', tablePlain: true,
    meter: 'red', meterGain: 1.25, key: 0xffffff, keyPos: [-5, 14, 7], keyIntensity: 1.2, environment: 0.7, bloom: [0.1, 0.4, 1],
    camera: [26, [4.6, 3.2, 8.6], [1.1, 0, 1.4]], focus: [0.0016, 0.01],
  },
};

function panelTexture(f) {
  return canvasTexture(4096, 2503, (ctx, w, h) => {
    const u = w / W;
    const X = (x) => (x + W / 2) * u;
    const Z = (z) => (z + D / 2) * u;
    ctx.fillStyle = f.panel;
    ctx.fillRect(0, 0, w, h);
    if (f.grain === 'brushed') {
      for (let i = 0; i < 9000; i++) {
        ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '0,0,0'},${Math.random() * 0.05})`;
        ctx.fillRect(Math.random() * w - 300, Math.random() * h, 200 + Math.random() * 1400, 1);
      }
    } else {
      for (let i = 0; i < 26000; i++) {
        ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '0,0,0'},${Math.random() * 0.045})`;
        ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
      }
    }
    ctx.fillStyle = f.ink;
    ctx.strokeStyle = f.ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const mono = (size) => { ctx.font = `500 ${size * u}px "Geist Mono"`; };
    const ring = (x, z, r) => {
      for (let t = 0; t <= 10; t++) {
        const a = -Math.PI * 1.25 + (t / 10) * Math.PI * 1.5;
        ctx.lineWidth = 0.018 * u;
        ctx.beginPath();
        ctx.moveTo(X(x) + Math.cos(a) * r * u, Z(z) + Math.sin(a) * r * u);
        ctx.lineTo(X(x) + Math.cos(a) * (r + 0.09) * u, Z(z) + Math.sin(a) * (r + 0.09) * u);
        ctx.stroke();
      }
    };

    PROJECTS.forEach((_, i) => {
      const x = stripX(i);
      ctx.lineWidth = 0.012 * u;
      ctx.beginPath();
      ctx.moveTo(X(x - STRIP / 2), 0);
      ctx.lineTo(X(x - STRIP / 2), Z(4.3));
      ctx.stroke();
      mono(0.17);
      ctx.fillText('INS', X(x + 0.72), Z(-4.85));
      ctx.fillText(`0${i + 1}`, X(x - 0.72), Z(-4.85));
      [['GAIN', -3.65], ['HI', -2.45], ['LO', -1.5]].forEach(([label, z]) => {
        ring(x, z, label === 'GAIN' ? 0.62 : 0.46);
        mono(0.14);
        ctx.fillText(label, X(x + 0.92), Z(z));
      });
      mono(0.12);
      ctx.fillText('MUTE', X(x - 0.38), Z(-0.42));
      ctx.fillText('SOLO', X(x + 0.38), Z(-0.42));
      [['+10', 0.05], ['0', 0.85], ['-10', 1.65], ['-20', 2.45], ['-40', 3.25], ['∞', 3.95]].forEach(([label, z]) => {
        ctx.textAlign = 'right';
        ctx.fillText(label, X(x - 0.02), Z(z));
        ctx.textAlign = 'center';
        ctx.lineWidth = 0.012 * u;
        ctx.beginPath();
        ctx.moveTo(X(x + 0.72), Z(z));
        ctx.lineTo(X(x + 0.88), Z(z));
        ctx.stroke();
      });
    });

    ctx.lineWidth = 0.012 * u;
    ctx.beginPath();
    ctx.moveTo(X(-5.5), Z(4.3));
    ctx.lineTo(X(9), Z(4.3));
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fontStretch = 'expanded';
    ctx.font = `800 ${0.4 * u}px Archivo`;
    ['AYAN', 'CHANDRA-', 'SEKARAN'].forEach((line, i) => ctx.fillText(line, X(-8.72), Z(-4.95 + i * 0.44)));
    ctx.fontStretch = 'normal';
    mono(0.16);
    ctx.fillText('MODEL AC-26', X(-8.72), Z(-3.34));
    ctx.textAlign = 'center';
    ring(-7.25, 1.05, 0.72);
    mono(0.16);
    ctx.fillText('MASTER', X(-7.25), Z(0.03));
    ctx.fillText('YOU OUT', X(-7.25), Z(2.3));
    mono(0.15);
    ctx.fillText('GITHUB / LINKEDIN / RESUME', X(-7.25), Z(4.6));
  });
}

function grainTexture(f) {
  const texture = canvasTexture(1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 12000; i++) {
      const v = 150 + Math.random() * 105;
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      if (f.grain === 'brushed') ctx.fillRect(Math.random() * w - 80, Math.random() * h, 80 + Math.random() * 500, 1);
      else ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
  });
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 2);
  return texture;
}

function woodTexture(base) {
  const texture = canvasTexture(2048, 2048, (ctx, w, h) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 700; i++) {
      const y = Math.random() * h;
      ctx.strokeStyle = `rgba(${Math.random() > 0.6 ? '255,210,160' : '0,0,0'},${Math.random() * 0.1})`;
      ctx.lineWidth = 1 + Math.random() * 3;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.3, y + Math.random() * 18 - 9, w * 0.7, y + Math.random() * 18 - 9, w, y);
      ctx.stroke();
    }
  });
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function tapeStrip() {
  const texture = canvasTexture(3200, 150, (ctx, w, h) => {
    ctx.beginPath();
    ctx.moveTo(8, 4);
    ctx.lineTo(w - 12, 2);
    for (let y = 0; y <= h; y += 15) ctx.lineTo(w - 12 - (y % 30 ? 12 : 0), y);
    ctx.lineTo(10, h - 2);
    for (let y = h; y >= 0; y -= 15) ctx.lineTo(10 + (y % 30 ? 11 : 0), y);
    ctx.closePath();
    ctx.fillStyle = '#e4d8b6';
    ctx.fill();
    ctx.save();
    ctx.clip();
    for (let i = 0; i < 2600; i++) {
      ctx.fillStyle = `rgba(90,70,30,${Math.random() * 0.05})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 3 + Math.random() * 18, 1);
    }
    ctx.restore();
    ctx.fillStyle = '#17171a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    PROJECTS.forEach((project, i) => {
      ctx.save();
      ctx.translate((w / 6) * (i + 0.5), h / 2 + 2);
      ctx.rotate(((i * 37) % 5 - 2) * 0.008);
      ctx.font = '76px "Permanent Marker"';
      ctx.fillText(project.name, 0, 0);
      ctx.restore();
    });
  });
  const strip = new THREE.Mesh(
    new THREE.PlaneGeometry(14.3, 0.67).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ map: texture, transparent: true, roughness: 0.82 }),
  );
  strip.position.set(1.75, 0.012, 4.72);
  strip.rotation.y = 0.0035;
  strip.receiveShadow = true;
  return strip;
}

function knob(f, row, radius, angle, active) {
  const g = new THREE.Group();
  if (f.knob === 'black') {
    const body = new THREE.MeshStandardMaterial({ color: active ? ORANGE : 0x151515, roughness: 0.42, metalness: 0.2 });
    g.add(mesh(lathe([[radius * 1.14, 0], [radius * 1.12, 0.05], [radius * 0.98, 0.09]], false), body));
    g.add(mesh(knurl(radius * 0.92, radius * 0.95, 40, 0.012), body, 0, 0.06, 0));
    g.add(mesh(new THREE.CylinderGeometry(radius * 0.72, radius * 0.72, 0.02, 64), metal(0xc8c8c5, 0.3), 0, radius * 0.95 + 0.09, 0));
  } else if (f.knob === 'cap') {
    const body = satin(0x101012, 0.5, 0.2);
    g.add(mesh(lathe([[radius * 1.02, 0], [radius, 0.05], [radius * 0.88, radius * 0.85], [radius * 0.74, radius * 0.95], [0, radius * 0.97]]), body));
    g.add(mesh(new THREE.CylinderGeometry(radius * 0.62, radius * 0.66, 0.05, 64), satin(f.capColors[row], 0.35, 0.5), 0, radius * 0.97 + 0.02, 0));
  } else if (f.knob === 'marconi') {
    const body = satin(f.capColors[row], 0.34, 0.5);
    g.add(mesh(lathe([[radius * 1.02, 0], [radius * 1.0, 0.05], [radius * 0.9, 0.14], [radius * 0.76, radius * 0.86], [radius * 0.58, radius * 1.02], [0, radius * 1.04]]), body));
  } else {
    const steel = metal(0xc6c7c8, 0.26);
    g.add(mesh(knurl(radius * 0.9, radius * 0.9, 56, 0.016), steel, 0, 0.02, 0));
    g.add(mesh(new THREE.CylinderGeometry(radius * 0.88, radius * 0.93, 0.05, 64), metal(0xe0e0e0, 0.16), 0, radius * 0.9 + 0.05, 0));
  }
  const top = { black: radius * 0.95 + 0.102, cap: radius * 0.97 + 0.05, marconi: radius * 1.04, silver: radius * 0.9 + 0.077 }[f.knob];
  g.add(mesh(new THREE.BoxGeometry(0.035, 0.012, radius * 0.72), new THREE.MeshBasicMaterial({ color: f.knob === 'silver' ? 0x111111 : 0xf2f2ec }), 0, top, -radius * 0.48));
  g.rotation.y = angle;
  return g;
}

function faderCap(f, active) {
  const g = new THREE.Group();
  const color = active ? ORANGE : f.fader;
  const body = satin(color, 0.4, 0.3);
  g.add(mesh(new RoundedBoxGeometry(0.72, 0.3, 0.44, 4, 0.05), body, 0, 0.17, 0));
  [-0.15, 0.15].forEach((z) => {
    const ridge = mesh(new THREE.CapsuleGeometry(0.055, 0.56, 6, 16).rotateZ(Math.PI / 2), body, 0, 0.31, z);
    g.add(ridge);
  });
  g.add(mesh(new THREE.BoxGeometry(0.62, 0.012, 0.035), new THREE.MeshBasicMaterial({ color: active ? 0x161616 : (f.fader > 0x888888 ? 0x111111 : 0xf2f2ec) }), 0, 0.325, 0));
  return g;
}

function meterColor(f, segment) {
  const t = segment / (LADDER - 1);
  if (f.meter === 'amber') return new THREE.Color(1, 0.55, 0.06);
  if (f.meter === 'red') return new THREE.Color(1, 0.09, 0.03);
  if (t > 0.86) return new THREE.Color(1, 0.08, 0.03);
  if (t > 0.65) return new THREE.Color(1, 0.6, 0.05);
  return new THREE.Color(0.14, 1, 0.24);
}

function displayTexture() {
  return canvasTexture(1000, 710, (ctx, w, h) => {
    ctx.fillStyle = '#0a0702';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffb000';
    ctx.font = '500 92px "Geist Mono"';
    ctx.fillText('FLOOR', 54, 140);
    ctx.fillText('PIANO', 54, 240);
    ctx.font = '500 44px "Geist Mono"';
    ['A camera watches your', 'feet. A projected', 'keyboard plays back.'].forEach((line, i) => ctx.fillText(line, 54, 350 + i * 62));
    ctx.font = '500 36px "Geist Mono"';
    ctx.fillText('CH 03', 54, 650);
    ctx.textAlign = 'right';
    ctx.fillText('VIDEO  CODE', w - 54, 650);
  });
}

function vuFace(project, value) {
  return canvasTexture(640, 400, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#f5e3b4');
    g.addColorStop(1, '#dcb873');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h * 1.02;
    const r = h * 0.72;
    for (let t = 0; t <= 12; t++) {
      const a = -Math.PI * 0.74 + (t / 12) * Math.PI * 0.48;
      ctx.strokeStyle = t > 8 ? '#a8201a' : '#221a10';
      ctx.lineWidth = t % 3 ? 2 : 5;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.lineTo(cx + Math.cos(a) * (r + 28), cy + Math.sin(a) * (r + 28));
      ctx.stroke();
    }
    ctx.fillStyle = '#221a10';
    ctx.textAlign = 'center';
    ctx.font = '500 34px "Geist Mono"';
    ctx.fillText('VU', cx, h * 0.72);
    ctx.font = '500 26px "Geist Mono"';
    ctx.fillText(project.name.toUpperCase(), cx, h * 0.88);
    const a = -Math.PI * 0.74 + value * Math.PI * 0.48;
    ctx.strokeStyle = '#141008';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * (r + 44), cy + Math.sin(a) * (r + 44));
    ctx.stroke();
  });
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

  PROJECTS.forEach((project, i) => {
    const x = stripX(i);
    const active = i === ACTIVE;
    const value = level(project.commits);

    unit.add(at(jack(0.85), x, 0.002, -4.85));
    [[0.62, -3.65, 0], [0.46, -2.45, 1], [0.46, -1.5, 2]].forEach(([r, z, row]) => {
      unit.add(at(knob(f, row, r * 0.68, 0.9 - value * 1.8 - row * 0.6 + i * 0.35, active && row === 0), x, 0.002, z));
    });

    [[-0.38, 0xc8321e, i === 4], [0.38, 0xf0c21a, active]].forEach(([dx, color, lit]) => {
      const button = new THREE.MeshStandardMaterial({
        color: lit ? color : 0x26262a, roughness: 0.34, emissive: color, emissiveIntensity: lit ? 1.7 : 0.02,
      });
      unit.add(mesh(new RoundedBoxGeometry(0.56, 0.13, 0.32, 3, 0.04), button, x + dx, 0.07, -0.84));
    });

    const well = mesh(new THREE.BoxGeometry(0.16, 0.012, 4.34), new THREE.MeshStandardMaterial({ color: 0x030303, roughness: 0.8 }), x + 0.8 - 0.5, 0.008, 2.0);
    well.castShadow = false;
    unit.add(well);
    unit.add(at(faderCap(f, active), x + 0.3, 0.02, 3.65 - value * 3.3));

    if (f.meter !== 'vu') {
      const off = new THREE.Color(0x070708);
      const dots = new THREE.InstancedMesh(new THREE.BoxGeometry(0.17, 0.018, 0.17), new THREE.MeshBasicMaterial({ color: 0xffffff }), LADDER);
      const dummy = new THREE.Object3D();
      for (let s = 0; s < LADDER; s++) {
        dummy.position.set(x - 0.82, 0.012, 3.82 - s * 0.255);
        dummy.updateMatrix();
        dots.setMatrixAt(s, dummy.matrix);
        const lit = s / (LADDER - 1) < value * 0.88 + (active ? 0.1 : 0);
        dots.setColorAt(s, lit ? meterColor(f, s).multiplyScalar(f.meterGain) : off);
      }
      unit.add(dots);
    }
  });

  unit.add(tapeStrip());

  unit.add(mesh(slab(3.36, 0.06, 2.48, 0.06, 0.02), new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.3 }), -7.25, 0.03, -1.72));
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.14, 2.26).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({
    color: 0x050505, roughness: 0.14, emissive: 0xffffff, emissiveMap: displayTexture(), emissiveIntensity: 1.25,
  }));
  screen.position.set(-7.25, 0.062, -1.72);
  unit.add(screen);

  unit.add(at(knob(f, 1, 0.72, -0.8, false), -7.25, 0.002, 1.05));
  unit.add(at(jack(1), -7.25, 0.002, 3.0));

  const cord = satin(ORANGE, 0.44, 0.3);
  const target = stripX(ACTIVE);
  unit.add(at(plug(cord, 0.85), -7.25, 0.05, 3.0));
  unit.add(at(plug(cord, 0.85), target, 0.05, -4.85));
  unit.add(cable([
    [-7.25, 0.9, 3], [-7.1, 1.25, 3.2], [-5.7, 0.5, 3.5], [-3.5, 0.75, 0.9], [-1.4, 1.45, -3], [target - 0.05, 1.45, -4.8], [target, 0.9, -4.85],
  ], 0.058, cord));

  if (f.meter !== 'vu') {
    const black = satin(0x101010, 0.55, 0.15);
    [0, 4].forEach((i) => {
      const x = stripX(i);
      unit.add(at(plug(black, 0.85), x, 0.05, -4.85));
      unit.add(cable([[x, 0.9, -4.85], [x + 0.02, 1.15, -5.3], [x + 0.25, 0.3, -7], [x + 0.7, -0.88, -11], [x + 1, -0.88, -30]], 0.05, black));
    });
  } else {
    unit.add(mesh(new RoundedBoxGeometry(W + 0.5, 2.1, 1.1, 4, 0.08), chassis, 0, 0.5, -6.25));
    PROJECTS.forEach((project, i) => {
      const dial = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.25), new THREE.MeshStandardMaterial({
        roughness: 0.2, color: 0x000000, emissive: 0xffffff, emissiveMap: vuFace(project, level(project.commits) * 0.9), emissiveIntensity: 1,
      }));
      dial.position.set(stripX(i), 0.62, -5.69);
      unit.add(dial);
    });
  }

  const key = softLights(scene, { key: f.key, keyPos: f.keyPos, keyIntensity: f.keyIntensity, range: 16 });
  key.shadow.radius = 8;
  key.shadow.normalBias = 0.02;

  return {
    scene,
    camera,
    base: camera.position.clone(),
    target: new THREE.Vector3(...f.camera[2]),
    environment: f.environment,
    bloom: f.bloom,
    parallax: 0.45,
    focus: f.focus,
    tick() {},
  };
}

export const MIXERS = Object.fromEntries(Object.entries(FINISHES).map(([name, f]) => [name, () => console3d(f)]));
