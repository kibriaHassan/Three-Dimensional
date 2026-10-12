import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import type { Family } from "./catalog";
import { SOUND_V, closedFreq, harmonicFreq, type Params } from "./physics";

export type ViewState = {
  family: Family;
  focus: string;
  params: Params;
  playing: boolean;
  speed: number;
  lang: "bn" | "en";
};

const X0 = -2.12;
const X1 = 2.12;
const BEADS = 72;

const CAM: Record<Family, { pos: [number, number, number]; target: [number, number, number] }> = {
  rope: { pos: [0.15, 1.65, 5.35], target: [0, 0.2, 0] },
  spring: { pos: [0.2, 1.7, 5.45], target: [0, 0.05, 0] },
  pair: { pos: [0.15, 2.15, 6.3], target: [0, 0.05, 0] },
  media: { pos: [0.1, 2.35, 6.5], target: [0, 0.1, 0] },
  shm: { pos: [0.35, 1.55, 4.9], target: [0, 0.15, 0] },
  standing: { pos: [0.1, 1.75, 5.5], target: [0, 0.15, 0] },
  string: { pos: [0.1, 1.6, 5.35], target: [0, 0.1, 0] },
  pipe: { pos: [0.25, 1.55, 5.5], target: [0, 0.05, 0] },
  super: { pos: [0.1, 1.9, 5.7], target: [0, 0.1, 0] },
  water: { pos: [0.15, 4.6, 3.15], target: [0, 0, 0] },
  reflect: { pos: [0.1, 1.7, 5.5], target: [0, 0.15, 0] },
  doppler: { pos: [0.2, 5.8, 2.4], target: [0.1, 0, 0] },
  graph: { pos: [0.05, 1.85, 5.6], target: [0, 0.35, 0] },
  echo: { pos: [0.2, 2.15, 6.1], target: [0, 0.25, 0] },
  bars: { pos: [0.1, 2.2, 6.35], target: [0, 0.1, 0] },
};

type Copy = Record<string, string>;

function textOf(lang: "bn" | "en"): Copy {
  const bn = lang === "bn";
  return {
    crest: bn ? "শিখর" : "Crest",
    trough: bn ? "খাদ" : "Trough",
    amp: bn ? "বিস্তার A" : "Amplitude A",
    wave: bn ? "তরঙ্গ" : "Wave",
    particle: bn ? "কণা" : "Particle",
    energy: bn ? "শক্তি" : "Energy",
    compression: bn ? "সংকোচন" : "Compression",
    rarefaction: bn ? "প্রসারণ" : "Rarefaction",
    node: bn ? "নিস্পন্দ" : "Node",
    antinode: bn ? "সুস্পন্দ" : "Antinode",
    source: bn ? "উৎস" : "Source",
    observer: bn ? "পর্যবেক্ষক" : "Observer",
    wall: bn ? "দেয়াল" : "Wall",
    forward: bn ? "অগ্রগামী" : "Forward",
    backward: bn ? "পশ্চাদগামী" : "Backward",
    sum: bn ? "লব্ধি" : "Resultant",
    solid: bn ? "কঠিন" : "Solid",
    liquid: bn ? "তরল" : "Liquid",
    gas: bn ? "গ্যাস" : "Gas",
    open: bn ? "খোলা" : "Open",
    closed: bn ? "বন্ধ" : "Closed",
    fixed: bn ? "স্থির প্রান্ত" : "Fixed end",
    free: bn ? "মুক্ত প্রান্ত" : "Free end",
    deep: bn ? "গভীর · দ্রুত" : "Deep · fast",
    shallow: bn ? "অগভীর · ধীর" : "Shallow · slow",
    shadow: bn ? "ছায়া" : "Shadow",
    wide: bn ? "প্রশস্ত ফাঁক" : "Wide gap",
    narrow: bn ? "সরু ফাঁক" : "Narrow gap",
    displacement: bn ? "সরণ" : "Displacement",
    time: bn ? "সময়" : "Time",
    distance: bn ? "দূরত্ব" : "Distance",
    velocity: bn ? "বেগ" : "Velocity",
    accel: bn ? "ত্বরণ" : "Acceleration",
    infra: bn ? "অবশব্দ ১০ Hz" : "Infrasound 10 Hz",
    audible: bn ? "শ্রবণযোগ্য ১০০০ Hz" : "Audible 1000 Hz",
    ultra: bn ? "অতিশব্দ ২৫০০০ Hz" : "Ultrasound 25000 Hz",
    pitch: bn ? "তীক্ষ্ণতা" : "Pitch",
    loud: bn ? "প্রাবল্য" : "Loudness",
    ambulance: bn ? "অ্যাম্বুলেন্স" : "Ambulance",
    low: bn ? "নিচু" : "Low",
    high: bn ? "চড়া" : "High",
    quiet: bn ? "মৃদু" : "Quiet",
    loudOne: bn ? "জোরালো" : "Loud",
    clock: bn ? "এক চক্র = T" : "One turn = T",
    envelope: bn ? "খাম" : "Envelope",
    driver: bn ? "চালক" : "Driver",
  };
}

function ampOf(cm: number) {
  return (Math.max(0.4, cm) / 8) * 0.72;
}

function lambdaWorld(meters: number) {
  return Math.max(0.34, meters) * 1.18;
}

function omegaOf(freq: number) {
  const f = Math.max(0.05, freq);
  if (f <= 6) return Math.PI * 2 * f;
  const visual = 0.48 + Math.min(2.05, Math.log10(f) * 0.72);
  return Math.PI * 2 * visual;
}

function soundLambda(freq: number) {
  const real = SOUND_V / Math.max(20, freq);
  return Math.min(2.2, Math.max(0.4, real * 1.15));
}

export class WaveWorld {
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
    renderer.domElement.setAttribute("aria-label", "তরঙ্গের ত্রিমাত্র দৃশ্য");
    host.append(renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.domElement.style.position = "absolute";
    this.labelRenderer.domElement.style.inset = "0";
    this.labelRenderer.domElement.style.pointerEvents = "none";
    host.append(this.labelRenderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.08, 80);
    this.camera.position.set(0.2, 1.7, 5.4);
    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.minDistance = 2.1;
    this.controls.maxDistance = 16;
    this.controls.target.set(0, 0.15, 0);
    this.controls.rotateSpeed = 0.85;
    this.controls.update();

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.72));
    this.scene.add(new THREE.HemisphereLight(0xf4efe4, 0x1a2822, 0.42));
    const sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(4, 7, 5);
    this.scene.add(sun);

    const grid = new THREE.GridHelper(10, 20, 0x3d564c, 0x24362f);
    const mats = Array.isArray(grid.material) ? grid.material : [grid.material];
    for (const mat of mats) {
      mat.transparent = true;
      mat.opacity = 0.38;
    }
    grid.position.y = -1.4;
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
        const material = node.material;
        const list = Array.isArray(material) ? material : material ? [material] : [];
        for (const item of list) {
          if (materials.has(item)) continue;
          materials.add(item);
          item.map?.dispose();
          item.dispose();
        }
      });
    }
  }

  private build(state: ViewState) {
    const family = state.family;
    if (family === "rope") this.buildRopeFamily(state);
    else if (family === "spring") this.buildSpringFamily(state);
    else if (family === "pair") this.buildPair(state);
    else if (family === "media") this.buildMedia(state);
    else if (family === "shm") this.buildShm(state);
    else if (family === "standing") this.buildStanding(state);
    else if (family === "string") this.buildStringFamily(state);
    else if (family === "pipe") this.buildPipeFamily(state);
    else if (family === "super") this.buildSuper(state);
    else if (family === "water") this.buildWater(state);
    else if (family === "reflect") this.buildReflect(state);
    else if (family === "doppler") this.buildDoppler(state);
    else if (family === "graph") this.buildGraph(state);
    else if (family === "echo") this.buildEcho(state);
    else this.buildBars(state);
  }

  private buildRopeFamily(state: ViewState) {
    const copy = textOf(state.lang);
    const p = state.params;
    if (state.focus === "back") {
      this.transverse(this.root, 0.72, 0, p, 1, "plain", copy.forward);
      this.transverse(this.root, -0.72, 0, p, -1, "plain", copy.backward);
      return;
    }
    const tint = state.focus === "crest" ? "crest" : "plain";
    this.transverse(this.root, 0.15, 0, p, 1, tint, "");
    if (state.focus === "generate") this.tag(this.root, copy.source, X0, 0.7, 0);
    if (state.focus === "energy") this.energyRider(p);
    if (state.focus === "particle" || state.focus === "transverse") this.particleArrow(p, true);
    if (state.focus === "amplitude" || state.focus === "amp-shape") this.ampBracket(ampOf(p.amp), 0.15);
    if (state.focus === "wavelength" || state.focus === "f-fixed" || state.focus === "equation") this.lambdaBracket(p, 0.15);
    if (state.focus === "period" || state.focus === "frequency") this.clockFace(p, 1.15);
    if (state.focus === "phase") this.phaseMarks(p, 0.15);
    if (state.focus === "speed" || state.focus === "speed-change" || state.focus === "progressive" || state.focus === "vfl") this.crestTag(p, copy.wave);
    if (state.focus === "crest") {
      this.tag(this.root, copy.crest, 0, ampOf(p.amp) + 0.42, 0);
      this.tag(this.root, copy.trough, lambdaWorld(p.lambda) / 2, -ampOf(p.amp) - 0.28, 0);
    }
  }

  private buildSpringFamily(state: ViewState) {
    const copy = textOf(state.lang);
    const p = state.params;
    const sound = state.focus.startsWith("sound");
    this.longitudinal(this.root, 0, 0, p, sound, state.focus === "rarefaction" ? "rare" : "compress");
    if (sound) this.tag(this.root, state.lang === "bn" ? "বাতাসে ৩৪০ m/s" : "340 m/s in air", 0, 0.85, 0);
    if (state.focus === "compression" || state.focus === "sound-cr") this.tag(this.root, copy.compression, 0.2, 0.55, 0);
    if (state.focus === "rarefaction") this.tag(this.root, copy.rarefaction, 0.2, 0.55, 0);
    if (state.focus === "sound" || state.focus === "longitudinal" || state.focus === "spring") this.tag(this.root, copy.source, X0, 0.55, 0);
  }

  private buildPair(state: ViewState) {
    const copy = textOf(state.lang);
    const p = state.params;
    if (state.focus === "direction") {
      this.transverse(this.root, 0.85, 0, p, 1, "plain", "");
      this.longitudinal(this.root, -0.85, 0, p, false, "compress");
      this.particleArrow(p, true, 0.85);
      this.tag(this.root, copy.wave, 1.15, 1.35, 0);
      this.waveArrow(1.15);
      this.tag(this.root, state.lang === "bn" ? "কণা ∥ তরঙ্গ" : "Particle ∥ wave", 0, -1.35, 0);
      return;
    }
    if (state.focus === "vs") {
      this.transverse(this.root, 0.85, 0, p, 1, "plain", state.lang === "bn" ? "চলমান" : "Progressive");
      this.standingLine(this.root, -0.8, 0, p, "plain");
      this.tag(this.root, state.lang === "bn" ? "স্থির" : "Standing", -1.5, -0.8 + ampOf(p.amp) + 0.35, 0);
      return;
    }
    this.transverse(this.root, 0.85, 0, p, 1, "plain", state.lang === "bn" ? "অনুপ্রস্থ" : "Transverse");
    this.longitudinal(this.root, -0.85, 0, p, false, "compress");
    this.tag(this.root, state.lang === "bn" ? "অনুদৈর্ঘ্য" : "Longitudinal", X0, -0.35, 0);
  }

  private buildMedia(state: ViewState) {
    const copy = textOf(state.lang);
    const rows = [
      { y: 1.05, lambda: 2.05, label: `${copy.solid} · 5000 m/s` },
      { y: 0, lambda: 1.05, label: `${copy.liquid} · 1500 m/s` },
      { y: -1.05, lambda: 0.48, label: `${copy.gas} · 340 m/s` },
    ];
    for (const row of rows) {
      this.longitudinal(this.root, row.y, 0, state.params, true, "compress", { lam: row.lambda, omega: omegaOf(state.params.freq) });
      this.tag(this.root, row.label, X0 + 0.35, row.y + 0.42, 0);
    }
  }

  private buildShm(state: ViewState) {
    const copy = textOf(state.lang);
    const p = state.params;
    if (state.focus === "xt" || state.focus === "vt" || state.focus === "at") {
      this.graphShm(state);
      return;
    }
    if (state.focus === "two") {
      this.oscillator(this.root, 0.55, p.phase);
      this.oscillator(this.root, -0.55, 0);
      this.tag(this.root, `φ = ${Math.round(p.phase)}°`, 0, 1.15, 0);
      return;
    }
    if (state.focus === "drive") {
      this.oscillator(this.root, 0.45, 0, X0 - 0.15);
      this.transverse(this.root, 0, -0.2, p, 1, "plain", "");
      return;
    }
    this.oscillator(this.root, 0, p.phase);
    if (state.focus === "pva") this.tag(this.root, `${copy.displacement} · ${copy.velocity} · ${copy.accel}`, 0, 1.25, 0);
    if (state.focus === "shm" || state.focus === "motion") this.tag(this.root, copy.displacement, 0, 1.15, 0);
  }

  private buildStanding(state: ViewState) {
    const copy = textOf(state.lang);
    const p = state.params;
    if (state.focus === "rope") {
      this.loopString(this.root, 0.1, Math.max(1, Math.round(p.harmonic)), ampOf(p.amp), 0.7 * p.harmonic);
      this.endPosts();
      return;
    }
    if (state.focus === "opposite") {
      this.transverse(this.root, 1.05, 0, p, 1, "plain", copy.forward);
      this.transverse(this.root, 0, 0, p, -1, "plain", copy.backward);
      this.standingLine(this.root, -1.05, 0, p, "plain");
      this.tag(this.root, copy.sum, X0, -0.55, 0);
      return;
    }
    const tint = state.focus === "phase" ? "loops" : "plain";
    this.standingLine(this.root, 0.1, 0, p, tint);
    this.standingMarks(state, copy);
  }

  private buildStringFamily(state: ViewState) {
    const p = state.params;
    const n = state.focus === "fundamental" ? 1 : Math.max(1, Math.round(p.harmonic));
    if (state.focus === "contrast") {
      this.loopString(this.root, 0.75, 1, ampOf(p.amp), 0.65);
      this.loopString(this.root, -0.75, n <= 1 ? 2 : n, ampOf(p.amp) * 0.85, 0.65 * (n <= 1 ? 2 : n));
      this.tag(this.root, "n = 1", X0, 1.2, 0);
      this.tag(this.root, `n = ${n <= 1 ? 2 : n}`, X0, -0.3, 0);
      this.endPosts();
      return;
    }
    this.loopString(this.root, 0.1, n, ampOf(p.amp), 0.65 * n);
    this.endPosts();
    this.tag(this.root, `n = ${n}`, 0, ampOf(p.amp) + 0.55, 0);
  }

  private buildPipeFamily(state: ViewState) {
    const copy = textOf(state.lang);
    const p = state.params;
    const n = Math.max(1, Math.round(p.harmonic));
    if (state.focus === "compare") {
      this.pipe(this.root, 0.7, n, false, 1, copy.open);
      this.pipe(this.root, -0.7, n, true, 1, copy.closed);
      return;
    }
    const closed = state.focus === "closed";
    const natural = closed ? closedFreq(n, p.length) : harmonicFreq(n, SOUND_V, p.length);
    const gain = state.focus === "shift" || state.focus === "sound-res" ? resonanceGain(p.freq, natural) : 1;
    this.pipe(this.root, 0, n, closed, gain, closed ? copy.closed : copy.open);
    if (state.focus === "shift" || state.focus === "sound-res") this.tag(this.root, copy.driver, X0, 0.7, 0);
  }

  private buildSuper(state: ViewState) {
    const copy = textOf(state.lang);
    const p = state.params;
    this.superWaves(p, copy);
  }

  private buildWater(state: ViewState) {
    const copy = textOf(state.lang);
    if (state.focus === "refract" || state.focus === "enter" || state.focus === "depth") {
      this.refract(state, copy);
      return;
    }
    this.waterSheet(state, copy);
  }

  private buildReflect(state: ViewState) {
    const copy = textOf(state.lang);
    if (state.focus === "ends") {
      this.pulse(this.root, 0.7, true, ampOf(state.params.amp));
      this.pulse(this.root, -0.7, false, ampOf(state.params.amp));
      this.tag(this.root, copy.fixed, X1, 1.15, 0);
      this.tag(this.root, copy.free, X1, -0.25, 0);
      this.endPost(X1, 0.7);
      return;
    }
    this.pulse(this.root, 0.15, true, ampOf(state.params.amp));
    this.tag(this.root, copy.fixed, X1, 0.7, 0);
    this.endPost(X1, 0.15);
  }

  private buildDoppler(state: ViewState) {
    const copy = textOf(state.lang);
    const p = state.params;
    const rings: any[] = [];
    const geo = new THREE.RingGeometry(0.96, 1.03, 64);
    geo.rotateX(Math.PI / 2);
    for (let i = 0; i < 14; i += 1) {
      const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshBasicMaterial({ color: i % 2 ? 0x9fd7ff : 0xf4efe4, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
      );
      mesh.visible = false;
      this.root.add(mesh);
      rings.push(mesh);
    }
    const source = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, 0.22), new THREE.MeshBasicMaterial({ color: 0xe25b45 }));
    source.position.y = 0.16;
    this.root.add(source);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.18), new THREE.MeshBasicMaterial({ color: 0xf4efe4 }));
    source.add(cab);
    cab.position.set(0.18, 0.04, 0);
    const observer = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.28, 12), new THREE.MeshBasicMaterial({ color: 0xf0d48a }));
    body.position.y = 0.2;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 12), new THREE.MeshBasicMaterial({ color: 0xf4efe4 }));
    head.position.y = 0.42;
    observer.add(body, head);
    observer.position.set(2.35, 0, 0);
    this.root.add(observer);
    this.tag(observer, copy.observer, 0, 0.7, 0);
    const label = this.tag(source, state.focus === "ambulance" ? copy.ambulance : copy.source, 0, 0.45, 0);
    this.updaters.push((time) => {
      const drift = (p.vs / SOUND_V) * 4.2;
      const speed = Math.max(0.22, Math.abs(drift));
      const dir = p.vs >= 0 ? 1 : -1;
      const duration = 5.1 / speed;
      const u = p.vs === 0 ? 0 : time % duration;
      const x = p.vs === 0 ? -1.15 : (dir > 0 ? -2.45 : 2.15) + dir * speed * u;
      source.position.x = x;
      source.position.z = 0;
      const born = p.vs === 0 ? time : time - u;
      const interval = 0.46;
      for (let i = 0; i < rings.length; i += 1) {
        const tEmit = time - i * interval;
        const age = time - tEmit;
        const alive = p.vs === 0 ? age > 0 && age < 5.2 : tEmit >= born - 0.02 && age > 0 && age < duration;
        rings[i].visible = alive;
        if (!alive) continue;
        const emitU = p.vs === 0 ? 0 : (tEmit - born);
        const ex = p.vs === 0 ? -1.15 : (dir > 0 ? -2.45 : 2.15) + dir * speed * emitU;
        rings[i].position.set(ex, 0.02, 0);
        const radius = Math.max(0.04, age * 1.15);
        rings[i].scale.set(radius, radius, radius);
      }
      if (label) {
        const ahead = p.vs > 1;
        const behind = p.vs < -1;
        const name = state.focus === "ambulance" ? (state.lang === "bn" ? "অ্যাম্বুলেন্স" : "Ambulance") : state.lang === "bn" ? "উৎস" : "Source";
        const status = ahead ? (state.lang === "bn" ? "সামনে ঘন" : "Packed ahead") : behind ? (state.lang === "bn" ? "পেছনে ফাঁকা" : "Spread behind") : state.lang === "bn" ? "সমান ফাঁক" : "Even gaps";
        label.textContent = `${name} · ${status}`;
      }
    });
  }

  private buildGraph(state: ViewState) {
    const copy = textOf(state.lang);
    const p = state.params;
    if (state.focus === "yx") {
      this.axes(copy.distance, copy.displacement);
      this.transverse(this.root, 0, 0, p, 1, "crest", "");
      this.lambdaBracket(p, 0);
      return;
    }
    if (state.focus === "yt") {
      this.timeGraph(p, (t) => Math.sin(Math.PI * 2 * t), copy.time, copy.displacement, 0xf0d48a);
      this.transverse(this.root, -0.15, -0.55, p, 1, "plain", "");
      this.phaseMarks(p, -0.15);
      return;
    }
    if (state.focus === "ft") {
      const period = 1 / Math.max(0.05, p.freq);
      this.hyperbola((x) => 1 / x, 0.35, 2.6, period, p.freq, "T", "f", 2.6);
      return;
    }
    if (state.focus === "v-lambda") {
      const f = p.freq;
      this.lineGraph((x) => f * x, 0.2, 2.4, p.lambda, f * p.lambda, "λ", "v", 8);
      return;
    }
    this.hyperbola((x) => p.speed / x, 0.35, 2.6, p.freq, p.speed / Math.max(0.05, p.freq), "f", "λ", 3.2);
    this.transverse(this.root, -1.05, 0.4, { ...p, lambda: p.speed / Math.max(0.05, p.freq) }, 1, "plain", "");
  }

  private buildEcho(state: ViewState) {
    const copy = textOf(state.lang);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.5, 1.5), new THREE.MeshStandardMaterial({ color: 0x8d9a92 }));
    wall.position.set(2.05, 0.2, 0);
    this.root.add(wall);
    const person = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), new THREE.MeshBasicMaterial({ color: 0xf0d48a }));
    person.position.set(-2, 0.2, 0);
    this.root.add(person);
    const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), new THREE.MeshBasicMaterial({ color: 0x7eb6ff }));
    this.root.add(pulse);
    this.tag(wall, copy.wall, 0, 1.05, 0);
    this.tag(person, copy.source, 0, 0.45, 0);
    const timer = this.tag(pulse, "t", 0, 0.4, 0);
    const distance = state.params.distance;
    this.updaters.push((time) => {
      const src = -2;
      const end = 1.85;
      const span = end - src;
      const speed = 1.35;
      const round = (2 * span) / speed;
      const u = time % round;
      const going = u < span / speed;
      const x = going ? src + speed * u : end - speed * (u - span / speed);
      pulse.position.set(x, 0.28, 0);
      pulse.material.color.setHex(going ? 0xf0d48a : 0x7eb6ff);
      const real = (2 * distance) / SOUND_V;
      const shown = real * (u / round);
      if (timer) timer.textContent = state.lang === "bn" ? `t = ${shown.toFixed(2)} s` : `t = ${shown.toFixed(2)} s`;
    });
  }

  private buildBars(state: ViewState) {
    const copy = textOf(state.lang);
    const p = state.params;
    if (state.focus === "pitch") {
      this.longitudinal(this.root, 0.7, 0, { ...p, freq: p.freq }, true, "compress");
      this.longitudinal(this.root, -0.7, 0, { ...p, freq: Math.min(1800, p.freq * 2.6) }, true, "compress");
      this.tag(this.root, copy.low, X0, 1.15, 0);
      this.tag(this.root, copy.high, X0, -0.25, 0);
      return;
    }
    if (state.focus === "loudness") {
      this.longitudinal(this.root, 0.7, 0, { ...p, amp: Math.max(1.2, p.amp * 0.45) }, true, "compress");
      this.longitudinal(this.root, -0.7, 0, p, true, "compress");
      this.tag(this.root, copy.quiet, X0, 1.15, 0);
      this.tag(this.root, copy.loudOne, X0, -0.25, 0);
      return;
    }
    if (state.focus === "hearing") {
      const rows = [
        { y: 1.05, label: copy.infra, lam: 1.9, rate: 0.42 },
        { y: 0, label: copy.audible, lam: 0.78, rate: 1.35 },
        { y: -1.05, label: copy.ultra, lam: 0.38, rate: 2.5 },
      ];
      for (const row of rows) {
        this.longitudinal(this.root, row.y, 0, { ...p, amp: 4 }, true, "compress", { lam: row.lam, omega: Math.PI * 2 * row.rate });
        this.tag(this.root, row.label, 0, row.y + 0.42, 0);
      }
      return;
    }
    if (state.focus === "shapes") {
      const rows = [
        { y: 1.05, freq: 220, label: copy.low },
        { y: 0, freq: 680, label: state.lang === "bn" ? "মাঝারি" : "Middle" },
        { y: -1.05, freq: 1500, label: copy.high },
      ];
      for (const row of rows) {
        this.longitudinal(this.root, row.y, 0, { ...p, freq: row.freq }, true, "compress");
        this.tag(this.root, row.label, X0, row.y + 0.38, 0);
      }
      return;
    }
    if (state.focus === "sound-lambda") {
      this.longitudinal(this.root, 0, 0, p, true, "compress");
      this.tag(this.root, "λ = v/f", 0, 0.7, 0);
      return;
    }
    this.transverse(this.root, 0.85, 0, { ...p, freq: 0.7, lambda: 1.5, amp: 4 }, 1, "plain", copy.low);
    this.transverse(this.root, 0, 0, { ...p, freq: 1.7, lambda: 0.62, amp: 4 }, 1, "plain", copy.high);
    this.transverse(this.root, -0.9, 0, { ...p, freq: 0.7, lambda: 1.5, amp: p.amp }, 1, "plain", copy.loud);
  }

  private transverse(parent: any, y0: number, z0: number, p: Params, dir: 1 | -1, tint: "plain" | "crest", label: string) {
    const A = ampOf(p.amp);
    const lam = lambdaWorld(p.lambda);
    const k = (Math.PI * 2) / lam;
    const omega = omegaOf(p.freq);
    const phase = (p.phase * Math.PI) / 180;
    const chain = this.chain(parent, 0xe7c27a, 0.045);
    if (label) this.tag(parent, label, X0, y0 + A + 0.28, z0);
    this.restLine(parent, y0, z0);
    this.updaters.push((time) => {
      for (let i = 0; i < BEADS; i += 1) {
        const x = X0 + ((X1 - X0) * i) / (BEADS - 1);
        const arg = k * x - dir * omega * time + phase;
        const y = y0 + A * Math.sin(arg);
        chain.set(i, x, y, z0);
        if (tint === "crest") {
          const s = Math.sin(arg);
          chain.color(i, s > 0.72 ? 0xf0d48a : s < -0.72 ? 0x7d8cf0 : 0xf4efe4);
        }
      }
    });
    return { A, k, omega, phase, lam };
  }

  private longitudinal(parent: any, y0: number, z0: number, p: Params, sound: boolean, tint: "compress" | "rare", visual?: { lam?: number; omega?: number }) {
    const lam = visual?.lam ?? (sound ? soundLambda(p.freq) : lambdaWorld(p.lambda));
    const A = Math.min(ampOf(p.amp) * 0.7, lam * 0.075);
    const k = (Math.PI * 2) / lam;
    const omega = visual?.omega ?? omegaOf(sound ? Math.max(p.freq, 8) : p.freq);
    const phase = (p.phase * Math.PI) / 180;
    const chain = this.chain(parent, 0xd7dde2, 0.05);
    this.updaters.push((time) => {
      for (let i = 0; i < BEADS; i += 1) {
        const rest = X0 + ((X1 - X0) * i) / (BEADS - 1);
        const arg = k * rest - omega * time + phase;
        const s = A * Math.sin(arg);
        const slope = Math.cos(arg);
        chain.set(i, rest + s, y0, z0);
        const hot = slope < -0.25;
        const cold = slope > 0.25;
        chain.color(i, hot ? 0xe25b45 : cold ? 0x7eb6ff : 0xf4efe4);
        if (tint === "rare" && cold) chain.color(i, 0x7eb6ff);
      }
    });
  }

  private standingLine(parent: any, y0: number, z0: number, p: Params, tint: "plain" | "loops") {
    const A = ampOf(p.amp);
    const lam = lambdaWorld(p.lambda);
    const k = (Math.PI * 2) / lam;
    const omega = omegaOf(p.freq);
    const chain = this.chain(parent, 0xe7c27a, 0.045);
    this.restLine(parent, y0, z0);
    this.updaters.push((time) => {
      const wave = Math.cos(omega * time);
      for (let i = 0; i < BEADS; i += 1) {
        const x = X0 + ((X1 - X0) * i) / (BEADS - 1);
        const shape = Math.sin(k * x);
        const y = y0 + 2 * A * 0.5 * shape * wave;
        chain.set(i, x, y, z0);
        if (tint === "loops") {
          chain.color(i, Math.abs(shape) < 0.08 ? 0xe25b45 : shape > 0 ? 0xf0d48a : 0x7d8cf0);
        }
      }
    });
  }

  private loopString(parent: any, y0: number, n: number, A: number, visualFreq: number) {
    const span = X1 - X0;
    const k = (n * Math.PI) / span;
    const omega = omegaOf(Math.max(0.45, visualFreq));
    const chain = this.chain(parent, 0xe7c27a, 0.042);
    this.restLine(parent, y0, 0);
    this.updaters.push((time) => {
      const wave = Math.cos(omega * time);
      for (let i = 0; i < BEADS; i += 1) {
        const x = X0 + (span * i) / (BEADS - 1);
        const y = y0 + A * Math.sin(k * (x - X0)) * wave;
        chain.set(i, x, y, 0);
        const shape = Math.sin(k * (x - X0));
        chain.color(i, Math.abs(shape) < 0.06 ? 0xe25b45 : 0xf4efe4);
      }
    });
  }

  private standingMarks(state: ViewState, copy: Copy) {
    const lam = lambdaWorld(state.params.lambda);
    const y = 0.1;
    const pins = state.focus === "antinode" || state.focus === "anti-gap" ? "anti" : "nodes";
    if (state.focus === "node" || state.focus === "antinode" || state.focus === "node-gap" || state.focus === "anti-gap" || state.focus === "na-gap" || state.focus === "envelope" || state.focus === "nodes") {
      const step = lam / 2;
      for (let n = -8; n <= 8; n += 1) {
        const x = pins === "anti" && state.focus === "antinode" ? (n + 0.5) * step : n * step;
        if (x < X0 + 0.05 || x > X1 - 0.05) continue;
        if (state.focus === "antinode" || (state.focus === "nodes" && n % 1 === 0)) {
          const atAnti = state.focus === "antinode";
          if (atAnti) this.pin(x, y, 0xf0d48a);
          else this.pin(x, y, 0xe25b45);
        } else if (state.focus !== "anti-gap") this.pin(x, y, 0xe25b45);
        if (state.focus === "nodes" || state.focus === "envelope") this.pin((n + 0.5) * step, y + ampOf(state.params.amp), 0xf0d48a);
      }
    }
    if (state.focus === "node" ) this.tag(this.root, copy.node, 0, 0.55, 0);
    if (state.focus === "antinode") this.tag(this.root, copy.antinode, lam / 4, ampOf(state.params.amp) + 0.45, 0);
    if (state.focus === "node-gap" || state.focus === "nodes") {
      this.hbar(0, lam / 2, y + 0.85);
      this.tag(this.root, "λ/2", lam / 4, y + 1.05, 0);
    }
    if (state.focus === "anti-gap") {
      this.hbar(lam / 4, lam / 4 + lam / 2, y + ampOf(state.params.amp) + 0.45);
      this.tag(this.root, "λ/2", lam / 2, y + ampOf(state.params.amp) + 0.7, 0);
      this.pin(lam / 4, y, 0xf0d48a);
      this.pin(lam / 4 + lam / 2, y, 0xf0d48a);
    }
    if (state.focus === "na-gap") {
      this.hbar(0, lam / 4, y + 0.7);
      this.tag(this.root, "λ/4", lam / 8, y + 0.95, 0);
      this.pin(lam / 4, y, 0xf0d48a);
    }
    if (state.focus === "envelope" || state.focus === "nodes") this.envelope(state.params, y);
    if (state.focus === "phase") this.tag(this.root, state.lang === "bn" ? "পাশের লুপ উল্টো দশা" : "Next loop is opposite phase", 0, ampOf(state.params.amp) + 0.55, 0);
    if (state.focus === "create") this.tag(this.root, state.lang === "bn" ? "নকশা স্থির" : "Pattern stays", 0, ampOf(state.params.amp) + 0.5, 0);
  }

  private envelope(p: Params, y0: number) {
    const A = ampOf(p.amp);
    const lam = lambdaWorld(p.lambda);
    const k = (Math.PI * 2) / lam;
    for (const sign of [1, -1]) {
      const points: any[] = [];
      for (let i = 0; i < 80; i += 1) {
        const x = X0 + ((X1 - X0) * i) / 79;
        points.push(new THREE.Vector3(x, y0 + sign * A * Math.abs(Math.sin(k * x)), 0));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineDashedMaterial({ color: sign > 0 ? 0xf0d48a : 0x7d8cf0, dashSize: 0.07, gapSize: 0.05 });
      const line = new THREE.Line(geo, mat);
      line.computeLineDistances();
      this.root.add(line);
    }
  }

  private superWaves(p: Params, copy: Copy) {
    const A = ampOf(p.amp);
    const lam = lambdaWorld(p.lambda);
    const k = (Math.PI * 2) / lam;
    const omega = omegaOf(p.freq);
    const extra = (p.phase * Math.PI) / 180;
    const a = this.chain(this.root, 0x8fb8c9, 0.032);
    const b = this.chain(this.root, 0xc9a27a, 0.032);
    const sum = this.chain(this.root, 0xf4efe4, 0.048);
    this.restLine(this.root, 0, 0);
    this.tag(this.root, copy.sum, 0, A * 2 + 0.35, 0);
    this.updaters.push((time) => {
      for (let i = 0; i < BEADS; i += 1) {
        const x = X0 + ((X1 - X0) * i) / (BEADS - 1);
        const y1 = A * Math.sin(k * x - omega * time);
        const y2 = A * Math.sin(k * x - omega * time + extra);
        a.set(i, x, y1 * 0.92 + 0.02, -0.18);
        b.set(i, x, y2 * 0.92 - 0.02, 0.18);
        sum.set(i, x, y1 + y2, 0);
      }
    });
  }

  private oscillator(parent: any, z: number, phaseDeg: number, anchorX = -1.35) {
    const mass = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), new THREE.MeshStandardMaterial({ color: 0xc4623a, roughness: 0.45 }));
    parent.add(mass);
    const coilGeo = new THREE.BufferGeometry();
    const coilPos = new Float32Array(48 * 3);
    coilGeo.setAttribute("position", new THREE.BufferAttribute(coilPos, 3));
    const coil = new THREE.Line(coilGeo, new THREE.LineBasicMaterial({ color: 0xd5dfd6 }));
    parent.add(coil);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.03, 0.08), new THREE.MeshBasicMaterial({ color: 0x3d564c }));
    rail.position.set(0, -0.2, z);
    parent.add(rail);
    const posArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0.35, z), 0.4, 0xf0d48a);
    const velArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0.55, z), 0.4, 0x1aa58a);
    const accArrow = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0.75, z), 0.4, 0xe25b45);
    parent.add(posArrow, velArrow, accArrow);
    this.updaters.push((time) => {
      const state = this.state;
      if (!state) return;
      const A = 0.2 + (state.params.amp / 8) * 1.15;
      const omega = omegaOf(state.params.freq);
      const ph = (phaseDeg * Math.PI) / 180;
      const x = A * Math.sin(omega * time + ph);
      const v = Math.cos(omega * time + ph);
      mass.position.set(x, 0, z);
      const coils = 16;
      for (let i = 0; i < 48; i += 1) {
        const t = i / 47;
        const along = anchorX + t * (x - 0.2 - anchorX);
        coilPos[i * 3] = along;
        coilPos[i * 3 + 1] = Math.sin(i * 0.85) * 0.16;
        coilPos[i * 3 + 2] = z;
      }
      coilGeo.attributes.position.needsUpdate = true;
      posArrow.position.set(0, 0.28, z);
      posArrow.setDirection(new THREE.Vector3(x >= 0 ? 1 : -1, 0, 0));
      posArrow.setLength(Math.max(0.08, Math.abs(x)), 0.08, 0.05);
      velArrow.position.set(x, 0.42, z);
      velArrow.setDirection(new THREE.Vector3(v >= 0 ? 1 : -1, 0, 0));
      velArrow.setLength(Math.max(0.08, Math.abs(v) * 0.55), 0.08, 0.05);
      accArrow.position.set(x, 0.62, z);
      accArrow.setDirection(new THREE.Vector3(x >= 0 ? -1 : 1, 0, 0));
      accArrow.setLength(Math.max(0.08, Math.abs(x) * 0.7), 0.08, 0.05);
    });
  }

  private graphShm(state: ViewState) {
    const copy = textOf(state.lang);
    const kind = state.focus;
    const sample = (cycle: number) => {
      const s = Math.sin(Math.PI * 2 * cycle);
      if (kind === "vt") return Math.cos(Math.PI * 2 * cycle);
      if (kind === "at") return -s;
      return s;
    };
    const yLabel = kind === "vt" ? copy.velocity : kind === "at" ? copy.accel : copy.displacement;
    this.timeGraph(state.params, sample, copy.time, yLabel, kind === "vt" ? 0x1aa58a : kind === "at" ? 0xe25b45 : 0xf0d48a);
    this.oscillator(this.root, -0.8, 0, -1.6);
  }

  private timeGraph(p: Params, sample: (cycle: number) => number, xLabel: string, yLabel: string, color: number) {
    this.axes(xLabel, yLabel);
    const points: any[] = [];
    for (let i = 0; i <= 64; i += 1) {
      const cycle = i / 64;
      points.push(new THREE.Vector3(-2 + 4 * cycle, 0.15 + sample(cycle) * 0.85, 0));
    }
    this.root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color })));
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 12), new THREE.MeshBasicMaterial({ color: 0xf4efe4 }));
    this.root.add(dot);
    this.updaters.push((time) => {
      const cycle = (p.freq * time) % 1;
      dot.position.set(-2 + 4 * cycle, 0.15 + sample(cycle) * 0.85, 0);
    });
  }

  private hyperbola(fn: (x: number) => number, x0: number, x1: number, px: number, py: number, xLabel: string, yLabel: string, yMax: number) {
    this.axes(xLabel, yLabel);
    const points: any[] = [];
    for (let i = 0; i <= 48; i += 1) {
      const x = x0 + ((x1 - x0) * i) / 48;
      const y = fn(x);
      points.push(new THREE.Vector3(this.mapx(x, x0, x1), 0.12 + (y / yMax) * 1.5, 0));
    }
    this.root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0xf0d48a })));
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 12), new THREE.MeshBasicMaterial({ color: 0xe25b45 }));
    dot.position.set(this.mapx(px, x0, x1), 0.12 + (py / yMax) * 1.5, 0);
    this.root.add(dot);
  }

  private lineGraph(fn: (x: number) => number, x0: number, x1: number, px: number, py: number, xLabel: string, yLabel: string, yMax: number) {
    this.hyperbola(fn, x0, x1, px, py, xLabel, yLabel, yMax);
  }

  private mapx(value: number, min: number, max: number) {
    const t = (value - min) / (max - min);
    return -2 + Math.min(1, Math.max(0, t)) * 4;
  }

  private axes(xLabel: string, yLabel: string) {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.15, 0, 0),
      new THREE.Vector3(2.15, 0, 0),
      new THREE.Vector3(-2, 0, 0),
      new THREE.Vector3(-2, 1.85, 0),
    ]);
    this.root.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xd5dfd6 })));
    this.tag(this.root, xLabel, 1.7, -0.28, 0);
    this.tag(this.root, yLabel, -2.35, 1.55, 0);
  }

  private refract(state: ViewState, copy: Copy) {
    const normal = state.focus === "enter";
    const angle = normal ? 0 : 0.62;
    const ratio = 0.62;
    const sinR = Math.sin(angle) * ratio;
    const refr = Math.asin(Math.min(0.95, sinR));
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 3.2),
      new THREE.MeshBasicMaterial({ color: 0x17343f, side: THREE.DoubleSide }),
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.02;
    this.root.add(plane);
    const boundary = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 3.1), new THREE.MeshBasicMaterial({ color: 0xf0d48a }));
    this.root.add(boundary);
    this.tag(this.root, state.focus === "depth" ? copy.deep : state.lang === "bn" ? "মাধ্যম ১" : "Medium 1", -1.3, 0.35, 1.15);
    this.tag(this.root, state.focus === "depth" ? copy.shallow : state.lang === "bn" ? "মাধ্যম ২" : "Medium 2", 1.2, 0.35, 1.15);
    const left: any[] = [];
    const right: any[] = [];
    for (let i = 0; i < 7; i += 1) {
      left.push(this.crestBar(0x9fd7ff));
      right.push(this.crestBar(0xf4efe4));
    }
    this.updaters.push((time) => {
      const gap1 = normal ? 0.62 : 0.55;
      const gap2 = gap1 * ratio;
      const v1 = 0.55;
      const v2 = v1 * ratio;
      for (let i = 0; i < 7; i += 1) {
        const shift1 = (i * gap1 - time * v1) % (gap1 * 7);
        const x1 = -0.2 - (shift1 < 0 ? shift1 + gap1 * 7 : shift1);
        left[i].position.set(Math.max(-2.2, x1), 0.04, normal ? 0 : x1 * Math.tan(angle) * 0.35);
        left[i].rotation.y = angle;
        left[i].visible = x1 > -2.25 && x1 < -0.05;
        const shift2 = (i * gap2 - time * v2) % (gap2 * 7);
        const along = shift2 < 0 ? shift2 + gap2 * 7 : shift2;
        const x2 = 0.15 + along * Math.cos(refr);
        right[i].position.set(x2, 0.04, normal ? 0 : along * Math.sin(refr));
        right[i].rotation.y = refr;
        right[i].visible = x2 < 2.25;
      }
    });
  }

  private crestBar(color: number) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.03, 1.35), new THREE.MeshBasicMaterial({ color }));
    this.root.add(mesh);
    return mesh;
  }

  private waterSheet(state: ViewState, copy: Copy) {
    const geo = new THREE.PlaneGeometry(4.5, 3.3, 54, 40);
    geo.rotateX(-Math.PI / 2);
    const colors = new Float32Array(geo.attributes.position.count * 3);
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }));
    this.root.add(mesh);
    const p = state.params;
    if (state.focus === "water") {
      this.tag(this.root, "S₁", -0.55, 0.35, 0);
      this.tag(this.root, "S₂", 0.55, 0.35, 0);
    }
    if (state.focus === "edge") this.barrier(0, -0.85, 0.12, 1.5);
    if (state.focus === "narrow" || state.focus === "gaps") {
      this.barrier(0, 1.15, 0.12, 0.7);
      this.barrier(0, -1.15, 0.12, 0.7);
    }
    if (state.focus === "edge") this.tag(this.root, copy.shadow, 1.1, 0.3, -0.8);
    if (state.focus === "gaps") {
      this.tag(this.root, copy.wide, 1.2, 0.28, 0.85);
      this.tag(this.root, copy.narrow, 1.2, 0.28, -0.85);
    }
    if (state.focus === "narrow") this.tag(this.root, copy.narrow, 1.15, 0.3, 0);
    this.updaters.push((time) => {
      const pos = geo.attributes.position;
      const col = geo.attributes.color;
      const k = (Math.PI * 2) / (state.focus === "narrow" || state.focus === "gaps" || state.focus === "edge" ? lambdaWorld(p.lambda) : lambdaWorld(p.lambda));
      const w = omegaOf(p.freq <= 6 ? p.freq : 1);
      const ph = (p.phase * Math.PI) / 180;
      for (let i = 0; i < pos.count; i += 1) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const h = this.waterHeight(state.focus, x, z, time, k, w, ph, p);
        pos.setY(i, h);
        const t = Math.max(0, Math.min(1, (h / 0.22 + 1) / 2));
        col.setXYZ(i, 0.08 + t * 0.9, 0.14 + t * 0.82, 0.22 + t * 0.7);
      }
      pos.needsUpdate = true;
      col.needsUpdate = true;
    });
  }

  private waterHeight(focus: string, x: number, z: number, time: number, k: number, w: number, ph: number, p: Params) {
    if (focus === "water") {
      const r1 = Math.hypot(x + 0.55, z);
      const r2 = Math.hypot(x - 0.55, z);
      const a1 = 0.09 / Math.sqrt(r1 + 0.35);
      const a2 = 0.09 / Math.sqrt(r2 + 0.35);
      return a1 * Math.sin(k * r1 - w * time) + a2 * Math.sin(k * r2 - w * time + ph);
    }
    const plane = 0.1 * Math.sin(k * x - w * time);
    if (focus === "edge") {
      if (x < 0) return plane;
      const r = Math.hypot(x, z);
      const curl = (0.1 / Math.sqrt(r + 0.3)) * Math.sin(k * r - w * time);
      if (z < -0.05) return curl * Math.exp(-Math.max(0, -z) * 0.25);
      return plane * 0.3 + curl;
    }
    const half = focus === "gaps" ? (z > 0 ? 0.62 : 0.14) : Math.max(0.12, p.gap * 0.85);
    const center = focus === "gaps" ? (z > 0 ? 0.75 : -0.75) : 0;
    if (x < 0) return plane;
    if (focus === "gaps" && Math.abs(z) < 0.18) return 0;
    const open = Math.abs(z - center) < half || (focus === "narrow" && Math.abs(z) < half);
    if (!open && Math.abs(z - center) > half + 0.05 && focus !== "water") {
      const mouth = Math.abs(z - center) < half + 0.4;
      if (!mouth && x < 0.2) return 0;
    }
    const r = Math.hypot(x, z - center);
    const spread = half < 0.28 ? 1 : 0.35;
    return spread * (0.11 / Math.sqrt(r + 0.3)) * Math.sin(k * r - w * time);
  }

  private barrier(x: number, z: number, w: number, d: number) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, 0.28, d), new THREE.MeshStandardMaterial({ color: 0xc4623a }));
    mesh.position.set(x, 0.12, z);
    this.root.add(mesh);
  }

  private pulse(parent: any, y0: number, fixed: boolean, A: number) {
    const chain = this.chain(parent, 0xe7c27a, 0.04);
    this.restLine(parent, y0, 0);
    const width = 0.24;
    const speed = 0.92;
    const start = X0 + 0.45;
    const trip = (X1 - start + X1 - X0 + 0.6) / speed;
    this.updaters.push((time) => {
      const local = time % trip;
      const ci = start + speed * local;
      const cr = 2 * X1 - ci;
      const sign = fixed ? -1 : 1;
      for (let i = 0; i < BEADS; i += 1) {
        const x = X0 + ((X1 - X0) * i) / (BEADS - 1);
        const yi = Math.exp(-(((x - ci) / width) ** 2));
        const yr = Math.exp(-(((x - cr) / width) ** 2));
        chain.set(i, x, y0 + A * 1.15 * (yi + sign * yr), 0);
        chain.color(i, fixed && yr > yi && yr > 0.2 ? 0x7d8cf0 : 0xf4efe4);
      }
    });
  }

  private pipe(parent: any, z: number, n: number, closed: boolean, gain: number, label: string) {
    const span = X1 - X0;
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, span, 28, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x8ec7ea, transparent: true, opacity: 0.28, roughness: 0.2, side: THREE.DoubleSide, depthWrite: false }),
    );
    tube.rotation.z = Math.PI / 2;
    tube.position.set(0, 0, z);
    parent.add(tube);
    if (closed) {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.14, 20), new THREE.MeshStandardMaterial({ color: 0x8d9a92 }));
      cap.rotation.z = Math.PI / 2;
      cap.position.set(X0 - 0.02, 0, z);
      parent.add(cap);
    }
    this.tag(parent, label, 0, 0.55, z);
    const A = 0.5 * Math.max(0.08, gain);
    const count = 36;
    const chain = this.beads(parent, count, 0xf4efe4, 0.035);
    const odd = 2 * n - 1;
    const omega = omegaOf(closed ? 0.5 * odd : 0.62 * n);
    this.updaters.push((time) => {
      const wave = Math.cos(omega * time);
      for (let i = 0; i < count; i += 1) {
        const t = i / (count - 1);
        const x = X0 + span * t;
        const shape = closed ? Math.sin((odd * Math.PI * t) / 2) : Math.cos(n * Math.PI * t);
        chain.set(i, x, shape * A * wave, z);
        chain.color(i, Math.abs(shape) < 0.08 ? 0xe25b45 : 0xf0d48a);
      }
    });
  }

  private energyRider(p: Params) {
    const rider = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshBasicMaterial({ color: 0x1aa58a }));
    this.root.add(rider);
    this.tag(rider, textOf(this.state?.lang ?? "bn").energy, 0, 0.28, 0);
    this.updaters.push((time) => {
      const lam = lambdaWorld(p.lambda);
      const k = (Math.PI * 2) / lam;
      const omega = omegaOf(p.freq);
      const phase = (p.phase * Math.PI) / 180;
      const x = crestX(time, k, omega, phase);
      rider.position.set(x, 0.15 + ampOf(p.amp), 0);
    });
  }

  private particleArrow(p: Params, waveToo: boolean, y0 = 0.15) {
    const arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, y0, 0), 0.4, 0xe25b45);
    this.root.add(arrow);
    if (waveToo) this.waveArrow(y0 + 0.9);
    this.updaters.push((time) => {
      const lam = lambdaWorld(p.lambda);
      const k = (Math.PI * 2) / lam;
      const omega = omegaOf(p.freq);
      const x = 0;
      const arg = k * x - omega * time + (p.phase * Math.PI) / 180;
      const y = y0 + ampOf(p.amp) * Math.sin(arg);
      const vy = -Math.cos(arg);
      arrow.position.set(x, y, 0);
      arrow.setDirection(new THREE.Vector3(0, vy >= 0 ? 1 : -1, 0));
      arrow.setLength(0.25 + Math.abs(vy) * 0.35, 0.1, 0.06);
    });
  }

  private waveArrow(y: number) {
    const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(-0.2, y, 0), 1.1, 0xf0d48a, 0.16, 0.08);
    this.root.add(arrow);
  }

  private ampBracket(A: number, y0: number) {
    this.vbar(0.35, y0, y0 + A);
    this.tag(this.root, "A", 0.55, y0 + A * 0.5, 0);
  }

  private lambdaBracket(p: Params, y0: number) {
    const lam = lambdaWorld(p.lambda);
    const x0 = -lam / 2;
    this.hbar(x0, x0 + lam, y0 + ampOf(p.amp) + 0.38);
    this.tag(this.root, "λ", x0 + lam / 2, y0 + ampOf(p.amp) + 0.58, 0);
  }

  private crestTag(p: Params, label: string) {
    const holder = new THREE.Group();
    this.root.add(holder);
    this.tag(holder, label, 0, 0.28, 0);
    this.updaters.push((time) => {
      const lam = lambdaWorld(p.lambda);
      const k = (Math.PI * 2) / lam;
      const omega = omegaOf(p.freq);
      const phase = (p.phase * Math.PI) / 180;
      holder.position.set(crestX(time, k, omega, phase), 0.15 + ampOf(p.amp) + 0.12, 0);
    });
  }

  private phaseMarks(p: Params, y0: number) {
    const a = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 12), new THREE.MeshBasicMaterial({ color: 0xf0d48a }));
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 12), new THREE.MeshBasicMaterial({ color: 0x7eb6ff }));
    this.root.add(a, b);
    const dx = 0.75;
    this.updaters.push((time) => {
      const lam = lambdaWorld(p.lambda);
      const k = (Math.PI * 2) / lam;
      const omega = omegaOf(p.freq);
      const phase = (p.phase * Math.PI) / 180;
      const x1 = -0.35;
      const y1 = y0 + ampOf(p.amp) * Math.sin(k * x1 - omega * time + phase);
      const y2 = y0 + ampOf(p.amp) * Math.sin(k * (x1 + dx) - omega * time + phase);
      a.position.set(x1, y1, 0);
      b.position.set(x1 + dx, y2, 0);
    });
  }

  private clockFace(p: Params, y: number) {
    const group = new THREE.Group();
    group.position.set(0, y, 0);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.32, 32), new THREE.MeshBasicMaterial({ color: 0xd5dfd6, side: THREE.DoubleSide }));
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.03), new THREE.MeshBasicMaterial({ color: 0xc4623a }));
    hand.position.x = 0.12;
    const pivot = new THREE.Group();
    pivot.add(hand);
    group.add(ring, pivot);
    this.root.add(group);
    this.tag(group, textOf(this.state?.lang ?? "bn").clock, 0, 0.5, 0);
    this.updaters.push((time) => {
      pivot.rotation.z = -omegaOf(p.freq) * time;
    });
  }

  private endPosts() {
    this.endPost(X0, 0);
    this.endPost(X1, 0);
  }

  private endPost(x: number, y: number) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 10), new THREE.MeshStandardMaterial({ color: 0x8d9a92 }));
    post.position.set(x, y - 0.15, 0);
    this.root.add(post);
  }

  private pin(x: number, y: number, color: number) {
    if (x < X0 || x > X1) return;
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), new THREE.MeshBasicMaterial({ color }));
    mesh.position.set(x, y, 0);
    this.root.add(mesh);
  }

  private hbar(x0: number, x1: number, y: number) {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x0, y, 0),
      new THREE.Vector3(x1, y, 0),
      new THREE.Vector3(x0, y - 0.08, 0),
      new THREE.Vector3(x0, y + 0.08, 0),
      new THREE.Vector3(x1, y - 0.08, 0),
      new THREE.Vector3(x1, y + 0.08, 0),
    ]);
    this.root.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xe2a63b })));
  }

  private vbar(x: number, y0: number, y1: number) {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, y0, 0),
      new THREE.Vector3(x, y1, 0),
      new THREE.Vector3(x - 0.08, y0, 0),
      new THREE.Vector3(x + 0.08, y0, 0),
      new THREE.Vector3(x - 0.08, y1, 0),
      new THREE.Vector3(x + 0.08, y1, 0),
    ]);
    this.root.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xe2a63b })));
  }

  private restLine(parent: any, y: number, z: number) {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(X0, y, z), new THREE.Vector3(X1, y, z)]);
    parent.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x3d564c })));
  }

  private chain(parent: any, lineColor: number, radius: number) {
    return this.beads(parent, BEADS, lineColor, radius);
  }

  private beads(parent: any, count: number, lineColor: number, radius: number) {
    const sphere = new THREE.SphereGeometry(radius, 12, 10);
    const positions = new Float32Array(count * 3);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: lineColor }));
    parent.add(line);
    const meshes: any[] = [];
    for (let i = 0; i < count; i += 1) {
      const mesh = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xf4efe4 }));
      parent.add(mesh);
      meshes.push(mesh);
    }
    return {
      set(i: number, x: number, y: number, z: number) {
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        meshes[i].position.set(x, y, z);
        lineGeo.attributes.position.needsUpdate = true;
      },
      color(i: number, hex: number) {
        meshes[i].material.color.setHex(hex);
      },
    };
  }

  private tag(parent: any, text: string, x: number, y: number, z: number) {
    if (!text) return null;
    const el = document.createElement("span");
    el.className = "float-tag";
    el.textContent = text;
    const obj = new CSS2DObject(el);
    obj.position.set(x, y, z);
    parent.add(obj);
    return el;
  }

}

function crestX(time: number, k: number, omega: number, phase: number) {
  const step = (Math.PI * 2) / k;
  let x = (Math.PI / 2 + omega * time - phase) / k;
  while (x > X1) x -= step;
  while (x < X0) x += step;
  return Math.min(X1, Math.max(X0, x));
}

function resonanceGain(driver: number, natural: number) {
  const gamma = Math.max(12, Math.abs(natural) * 0.07);
  const d = driver - natural;
  return gamma / Math.sqrt(d * d + gamma * gamma);
}
