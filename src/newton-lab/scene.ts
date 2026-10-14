import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import type { Family } from "./catalog";
import { collide, contactForce, G, linked, plane, projectile, systemAccel, whirl, type Params } from "./physics";

export type ViewState = {
  family: Family;
  focus: string;
  params: Params;
  playing: boolean;
  speed: number;
  lang: "bn" | "en";
};

const CAM: Record<Family, { pos: [number, number, number]; target: [number, number, number] }> = {
  laws: { pos: [0.4, 1.8, 5.2], target: [0, 0.5, 0] },
  friction: { pos: [0.6, 1.8, 4.6], target: [0, 0.6, 0] },
  crash: { pos: [0.2, 1.6, 5.4], target: [0, 0.45, 0] },
  circle: { pos: [1.6, 2.4, 3.2], target: [0, 0.4, 0] },
  shot: { pos: [0.2, 1.8, 5.2], target: [0.4, 0.7, 0] },
  link: { pos: [0.3, 1.7, 5.4], target: [0.2, 0.55, 0] },
};

export class NewtonWorld {
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
  private rate = 1;
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
    renderer.domElement.setAttribute("aria-label", "নিউটনীয় বলবিদ্যার ত্রিমাত্র দৃশ্য");
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
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 14;
    this.controls.target.set(0, 0.5, 0);
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
    this.rate = state.speed;
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
    if (this.playing) this.time += dt * this.rate;
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
    const key = JSON.stringify({ family: this.state.family, focus: this.state.focus, params: this.state.params, lang: this.state.lang });
    if (key === this.key) return;
    this.key = key;
    this.clearRoot();
    this.updaters = [];
    const table: Record<Family, () => void> = {
      laws: () => this.laws(this.state!),
      friction: () => this.friction(this.state!),
      crash: () => this.crash(this.state!),
      circle: () => this.circle(this.state!),
      shot: () => this.shot(this.state!),
      link: () => this.link(this.state!),
    };
    table[this.state.family]();
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

  private box(w: number, h: number, d: number, color: number) {
    return this.add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this.std(color)));
  }

  private laws(state: ViewState) {
    const p = state.params;
    const bn = state.lang === "bn";
    const deck = this.box(4.6, 0.08, 1.1, 0x2c4a44);
    deck.position.y = 0.2;
    const w1 = 0.42 + 0.12 * Math.cbrt(p.mass1 / 2);
    const w2 = 0.42 + 0.12 * Math.cbrt(p.mass2 / 2);
    const a = this.box(w1, 0.36, 0.5, 0x3d7ea6);
    const b = this.box(w2, 0.36, 0.5, 0xc46a4a);
    const push = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 0.2, 0xf2d48a, 0.14, 0.07);
    const left = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(), 0.2, 0x8fd0ef, 0.12, 0.06);
    const right = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 0.2, 0x8fd0ef, 0.12, 0.06);
    this.add(push);
    this.add(left);
    this.add(right);
    const note = this.tag("", 0, 1.15, 0);
    const accel = systemAccel(p);
    const contact = contactForce(p);
    const len = Math.max(0.05, Math.min(1.15, p.force / 18));
    const pair = Math.max(0.05, Math.min(0.85, contact / 12));
    this.updaters.push((time) => {
      const travel = p.speed * 0.22 * time + 0.5 * accel * 0.08 * time * time;
      const span = 3.2;
      const x = ((travel % span) + span) % span - 1.7;
      a.position.set(x, 0.42, 0);
      b.position.set(x + w1 / 2 + w2 / 2, 0.42, 0);
      push.position.set(a.position.x - w1 / 2 - 0.02, 0.48, 0);
      push.setLength(p.force > 0 ? len : 0.001, 0.12, 0.06);
      const mid = (a.position.x + b.position.x) / 2;
      left.position.set(mid - 0.02, 0.62, 0);
      right.position.set(mid + 0.02, 0.62, 0);
      left.setLength(contact > 0.05 ? pair : 0.001, 0.1, 0.05);
      right.setLength(contact > 0.05 ? pair : 0.001, 0.1, 0.05);
      note.el.textContent =
        p.force === 0 && p.speed === 0
          ? bn
            ? "নিট বল শূন্য · স্থির"
            : "No net force · at rest"
          : p.force === 0
            ? bn
              ? "নিট বল শূন্য · সমবেগ"
              : "No net force · constant speed"
            : bn
              ? "F = ma · মাঝের বল সমান"
              : "F = ma · the middle forces match";
    });
  }

  private friction(state: ViewState) {
    const p = state.params;
    const bn = state.lang === "bn";
    const face = plane(p);
    const rad = (p.incline * Math.PI) / 180;
    const rig = new THREE.Group();
    const deck = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 1), this.std(0x3d564c));
    deck.position.x = 1.3;
    rig.add(deck);
    rig.rotation.z = rad;
    rig.position.set(-1.3, 0.32, 0);
    this.root.add(rig);
    const block = this.box(0.36, 0.28, 0.4, 0xc46a4a);
    const weight = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(), 0.55, 0xf6f1e6, 0.12, 0.06);
    const normal = new THREE.ArrowHelper(new THREE.Vector3(-Math.sin(rad), Math.cos(rad), 0), new THREE.Vector3(), 0.45, 0x8fd0ef, 0.12, 0.06);
    const along = new THREE.Vector3(Math.cos(rad), Math.sin(rad), 0);
    const friction = new THREE.ArrowHelper(along.clone(), new THREE.Vector3(), 0.4, 0xe7a15a, 0.12, 0.06);
    const push = new THREE.ArrowHelper(along.clone(), new THREE.Vector3(), 0.4, 0xf2d48a, 0.12, 0.06);
    this.add(weight);
    this.add(normal);
    this.add(friction);
    this.add(push);
    const note = this.tag("", 0, 1.7, 0);
    const nLen = 0.25 + Math.min(0.7, face.normal / 30);
    const fLen = 0.12 + Math.min(0.7, face.friction / 20);
    this.updaters.push((time) => {
      const dir = face.sliding ? (face.down ? -1 : 1) : 0;
      const slide = dir === 0 ? 1.15 : 0.45 + ((dir * face.accel * 0.15 * time) % 1.7 + 1.7) % 1.7;
      const x = -1.3 + Math.cos(rad) * slide;
      const y = 0.36 + Math.sin(rad) * slide;
      block.position.set(x, y + 0.16, 0);
      block.rotation.z = rad;
      const origin = new THREE.Vector3(x, y + 0.34, 0);
      weight.position.copy(origin);
      normal.position.copy(origin);
      normal.setDirection(new THREE.Vector3(-Math.sin(rad), Math.cos(rad), 0));
      normal.setLength(nLen, 0.1, 0.05);
      const upHill = face.down || !face.sliding;
      const fDir = upHill ? along : along.clone().multiplyScalar(-1);
      friction.position.copy(origin);
      friction.setDirection(fDir);
      friction.setLength(face.friction > 0.05 ? fLen : 0.001, 0.1, 0.05);
      push.position.set(x, y + 0.2, 0.28);
      push.setDirection(along);
      push.setLength(p.force > 0 ? Math.min(0.9, 0.15 + p.force / 24) : 0.001, 0.1, 0.05);
      note.el.textContent = face.sliding
        ? face.down
          ? bn
            ? "গতীয় ঘর্ষণ · নিচে নামছে"
            : "Kinetic friction · sliding down"
          : bn
            ? "গতীয় ঘর্ষণ · উপরে উঠছে"
            : "Kinetic friction · sliding up"
        : bn
          ? "স্থিতি ঘর্ষণ · আটকে আছে"
          : "Static friction · holding still";
    });
  }

  private crash(state: ViewState) {
    const p = state.params;
    const bn = state.lang === "bn";
    const deck = this.box(4.8, 0.08, 1, 0x2c4a44);
    deck.position.y = 0.16;
    const hit = collide(p);
    const w1 = 0.36 + 0.08 * Math.cbrt(p.mass1);
    const w2 = 0.36 + 0.08 * Math.cbrt(p.mass2);
    const a = this.box(w1, 0.32, 0.46, 0x3d7ea6);
    const b = this.box(w2, 0.32, 0.46, 0xc46a4a);
    const impulse = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(), 0.3, 0xf2d48a, 0.12, 0.06);
    this.add(impulse);
    const note = this.tag(p.restitution >= 0.99 ? (bn ? "স্থিতিস্থাপক" : "Elastic") : p.restitution <= 0.01 ? (bn ? "অস্থিতিস্থাপক" : "Inelastic") : bn ? "আংশিক স্থিতিস্থাপক" : "Partly elastic", 0, 1.2, 0);
    const S = 0.18;
    const x10 = -1.35;
    const x20 = 0.45;
    const rel = (p.speed - p.speed2) * S;
    const gap = x20 - w2 / 2 - (x10 + w1 / 2);
    const tHit = rel > 0.02 ? gap / rel : 99;
    this.updaters.push((time) => {
      const t = time % 5.5;
      let x1: number;
      let x2: number;
      if (t < tHit) {
        x1 = x10 + p.speed * S * t;
        x2 = x20 + p.speed2 * S * t;
      } else {
        const x1c = x10 + p.speed * S * tHit;
        const x2c = x20 + p.speed2 * S * tHit;
        x1 = x1c + hit.v1 * S * (t - tHit);
        x2 = x2c + hit.v2 * S * (t - tHit);
      }
      a.position.set(x1, 0.38, 0);
      b.position.set(x2, 0.38, 0);
      const bang = t >= tHit && t < tHit + 0.35;
      impulse.position.set(x1 + w1 / 2, 0.62, 0);
      impulse.setDirection(new THREE.Vector3(hit.impulse >= 0 ? 1 : -1, 0, 0));
      impulse.setLength(bang ? Math.min(1.1, 0.2 + Math.abs(hit.hit) / 80) : 0.001, 0.1, 0.05);
      note.obj.position.y = 1.15;
    });
  }

  private circle(state: ViewState) {
    const p = state.params;
    const bn = state.lang === "bn";
    const spin = whirl(p);
    const radius = 0.55 + p.radius * 0.55;
    const post = this.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.35, 12), this.std(0xb7c2cc)));
    post.position.y = 0.2;
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0.42, Math.sin(a) * radius));
    }
    this.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x8fd0ef })));
    const mass = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.1 + p.mass * 0.04, 16, 12), this.std(0xc46a4a)));
    const string = this.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(1, 0, 0)]), new THREE.LineBasicMaterial({ color: 0xf6f1e6 })));
    const pull = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(), 0.4, 0xf2d48a, 0.12, 0.06);
    const vel = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), 0.4, 0x8fd0ef, 0.12, 0.06);
    this.add(pull);
    this.add(vel);
    this.tag(bn ? "টান কেন্দ্রমুখী" : "The pull is centripetal", 0, 1.35, 0);
    const pullLen = Math.min(radius * 0.85, 0.2 + spin.pull / 8);
    const velLen = Math.min(0.9, 0.18 + p.speed / 8);
    this.updaters.push((time) => {
      const angle = time * spin.omega * 0.65;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      mass.position.set(x, 0.42, z);
      string.geometry.setFromPoints([new THREE.Vector3(0, 0.42, 0), mass.position]);
      pull.position.copy(mass.position);
      pull.setDirection(new THREE.Vector3(-x, 0, -z).normalize());
      pull.setLength(pullLen, 0.1, 0.05);
      vel.position.copy(mass.position);
      vel.setDirection(new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle)));
      vel.setLength(velLen, 0.1, 0.05);
    });
  }

  private shot(state: ViewState) {
    const p = state.params;
    const bn = state.lang === "bn";
    const ball = projectile(p);
    const ground = this.box(4.4, 0.06, 1.2, 0x2c4a44);
    ground.position.set(0.6, 0.12, 0);
    const scale = 2.8 / Math.max(ball.range, ball.height, 1);
    const pts = [];
    const steps = 48;
    for (let i = 0; i <= steps; i++) {
      const t = (ball.flight * i) / steps;
      const x = ball.vx * t;
      const y = ball.vy * t - 0.5 * G * t * t;
      pts.push(new THREE.Vector3(-1.4 + x * scale, 0.2 + Math.max(0, y) * scale, 0));
    }
    this.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x8fd0ef })));
    const dot = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 12), this.std(0xf2d48a, { emissive: 0x8a6a22, emissiveIntensity: 0.3 })));
    const vx = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 0.35, 0x8fd0ef, 0.1, 0.05);
    const vy = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 0.35, 0xf2d48a, 0.1, 0.05);
    this.add(vx);
    this.add(vy);
    this.tag(bn ? "নীল vx স্থির · হলুদ vy বদলায়" : "Blue vx stays · gold vy changes", 0.2, 1.85, 0);
    const vxLen = Math.min(0.8, 0.15 + Math.abs(ball.vx) / 30);
    this.updaters.push((time) => {
      const t = time % (ball.flight + 0.4);
      const live = Math.min(t, ball.flight);
      const x = ball.vx * live;
      const y = Math.max(0, ball.vy * live - 0.5 * G * live * live);
      const at = new THREE.Vector3(-1.4 + x * scale, 0.28 + y * scale, 0);
      dot.position.copy(at);
      const vyNow = ball.vy - G * live;
      vx.position.copy(at);
      vx.setLength(vxLen, 0.08, 0.04);
      vy.position.copy(at);
      vy.setDirection(new THREE.Vector3(0, vyNow >= 0 ? 1 : -1, 0));
      vy.setLength(Math.min(0.85, 0.08 + Math.abs(vyNow) / 24), 0.08, 0.04);
    });
  }

  private link(state: ViewState) {
    const p = state.params;
    const bn = state.lang === "bn";
    const job = linked(p);
    const deck = this.box(2.4, 0.08, 0.9, 0x2c4a44);
    deck.position.set(-0.7, 0.2, 0);
    const rise = Math.min(1.15, job.climb * 0.9);
    const hill = this.box(1.3, 0.08, 0.9, 0x3d564c);
    hill.position.set(1.15, 0.2 + rise / 2, 0);
    hill.rotation.z = Math.atan2(rise, 1.2);
    const block = this.box(0.32, 0.26, 0.4, 0xc46a4a);
    const push = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), Math.min(0.9, 0.12 + p.force / 22), 0xf2d48a, 0.1, 0.05);
    const drag = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(), Math.min(0.7, 0.08 + p.drag / 18), 0xe7a15a, 0.1, 0.05);
    this.add(push);
    this.add(drag);
    const kBar = this.box(0.16, 0.2, 0.16, 0x8fd0ef);
    const uBar = this.box(0.16, 0.2, 0.16, 0xf2d48a);
    kBar.position.z = 0.7;
    uBar.position.z = 0.7;
    this.tag(bn ? "K" : "K", -0.2, 0.15, 0.7);
    this.tag(bn ? "U" : "U", 0.35, 0.15, 0.7);
    const coils = Array.from({ length: 8 }, () => this.add(new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), this.std(0xb7c2cc))));
    this.tag(bn ? "স্প্রিং · বল পথে বাড়ে" : "Spring · the force grows along the path", 0.2, 1.55, 0);
    const note = this.tag("", -0.4, 1.05, 0);
    this.updaters.push((time) => {
      const cycle = time % 4.5;
      const moving = job.speed > 0;
      const flat = Math.min(1, cycle / 2.2);
      const up = moving ? Math.max(0, Math.min(1, (cycle - 2.2) / 1.6)) : 0;
      const x = -1.7 + flat * 1.7 + up * 1.15;
      const y = 0.4 + up * rise;
      block.position.set(x, y, 0);
      push.position.set(x - 0.24, y, 0.2);
      drag.position.set(x + 0.24, y, 0.2);
      const k = moving ? (up > 0 ? 1 - up : flat) : 0;
      const u = moving ? up : 0;
      kBar.scale.y = 0.15 + k * 1.4;
      uBar.scale.y = 0.15 + u * 1.4;
      kBar.position.set(-0.15, 0.28 + kBar.scale.y * 0.1, 0.7);
      uBar.position.set(0.35, 0.28 + uBar.scale.y * 0.1, 0.7);
      const stretch = 0.35 + (p.span / 4) * (0.35 + 0.65 * Math.min(1, cycle / 2.2));
      coils.forEach((coil: any, i: number) => {
        coil.position.set(-0.2 + (i / 7) * stretch, 1.15, -0.55);
      });
      note.el.textContent = moving ? (bn ? "নিট কাজ → গতিশক্তি → বিভব" : "Net work → kinetic → potential") : bn ? "বল ঘর্ষণ ছাড়াচ্ছে না" : "The force does not beat friction";
    });
  }
}
