import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import type { ArrowSpec, FaceSpec, LineSpec, MarkerSpec, SceneContent, Vec3 } from "./types";

const AXIS = 3.8;

function finite(v: Vec3) {
  return Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z);
}

function span(points: Vec3[]) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y, points[i].z - points[i - 1].z);
  }
  return total;
}

export class VectorWorld {
  private host: HTMLElement;
  private renderer: any;
  private labelRenderer: any;
  private scene: any;
  private camera: any;
  private controls: any;
  private arrowGroup: any;
  private guideGroup: any;
  private labelGroup: any;
  private arrows = new Map<string, any>();
  private materials = new Map<string, any>();
  private shaftGeo: any;
  private headGeo: any;
  private sphereGeo: any;
  private frame = 0;
  private observer: ResizeObserver | null = null;
  private yAxis = new THREE.Vector3(0, 1, 0);
  private tmp = new THREE.Vector3();
  private tmp2 = new THREE.Vector3();
  private failed = false;
  private alive = true;

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
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.setAttribute("aria-label", "ভেক্টরের ত্রিমাত্র দৃশ্য");
    host.append(renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.domElement.style.position = "absolute";
    this.labelRenderer.domElement.style.inset = "0";
    this.labelRenderer.domElement.style.pointerEvents = "none";
    host.append(this.labelRenderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
    this.camera.position.set(6.4, 4.3, 7.1);

    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.minDistance = 2.4;
    this.controls.maxDistance = 16;
    this.controls.target.set(0, 0.15, 0);
    this.controls.rotateSpeed = 0.85;
    this.controls.update();
    this.controls.saveState();

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.62));
    this.scene.add(new THREE.HemisphereLight(0xf7f3ea, 0x1b2822, 0.45));
    const sun = new THREE.DirectionalLight(0xffffff, 1.25);
    sun.position.set(5, 9, 4);
    this.scene.add(sun);

    const grid = new THREE.GridHelper(10, 20, 0x3d564c, 0x24362f);
    const gridMats = Array.isArray(grid.material) ? grid.material : [grid.material];
    for (const mat of gridMats) {
      mat.transparent = true;
      mat.opacity = 0.55;
    }
    grid.position.y = -0.02;
    this.scene.add(grid);

    this.buildAxes();
    this.arrowGroup = new THREE.Group();
    this.guideGroup = new THREE.Group();
    this.labelGroup = new THREE.Group();
    this.scene.add(this.arrowGroup, this.guideGroup, this.labelGroup);

    this.shaftGeo = new THREE.CylinderGeometry(0.046, 0.046, 1, 16);
    this.headGeo = new THREE.ConeGeometry(0.12, 0.28, 18);
    this.sphereGeo = new THREE.SphereGeometry(1, 18, 14);

    this.resize();
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(host);
    this.loop();
  }

  setContent(content: SceneContent) {
    if (this.failed) return;
    this.syncArrows(content.arrows);
    this.drawGuides(content.lines, content.faces, content.markers);
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
    this.shaftGeo?.dispose();
    this.headGeo?.dispose();
    this.sphereGeo?.dispose();
    for (const mat of this.materials.values()) mat.dispose();
    this.clearGroup(this.guideGroup);
    for (const parts of this.arrows.values()) parts.label.element.remove();
    this.renderer?.dispose();
    this.renderer?.forceContextLoss?.();
    this.renderer?.domElement.remove();
    this.labelRenderer?.domElement.remove();
  }

  private loop = () => {
    if (!this.alive) return;
    this.frame = requestAnimationFrame(this.loop);
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

  private material(color: string, kind: "solid" | "line" | "dash" | "face") {
    const key = `${kind}:${color}`;
    let mat = this.materials.get(key);
    if (mat) return mat;
    if (kind === "solid") {
      mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.4,
        metalness: 0.08,
        emissive: color,
        emissiveIntensity: 0.12,
      });
    } else if (kind === "line") {
      mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.45,
        metalness: 0.04,
        emissive: color,
        emissiveIntensity: 0.08,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      });
    } else if (kind === "dash") {
      mat = new THREE.LineDashedMaterial({ color, dashSize: 0.14, gapSize: 0.09, transparent: true, opacity: 0.9 });
    } else {
      mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      });
    }
    this.materials.set(key, mat);
    return mat;
  }

  private tag(text: string) {
    const el = document.createElement("span");
    el.className = "float-tag";
    el.textContent = text;
    return new CSS2DObject(el);
  }

  private buildAxes() {
    const group = new THREE.Group();
    const origin = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xf4efe4, roughness: 0.4 }),
    );
    group.add(origin);
    const specs = [
      { dir: [1, 0, 0], color: 0xe25b45, pos: "+X", neg: "−X" },
      { dir: [0, 1, 0], color: 0x2f9e6b, pos: "+Y", neg: "−Y" },
      { dir: [0, 0, 1], color: 0x3c6fd8, pos: "+Z", neg: "−Z" },
    ];
    for (const spec of specs) {
      const dir = new THREE.Vector3(spec.dir[0], spec.dir[1], spec.dir[2]);
      const from = dir.clone().multiplyScalar(-AXIS);
      const to = dir.clone().multiplyScalar(AXIS);
      const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
      group.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: spec.color })));
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.09, 0.24, 16),
        new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.4, emissive: spec.color, emissiveIntensity: 0.15 }),
      );
      cone.position.copy(to);
      cone.quaternion.setFromUnitVectors(this.yAxis, dir);
      group.add(cone);
      const plus = this.tag(spec.pos);
      plus.position.copy(to.clone().multiplyScalar(1.1));
      const minus = this.tag(spec.neg);
      minus.position.copy(from.clone().multiplyScalar(1.08));
      group.add(plus, minus);
    }
    this.scene.add(group);
  }

  private syncArrows(arrows: ArrowSpec[]) {
    const seen = new Set<string>();
    for (const spec of arrows) {
      if (!finite(spec.from) || !finite(spec.to)) continue;
      seen.add(spec.id);
      let parts = this.arrows.get(spec.id);
      if (!parts) {
        const group = new THREE.Group();
        const mat = this.material(spec.color, "solid");
        const shaft = new THREE.Mesh(this.shaftGeo, mat);
        const head = new THREE.Mesh(this.headGeo, mat);
        group.add(shaft, head);
        const label = this.tag(spec.label ?? "");
        this.labelGroup.add(label);
        this.arrowGroup.add(group);
        parts = { group, shaft, head, label };
        this.arrows.set(spec.id, parts);
      }
      this.placeArrow(parts, spec);
    }
    for (const [id, parts] of this.arrows) {
      if (seen.has(id)) continue;
      this.arrowGroup.remove(parts.group);
      this.labelGroup.remove(parts.label);
      parts.label.element.remove();
      this.arrows.delete(id);
    }
  }

  private placeArrow(parts: any, spec: ArrowSpec) {
    const from = this.tmp2.set(spec.from.x, spec.from.y, spec.from.z);
    const to = this.tmp.set(spec.to.x, spec.to.y, spec.to.z);
    const dir = to.clone().sub(from);
    const len = dir.length();
    const mat = this.material(spec.color, "solid");
    parts.shaft.material = mat;
    parts.head.material = mat;
    parts.label.element.textContent = spec.label ?? "";
    if (len < 0.06) {
      parts.group.visible = false;
      parts.label.visible = false;
      return;
    }
    const headH = Math.min(0.32, Math.max(0.12, len * 0.28));
    const shaftLen = Math.max(len - headH, 0.02);
    const headScale = headH / 0.28;
    parts.group.visible = true;
    parts.group.position.copy(from);
    parts.group.quaternion.setFromUnitVectors(this.yAxis, dir.normalize());
    parts.shaft.scale.set(1, shaftLen, 1);
    parts.shaft.position.set(0, shaftLen / 2, 0);
    parts.head.scale.set(headScale, headScale, headScale);
    parts.head.position.set(0, shaftLen + headH / 2, 0);
    parts.label.visible = Boolean(spec.label);
    parts.label.position.set(spec.to.x, spec.to.y + 0.2, spec.to.z);
  }

  private drawGuides(lines: LineSpec[], faces: FaceSpec[], markers: MarkerSpec[]) {
    this.clearGroup(this.guideGroup);
    for (const line of lines) {
      const points = line.points.filter(finite);
      if (points.length < 2 || span(points) < 0.04) continue;
      if (line.dashed) {
        const geo = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(p.x, p.y, p.z)));
        const mesh = new THREE.Line(geo, this.material(line.color, "dash"));
        mesh.computeLineDistances();
        this.guideGroup.add(mesh);
        continue;
      }
      const vectors = points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
      const curve = vectors.length === 2 ? new THREE.LineCurve3(vectors[0], vectors[1]) : new THREE.CatmullRomCurve3(vectors);
      const geo = new THREE.TubeGeometry(curve, Math.max(vectors.length * 3, 8), line.radius ?? 0.02, 8, false);
      this.guideGroup.add(new THREE.Mesh(geo, this.material(line.color, "line")));
    }

    for (const face of faces) {
      const corners = face.corners.filter(finite);
      if (corners.length < 3) continue;
      const positions: number[] = [];
      const push = (a: Vec3, b: Vec3, c: Vec3) => {
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
      };
      push(corners[0], corners[1], corners[2]);
      if (corners.length > 3) push(corners[0], corners[2], corners[3]);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
      geo.computeVertexNormals();
      this.guideGroup.add(new THREE.Mesh(geo, this.material(face.color, "face")));
    }

    for (const marker of markers) {
      if (!finite(marker.at)) continue;
      const group = new THREE.Group();
      group.position.set(marker.at.x, marker.at.y, marker.at.z);
      const radius = marker.radius ?? 0.08;
      if (radius >= 0.03) {
        const mesh = new THREE.Mesh(this.sphereGeo, this.material(marker.color, "solid"));
        mesh.scale.setScalar(radius);
        group.add(mesh);
      }
      if (marker.label) {
        const label = this.tag(marker.label);
        label.position.set(0, 0.22, 0);
        group.add(label);
      }
      this.guideGroup.add(group);
    }
  }

  private clearGroup(group: any) {
    if (!group) return;
    for (const child of [...group.children]) {
      group.remove(child);
      child.traverse((node: any) => {
        if (node.element) node.element.remove();
        if (node.geometry && node.geometry !== this.sphereGeo) node.geometry.dispose();
      });
    }
  }
}
