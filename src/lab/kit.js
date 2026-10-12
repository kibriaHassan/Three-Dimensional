import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";

export const C = {
  force: 0xe25b45,
  weight: 0x3c6fd8,
  normal: 0x1f9d8a,
  tension: 0xe2a63b,
  friction: 0xd4783c,
  velocity: 0x3cbe74,
  displacement: 0x7d8cf0,
  wood: 0xc4925a,
  woodDark: 0x7b542f,
  metal: 0xb7c2cc,
  metalDark: 0x667480,
  rubber: 0x2a3138,
  water: 0x2f8fbf,
  brass: 0xd4a054,
  copper: 0xc47a45,
  north: 0xd24b4b,
  south: 0x3a67d6,
  hot: 0xff5a2a,
  ink: 0xf4efe4,
};

export function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function smoothstep(t) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

export function segment(t, a, b) {
  return smoothstep((t - a) / (b - a));
}

const BN = "০১২৩৪৫৬৭৮৯";

export function toBn(value) {
  return String(value).replace(/\d/g, (d) => BN[d]);
}

export function formatClock(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${toBn(m)}:${toBn(String(r).padStart(2, "0"))}`;
}

function createSession(root) {
  const labels = [];
  const materials = new Set();
  const yAxis = new THREE.Vector3(0, 1, 0);
  const tmp = new THREE.Vector3();
  const hand = { active: false, u: null, angle: null, shown: null };
  const session = {
    spin: true,
    hand,
    grabs: [],
    handsLabel: "তীর ধরে টেনে অবস্থান বদলাও",
    framing: {
      pos: [5.1, 3.15, 6.4],
      target: [0, 1.05, 0],
    },
  };

  function remember(mesh, kind, opts = {}) {
    session.grabs.push({
      mesh,
      kind,
      min: opts.min,
      max: opts.max,
      reach: opts.reach,
      radius: opts.radius,
      falling: false,
      held: false,
      vel: new THREE.Vector3(),
      baseScale: null,
    });
  }

  function add(obj) {
    root.add(obj);
    return obj;
  }

  function track(material) {
    materials.add(material);
    return material;
  }

  function mat(opts) {
    return track(new THREE.MeshStandardMaterial({ roughness: 0.58, metalness: 0.06, ...opts }));
  }

  function mesh(geo, material, shadow = true) {
    const m = new THREE.Mesh(geo, material);
    if (shadow) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
    root.add(m);
    return m;
  }

  function glass(opts = {}) {
    return mat({
      color: 0xd7f3fb,
      roughness: 0.08,
      metalness: 0.02,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      side: THREE.DoubleSide,
      ...opts,
    });
  }

  function arrow(color) {
    const material = mat({
      color,
      emissive: color,
      emissiveIntensity: 0.14,
      roughness: 0.32,
      metalness: 0.12,
    });
    const g = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 1, 12), material);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.078, 0.18, 14), material);
    shaft.castShadow = true;
    head.castShadow = true;
    g.add(shaft, head);
    g.userData.sync = (len) => {
      const headH = 0.18;
      const L = Math.max(len, 0.2);
      const shaftLen = Math.max(L - headH, 0.04);
      shaft.scale.y = shaftLen;
      shaft.position.y = shaftLen / 2;
      head.position.y = shaftLen + headH / 2;
    };
    g.userData.sync(1);
    root.add(g);
    return g;
  }

  function shoot(arrowMesh, origin, vector) {
    arrowMesh.position.copy(origin);
    const len = vector.length();
    if (len < 0.05) {
      arrowMesh.visible = false;
      return;
    }
    arrowMesh.visible = true;
    arrowMesh.userData.sync(len);
    tmp.copy(vector).multiplyScalar(1 / len);
    arrowMesh.quaternion.setFromUnitVectors(yAxis, tmp);
  }

  function rod(radius, color) {
    return mesh(
      new THREE.CylinderGeometry(radius, radius, 1, 10),
      mat({ color, roughness: 0.4, metalness: 0.25 }),
      true
    );
  }

  function span(meshObj, a, b) {
    tmp.subVectors(b, a);
    const len = tmp.length();
    meshObj.scale.y = Math.max(len, 0.001);
    meshObj.position.copy(a).add(b).multiplyScalar(0.5);
    if (len > 1e-4) {
      tmp.multiplyScalar(1 / len);
      meshObj.quaternion.setFromUnitVectors(yAxis, tmp);
    }
  }

  function tag(text, x, y, z) {
    const el = document.createElement("div");
    el.className = "float-tag";
    el.textContent = text;
    const obj = new CSS2DObject(el);
    obj.position.set(x, y, z);
    root.add(obj);
    labels.push(obj);
    obj.set = (value) => {
      el.textContent = value;
    };
    return obj;
  }

  function line(color, dashed = false) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
    const material = dashed
      ? new THREE.LineDashedMaterial({ color, dashSize: 0.09, gapSize: 0.055 })
      : new THREE.LineBasicMaterial({ color });
    track(material);
    const ln = new THREE.Line(geo, material);
    ln.userData.set = (ax, ay, az, bx, by, bz) => {
      const p = ln.geometry.attributes.position.array;
      p[0] = ax;
      p[1] = ay;
      p[2] = az;
      p[3] = bx;
      p[4] = by;
      p[5] = bz;
      ln.geometry.attributes.position.needsUpdate = true;
      ln.computeLineDistances();
    };
    root.add(ln);
    return ln;
  }

  function poly(color, count) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    const material = track(new THREE.LineBasicMaterial({ color }));
    const ln = new THREE.Line(geo, material);
    ln.userData.count = count;
    ln.frustumCulled = false;
    root.add(ln);
    return ln;
  }

  function table(opts = {}) {
    const w = opts.w ?? 4.6;
    const d = opts.d ?? 2.15;
    const h = opts.h ?? 0.78;
    const x = opts.x ?? 0;
    const z = opts.z ?? 0;
    const top = mesh(new THREE.BoxGeometry(w, 0.1, d), mat({ color: C.wood, roughness: 0.72 }));
    top.position.set(x, h, z);
    const lh = h - 0.04;
    const legGeo = new THREE.BoxGeometry(0.09, lh, 0.09);
    const legMat = mat({ color: C.woodDark, roughness: 0.78 });
    const dx = w / 2 - 0.22;
    const dz = d / 2 - 0.18;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const leg = mesh(legGeo, legMat);
        leg.position.set(x + sx * dx, lh / 2, z + sz * dz);
      }
    }
    return h + 0.05;
  }

  function dispose() {
    root.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
    });
    materials.forEach((material) => material.dispose());
    labels.forEach((label) => label.element.remove());
    root.clear();
  }

  const ctx = {
    THREE,
    C,
    add,
    mat,
    mesh,
    glass,
    arrow,
    shoot,
    rod,
    span,
    tag,
    line,
    poly,
    table,
    group() {
      return add(new THREE.Group());
    },
    vec(x = 0, y = 0, z = 0) {
      return new THREE.Vector3(x, y, z);
    },
    frame(pos, target) {
      session.framing = { pos, target };
    },
    spin(on) {
      session.spin = on;
    },
    clamp,
    lerp,
    seg: segment,
    smooth: smoothstep,
    hand,
    lift(mesh, opts) {
      remember(mesh, "lift", opts);
    },
    place(mesh, opts) {
      remember(mesh, "place", opts);
    },
    dial(mesh, opts) {
      remember(mesh, "dial", opts);
    },
  };

  return { ctx, session, dispose };
}

export function createViewer(stage, options = {}) {
  const canvas = stage.querySelector("canvas");
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = (stage.clientWidth || window.innerWidth) < 800;
  const light = coarse || narrow;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !light,
    alpha: false,
    powerPreference: "high-performance",
  });
  const dprCap = light ? 1.25 : Math.min(options.pixelRatio || 1.5, 1.5);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
  renderer.setClearColor(0x10161d, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = light ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x10161d);
  scene.fog = new THREE.Fog(0x10161d, 11, 24);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.08, 80);
  camera.position.set(5.1, 3.15, 6.4);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = coarse ? 0.85 : 0.7;
  controls.zoomSpeed = coarse ? 0.7 : 0.9;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.minDistance = 2.4;
  controls.maxDistance = 16;
  controls.target.set(0, 1.05, 0);
  controls.autoRotate = options.spin !== false;
  controls.autoRotateSpeed = 0.55;
  controls.enablePan = false;

  scene.add(new THREE.HemisphereLight(0xf7f1e4, 0x24302c, 0.92));
  const dir = new THREE.DirectionalLight(0xfff6ea, 1.45);
  dir.position.set(5.5, 9.5, 4.5);
  dir.castShadow = true;
  const shadowSize = light ? 512 : Math.min(options.shadow || 1024, 1024);
  dir.shadow.mapSize.set(shadowSize, shadowSize);
  dir.shadow.camera.near = 0.5;
  dir.shadow.camera.far = 28;
  dir.shadow.camera.left = -9;
  dir.shadow.camera.right = 9;
  dir.shadow.camera.top = 9;
  dir.shadow.camera.bottom = -9;
  dir.shadow.bias = -0.00035;
  scene.add(dir);
  const fill = new THREE.DirectionalLight(0xc5d4ff, 0.38);
  fill.position.set(-6, 3.5, -3);
  scene.add(fill);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(12, light ? 36 : 56),
    new THREE.MeshStandardMaterial({ color: 0x1b2422, roughness: 0.96, metalness: 0.02 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const grid = new THREE.GridHelper(16, 24, 0x415250, 0x2a3434);
  grid.position.y = 0.004;
  const gridMats = Array.isArray(grid.material) ? grid.material : [grid.material];
  gridMats.forEach((material) => {
    material.transparent = true;
    material.opacity = 0.45;
  });
  scene.add(grid);

  const root = new THREE.Group();
  scene.add(root);

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.classList.add("labels");
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.inset = "0";
  labelRenderer.domElement.style.pointerEvents = "none";
  stage.appendChild(labelRenderer.domElement);

  let sessionPack = null;
  let runtime = { update() {} };
  let demo = null;
  let time = 0;
  let duration = 1;
  let playing = options.autoplay !== false;
  let speed = 1;
  let scrubbing = false;
  let running = false;
  let last = performance.now();
  let onTick = () => {};
  let spin = options.spin !== false;
  let failed = null;

  function resize() {
    const w = stage.clientWidth || 1;
    const h = stage.clientHeight || 1;
    renderer.setSize(w, h, false);
    labelRenderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function applyFrame(framing) {
    camera.position.set(framing.pos[0], framing.pos[1], framing.pos[2]);
    controls.target.set(framing.target[0], framing.target[1], framing.target[2]);
    controls.update();
  }

  function render() {
    controls.autoRotate = spin && !scrubbing && !hands;
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }

  function tickContent() {
    if (!demo || failed) return;
    try {
      runtime.update(time);
    } catch (error) {
      failed = error;
      playing = false;
      console.error(demo.id, error);
    }
  }

  function loop(now) {
    if (!running) return;
    if (document.hidden) {
      last = now;
      requestAnimationFrame(loop);
      return;
    }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!document.hidden && playing && !scrubbing && demo) {
      time += dt * speed;
      if (time >= duration) time %= duration;
    }
    if (hands) stepHands(dt);
    const live = sessionPack?.session.grabs.some((grab) => grab.kind === "place" || grab.kind === "dial");
    if (!hands || live) tickContent();
    render();
    onTick(time, duration, playing, failed);
    requestAnimationFrame(loop);
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const dragPlane = new THREE.Plane();
  const hitPoint = new THREE.Vector3();
  const handTmp = new THREE.Vector3();
  const camFlat = new THREE.Vector3();
  const lastHit = new THREE.Vector3();
  const pointers = new Set();
  const pointerAbort = new AbortController();
  let hands = false;
  let drag = null;
  let steer = null;
  const up = new THREE.Vector3(0, 1, 0);

  function refreshHandsLabel(session) {
    if (session.grabs.some((grab) => grab.kind === "place")) session.handsLabel = "লক্ষ্যবস্তুর তীর ধরে জায়গা বদলাও";
    else if (session.grabs.some((grab) => grab.kind === "dial")) session.handsLabel = "উপরে-নিচে টেনে কোণ বদলাও";
    else session.handsLabel = "তীর ধরে টেনে অবস্থান বদলাও";
  }

  function bnPlace(value) {
    const text = (Math.round(value * 10) / 10).toFixed(1);
    return text.replace("-", "−").replace(/\d/g, (digit) => BN[digit]);
  }

  function writeSteer() {
    if (!steer) return;
    const pos = steer.group.position;
    const disp = Math.hypot(pos.x - steer.origin.x, pos.z - steer.origin.z);
    steer.el.textContent = `তীরের জায়গা\nx ${bnPlace(pos.x)}   z ${bnPlace(pos.z)}\nদূরত্ব ${bnPlace(steer.travel)}   সরণ ${bnPlace(disp)}`;
  }

  function removeSteer() {
    if (!steer) return;
    steer.group.removeFromParent();
    steer.el.remove();
    for (const geo of steer.geos) geo.dispose();
    for (const material of steer.materials) material.dispose();
    const grabs = sessionPack?.session.grabs;
    if (grabs) {
      const index = grabs.findIndex((grab) => grab.mesh === steer.group);
      if (index >= 0) grabs.splice(index, 1);
    }
    steer = null;
  }

  function ensureArrow() {
    const session = sessionPack?.session;
    if (!session || steer) return;
    if (session.grabs.some((grab) => grab.kind === "place" || grab.kind === "dial")) return;
    const color = 0xf0c36a;
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.42,
      roughness: 0.32,
      metalness: 0.12,
    });
    const ringMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.22,
      roughness: 0.4,
      side: THREE.DoubleSide,
    });
    const shaftGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.78, 14);
    const headGeo = new THREE.ConeGeometry(0.13, 0.3, 18);
    const ringGeo = new THREE.RingGeometry(0.18, 0.34, 28);
    ringGeo.rotateX(-Math.PI / 2);
    const shaft = new THREE.Mesh(shaftGeo, material);
    const head = new THREE.Mesh(headGeo, material);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    shaft.castShadow = true;
    head.castShadow = true;
    shaft.position.y = 0.39;
    head.position.y = 0.93;
    ring.position.y = 0.025;
    const group = new THREE.Group();
    group.add(shaft, head, ring);
    const target = session.framing?.target || [0, 0.4, 0];
    const cam = session.framing?.pos || [0, 3, 6];
    const dx = cam[0] - target[0];
    const dz = cam[2] - target[2];
    const span = Math.hypot(dx, dz) || 1;
    group.position.set(target[0] + (dx / span) * 1.15, 0.02, target[2] + (dz / span) * 1.15);
    root.add(group);
    const el = document.createElement("div");
    el.className = "float-tag";
    el.style.whiteSpace = "pre-line";
    el.style.textAlign = "left";
    const label = new CSS2DObject(el);
    label.position.set(0.35, 1.25, 0);
    group.add(label);
    session.grabs.push({
      mesh: group,
      kind: "steer",
      reach: 1.15,
      held: false,
      falling: false,
      vel: new THREE.Vector3(),
      baseScale: null,
    });
    steer = {
      group,
      geos: [shaftGeo, headGeo, ringGeo],
      materials: [material, ringMat],
      el,
      origin: group.position.clone(),
      travel: 0,
    };
    writeSteer();
  }

  function setWorld(mesh, point) {
    const parent = mesh.parent;
    if (!parent) {
      mesh.position.copy(point);
      return;
    }
    parent.updateWorldMatrix(true, false);
    mesh.position.copy(parent.worldToLocal(point.clone()));
  }

  function setPointer(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 + 1;
  }

  function pickGrab() {
    raycaster.setFromCamera(pointer, camera);
    let best = null;
    let bestScore = Infinity;
    for (const grab of sessionPack?.session.grabs || []) {
      if (!grab.mesh) continue;
      grab.mesh.getWorldPosition(handTmp);
      const dist = raycaster.ray.distanceToPoint(handTmp);
      const reach = grab.reach ?? 0.4;
      if (dist > reach) continue;
      const along = handTmp.dot(raycaster.ray.direction) - raycaster.ray.origin.dot(raycaster.ray.direction);
      if (along < 0.05) continue;
      const score = along + dist * 5;
      if (score < bestScore) {
        bestScore = score;
        best = grab;
      }
    }
    return best;
  }

  function beginLift(grab, now) {
    camera.getWorldDirection(camFlat);
    camFlat.y = 0;
    if (camFlat.lengthSq() < 1e-4) camFlat.set(0, 0, 1);
    else camFlat.normalize();
    grab.mesh.getWorldPosition(handTmp);
    drag.planeNormal.copy(camFlat);
    drag.planePoint.copy(handTmp);
    dragPlane.setFromNormalAndCoplanarPoint(camFlat, handTmp);
    raycaster.setFromCamera(pointer, camera);
    if (raycaster.ray.intersectPlane(dragPlane, hitPoint)) drag.offset.copy(handTmp).sub(hitPoint);
    else drag.offset.set(0, 0, 0);
    lastHit.copy(handTmp);
    drag.lastT = now;
    grab.held = true;
    grab.falling = false;
    grab.vel.set(0, 0, 0);
    grab.baseScale = grab.mesh.scale.clone();
    grab.mesh.scale.multiplyScalar(1.06);
  }

  function moveLift(grab, now) {
    dragPlane.setFromNormalAndCoplanarPoint(drag.planeNormal, drag.planePoint);
    raycaster.setFromCamera(pointer, camera);
    if (!raycaster.ray.intersectPlane(dragPlane, hitPoint)) return;
    hitPoint.add(drag.offset);
    const radius = grab.radius ?? 0.18;
    hitPoint.y = clamp(hitPoint.y, radius, 3.6);
    hitPoint.x = clamp(hitPoint.x, -6, 6);
    hitPoint.z = clamp(hitPoint.z, -6, 6);
    const dt = Math.min(0.05, (now - drag.lastT) / 1000);
    if (dt > 0.004) grab.vel.copy(hitPoint).sub(lastHit).multiplyScalar(1 / dt);
    lastHit.copy(hitPoint);
    drag.lastT = now;
    setWorld(grab.mesh, hitPoint);
  }

  function movePlace(grab) {
    camera.getWorldDirection(camFlat);
    if (camFlat.lengthSq() < 1e-6) camFlat.set(0, 0, 1);
    grab.mesh.getWorldPosition(handTmp);
    dragPlane.setFromNormalAndCoplanarPoint(camFlat, handTmp);
    raycaster.setFromCamera(pointer, camera);
    if (!raycaster.ray.intersectPlane(dragPlane, hitPoint)) return;
    sessionPack.session.hand.u = clamp(hitPoint.x, grab.min ?? -3.35, grab.max ?? -0.42);
  }

  function moveDial(grab, event) {
    const rect = canvas.getBoundingClientRect();
    const dy = (event.clientY - drag.lastY) / Math.max(rect.height, 1);
    drag.lastY = event.clientY;
    const session = sessionPack.session;
    const base = Number.isFinite(session.hand.angle) ? session.hand.angle : (session.hand.shown ?? 30);
    session.hand.angle = clamp(base - dy * 110, grab.min ?? 18, grab.max ?? 68);
  }

  function beginSteer(grab) {
    grab.mesh.getWorldPosition(handTmp);
    drag.planeNormal.copy(up);
    drag.planePoint.copy(handTmp);
    dragPlane.setFromNormalAndCoplanarPoint(up, handTmp);
    raycaster.setFromCamera(pointer, camera);
    if (raycaster.ray.intersectPlane(dragPlane, hitPoint)) drag.offset.copy(handTmp).sub(hitPoint);
    else drag.offset.set(0, 0, 0);
    grab.baseScale = grab.mesh.scale.clone();
    grab.mesh.scale.multiplyScalar(1.06);
  }

  function moveSteer(grab) {
    dragPlane.setFromNormalAndCoplanarPoint(drag.planeNormal, drag.planePoint);
    raycaster.setFromCamera(pointer, camera);
    if (!raycaster.ray.intersectPlane(dragPlane, hitPoint)) return;
    hitPoint.add(drag.offset);
    const nextX = clamp(hitPoint.x, -5, 5);
    const nextZ = clamp(hitPoint.z, -5, 5);
    const dx = nextX - grab.mesh.position.x;
    const dz = nextZ - grab.mesh.position.z;
    steer.travel += Math.hypot(dx, dz);
    grab.mesh.position.x = nextX;
    grab.mesh.position.z = nextZ;
    writeSteer();
  }

  function endDrag(releasePhysics) {
    if (drag?.grab?.kind === "lift") {
      const grab = drag.grab;
      grab.held = false;
      if (grab.baseScale) grab.mesh.scale.copy(grab.baseScale);
      grab.baseScale = null;
      if (releasePhysics) {
        const speed = grab.vel.length();
        if (speed > 6) grab.vel.multiplyScalar(6 / speed);
        grab.falling = true;
      } else {
        grab.vel.set(0, 0, 0);
        grab.falling = false;
      }
    }
    if (drag?.grab?.kind === "steer" && drag.grab.baseScale) {
      drag.grab.mesh.scale.copy(drag.grab.baseScale);
      drag.grab.baseScale = null;
    }
    drag = null;
    controls.enabled = true;
    if (canvas) canvas.style.cursor = hands ? "grab" : "";
  }

  function stepHands(dt) {
    const grabs = sessionPack?.session.grabs;
    if (!grabs) return;
    for (const grab of grabs) {
      if (grab.kind !== "lift" || grab.held || !grab.falling) continue;
      grab.vel.y -= 7.5 * dt;
      grab.vel.x *= Math.exp(-0.8 * dt);
      grab.vel.z *= Math.exp(-0.8 * dt);
      grab.mesh.getWorldPosition(handTmp);
      handTmp.addScaledVector(grab.vel, dt);
      handTmp.x = clamp(handTmp.x, -6, 6);
      handTmp.z = clamp(handTmp.z, -6, 6);
      const radius = grab.radius ?? 0.18;
      if (handTmp.y <= radius) {
        handTmp.y = radius;
        if (grab.vel.y < -1.1) grab.vel.y *= -0.32;
        else {
          grab.vel.set(0, 0, 0);
          grab.falling = false;
        }
      }
      setWorld(grab.mesh, handTmp);
    }
  }

  function onPointerDown(event) {
    pointers.add(event.pointerId);
    if (!hands || !sessionPack) return;
    if (pointers.size > 1) {
      endDrag(false);
      return;
    }
    setPointer(event);
    const grab = pickGrab();
    if (!grab) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    drag = {
      grab,
      lastY: event.clientY,
      lastT: performance.now(),
      offset: new THREE.Vector3(),
      planeNormal: new THREE.Vector3(),
      planePoint: new THREE.Vector3(),
    };
    if (grab.kind === "lift") beginLift(grab, drag.lastT);
    else if (grab.kind === "steer") beginSteer(grab);
    else if (grab.kind === "place" && !Number.isFinite(sessionPack.session.hand.u)) {
      grab.mesh.getWorldPosition(handTmp);
      sessionPack.session.hand.u = clamp(handTmp.x, grab.min ?? -3.35, grab.max ?? -0.42);
    } else if (grab.kind === "dial" && !Number.isFinite(sessionPack.session.hand.angle)) {
      sessionPack.session.hand.angle = sessionPack.session.hand.shown ?? 30;
    }
    controls.enabled = false;
    canvas.style.cursor = "grabbing";
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      /* পয়েন্টার ইতিমধ্যে ছেড়ে গেলে ধরা লাগে না */
    }
  }

  function onPointerMove(event) {
    if (!drag) return;
    event.preventDefault();
    setPointer(event);
    const grab = drag.grab;
    if (grab.kind === "lift") moveLift(grab, performance.now());
    else if (grab.kind === "steer") moveSteer(grab);
    else if (grab.kind === "place") movePlace(grab);
    else moveDial(grab, event);
    if (grab.kind !== "lift" && grab.kind !== "steer") tickContent();
    render();
  }

  function onPointerUp(event) {
    pointers.delete(event.pointerId);
    if (drag) endDrag(true);
  }

  if (canvas) {
    const listen = { capture: true, signal: pointerAbort.signal };
    canvas.addEventListener("pointerdown", onPointerDown, listen);
    canvas.addEventListener("pointermove", onPointerMove, listen);
    canvas.addEventListener("pointerup", onPointerUp, listen);
    canvas.addEventListener("pointercancel", onPointerUp, listen);
  }

  const resizeObserver = new ResizeObserver(() => resize());
  resizeObserver.observe(stage);
  resize();

  return {
    load(next) {
      removeSteer();
      hands = false;
      drag = null;
      pointers.clear();
      controls.enabled = true;
      if (canvas) canvas.style.cursor = "";
      if (sessionPack) sessionPack.dispose();
      failed = null;
      demo = next;
      duration = next.duration;
      time = 0;
      sessionPack = createSession(root);
      runtime = next.create(sessionPack.ctx) || { update() {} };
      refreshHandsLabel(sessionPack.session);
      spin = sessionPack.session.spin && options.spin !== false;
      applyFrame(sessionPack.session.framing);
      tickContent();
      render();
    },
    play() {
      playing = true;
    },
    pause() {
      playing = false;
    },
    toggle() {
      playing = !playing;
      return playing;
    },
    restart() {
      time = 0;
      failed = null;
    },
    resetCamera() {
      if (sessionPack) applyFrame(sessionPack.session.framing);
    },
    setTime(value) {
      time = clamp(value, 0, Math.max(duration - 0.001, 0));
      const live = sessionPack?.session.grabs.some((grab) => grab.kind === "place" || grab.kind === "dial");
      if (!hands || live) tickContent();
      render();
    },
    setSpeed(value) {
      speed = value;
    },
    setSpin(on) {
      spin = on;
      if (sessionPack) sessionPack.session.spin = on;
    },
    setSpinSpeed(value) {
      const next = Math.max(0, value);
      controls.autoRotateSpeed = next;
      spin = next > 0.04;
      if (sessionPack) sessionPack.session.spin = spin;
    },
    setScrubbing(value) {
      scrubbing = value;
    },
    setHands(on) {
      hands = !!on;
      const session = sessionPack?.session;
      if (!session) return hands;
      session.hand.active = hands;
      endDrag(false);
      if (!hands) {
        session.hand.u = null;
        session.hand.angle = null;
        for (const grab of session.grabs) {
          grab.held = false;
          grab.falling = false;
          grab.vel.set(0, 0, 0);
          if (grab.baseScale) grab.mesh.scale.copy(grab.baseScale);
          grab.baseScale = null;
        }
        removeSteer();
      } else {
        ensureArrow();
        for (const grab of session.grabs) {
          if (grab.kind === "place" && grab.mesh && !grab.mesh.visible) session.hand.u = -2.1;
        }
      }
      refreshHandsLabel(session);
      if (canvas) canvas.style.cursor = hands ? "grab" : "";
      const live = session.grabs.some((grab) => grab.kind === "place" || grab.kind === "dial");
      if (!hands || live) tickContent();
      render();
      return hands;
    },
    getHandsHint() {
      return sessionPack?.session.handsLabel || "তীর ধরে টেনে অবস্থান বদলাও";
    },
    getSpin() {
      return spin;
    },
    set onTick(fn) {
      onTick = fn;
    },
    get time() {
      return time;
    },
    get duration() {
      return duration;
    },
    get playing() {
      return playing;
    },
    get error() {
      return failed;
    },
    resize,
    start() {
      if (running) return;
      running = true;
      last = performance.now();
      requestAnimationFrame(loop);
    },
    stop() {
      running = false;
    },
    dispose() {
      running = false;
      pointerAbort.abort();
      removeSteer();
      resizeObserver.disconnect();
      if (sessionPack) sessionPack.dispose();
      controls.dispose();
      renderer.dispose();
      labelRenderer.domElement.remove();
    },
  };
}
