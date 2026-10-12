import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import type { Family } from "./catalog";
import {
  Y_MAX,
  brightY,
  centralWidth,
  darkY,
  fringeBeta,
  malus,
  minimumY,
  multiAt,
  onScreen,
  singleAt,
  youngAt,
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

const SCREEN_H = 2.35;
const SCREEN_X = 1.9;
const SLIT_X = -0.62;
const SOURCE_X = -2.35;

type Copy = {
  source: string;
  screen: string;
  slit: string;
  bright: string;
  dark: string;
  sum: string;
  wave: string;
  polarizer: string;
  analyzer: string;
  graph: string;
  interference: string;
  diffraction: string;
};

const CAM: Record<Family, { pos: [number, number, number]; target: [number, number, number] }> = {
  pair: { pos: [0.2, 1.7, 5.7], target: [0.25, 0.05, 0] },
  young: { pos: [4.7, 2.05, 3.55], target: [0.2, 0, 0] },
  slit: { pos: [4.7, 2.05, 3.55], target: [0.2, 0, 0] },
  multi: { pos: [4.7, 2.05, 3.55], target: [0.2, 0, 0] },
  polar: { pos: [3.9, 1.7, 3.5], target: [0.55, 0, 0] },
  front: { pos: [3.5, 1.85, 4.1], target: [0.1, 0, 0] },
  compare: { pos: [3.4, 4.6, 3.8], target: [0.15, 0, 0] },
};

function yVis(y: number) {
  return (y / Y_MAX) * (SCREEN_H / 2);
}

function visLambda(nm: number) {
  return 0.7 + ((nm - 400) / 300) * 0.75;
}

function shade(intensity: number) {
  const t = Math.pow(Math.min(1, Math.max(0, intensity)), 0.7);
  return [Math.round(10 + t * 245), Math.round(12 + t * 232), Math.round(14 + t * 198)];
}

function paint(sample: (y: number) => number) {
  const canvas = document.createElement("canvas");
  canvas.width = 12;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const img = ctx.createImageData(12, 512);
  for (let row = 0; row < 512; row += 1) {
    const y = (0.5 - row / 511) * 2 * Y_MAX;
    const [r, g, b] = shade(sample(y));
    for (let col = 0; col < 12; col += 1) {
      const i = (row * 12 + col) * 4;
      img.data[i] = r;
      img.data[i + 1] = g;
      img.data[i + 2] = b;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function copyOf(lang: "bn" | "en"): Copy {
  if (lang === "en") {
    return {
      source: "Source",
      screen: "Screen",
      slit: "Slit",
      bright: "Bright",
      dark: "Dark",
      sum: "Resultant",
      wave: "Wave",
      polarizer: "Polarizer",
      analyzer: "Analyzer",
      graph: "Intensity",
      interference: "Interference",
      diffraction: "Diffraction",
    };
  }
  return {
    source: "উৎস",
    screen: "পর্দা",
    slit: "চির",
    bright: "উজ্জ্বল",
    dark: "অন্ধকার",
    sum: "লব্ধি",
    wave: "তরঙ্গ",
    polarizer: "সমবর্তক",
    analyzer: "বিশ্লেষক",
    graph: "তীব্রতা",
    interference: "ব্যতিচার",
    diffraction: "অপবর্তন",
  };
}

export class OpticsWorld {
  private host: HTMLElement;
  private renderer: any;
  private labelRenderer: any;
  private scene: any;
  private camera: any;
  private controls: any;
  private root: any;
  private clock: any;
  private frame = 0;
  private observer: ResizeObserver | null = null;
  private failed = false;
  private alive = true;
  private time = 0;
  private playing = true;
  private speed = 1;
  private home = true;
  private key = "";
  private state: ViewState | null = null;
  private updaters: ((time: number) => void)[] = [];

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
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.setAttribute("aria-label", "ভৌত আলোকবিজ্ঞানের ত্রিমাত্র দৃশ্য");
    host.append(renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.domElement.style.position = "absolute";
    this.labelRenderer.domElement.style.inset = "0";
    this.labelRenderer.domElement.style.pointerEvents = "none";
    host.append(this.labelRenderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.08, 80);
    this.camera.position.set(4.6, 2.1, 3.6);
    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.minDistance = 2.2;
    this.controls.maxDistance = 14;
    this.controls.target.set(0.2, 0, 0);
    this.controls.rotateSpeed = 0.85;
    this.controls.update();

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    this.scene.add(new THREE.HemisphereLight(0xf4efe4, 0x1a2822, 0.4));
    const sun = new THREE.DirectionalLight(0xffffff, 1.15);
    sun.position.set(4, 7, 5);
    this.scene.add(sun);

    const grid = new THREE.GridHelper(9, 18, 0x3d564c, 0x24362f);
    const mats = Array.isArray(grid.material) ? grid.material : [grid.material];
    for (const mat of mats) {
      mat.transparent = true;
      mat.opacity = 0.4;
    }
    grid.position.y = -1.45;
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
      this.camera.position.set(cam.pos[0], cam.pos[1], cam.pos[2]);
      this.controls.target.set(cam.target[0], cam.target[1], cam.target[2]);
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
    if (!this.root) return;
    for (const child of [...this.root.children]) {
      this.root.remove(child);
      child.traverse((node: any) => {
        if (node.element) node.element.remove();
        if (node.geometry) node.geometry.dispose();
        const material = node.material;
        if (Array.isArray(material)) {
          for (const item of material) {
            item.map?.dispose();
            item.dispose();
          }
        } else if (material) {
          material.map?.dispose();
          material.dispose();
        }
      });
    }
  }

  private build(state: ViewState) {
    if (state.family === "pair") this.buildPair(this.root, state);
    else if (state.family === "young") this.buildYoung(this.root, state, false);
    else if (state.family === "slit") this.buildSlit(this.root, state, false);
    else if (state.family === "multi") this.buildMulti(this.root, state);
    else if (state.family === "polar") this.buildPolar(this.root, state);
    else if (state.family === "front") this.buildFront(this.root, state);
    else this.buildCompare(this.root, state);
  }

  private buildPair(parent: any, state: ViewState) {
    const text = copyOf(state.lang);
    if (state.focus === "both") {
      this.waveTrio(parent, 1.05, { ...state.params, phaseDeg: 0 }, 0, state.lang === "en" ? "φ = 0°" : "φ = ০°");
      this.waveTrio(parent, -1.05, { ...state.params, phaseDeg: 180 }, 180, state.lang === "en" ? "φ = 180°" : "φ = ১৮০°");
      this.waveTrio(parent, 0, state.params, state.params.phaseDeg, state.lang === "en" ? "Your phase" : "তোমার দশা");
      return;
    }
    this.waveTrio(parent, 0, state.params, state.params.phaseDeg, text.sum);
  }

  private waveTrio(parent: any, yShift: number, params: Params, phaseDeg: number, caption: string) {
    const text = copyOf(this.state?.lang ?? "bn");
    const top = this.sine(parent, 0xe2a63b);
    const bottom = this.sine(parent, 0x7d8cf0);
    const sum = this.sine(parent, 0xf4f0e6);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xfff4dc });
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 16), glowMat);
    glow.position.set(2.15, yShift, 0);
    parent.add(glow);
    this.tag(parent, caption, 2.45, yShift + 0.38, 0);
    this.tag(parent, `${text.wave} 1`, -2.15, yShift + 0.48, 0);
    this.tag(parent, `${text.wave} 2`, -2.15, yShift - 0.48, 0);
    const k = (2 * Math.PI) / visLambda(params.lambdaNm);
    this.updaters.push((time) => {
      const travel = time * 2.3;
      this.writeSine(top, -2.05, 2.05, yShift + 0.42, "y", params.amp * 0.22, k, travel, 0);
      this.writeSine(bottom, -2.05, 2.05, yShift - 0.42, "y", params.amp * 0.22, k, travel, (phaseDeg * Math.PI) / 180);
      const factor = Math.cos(((phaseDeg * Math.PI) / 180) / 2);
      this.writeSine(sum, -2.05, 2.05, yShift, "y", params.amp * 0.44 * factor, k, travel, ((phaseDeg * Math.PI) / 180) / 2);
      const bright = factor * factor;
      glowMat.color.setRGB(0.08 + 0.92 * bright, 0.07 + 0.86 * bright, 0.06 + 0.7 * bright);
      const scale = 0.35 + 0.95 * Math.abs(factor);
      glow.scale.setScalar(scale);
    });
  }

  private buildYoung(parent: any, state: ViewState, compact: boolean) {
    const params = state.params;
    const text = copyOf(state.lang);
    const gap = 0.32;
    this.lamp(parent, SOURCE_X, 0, 0);
    if (!compact) this.tag(parent, text.source, SOURCE_X, 0.32, 0);
    this.barrier(parent, SLIT_X, [
      { cy: gap, h: 0.09 },
      { cy: -gap, h: 0.09 },
    ]);
    this.tag(parent, "S₁", SLIT_X, gap + 0.22, 0);
    this.tag(parent, "S₂", SLIT_X, -gap - 0.28, 0);
    this.screenOf(parent, SCREEN_X, (y) => youngAt(y, params).I);
    if (!compact) this.tag(parent, text.screen, SCREEN_X, SCREEN_H / 2 + 0.18, 0);
    this.graphOf(parent, SCREEN_X, 0.82, (y) => youngAt(y, params).I);
    if (!compact) this.tag(parent, text.graph, SCREEN_X, 0, 1.55);
    this.ray(parent, [SOURCE_X, 0, 0], [SLIT_X, gap, 0]);
    this.ray(parent, [SOURCE_X, 0, 0], [SLIT_X, -gap, 0]);
    this.traveling(parent, SLIT_X + 0.08, SCREEN_X - 0.08, gap, 0xe2a63b, params);
    this.traveling(parent, SLIT_X + 0.08, SCREEN_X - 0.08, -gap, 0x7d8cf0, params);

    if (state.focus === "sources") {
      this.ripples(parent, SLIT_X, gap, 0xe2a63b);
      this.ripples(parent, SLIT_X, -gap, 0x7d8cf0);
    }

    const marks = this.youngMarks(state);
    for (const mark of marks) {
      if (!onScreen(mark.y)) continue;
      this.tick(parent, SCREEN_X, mark.y, mark.color);
      if (mark.label) this.tag(parent, mark.label, SCREEN_X, yVis(mark.y), 0.78);
    }
    if (state.focus === "width") {
      const beta = fringeBeta(params);
      if (onScreen(beta)) this.bracket(parent, SCREEN_X, 0, beta);
    }
    if (state.focus === "formation" || state.focus === "young" || state.focus === "path" || state.focus === "width" || state.focus === "bright" || state.focus === "dark") {
      const y = state.focus === "dark" ? darkY(Math.max(1, params.order), params) : brightY(params.order, params);
      if (onScreen(y)) {
        this.ray(parent, [SLIT_X, gap, 0], [SCREEN_X, yVis(y), 0], 0xf6e2ae);
        this.ray(parent, [SLIT_X, -gap, 0], [SCREEN_X, yVis(y), 0], 0x9eb6ff);
      }
    }
  }

  private youngMarks(state: ViewState) {
    const params = state.params;
    const text = copyOf(state.lang);
    const gold = 0xe2a63b;
    const blue = 0x8ec5ff;
    if (state.focus === "bright" || state.focus === "width") {
      return [-2, -1, 0, 1, 2].map((n) => ({
        y: brightY(n, params),
        color: gold,
        label: n === 0 ? text.bright : "",
      }));
    }
    if (state.focus === "dark") {
      return [1, 2, 3].flatMap((n) => [
        { y: darkY(n, params), color: blue, label: n === 1 ? text.dark : "" },
        { y: -darkY(n, params), color: blue, label: "" },
      ]);
    }
    if (state.focus === "path" || state.focus === "formation") {
      const y = brightY(params.order, params);
      return [{ y, color: gold, label: text.bright }];
    }
    return [{ y: 0, color: gold, label: text.bright }];
  }

  private buildSlit(parent: any, state: ViewState, compact: boolean) {
    const params = state.params;
    const text = copyOf(state.lang);
    const opening = 0.07 + ((params.aMm - 0.04) / 0.21) * 0.16;
    this.lamp(parent, SOURCE_X, 0, 0);
    if (!compact) this.tag(parent, text.source, SOURCE_X, 0.32, 0);
    this.barrier(parent, SLIT_X, [{ cy: 0, h: opening }]);
    this.tag(parent, text.slit, SLIT_X, opening / 2 + 0.24, 0);
    this.screenOf(parent, SCREEN_X, (y) => singleAt(y, params).I);
    if (!compact) this.tag(parent, text.screen, SCREEN_X, SCREEN_H / 2 + 0.18, 0);
    this.graphOf(parent, SCREEN_X, 0.82, (y) => singleAt(y, params).I);
    if (!compact) this.tag(parent, text.graph, SCREEN_X, 0, 1.55);
    this.ray(parent, [SOURCE_X, 0, 0], [SLIT_X, 0, 0]);
    this.traveling(parent, SLIT_X + 0.08, SCREEN_X - 0.08, 0, 0xf0d48a, params);

    if (state.focus === "central" || state.focus === "central-width" || state.focus === "single" || state.focus === "width-change") {
      const half = centralWidth(params) / 2;
      this.bracket(parent, SCREEN_X, -half, half);
      this.tick(parent, SCREEN_X, half, 0xe2a63b);
      this.tick(parent, SCREEN_X, -half, 0xe2a63b);
      if (!compact) this.tag(parent, text.bright, SCREEN_X, 0.28, 0.78);
    }
    if (state.focus === "minima") {
      const m = Math.max(1, params.order);
      for (const sign of [1, -1]) {
        const y = sign * minimumY(m, params);
        if (!onScreen(y)) continue;
        this.tick(parent, SCREEN_X, y, 0x8ec5ff);
        this.tag(parent, text.dark, SCREEN_X, yVis(y), 0.78);
      }
    }
    if (state.focus === "secondary" || state.focus === "intensity") {
      for (const peak of sidePeaks(params).slice(0, 4)) {
        this.tick(parent, SCREEN_X, peak.y, 0xe7b15a);
      }
    }
  }

  private buildMulti(parent: any, state: ViewState) {
    const params = state.params;
    const text = copyOf(state.lang);
    const count = Math.max(2, Math.round(params.nSlits));
    const span = Math.min(1.15, 0.22 * (count - 1) + 0.2);
    const step = span / (count - 1);
    const gaps = Array.from({ length: count }, (_, index) => ({
      cy: -span / 2 + index * step,
      h: 0.055,
    }));
    this.lamp(parent, SOURCE_X, 0, 0);
    this.tag(parent, text.source, SOURCE_X, 0.32, 0);
    this.barrier(parent, SLIT_X, gaps);
    this.tag(parent, `${text.slit} × ${count}`, SLIT_X, span / 2 + 0.28, 0);
    this.screenOf(parent, SCREEN_X, (y) => multiAt(y, params).I);
    this.tag(parent, text.screen, SCREEN_X, SCREEN_H / 2 + 0.18, 0);
    this.graphOf(parent, SCREEN_X, 0.82, (y) => multiAt(y, params).I);
    this.tag(parent, text.graph, SCREEN_X, 0, 1.55);
    for (const gap of gaps) this.ray(parent, [SOURCE_X, 0, 0], [SLIT_X, gap.cy, 0], 0xf6e2ae);
  }

  private buildPolar(parent: any, state: ViewState) {
    const params = state.params;
    const text = copyOf(state.lang);
    if (state.focus === "unpolarized") {
      this.spinBundle(parent, -0.2, 8, 0xf6e2ae);
      this.tag(parent, text.wave, 0.2, 0.85, 0);
      return;
    }
    if (state.focus === "polarized") {
      this.polarizedTrain(parent, params);
      this.tag(parent, text.wave, 0, 0.85, 0);
      return;
    }
    if (state.focus === "polarizer") {
      this.spinBundle(parent, -1.55, 6, 0xf6e2ae);
      this.plate(parent, -0.15, 0, 0x7d8cf0);
      this.tag(parent, text.polarizer, -0.15, 0.9, 0);
      this.field(parent, [1.15, 0, 0], [0, 1, 0], 0.75, 0xfff4dc);
      this.glowPanel(parent, 2.15, 0.55);
      this.tag(parent, "I₀ = I/2", 2.15, 0.85, 0);
      return;
    }
    this.field(parent, [-1.7, 0, 0], [0, 1, 0], 0.7, 0xf6e2ae);
    this.plate(parent, -0.55, 0, 0x7d8cf0);
    this.tag(parent, text.polarizer, -0.55, 0.92, 0);
    this.field(parent, [0.35, 0, 0], [0, 1, 0], 0.62, 0xfff4dc);
    this.plate(parent, 1.25, params.thetaDeg, 0xe2a63b);
    this.tag(parent, text.analyzer, 1.25, 0.92, 0);
    const ratio = malus(params.thetaDeg).ratio;
    const rad = (params.thetaDeg * Math.PI) / 180;
    this.field(parent, [2.05, 0, 0], [0, Math.cos(rad), Math.sin(rad)], Math.max(0.08, 0.7 * Math.sqrt(ratio)), 0xfff6e4);
    this.glowPanel(parent, 2.7, ratio);
    if (state.focus === "malus") this.malusCurve(parent, params.thetaDeg);
  }

  private buildFront(parent: any, state: ViewState) {
    const params = state.params;
    const text = copyOf(state.lang);
    if (state.focus === "huygens") this.huygens(parent, params, text);
    else if (state.focus === "spherical") this.spheres(parent, text);
    else if (state.focus === "plane") this.planes(parent, text);
    else {
      const line = this.sine(parent, 0xf4f0e6);
      const k = (2 * Math.PI) / visLambda(params.lambdaNm);
      this.updaters.push((time) => {
        this.writeSine(line, -2.1, 2.2, 0, "y", params.amp * 0.55, k, time * 2.2, 0);
      });
      this.tag(parent, "λ",  -2.1 + visLambda(params.lambdaNm) / 2, 0.75, 0);
      this.tickSpan(parent, -2.1, -2.1 + visLambda(params.lambdaNm));
      this.tag(parent, "A", 0.15, params.amp * 0.35, 0);
      this.tag(parent, text.wave, 1.6, 0.85, 0);
    }
  }

  private buildCompare(parent: any, state: ViewState) {
    const text = copyOf(state.lang);
    const left = new THREE.Group();
    left.position.z = 1.55;
    parent.add(left);
    this.buildYoung(left, { ...state, focus: "young" }, true);
    this.tag(left, text.interference, 0.2, 1.55, 0);
    const right = new THREE.Group();
    right.position.z = -1.55;
    parent.add(right);
    this.buildSlit(right, { ...state, focus: "single" }, true);
    this.tag(right, text.diffraction, 0.2, 1.55, 0);
  }

  private screenOf(parent: any, x: number, sample: (y: number) => number) {
    const tex = paint(sample);
    const mat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, SCREEN_H), mat);
    mesh.rotation.y = Math.PI / 2;
    mesh.position.set(x, 0, 0);
    parent.add(mesh);
  }

  private graphOf(parent: any, x: number, z0: number, sample: (y: number) => number) {
    const count = 150;
    const positions: number[] = [];
    for (let i = 0; i < count; i += 1) {
      const y = -Y_MAX + (2 * Y_MAX * i) / (count - 1);
      positions.push(x + 0.04, yVis(y), z0 + sample(y) * 0.7);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
    parent.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xf0d48a })));
  }

  private tick(parent: any, x: number, yMeters: number, color: number) {
    const y = yVis(yMeters);
    if (Math.abs(y) > SCREEN_H / 2 + 0.02) return;
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x + 0.03, y, -0.62),
      new THREE.Vector3(x + 0.03, y, 0.62),
    ]);
    parent.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color })));
  }

  private bracket(parent: any, x: number, y0: number, y1: number) {
    const a = Math.max(-SCREEN_H / 2, Math.min(SCREEN_H / 2, yVis(y0)));
    const b = Math.max(-SCREEN_H / 2, Math.min(SCREEN_H / 2, yVis(y1)));
    const z = 0.66;
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x + 0.04, a, z),
      new THREE.Vector3(x + 0.04, a, z + 0.2),
      new THREE.Vector3(x + 0.04, b, z + 0.2),
      new THREE.Vector3(x + 0.04, b, z),
    ]);
    parent.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xe2a63b })));
  }

  private barrier(parent: any, x: number, gaps: { cy: number; h: number }[]) {
    const mat = new THREE.MeshStandardMaterial({ color: 0x31423b, roughness: 0.74, metalness: 0.05 });
    const spans = gaps.map((gap) => [gap.cy - gap.h / 2, gap.cy + gap.h / 2]).sort((a, b) => a[0] - b[0]);
    let cursor = -1.18;
    const top = 1.18;
    const blocks: [number, number][] = [];
    for (const [a, b] of spans) {
      if (a > cursor + 0.001) blocks.push([cursor, a]);
      cursor = Math.max(cursor, b);
    }
    if (cursor < top - 0.001) blocks.push([cursor, top]);
    for (const [a, b] of blocks) {
      const height = Math.max(0.02, b - a);
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.1, height, 0.46), mat);
      box.position.set(x, (a + b) / 2, 0);
      parent.add(box);
    }
  }

  private lamp(parent: any, x: number, y: number, z: number) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.11, 22, 16), new THREE.MeshBasicMaterial({ color: 0xffe3a0 }));
    mesh.position.set(x, y, z);
    parent.add(mesh);
  }

  private ray(parent: any, a: number[], b: number[], color = 0xf3e0b0) {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(a[0], a[1], a[2]), new THREE.Vector3(b[0], b[1], b[2])]);
    parent.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 })));
  }

  private sine(parent: any, color: number) {
    const samples = 110;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(samples * 3), 3));
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color }));
    parent.add(line);
    return { line, samples };
  }

  private writeSine(
    wave: { line: any; samples: number },
    x0: number,
    x1: number,
    base: number,
    axis: "y" | "z",
    amp: number,
    k: number,
    travel: number,
    phase: number,
  ) {
    const pos = wave.line.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < wave.samples; i += 1) {
      const t = i / (wave.samples - 1);
      const x = x0 + (x1 - x0) * t;
      const waveValue = amp * Math.sin(k * (x - x0) - travel + phase);
      pos[i * 3] = x;
      pos[i * 3 + 1] = axis === "y" ? base + waveValue : base;
      pos[i * 3 + 2] = axis === "z" ? waveValue : 0;
    }
    wave.line.geometry.attributes.position.needsUpdate = true;
  }

  private traveling(parent: any, x0: number, x1: number, y: number, color: number, params: Params) {
    const wave = this.sine(parent, color);
    const k = (2 * Math.PI) / visLambda(params.lambdaNm);
    this.updaters.push((time) => {
      this.writeSine(wave, x0, x1, y, "z", 0.12, k, time * 2.4, 0);
    });
  }

  private ripples(parent: any, x: number, y: number, color: number) {
    const loops = [0, 1, 2, 3].map(() => {
      const samples = 56;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array((samples + 1) * 3), 3));
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 }));
      parent.add(line);
      return { line, samples };
    });
    this.updaters.push((time) => {
      loops.forEach((loop, index) => {
        const radius = (time * 0.42 + index * 0.36) % 1.45;
        const pos = loop.line.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i <= loop.samples; i += 1) {
          const angle = (i / loop.samples) * Math.PI * 2;
          pos[i * 3] = x + radius * Math.cos(angle);
          pos[i * 3 + 1] = y + radius * Math.sin(angle);
          pos[i * 3 + 2] = 0;
        }
        loop.line.geometry.attributes.position.needsUpdate = true;
      });
    });
  }

  private plate(parent: any, x: number, angleDeg: number, color: number) {
    const mesh = new THREE.Mesh(
      new THREE.CircleGeometry(0.62, 42),
      new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.4, side: THREE.DoubleSide, roughness: 0.28 }),
    );
    mesh.rotation.y = Math.PI / 2;
    mesh.position.set(x, 0, 0);
    parent.add(mesh);
    const rad = (angleDeg * Math.PI) / 180;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    this.ray(parent, [x, -0.52 * c, -0.52 * s], [x, 0.52 * c, 0.52 * s], 0xf6e7c4);
  }

  private field(parent: any, origin: number[], dir: number[], length: number, color: number) {
    const direction = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
    const arrow = new THREE.ArrowHelper(direction, new THREE.Vector3(origin[0], origin[1], origin[2]), Math.max(0.05, length), color, 0.16, 0.08);
    parent.add(arrow);
    return arrow;
  }

  private glowPanel(parent: any, x: number, ratio: number) {
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    mat.color.setRGB(ratio, ratio * 0.96, ratio * 0.8);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 1.15), mat);
    mesh.rotation.y = Math.PI / 2;
    mesh.position.set(x, 0, 0);
    parent.add(mesh);
  }

  private spinBundle(parent: any, x: number, count: number, color: number) {
    const arrows: any[] = [];
    for (let i = 0; i < count; i += 1) {
      arrows.push(this.field(parent, [x, 0, 0], [0, 1, 0], 0.5, color));
    }
    this.updaters.push((time) => {
      arrows.forEach((arrow, index) => {
        const angle = time * 0.9 + (index * Math.PI * 2) / count;
        arrow.position.set(x, 0, 0);
        arrow.setDirection(new THREE.Vector3(0, Math.cos(angle), Math.sin(angle)));
        arrow.setLength(0.42 + 0.16 * Math.sin(time * 2.5 + index), 0.12, 0.06);
      });
    });
  }

  private polarizedTrain(parent: any, params: Params) {
    const arrows: any[] = [];
    const count = 9;
    for (let i = 0; i < count; i += 1) arrows.push(this.field(parent, [0, 0, 0], [0, 1, 0], 0.4, 0xfff4dc));
    const k = (2 * Math.PI) / visLambda(params.lambdaNm);
    this.updaters.push((time) => {
      arrows.forEach((arrow, index) => {
        const x = -1.8 + index * 0.45;
        const height = params.amp * 0.55 * Math.sin(k * index * 0.45 - time * 2.4);
        const up = height >= 0;
        arrow.position.set(x, 0, 0);
        arrow.setDirection(new THREE.Vector3(0, up ? 1 : -1, 0));
        arrow.setLength(Math.max(0.05, Math.abs(height)), 0.12, 0.06);
      });
    });
  }

  private malusCurve(parent: any, thetaDeg: number) {
    const positions: number[] = [];
    for (let i = 0; i <= 40; i += 1) {
      const theta = (i / 40) * 180;
      const ratio = malus(theta).ratio;
      positions.push(-0.2 + i * 0.055, -1.25 + ratio * 0.95, 1.25);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
    parent.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xf0d48a })));
    const ratio = malus(thetaDeg).ratio;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 12), new THREE.MeshBasicMaterial({ color: 0xfff6e4 }));
    dot.position.set(-0.2 + (thetaDeg / 180) * 40 * 0.055, -1.25 + ratio * 0.95, 1.25);
    parent.add(dot);
    this.tag(parent, "I = I₀ cos²θ", 0.9, -0.15, 1.25);
  }

  private huygens(parent: any, params: Params, text: Copy) {
    this.ray(parent, [0, -1.05, 0], [0, 1.05, 0], 0xf6e7c4);
    this.tag(parent, text.wave, 0, 1.28, 0);
    const centres = [-0.9, -0.45, 0, 0.45, 0.9];
    const loops = centres.map((y) => {
      const samples = 40;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array((samples + 1) * 3), 3));
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x9eb6ff, transparent: true, opacity: 0.8 }));
      parent.add(line);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffe3a0 }));
      dot.position.set(0, y, 0);
      parent.add(dot);
      return { line, samples, y };
    });
    const front = this.sine(parent, 0xf0d48a);
    this.updaters.push((time) => {
      const radius = 0.18 + (time * 0.35) % (visLambda(params.lambdaNm) * 0.85);
      for (const loop of loops) {
        const pos = loop.line.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i <= loop.samples; i += 1) {
          const angle = (i / loop.samples) * Math.PI * 2;
          pos[i * 3] = radius * Math.cos(angle);
          pos[i * 3 + 1] = loop.y + radius * Math.sin(angle);
          pos[i * 3 + 2] = 0;
        }
        loop.line.geometry.attributes.position.needsUpdate = true;
      }
      const pos = front.line.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < front.samples; i += 1) {
        const t = i / (front.samples - 1);
        pos[i * 3] = radius;
        pos[i * 3 + 1] = -1.15 + t * 2.3;
        pos[i * 3 + 2] = 0;
      }
      front.line.geometry.attributes.position.needsUpdate = true;
    });
  }

  private spheres(parent: any, text: Copy) {
    this.lamp(parent, 0, 0, 0);
    this.tag(parent, text.source, 0, 0.4, 0);
    const shells = [0, 1, 2].map(() => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(1, 20, 14),
        new THREE.MeshBasicMaterial({ color: 0xf0d48a, wireframe: true, transparent: true, opacity: 0.55 }),
      );
      parent.add(mesh);
      return mesh;
    });
    this.updaters.push((time) => {
      shells.forEach((mesh, index) => {
        const radius = 0.25 + ((time * 0.38 + index * 0.55) % 1.7);
        mesh.scale.setScalar(radius);
      });
    });
  }

  private planes(parent: any, text: Copy) {
    this.tag(parent, text.wave, 0, 1.15, 0);
    const sheets = [0, 1, 2, 3].map(() => {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.7, 1.7),
        new THREE.MeshBasicMaterial({ color: 0x9eb6ff, transparent: true, opacity: 0.32, side: THREE.DoubleSide }),
      );
      mesh.rotation.y = Math.PI / 2;
      parent.add(mesh);
      return mesh;
    });
    this.updaters.push((time) => {
      sheets.forEach((mesh, index) => {
        mesh.position.x = -1.4 + ((time * 0.45 + index * 0.7) % 2.8);
      });
    });
  }

  private tickSpan(parent: any, x0: number, x1: number) {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x0, 0.62, 0),
      new THREE.Vector3(x1, 0.62, 0),
    ]);
    parent.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xe2a63b })));
  }

  private tag(parent: any, text: string, x: number, y: number, z: number) {
    if (!text) return;
    const el = document.createElement("span");
    el.className = "float-tag";
    el.textContent = text;
    const obj = new CSS2DObject(el);
    obj.position.set(x, y, z);
    parent.add(obj);
  }
}

function sidePeaks(params: Params) {
  const count = 220;
  const points: { y: number; I: number }[] = [];
  for (let i = 0; i < count; i += 1) {
    const y = -Y_MAX + (2 * Y_MAX * i) / (count - 1);
    points.push({ y, I: singleAt(y, params).I });
  }
  const peaks: { y: number; I: number }[] = [];
  for (let i = 1; i < count - 1; i += 1) {
    if (points[i].I >= points[i - 1].I && points[i].I > points[i + 1].I && points[i].I > 0.012 && Math.abs(points[i].y) > 0.0008) {
      peaks.push(points[i]);
    }
  }
  return peaks;
}
