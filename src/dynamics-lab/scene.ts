import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import type { Family } from "./catalog";
import { G, ride, shot, trip, vertical, type Params } from "./physics";

export type ViewState = {
  family: Family;
  focus: string;
  params: Params;
  playing: boolean;
  speed: number;
  lang: "bn" | "en";
};

const CAM: Record<Family, { pos: [number, number, number]; target: [number, number, number] }> = {
  path: { pos: [1.2, 3.4, 3.6], target: [0.4, 0, 0.4] },
  equations: { pos: [0.4, 1.7, 5], target: [0, 0.4, 0] },
  graphs: { pos: [0.2, 1.8, 5.6], target: [0, 0.7, 0] },
  vertical: { pos: [1.4, 1.6, 4.2], target: [0, 0.9, 0] },
  shot: { pos: [0.3, 1.8, 5.2], target: [0.3, 0.7, 0] },
};

export class DynamicsWorld {
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
    renderer.domElement.setAttribute("aria-label", "গতিবিদ্যার ত্রিমাত্র দৃশ্য");
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
      path: () => this.path(this.state!),
      equations: () => this.equations(this.state!),
      graphs: () => this.graphs(this.state!),
      vertical: () => this.drop(this.state!),
      shot: () => this.projectile(this.state!),
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
    return new THREE.MeshStandardMaterial({ color, roughness: 0.48, metalness: 0.06, ...extra });
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
    return this.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity })));
  }

  private path(state: ViewState) {
    const p = state.params;
    const bn = state.lang === "bn";
    const leg = trip(p);
    const scale = 2.3 / Math.max(p.east, p.north, 8);
    const ex = p.east * scale;
    const nz = p.north * scale;
    if (ex > 0.02) {
      const road = this.add(new THREE.Mesh(new THREE.BoxGeometry(ex, 0.04, 0.28), this.std(0x3d564c)));
      road.position.set(ex / 2, 0.08, 0);
    }
    if (nz > 0.02) {
      const road = this.add(new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, nz), this.std(0x3d564c)));
      road.position.set(ex, 0.08, nz / 2);
    }
    const car = this.add(new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.18), this.std(0xc46a4a)));
    const shift = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0.2, 0), 0.3, 0xf2d48a, 0.12, 0.06);
    const vel = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 0.45, 0x8fd0ef, 0.12, 0.06);
    this.add(shift);
    this.add(vel);
    this.tag(bn ? "শুরু" : "Start", 0, 0.35, -0.35);
    const note = this.tag("", ex * 0.4, 1.15, nz * 0.3);
    const duration = Math.max(leg.duration, 0.8);
    this.updaters.push((time) => {
      const gone = ((time % (duration + 0.4)) / duration) * leg.distance;
      const along = Math.min(Math.max(gone, 0), leg.distance);
      const onEast = along <= p.east;
      const x = (onEast ? along : p.east) * scale;
      const z = (onEast ? 0 : along - p.east) * scale;
      car.position.set(x, 0.22, z);
      const dir = onEast ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
      vel.position.set(x, 0.42, z);
      vel.setDirection(p.north === 0 && p.east === 0 ? new THREE.Vector3(1, 0, 0) : dir);
      vel.setLength(0.25 + p.pace / 20, 0.1, 0.05);
      const reach = new THREE.Vector3(x, 0, z);
      const len = reach.length();
      shift.setDirection(len > 0.02 ? reach.clone().normalize() : new THREE.Vector3(1, 0, 0));
      shift.setLength(Math.max(len, 0.001), 0.1, 0.05);
      note.el.textContent = onEast ? (bn ? "তাৎক্ষণিক বেগ পূর্বে" : "Instantaneous velocity east") : bn ? "তাৎক্ষণিক বেগ উত্তরে" : "Instantaneous velocity north";
    });
  }

  private equations(state: ViewState) {
    const p = state.params;
    const bn = state.lang === "bn";
    const end = ride(p);
    const deck = this.add(new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.06, 0.9), this.std(0x2c4a44)));
    deck.position.y = 0.12;
    const car = this.add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.28), this.std(0x3d7ea6)));
    const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 0.4, 0xf2d48a, 0.12, 0.06);
    this.add(arrow);
    const note = this.tag(p.jerk === 0 ? (bn ? "সুষম ত্বরণ" : "Uniform acceleration") : bn ? "অসমত্বরণ" : "Changing acceleration", 0, 1.2, 0);
    const span = Math.max(Math.abs(end.s), 1);
    this.updaters.push((time) => {
      const tau = (time % (p.time + 0.35)) ;
      const live = Math.min(tau, p.time);
      const now = ride(p, live);
      const x = (now.s / span) * 1.7;
      car.position.set(x, 0.28, 0);
      arrow.position.set(x, 0.55, 0);
      arrow.setDirection(new THREE.Vector3(now.v >= 0 ? 1 : -1, 0, 0));
      arrow.setLength(Math.min(1.1, 0.12 + Math.abs(now.v) / 18), 0.1, 0.05);
      note.obj.position.set(x, 0.95, 0);
    });
  }

  private graphs(state: ViewState) {
    const p = state.params;
    const bn = state.lang === "bn";
    const boards = [
      { x: -1.7, title: "s–t", color: 0xf2d48a, value: (t: number) => ride(p, t).s },
      { x: 0, title: "v–t", color: 0x8fd0ef, value: (t: number) => ride(p, t).v },
      { x: 1.7, title: "a–t", color: 0xe7a15a, value: (t: number) => ride(p, t).aNow },
    ];
    const width = 1.25;
    const height = 1.05;
    const cursors: any[] = [];
    for (const board of boards) {
      const samples = Array.from({ length: 40 }, (_, i) => board.value((p.time * i) / 39));
      const min = Math.min(0, ...samples);
      const max = Math.max(0.2, ...samples);
      const sy = height / (max - min || 1);
      const sx = width / Math.max(p.time, 0.2);
      const y0 = (y: number) => 0.25 + (y - min) * sy;
      const pts = samples.map((y, i) => new THREE.Vector3(board.x - width / 2 + (i / 39) * width, y0(y), 0));
      this.line(pts, board.color);
      this.line(
        [new THREE.Vector3(board.x - width / 2, 0.22, 0), new THREE.Vector3(board.x + width / 2, 0.22, 0)],
        0xf6f1e6,
        0.35,
      );
      const area = this.line(
        [new THREE.Vector3(), new THREE.Vector3(0, 0.1, 0)],
        board.color,
        0.45,
      );
      const cursor = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), this.std(board.color, { emissive: board.color, emissiveIntensity: 0.35 })));
      this.tag(board.title, board.x, 1.5, 0);
      cursors.push({ cursor, area, sx, y0, x: board.x, value: board.value, width });
    }
    const note = this.tag(bn ? "কার্সার চলন্ত মুহূর্ত" : "The cursor is the moving moment", 0, 1.85, 0);
    void note;
    this.updaters.push((time) => {
      const tau = time % (p.time + 0.3);
      const live = Math.min(tau, p.time);
      for (const item of cursors) {
        const y = item.value(live);
        const x = item.x - item.width / 2 + live * item.sx;
        item.cursor.position.set(x, item.y0(y), 0.02);
        const steps = 16;
        const pts = [new THREE.Vector3(item.x - item.width / 2, 0.25, -0.01)];
        for (let i = 0; i <= steps; i++) {
          const t = (live * i) / steps;
          pts.push(new THREE.Vector3(item.x - item.width / 2 + t * item.sx, item.y0(item.value(t)), -0.01));
        }
        pts.push(new THREE.Vector3(x, 0.25, -0.01));
        item.area.geometry.dispose();
        item.area.geometry = new THREE.BufferGeometry().setFromPoints(pts);
      }
    });
  }

  private drop(state: ViewState) {
    const p = state.params;
    const bn = state.lang === "bn";
    const fall = vertical(p);
    const scale = 1.7 / Math.max(fall.top, 2);
    const tower = this.add(new THREE.Mesh(new THREE.BoxGeometry(0.12, Math.max(p.height * scale, 0.04), 0.12), this.std(0x8d6a43, { roughness: 0.7 })));
    tower.position.y = (p.height * scale) / 2;
    const ground = this.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 1), this.std(0x2c4a44)));
    ground.position.y = 0.03;
    const ball = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), this.std(0xf2d48a, { emissive: 0x8a6a22, emissiveIntensity: 0.25 })));
    const gee = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0.45, 1.2, 0), 0.55, 0xe7a15a, 0.12, 0.06);
    const vel = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 0.3, 0x8fd0ef, 0.1, 0.05);
    this.add(gee);
    this.add(vel);
    const note = this.tag("", 0, fall.top * scale + 0.45, 0);
    this.updaters.push((time) => {
      const t = time % (fall.flight + 0.45);
      const live = Math.min(t, fall.flight);
      const y = Math.max(0, p.height + p.u * live - 0.5 * G * live * live);
      const v = p.u - G * live;
      ball.position.set(0, 0.12 + y * scale, 0);
      vel.position.set(0.18, ball.position.y, 0);
      vel.setDirection(new THREE.Vector3(0, v >= 0 ? 1 : -1, 0));
      vel.setLength(Math.min(0.8, 0.06 + Math.abs(v) / 22), 0.08, 0.04);
      const atTop = p.u > 0 && Math.abs(live - fall.hang) < 0.12;
      note.el.textContent = atTop ? (bn ? "শীর্ষ · বেগ ০, ত্বরণ g" : "Top · speed 0, acceleration g") : bn ? "ত্বরণ সব সময় নিচে" : "Acceleration stays downward";
    });
  }

  private projectile(state: ViewState) {
    const p = state.params;
    const bn = state.lang === "bn";
    const ball = shot(p);
    const ghost = shot({ ...p, shot: 45 });
    const ground = this.add(new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.06, 1.1), this.std(0x2c4a44)));
    ground.position.set(0.5, 0.1, 0);
    const scale = 2.7 / Math.max(ball.range, ghost.range, ball.height, 1);
    const curve = (item: { vx: number; vy: number; flight: number }, z: number) => {
      const pts = [];
      for (let i = 0; i <= 40; i++) {
        const t = (item.flight * i) / 40;
        const x = item.vx * t;
        const y = item.vy * t - 0.5 * G * t * t;
        pts.push(new THREE.Vector3(-1.5 + x * scale, 0.18 + Math.max(0, y) * scale, z));
      }
      return pts;
    };
    this.line(curve(ghost, -0.15), 0xf6f1e6, 0.35);
    this.line(curve(ball, 0), 0x8fd0ef);
    const dot = this.add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 12), this.std(0xf2d48a, { emissive: 0x8a6a22, emissiveIntensity: 0.3 })));
    const vx = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 0.35, 0x8fd0ef, 0.08, 0.04);
    const vy = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 0.35, 0xf2d48a, 0.08, 0.04);
    this.add(vx);
    this.add(vy);
    this.tag(bn ? "ফিকে রেখা ৪৫°" : "The faint curve is 45°", 0.4, 1.9, 0);
    this.updaters.push((time) => {
      const t = time % (ball.flight + 0.35);
      const live = Math.min(t, ball.flight);
      const x = ball.vx * live;
      const y = Math.max(0, ball.vy * live - 0.5 * G * live * live);
      const at = new THREE.Vector3(-1.5 + x * scale, 0.24 + y * scale, 0);
      dot.position.copy(at);
      const vyNow = ball.vy - G * live;
      vx.position.copy(at);
      vx.setLength(Math.min(0.75, 0.12 + Math.abs(ball.vx) / 32), 0.08, 0.04);
      vy.position.copy(at);
      vy.setDirection(new THREE.Vector3(0, vyNow >= 0 ? 1 : -1, 0));
      vy.setLength(Math.min(0.8, 0.06 + Math.abs(vyNow) / 24), 0.08, 0.04);
    });
  }
}
