import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import type { Family } from "./catalog";
import {
  capillaryHeight,
  seeStrain,
  shearStrain,
  splitDrops,
  strainOf,
  terminalSpeed,
  viscosityAt,
  volumeStrain,
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
  rod: { pos: [0.4, 1.5, 4.4], target: [0, 0.7, 0] },
  spring: { pos: [0.6, 1.3, 4.2], target: [0, 0.4, 0] },
  pair: { pos: [0.2, 1.4, 4.8], target: [0, 0.6, 0] },
  cube: { pos: [1.2, 1.5, 3.8], target: [0, 0.5, 0] },
  shear: { pos: [1.4, 1.3, 3.6], target: [0, 0.45, 0] },
  graph: { pos: [0.2, 1.5, 4.6], target: [0.2, 0.7, 0] },
  moduli: { pos: [0.2, 1.6, 5.6], target: [0, 0.55, 0] },
  surface: { pos: [0.3, 1.5, 4.4], target: [0, 0.4, 0] },
  film: { pos: [0.2, 1.2, 4], target: [0, 0.3, 0] },
  drops: { pos: [0.2, 1.3, 4.6], target: [0, 0.35, 0] },
  capillary: { pos: [0.3, 1.5, 4.4], target: [0, 0.7, 0] },
  fall: { pos: [0.2, 1.4, 4.8], target: [0, 0.8, 0] },
  layers: { pos: [1.3, 1.4, 3.8], target: [0, 0.45, 0] },
  flow: { pos: [0.1, 1.2, 4.6], target: [0, 0.35, 0] },
  bern: { pos: [0.2, 1.5, 5], target: [0, 0.55, 0] },
  life: { pos: [0.4, 1.5, 4.4], target: [0, 0.6, 0] },
};

const WIDE = 0.46;

function throat(x: number) {
  const neck = WIDE / 2.4;
  return WIDE - (WIDE - neck) * Math.exp(-((x / 0.42) ** 2));
}

function pipeX(unit: number, start = -1.7, span = 3.4) {
  const steps = 28;
  let travel = 0;
  const dts: number[] = [];
  for (let i = 0; i < steps; i++) {
    const x = start + (i / steps) * span;
    const dt = span / steps / (WIDE / throat(x)) ** 2;
    dts.push(dt);
    travel += dt;
  }
  let left = (((unit % 1) + 1) % 1) * travel;
  let x = start;
  for (let i = 0; i < steps; i++) {
    if (left <= dts[i]) return x + (span / steps) * (left / dts[i]);
    left -= dts[i];
    x += span / steps;
  }
  return start + span;
}

function ping(time: number, seconds = 5) {
  const turn = (time % (seconds * 2)) / seconds;
  return turn <= 1 ? turn : 2 - turn;
}

export class MatterWorld {
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
    renderer.domElement.setAttribute("aria-label", "পদার্থের গাঠনিক ধর্মের ত্রিমাত্র দৃশ্য");
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
    this.controls.minDistance = 1.6;
    this.controls.maxDistance = 12;
    this.controls.target.set(0, 0.6, 0);
    this.controls.update();

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.72));
    this.scene.add(new THREE.HemisphereLight(0xf4efe4, 0x1a2822, 0.45));
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(4, 7, 5);
    this.scene.add(sun);

    const grid = new THREE.GridHelper(12, 24, 0x3d564c, 0x24362f);
    const mats = Array.isArray(grid.material) ? grid.material : [grid.material];
    for (const mat of mats) {
      mat.transparent = true;
      mat.opacity = 0.35;
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
    return new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.08, ...extra });
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

  private build(state: ViewState) {
    const table: Record<Family, (state: ViewState) => void> = {
      rod: (s) => this.buildRod(s),
      spring: (s) => this.buildSpring(s),
      pair: (s) => this.buildPair(s),
      cube: (s) => this.buildCube(s),
      shear: (s) => this.buildShear(s),
      graph: (s) => this.buildGraph(s),
      moduli: (s) => this.buildModuli(s),
      surface: (s) => this.buildSurface(s),
      film: (s) => this.buildFilm(s),
      drops: (s) => this.buildDrops(s),
      capillary: (s) => this.buildCapillary(s),
      fall: (s) => this.buildFall(s),
      layers: (s) => this.buildLayers(s),
      flow: (s) => this.buildFlow(s),
      bern: (s) => this.buildBern(s),
      life: (s) => this.buildLife(s),
    };
    table[state.family](state);
  }

  private bar(len: number, radius: number, color: number) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, len, 20), this.std(color, { metalness: 0.35, roughness: 0.32 }));
    mesh.castShadow = true;
    return mesh;
  }

  private buildRod(state: ViewState) {
    const focus = state.focus;
    if (focus === "materials") return this.materialRow(state.params, state.lang === "bn");
    if (focus === "trio") return this.trio(state.params, state.lang === "bn");
    if (focus === "strains") return this.strainBars(state);
    if (focus === "elastic" || focus === "load") return this.cycleBar(state);
    this.hanging(state);
  }

  private hanging(state: ViewState) {
    const p = state.params;
    const bn = state.lang === "bn";
    const strain = state.focus === "strain-set" ? p.strain * 1e-4 : strainOf(p);
    const shown = seeStrain(strain);
    const beam = this.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.28), this.std(0x8d6a43, { roughness: 0.7 })));
    beam.position.y = 1.7;
    const wire = this.bar(1.15, 0.035, state.focus === "poisson" && p.young < 1 ? 0x2c3338 : 0xb7c2cc);
    this.add(wire);
    const mass = this.add(new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.28), this.std(0xc46a4a, { roughness: 0.4 })));
    const ghost = this.add(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.15, 12), this.std(0xf6f1e6, { transparent: true, opacity: 0.13 })));
    ghost.position.y = 1.08;
    const label = this.tag(bn ? "তার" : "Wire", 0.45, 1.15, 0);
    this.updaters.push((time) => {
      const load = 0.35 + 0.65 * ping(time, 4.5);
      const stretch = shown * load;
      const thin = state.focus === "shape" || state.focus === "poisson" ? Math.min(0.45, p.poisson * Math.abs(stretch) * 1.4) : 0.08;
      wire.scale.set(1 - thin, 1 + stretch, 1 - thin);
      wire.position.y = 1.66 - (1.15 * wire.scale.y) / 2;
      mass.position.y = wire.position.y - (1.15 * wire.scale.y) / 2 - 0.12;
      label.obj.position.y = wire.position.y;
      label.el.textContent = bn ? "প্রসারণ বাড়িয়ে দেখানো" : "Stretch enlarged";
    });
  }

  private cycleBar(state: ViewState) {
    const bn = state.lang === "bn";
    const shown = seeStrain(strainOf({ ...state.params, young: state.params.young }));
    const rod = this.bar(1.5, 0.09, 0xb7c2cc);
    rod.rotation.z = Math.PI / 2;
    this.add(rod);
    rod.position.y = 0.7;
    const mark = this.tag("", 0, 1.15, 0);
    this.updaters.push((time) => {
      const s = Math.sin(time * 0.8);
      rod.scale.y = 1 + shown * s * 1.6;
      mark.el.textContent = s >= 0 ? (bn ? "টান · লম্বা" : "Tension · longer") : bn ? "চাপ · খাটো" : "Compression · shorter";
    });
  }

  private materialRow(p: Params, bn: boolean) {
    const specs = [
      { name: bn ? "ইস্পাত" : "Steel", young: 200, color: 0xb7c2cc, x: -1.15 },
      { name: bn ? "তামা" : "Copper", young: 110, color: 0xc47a45, x: 0 },
      { name: bn ? "রাবার" : "Rubber", young: 0.05, color: 0x2c3338, x: 1.15 },
    ];
    for (const spec of specs) {
      const wire = this.bar(1.05, spec.young < 1 ? 0.07 : 0.03, spec.color);
      this.add(wire);
      wire.position.set(spec.x, 1.05, 0);
      const weight = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), this.std(0xd4783c)));
      this.tag(spec.name, spec.x, 1.75, 0);
      const shown = seeStrain(strainOf({ ...p, young: spec.young, area: 1, length: 1 }));
      this.updaters.push((time) => {
        const load = 0.25 + 0.75 * ping(time, 5);
        wire.scale.y = 1 + shown * load;
        wire.position.y = 1.62 - (1.05 * wire.scale.y) / 2;
        weight.position.set(spec.x, wire.position.y - (1.05 * wire.scale.y) / 2 - 0.12, 0);
      });
    }
  }

  private trio(p: Params, bn: boolean) {
    const spring = this.helix(0.9, 0xc9a36a);
    this.add(spring);
    spring.position.x = -1.15;
    const wire = this.bar(0.95, 0.025, 0xb7c2cc);
    this.add(wire);
    wire.position.x = 0;
    const rubber = this.bar(0.95, 0.07, 0x2c3338);
    this.add(rubber);
    rubber.position.x = 1.15;
    this.tag(bn ? "স্প্রিং" : "Spring", -1.15, 1.7, 0);
    this.tag(bn ? "তার" : "Wire", 0, 1.7, 0);
    this.tag(bn ? "রাবার" : "Rubber", 1.15, 1.7, 0);
    const wireShown = seeStrain(strainOf({ ...p, young: 200, area: 0.5, length: 1 }));
    const rubberShown = seeStrain(strainOf({ ...p, young: 0.05, area: 1, length: 1 }));
    const springShown = Math.min(0.45, p.force / 40);
    this.updaters.push((time) => {
      const load = ping(time, 4.2);
      spring.scale.y = 1 + springShown * load;
      spring.position.y = 0.55;
      wire.scale.y = 1 + wireShown * load;
      wire.position.y = 1.15 - wireShown * load * 0.2;
      rubber.scale.y = 1 + rubberShown * load;
      rubber.position.y = 1.15 - rubberShown * load * 0.15;
    });
  }

  private strainBars(state: ViewState) {
    const p = state.params;
    const bn = state.lang === "bn";
    const long = Math.abs(strainOf(p));
    const lat = p.poisson * long;
    const max = Math.max(long, 1e-8);
    const tall = this.add(new THREE.Mesh(new THREE.BoxGeometry(0.28, 1, 0.28), this.std(0xe7a15a)));
    const side = this.add(new THREE.Mesh(new THREE.BoxGeometry(0.28, 1, 0.28), this.std(0x8fd0ef)));
    tall.position.x = -0.45;
    side.position.x = 0.45;
    this.tag(bn ? "অনুদৈর্ঘ্য" : "Longitudinal", -0.45, 1.55, 0);
    this.tag(bn ? "অনুপ্রস্থ" : "Lateral", 0.45, 1.55, 0);
    this.updaters.push((time) => {
      const load = 0.45 + 0.55 * ping(time, 4);
      const h1 = 0.2 + 1.15 * load;
      const h2 = 0.2 + 1.15 * (lat / max) * load;
      tall.scale.y = h1;
      side.scale.y = h2;
      tall.position.y = h1 / 2;
      side.position.y = h2 / 2;
    });
  }

  private helix(length: number, color: number) {
    const turns = 9;
    const n = 90;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const a = t * turns * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * 0.16, t * length, Math.sin(a) * 0.16));
    }
    return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n, 0.028, 6, false), this.std(color, { metalness: 0.45, roughness: 0.3 }));
  }

  private buildSpring(state: ViewState) {
    const p = state.params;
    const bn = state.lang === "bn";
    const rest = 0.85;
    const x = p.spring > 0 ? p.force / p.spring : 0;
    const coil = this.helix(rest, 0xd4a054);
    this.add(coil);
    const wall = this.add(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.7), this.std(0x8d6a43, { roughness: 0.75 })));
    wall.position.set(-0.2, rest / 2, 0);
    const block = this.add(new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), this.std(0xc46a4a)));
    const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 0.6, 0xe25b45, 0.14, 0.08);
    this.add(arrow);
    const label = this.tag(state.focus === "hooke" ? "F = kx" : bn ? "ছেড়ে দিলে ফেরে" : "It returns", 0.2, rest + 0.35, 0);
    coil.rotation.z = Math.PI / 2;
    this.updaters.push((time) => {
      const wave = state.focus === "spring" ? ping(time, 4.2) : 0.55 + 0.45 * Math.sin(time * 0.9);
      const stretch = Math.min(0.7, x * 1.6) * wave;
      coil.scale.y = 1 + stretch;
      const end = -0.05 + rest * coil.scale.y;
      coil.position.set(-0.15, rest / 2, 0);
      block.position.set(end * 0.15 + stretch * 0.8, rest / 2, 0);
      arrow.position.set(block.position.x + 0.2, rest / 2, 0);
      arrow.setLength(0.25 + stretch * 0.9, 0.14, 0.08);
      label.el.textContent = state.focus === "hooke" ? `F = kx · x ∝ F` : bn ? (wave < 0.08 ? "বল নেই · আগের দৈর্ঘ্য" : "বল আছে · প্রসারিত") : wave < 0.08 ? "No force" : "Loaded";
    });
  }

  private buildPair(state: ViewState) {
    const bn = state.lang === "bn";
    const make = (x: number, color: number, name: string, plastic: boolean) => {
      const rod = this.bar(1.2, 0.08, color);
      this.add(rod);
      rod.position.set(x, 0.8, 0);
      this.tag(name, x, 1.65, 0);
      this.updaters.push((time) => {
        const wave = ping(time, 4.6);
        const keep = plastic ? Math.max(wave, 0.42) : wave;
        rod.scale.y = 1 + 0.28 * keep;
        rod.position.y = 0.25 + (1.2 * rod.scale.y) / 2;
      });
    };
    make(-0.7, 0xb7c2cc, bn ? "স্থিতিস্থাপক" : "Elastic", false);
    make(0.7, 0xc47a45, bn ? "প্লাস্টিক" : "Plastic", true);
  }

  private buildCube(state: ViewState) {
    const p = state.params;
    const shown = Math.min(0.28, Math.abs(seeStrain(volumeStrain(p))) * 1.4);
    const cube = this.add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), this.std(0x7f93a8, { metalness: 0.25, roughness: 0.4 })));
    cube.position.y = 0.55;
    const dirs = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, -1),
    ];
    const arrows = dirs.map((dir) => {
      const arrow = new THREE.ArrowHelper(dir.clone().negate(), dir.clone().multiplyScalar(0.85), 0.45, 0xe2a63b, 0.12, 0.07);
      this.add(arrow);
      return arrow;
    });
    this.updaters.push((time) => {
      const load = 0.3 + 0.7 * ping(time, 4.4);
      const s = 1 - shown * load;
      cube.scale.setScalar(s);
      arrows.forEach((arrow, i) => {
        const dir = dirs[i];
        arrow.position.copy(dir).multiplyScalar(0.55 + (1 - load) * 0.35);
      });
    });
  }

  private buildShear(state: ViewState) {
    const shown = Math.min(0.45, Math.abs(seeStrain(shearStrain(state.params))) * 2);
    const block = this.add(new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.7, 0.7), this.std(0x8ea0b3, { metalness: 0.2 })));
    block.position.y = 0.55;
    const base = this.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.9), this.std(0x6d5438, { roughness: 0.8 })));
    base.position.y = 0.12;
    const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(-0.2, 0.95, 0), 0.7, 0xe25b45, 0.14, 0.08);
    this.add(arrow);
    this.updaters.push((time) => {
      const slide = shown * ping(time, 4);
      block.position.x = slide;
      block.rotation.z = -slide * 0.35;
      arrow.position.x = -0.15 + slide;
    });
  }

  private buildGraph(state: ViewState) {
    const bn = state.lang === "bn";
    const pts = [
      [0, 0.05],
      [0.35, 0.55],
      [0.55, 0.9],
      [0.75, 0.82],
      [1.2, 1.15],
      [1.7, 1.4],
      [2.15, 1.05],
    ];
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(x - 1, y, 0)));
    this.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.025, 6, false), this.std(0xe7a15a)));
    const axisX = this.add(new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.02, 0.02), this.std(0xf6f1e6)));
    axisX.position.set(0.1, 0.05, 0);
    const axisY = this.add(new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.6, 0.02), this.std(0xf6f1e6)));
    axisY.position.set(-1, 0.8, 0);
    this.tag(bn ? "বিকৃতি" : "Strain", 1.35, 0.05, 0);
    this.tag(bn ? "পীড়ন" : "Stress", -1, 1.75, 0);
    this.tag(bn ? "সমানুপাত" : "Hooke", -0.55, 0.7, 0.2);
    this.tag(bn ? "ভঙ্গ" : "Break", 1.15, 1.25, 0);
    const dot = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), this.std(0xf6f1e6, { emissive: 0xf6f1e6, emissiveIntensity: 0.3 })));
    this.updaters.push((time) => {
      const t = (time * 0.08) % 1;
      dot.position.copy(curve.getPointAt(t));
    });
  }

  private buildModuli(state: ViewState) {
    const p = state.params;
    const wire = this.bar(0.8, 0.03, 0xb7c2cc);
    this.add(wire);
    wire.position.set(-1.3, 0.8, 0);
    const cube = this.add(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), this.std(0x7f93a8, { metalness: 0.25 })));
    cube.position.set(0, 0.5, 0);
    const block = this.add(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.45), this.std(0xc47a45)));
    block.position.set(1.3, 0.5, 0);
    this.tag("Y", -1.3, 1.45, 0);
    this.tag("K", 0, 1.15, 0);
    this.tag("η", 1.3, 1.15, 0);
    const ys = seeStrain(strainOf({ ...p, force: 30, area: 1, length: 1 }));
    const ks = Math.min(0.22, Math.abs(seeStrain(volumeStrain(p))));
    const ss = Math.min(0.3, Math.abs(seeStrain(shearStrain({ ...p, force: 30, area: 1 }))));
    this.updaters.push((time) => {
      const load = ping(time, 4);
      wire.scale.y = 1 + ys * load;
      cube.scale.setScalar(1 - ks * load);
      block.position.x = 1.3 + ss * load;
    });
  }

  private buildSurface(state: ViewState) {
    const focus = state.focus;
    if (focus === "molecules") return this.molecules(state);
    if (focus === "drop") return this.dropMorph(state);
    if (focus === "needle") return this.needle(state);
    this.soapBeakers(state);
  }

  private molecules(state: ViewState) {
    const bn = state.lang === "bn";
    const geo = new THREE.SphereGeometry(0.09, 12, 10);
    const mat = this.std(0x3aa0d0, { roughness: 0.25 });
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 5; x++) {
        for (let z = 0; z < 3; z++) {
          const sphere = this.add(new THREE.Mesh(geo, mat));
          sphere.position.set((x - 2) * 0.28, 0.2 + y * 0.28, (z - 1) * 0.28);
        }
      }
    }
    const down = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1.35, 0), 0.45, 0xe2a63b, 0.12, 0.07);
    this.add(down);
    this.tag(bn ? "পৃষ্ঠের নিট টান নিচে" : "Net pull is inward", 0.7, 1.45, 0);
    const inner = [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
    ];
    for (const [x, y, z] of inner) {
      this.add(new THREE.ArrowHelper(new THREE.Vector3(x, y, z), new THREE.Vector3(-0.9, 0.55, 0.6), 0.22, 0x9ddec0, 0.08, 0.05));
    }
    this.tag(bn ? "ভেতরে নিট বল শূন্য" : "Inside, pulls cancel", -0.9, 0.15, 0.8);
  }

  private dropMorph(state: ViewState) {
    const drop = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.45, 28, 20), this.std(0x3aa0d0, { transparent: true, opacity: 0.85, roughness: 0.15 })));
    drop.position.y = 0.7;
    this.updaters.push((time) => {
      const t = ping(time, 4);
      drop.scale.set(1 + 0.7 * (1 - t), 1 - 0.35 * (1 - t), 1 + 0.15 * (1 - t));
    });
    this.tag(state.lang === "bn" ? "গোলকে ক্ষেত্রফল কম" : "A sphere has less area", 0, 1.45, 0);
  }

  private needle(state: ViewState) {
    const water = this.add(new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 1.2), this.std(0x2f8fbf, { transparent: true, opacity: 0.55, roughness: 0.1 })));
    water.position.y = 0.3;
    const needle = this.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.1, 10), this.std(0xd7dde3, { metalness: 0.7, roughness: 0.25 })));
    needle.rotation.z = Math.PI / 2;
    const up = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0.55, 0), 0.4, 0xe2a63b, 0.1, 0.06);
    const down = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0.35, 0.7, 0), 0.35, 0x3c6fd8, 0.1, 0.06);
    this.add(up);
    this.add(down);
    const hold = state.params.tension >= 0.045;
    this.updaters.push((time) => {
      const bob = hold ? 0.62 + Math.sin(time * 2) * 0.02 : 0.55 - Math.min(0.35, time * 0.08);
      needle.position.y = bob;
      up.setLength(hold ? 0.35 + state.params.tension * 2 : 0.12, 0.1, 0.06);
    });
    this.tag(hold ? (state.lang === "bn" ? "ভাসছে" : "Floating") : state.lang === "bn" ? "ডুবছে" : "Sinking", 0, 1.15, 0);
  }

  private soapBeakers(state: ViewState) {
    const bn = state.lang === "bn";
    const cups = [
      { x: -0.8, name: bn ? "পানি" : "Water", t: 0.072, color: 0x3aa0d0 },
      { x: 0.8, name: bn ? "সাবান" : "Soap", t: Math.min(state.params.tension, 0.04), color: 0x8fd0c8 },
    ];
    for (const cup of cups) {
      const glass = this.add(new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.32, 0.7, 20, 1, true), this.std(0xd7f3fb, { transparent: true, opacity: 0.28, side: THREE.DoubleSide })));
      glass.position.set(cup.x, 0.45, 0);
      const fill = this.add(new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.4, 20), this.std(cup.color, { transparent: true, opacity: 0.7, roughness: 0.1 })));
      fill.position.set(cup.x, 0.35, 0);
      const arrow = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(cup.x, 0.85, 0), 0.15 + cup.t * 4, 0xe2a63b, 0.1, 0.06);
      this.add(arrow);
      this.tag(cup.name, cup.x, 1.15, 0);
    }
  }

  private buildFilm(state: ViewState) {
    const frame = new THREE.Group();
    const metal = this.std(0xd7dde3, { metalness: 0.6, roughness: 0.3 });
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.04), metal);
    const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.1, 0.04), metal);
    const sideR = sideL.clone();
    top.position.y = 0.55;
    sideL.position.set(-0.78, 0, 0);
    sideR.position.set(0.78, 0, 0);
    frame.add(top, sideL, sideR);
    frame.position.y = 0.7;
    this.add(frame);
    const film = this.add(new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1), this.std(0x9ad7ef, { transparent: true, opacity: 0.4, side: THREE.DoubleSide, roughness: 0.05 })));
    const thread = this.add(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 8), this.std(0xf6f1e6)));
    this.updaters.push((time) => {
      const t = ping(time, 5);
      film.scale.x = 0.35 + 0.65 * (1 - t);
      film.position.set(0.15 * t, 0.7, 0);
      thread.position.set(-0.45 + t * 0.7, 0.7, 0);
      thread.rotation.z = t * 0.5;
    });
    this.tag(state.lang === "bn" ? "পর্দা সংকুচিত হয়" : "The film contracts", 0, 1.5, 0);
  }

  private buildDrops(state: ViewState) {
    const focus = state.focus;
    const p = state.params;
    if (focus === "split") {
      const big = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 16), this.std(0x3aa0d0, { transparent: true, opacity: 0.8, roughness: 0.12 })));
      big.position.y = 0.6;
      const info = splitDrops(p.radius * 1e-3, p.count, p.tension);
      const smalls: any[] = [];
      const n = Math.min(info.n, 18);
      for (let i = 0; i < n; i++) {
        const s = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), this.std(0x8fd0ef, { transparent: true, opacity: 0.85, roughness: 0.12 })));
        smalls.push(s);
      }
      this.updaters.push((time) => {
        const t = (time % 6) / 6;
        big.visible = t < 0.45;
        big.scale.setScalar(t < 0.45 ? 1 : 0.2);
        smalls.forEach((sphere, i) => {
          const a = (i / n) * Math.PI * 2;
          const spread = Math.max(0, t - 0.45) * 1.6;
          sphere.visible = t >= 0.4;
          sphere.position.set(Math.cos(a) * spread, 0.55 + Math.sin(a * 2) * 0.05, Math.sin(a) * spread);
        });
      });
      return;
    }
    if (focus === "bubble") {
      const drop = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 16), this.std(0x3aa0d0, { transparent: true, opacity: 0.75, roughness: 0.1 })));
      drop.position.set(-0.7, 0.6, 0);
      const bubble = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 16), this.std(0xd7f3fb, { transparent: true, opacity: 0.28, side: THREE.DoubleSide, roughness: 0.05 })));
      bubble.position.set(0.7, 0.6, 0);
      this.tag(state.lang === "bn" ? "ফোঁটা" : "Drop", -0.7, 1.2, 0);
      this.tag(state.lang === "bn" ? "বুদবুদ" : "Bubble", 0.7, 1.2, 0);
      const s = 0.7 + p.radius * 0.15;
      drop.scale.setScalar(s);
      bubble.scale.setScalar(s);
      return;
    }
    const blob = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.28 + p.radius * 0.08, 24, 16), this.std(0x3aa0d0, { transparent: true, opacity: 0.8, roughness: 0.12 })));
    blob.position.y = 0.6;
    const column = this.add(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.22), this.std(0xe2a63b)));
    this.tag(focus === "area" ? "E = TΔA" : "E ∝ r²", 0.8, 1.2, 0);
    this.updaters.push((time) => {
      const h = 0.25 + p.radius * 0.35 + Math.sin(time) * 0.04;
      column.scale.y = h / 0.2;
      column.position.set(0.85, h / 2, 0);
    });
  }

  private buildCapillary(state: ViewState) {
    const focus = state.focus;
    const bn = state.lang === "bn";
    if (focus === "meniscus") {
      this.tube(-0.7, 0.045, true, bn ? "পানি · অবতল" : "Water · concave");
      this.tube(0.7, -0.12, false, bn ? "পারদ · উত্তল" : "Mercury · convex");
      return;
    }
    if (focus === "bore") {
      const h1 = capillaryHeight(state.params);
      const h2 = capillaryHeight({ ...state.params, radius: state.params.radius * 2 });
      this.tube(-0.65, h1, true, bn ? "সরু" : "Narrow");
      this.tube(0.65, h2, true, bn ? "চওড়া" : "Wide");
      return;
    }
    if (focus === "cap-pair") {
      const water = capillaryHeight({ ...state.params, tension: 0.072, angle: 0, density: 1 });
      const mercury = capillaryHeight({ ...state.params, tension: 0.465, angle: 140, density: 13.6 });
      this.tube(-0.65, water, true, bn ? "পানি" : "Water");
      this.tube(0.65, mercury, false, bn ? "পারদ" : "Mercury");
      return;
    }
    const h = capillaryHeight(state.params);
    const waterLike = state.params.angle < 90;
    this.tube(0, h, waterLike, focus === "contact" ? `θ = ${Math.round(state.params.angle)}°` : bn ? (waterLike ? "ওপরে" : "নিচে") : waterLike ? "Rises" : "Falls");
    if (focus === "contact") {
      const arc = this.add(new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.012, 8, 24, Math.max(0.2, (state.params.angle * Math.PI) / 180)), this.std(0xe7a15a)));
      arc.position.set(0.28, 0.85, 0);
    }
  }

  private tube(x: number, heightM: number, concave: boolean, name: string) {
    const dish = this.add(new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.16, 20), this.std(concave ? 0x2f8fbf : 0xb7c0c8, { transparent: true, opacity: 0.7, roughness: 0.15 })));
    dish.position.set(x, 0.2, 0);
    const glass = this.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.5, 16, 1, true), this.std(0xd7f3fb, { transparent: true, opacity: 0.25, side: THREE.DoubleSide })));
    glass.position.set(x, 0.95, 0);
    const h = Math.max(-0.35, Math.min(1.15, heightM / 0.055));
    const liquid = this.add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.2, 16), this.std(concave ? 0x3aa0d0 : 0xc5ccd4, { roughness: 0.2, metalness: concave ? 0.05 : 0.45 })));
    const cap = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 10), liquid.material));
    this.updaters.push(() => {
      const rise = 0.28 + h;
      liquid.scale.y = Math.max(0.2, rise);
      liquid.position.set(x, 0.28 + (0.2 * liquid.scale.y) / 2 - 0.05, 0);
      cap.position.set(x, 0.28 + 0.2 * liquid.scale.y, 0);
      cap.scale.y = concave ? 0.45 : 0.7;
    });
    this.tag(name, x, 1.85, 0);
  }

  private buildFall(state: ViewState) {
    if (state.focus === "compare") {
      this.tank(-0.85, { ...state.params, viscosity: 1, density: 1, radius: 1 }, 0x3aa0d0, state.lang === "bn" ? "পানি" : "Water");
      this.tank(0.85, { ...state.params, viscosity: 1500, density: 1.26, radius: 1 }, 0xd4c07a, state.lang === "bn" ? "গ্লিসারিন" : "Glycerine");
      return;
    }
    const p = state.focus === "temp" ? { ...state.params, viscosity: viscosityAt(state.params) } : state.params;
    this.tank(0, p, state.focus === "temp" && state.params.temp > 40 ? 0xe07a62 : 0x3aa0d0, "");
  }

  private tank(x: number, p: Params, color: number, name: string) {
    const glass = this.add(new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.7, 0.7), this.std(0xd7f3fb, { transparent: true, opacity: 0.18, side: THREE.DoubleSide })));
    glass.position.set(x, 0.95, 0);
    const liquid = this.add(new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.5, 0.6), this.std(color, { transparent: true, opacity: 0.28, roughness: 0.1 })));
    liquid.position.set(x, 0.9, 0);
    const sphere = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.1, 18, 14), this.std(0xd7dde3, { metalness: 0.55, roughness: 0.3 })));
    const v = terminalSpeed(p);
    const up = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x + 0.22, 1, 0), 0.3, 0xe2a63b, 0.08, 0.05);
    const down = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(x - 0.22, 1, 0), 0.45, 0x3c6fd8, 0.08, 0.05);
    this.add(up);
    this.add(down);
    if (name) this.tag(name, x, 1.95, 0);
    this.updaters.push((time) => {
      const trip = 4.5 + 8 / (1 + Math.abs(v));
      const u = (time % trip) / trip;
      const approach = 1 - Math.exp(-u * 4);
      const dir = v >= 0 ? -1 : 1;
      sphere.position.set(x, 1.55 + dir * approach * 1.15, 0);
      const drag = 0.15 + approach * 0.55;
      up.setLength(drag, 0.08, 0.05);
      up.position.y = sphere.position.y;
      down.position.y = sphere.position.y;
    });
  }

  private buildLayers(state: ViewState) {
    const colors = [0x1d4e89, 0x2f6f9f, 0x3aa0d0, 0x67b7d8, 0x9ad4ea, 0xd7f3fb];
    const slabs = colors.map((color, i) => {
      const slab = this.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.8), this.std(color, { transparent: true, opacity: 0.75, roughness: 0.2 })));
      slab.position.y = 0.2 + i * 0.16;
      return slab;
    });
    this.updaters.push((time) => {
      slabs.forEach((slab, i) => {
        const share = i / (slabs.length - 1);
        slab.position.x = Math.sin(time * 0.8) * state.params.speed * share * 0.45;
      });
    });
    this.tag(state.lang === "bn" ? "নিচ স্থির · ওপর দ্রুত" : "Bottom still · top fast", 0, 1.35, 0);
  }

  private buildFlow(state: ViewState) {
    const messy = state.focus === "turbulent" || (state.focus === "speed-lines" && state.params.speed > 1.6);
    this.pipeShell();
    const dots: any[] = [];
    const lanes = state.focus === "paths" ? 1 : 5;
    for (let lane = 0; lane < lanes; lane++) {
      for (let i = 0; i < 8; i++) {
        const dot = this.add(new THREE.Mesh(new THREE.SphereGeometry(state.focus === "paths" ? 0.045 : 0.03, 8, 8), this.std(lane === 2 || lanes === 1 ? 0xe7a15a : 0x9ad7ef)));
        dots.push({ dot, lane, seed: i / 8 });
      }
    }
    this.updaters.push((time) => {
      for (const item of dots) {
        const offset = (item.lane - (lanes - 1) / 2) * 0.16;
        const x = pipeX(item.seed + time * 0.22 * state.params.speed);
        const y = 0.45 + offset * (throat(x) / WIDE);
        const wobble = messy ? Math.sin(time * 6 + item.seed * 20) * 0.08 : 0;
        item.dot.position.set(x, y + wobble, messy ? Math.cos(time * 5 + item.lane) * 0.06 : 0);
      }
    });
  }

  private pipeShell() {
    const mat = this.std(0xd7dde3, { transparent: true, opacity: 0.28, metalness: 0.2 });
    for (let i = 0; i <= 18; i++) {
      const x = -1.7 + (i / 18) * 3.4;
      const ring = this.add(new THREE.Mesh(new THREE.TorusGeometry(throat(x), 0.012, 6, 18), mat));
      ring.position.set(x, 0.45, 0);
      ring.rotation.y = Math.PI / 2;
    }
  }

  private buildBern(state: ViewState) {
    const focus = state.focus;
    if (focus === "height") return this.verticalPipe(state);
    if (focus === "orient") {
      this.venturi(state, -0.2);
      return;
    }
    if (focus === "wing") return this.wing(state);
    this.venturi(state, 0);
  }

  private venturi(state: ViewState, y: number) {
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const x = -1.6 + (i / 20) * 3.2;
      pts.push(new THREE.Vector3(x, y, 0));
    }
    this.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.03, 6, false), this.std(0xd7dde3, { transparent: true, opacity: 0.35 })));
    const wide = this.column(-1.1, y, 0.85, 0x3aa0d0);
    const neck = this.column(0, y, 0.45, 0xe07a62);
    this.tag(state.lang === "bn" ? "বেশি চাপ" : "Higher P", -1.1, y + 1.15, 0);
    this.tag(state.lang === "bn" ? "কম চাপ" : "Lower P", 0, y + 0.8, 0);
    const dots: any[] = [];
    for (let i = 0; i < 10; i++) dots.push(this.add(new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), this.std(0xe7a15a))));
    this.updaters.push((time) => {
      const pulse = 0.75 + 0.25 * Math.sin(time * state.params.speed);
      wide.scale.y = pulse;
      neck.scale.y = pulse * 0.55;
      wide.position.y = y + 0.15 + (0.7 * wide.scale.y) / 2;
      neck.position.y = y + 0.15 + (0.7 * neck.scale.y) / 2;
      dots.forEach((dot, i) => {
        const x = pipeX(i / 10 + time * 0.2 * state.params.speed, -1.6, 3.2);
        dot.position.set(x, y, ((i % 3) - 1) * 0.05);
      });
    });
  }

  private column(x: number, y: number, h: number, color: number) {
    const mesh = this.add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 10), this.std(color, { transparent: true, opacity: 0.8 })));
    mesh.position.set(x, y + h, 0);
    mesh.scale.y = h / 0.7;
    return mesh;
  }

  private verticalPipe(state: ViewState) {
    const pipe = this.add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.6, 16, 1, true), this.std(0xd7f3fb, { transparent: true, opacity: 0.25, side: THREE.DoubleSide })));
    pipe.position.y = 0.9;
    this.column(-0.45, 0.15, 0.7, 0x3aa0d0);
    this.column(0.45, 1.15, 0.35, 0xe07a62);
    this.tag(state.lang === "bn" ? "নিচে বেশি চাপ" : "Higher pressure below", -0.7, 0.4, 0);
    this.tag(state.lang === "bn" ? "ওপরে কম চাপ" : "Lower pressure above", 0.7, 1.5, 0);
  }

  private wing(state: ViewState) {
    const shape = new THREE.Shape();
    shape.moveTo(-0.9, 0);
    shape.bezierCurveTo(-0.2, 0.35, 0.4, 0.28, 0.9, 0);
    shape.bezierCurveTo(0.3, -0.08, -0.2, -0.05, -0.9, 0);
    const wing = this.add(new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.8, bevelEnabled: false }), this.std(0xd7dde3, { metalness: 0.3 })));
    wing.position.set(0, 0.7, -0.4);
    const lift = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 1.15, 0), 0.55, 0xe2a63b, 0.14, 0.08);
    this.add(lift);
    this.tag(state.lang === "bn" ? "উপরে দ্রুত · চাপ কম" : "Faster above · lower pressure", 0, 1.7, 0);
    this.updaters.push(() => {
      lift.setLength(0.35 + state.params.speed * 0.12, 0.14, 0.08);
    });
  }

  private buildLife(state: ViewState) {
    const p = state.params;
    const bn = state.lang === "bn";
    const beaker = this.add(new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.62, 1.3, 24, 1, true), this.std(0xd7f3fb, { transparent: true, opacity: 0.22, side: THREE.DoubleSide })));
    beaker.position.y = 0.75;
    const liquid = this.add(new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.56, 0.9, 24), this.std(0x3aa0d0, { transparent: true, opacity: 0.4, roughness: 0.1 })));
    liquid.position.y = 0.55;
    const bulb = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 14), this.std(0xf6f1e6, { roughness: 0.3 })));
    const stem = this.add(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.9, 12), this.std(0xf6f1e6, { roughness: 0.3 })));
    const density = Math.max(0.7, p.density);
    const sink = Math.min(0.75, 0.55 / density);
    bulb.position.y = 0.35 + (1 - sink) * 0.35;
    stem.position.y = bulb.position.y + 0.5;
    this.tag(bn ? `আপেক্ষিক ঘনত্ব ${density.toFixed(2)}` : `RD ${density.toFixed(2)}`, 0.15, 1.55, 0);
  }
}
