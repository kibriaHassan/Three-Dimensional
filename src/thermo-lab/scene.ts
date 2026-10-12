import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import type { Family } from "./catalog";
import {
  GAMMA,
  carnotState,
  carnotVolumes,
  compareCurves,
  efficiency,
  expansion,
  pressureOf,
  processState,
  rmsSpeed,
  type Params,
  type Process,
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
  box: { pos: [1.8, 1.55, 3.7], target: [0, 0.35, 0] },
  rod: { pos: [0.2, 1.15, 4.2], target: [0, 0.15, 0] },
  piston: { pos: [2.35, 1.7, 3.7], target: [0.15, 0.85, 0] },
  compare: { pos: [0.1, 1.9, 5.4], target: [0, 0.75, 0] },
  engine: { pos: [2.5, 1.85, 4.5], target: [0.25, 0.75, 0] },
  graph: { pos: [0.15, 1.55, 4.7], target: [0, 0.75, 0] },
  flow: { pos: [0.05, 1.45, 4.9], target: [0, 0.35, 0] },
  bars: { pos: [0.05, 1.7, 5.5], target: [0, 0.45, 0] },
};

type Speck = {
  mesh: any;
  mat: any;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  bias: number;
};

function copyOf(lang: "bn" | "en") {
  const bn = lang === "bn";
  return {
    hot: bn ? "তাপ উৎস" : "Hot source",
    cold: bn ? "তাপ গ্রাহক" : "Cold sink",
    work: bn ? "কাজ" : "Work",
    heat: bn ? "তাপ" : "Heat",
    gas: bn ? "গ্যাস" : "Gas",
    piston: bn ? "পিস্টন" : "Piston",
    iso: bn ? "সমতাপ" : "Isothermal",
    adi: bn ? "রুদ্ধতাপীয়" : "Adiabatic",
    bar: bn ? "সমচাপ" : "Isobaric",
    chor: bn ? "সমআয়তন" : "Isochoric",
    reversible: bn ? "প্রত্যাবর্তী" : "Reversible",
    irreversible: bn ? "অপ্রত্যাবর্তী" : "Irreversible",
    impossible: bn ? "অসম্ভব" : "Impossible",
    room: bn ? "গরম ঘর" : "Warm room",
    outside: bn ? "ঠান্ডা বাইরে" : "Cold outside",
    area: bn ? "ক্ষেত্রফল = কাজ" : "Area = work",
    steeper: bn ? "রুদ্ধতাপীয় বেশি খাড়া" : "Adiabat is steeper",
    pressure: "P",
    volume: "V",
  };
}

function paceOf(temp: number) {
  return 1.35 * Math.sqrt(Math.max(temp, 1) / 300);
}

function paint(mat: any, temp: number) {
  const u = Math.min(1, Math.max(0, (temp - 250) / 500));
  mat.color.setRGB(0.25 + u * 0.7, 0.5 - u * 0.28, 0.92 - u * 0.75);
  if (mat.emissive) {
    mat.emissive.setRGB(0.15 + u * 0.4, 0.05, 0.04);
    mat.emissiveIntensity = 0.25 + u * 0.45;
  }
}

function steer(speck: Speck, dt: number, pace: number) {
  const speed = Math.hypot(speck.vx, speck.vy, speck.vz) || 1;
  const scale = (pace * speck.bias) / speed;
  speck.vx *= scale;
  speck.vy *= scale;
  speck.vz *= scale;
  speck.x += speck.vx * dt;
  speck.y += speck.vy * dt;
  speck.z += speck.vz * dt;
}

function bounceBox(speck: Speck, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) {
  if (speck.x < x0) {
    speck.x = x0;
    speck.vx = Math.abs(speck.vx);
  } else if (speck.x > x1) {
    speck.x = x1;
    speck.vx = -Math.abs(speck.vx);
  }
  if (speck.y < y0) {
    speck.y = y0;
    speck.vy = Math.abs(speck.vy);
  } else if (speck.y > y1) {
    speck.y = y1;
    speck.vy = -Math.abs(speck.vy);
  }
  if (speck.z < z0) {
    speck.z = z0;
    speck.vz = Math.abs(speck.vz);
  } else if (speck.z > z1) {
    speck.z = z1;
    speck.vz = -Math.abs(speck.vz);
  }
  speck.mesh.position.set(speck.x, speck.y, speck.z);
}

function bounceTube(speck: Speck, radius: number, y0: number, y1: number) {
  const radial = Math.hypot(speck.x, speck.z) || 1;
  if (radial > radius) {
    const nx = speck.x / radial;
    const nz = speck.z / radial;
    const outward = speck.vx * nx + speck.vz * nz;
    if (outward > 0) {
      speck.vx -= 2 * outward * nx;
      speck.vz -= 2 * outward * nz;
    }
    speck.x = nx * radius;
    speck.z = nz * radius;
  }
  if (speck.y < y0) {
    speck.y = y0;
    speck.vy = Math.abs(speck.vy);
  } else if (speck.y > y1) {
    speck.y = y1;
    speck.vy = -Math.abs(speck.vy);
  }
  speck.mesh.position.set(speck.x, speck.y, speck.z);
}

function sweep(time: number, seconds = 8) {
  const turn = (time % (seconds * 2)) / seconds;
  return turn <= 1 ? turn : 2 - turn;
}

function looped(time: number, seconds = 10) {
  return (time % seconds) / seconds;
}

function liftOf(volume: number, low: number, high: number) {
  const u = (volume - low) / Math.max(1e-6, high - low);
  return 0.38 + Math.min(1, Math.max(0, u)) * 1.55;
}

function processFor(focus: string): Process {
  if (focus === "adiabatic" || focus === "internal") return "adiabatic";
  if (focus === "isochoric") return "isochoric";
  if (focus === "isothermal" || focus === "work") return "isothermal";
  return "isobaric";
}

export class ThermoWorld {
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
    renderer.domElement.setAttribute("aria-label", "তাপগতিবিদ্যার ত্রিমাত্র দৃশ্য");
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
    this.controls.target.set(0, 0.4, 0);
    this.controls.update();

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.72));
    this.scene.add(new THREE.HemisphereLight(0xf4efe4, 0x1a2822, 0.45));
    const sun = new THREE.DirectionalLight(0xffffff, 1.15);
    sun.position.set(4, 7, 5);
    this.scene.add(sun);

    const grid = new THREE.GridHelper(10, 20, 0x3d564c, 0x24362f);
    const mats = Array.isArray(grid.material) ? grid.material : [grid.material];
    for (const mat of mats) {
      mat.transparent = true;
      mat.opacity = 0.38;
    }
    grid.position.y = -1.35;
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
    if (state.family === "box") this.buildBox(state);
    else if (state.family === "rod") this.buildRod(state);
    else if (state.family === "piston") this.buildPiston(state, 0, 1, processFor(state.focus));
    else if (state.family === "compare") this.buildCompare(state);
    else if (state.family === "engine") this.buildEngine(state);
    else if (state.family === "graph") this.buildGraph(state);
    else if (state.family === "flow") this.buildFlow(state);
    else this.buildBars(state);
  }

  private buildBox(state: ViewState) {
    const half = 0.85 + state.params.volume / 80;
    const height = 1.15;
    this.cage(-half, half, 0, height, -0.62, 0.62);
    const count = Math.round(16 + state.params.moles * 18);
    const specks = this.makeSpecks(count, 0.055, half * 1.4, height * 0.7, 0.9);
    const read = this.tag(this.root, "", 0, height + 0.28, 0);
    const text = copyOf(state.lang);
    this.updaters.push((_time, dt) => {
      const temp = state.params.temp;
      const pace = paceOf(temp);
      for (const speck of specks) {
        steer(speck, dt, pace);
        bounceBox(speck, -half + 0.08, half - 0.08, 0.08, height - 0.08, -0.54, 0.54);
        paint(speck.mat, temp);
      }
      if (!read) return;
      const pressure = pressureOf(state.params.moles, state.params.volume, temp);
      read.textContent = state.focus === "kinetic"
        ? `${text.gas} · c = ${Math.round(rmsSpeed(temp))} m/s · P = ${pressure.toFixed(0)} kPa`
        : `${Math.round(temp)} K`;
    });
  }

  private buildRod(state: ViewState) {
    const metal = new THREE.MeshStandardMaterial({ color: 0xb9c4be, roughness: 0.35, metalness: 0.55 });
    const bar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.28, 0.28), metal);
    bar.position.y = 0.35;
    this.root.add(bar);
    const specks = this.makeSpecks(14, 0.04, 2, 0.16, 0.16);
    for (const speck of specks) speck.mesh.position.y += 0.35;
    const read = this.tag(this.root, "", 0, 0.85, 0);
    this.updaters.push((time, dt) => {
      const shown = 300 + (state.params.temp - 300) * sweep(time, 7);
      const grow = 1 + expansion(shown) * 180;
      bar.scale.x = Math.max(0.82, grow);
      const half = 1.2 * bar.scale.x;
      for (const speck of specks) {
        speck.x += Math.sin(time * 6 + speck.bias * 12) * dt * paceOf(shown) * 0.15;
        speck.x = Math.min(half - 0.08, Math.max(-half + 0.08, speck.x));
        speck.mesh.position.set(speck.x, 0.35 + Math.sin(time * 9 + speck.bias) * 0.04 * Math.sqrt(shown / 300), speck.z * 0.2);
        paint(speck.mat, shown);
      }
      paint(metal, shown);
      if (read) {
        const millimetre = expansion(shown) * 1000;
        read.textContent = state.lang === "bn"
          ? `${Math.round(shown)} K · আসল ΔL = ${millimetre.toFixed(2)} mm`
          : `${Math.round(shown)} K · real ΔL = ${millimetre.toFixed(2)} mm`;
      }
    });
  }

  private buildCompare(state: ViewState) {
    this.buildPiston(state, -1.28, 0.72, "isothermal");
    this.buildPiston(state, 1.28, 0.72, "adiabatic");
    const text = copyOf(state.lang);
    this.tag(this.root, text.iso, -1.28, 2.15, 0);
    this.tag(this.root, text.adi, 1.28, 2.15, 0);
  }

  private buildPiston(state: ViewState, x: number, scale: number, process: Process) {
    const group = new THREE.Group();
    group.position.x = x;
    group.scale.setScalar(scale);
    this.root.add(group);
    const radius = 0.5;
    const wall = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, 2.15, 28, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x9fd4c8, transparent: true, opacity: 0.16, side: THREE.DoubleSide, roughness: 0.15 }),
    );
    wall.position.y = 1.05;
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, 0.06, 28),
      new THREE.MeshStandardMaterial({ color: 0x8d9a92, metalness: 0.4, roughness: 0.4 }),
    );
    floor.position.y = 0.03;
    const piston = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.96, radius * 0.96, 0.1, 28),
      new THREE.MeshStandardMaterial({ color: 0xd7c4a8, metalness: 0.65, roughness: 0.28 }),
    );
    group.add(wall, floor, piston);
    if (process === "isochoric") {
      const clamp = new THREE.Mesh(
        new THREE.BoxGeometry(1.25, 0.08, 0.12),
        new THREE.MeshStandardMaterial({ color: 0xc4623a, metalness: 0.4, roughness: 0.4 }),
      );
      clamp.position.set(0, 0.72, radius);
      group.add(clamp);
    }
    const count = Math.max(10, Math.round((14 + state.params.moles * 14) * scale));
    const specks = this.makeSpecks(count, 0.045 * Math.max(scale, 0.7), radius * 1.2, 0.8, radius);
    for (const speck of specks) group.add(speck.mesh);
    const showBars = scale === 1 && (state.focus === "first" || state.focus === "internal" || state.focus === "work");
    let bars: { set: (heat: number, energy: number, work: number) => void } | null = null;
    if (showBars) {
      const board = new THREE.Group();
      board.position.set(1.7, 0, 0);
      this.root.add(board);
      bars = this.meter(board, state);
    }
    const read = this.tag(group, "", 0, 2.25, 0);
    const low = state.params.volume;
    const high = process === "isochoric" ? low : low * state.params.ratio;
    this.updaters.push((_time, dt) => {
      const now = processState(process, state.params, sweep(this.time, 7));
      const y = process === "isochoric" ? 0.72 : liftOf(now.volume, low, high);
      piston.position.y = y;
      const pace = paceOf(now.temp);
      for (const speck of specks) {
        steer(speck, dt, pace);
        bounceTube(speck, radius - 0.08, 0.12, y - 0.1);
        paint(speck.mat, now.temp);
      }
      bars?.set(now.heat, now.energy, now.work);
      if (!read) return;
      const unit = state.lang === "bn" ? "লিটার" : "L";
      read.textContent = `${Math.round(now.temp)} K · ${now.pressure.toFixed(0)} kPa · ${now.volume.toFixed(1)} ${unit}`;
    });
  }

  private buildEngine(state: ViewState) {
    const text = copyOf(state.lang);
    const fridge = state.focus === "fridge" || state.focus === "pump";
    const hotMat = new THREE.MeshStandardMaterial({ color: 0xc4623a, roughness: 0.45, emissive: 0x5a2414, emissiveIntensity: 0.4 });
    const coldMat = new THREE.MeshStandardMaterial({ color: 0x3d6f9a, roughness: 0.45, emissive: 0x10283f, emissiveIntensity: 0.35 });
    const source = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.42, 0.7), hotMat);
    source.position.y = 2.35;
    const sink = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.42, 0.7), coldMat);
    sink.position.y = -0.85;
    this.root.add(source, sink);
    this.tag(source, state.focus === "pump" ? text.room : text.hot, 0, 0.38, 0);
    this.tag(sink, state.focus === "pump" ? text.outside : text.cold, 0, -0.38, 0);

    const radius = 0.42;
    const wall = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, 1.45, 24, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x9fd4c8, transparent: true, opacity: 0.18, side: THREE.DoubleSide }),
    );
    wall.position.y = 0.72;
    const piston = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.94, radius * 0.94, 0.1, 24),
      new THREE.MeshStandardMaterial({ color: 0xd7c4a8, metalness: 0.6, roughness: 0.3 }),
    );
    this.root.add(wall, piston);
    const specks = this.makeSpecks(Math.round(12 + state.params.moles * 10), 0.04, 0.6, 0.7, 0.6);
    const wheel = new THREE.Group();
    wheel.position.set(1.7, 0.72, 0);
    wheel.add(new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.045, 10, 28), new THREE.MeshStandardMaterial({ color: 0xd7c4a8, metalness: 0.7, roughness: 0.3 })));
    for (let index = 0; index < 3; index += 1) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.04, 0.04), new THREE.MeshStandardMaterial({ color: 0x8d9a92 }));
      spoke.rotation.z = (index * Math.PI) / 3;
      wheel.add(spoke);
    }
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), new THREE.MeshStandardMaterial({ color: 0xc4623a }));
    pin.position.x = 0.28;
    wheel.add(pin);
    this.root.add(wheel);
    const rodGeo = new THREE.BufferGeometry();
    const rodPos = new Float32Array(6);
    rodGeo.setAttribute("position", new THREE.BufferAttribute(rodPos, 3));
    this.root.add(new THREE.Line(rodGeo, new THREE.LineBasicMaterial({ color: 0xe2a63b })));

    const score = efficiency(state.params);
    const heatArrow = this.pointer(0xc4623a);
    const workArrow = this.pointer(0xe2a63b);
    const coldArrow = this.pointer(0x7eb6ff);
    heatArrow.position.set(0.55, fridge ? 1.55 : 2.05, 0);
    coldArrow.position.set(0.55, fridge ? -0.15 : 0.15, 0);
    workArrow.position.set(0.7, 0.85, 0);
    const longest = Math.max(score.absorbed, score.work, score.rejected, 1);
    heatArrow.scale.y = 0.35 + (score.absorbed / longest) * 0.55;
    coldArrow.scale.y = 0.28 + (score.rejected / longest) * 0.45;
    workArrow.scale.y = 0.28 + (Math.abs(score.work) / longest) * 0.5;
    heatArrow.rotation.z = fridge ? 0 : Math.PI;
    coldArrow.rotation.z = fridge ? Math.PI : 0;
    workArrow.rotation.z = fridge ? Math.PI / 2 : -Math.PI / 2;
    this.root.add(heatArrow, workArrow, coldArrow);

    const names = state.lang === "bn"
      ? ["১ · সমতাপ প্রসারণ", "২ · রুদ্ধতাপীয় প্রসারণ", "৩ · সমতাপ সংকোচন", "৪ · রুদ্ধতাপীয় সংকোচন"]
      : ["1 · isothermal expansion", "2 · adiabatic expansion", "3 · isothermal compression", "4 · adiabatic compression"];
    const read = this.tag(this.root, "", -1.15, 1.15, 0);
    const tracked = state.focus === "carnot" || state.focus === "steps";
    const volumes = carnotVolumes(state.params).volumes;
    this.updaters.push((time, dt) => {
      const turn = tracked ? looped(time, 12) : (time * 0.35) % 1;
      const now = tracked ? carnotState(state.params, turn) : null;
      const y = now ? liftOf(now.volume, volumes[0], volumes[2]) * 0.72 + 0.15 : 0.72 + Math.sin(turn * Math.PI * 2) * 0.28;
      piston.position.y = y;
      const temp = now ? now.temp : state.params.hot - (state.params.hot - state.params.cold) * (0.5 + 0.5 * Math.sin(turn * Math.PI * 2));
      for (const speck of specks) {
        steer(speck, dt, paceOf(temp));
        bounceTube(speck, radius - 0.07, 0.15, y - 0.08);
        paint(speck.mat, temp);
      }
      wheel.rotation.z = turn * Math.PI * 2;
      const tipX = 1.7 + Math.cos(wheel.rotation.z) * 0.28;
      const tipY = 0.72 + Math.sin(wheel.rotation.z) * 0.28;
      rodPos[0] = 0;
      rodPos[1] = y;
      rodPos[2] = 0;
      rodPos[3] = tipX;
      rodPos[4] = tipY;
      rodPos[5] = 0;
      rodGeo.attributes.position.needsUpdate = true;
      if (!read) return;
      if (state.focus === "steps" && now) read.textContent = names[now.step];
      else if (state.focus === "fridge") read.textContent = `COP = ${score.fridge.toFixed(2)}`;
      else if (state.focus === "pump") read.textContent = `COP = ${score.pump.toFixed(2)}`;
      else read.textContent = `η = ${(score.engine * 100).toFixed(1)}%`;
    });
  }

  private buildGraph(state: ViewState) {
    const text = copyOf(state.lang);
    this.axis(text.volume, text.pressure);
    if (state.focus === "curves") {
      const rows = compareCurves(state.params, 28);
      const pressures = rows.flatMap((row) => [row.isothermal, row.adiabatic]);
      const lowP = Math.min(...pressures);
      const highP = Math.max(...pressures);
      this.curve(rows.map((row) => this.plot(row.volume, row.isothermal, rows[0].volume, rows[rows.length - 1].volume, lowP, highP)), 0xe2a63b);
      this.curve(rows.map((row) => this.plot(row.volume, row.adiabatic, rows[0].volume, rows[rows.length - 1].volume, lowP, highP)), 0x7eb6ff);
      this.tag(this.root, text.iso, 1.15, 1.55, 0);
      this.tag(this.root, text.adi, 1.15, 0.45, 0);
      this.tag(this.root, text.steeper, 0, 1.9, 0);
      const dot = this.dot(0xe2a63b);
      const other = this.dot(0x7eb6ff);
      this.updaters.push((time) => {
        const u = sweep(time, 7);
        const volume = state.params.volume * (1 + (state.params.ratio - 1) * u);
        const scale = state.params.volume / volume;
        const start = rows[0].isothermal;
        const iso = this.plot(volume, start * scale, rows[0].volume, rows[rows.length - 1].volume, lowP, highP);
        const adi = this.plot(volume, start * Math.pow(scale, GAMMA), rows[0].volume, rows[rows.length - 1].volume, lowP, highP);
        dot.position.set(iso[0], iso[1], 0.02);
        other.position.set(adi[0], adi[1], 0.02);
      });
      return;
    }
    if (state.focus === "cycle") {
      const samples = Array.from({ length: 80 }, (_, index) => carnotState(state.params, index / 80));
      const lowV = Math.min(...samples.map((item) => item.volume));
      const highV = Math.max(...samples.map((item) => item.volume));
      const lowP = Math.min(...samples.map((item) => item.pressure));
      const highP = Math.max(...samples.map((item) => item.pressure));
      this.curve(samples.map((item) => this.plot(item.volume, item.pressure, lowV, highV, lowP, highP)), 0xe2a63b);
      const dot = this.dot(0xf4efe4);
      const read = this.tag(this.root, "", 0, 1.95, 0);
      const names = state.lang === "bn"
        ? ["সমতাপ প্রসারণ", "রুদ্ধতাপীয় প্রসারণ", "সমতাপ সংকোচন", "রুদ্ধতাপীয় সংকোচন"]
        : ["isothermal expansion", "adiabatic expansion", "isothermal compression", "adiabatic compression"];
      this.updaters.push((time) => {
        const now = carnotState(state.params, looped(time, 12));
        const point = this.plot(now.volume, now.pressure, lowV, highV, lowP, highP);
        dot.position.set(point[0], point[1], 0.04);
        if (read) read.textContent = `${names[now.step]} · ${Math.round(now.temp)} K`;
      });
      return;
    }
    const rows = compareCurves(state.params, 26).map((row) => ({ volume: row.volume, pressure: row.isothermal }));
    const lowP = rows[rows.length - 1].pressure;
    const highP = rows[0].pressure;
    const points = rows.map((row) => this.plot(row.volume, row.pressure, rows[0].volume, rows[rows.length - 1].volume, lowP, highP));
    this.curve(points, 0xe2a63b);
    for (let index = 0; index < points.length; index += 4) {
      const drop = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(points[index][0], 0.12, 0),
        new THREE.Vector3(points[index][0], points[index][1], 0),
      ]);
      this.root.add(new THREE.Line(drop, new THREE.LineBasicMaterial({ color: 0x3d564c })));
    }
    this.tag(this.root, text.area, 0, 1.9, 0);
    const dot = this.dot(0xf4efe4);
    const read = this.tag(this.root, "", 0, 1.55, 0);
    this.updaters.push((time) => {
      const now = processState("isothermal", state.params, sweep(time, 7));
      const point = this.plot(now.volume, now.pressure, rows[0].volume, rows[rows.length - 1].volume, lowP, highP);
      dot.position.set(point[0], point[1], 0.04);
      if (read) read.textContent = `${now.pressure.toFixed(0)} kPa · ${now.volume.toFixed(1)} L`;
    });
  }

  private buildFlow(state: ViewState) {
    const text = copyOf(state.lang);
    if (state.focus === "reversible") {
      this.reversiblePair(state, text.reversible, text.irreversible);
      return;
    }
    const hot = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.85, 0.7), new THREE.MeshStandardMaterial({ color: 0xc4623a, emissive: 0x5a2414, emissiveIntensity: 0.45 }));
    hot.position.set(-1.45, 0.45, 0);
    const cold = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.85, 0.7), new THREE.MeshStandardMaterial({ color: 0x3d6f9a, emissive: 0x10283f, emissiveIntensity: 0.4 }));
    cold.position.set(1.45, 0.45, 0);
    this.root.add(hot, cold);
    this.tag(hot, `${text.hot} · ${Math.round(state.params.hot)} K`, 0, 0.62, 0);
    this.tag(cold, `${text.cold} · ${Math.round(state.params.cold)} K`, 0, 0.62, 0);
    const forward = this.pointer(0xe2a63b);
    forward.position.set(-0.55, 0.45, 0);
    forward.rotation.z = -Math.PI / 2;
    const gap = Math.max(20, state.params.hot - state.params.cold);
    forward.scale.y = 0.45 + Math.min(1.1, gap / 350);
    forward.scale.x = 0.7 + Math.min(1.4, gap / 280);
    forward.scale.z = forward.scale.x;
    this.root.add(forward);
    if (state.focus !== "second") return;
    const back = this.pointer(0x52625b);
    back.position.set(0.55, 0.95, 0);
    back.rotation.z = Math.PI / 2;
    back.scale.set(0.7, 0.7, 0.7);
    const slashA = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.045, 0.045), new THREE.MeshBasicMaterial({ color: 0xc4623a }));
    const slashB = slashA.clone();
    slashA.rotation.z = 0.7;
    slashB.rotation.z = -0.7;
    slashA.position.y = 0.95;
    slashB.position.y = 0.95;
    this.root.add(back, slashA, slashB);
    this.tag(this.root, text.impossible, 0, 1.35, 0);
  }

  private reversiblePair(state: ViewState, reversible: string, irreversible: string) {
    this.buildPiston(state, -1.45, 0.62, "isothermal");
    this.tag(this.root, reversible, -1.45, 2.05, 0);
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 1.05, 0.9),
      new THREE.MeshStandardMaterial({ color: 0xd7c4a8, metalness: 0.4, roughness: 0.4 }),
    );
    wall.position.set(1.15, 0.52, 0);
    this.root.add(wall);
    this.cage(0.35, 1.95, 0, 1.05, -0.42, 0.42);
    const specks = this.makeSpecks(Math.round(14 + state.params.moles * 8), 0.045, 0.7, 0.7, 0.6);
    for (const speck of specks) {
      speck.x = 0.5 + Math.random() * 0.55;
      speck.y = 0.15 + Math.random() * 0.7;
    }
    this.tag(this.root, irreversible, 1.15, 1.45, 0);
    const read = this.tag(this.root, "", 1.15, 1.15, 0);
    const closed = state.lang === "bn" ? "দেয়াল বন্ধ" : "Partition in place";
    const opened = state.lang === "bn" ? "মুক্ত প্রসারণ · W = 0" : "Free expansion · W = 0";
    this.updaters.push((_time, dt) => {
      const open = sweep(this.time, 6) > 0.18;
      wall.visible = !open;
      for (const speck of specks) {
        steer(speck, dt, paceOf(state.params.temp));
        if (!open && speck.x > 1.05) speck.x = 0.5 + Math.random() * 0.4;
        bounceBox(speck, 0.42, open ? 1.88 : 1.05, 0.08, 0.95, -0.34, 0.34);
        paint(speck.mat, state.params.temp);
      }
      if (read) read.textContent = open ? opened : closed;
    });
  }

  private buildBars(state: ViewState) {
    const text = copyOf(state.lang);
    const names = [text.iso, text.adi, text.bar, text.chor];
    const kinds: Process[] = ["isothermal", "adiabatic", "isobaric", "isochoric"];
    const ends = kinds.map((kind) => processState(kind, state.params, 1));
    const scale = Math.max(1, ...ends.flatMap((item) => [Math.abs(item.heat), Math.abs(item.energy), Math.abs(item.work)]));
    const meters = names.map((name, index) => {
      const group = new THREE.Group();
      group.position.x = -1.95 + index * 1.3;
      this.root.add(group);
      this.tag(group, name, 0, 1.7, 0);
      return this.meter(group, state, scale);
    });
    this.updaters.push(() => {
      kinds.forEach((kind, index) => {
        const now = processState(kind, state.params, sweep(this.time, 7));
        meters[index].set(now.heat, now.energy, now.work);
      });
    });
  }

  private meter(parent: any, state: ViewState, fixedScale?: number) {
    const labels = ["ΔQ", "ΔU", "ΔW"];
    const colors = [0xc4623a, 0x3d8f7a, 0xe2a63b];
    const shown = [
      state.focus !== "internal" && state.focus !== "work",
      state.focus !== "work",
      state.focus !== "internal",
    ];
    const bars = colors.map((color, index) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 1, 0.16),
        new THREE.MeshStandardMaterial({ color, roughness: 0.4 }),
      );
      mesh.position.x = (index - 1) * 0.28;
      mesh.visible = shown[index];
      parent.add(mesh);
      if (shown[index]) this.tag(parent, labels[index], mesh.position.x, 1.45, 0);
      return mesh;
    });
    const zero = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.5, 0.32, 0), new THREE.Vector3(0.5, 0.32, 0)]);
    parent.add(new THREE.Line(zero, new THREE.LineBasicMaterial({ color: 0xd5dfd6 })));
    return {
      set: (heat: number, energy: number, work: number) => {
        const values = state.focus === "internal" ? [0, energy, 0] : state.focus === "work" ? [0, 0, work] : [heat, energy, work];
        const scale = fixedScale ?? Math.max(1, ...values.map((value) => Math.abs(value)));
        values.forEach((value, index) => {
          if ((state.focus === "internal" && index !== 1) || (state.focus === "work" && index !== 2)) {
            bars[index].visible = false;
            return;
          }
          const height = (value / scale) * 1.05;
          bars[index].visible = true;
          bars[index].scale.y = Math.max(0.02, Math.abs(height));
          bars[index].position.y = 0.32 + height / 2;
        });
      },
    };
  }

  private makeSpecks(count: number, radius: number, spreadX: number, spreadY: number, spreadZ: number) {
    const geo = new THREE.SphereGeometry(radius, 10, 8);
    const specks: Speck[] = [];
    for (let index = 0; index < count; index += 1) {
      const mat = new THREE.MeshStandardMaterial({ color: 0x7eb6ff, roughness: 0.35, metalness: 0.08, emissive: 0x102033, emissiveIntensity: 0.3 });
      const mesh = new THREE.Mesh(geo, mat);
      const angle = Math.random() * Math.PI * 2;
      const lift = Math.acos(2 * Math.random() - 1);
      const speck = {
        mesh,
        mat,
        x: (Math.random() - 0.5) * spreadX,
        y: Math.random() * spreadY,
        z: (Math.random() - 0.5) * spreadZ,
        vx: Math.sin(lift) * Math.cos(angle),
        vy: Math.cos(lift),
        vz: Math.sin(lift) * Math.sin(angle),
        bias: 0.55 + Math.random() * 0.9,
      };
      mesh.position.set(speck.x, speck.y, speck.z);
      this.root.add(mesh);
      specks.push(speck);
    }
    return specks;
  }

  private cage(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) {
    const corners = [
      [x0, y0, z0],
      [x1, y0, z0],
      [x1, y0, z1],
      [x0, y0, z1],
      [x0, y1, z0],
      [x1, y1, z0],
      [x1, y1, z1],
      [x0, y1, z1],
    ];
    const edges = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ];
    const positions: number[] = [];
    for (const [a, b] of edges) {
      positions.push(...corners[a], ...corners[b]);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
    this.root.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x9fd4c8 })));
  }

  private axis(horizontal: string, vertical: string) {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.7, 0.12, 0),
      new THREE.Vector3(1.75, 0.12, 0),
      new THREE.Vector3(-1.55, 0.05, 0),
      new THREE.Vector3(-1.55, 1.85, 0),
    ]);
    this.root.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xd5dfd6 })));
    this.tag(this.root, horizontal, 1.55, -0.05, 0);
    this.tag(this.root, vertical, -1.85, 1.7, 0);
  }

  private curve(points: number[][], color: number) {
    const geo = new THREE.BufferGeometry().setFromPoints(points.map((point) => new THREE.Vector3(point[0], point[1], 0)));
    this.root.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color })));
  }

  private plot(volume: number, pressure: number, lowV: number, highV: number, lowP: number, highP: number) {
    const x = -1.45 + (2.9 * (volume - lowV)) / Math.max(1e-6, highV - lowV);
    const y = 0.2 + (1.5 * (pressure - lowP)) / Math.max(1e-6, highP - lowP);
    return [x, y];
  }

  private dot(color: number) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 12), new THREE.MeshBasicMaterial({ color }));
    this.root.add(mesh);
    return mesh;
  }

  private pointer(color: number) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 8), new THREE.MeshBasicMaterial({ color }));
    body.position.y = 0.5;
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.18, 10), new THREE.MeshBasicMaterial({ color }));
    head.position.y = 1.08;
    group.add(body, head);
    return group;
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
