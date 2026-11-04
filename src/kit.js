import * as THREE from 'three';

export const PROJECTS = [
  { name: 'Voice Agent', commits: 108 },
  { name: 'Mic Iso', commits: 22 },
  { name: 'Floor Piano', commits: 20 },
  { name: 'synqd', commits: 177 },
  { name: 'Descant', commits: 35 },
  { name: 'Solo.ai', commits: 95 },
];

export const satin = (color, roughness = 0.5, clearcoat = 0.2) =>
  new THREE.MeshPhysicalMaterial({ color, roughness, metalness: 0, clearcoat, clearcoatRoughness: 0.5 });

export const metal = (color, roughness = 0.3) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness: 1 });

export const glow = (color, intensity = 3) =>
  new THREE.MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: intensity });

export function mesh(geometry, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function at(object, x, y, z) {
  object.position.set(x, y, z);
  return object;
}

// Soft-cornered block, centred, with its height along Y.
export function slab(w, h, d, radius, bevel = 0.14) {
  const hw = w / 2 - bevel;
  const hd = d / 2 - bevel;
  const r = Math.min(radius, hw, hd);
  const s = new THREE.Shape();
  s.moveTo(-hw + r, -hd);
  s.lineTo(hw - r, -hd);
  s.absarc(hw - r, -hd + r, r, -Math.PI / 2, 0);
  s.lineTo(hw, hd - r);
  s.absarc(hw - r, hd - r, r, 0, Math.PI / 2);
  s.lineTo(-hw + r, hd);
  s.absarc(-hw + r, hd - r, r, Math.PI / 2, Math.PI);
  s.lineTo(-hw, -hd + r);
  s.absarc(-hw + r, -hd + r, r, Math.PI, Math.PI * 1.5);
  const depth = h - bevel * 2;
  const g = new THREE.ExtrudeGeometry(s, {
    depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 8, curveSegments: 24,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, -depth / 2, 0);
  return g;
}

// Revolves a [radius, y] profile around Y. `smooth` runs it through a spline first.
export function lathe(profile, smooth = true) {
  const pts = profile.map(([r, y]) => new THREE.Vector2(r, y));
  const line = smooth ? new THREE.SplineCurve(pts).getPoints(80) : pts;
  return new THREE.LatheGeometry(line.map((p) => new THREE.Vector2(Math.max(p.x, 0), p.y)), 128);
}

export function knurl(radius, height, teeth = 72, depth = 0.04) {
  const s = new THREE.Shape();
  const steps = teeth * 4;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const r = radius + depth * Math.sin(a * teeth);
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  const g = new THREE.ExtrudeGeometry(s, {
    depth: height, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2, curveSegments: 1,
  });
  g.rotateX(-Math.PI / 2);
  return g;
}

export function cable(points, radius, material) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  return mesh(new THREE.TubeGeometry(curve, 320, radius, 16), material);
}

// Jack plug standing along +Y, tip at the origin.
export function plug(material, scale = 1) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.3, 32), metal(0xd6d6d2, 0.25), 0, 0.15, 0));
  g.add(mesh(lathe([[0.13, 0.28], [0.19, 0.34], [0.19, 0.75], [0.13, 0.95], [0.09, 1.15]]), material));
  g.scale.setScalar(scale);
  return g;
}

export function jack(scale = 1) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.07, 6), metal(0x8d8d8a, 0.35), 0, 0.035, 0));
  g.add(mesh(new THREE.TorusGeometry(0.17, 0.045, 16, 48).rotateX(Math.PI / 2), metal(0xc9c9c5, 0.25), 0, 0.08, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 32), new THREE.MeshStandardMaterial({ color: 0x050505 }), 0, 0.075, 0));
  g.scale.setScalar(scale);
  return g;
}

export function canvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  draw(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  return texture;
}

export function softLights(scene, { key, keyPos, keyIntensity, range = 14 }) {
  const light = new THREE.DirectionalLight(key, keyIntensity);
  light.position.set(...keyPos);
  light.castShadow = true;
  light.shadow.mapSize.set(4096, 4096);
  light.shadow.radius = 14;
  light.shadow.blurSamples = 25;
  light.shadow.bias = -0.0004;
  Object.assign(light.shadow.camera, { left: -range, right: range, top: range, bottom: -range, near: 1, far: 70 });
  scene.add(light);
  return light;
}
