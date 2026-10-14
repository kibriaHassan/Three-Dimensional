import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import type { Family } from "./catalog";
import {
  climbSamples,
  escapeSpeed,
  flightPath,
  gAtRatio,
  gDepth,
  gHeight,
  geoRatio,
  gravityForce,
  G_MOON,
  orbitalSpeed,
  R_EARTH,
  SIDEREAL_DAY,
  spinLoss,
  SURFACE_G,
  type Params,
} from "./physics";

export type ViewState = {
  family: Family;
  focus: string;
  params: Params;
  playing: boolean;
  speed: number;
  lang: "bn" | "en";
};

const CAM: Record<Family, { pos: [number, number, number]; target: [number, number, number] }> = {
  attract: { pos: [0.2, 1.8, 5.4], target: [0, 0.55, 0] },
  trio: { pos: [0.4, 2.6, 6.4], target: [0, 0.4, 0] },
  drop: { pos: [0.35, 1.7, 4.6], target: [0, 0.9, 0] },
  globe: { pos: [1.7, 1.5, 3.5], target: [0, 0.85, 0] },
  field: { pos: [1.5, 1.7, 3.6], target: [0, 0.85, 0] },
  pot: { pos: [0.5, 1.9, 4.8], target: [0, 0.7, 0] },
  orbit: { pos: [2.4, 2.6, 3.6], target: [0, 0.7, 0] },
  escape: { pos: [2.6, 2.3, 3.8], target: [0, 0.6, 0] },
  kepler: { pos: [0.2, 3.4, 4.4], target: [0, 0, 0] },
  weigh: { pos: [0.2, 1.6, 5.2], target: [0, 0.7, 0] },
};

const EY = 0.9;
const TURN = 2200;

function ping(time: number, seconds = 5) {
  const turn = (time % (seconds * 2)) / seconds;
  return turn <= 1 ? turn : 2 - turn;
}

function solveE(mean: number, ecc: number) {
  let E = mean;
  for (let i = 0; i < 8; i++) E -= (E - ecc * Math.sin(E) - mean) / (1 - ecc * Math.cos(E));
  return E;
}

export class GravityWorld {
  private host: HTMLElement;
  private renderer: any;
  private labelRenderer: any;
  private scene: any;
  private camera: any;
  private controls: any;
  private root: any;
  private clock: any;
  private observer: ResizeObserver | null = null;
  private frame = 0;
  private alive = true;
  private failed = false;
  private state: ViewState | null = null;
  private playing = true;
  private speed = 1;
  private time = 0;
  private key = "";
  private home = true;
  private updaters: Array<(time: number) => void> = [];

  constructor(host: HTMLElement) {
    this.host = host;
    let renderer: any;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      this.failed = true;
      host.replaceChildren();
      const note = document.createElement("p");
      note.className = "grid h-full place-items-center px-6 text-center text-sm text-paper-2";
      note.textContent = "এই ব্রাউজারে 3D চালানো যায়নি।";
      host.append(note);
      return;
    }
    this.renderer = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x10161d, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = 0;
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%;touch-action:none";
    renderer.domElement.setAttribute("aria-label", "মহাকর্ষ ও অভিকর্ষের ত্রিমাত্র দৃশ্য");
    host.append(renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.domElement.style.cssText = "position:absolute;inset:0;pointer-events:none";
    host.append(this.labelRenderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.08, 80);
    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.minDistance = 1.4;
    this.controls.maxDistance = 16;
    this.controls.target.set(0, 0.6, 0);
    this.controls.update();

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.72));
    this.scene.add(new THREE.HemisphereLight(0xf4efe4, 0x1a2822, 0.45));
    const sun = new THREE.DirectionalLight(0xffffff, 1.15);
    sun.position.set(4, 7, 5);
    this.scene.add(sun);

    const grid = new THREE.GridHelper(14, 28, 0x3d564c, 0x24362f);
    const mats = Array.isArray(grid.material) ? grid.material : [grid.material];
    for (const mat of mats) {
      mat.transparent = true;
      mat.opacity = 0.28;
    }
    grid.position.y = -0.02;
    this.scene.add(grid);

    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.clock = new THREE.Clock();
    this.resize();
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(host);
    this.loop();
  }

  setState(state: ViewState) {
    if (this.failed) return;
    if (this.state?.family !== state.family) this.home = true;
    this.state = state;
    this.playing = state.playing;
    this.speed = state.speed;
  }

  resetTime() {
    this.time = 0;
  }

  resetCamera() {
    if (this.failed) return;
    this.controls.reset();
  }

  dispose() {
    this.alive = false;
    if (this.failed) return;
    cancelAnimationFrame(this.frame);
    this.observer?.disconnect();
    this.controls?.dispose();
    this.clearRoot();
    this.renderer?.dispose();
    this.renderer?.forceContextLoss?.();
    this.renderer?.domElement.remove();
    this.labelRenderer?.domElement.remove();
  }

  private loop = () => {
    if (!this.alive || this.failed) return;
    this.frame = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, this.clock.getDelta());
    if (this.playing) this.time += dt * this.speed;
    this.ensure();
    if (this.home && this.state) {
      const cam = CAM[this.state.family];
      this.camera.position.set(...cam.pos);
      this.controls.target.set(...cam.target);
      this.controls.update();
      this.controls.saveState();
      this.home = false;
    }
    for (const update of this.updaters) update(this.time);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  };

  private resize() {
    const width = Math.max(this.host.clientWidth, 1);
    const height = Math.max(this.host.clientHeight, 1);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.labelRenderer.setSize(width, height);
  }

  private ensure() {
    if (!this.state) return;
    const key = JSON.stringify({
      family: this.state.family,
      focus: this.state.focus,
      params: this.state.params,
      lang: this.state.lang,
    });
    if (key === this.key) return;
    this.key = key;
    this.clearRoot();
    this.updaters = [];
    this.build(this.state);
  }

  private clearRoot() {
    const geometries = new Set<any>();
    const materials = new Set<any>();
    for (const child of [...this.root.children]) {
      this.root.remove(child);
      child.traverse((node: any) => {
        if (node.element) node.element.remove();
        if (node.geometry && !geometries.has(node.geometry)) {
          geometries.add(node.geometry);
          node.geometry.dispose();
        }
        const list = Array.isArray(node.material) ? node.material : node.material ? [node.material] : [];
        for (const item of list) {
          if (materials.has(item)) continue;
          materials.add(item);
          item.map?.dispose();
          item.dispose();
        }
      });
    }
  }

  private std(color: number, extra: Record<string, unknown> = {}) {
    return new THREE.MeshStandardMaterial({ color, roughness: 0.46, metalness: 0.08, ...extra });
  }

  private add(mesh: any) {
    this.root.add(mesh);
    return mesh;
  }

  private tag(text: string, x: number, y: number, z: number) {
    const el = document.createElement("div");
    el.textContent = text;
    el.style.cssText = "color:#f6f1e6;font:700 12px/1.2 sans-serif;white-space:nowrap;text-shadow:0 1px 2px #000";
    const obj = new CSS2DObject(el);
    obj.position.set(x, y, z);
    this.root.add(obj);
    return { obj, el };
  }

  private line(points: any[], color: number, opacity = 1) {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity });
    return this.add(new THREE.Line(geo, mat));
  }

  private ring(radius: number, y: number, color: number) {
    const pts = [];
    for (let i = 0; i <= 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
    }
    return this.line(pts, color, 0.85);
  }

  private earth(radius: number, y: number, opacity = 1) {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 36, 28),
      this.std(0x2f6f86, { transparent: opacity < 1, opacity, roughness: 0.62 }),
    );
    const eq = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.015, Math.max(0.008, radius * 0.018), 8, 48), this.std(0xf2d48a));
    eq.rotation.x = Math.PI / 2;
    group.add(mesh, eq);
    group.position.y = y;
    this.root.add(group);
    return group;
  }

  private build(state: ViewState) {
    const table: Record<Family, () => void> = {
      attract: () => this.buildAttract(state),
      trio: () => this.buildTrio(state),
      drop: () => this.buildDrop(state),
      globe: () => this.buildGlobe(state),
      field: () => this.buildField(state),
      pot: () => this.buildPot(state),
      orbit: () => this.buildOrbit(state),
      escape: () => this.buildEscape(state),
      kepler: () => this.buildKepler(state),
      weigh: () => this.buildWeigh(state),
    };
    table[state.family]();
  }

  private buildAttract(state: ViewState) {
    const p = state.params;
    const bn = state.lang === "bn";
    const sep = 1.15 + 1.35 * Math.log10(Math.max(p.gap, 16) / 16);
    const leftR = 0.18 + 0.22 * Math.cbrt(p.mass1 / 6);
    const rightR = 0.18 + 0.22 * Math.cbrt(p.mass2 / 6);
    const left = this.add(new THREE.Mesh(new THREE.SphereGeometry(leftR, 24, 18), this.std(0x3d7ea6)));
    const right = this.add(new THREE.Mesh(new THREE.SphereGeometry(rightR, 24, 18), this.std(0xc46a4a)));
    left.position.set(-sep, 0.7, 0);
    right.position.set(sep, 0.7, 0);
    const f = gravityForce(p);
    const ref = gravityForce({ ...p, mass1: 6, mass2: 6, gap: 40 });
    const len = Math.max(0.16, Math.min(1.35, 0.62 * (f / Math.max(ref, 1)) ** 0.62));
    const a1 = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(-sep + leftR + 0.02, 0.7, 0), len, 0xf2d48a, 0.16, 0.08);
    const a2 = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(sep - rightR - 0.02, 0.7, 0), len, 0xf2d48a, 0.16, 0.08);
    this.add(a1);
    this.add(a2);
    this.tag(bn ? "m₁" : "m₁", -sep, 0.7 + leftR + 0.18, 0);
    this.tag(bn ? "m₂" : "m₂", sep, 0.7 + rightR + 0.18, 0);
    const beads = Array.from({ length: 6 }, () => this.add(new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), this.std(0xf6f1e6))));
    this.updaters.push((time) => {
      beads.forEach((bead: any, i: number) => {
        const u = (time * 0.28 + i / 6) % 1;
        const from = i % 2 === 0 ? -sep + leftR : sep - rightR;
        const to = i % 2 === 0 ? sep - rightR : -sep + leftR;
        bead.position.set(from + (to - from) * u, 0.7, 0.12);
      });
    });
  }

  private buildTrio(state: ViewState) {
    const bn = state.lang === "bn";
    const sun = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.42, 28, 20), this.std(0xe7a15a, { emissive: 0x8a4e12, emissiveIntensity: 0.45 })));
    sun.position.set(-1.7, EY, 0);
    const earth = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 16), this.std(0x3d7ea6)));
    const moon = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), this.std(0xd9d3c7)));
    this.tag(bn ? "সূর্য" : "Sun", -1.7, EY + 0.62, 0);
    this.tag(bn ? "দূরত্ব ও আকার স্কেলে নয়" : "Distance and size are not to scale", 0.2, 1.85, 0);
    this.updaters.push((time) => {
      const earthA = time * ((2 * Math.PI) / 16);
      const moonA = time * ((2 * Math.PI) / 1.35);
      earth.position.set(-1.7 + Math.cos(earthA) * 1.35, EY, Math.sin(earthA) * 1.35);
      moon.position.set(earth.position.x + Math.cos(moonA) * 0.42, EY + 0.02, earth.position.z + Math.sin(moonA) * 0.42);
    });
  }

  private buildDrop(state: ViewState) {
    if (state.focus === "feather") return this.feather(state.lang === "bn");
    if (state.focus === "masses") return this.masses(state);
    const bn = state.lang === "bn";
    const p = state.params;
    const h = p.tower;
    const visual = 0.25 + h / 16;
    const pole = this.add(new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, visual, 8), this.std(0x8d6a43, { roughness: 0.7 })));
    pole.position.set(-0.55, visual / 2, 0);
    const ground = this.add(new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 1.1), this.std(0x3d564c)));
    ground.position.y = 0.03;
    const ball = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.1, 18, 14), this.std(0xc46a4a)));
    const arrow = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 0), 0.55, 0xf2d48a, 0.14, 0.08);
    this.add(arrow);
    this.tag(bn ? "g নিচের দিকে" : "g points down", 0.55, visual + 0.15, 0);
    const T = Math.sqrt((2 * h) / SURFACE_G);
    this.updaters.push((time) => {
      const u = time % (T + 0.45);
      const fallen = u < T ? 0.5 * SURFACE_G * u * u : h;
      const y = 0.16 + ((h - Math.min(fallen, h)) / h) * (visual - 0.2);
      ball.position.set(-0.15, y, 0);
      arrow.position.set(0.35, y + 0.15, 0);
    });
  }

  private masses(state: ViewState) {
    const bn = state.lang === "bn";
    const h = state.params.tower;
    const visual = 0.35 + h / 16;
    const ground = this.add(new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 1.1), this.std(0x3d564c)));
    ground.position.y = 0.03;
    const specs = [
      { x: -0.55, r: 0.07, color: 0x8fd0ef },
      { x: 0, r: 0.11, color: 0xc46a4a },
      { x: 0.55, r: 0.16, color: 0xf2d48a },
    ];
    const balls = specs.map((spec) => {
      const mesh = this.add(new THREE.Mesh(new THREE.SphereGeometry(spec.r, 18, 14), this.std(spec.color)));
      mesh.position.x = spec.x;
      return mesh;
    });
    this.tag(bn ? "একই সময়ে মাটি" : "The ground, together", 0, visual + 0.25, 0);
    const T = Math.sqrt((2 * h) / SURFACE_G);
    this.updaters.push((time) => {
      const u = time % (T + 0.45);
      const fallen = u < T ? 0.5 * SURFACE_G * u * u : h;
      const y = 0.16 + ((h - Math.min(fallen, h)) / h) * (visual - 0.25);
      for (const ball of balls) ball.position.y = y;
    });
  }

  private feather(bn: boolean) {
    const boxes = [-0.7, 0.7].map((x) => {
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.7, 1.7, 0.55)), new THREE.LineBasicMaterial({ color: 0xf6f1e6 }));
      edges.position.set(x, 0.95, 0);
      return this.add(edges);
    });
    void boxes;
    const airBall = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 12), this.std(0xc46a4a)));
    const airFeather = this.add(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.05), this.std(0xf6f1e6)));
    const vacBall = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 12), this.std(0xc46a4a)));
    const vacFeather = this.add(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.05), this.std(0xf6f1e6)));
    this.tag(bn ? "বাতাস" : "Air", -0.7, 1.95, 0);
    this.tag(bn ? "বায়ুশূন্য" : "Vacuum", 0.7, 1.95, 0);
    this.updaters.push((time) => {
      const u = time % 3.4;
      const free = Math.min(1, 0.5 * SURFACE_G * u * u / 20);
      const feather = 1 - Math.exp(-u / 2.4);
      const yOf = (frac: number) => 1.55 - frac * 1.15;
      airBall.position.set(-0.82, yOf(Math.min(1, free * 1.15)), 0);
      airFeather.position.set(-0.55, yOf(feather * 0.55), 0);
      airFeather.rotation.z = Math.sin(time * 6) * 0.5;
      vacBall.position.set(0.55, yOf(free), 0);
      vacFeather.position.set(0.85, yOf(free), 0);
    });
  }

  private buildGlobe(state: ViewState) {
    const focus = state.focus;
    if (focus === "regions") return this.regions(state.lang === "bn");
    if (focus === "equator") return this.equatorPole(state.lang === "bn");
    const p = state.params;
    const radius = 0.72;
    const seeThrough = focus === "depth" ? 0.38 : 1;
    const body = this.earth(radius, EY, seeThrough);
    const bn = state.lang === "bn";
    if (focus === "places" || focus === "spin") {
      const lat = (p.latitude * Math.PI) / 180;
      const pin = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), this.std(0xe7a15a)));
      pin.position.set(Math.cos(lat) * radius, EY + Math.sin(lat) * radius, 0);
      this.tag(bn ? "অক্ষাংশ" : "Latitude", pin.position.x, pin.position.y + 0.16, 0);
      if (focus === "spin") {
        const loss = spinLoss(p.latitude);
        const len = 0.15 + (loss / Math.max(spinLoss(0), 1e-6)) * 0.85;
        const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), pin.position.clone(), p.latitude > 88 ? 0.001 : len, 0xf2d48a, 0.12, 0.07);
        this.add(arrow);
        this.tag(bn ? "ঘূর্ণনের অংশ" : "Spin part", 1.15, EY + 0.2, 0);
      }
      this.updaters.push((time) => {
        body.rotation.y = time * 0.45;
      });
      return;
    }
    if (focus === "height") {
      const n = 1 + p.height / (R_EARTH / 1000);
      const probe = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), this.std(0xf6f1e6)));
      probe.position.set(radius * n, EY, 0);
      const gee = gHeight(p.height);
      const arrow = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), probe.position.clone(), 0.2 + (gee / SURFACE_G) * 0.7, 0xf2d48a, 0.12, 0.07);
      this.add(arrow);
      this.line([new THREE.Vector3(radius, EY, 0), probe.position.clone()], 0x8fd0ef, 0.7);
      this.tag(bn ? "উচ্চতা স্কেলে" : "Height to scale", radius * n, EY + 0.22, 0);
      return;
    }
    if (focus === "depth") {
      const n = Math.max(0.05, 1 - p.depth / (R_EARTH / 1000));
      const probe = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), this.std(0xf2d48a, { emissive: 0x8a6a22, emissiveIntensity: 0.4 })));
      probe.position.set(radius * n, EY, 0);
      const gee = gDepth(p.depth);
      const arrow = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), probe.position.clone(), 0.12 + (gee / SURFACE_G) * 0.55, 0xf6f1e6, 0.1, 0.06);
      this.add(arrow);
      this.tag(bn ? "সমান ঘনত্বের ছবি" : "Uniform-density picture", 0, EY + radius + 0.28, 0);
    }
  }

  private equatorPole(bn: boolean) {
    const radius = 0.78;
    this.earth(radius, EY);
    const pole = this.add(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, radius * 2.3, 8), this.std(0xf6f1e6)));
    pole.position.y = EY;
    this.tag(bn ? "মেরু · g বেশি" : "Pole · g larger", 0, EY + radius + 0.28, 0);
    this.tag(bn ? "বিষুব · g কম" : "Equator · g smaller", radius + 0.15, EY, 0);
  }

  private regions(bn: boolean) {
    const spots = [
      { x: -1.55, n: 0.5, label: bn ? "ভেতরে" : "Inside" },
      { x: 0, n: 1, label: bn ? "পৃষ্ঠ" : "Surface" },
      { x: 1.55, n: 2, label: bn ? "বাইরে" : "Outside" },
    ];
    for (const spot of spots) {
      const radius = 0.42;
      this.earth(radius, EY, spot.n < 1 ? 0.4 : 1);
      const body = this.root.children[this.root.children.length - 1];
      body.position.x = spot.x;
      const gee = gAtRatio(spot.n);
      const probeR = radius * spot.n;
      const origin = new THREE.Vector3(spot.x + probeR, EY, 0);
      const arrow = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), origin, 0.18 + (gee / SURFACE_G) * 0.55, 0xf2d48a, 0.1, 0.06);
      this.add(arrow);
      if (spot.n < 1) {
        const probe = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), this.std(0xf2d48a)));
        probe.position.copy(origin);
      }
      this.tag(spot.label, spot.x, EY + 0.78, 0);
    }
  }

  private buildField(state: ViewState) {
    const bn = state.lang === "bn";
    const focus = state.focus;
    const massScale = Math.cbrt(state.params.mass1 / 6);
    const radius = focus === "sphere" || focus === "fieldvary" ? 0.55 * massScale : 0.62;
    this.earth(radius, EY, 0.92);
    if (focus === "lines") {
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const outer = 1.7;
        const dir = new THREE.Vector3(-Math.cos(a), 0, -Math.sin(a));
        const origin = new THREE.Vector3(Math.cos(a) * outer, EY, Math.sin(a) * outer);
        this.add(new THREE.ArrowHelper(dir, origin, outer - radius - 0.05, 0x8fd0ef, 0.12, 0.06));
      }
      this.tag(bn ? "রেখা ভরের দিকে" : "Lines point inward", 0, EY + 1.9, 0);
      return;
    }
    const n = focus === "fieldvary" ? state.params.orbit : focus === "sphere" ? 1.35 : 1.08;
    const field = gAtRatio(focus === "intensity" ? 1 : n) * (state.params.mass1 / 6);
    const len = 0.2 + Math.min(1.1, (field / SURFACE_G) * 0.7);
    const count = focus === "intensity" ? 1 : 8;
    for (let i = 0; i < count; i++) {
      const a = (i / Math.max(count, 1)) * Math.PI * 2 + (count === 1 ? 0.4 : 0);
      const pr = Math.max(radius + 0.18, radius * n);
      const origin = new THREE.Vector3(Math.cos(a) * pr, EY, Math.sin(a) * pr);
      const dir = new THREE.Vector3(-Math.cos(a), 0, -Math.sin(a));
      this.add(new THREE.ArrowHelper(dir, origin, len, 0xf2d48a, 0.12, 0.06));
    }
    this.tag(bn ? "ক্ষেত্রপ্রাবল্য" : "Field strength", 0, EY + radius + 0.85, 0);
  }

  private buildPot(state: ViewState) {
    const bn = state.lang === "bn";
    const focus = state.focus;
    if (focus === "shells") {
      this.earth(0.48, EY);
      const shells = [1, 1.45, 2, 2.7];
      shells.forEach((n, i) => {
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.48 * n, 20, 14),
          new THREE.MeshBasicMaterial({ color: i === 0 ? 0xe7a15a : 0x8fd0ef, wireframe: true, transparent: true, opacity: 0.55 - i * 0.1 }),
        );
        mesh.position.y = EY;
        this.add(mesh);
      });
      this.tag(bn ? "কাছে বিভব আরও ঋণাত্মক" : "Closer potential is more negative", 0, EY + 1.55, 0);
      return;
    }
    if (focus === "pairU") {
      const p = state.params;
      const sep = 1.15 + 1.35 * Math.log10(Math.max(p.gap, 16) / 16);
      const a = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 14), this.std(0x3d7ea6)));
      const b = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 14), this.std(0xc46a4a)));
      a.position.set(-sep, 0.7, 0);
      b.position.set(sep, 0.7, 0);
      this.line([a.position.clone(), b.position.clone()], 0xf2d48a);
      this.tag(bn ? "কাছে |U| বড়" : "Closer, |U| is larger", 0, 1.25, 0);
      return;
    }
    if (focus === "compare") {
      this.earth(0.4, 0.45);
      const unit = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 12), this.std(0xf6f1e6)));
      const heavy = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.08 + state.params.mass * 0.015, 16, 12), this.std(0xc46a4a)));
      unit.position.set(-0.55, 1.35, 0);
      heavy.position.set(0.55, 1.35, 0);
      this.tag(bn ? "V একক ভর" : "V, unit mass", -0.55, 1.7, 0);
      this.tag(bn ? "U = mV" : "U = mV", 0.55, 1.7, 0);
      return;
    }
    const p = state.params;
    this.earth(0.55, 0.55);
    const n = 1 + p.height / (R_EARTH / 1000);
    const cargo = this.add(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), this.std(0xc46a4a)));
    const y0 = 1.15;
    const y1 = y0 + Math.min(1.4, (n - 1) * 1.3);
    this.line([new THREE.Vector3(0, y0, 0), new THREE.Vector3(0, y1, 0)], 0x8fd0ef);
    this.tag(bn ? "উপরে শক্তি বাড়ে" : "Energy rises as it is lifted", 0.35, y1 + 0.15, 0);
    this.updaters.push((time) => {
      cargo.position.set(0, y0 + (y1 - y0) * ping(time, 3.5), 0);
    });
  }

  private buildOrbit(state: ViewState) {
    const focus = state.focus;
    const bn = state.lang === "bn";
    if (focus === "moon") return this.moonOrbit(bn);
    if (focus === "leogeo") return this.leoGeo(bn);
    const n = focus === "geo" ? geoRatio() : state.params.orbit;
    const close = focus !== "geo" && n < 1.4;
    const drawn = close ? 1.48 : n;
    const radius = focus === "geo" ? 0.28 : 0.58;
    const body = this.earth(radius, EY);
    const city = new THREE.Mesh(new THREE.SphereGeometry(Math.max(0.028, radius * 0.08), 10, 8), this.std(0xe7a15a));
    city.position.set(radius, 0, 0);
    body.add(city);
    const orbitR = radius * drawn;
    this.ring(orbitR, EY, 0x8fd0ef);
    const sat = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), this.std(0xf6f1e6, { emissive: 0xf6f1e6, emissiveIntensity: 0.2 })));
    const speed = orbitalSpeed(n);
    if (focus === "speed" || focus === "centri") {
      const vel = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), 0.35 + (speed / orbitalSpeed(1)) * 0.45, 0xf2d48a, 0.12, 0.06);
      const pullArrow = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(), focus === "centri" ? 0.55 : 0.001, 0x8fd0ef, 0.1, 0.06);
      this.add(vel);
      this.add(pullArrow);
      this.updaters.push((time) => {
        const w = Math.sqrt(SURFACE_G / (R_EARTH * n ** 3)) * TURN;
        const a = time * w;
        body.rotation.y = time * ((2 * Math.PI) / SIDEREAL_DAY) * TURN;
        sat.position.set(Math.cos(a) * orbitR, EY, Math.sin(a) * orbitR);
        vel.position.copy(sat.position);
        vel.setDirection(new THREE.Vector3(-Math.sin(a), 0, Math.cos(a)));
        pullArrow.position.copy(sat.position);
        pullArrow.setDirection(new THREE.Vector3(-Math.cos(a), 0, -Math.sin(a)));
      });
      this.tag(focus === "centri" ? (bn ? "মহাকর্ষ = কেন্দ্রমুখী" : "Gravity = centripetal") : bn ? "স্পর্শক বেগ" : "Tangent velocity", 0, EY + orbitR + 0.25, 0);
      return;
    }
    const orbitLabel = focus === "geo" ? (bn ? "এক বিন্দুর ওপর" : "Above one point") : close ? (bn ? "কাছের কক্ষ একটু দূরে আঁকা" : "The low orbit is drawn a little farther out") : bn ? "কৃত্রিম উপগ্রহ" : "Satellite";
    this.tag(orbitLabel, 0, EY + orbitR + 0.22, 0);
    this.updaters.push((time) => {
      const w = Math.sqrt(SURFACE_G / (R_EARTH * n ** 3)) * TURN;
      const a = time * w;
      body.rotation.y = time * ((2 * Math.PI) / SIDEREAL_DAY) * TURN;
      sat.position.set(Math.cos(a) * orbitR, EY, Math.sin(a) * orbitR);
    });
  }

  private moonOrbit(bn: boolean) {
    const body = this.earth(0.42, EY);
    const moon = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), this.std(0xd9d3c7)));
    this.ring(1.55, EY, 0x8fd0ef);
    this.tag(bn ? "দূরত্ব ছবিতে কমানো" : "Distance compressed in the picture", 0, 2.15, 0);
    this.updaters.push((time) => {
      const moonA = time * 0.28;
      body.rotation.y = moonA * 27.3;
      moon.position.set(Math.cos(moonA) * 1.55, EY, Math.sin(moonA) * 1.55);
    });
  }

  private leoGeo(bn: boolean) {
    const geo = geoRatio();
    const pair = [
      { x: -1.7, radius: 0.32, n: 1.05, drawn: 1.7, label: bn ? "নিচু কক্ষ · একটু দূরে আঁকা" : "Low orbit · drawn a little farther out" },
      { x: 1.9, radius: 0.2, n: geo, drawn: geo, label: bn ? "ভূস্থির" : "Geostationary" },
    ];
    const rigs = pair.map((item) => {
      const body = this.earth(item.radius, EY);
      body.position.x = item.x;
      const city = new THREE.Mesh(new THREE.SphereGeometry(item.radius * 0.1, 8, 8), this.std(0xe7a15a));
      city.position.set(item.radius, 0, 0);
      body.add(city);
      this.ring(item.radius * item.drawn, EY, 0x8fd0ef);
      const ring = this.root.children[this.root.children.length - 1];
      ring.position.x = item.x;
      const sat = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), this.std(0xf6f1e6)));
      this.tag(item.label, item.x, EY + item.radius * item.drawn + 0.2, 0);
      return { ...item, body, sat };
    });
    this.updaters.push((time) => {
      for (const rig of rigs) {
        const a = time * Math.sqrt(SURFACE_G / (R_EARTH * rig.n ** 3)) * TURN;
        rig.body.rotation.y = time * ((2 * Math.PI) / SIDEREAL_DAY) * TURN;
        rig.sat.position.set(rig.x + Math.cos(a) * rig.radius * rig.drawn, EY, Math.sin(a) * rig.radius * rig.drawn);
      }
    });
  }

  private buildEscape(state: ViewState) {
    const focus = state.focus;
    const bn = state.lang === "bn";
    if (focus === "rockets") return this.rockets(state);
    if (focus === "well") return this.well(state);
    if (focus === "float") return this.float(bn);
    if (focus === "elevator") return this.elevator(state);
    const radius = 0.55;
    this.earth(radius, EY);
    const samples = climbSamples(escapeSpeed() / 1000);
    const rocket = this.add(new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 10), this.std(0xf6f1e6)));
    this.tag(bn ? "মুক্তিবেগ" : "Escape speed", 0.4, EY + radius + 0.4, 0);
    this.updaters.push((time) => {
      const n = samples[Math.min(samples.length - 1, Math.floor(time * 40))] ?? 1;
      rocket.position.set(0, EY + radius * n, 0);
    });
  }

  private rockets(state: ViewState) {
    const bn = state.lang === "bn";
    const radius = 0.5;
    this.earth(radius, EY);
    const guides = [4, 7.9, 10, 11.2, 14];
    const colors = [0xc46a4a, 0x7dcea0, 0xf2d48a, 0x8fd0ef, 0xd7b4f3];
    guides.forEach((speed, index) => {
      const pts = flightPath(speed).map(([x, y]) => new THREE.Vector3((x - 1) * radius + radius, EY, y * radius));
      if (pts.length > 1) this.line(pts, colors[index], 0.45);
    });
    const chosen = flightPath(state.params.speed);
    const bright = chosen.map(([x, y]) => new THREE.Vector3((x - 1) * radius + radius, EY + 0.02, y * radius));
    if (bright.length > 1) this.line(bright, 0xffffff);
    const dot = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), this.std(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.5 })));
    this.tag(bn ? "সাদা পথটি স্লাইডারের বেগ" : "The white path is the slider speed", 0, 2.15, 0);
    this.updaters.push((time) => {
      if (!bright.length) return;
      const i = Math.floor(time * 18) % bright.length;
      dot.position.copy(bright[i]);
    });
  }

  private well(state: ViewState) {
    const bn = state.lang === "bn";
    const pts = [];
    for (let i = 0; i <= 48; i++) {
      const n = 1 + (i / 48) * 6;
      pts.push(new THREE.Vector3(-1.4 + (n - 1) * 0.55, 1.55 - 1.2 / n, 0));
    }
    this.line(pts, 0x8fd0ef);
    const samples = climbSamples(state.params.speed);
    const ball = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 12), this.std(0xf2d48a, { emissive: 0x8a6a22, emissiveIntensity: 0.35 })));
    this.tag(bn ? "শক্তির চিত্র · দূরত্ব স্কেলে নয়" : "Energy picture · distance not to scale", 0, 1.85, 0);
    this.updaters.push((time) => {
      const n = samples[Math.min(samples.length - 1, Math.floor(time * 35))] ?? 1;
      const shown = Math.min(n, 7);
      ball.position.set(-1.4 + (shown - 1) * 0.55, 1.55 - 1.2 / shown, 0);
    });
  }

  private float(bn: boolean) {
    const radius = 0.48;
    const body = this.earth(radius, EY);
    const orbitR = radius * 1.7;
    this.ring(orbitR, EY, 0x8fd0ef);
    const cabin = new THREE.Group();
    cabin.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.28, 0.36, 0.28)), new THREE.LineBasicMaterial({ color: 0xf6f1e6 })));
    const person = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), this.std(0xe7a15a));
    person.position.y = 0.02;
    cabin.add(person);
    this.add(cabin);
    this.tag(bn ? "মেঝে ঠেলে না" : "The floor does not push", 0, EY + orbitR + 0.35, 0);
    this.updaters.push((time) => {
      const a = time * 0.7;
      body.rotation.y = a * 0.2;
      cabin.position.set(Math.cos(a) * orbitR, EY, Math.sin(a) * orbitR);
      cabin.lookAt(0, EY, 0);
      person.position.y = 0.02 + Math.sin(time * 1.4) * 0.04;
    });
  }

  private elevator(state: ViewState) {
    const bn = state.lang === "bn";
    const cabin = new THREE.Group();
    cabin.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.7, 1.05, 0.6)), new THREE.LineBasicMaterial({ color: 0xf6f1e6 })));
    const scale = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.16), this.std(0x8d6a43));
    scale.position.y = -0.42;
    const spring = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 10), this.std(0xf2d48a));
    spring.position.y = -0.28;
    const person = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.22, 4, 10), this.std(0xc46a4a));
    person.position.y = -0.12;
    cabin.add(scale, spring, person);
    this.add(cabin);
    const note = this.tag("", 0, 1.7, 0);
    void state.params.mass;
    this.updaters.push((time) => {
      const cycle = time % 7;
      const falling = cycle > 2.6;
      const drop = falling ? Math.min(0.85, (cycle - 2.6) * 0.55) : 0;
      cabin.position.y = 1.15 - drop;
      spring.scale.y = falling ? 1 : 0.42;
      spring.position.y = falling ? -0.22 : -0.32;
      person.position.y = falling ? -0.05 : -0.16;
      note.el.textContent = falling ? (bn ? "দড়ি ছিঁড়েছে · N = 0" : "Cable cut · N = 0") : bn ? "স্থির · N = mg" : "At rest · N = mg";
      note.obj.position.y = cabin.position.y + 0.75;
    });
  }

  private buildKepler(state: ViewState) {
    const bn = state.lang === "bn";
    const focus = state.focus;
    if (focus === "k3") return this.kepler3(bn);
    const a = 1.45;
    const e = 0.45;
    const b = a * Math.sqrt(1 - e * e);
    const pts = [];
    for (let i = 0; i <= 90; i++) {
      const E = (i / 90) * Math.PI * 2;
      pts.push(new THREE.Vector3(a * (Math.cos(E) - e), 0, b * Math.sin(E)));
    }
    this.line(pts, 0x8fd0ef);
    const sun = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.14, 18, 14), this.std(0xe7a15a, { emissive: 0x8a4e12, emissiveIntensity: 0.4 })));
    sun.position.set(0, 0.02, 0);
    const empty = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), this.std(0xf6f1e6, { transparent: true, opacity: 0.35 })));
    empty.position.set(-2 * a * e, 0.02, 0);
    this.tag(bn ? "সূর্য একটি ফোকাসে" : "The Sun is at one focus", 0, 0.4, 0);
    if (focus === "k2") {
      this.wedge(a, e, 0, 0xe7a15a);
      this.wedge(a, e, Math.PI, 0x8fd0ef);
      this.tag(bn ? "সমান সময় · সমান ক্ষেত্র" : "Equal time · equal area", 0, 1.7, 0);
    }
    const planet = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), this.std(0x7dcea0)));
    this.updaters.push((time) => {
      const M = (time / 10) * Math.PI * 2;
      const E = solveE(M % (Math.PI * 2), e);
      planet.position.set(a * (Math.cos(E) - e), 0.05, b * Math.sin(E));
    });
  }

  private wedge(a: number, e: number, start: number, color: number) {
    const target = 0.1 * Math.PI * a * a * Math.sqrt(1 - e * e);
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    let area = 0;
    let th = start;
    const dth = 0.03;
    for (let i = 0; i < 240 && area < target; i++) {
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(th));
      area += 0.5 * r * r * dth;
      shape.lineTo(r * Math.cos(th), r * Math.sin(th));
      th += dth;
    }
    shape.lineTo(0, 0);
    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.38, side: THREE.DoubleSide }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.03;
    this.add(mesh);
  }

  private kepler3(bn: boolean) {
    const sun = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), this.std(0xe7a15a, { emissive: 0x8a4e12, emissiveIntensity: 0.4 })));
    sun.position.y = 0.02;
    this.ring(0.7, 0, 0x8fd0ef);
    this.ring(1.4, 0, 0xf2d48a);
    const inner = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), this.std(0x8fd0ef)));
    const outer = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), this.std(0xf2d48a)));
    this.tag(bn ? "a" : "a", 0.85, 0.2, 0);
    this.tag(bn ? "2a" : "2a", 1.6, 0.2, 0);
    this.tag(bn ? "T² / a³ একই" : "T² / a³ is the same", 0, 1.8, 0);
    this.updaters.push((time) => {
      const innerA = time * 1.1;
      const outerA = time * (1.1 / 2 ** 1.5);
      inner.position.set(Math.cos(innerA) * 0.7, 0.05, Math.sin(innerA) * 0.7);
      outer.position.set(Math.cos(outerA) * 1.4, 0.05, Math.sin(outerA) * 1.4);
    });
  }

  private buildWeigh(state: ViewState) {
    const bn = state.lang === "bn";
    const focus = state.focus;
    if (focus === "planets") return this.planets(bn);
    if (focus === "balance") return this.balances(state);
    if (focus === "weights") return this.twoWeights(state);
    const p = state.params;
    const squash = Math.min(0.72, Math.sqrt(p.mass * p.gee) / 26);
    const stand = this.add(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.08, 20), this.std(0x8d6a43)));
    stand.position.y = 0.2;
    const spring = this.add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 12), this.std(0xf2d48a)));
    const box = this.add(new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.28), this.std(0xc46a4a)));
    this.tag(bn ? "স্প্রিং ওজন মাপে" : "The spring measures weight", 0, 1.45, 0);
    this.updaters.push((time) => {
      const load = 0.75 + 0.25 * Math.sin(time * 1.5);
      const s = 1 - squash * load;
      spring.scale.y = s;
      spring.position.y = 0.28 + (0.7 * s) / 2;
      box.position.y = spring.position.y + (0.7 * s) / 2 + 0.12;
      box.scale.setScalar(Math.min(1.25, 0.55 + Math.cbrt(p.mass) / 6));
    });
  }

  private twoWeights(state: ViewState) {
    const bn = state.lang === "bn";
    const mass = state.params.mass;
    const spots = [
      { x: -0.7, g: SURFACE_G, label: bn ? "পৃথিবী" : "Earth", color: 0x3d7ea6 },
      { x: 0.7, g: G_MOON, label: bn ? "চাঁদ" : "Moon", color: 0xd9d3c7 },
    ];
    for (const spot of spots) {
      const globe = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 14), this.std(spot.color)));
      globe.position.set(spot.x, 0.28, 0);
      const squash = Math.min(0.6, (mass * spot.g) / 180);
      const spring = this.add(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.55, 10), this.std(0xf2d48a)));
      const box = this.add(new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.18), this.std(0xc46a4a)));
      spring.scale.y = 1 - squash;
      spring.position.set(spot.x, 0.7 + (0.55 * spring.scale.y) / 2, 0);
      box.position.set(spot.x, spring.position.y + (0.55 * spring.scale.y) / 2 + 0.1, 0);
      this.tag(spot.label, spot.x, 1.55, 0);
    }
  }

  private balances(state: ViewState) {
    const bn = state.lang === "bn";
    const mass = state.params.mass;
    const columns = [
      { x: -1.15, g: SURFACE_G, label: bn ? "পৃথিবী" : "Earth" },
      { x: 1.15, g: G_MOON, label: bn ? "চাঁদ" : "Moon" },
    ];
    for (const col of columns) {
      const squash = Math.min(0.62, (mass * col.g) / 160);
      const spring = this.add(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 10), this.std(0xf2d48a)));
      spring.scale.y = 1 - squash;
      spring.position.set(col.x - 0.28, 0.35 + (0.5 * spring.scale.y) / 2, 0);
      const pan = this.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 12), this.std(0xc46a4a)));
      pan.position.set(col.x - 0.28, spring.position.y + 0.16, 0);
      const beam = this.add(new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.03, 0.04), this.std(0xb7c2cc)));
      beam.position.set(col.x + 0.28, 0.85, 0);
      const left = this.add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 10), this.std(0xc46a4a)));
      const right = left.clone();
      left.position.set(col.x + 0.1, 0.55, 0);
      right.position.set(col.x + 0.46, 0.55, 0);
      this.add(right);
      this.tag(col.label, col.x, 1.2, 0);
    }
    this.tag(bn ? "স্প্রিং কমে, দণ্ড সমান থাকে" : "The spring shortens, the beam stays level", 0, 1.55, 0);
  }

  private planets(bn: boolean) {
    const worlds = [
      { name: bn ? "চাঁদ" : "Moon", g: G_MOON, color: 0xd9d3c7 },
      { name: bn ? "মঙ্গল" : "Mars", g: 3.7, color: 0xc46a4a },
      { name: bn ? "পৃথিবী" : "Earth", g: SURFACE_G, color: 0x3d7ea6 },
      { name: bn ? "শুক্র" : "Venus", g: 8.9, color: 0xe7a15a },
      { name: bn ? "বৃহস্পতি" : "Jupiter", g: 24.8, color: 0xd7b4a0 },
    ];
    worlds.forEach((world, i) => {
      const x = (i - 2) * 0.72;
      const globe = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), this.std(world.color)));
      globe.position.set(x, 0.28, 0);
      const barH = 0.08 + (world.g / 24.8) * 1.15;
      const bar = this.add(new THREE.Mesh(new THREE.BoxGeometry(0.12, barH, 0.12), this.std(0xf2d48a)));
      bar.position.set(x, 0.7 + barH / 2, 0);
      this.tag(world.name, x, 0.12, 0.35);
    });
    this.tag(bn ? "আনুমানিক পৃষ্ঠের g" : "Approximate surface g", 0, 2.15, 0);
  }
}
