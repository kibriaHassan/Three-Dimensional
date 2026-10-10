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
  const session = {
    spin: true,
    framing: {
      pos: [5.1, 3.15, 6.4],
      target: [0, 1.05, 0],
    },
  };

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
  };

  return { ctx, session, dispose };
}

export function createViewer(stage, options = {}) {
  const canvas = stage.querySelector("canvas");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.pixelRatio || 1.75));
  renderer.setClearColor(0x10161d, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x10161d);
  scene.fog = new THREE.Fog(0x10161d, 11, 24);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.08, 80);
  camera.position.set(5.1, 3.15, 6.4);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
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
  const shadowSize = options.shadow || 1024;
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
    new THREE.CircleGeometry(12, 72),
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
    controls.autoRotate = spin && !scrubbing;
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
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!document.hidden && playing && !scrubbing && demo) {
      time += dt * speed;
      if (time >= duration) time %= duration;
    }
    tickContent();
    render();
    onTick(time, duration, playing, failed);
    requestAnimationFrame(loop);
  }

  const resizeObserver = new ResizeObserver(() => resize());
  resizeObserver.observe(stage);
  resize();

  return {
    load(next) {
      if (sessionPack) sessionPack.dispose();
      failed = null;
      demo = next;
      duration = next.duration;
      time = 0;
      sessionPack = createSession(root);
      runtime = next.create(sessionPack.ctx) || { update() {} };
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
      tickContent();
      render();
    },
    setSpeed(value) {
      speed = value;
    },
    setSpin(on) {
      spin = on;
      if (sessionPack) sessionPack.session.spin = on;
    },
    setScrubbing(value) {
      scrubbing = value;
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
      resizeObserver.disconnect();
      if (sessionPack) sessionPack.dispose();
      controls.dispose();
      renderer.dispose();
      labelRenderer.domElement.remove();
    },
  };
}
