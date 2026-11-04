import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {
  PROJECTS, satin, metal, mesh, lathe, knurl, canvasTexture,
} from './kit.js';
import { CONTENT } from './projects.js';

export const ORANGE = 0xff4f00;
export const W = 18;
export const D = 11;
export const STRIP = 14.5 / 6;
export const ACTIVE = 2;
export const LADDER = 16;
export const stripX = (i) => -5.5 + STRIP * (i + 0.5);
export const level = (commits) => Math.log(commits) / Math.log(177);

export const FINISHES = {
  concrete: {
    panel: '#bdbdb8', panelMetal: 0, panelRough: 0.74, ink: '#161616', chassis: 0x2a2a2a, grain: 'speckle',
    knob: 'black', capColors: null, fader: 0x161616, background: 0x8f8e8a, table: '#8f8e8a', tablePlain: true,
    meter: 'amber', meterGain: 1.35, key: 0xffffff, keyPos: [-7, 18, 8], keyIntensity: 1.25, environment: 0.42, bloom: [0.12, 0.4, 1],
    camera: [28, [-1.5, 20, 18.5], [0.3, 0, 0.2]], focusView: { pos: [1, 8, 12], target: [2.4, 0, 0.8] },
    ui: { paper: '#ebebe8', ink: '#161616', muted: '#55565a', accent: '#e8480a' },
  },
  studio: {
    panel: '#17181a', panelMetal: 0.45, panelRough: 0.5, ink: '#d9d9d3', chassis: 0x0c0c0d, grain: 'speckle',
    knob: 'cap', capColors: [0xc8321e, 0x2f5f9e, 0x3f7d4f], fader: 0xd6d6d0, background: 0x050506, table: '#17110c',
    meter: 'studio', meterGain: 1.7, key: 0xffe6c8, keyPos: [-9, 13, -6], keyIntensity: 3.2, environment: 0.28, bloom: [0.28, 0.45, 1],
    camera: [30, [-6.5, 5.6, 12], [0.6, 0, 0.6]], focusView: { pos: [-2.5, 5.4, 10], target: [2.2, 0, 1] }, focus: [0.0009, 0.007],
    ui: { paper: '#121214', ink: '#ece9e0', muted: '#9a9a96', accent: '#ff5a10' },
  },
  vintage: {
    panel: '#c2c3c4', panelMetal: 1, panelRough: 0.36, ink: '#111111', chassis: 0x8a8b8c, grain: 'brushed',
    knob: 'marconi', capColors: [0xa8281c, 0x26282b, 0x26282b], fader: 0x141414, background: 0x1a120c, table: '#2b1b10',
    meter: 'vu', cheeks: true, key: 0xffdcb0, keyPos: [-6, 16, 10], keyIntensity: 1.25, environment: 0.72, bloom: [0.14, 0.5, 1],
    camera: [28, [2.5, 14.5, 22], [0, 0.4, -1]], focusView: { pos: [1.5, 9.8, 14.6], target: [1.75, 0.5, -0.5] }, focus: [0.0004, 0.004],
    ui: { paper: '#f0e1bc', ink: '#1c150c', muted: '#5f5238', accent: '#a8281c' },
  },
  silver: {
    panel: '#c2c3c4', panelMetal: 1, panelRough: 0.36, ink: '#111111', chassis: 0x8a8b8c, grain: 'brushed',
    knob: 'silver', capColors: null, fader: 0x111111, background: 0xc9c9c7, table: '#c4c4c2', tablePlain: true,
    meter: 'red', meterGain: 1.25, key: 0xffffff, keyPos: [-5, 14, 7], keyIntensity: 1.2, environment: 0.7, bloom: [0.1, 0.4, 1],
    camera: [26, [-1.5, 21, 21], [0.2, 0, 0.2]], focusView: { pos: [3.1, 4.3, 10.4], target: [1.25, 0, 1.75] }, focus: [0.0016, 0.01],
    ui: { paper: '#f0f0ee', ink: '#111111', muted: '#55565a', accent: '#e8480a' },
  },
};

export function panelTexture(f) {
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
      const stops = CONTENT[i].stops;
      stops.forEach((stop, j) => {
        const z = 3.65 - (j / (stops.length - 1)) * 3.3;
        ctx.textAlign = 'right';
        ctx.fillText(stop.label, X(x - 0.17), Z(z));
        ctx.textAlign = 'center';
        ctx.lineWidth = 0.016 * u;
        ctx.beginPath();
        ctx.moveTo(X(x + 0.72), Z(z));
        ctx.lineTo(X(x + 0.9), Z(z));
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

export function grainTexture(f) {
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

export function woodTexture(base) {
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

export function tapeStrip() {
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

export function knob(f, row, radius, angle, active) {
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

export function faderCap(f, active) {
  const g = new THREE.Group();
  const color = active ? ORANGE : f.fader;
  const body = satin(color, 0.4, 0.3);
  g.userData.body = body;
  g.userData.base = f.fader;
  g.add(mesh(new RoundedBoxGeometry(0.72, 0.3, 0.44, 4, 0.05), body, 0, 0.17, 0));
  [-0.15, 0.15].forEach((z) => {
    const ridge = mesh(new THREE.CapsuleGeometry(0.055, 0.56, 6, 16).rotateZ(Math.PI / 2), body, 0, 0.31, z);
    g.add(ridge);
  });
  g.add(mesh(new THREE.BoxGeometry(0.62, 0.012, 0.035), new THREE.MeshBasicMaterial({ color: active ? 0x161616 : (f.fader > 0x888888 ? 0x111111 : 0xf2f2ec) }), 0, 0.325, 0));
  return g;
}

export function meterColor(f, segment) {
  const t = segment / (LADDER - 1);
  if (f.meter === 'amber') return new THREE.Color(1, 0.55, 0.06);
  if (f.meter === 'red') return new THREE.Color(1, 0.09, 0.03);
  if (t > 0.86) return new THREE.Color(1, 0.08, 0.03);
  if (t > 0.65) return new THREE.Color(1, 0.6, 0.05);
  return new THREE.Color(0.14, 1, 0.24);
}

function wrap(ctx, text, width) {
  const lines = [''];
  text.split(' ').forEach((word) => {
    const next = `${lines[lines.length - 1]} ${word}`.trim();
    if (ctx.measureText(next).width > width) lines.push(word);
    else lines[lines.length - 1] = next;
  });
  return lines;
}

export function drawDisplay(ctx, channel, stopIndex) {
  const { width: w, height: h } = ctx.canvas;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0a0702';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#ffb000';
  const project = CONTENT[channel];
  ctx.font = '500 84px "Geist Mono"';
  wrap(ctx, project ? project.title.toUpperCase() : 'AYAN C.', w - 100).forEach((line, i) => ctx.fillText(line, 54, 130 + i * 92));
  ctx.font = '500 44px "Geist Mono"';
  const note = project ? `STOP ${stopIndex + 1}/${project.stops.length} ${project.stops[stopIndex].label}` : 'Scroll to pick a channel.';
  wrap(ctx, note, w - 100).forEach((line, i) => ctx.fillText(line, 54, 400 + i * 60));
  ctx.font = '500 36px "Geist Mono"';
  ctx.fillText(project ? `CH 0${channel + 1}` : 'SIX CHANNELS', 54, 650);
}

export function vuFace(project) {
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
  });
}

