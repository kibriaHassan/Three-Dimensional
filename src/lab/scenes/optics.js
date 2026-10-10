const BN = "০১২৩৪৫৬৭৮৯";

function bn(value) {
  return String(value).replace(/\d/g, (digit) => BN[digit]);
}

const AXIS = 1.7;
const Z = 0.48;
const H = 0.42;
const SLOT = 3;
const PATH = [null, -3.2, -2, -1.52, -1, -0.64];
const GOLD = 0xf2d48a;
const SKY = 0x8fd0ff;
const MINT = 0xb7f0c8;
const PAPER = 0xf4efe4;

function sizeWord(m) {
  const size = Math.abs(m);
  if (size < 0.2) return "অতি খর্ব";
  if (size < 0.93) return "খর্বিত";
  if (size < 1.08) return "সমান";
  return "বিবর্ধিত";
}

function converges(kind, f) {
  return kind === "mirror" ? f < 0 : f > 0;
}

function solve(u, f, kind) {
  const inv = kind === "mirror" ? 1 / f - 1 / u : 1 / f + 1 / u;
  if (!Number.isFinite(inv) || Math.abs(inv) < 0.2) return { mode: "image-infinity" };
  const v = 1 / inv;
  if (Math.abs(v) > 4.6) return { mode: "image-infinity" };
  const m = kind === "mirror" ? -v / u : v / u;
  return { mode: "image", v, m };
}

function zone(v, f, kind) {
  const reach = Math.abs(f);
  const away = Math.abs(v);
  const atCenter = kind === "mirror" ? "কেন্দ্রে" : "২F-এ";
  const between = kind === "mirror" ? "ফোকাস ও কেন্দ্রের মাঝে" : "F ও ২F-এর মাঝে";
  const outside = kind === "mirror" ? "কেন্দ্রের বাইরে" : "২F-এর বাইরে";
  if (Math.abs(away - reach) <= reach * 0.16) return "ফোকাসে";
  if (away < reach) return kind === "mirror" ? "মেরু ও ফোকাসের মাঝে" : "আলোককেন্দ্র ও ফোকাসের মাঝে";
  if (Math.abs(away - 2 * reach) <= reach * 0.14) return atCenter;
  if (away < 2 * reach) return between;
  return outside;
}

function describe(img, f, kind) {
  if (img.mode === "object-infinity") {
    return converges(kind, f)
      ? "বিম্ব: ফোকাসে\nবাস্তব · উল্টো · অতি খর্ব"
      : "বিম্ব: ফোকাসে\nঅবাস্তব · সোজা · অতি খর্ব";
  }
  if (img.mode === "image-infinity") return "বিম্ব: অসীমে\nবাস্তব · উল্টো · অতি বিবর্ধিত";
  const real = kind === "mirror" ? img.v < 0 : img.v > 0;
  const nature = `${real ? "বাস্তব" : "অবাস্তব"} · ${img.m > 0 ? "সোজা" : "উল্টো"} · ${sizeWord(img.m)}`;
  if (!real) {
    const side = kind === "mirror" ? "পেছনে" : "বস্তুর পাশে";
    const band = Math.abs(img.v) < Math.abs(f) * 1.08
      ? (kind === "mirror" ? "মেরু ও ফোকাসের মাঝে" : "আলোককেন্দ্র ও ফোকাসের মাঝে")
      : "ফোকাসের বাইরে";
    return `বিম্ব: ${side}, ${band}\n${nature}`;
  }
  return `বিম্ব: ${zone(img.v, f, kind)}\n${nature}`;
}

function pose(t) {
  const span = PATH.length * SLOT;
  const clock = ((t % span) + span) % span;
  const index = Math.min(PATH.length - 1, Math.floor(clock / SLOT));
  const objectInfinity = PATH[index] == null;
  return { index, objectInfinity, u: objectInfinity ? -3.35 : PATH[index] };
}

function mirrorShape(THREE, concave) {
  const radius = 1.22;
  const shell = 0.11;
  const alpha = 1.08;
  const steps = 28;
  const shape = new THREE.Shape();
  const xOf = (curve, angle) => (concave ? -radius + curve * Math.cos(angle) : radius - curve * Math.cos(angle));
  for (let i = 0; i <= steps; i += 1) {
    const angle = -alpha + (2 * alpha * i) / steps;
    const x = xOf(radius, angle);
    const y = radius * Math.sin(angle);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  for (let i = steps; i >= 0; i -= 1) {
    const angle = -alpha + (2 * alpha * i) / steps;
    shape.lineTo(xOf(radius - shell, angle), (radius - shell) * Math.sin(angle));
  }
  shape.closePath();
  return shape;
}

function lensShape(THREE, convex) {
  const half = 1.15;
  const steps = 24;
  const shape = new THREE.Shape();
  const bulge = (y) => {
    const falloff = 1 - (y * y) / (half * half);
    return convex ? 0.06 + 0.22 * falloff : 0.28 - 0.2 * falloff;
  };
  for (let i = 0; i <= steps; i += 1) {
    const y = half - (2 * half * i) / steps;
    if (i === 0) shape.moveTo(bulge(y), y);
    else shape.lineTo(bulge(y), y);
  }
  for (let i = 0; i <= steps; i += 1) {
    const y = -half + (2 * half * i) / steps;
    shape.lineTo(-bulge(y), y);
  }
  shape.closePath();
  return shape;
}

function makeOptics(spec) {
  const { f, kind } = spec;
  return {
    id: spec.id,
    chapter: "light",
    chapterNo: spec.chapterNo,
    chapterName: spec.chapterName,
    title: spec.title,
    blurb: spec.blurb,
    keywords: spec.keywords,
    formula: spec.formula,
    verbal: spec.verbal,
    proof: spec.proof,
    note: spec.note,
    duration: PATH.length * SLOT,
    spin: false,
    steps: spec.steps,
    create(ctx) {
      const { THREE, C, mesh, mat, glass, line, tag, vec, rod, span } = ctx;
      ctx.frame([0.05, 2.15, 9.6], [-0.2, 1.62, 0]);
      ctx.spin(true);

      const board = mesh(new THREE.BoxGeometry(7.4, 0.08, 1.35), mat({ color: 0x24302c, roughness: 0.86 }));
      board.position.set(-0.15, 0.12, 0);
      const stand = mesh(
        new THREE.CylinderGeometry(0.07, 0.1, 1.05, 12),
        mat({ color: C.metalDark, metalness: 0.45, roughness: 0.42 })
      );
      stand.position.set(0, 0.62, -0.28);
      const rail = rod(0.015, 0x9aa8b3);
      span(rail, vec(-3.7, AXIS, -0.12), vec(3.55, AXIS, -0.12));

      if (kind === "mirror") {
        const geo = new THREE.ExtrudeGeometry(mirrorShape(THREE, f < 0), { depth: 0.42, bevelEnabled: false });
        geo.translate(0, 0, -0.21);
        const dish = mesh(
          geo,
          mat({
            color: 0xe7eef6,
            emissive: 0x8ea0b0,
            emissiveIntensity: 0.35,
            metalness: 0.35,
            roughness: 0.22,
            side: THREE.DoubleSide,
          })
        );
        dish.position.y = AXIS;
      } else {
        const geo = new THREE.ExtrudeGeometry(lensShape(THREE, f > 0), { depth: 0.5, bevelEnabled: false });
        geo.translate(0, 0, -0.18);
        const lens = mesh(geo, glass({ opacity: 0.46, color: f > 0 ? 0xd7f6ea : 0xd5e7fb }), false);
        lens.position.y = AXIS;
      }

      const axis = line(PAPER, true);
      axis.frustumCulled = false;
      axis.userData.set(-3.65, AXIS, 0.08, 3.45, AXIS, 0.08);

      const marks = kind === "mirror"
        ? [
            [0, "P"],
            [f, "F"],
            [2 * f, "C"],
          ]
        : [
            [-2 * f, "২F′"],
            [-f, "F′"],
            [0, "O"],
            [f, "F"],
            [2 * f, "২F"],
          ];
      marks.forEach(([x, label]) => {
        const tick = line(PAPER, false);
        tick.frustumCulled = false;
        tick.userData.set(x, AXIS - 0.11, 0.22, x, AXIS + 0.11, 0.22);
        tag(label, x, 0.3, 0.22);
      });

      const ray = (color, dashed = false) => {
        const ln = line(color, dashed);
        ln.frustumCulled = false;
        return ln;
      };
      const incA = ray(GOLD);
      const outA = ray(SKY);
      const extA = ray(PAPER, true);
      const incB = ray(GOLD);
      const outB = ray(MINT);
      const extB = ray(PAPER, true);

      const objectArrow = ctx.arrow(C.force);
      const imageArrow = ctx.arrow(C.velocity);
      const objectTag = tag("বস্তু", 0, 0, Z);
      const imageTag = tag("বিম্ব", 0, 0, Z);
      const banner = tag("", -1.55, AXIS + 1.22, Z);
      banner.element.style.whiteSpace = "pre-line";
      banner.element.style.textAlign = "center";
      banner.element.style.borderRadius = "16px";
      banner.element.style.padding = "6px 10px";

      const dotMat = mat({ color: C.velocity, emissive: C.velocity, emissiveIntensity: 0.7 });
      const dot = mesh(new THREE.SphereGeometry(0.075, 16, 12), dotMat, false);
      dot.visible = false;
      const photon = mesh(
        new THREE.SphereGeometry(0.055, 12, 10),
        mat({ color: 0xfff1c2, emissive: GOLD, emissiveIntensity: 0.9 }),
        false
      );

      const P = (x, y) => new THREE.Vector3(x, AXIS + y, Z);
      const hop = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];

      function tint(arrow, color) {
        for (const child of arrow.children) {
          if (!child.material) continue;
          child.material.color.setHex(color);
          if (child.material.emissive) child.material.emissive.setHex(color);
        }
      }

      function link(ln, a, b) {
        if (!a || !b || a.distanceTo(b) < 0.05) {
          ln.visible = false;
          return;
        }
        ln.visible = true;
        ln.userData.set(a.x, a.y, a.z, b.x, b.y, b.z);
      }

      function focusPoint(h, xGoal) {
        const t = xGoal / f;
        return P(t * f, h * (1 - t));
      }

      function further(from, first, second) {
        const toFirst = first.clone().sub(from);
        const toSecond = second.clone().sub(from);
        const useSecond = toSecond.dot(toFirst) > 0 && toSecond.length() > toFirst.length() + 0.04;
        const target = useSecond ? second : first;
        const length = Math.max(target.distanceTo(from), 0.001);
        return from.clone().add(target.clone().sub(from).multiplyScalar((length + 0.26) / length));
      }

      function showImage(img, objectInfinity) {
        if (objectInfinity) {
          imageArrow.visible = false;
          imageTag.visible = false;
          dot.visible = true;
          const color = converges(kind, f) ? C.velocity : C.tension;
          dotMat.color.setHex(color);
          dotMat.emissive.setHex(color);
          dot.position.set(f, AXIS, Z);
          return;
        }
        dot.visible = false;
        if (img.mode !== "image") {
          imageArrow.visible = false;
          imageTag.visible = false;
          return;
        }
        const height = img.m * H;
        const real = kind === "mirror" ? img.v < 0 : img.v > 0;
        tint(imageArrow, real ? C.velocity : C.tension);
        ctx.shoot(imageArrow, vec(img.v, AXIS, Z + 0.08), vec(0, height, 0));
        imageTag.visible = true;
        const lift = height >= 0 ? height + 0.2 : height - 0.22;
        imageTag.position.set(img.v + 0.16, AXIS + lift, Z);
      }

      function drawFinite(u, img) {
        const tip = img.mode === "image" ? P(img.v, img.m * H) : null;
        const real = Boolean(tip) && (kind === "mirror" ? img.v < -0.02 : img.v > 0.02);
        const hitA = P(0, H);
        link(incA, P(u, H), hitA);
        const focusEnd = focusPoint(H, kind === "mirror" ? -2.55 : 2.65);
        if (real) {
          link(outA, hitA, further(hitA, tip, P(f, 0)));
          link(extA, null, null);
        } else if (tip) {
          link(outA, hitA, focusEnd);
          link(extA, hitA, further(hitA, tip, P(f, 0)));
        } else {
          link(outA, hitA, focusEnd);
          link(extA, null, null);
        }
        hop[0].copy(P(u, H));
        hop[1].copy(hitA);
        hop[2].copy(outA.visible ? new THREE.Vector3(outA.geometry.attributes.position.array[3], outA.geometry.attributes.position.array[4], outA.geometry.attributes.position.array[5]) : hitA);

        if (kind === "lens") {
          const origin = P(0, 0);
          const far = P(2.65, (H / u) * 2.65);
          link(incB, P(u, H), origin);
          if (real) {
            link(outB, origin, further(origin, tip, far));
            link(extB, null, null);
          } else if (tip && img.v * u > 0 && Math.abs(img.v) > Math.abs(u) + 0.08) {
            link(outB, origin, far);
            link(extB, P(u, H), tip);
          } else {
            link(outB, origin, far);
            link(extB, null, null);
          }
          return;
        }

        const limit = 1.12;
        const yC = Math.abs(u - 2 * f) < 0.045 ? Infinity : (H * 2 * f) / (2 * f - u);
        const yF = Math.abs(u - f) < 0.045 ? Infinity : (H * f) / (f - u);
        const second = Math.abs(yC) <= limit ? { type: "C", y: yC } : Math.abs(yF) <= limit ? { type: "F", y: yF } : null;
        if (!second) {
          link(incB, null, null);
          link(outB, null, null);
          link(extB, null, null);
          return;
        }
        const hitB = P(0, second.y);
        if (second.type === "F") {
          link(incB, P(u, H), hitB);
          if (real) link(outB, hitB, P(img.v - 0.32, second.y));
          else link(outB, hitB, P(-2.4, second.y));
          link(extB, tip && img.v > 0.04 ? hitB : null, tip && img.v > 0.04 ? P(img.v, img.m * H) : null);
          return;
        }
        const yAt = (x) => second.y * (1 - x / (2 * f));
        let xEnd = -2.5;
        if (real) xEnd = Math.min(img.v, 2 * f, u) - 0.22;
        else xEnd = Math.min(-2.5, u - 0.15);
        link(incB, null, null);
        link(outB, hitB, P(xEnd, yAt(xEnd)));
        link(extB, tip && img.v > 0.04 ? hitB : null, tip && img.v > 0.04 ? tip : null);
      }

      function drawInfinity() {
        [0.5, 0.24].forEach((height, index) => {
          const hit = P(0, height);
          const start = P(-3.4, height);
          const incident = index === 0 ? incA : incB;
          const outgoing = index === 0 ? outA : outB;
          const extra = index === 0 ? extA : extB;
          link(incident, start, hit);
          if (converges(kind, f)) {
            link(outgoing, hit, P(f, 0));
            link(extra, null, null);
          } else {
            link(outgoing, hit, focusPoint(height, kind === "mirror" ? -2.4 : 2.55));
            link(extra, hit, P(f, 0));
          }
          if (index === 0) {
            hop[0].copy(start);
            hop[1].copy(hit);
            hop[2].set(outgoing.geometry.attributes.position.array[3], outgoing.geometry.attributes.position.array[4], outgoing.geometry.attributes.position.array[5]);
          }
        });
      }

      return {
        update(t) {
          const place = pose(t);
          const img = place.objectInfinity ? { mode: "object-infinity" } : solve(place.u, f, kind);
          banner.set(`${spec.steps[place.index].title}\n${describe(img, f, kind)}`);
          if (place.objectInfinity) {
            objectArrow.visible = false;
            objectTag.visible = false;
            drawInfinity();
          } else {
            tint(objectArrow, C.force);
            ctx.shoot(objectArrow, vec(place.u, AXIS, Z), vec(0, H, 0));
            objectTag.visible = true;
            objectTag.position.set(place.u, AXIS + H + 0.22, Z);
            drawFinite(place.u, img);
          }
          showImage(img, place.objectInfinity);
          const phase = (t % 2.6) / 2.6;
          photon.visible = hop[0].distanceTo(hop[2]) > 0.08;
          if (phase < 0.46) photon.position.lerpVectors(hop[0], hop[1], phase / 0.46);
          else photon.position.lerpVectors(hop[1], hop[2], (phase - 0.46) / 0.54);
        },
      };
    },
  };
}

const mirrorNote = "লাল তীর বস্তু। সবুজ তীর বাস্তব বিম্ব, হলুদ তীর অবাস্তব বিম্ব। সাদা ড্যাশ সেই দিক, যেদিকে আলো আসলে যায় না — বিম্ব সেখানে মনে হয়। P মেরু, F ফোকাস, C বক্রতার কেন্দ্র।";
const lensNote = "লাল তীর বস্তু। সবুজ তীর বাস্তব বিম্ব, হলুদ তীর অবাস্তব বিম্ব। সাদা ড্যাশ অবাস্তব বিম্বের দিকে। O আলোককেন্দ্র, F ও F′ দুই ফোকাস, ২F মানে ফোকাসের দ্বিগুণ দূরত্ব।";

const concaveMirrorSteps = [
  { t: 0, title: "অসীমে", body: "বস্তু অসীমে। সমান্তরাল রশ্মি ফোকাসে মিলে। বিম্ব F-এ — বাস্তব, উল্টো, অতি খর্ব।" },
  { t: 3, title: "কেন্দ্রের বাইরে", body: "বস্তু C-এর বাইরে। বিম্ব F ও C-এর মাঝে — বাস্তব, উল্টো, খর্বিত।" },
  { t: 6, title: "কেন্দ্রের উপর", body: "বস্তু C-তে। বিম্বও C-তে — বাস্তব, উল্টো, বস্তুর সমান।" },
  { t: 9, title: "ফোকাস ও কেন্দ্রের মাঝে", body: "বস্তু F ও C-এর মাঝে। বিম্ব C-এর বাইরে — বাস্তব, উল্টো, বিবর্ধিত।" },
  { t: 12, title: "ফোকাসের উপর", body: "বস্তু F-এ। প্রতিফলিত রশ্মি পরস্পর সমান্তরাল। বিম্ব অসীমে — বাস্তব, উল্টো, অতি বিবর্ধিত।" },
  { t: 15, title: "ফোকাসের ভিতরে", body: "বস্তু F ও P-এর মাঝে। বিম্ব আয়নার পেছনে — অবাস্তব, সোজা, বিবর্ধিত।" },
];

const convexMirrorSteps = [
  { t: 0, title: "অসীমে", body: "সমান্তরাল রশ্মি যেন ফোকাস থেকে আসছে। বিম্ব F-এ, আয়নার পেছনে — অবাস্তব, সোজা, অতি খর্ব।" },
  { t: 3, title: "কেন্দ্রের বাইরে", body: "বিম্ব মেরু ও F-এর মাঝে। উত্তল দর্পণে এটি অবাস্তব, সোজা, খর্বিত।" },
  { t: 6, title: "কেন্দ্রের দূরত্বে", body: "বস্তু C-এর দূরত্বে থাকলেও বিম্ব মেরু ও F-এর মাঝেই থাকে — অবাস্তব, সোজা, খর্বিত।" },
  { t: 9, title: "ফোকাস ও কেন্দ্রের মাঝে", body: "বস্তু কাছে আসলে বিম্ব মেরুর দিকে সরে এবং একটু বড় হয়, তবু খর্বিত। অবাস্তব, সোজা।" },
  { t: 12, title: "ফোকাসের দূরত্বে", body: "উত্তল দর্পণে বস্তু ফোকাস দূরত্বে থাকলেও বিম্ব অসীমে যায় না। পেছনেই থাকে — অবাস্তব, সোজা, খর্বিত।" },
  { t: 15, title: "ফোকাসের ভিতরে", body: "বিম্ব মেরুর আরও কাছে। সব সময় অবাস্তব, সোজা, খর্বিত।" },
];

const convexLensSteps = [
  { t: 0, title: "অসীমে", body: "সমান্তরাল রশ্মি অপর পাশের ফোকাসে মিলে। বিম্ব F-এ — বাস্তব, উল্টো, অতি খর্ব।" },
  { t: 3, title: "২F-এর বাইরে", body: "বস্তু ২F-এর বাইরে। বিম্ব F ও ২F-এর মাঝে — বাস্তব, উল্টো, খর্বিত।" },
  { t: 6, title: "২F-এর উপর", body: "বস্তু ২F-এ। বিম্বও ২F-এ — বাস্তব, উল্টো, বস্তুর সমান।" },
  { t: 9, title: "ফোকাস ও ২F-এর মাঝে", body: "বস্তু F ও ২F-এর মাঝে। বিম্ব ২F-এর বাইরে — বাস্তব, উল্টো, বিবর্ধিত।" },
  { t: 12, title: "ফোকাসের উপর", body: "বস্তু F-এ। নির্গত রশ্মি সমান্তরাল। বিম্ব অসীমে — বাস্তব, উল্টো, অতি বিবর্ধিত।" },
  { t: 15, title: "ফোকাসের ভিতরে", body: "বস্তু F ও আলোককেন্দ্রের মাঝে। বিম্ব বস্তুর পাশে — অবাস্তব, সোজা, বিবর্ধিত।" },
];

const concaveLensSteps = [
  { t: 0, title: "অসীমে", body: "সমান্তরাল রশ্মি যেন বস্তুর পাশের ফোকাস থেকে আসছে। বিম্ব F-এর কাছে — অবাস্তব, সোজা, অতি খর্ব।" },
  { t: 3, title: "২F-এর বাইরে", body: "বিম্ব আলোককেন্দ্র ও F-এর মাঝে। অবতল লেন্সে এটি অবাস্তব, সোজা, খর্বিত।" },
  { t: 6, title: "২F-এর দূরত্বে", body: "বস্তু ২F-এ থাকলেও বিম্ব আলোককেন্দ্র ও F-এর মাঝেই — অবাস্তব, সোজা, খর্বিত।" },
  { t: 9, title: "ফোকাস ও ২F-এর মাঝে", body: "বস্তু কাছে আসলে বিম্ব আলোককেন্দ্রের দিকে সরে। অবাস্তব, সোজা, খর্বিত।" },
  { t: 12, title: "ফোকাসের দূরত্বে", body: "অবতল লেন্সে বিম্ব অসীমে যায় না। বস্তুর পাশেই থাকে — অবাস্তব, সোজা, খর্বিত।" },
  { t: 15, title: "ফোকাসের ভিতরে", body: "বিম্ব আলোককেন্দ্রের আরও কাছে। সব সময় অবাস্তব, সোজা, খর্বিত।" },
];

function tirScene() {
  const mu = 1.5;
  const critical = Math.asin(1 / mu);
  const criticalDeg = (critical * 180) / Math.PI;
  const span = 4.2;
  const targets = [30, criticalDeg, 55];
  return {
    id: "tir",
    chapter: "light",
    chapterNo: "৯",
    chapterName: "আলোর প্রতিসরণ",
    title: "পূর্ণ অভ্যন্তরীণ প্রতিফলন",
    blurb: "সংকট কোণ পেরোলে আলো আর বেরোয় না।",
    keywords: "TIR critical angle পূর্ণ অভ্যন্তরীণ প্রতিফলন সংকট কোণ সংকট কোট কাচ বায়ু",
    formula: "sin c = 1/μ",
    verbal: "কাচ থেকে বায়ু, μ = ১.৫। সংকট কোণ ৪১.৮°।",
    proof: "আপতন কোণ সংকট কোণের সমান হলে রশ্মি বিভেদতল ঘেঁষে। তার চেয়ে বড় হলে আলো সম্পূর্ণ ফিরে আসে।",
    note: "কাচের পরম প্রতিসরাঙ্ক ১.৫। sin c = ১/১.৫, তাই c = ৪১.৮°। i < c হলে প্রতিসরণ, i = c হলে r = ৯০°, i > c হলে পূর্ণ অভ্যন্তরীণ প্রতিফলন। বক্রতল দিয়ে ব্যাসার্ধ বরাবর ঢোকায় সেখানে আলো বাঁকে না।",
    duration: span * 3,
    spin: false,
    steps: [
      { t: 0, title: "সংকট কোণের চেয়ে ছোট", body: "i = ৩০°, c = ৪১.৮°। আলো বায়ুতে বেরোয়। প্রতিসরণ কোণ প্রায় ৪৮.৬°।" },
      { t: 4.2, title: "সংকট কোণ", body: "i = c = ৪১.৮°। প্রতিসরিত রশ্মি কাচ-বায়ু বিভেদতল ঘেঁষে যায়, r = ৯০°।" },
      { t: 8.4, title: "পূর্ণ অভ্যন্তরীণ প্রতিফলন", body: "i = ৫৫° > c। sin r ১-এর বেশি হয়ে যায়, তাই আলো আর বেরোয় না। কাচের ভেতরেই সম্পূর্ণ ফিরে আসে।" },
    ],
    create(ctx) {
      const { THREE, C, mesh, mat, glass, line, poly, tag, vec } = ctx;
      const gy = 1.55;
      const radius = 1.22;
      const z = 0.42;
      ctx.frame([0.35, 2.45, 6.4], [-0.35, gy, 0]);
      ctx.spin(true);

      const shape = new THREE.Shape();
      shape.moveTo(0, radius);
      for (let i = 1; i <= 36; i += 1) {
        const angle = Math.PI / 2 + (Math.PI * i) / 36;
        shape.lineTo(radius * Math.cos(angle), radius * Math.sin(angle));
      }
      shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.7, bevelEnabled: false });
      geo.translate(0, 0, -0.28);
      const block = mesh(geo, glass({ opacity: 0.42, color: 0xc9eee4 }), false);
      block.position.y = gy;

      const foot = mesh(new THREE.CylinderGeometry(0.7, 0.82, 0.1, 24), mat({ color: C.wood, roughness: 0.74 }));
      foot.position.set(-0.35, 0.08, 0);

      const face = line(PAPER, false);
      face.frustumCulled = false;
      face.userData.set(0, gy - radius, z, 0, gy + radius, z);
      const normal = line(PAPER, true);
      normal.frustumCulled = false;
      normal.userData.set(-0.48, gy, z, 0.36, gy, z);

      const incident = poly(GOLD, 2);
      const leaving = poly(0x9dffd8, 2);
      const bounced = poly(0xffe1a8, 2);
      const criticalRay = line(0xf7c56b, true);
      criticalRay.frustumCulled = false;
      criticalRay.userData.set(-Math.cos(critical) * 1.12, gy + Math.sin(critical) * 1.12, z, 0, gy, z);
      const arc = poly(PAPER, 20);
      const photon = mesh(
        new THREE.SphereGeometry(0.055, 12, 10),
        mat({ color: 0xfff1c2, emissive: GOLD, emissiveIntensity: 0.9 }),
        false
      );
      const glassTag = tag("কাচ  μ = ১.৫", -0.85, gy + 0.15, z);
      const airTag = tag("বায়ু", 0.85, gy + 0.55, z);
      const cTag = tag(`c = ${bn(criticalDeg.toFixed(1))}°`, -0.95, gy - 0.15, z);
      const readout = tag("", 0.15, gy + radius + 0.28, z);
      readout.element.style.whiteSpace = "pre-line";
      readout.element.style.textAlign = "center";
      readout.element.style.borderRadius = "16px";
      readout.element.style.padding = "6px 10px";
      void glassTag;
      void airTag;
      void cTag;

      function seg(ln, a, b) {
        const p = ln.geometry.attributes.position.array;
        p[0] = a.x;
        p[1] = a.y;
        p[2] = a.z;
        p[3] = b.x;
        p[4] = b.y;
        p[5] = b.z;
        ln.geometry.attributes.position.needsUpdate = true;
        ln.visible = a.distanceTo(b) > 0.04;
      }

      function smooth(value) {
        const x = Math.max(0, Math.min(1, value));
        return x * x * (3 - 2 * x);
      }

      return {
        update(t) {
          const clock = ((t % (span * 3)) + span * 3) % (span * 3);
          const index = Math.min(2, Math.floor(clock / span));
          const local = (clock - index * span) / span;
          const blend = local < 0.16 ? smooth(local / 0.16) : 1;
          const degrees = targets[(index + 2) % 3] + (targets[index] - targets[(index + 2) % 3]) * blend;
          const angle = (degrees * Math.PI) / 180;
          const hit = vec(0, gy, z);
          const dirIn = vec(Math.cos(angle), -Math.sin(angle), 0);
          const start = hit.clone().addScaledVector(dirIn, -1.12);
          seg(incident, start, hit);

          const sine = mu * Math.sin(angle);
          const grazing = Math.abs(angle - critical) < 0.012;
          const trapped = sine > 1 && !grazing;
          let next = hit.clone();
          leaving.visible = false;
          bounced.visible = false;
          if (grazing) {
            next = vec(0, gy + 1.35, z);
            seg(leaving, hit, next);
            readout.set(`i = c = ${bn(criticalDeg.toFixed(1))}°\nr = ৯০°\nরশ্মি ঘেঁষে যায়`);
          } else if (!trapped) {
            const refracted = Math.asin(Math.min(sine, 1));
            next = hit.clone().add(vec(Math.cos(refracted) * 1.45, -Math.sin(refracted) * 1.45, 0));
            seg(leaving, hit, next);
            readout.set(`i = ${bn(degrees.toFixed(1))}°\nc = ${bn(criticalDeg.toFixed(1))}°\nr = ${bn(((refracted * 180) / Math.PI).toFixed(1))}°`);
          } else {
            next = hit.clone().add(vec(-Math.cos(angle) * 1.2, -Math.sin(angle) * 1.2, 0));
            seg(bounced, hit, next);
            readout.set(`i = ${bn(degrees.toFixed(1))}°\nc = ${bn(criticalDeg.toFixed(1))}°\nপূর্ণ অভ্যন্তরীণ প্রতিফলন`);
          }

          const count = arc.userData.count;
          const positions = arc.geometry.attributes.position.array;
          for (let i = 0; i < count; i += 1) {
            const sweep = Math.PI - angle * (i / (count - 1));
            positions[i * 3] = Math.cos(sweep) * 0.48;
            positions[i * 3 + 1] = gy + Math.sin(sweep) * 0.48;
            positions[i * 3 + 2] = z;
          }
          arc.geometry.attributes.position.needsUpdate = true;

          const phase = (t % 2.4) / 2.4;
          photon.position.lerpVectors(start, phase < 0.5 ? hit : next, phase < 0.5 ? phase / 0.5 : (phase - 0.5) / 0.5);
        },
      };
    },
  };
}

export const opticsScenes = [
  makeOptics({
    id: "mirror-concave",
    chapterNo: "৮",
    chapterName: "আলোর প্রতিফলন",
    title: "অবতল দর্পণে বিম্ব",
    blurb: "বস্তুর জায়গা বদলালে বিম্বের জায়গা, আকার ও প্রকৃতি।",
    keywords: "অবতল দর্পণ উত্তল নয় concave mirror ফোকাস কেন্দ্র বিম্ব",
    formula: "1/v + 1/u = 1/f",
    verbal: "অবতল দর্পণে f ঋণাত্মক। ছয়টি জায়গায় বিম্ব আলাদা।",
    proof: "অসীম থেকে ফোকাসের ভিতর — প্রতি জায়গায় বিম্ব কোথায়, কত বড়, বাস্তব না অবাস্তব।",
    note: mirrorNote,
    f: -1,
    kind: "mirror",
    steps: concaveMirrorSteps,
  }),
  makeOptics({
    id: "mirror-convex",
    chapterNo: "৮",
    chapterName: "আলোর প্রতিফলন",
    title: "উত্তল দর্পণে বিম্ব",
    blurb: "বিম্ব সব সময় পেছনে, সোজা আর খর্বিত।",
    keywords: "উত্তল দর্পণ convex mirror অবাস্তব খর্বিত ফোকাস",
    formula: "1/v + 1/u = 1/f",
    verbal: "উত্তল দর্পণে f ধনাত্মক। বিম্ব মেরু ও ফোকাসের মাঝে।",
    proof: "বস্তু যেখানেই থাক, বিম্ব আয়নার পেছনে — অবাস্তব, সোজা, খর্বিত।",
    note: mirrorNote,
    f: 1,
    kind: "mirror",
    steps: convexMirrorSteps,
  }),
  makeOptics({
    id: "lens-convex",
    chapterNo: "৯",
    chapterName: "আলোর প্রতিসরণ",
    title: "উত্তল লেন্সে বিম্ব",
    blurb: "ফোকাসের বাইরে বাস্তব উল্টো, ভিতরে অবাস্তব সোজা।",
    keywords: "উত্তল লেন্স convex lens বিম্ব 2F ফোকাস",
    formula: "1/v − 1/u = 1/f",
    verbal: "উত্তল লেন্সে f ধনাত্মক। বাস্তব বিম্ব অপর পাশে।",
    proof: "অসীম, ২F-এর বাইরে, ২F-এ, F ও ২F-এর মাঝে, F-এ, আর F-এর ভিতরে — বিম্বের পুরো ছক।",
    note: lensNote,
    f: 1,
    kind: "lens",
    steps: convexLensSteps,
  }),
  makeOptics({
    id: "lens-concave",
    chapterNo: "৯",
    chapterName: "আলোর প্রতিসরণ",
    title: "অবতল লেন্সে বিম্ব",
    blurb: "বিম্ব সব সময় বস্তুর পাশে, সোজা আর খর্বিত।",
    keywords: "অবতল লেন্স concave lens অবাস্তব খর্বিত ফোকাস",
    formula: "1/v − 1/u = 1/f",
    verbal: "অবতল লেন্সে f ঋণাত্মক। বিম্ব আলোককেন্দ্র ও F-এর মাঝে।",
    proof: "বস্তু যেখানেই থাক, বিম্ব বস্তুর পাশে — অবাস্তব, সোজা, খর্বিত।",
    note: lensNote,
    f: -1,
    kind: "lens",
    steps: concaveLensSteps,
  }),
  tirScene(),
];
