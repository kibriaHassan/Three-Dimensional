import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import type { Family } from "./catalog";
import {
  G,
  PENDULUM_LENGTH,
  TRACK_RADIUS,
  circularForce,
  collisionEnergy,
  efficiencyOf,
  elastic,
  fallSpeed,
  frictionWork,
  instantPower,
  kinetic,
  pendulumAmp,
  pendulumHeight,
  potential,
  powerOf,
  springAmplitude,
  stoppingDistance,
  throwHeight,
  workOf,
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
  slide: { pos: [0.3, 1.7, 4.6], target: [0, 0.4, 0] },
  signs: { pos: [0.1, 2.1, 6.2], target: [0, 0.45, 0] },
  lift: { pos: [1.6, 1.8, 4.4], target: [0, 0.8, 0] },
  race: { pos: [0.2, 1.7, 5.4], target: [0, 0.4, 0] },
  spring: { pos: [0.4, 1.5, 4.8], target: [0.2, 0.35, 0] },
  trade: { pos: [1.4, 1.8, 4.8], target: [0, 0.7, 0] },
  swing: { pos: [0.2, 1.5, 4.6], target: [0, 0.9, 0] },
  track: { pos: [0.2, 2.1, 6.2], target: [0, 0.7, 0] },
  bars: { pos: [1.2, 1.8, 5], target: [0, 0.6, 0] },
  graph: { pos: [0.15, 1.6, 4.8], target: [0, 0.7, 0] },
  power: { pos: [0.2, 1.8, 5.6], target: [0, 0.5, 0] },
  machine: { pos: [0.15, 1.9, 5.8], target: [0, 0.7, 0] },
  crash: { pos: [0.1, 1.8, 5.6], target: [0, 0.45, 0] },
  orbit: { pos: [1.8, 2.2, 4.2], target: [0, 0.2, 0] },
};

function sweep(time: number, seconds = 6) {
  const turn = (time % (seconds * 2)) / seconds;
  return turn <= 1 ? turn : 2 - turn;
}

function joule(value: number) {
  const digits = Math.abs(value) >= 100 ? 0 : 1;
  return `${value.toFixed(digits)} J`;
}

function coasterY(x: number) {
  const big = Math.exp(-(((x + 1.15) / 0.72) ** 2));
  const small = Math.exp(-(((x - 1.25) / 0.55) ** 2));
  return 0.12 + 1.35 * big + 0.62 * small;
}

const COASTER_TOP = coasterY(-1.15);

export class EnergyWorld {
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
  private updaters: Array<(time: number, dt: number) => void> = [];

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
    renderer.domElement.setAttribute("aria-label", "কাজ, শক্তি ও ক্ষমতার ত্রিমাত্র দৃশ্য");
    host.append(renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.domElement.style.position = "absolute";
    this.labelRenderer.domElement.style.inset = "0";
    this.labelRenderer.domElement.style.pointerEvents = "none";
    host.append(this.labelRenderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.08, 80);
    this.camera.position.set(2, 1.7, 4);
    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.minDistance = 1.8;
    this.controls.maxDistance = 14;
    this.controls.target.set(0, 0.45, 0);
    this.controls.update();

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.74));
    this.scene.add(new THREE.HemisphereLight(0xf4efe4, 0x1a2822, 0.42));
    const sun = new THREE.DirectionalLight(0xffffff, 1.15);
    sun.position.set(4, 7, 5);
    this.scene.add(sun);

    const grid = new THREE.GridHelper(12, 24, 0x3d564c, 0x24362f);
    const mats = Array.isArray(grid.material) ? grid.material : [grid.material];
    for (const mat of mats) {
      mat.transparent = true;
      mat.opacity = 0.38;
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
    const motion = this.playing ? dt * this.speed : 0;
    if (this.playing) this.time += motion;
    this.ensure();
    if (this.home && this.state) {
      const cam = CAM[this.state.family];
      this.camera.position.set(cam.pos[0], cam.pos[1], cam.pos[2]);
      this.controls.target.set(cam.target[0], cam.target[1], cam.target[2]);
      this.controls.update();
      this.controls.saveState();
      this.home = false;
    }
    for (const update of this.updaters) update(this.time, motion);
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
    if (state.family === "slide" || state.family === "signs") this.buildSlide(state);
    else if (state.family === "lift") this.buildLift(state);
    else if (state.family === "race") this.buildRace(state);
    else if (state.family === "spring") this.buildSpring(state);
    else if (state.family === "trade" || state.family === "bars") this.buildTrade(state);
    else if (state.family === "swing") this.buildPendulum(state);
    else if (state.family === "track") this.buildCoaster(state);
    else if (state.family === "graph") this.buildGraph(state);
    else if (state.family === "power") this.buildPower(state);
    else if (state.family === "machine") this.buildMachine(state);
    else if (state.family === "crash") this.buildCrash(state);
    else this.buildOrbit(state);
  }

  private buildSlide(state: ViewState) {
    const bn = state.lang === "bn";
    const signs = state.family === "signs";
    const friction = state.focus === "friction";
    const cases = signs
      ? [
          { x: -1.85, angle: 0, name: bn ? "ধনাত্মক" : "Positive" },
          { x: 0, angle: 90, name: bn ? "শূন্য" : "Zero" },
          { x: 1.85, angle: 180, name: bn ? "ঋণাত্মক" : "Negative" },
        ]
      : [{ x: 0, angle: friction ? 180 : state.params.angle, name: friction ? (bn ? "ঘর্ষণ" : "Friction") : "" }];

    for (const item of cases) {
      const group = new THREE.Group();
      group.position.x = item.x;
      if (signs) group.scale.setScalar(0.72);
      this.root.add(group);
      const box = this.block(0xc4a574);
      group.add(box);
      const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0.55, 0), 0.8, friction ? 0xe07a62 : 0xe7a15a, 0.16, 0.1);
      group.add(arrow);
      const heat = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 14, 10),
        new THREE.MeshStandardMaterial({ color: 0xe07a62, emissive: 0xe07a62, emissiveIntensity: 0, transparent: true, opacity: 0.85 }),
      );
      heat.position.y = 0.55;
      heat.visible = false;
      if (friction) group.add(heat);
      const read = this.tag(group, item.name, 0, 1.45, 0);
      this.updaters.push((time) => {
        const u = sweep(time, friction ? 3.2 : 3.6);
        const travel = signs ? 0.7 : 1.5;
        let along = u;
        if (friction) {
          const stop = stoppingDistance(state.params.speed, state.params.friction);
          const shown = Number.isFinite(stop) ? Math.min(state.params.speed * 0.45, stop) : state.params.speed * 0.45;
          along = Math.min(1, (u * Math.max(shown, 0.2)) / Math.max(shown, 0.2));
        }
        box.position.x = -travel / 2 + along * travel;
        const rad = (item.angle * Math.PI) / 180;
        const len = 0.4 + (friction ? state.params.friction * 1.4 : state.params.force / 45);
        arrow.setDirection(new THREE.Vector3(Math.cos(rad), Math.sin(rad), 0));
        arrow.setLength(Math.max(0.25, len), 0.14, 0.09);
        arrow.position.set(box.position.x, 0.42, 0);
        if (friction) {
          const distance = Math.min(stoppingDistance(state.params.speed, state.params.friction), state.params.speed * along);
          const lost = frictionWork(state.params.mass, state.params.friction, Number.isFinite(distance) ? distance : 0);
          heat.visible = true;
          heat.scale.setScalar(0.4 + Math.min(1.4, Math.abs(lost) / 80));
          heat.position.x = box.position.x;
          heat.material.emissiveIntensity = Math.min(1.4, Math.abs(lost) / 50);
          if (read) read.textContent = `${item.name} · ${joule(lost)}`;
          return;
        }
        const done = workOf(state.params.force, state.params.span * along, item.angle);
        if (read) read.textContent = `${item.name ? `${item.name} · ` : ""}${joule(done)}`;
      });
    }
  }

  private buildLift(state: ViewState) {
    const bn = state.lang === "bn";
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 2.4, 12),
      new THREE.MeshStandardMaterial({ color: 0x8d9a92, metalness: 0.45, roughness: 0.4 }),
    );
    post.position.set(-0.85, 1.2, 0);
    this.root.add(post);
    const mass = this.block(0xd7c4a8);
    this.root.add(mass);
    const rope = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 1, 8),
      new THREE.MeshStandardMaterial({ color: 0xf3eadc, roughness: 0.6 }),
    );
    this.root.add(rope);
    const board = new THREE.Group();
    board.position.set(1.35, 0, 0);
    this.root.add(board);
    const bars = this.columns(board, [
      { name: state.focus === "potential" ? (bn ? "বিভব" : "PE") : bn ? "কাজ" : "Work", color: 0x3d6fbf },
    ]);
    const read = this.tag(this.root, "", 0, 2.35, 0);
    const cap = Math.max(20, potential(state.params.mass, state.params.height));
    this.updaters.push((time) => {
      const u = sweep(time, 4);
      const h = state.params.height * u;
      const y = 0.28 + h * 0.28;
      mass.position.set(0, y, 0);
      rope.scale.y = Math.max(0.15, 2.15 - y);
      rope.position.set(0, y + rope.scale.y / 2, 0);
      const energy = potential(state.params.mass, h);
      this.grow(bars[0], energy, cap);
      if (read) read.textContent = state.focus === "potential" ? `U = ${joule(energy)}` : `W = ${joule(energy)}`;
    });
  }

  private buildRace(state: ViewState) {
    const bn = state.lang === "bn";
    const compare = state.focus === "speeds";
    const speeds = compare ? [1, 2, 3] : [1];
    const colors = [0x8fd0ef, 0xe7a15a, 0xe07a62];
    speeds.forEach((factor, index) => {
      const z = compare ? (index - 1) * 0.85 : 0;
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 24, 16),
        new THREE.MeshStandardMaterial({ color: colors[index], roughness: 0.35, metalness: 0.15 }),
      );
      body.position.z = z;
      this.root.add(body);
      const board = new THREE.Group();
      board.position.set(1.7, 0, z);
      this.root.add(board);
      const label = compare ? `${factor}v` : bn ? "গতি" : "KE";
      const bars = this.columns(board, [{ name: label, color: colors[index] }]);
      const full = kinetic(state.params.mass, state.params.speed * factor);
      this.updaters.push((time) => {
        const u = compare ? (time * (0.35 + factor * 0.25)) % 2.6 : sweep(time, 3.5);
        const across = compare ? -1.3 + (u / 2.6) * 2.6 : -1.2 + sweep(time, 3.5) * 2.4;
        body.position.x = across > 1.3 && compare ? across - 2.6 : across;
        const shown = compare ? full : full * sweep(time, 3.5) ** 2;
        this.grow(bars[0], shown, Math.max(12, kinetic(state.params.mass, state.params.speed * 3)));
      });
    });
    const read = this.tag(this.root, "", 0, 1.35, 0);
    this.updaters.push((time) => {
      if (!read) return;
      if (compare) {
        const k = kinetic(state.params.mass, state.params.speed);
        read.textContent = `1 : 4 : 9 · ${joule(k)} : ${joule(4 * k)} : ${joule(9 * k)}`;
        return;
      }
      const v = state.params.speed * sweep(time, 3.5);
      read.textContent = `K = ${joule(kinetic(state.params.mass, v))}`;
    });
  }

  private buildSpring(state: ViewState) {
    const bn = state.lang === "bn";
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 1.1, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x8d9a92, metalness: 0.35, roughness: 0.45 }),
    );
    wall.position.set(-1.55, 0.55, 0);
    this.root.add(wall);
    const coils = this.coil(-1.4);
    const block = this.block(0xd7c4a8);
    this.root.add(block);
    const board = new THREE.Group();
    board.position.set(1.8, 0, 0);
    this.root.add(board);
    const bars = this.columns(board, [
      { name: bn ? "স্প্রিং" : "Spring", color: 0xe7a15a },
      { name: bn ? "গতি" : "KE", color: 0x3d8f7a },
    ]);
    const read = this.tag(this.root, "", 0, 1.55, 0);
    const hit = state.focus === "hit";
    const variable = state.focus === "variable";
    this.updaters.push((time) => {
      const k = state.params.spring;
      const m = state.params.mass;
      let x = 0;
      let ke = 0;
      let stored = 0;
      if (variable) {
        const u = sweep(time, 4);
        x = state.params.span * u;
        stored = elastic(k, x);
      } else if (hit) {
        const v = state.params.speed;
        const omega = Math.sqrt(k / Math.max(m, 0.05));
        const contact = Math.PI / omega;
        const cycle = 1.1 + contact + 1.1;
        const t = time % cycle;
        if (t < 1.1) {
          x = 0;
          ke = kinetic(m, v);
          block.position.x = -1.15 + (t / 1.1) * 1.15;
        } else if (t < 1.1 + contact) {
          const tau = t - 1.1;
          x = (v / omega) * Math.sin(omega * tau);
          stored = elastic(k, x);
          ke = Math.max(0, kinetic(m, v) - stored);
          block.position.x = x * 1.3;
        } else {
          const tau = t - 1.1 - contact;
          x = 0;
          ke = kinetic(m, v);
          block.position.x = -Math.min(1.15, v * 0.35 * tau);
        }
      } else {
        const amp = state.params.span;
        const omega = Math.sqrt(k / Math.max(m, 0.2));
        x = amp * Math.sin(omega * time);
        stored = elastic(k, x);
        ke = Math.max(0, elastic(k, amp) - stored);
      }
      if (!hit) block.position.set(x * 2.2, 0.28, 0);
      this.setCoil(coils, -1.4, block.position.x - 0.28);
      const cap = Math.max(8, hit ? kinetic(m, state.params.speed) : elastic(k, state.params.span));
      this.grow(bars[0], stored, cap);
      this.grow(bars[1], ke, cap);
      if (read) read.textContent = variable ? `W = ${joule(stored)}` : `U = ${joule(stored)}`;
    });
  }

  private buildTrade(state: ViewState) {
    const bn = state.lang === "bn";
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 24, 16),
      new THREE.MeshStandardMaterial({ color: 0xe7a15a, roughness: 0.32, metalness: 0.2 }),
    );
    this.root.add(ball);
    if (state.focus === "exchange" || state.focus === "conserve") {
      const ramp = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.08, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x355e56, roughness: 0.7 }),
      );
      ramp.position.set(0, 0.55, 0);
      ramp.rotation.z = 0.42;
      this.root.add(ramp);
    }
    const board = new THREE.Group();
    board.position.set(1.85, 0, 0);
    this.root.add(board);
    const bars = this.columns(board, [
      { name: bn ? "গতি" : "KE", color: 0x3d8f7a },
      { name: bn ? "বিভব" : "PE", color: 0x3d6fbf },
      { name: bn ? "মোট" : "Total", color: 0xe2a63b },
    ]);
    const read = this.tag(this.root, "", -0.2, 2.15, 0);
    this.updaters.push((time) => {
      const m = state.params.mass;
      let height = 0;
      let speed = 0;
      let total = 0;
      if (state.focus === "fall") {
        const h = state.params.height;
        const flight = Math.sqrt((2 * h) / G);
        const t = time % (flight + 0.45);
        height = Math.max(0, h - 0.5 * G * t * t);
        speed = height <= 0 ? fallSpeed(h) : G * t;
        total = potential(m, h);
        ball.position.set(0, 0.2 + height * 0.32, 0);
      } else if (state.focus === "throw") {
        const v = state.params.speed;
        const flight = (2 * v) / G;
        const t = time % (flight + 0.35);
        height = Math.max(0, v * t - 0.5 * G * t * t);
        speed = Math.abs(v - G * t);
        total = kinetic(m, v);
        ball.position.set(0, 0.2 + height * 0.28, 0);
      } else {
        const h = state.params.height;
        const u = sweep(time, 3.4);
        height = h * (1 - u);
        speed = fallSpeed(h - height);
        total = potential(m, h);
        ball.position.set(-1.1 + u * 2.2, 0.25 + height * 0.32, 0);
      }
      const pe = potential(m, height);
      const ke = state.focus === "throw" ? Math.max(0, total - pe) : kinetic(m, speed);
      const cap = Math.max(10, total);
      this.grow(bars[0], ke, cap);
      this.grow(bars[1], pe, cap);
      this.grow(bars[2], state.focus === "throw" ? total : pe + ke, cap);
      if (!read) return;
      if (state.focus === "throw") read.textContent = `h_max = ${throwHeight(state.params.speed).toFixed(2)} m`;
      else if (state.focus === "fall") read.textContent = `v = ${fallSpeed(state.params.height).toFixed(2)} m/s`;
      else read.textContent = `K + U = ${joule(total)}`;
    });
  }

  private buildPendulum(state: ViewState) {
    const bn = state.lang === "bn";
    const pivot = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xf3eadc, metalness: 0.4, roughness: 0.35 }),
    );
    pivot.position.y = 2.05;
    this.root.add(pivot);
    const rod = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 2.05, 0), new THREE.Vector3(0, 0.5, 0)]),
      new THREE.LineBasicMaterial({ color: 0xc9d4ce }),
    );
    this.root.add(rod);
    const bob = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 24, 16),
      new THREE.MeshStandardMaterial({ color: 0xc4623a, roughness: 0.35, metalness: 0.2 }),
    );
    this.root.add(bob);
    const board = new THREE.Group();
    board.position.set(1.7, 0.2, 0);
    this.root.add(board);
    const bars = this.columns(board, [
      { name: bn ? "গতি" : "KE", color: 0x3d8f7a },
      { name: bn ? "বিভব" : "PE", color: 0x3d6fbf },
    ]);
    const read = this.tag(this.root, "", 0, 2.4, 0);
    const amp = pendulumAmp(state.params.angle);
    const omega = Math.sqrt(G / PENDULUM_LENGTH);
    const total = potential(state.params.mass, pendulumHeight(amp));
    this.updaters.push((time) => {
      const theta = amp * Math.cos(omega * time);
      const x = Math.sin(theta) * 1.55;
      const y = 2.05 - Math.cos(theta) * 1.55;
      bob.position.set(x, y, 0);
      const points = rod.geometry.attributes.position;
      points.setXYZ(0, 0, 2.05, 0);
      points.setXYZ(1, x, y, 0);
      points.needsUpdate = true;
      const pe = potential(state.params.mass, pendulumHeight(Math.abs(theta)));
      const ke = Math.max(0, total - pe);
      this.grow(bars[0], ke, Math.max(4, total));
      this.grow(bars[1], pe, Math.max(4, total));
      if (read) read.textContent = `W_টান = 0 · K + U = ${joule(total)}`;
    });
  }

  private buildCoaster(state: ViewState) {
    const bn = state.lang === "bn";
    const points: any[] = [];
    for (let i = 0; i <= 48; i += 1) {
      const x = -2.3 + (i / 48) * 4.6;
      points.push(new THREE.Vector3(x, coasterY(x), 0));
    }
    const rail = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 80, 0.045, 8, false),
      new THREE.MeshStandardMaterial({ color: 0x9ddec0, metalness: 0.35, roughness: 0.4 }),
    );
    this.root.add(rail);
    const car = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.18, 0.22),
      new THREE.MeshStandardMaterial({ color: 0xc4623a, roughness: 0.4, metalness: 0.25 }),
    );
    this.root.add(car);
    const board = new THREE.Group();
    board.position.set(0, 0, 1.15);
    this.root.add(board);
    const bars = this.columns(board, [
      { name: bn ? "গতি" : "KE", color: 0x3d8f7a },
      { name: bn ? "বিভব" : "PE", color: 0x3d6fbf },
      { name: bn ? "মোট" : "Total", color: 0xe2a63b },
    ]);
    const rider = { x: -1.15, dir: 1 };
    const read = this.tag(this.root, "", 0, 2.15, 0);
    this.updaters.push((_time, dt) => {
      const m = state.params.mass;
      const hill = state.params.height;
      const total = potential(m, hill) + kinetic(m, state.params.speed);
      const heightAt = (x: number) => hill * (coasterY(x) / COASTER_TOP);
      const step = () => {
        const next = rider.x + rider.dir * 0.08;
        return total - potential(m, heightAt(next));
      };
      if (step() < 0) rider.dir *= -1;
      const here = heightAt(rider.x);
      const spare = Math.max(0, total - potential(m, here));
      const velocity = Math.sqrt((2 * spare) / Math.max(m, 0.05));
      rider.x += rider.dir * Math.max(0.15, velocity) * dt * 0.28;
      if (rider.x > 2.25) rider.dir = -1;
      if (rider.x < -2.25) rider.dir = 1;
      const y = coasterY(rider.x);
      car.position.set(rider.x, y + 0.16, 0);
      const pe = potential(m, heightAt(rider.x));
      const ke = Math.max(0, total - pe);
      const cap = Math.max(10, total);
      this.grow(bars[0], ke, cap);
      this.grow(bars[1], pe, cap);
      this.grow(bars[2], total, cap);
      if (read) read.textContent = `K + U = ${joule(total)}`;
    });
  }

  private buildGraph(state: ViewState) {
    const axis = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 1.7, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xf3eadc, roughness: 0.5 }),
    );
    axis.position.set(-1.15, 0.85, 0);
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.04, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xf3eadc, roughness: 0.5 }),
    );
    base.position.set(0.05, 0.04, 0);
    this.root.add(axis, base);
    const component = state.params.force * Math.cos((state.params.angle * Math.PI) / 180);
    const width = 1.9;
    const height = Math.max(0.05, Math.min(1.45, Math.abs(component) / 28));
    const area = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, 0.08),
      new THREE.MeshStandardMaterial({
        color: component >= 0 ? 0xe7a15a : 0xe07a62,
        transparent: true,
        opacity: 0.78,
        roughness: 0.45,
      }),
    );
    area.position.set(-1.13 + width / 2, height / 2 + 0.06, 0);
    this.root.add(area);
    this.tag(this.root, "F cosθ", -1.55, 1.7, 0);
    this.tag(this.root, "s", 1.35, 0.2, 0);
    const read = this.tag(this.root, "", 0.1, 1.85, 0);
    const full = workOf(state.params.force, state.params.span, state.params.angle);
    this.updaters.push((time) => {
      const u = 0.15 + 0.85 * sweep(time, 4);
      area.scale.x = u;
      area.position.x = -1.13 + (width * u) / 2;
      if (read) read.textContent = `W = ${joule(full * u)}`;
    });
  }

  private buildPower(state: ViewState) {
    const bn = state.lang === "bn";
    if (state.focus === "times") {
      [1, 2, 3].forEach((factor, index) => {
        const group = new THREE.Group();
        group.position.x = (index - 1) * 1.55;
        this.root.add(group);
        const box = this.block(0xc4a574);
        group.add(box);
        const board = new THREE.Group();
        board.position.set(0, 0, 0.8);
        group.add(board);
        const bars = this.columns(board, [{ name: factor === 1 ? "t" : `${factor}t`, color: index === 0 ? 0xe7a15a : index === 1 ? 0x8fd0ef : 0x9ddec0 }]);
        const work = workOf(state.params.force, state.params.span, 0);
        const power = powerOf(work, state.params.time * factor);
        this.updaters.push((time) => {
          const u = (time / (state.params.time * factor * 0.45)) % 1;
          box.position.x = -0.55 + u * 1.1;
          this.grow(bars[0], power, Math.max(8, powerOf(work, state.params.time)));
        });
      });
      return;
    }
    const box = this.block(0xd7c4a8);
    this.root.add(box);
    const board = new THREE.Group();
    board.position.set(1.7, 0, 0);
    this.root.add(board);
    const instant = state.focus === "instant";
    const bars = this.columns(board, instant
      ? [
          { name: bn ? "গড়" : "Avg", color: 0x8fd0ef },
          { name: bn ? "এখন" : "Now", color: 0xe7a15a },
        ]
      : [{ name: "P", color: 0xe7a15a }]);
    const read = this.tag(this.root, "", 0, 1.4, 0);
    this.updaters.push((time) => {
      const t = state.params.time;
      const u = (time % t) / t;
      if (instant) {
        const v = state.params.speed * u;
        const s = 0.5 * state.params.speed * (u * t);
        const avg = powerOf(workOf(state.params.force, s, 0), Math.max(0.05, u * t));
        const now = instantPower(state.params.force, v);
        box.position.x = -1.2 + u * 2.4;
        const cap = Math.max(10, instantPower(state.params.force, state.params.speed));
        this.grow(bars[0], avg, cap);
        this.grow(bars[1], now, cap);
        if (read) read.textContent = `P = ${now.toFixed(1)} W · P_avg = ${avg.toFixed(1)} W`;
        return;
      }
      const work = workOf(state.params.force, state.params.span * u, 0);
      const power = powerOf(workOf(state.params.force, state.params.span, 0), t);
      box.position.x = -1.2 + u * 2.4;
      this.grow(bars[0], power, Math.max(8, power));
      if (read) read.textContent = `P = ${power.toFixed(1)} W`;
    });
  }

  private buildMachine(state: ViewState) {
    const bn = state.lang === "bn";
    if (state.focus === "efficiency") {
      const input = workOf(state.params.force, state.params.span, 0);
      const eta = efficiencyOf(state.params.friction);
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.5, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x355e56, roughness: 0.5, metalness: 0.2 }),
      );
      box.position.y = 0.4;
      this.root.add(box);
      const board = new THREE.Group();
      board.position.set(1.5, 0, 0);
      this.root.add(board);
      const bars = this.columns(board, [
        { name: bn ? "কাজ" : "Useful", color: 0x3d8f7a },
        { name: bn ? "তাপ" : "Heat", color: 0xe07a62 },
      ]);
      const read = this.tag(this.root, "", -0.4, 1.35, 0);
      this.grow(bars[0], input * eta, Math.max(10, input));
      this.grow(bars[1], input * (1 - eta), Math.max(10, input));
      if (read) read.textContent = `η = ${(eta * 100).toFixed(0)}%`;
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 14, 10),
        new THREE.MeshStandardMaterial({ color: 0xe07a62, emissive: 0xe07a62, emissiveIntensity: (1 - eta) * 1.2, transparent: true, opacity: 0.8 }),
      );
      glow.position.set(0.55, 0.55, 0);
      glow.scale.setScalar(0.5 + (1 - eta));
      this.root.add(glow);
      return;
    }
    const names = bn ? ["মানুষ", "মোটর", "ক্রেন"] : ["Person", "Motor", "Crane"];
    const factors = [1, 0.5, 0.25];
    const colors = [0xc4a574, 0x8fd0ef, 0xe7a15a];
    const work = potential(state.params.mass, state.params.height);
    names.forEach((name, index) => {
      const group = new THREE.Group();
      group.position.x = (index - 1) * 1.6;
      this.root.add(group);
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 1.8, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x8d9a92, metalness: 0.4, roughness: 0.4 }),
      );
      post.position.y = 0.9;
      group.add(post);
      const load = this.block(colors[index]);
      group.add(load);
      const board = new THREE.Group();
      board.position.set(0, 0, 0.7);
      group.add(board);
      const bars = this.columns(board, [{ name, color: colors[index] }]);
      const power = powerOf(work, state.params.time * factors[index]);
      this.updaters.push((time) => {
        const u = (time / (state.params.time * factors[index] * 0.35)) % 1;
        load.position.y = 0.28 + u * state.params.height * 0.22;
        this.grow(bars[0], power, Math.max(20, powerOf(work, state.params.time * 0.25)));
      });
    });
  }

  private buildCrash(state: ViewState) {
    const bn = state.lang === "bn";
    const lanes = [
      { z: 0.7, elastic: true, name: bn ? "স্থিতিস্থাপক" : "Elastic" },
      { z: -0.7, elastic: false, name: bn ? "অস্থিতিস্থাপক" : "Inelastic" },
    ];
    const energy = collisionEnergy(state.params.mass, state.params.speed);
    for (const lane of lanes) {
      const left = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 20, 14),
        new THREE.MeshStandardMaterial({ color: 0xe07a62, roughness: 0.35 }),
      );
      const right = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 20, 14),
        new THREE.MeshStandardMaterial({ color: 0x8fd0ef, roughness: 0.35 }),
      );
      left.position.z = lane.z;
      right.position.z = lane.z;
      this.root.add(left, right);
      this.tag(this.root, lane.name, 0, lane.elastic ? 1.25 : -0.15, lane.z);
      this.updaters.push((time) => {
        const u = (time % 3.2) / 3.2;
        if (u < 0.42) {
          const t = u / 0.42;
          left.position.x = -1.5 + t * 1.3;
          right.position.x = 0.2;
        } else if (lane.elastic) {
          const t = (u - 0.42) / 0.58;
          left.position.x = -0.2;
          right.position.x = 0.2 + t * 1.4;
        } else {
          const t = (u - 0.42) / 0.58;
          const x = -0.05 + t * 0.9;
          left.position.x = x - 0.18;
          right.position.x = x + 0.18;
        }
      });
    }
    const board = new THREE.Group();
    board.position.set(2.05, 0, 0);
    this.root.add(board);
    const bars = this.columns(board, [
      { name: bn ? "আগে" : "Before", color: 0xe2a63b },
      { name: bn ? "স্থিতি" : "Elastic", color: 0x3d8f7a },
      { name: bn ? "অস্থিতি" : "Inelastic", color: 0xe07a62 },
    ]);
    this.grow(bars[0], energy.before, Math.max(8, energy.before));
    this.grow(bars[1], energy.elastic, Math.max(8, energy.before));
    this.grow(bars[2], energy.inelastic, Math.max(8, energy.before));
  }

  private buildOrbit(state: ViewState) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.25, 0.025, 12, 64),
      new THREE.MeshStandardMaterial({ color: 0x9ddec0, metalness: 0.3, roughness: 0.4 }),
    );
    ring.rotation.x = Math.PI / 2;
    this.root.add(ring);
    const hub = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xf3eadc }),
    );
    this.root.add(hub);
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 20, 14),
      new THREE.MeshStandardMaterial({ color: 0xe7a15a, roughness: 0.32, metalness: 0.25 }),
    );
    this.root.add(body);
    const pull = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1.05, 0, 0), 0.7, 0xe07a62, 0.14, 0.09);
    const velocity = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(1.25, 0.05, 0), 0.7, 0x8fd0ef, 0.14, 0.09);
    this.root.add(pull, velocity);
    const read = this.tag(this.root, "", 0, 1.55, 0);
    this.updaters.push((time) => {
      const omega = state.params.speed / TRACK_RADIUS;
      const theta = omega * time;
      const x = Math.cos(theta) * 1.25;
      const z = Math.sin(theta) * 1.25;
      body.position.set(x, 0, z);
      const inward = new THREE.Vector3(-x, 0, -z).normalize();
      const tangent = new THREE.Vector3(-Math.sin(theta), 0, Math.cos(theta));
      pull.position.set(x, 0, z);
      pull.setDirection(inward);
      velocity.position.set(x, 0.05, z);
      velocity.setDirection(tangent);
      const force = circularForce(state.params.mass, state.params.speed);
      if (read) read.textContent = `W = 0 · F = ${force.toFixed(1)} N · K = ${joule(kinetic(state.params.mass, state.params.speed))}`;
    });
  }

  private block(color: number) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.36, 0.36),
      new THREE.MeshStandardMaterial({ color, roughness: 0.48, metalness: 0.12 }),
    );
    mesh.position.y = 0.18;
    return mesh;
  }

  private columns(parent: any, specs: { name: string; color: number }[]) {
    return specs.map((spec, index) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 1, 0.16),
        new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.42 }),
      );
      mesh.position.x = (index - (specs.length - 1) / 2) * 0.34;
      mesh.scale.y = 0.04;
      mesh.position.y = 0.02;
      parent.add(mesh);
      this.tag(parent, spec.name, mesh.position.x, 1.2, 0);
      return mesh;
    });
  }

  private grow(mesh: any, value: number, cap: number) {
    const h = Math.max(0.04, Math.min(1.45, Math.abs(value) / Math.max(cap, 1e-6)));
    mesh.scale.y = h;
    mesh.position.y = h / 2;
  }

  private coil(x0: number) {
    const rings: any[] = [];
    const geo = new THREE.TorusGeometry(0.16, 0.028, 8, 18);
    const mat = new THREE.MeshStandardMaterial({ color: 0xd7c4a8, metalness: 0.55, roughness: 0.3 });
    for (let index = 0; index < 8; index += 1) {
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.y = Math.PI / 2;
      ring.position.set(x0 + index * 0.12, 0.28, 0);
      this.root.add(ring);
      rings.push(ring);
    }
    return rings;
  }

  private setCoil(rings: any[], x0: number, x1: number) {
    const span = Math.max(0.2, x1 - x0);
    rings.forEach((ring, index) => {
      ring.position.x = x0 + (span * index) / Math.max(1, rings.length - 1);
    });
  }

  private tag(parent: any, text: string, x: number, y: number, z: number) {
    const el = document.createElement("span");
    el.className = "float-tag";
    el.textContent = text;
    const obj = new CSS2DObject(el);
    obj.position.set(x, y, z);
    parent.add(obj);
    return el;
  }
}
