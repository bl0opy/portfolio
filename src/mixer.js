import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {
  PROJECTS, satin, metal, mesh, lathe, knurl, canvasTexture,
} from './kit.js';
import { CONTENT, MASTER } from './projects.js';

export const ORANGE = 0xff4f00;
export const W = 18;
export const D = 11;
export const STRIP = 14.5 / 6;
export const LADDER = 16;
export const MASTER_X = -7.25;
export const MASTER_KNOB_Z = 1.4;
export const MASTER_KNOB_R = 0.6;
export const FADER_TOP = 0.62;
export const FADER_TRAVEL = 3.03;
export const stripX = (i) => -5.5 + STRIP * (i + 0.5);
export const level = (commits) => Math.log(commits) / Math.log(177);

export const STEEL = {
  panel: '#b4b4b0',
  ink: '#101010',
  chassis: 0x2c2d2f,
  fader: 0x161616,
  background: 0x8f8e8a,
  meter: new THREE.Color(1, 0.55, 0.06).multiplyScalar(1.35),
  key: { color: 0xffffff, position: [-7, 18, 8], intensity: 0.9 },
  environment: 0.76,
  bloom: [0.12, 0.4, 1],
  fov: 28,
};

function micIcon(ctx, x, z, u) {
  ctx.save();
  ctx.translate(x, z);
  ctx.scale(u, u);
  ctx.fillStyle = STEEL.ink;
  ctx.strokeStyle = STEEL.ink;
  ctx.lineWidth = 0.05;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.roundRect(-0.14, -0.52, 0.28, 0.58, 0.14);
  ctx.fill();
  ctx.strokeStyle = STEEL.panel;
  ctx.lineWidth = 0.022;
  [-0.34, -0.24, -0.14].forEach((y) => {
    ctx.beginPath();
    ctx.moveTo(-0.07, y);
    ctx.lineTo(0.07, y);
    ctx.stroke();
  });
  ctx.strokeStyle = STEEL.ink;
  ctx.lineWidth = 0.05;
  ctx.beginPath();
  ctx.arc(0, -0.08, 0.225, 0, Math.PI);
  ctx.moveTo(-0.225, -0.08);
  ctx.lineTo(-0.225, -0.16);
  ctx.moveTo(0.225, -0.08);
  ctx.lineTo(0.225, -0.16);
  ctx.moveTo(0, 0.145);
  ctx.lineTo(0, 0.36);
  ctx.moveTo(-0.15, 0.4);
  ctx.lineTo(0.15, 0.4);
  ctx.stroke();
  ctx.restore();
}

export function panelTexture() {
  return canvasTexture(4096, 2503, (ctx, w, h) => {
    const u = w / W;
    const X = (x) => (x + W / 2) * u;
    const Z = (z) => (z + D / 2) * u;
    ctx.fillStyle = STEEL.panel;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 26000; i++) {
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '0,0,0'},${Math.random() * 0.012})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    ctx.fillStyle = STEEL.ink;
    ctx.strokeStyle = STEEL.ink;
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
      const { stops } = CONTENT[i];
      stops.forEach((stop, j) => {
        const z = FADER_TOP + (j / (stops.length - 1)) * FADER_TRAVEL;
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
    ctx.font = `800 ${u}px Archivo`;
    const titleSize = 2.28 / (ctx.measureText('PORTFOLIO').width / u);
    ctx.font = `800 ${titleSize * u}px Archivo`;
    ['AYAN C.', 'PORTFOLIO'].forEach((line, i) => ctx.fillText(line, X(-8.72), Z(-4.72 + i * titleSize * 1.04)));
    ctx.fontStretch = 'normal';
    micIcon(ctx, X(-6.03), Z(-4.72 + titleSize * 0.52), u);
    mono(0.16);
    ctx.fillText('MODEL AC-26', X(-8.72), Z(-3.34));
    ctx.textAlign = 'center';
    ring(MASTER_X, MASTER_KNOB_Z, MASTER_KNOB_R);
    mono(0.15);
    const labels = CONTENT[MASTER].stops;
    labels.forEach((stop, j) => {
      const a = -Math.PI * 1.25 + (j / (labels.length - 1)) * Math.PI * 1.5;
      const lift = Math.sin(a) < -0.9 ? 1.42 : 0.92;
      ctx.fillText(stop.label, X(MASTER_X) + Math.cos(a) * 1.02 * u, Z(MASTER_KNOB_Z) + Math.sin(a) * lift * u);
    });
    mono(0.16);
    ctx.fillText('YOU OUT', X(MASTER_X - 1.12), Z(3));
  });
}

export function grainTexture() {
  const texture = canvasTexture(1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 12000; i++) {
      const v = 228 + Math.random() * 27;
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
  });
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 2);
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

export function knob(radius, angle) {
  const g = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.42, metalness: 0.2 });
  g.add(mesh(lathe([[radius * 1.14, 0], [radius * 1.12, 0.05], [radius * 0.98, 0.09]], false), body));
  g.add(mesh(knurl(radius * 0.92, radius * 0.95, 40, 0.012), body, 0, 0.06, 0));
  g.add(mesh(new THREE.CylinderGeometry(radius * 0.72, radius * 0.72, 0.02, 64), metal(0xc8c8c5, 0.3), 0, radius * 0.95 + 0.09, 0));
  g.add(mesh(new THREE.BoxGeometry(0.035, 0.012, radius * 0.72), new THREE.MeshBasicMaterial({ color: 0xf2f2ec }), 0, radius * 0.95 + 0.102, -radius * 0.48));
  g.rotation.y = angle;
  return g;
}

export function faderCap() {
  const g = new THREE.Group();
  const body = satin(STEEL.fader, 0.4, 0.3);
  g.userData.body = body;
  g.add(mesh(new RoundedBoxGeometry(0.72, 0.3, 0.44, 4, 0.05), body, 0, 0.17, 0));
  [-0.15, 0.15].forEach((z) => {
    g.add(mesh(new THREE.CapsuleGeometry(0.055, 0.56, 6, 16).rotateZ(Math.PI / 2), body, 0, 0.31, z));
  });
  g.add(mesh(new THREE.BoxGeometry(0.62, 0.012, 0.035), new THREE.MeshBasicMaterial({ color: 0xf2f2ec }), 0, 0.325, 0));
  return g;
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
  const entry = CONTENT[channel];
  const title = entry ? (entry.short ?? entry.title).toUpperCase() : 'AYAN C.';
  ctx.font = '500 84px "Geist Mono"';
  wrap(ctx, title, w - 100).forEach((line, i) => ctx.fillText(line, 54, 130 + i * 92));
  ctx.font = '500 44px "Geist Mono"';
  const note = entry ? `STOP ${stopIndex + 1}/${entry.stops.length} ${entry.stops[stopIndex].label}` : 'Scroll to start.';
  wrap(ctx, note, w - 100).forEach((line, i) => ctx.fillText(line, 54, 400 + i * 60));
  ctx.font = '500 36px "Geist Mono"';
  ctx.fillText(entry?.code ?? (entry ? `CH 0${channel + 1}` : 'SIX CHANNELS'), 54, 650);
}
