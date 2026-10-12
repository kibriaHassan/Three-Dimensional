const BN = "০১২৩৪৫৬৭৮৯";

function bn(value) {
  return String(value).replace(/-/g, "−").replace(/\d/g, (digit) => BN[digit]);
}

function n(value, digits = 1) {
  const rounded = Math.round(Number(value) * 10 ** digits) / 10 ** digits;
  const text = Math.abs(rounded) < 0.05 ? (0).toFixed(digits) : rounded.toFixed(digits);
  return bn(text);
}

function banner(ctx, x, y, z) {
  const tag = ctx.tag("", x, y, z);
  tag.element.style.whiteSpace = "pre-line";
  tag.element.style.textAlign = "left";
  tag.element.style.borderRadius = "16px";
  tag.element.style.padding = "6px 10px";
  return tag;
}

function face(group, dx, dz) {
  if (Math.hypot(dx, dz) < 1e-4) return;
  group.rotation.y = Math.atan2(-dz, dx);
}

function stroke(line, pts) {
  const arr = line.geometry.attributes.position.array;
  const max = line.userData.count;
  const count = Math.max(2, Math.min(max, Math.max(pts.length, 2)));
  for (let i = 0; i < count; i += 1) {
    const p = pts[Math.min(i, Math.max(pts.length - 1, 0))] || [0, 0, 0];
    arr[i * 3] = p[0];
    arr[i * 3 + 1] = p[1];
    arr[i * 3 + 2] = p[2];
  }
  line.geometry.setDrawRange(0, count);
  line.geometry.attributes.position.needsUpdate = true;
}

function road(ctx, length, z = 0) {
  const { THREE, mesh, mat } = ctx;
  const slab = mesh(new THREE.BoxGeometry(length, 0.08, 1.5), mat({ color: 0x2a3136, roughness: 0.92 }));
  slab.position.set(0, 0.04, z);
  const paint = mat({ color: 0xf4efe4, roughness: 0.8 });
  for (let i = -3; i <= 3; i += 1) {
    const dash = mesh(new THREE.BoxGeometry(0.38, 0.02, 0.06), paint, false);
    dash.position.set((i * length) / 8, 0.09, z);
  }
  return slab;
}

function buildCar(ctx, color, scale = 1) {
  const { THREE, mesh, mat, group } = ctx;
  const g = group();
  const paint = mat({ color, roughness: 0.38, metalness: 0.22 });
  const dark = mat({ color: 0x1b2126, roughness: 0.6 });
  const glass = mat({ color: 0xc5e4ee, roughness: 0.12, metalness: 0.08, transparent: true, opacity: 0.72 });
  const body = mesh(new THREE.BoxGeometry(0.96 * scale, 0.26 * scale, 0.42 * scale), paint);
  body.position.y = 0.32 * scale;
  g.add(body);
  const cabin = mesh(new THREE.BoxGeometry(0.46 * scale, 0.22 * scale, 0.36 * scale), glass);
  cabin.position.set(-0.04 * scale, 0.52 * scale, 0);
  g.add(cabin);
  const wheels = [];
  const geo = new THREE.CylinderGeometry(0.11 * scale, 0.11 * scale, 0.08 * scale, 12);
  for (const [x, z] of [
    [0.3, 0.22],
    [0.3, -0.22],
    [-0.3, 0.22],
    [-0.3, -0.22],
  ]) {
    const hub = new THREE.Group();
    hub.rotation.x = Math.PI / 2;
    hub.position.set(x * scale, 0.11 * scale, z * scale);
    const wheel = mesh(geo, dark);
    hub.add(wheel);
    g.add(hub);
    wheels.push(wheel);
  }
  return {
    obj: g,
    roll(distance) {
      const spin = distance / (0.11 * scale);
      for (const wheel of wheels) wheel.rotation.y = spin;
    },
  };
}

function buildBike(ctx) {
  const { THREE, mesh, mat, group } = ctx;
  const g = group();
  const frame = mat({ color: 0xd24b4b, roughness: 0.35, metalness: 0.3 });
  const dark = mat({ color: 0x1b2126, roughness: 0.55 });
  const bar = mesh(new THREE.BoxGeometry(0.7, 0.06, 0.08), frame);
  bar.position.y = 0.34;
  g.add(bar);
  const tank = mesh(new THREE.BoxGeometry(0.28, 0.14, 0.16), frame);
  tank.position.set(0.02, 0.46, 0);
  g.add(tank);
  const wheels = [];
  const geo = new THREE.CylinderGeometry(0.14, 0.14, 0.06, 14);
  for (const x of [-0.34, 0.34]) {
    const hub = new THREE.Group();
    hub.rotation.x = Math.PI / 2;
    hub.position.set(x, 0.14, 0);
    const wheel = mesh(geo, dark);
    hub.add(wheel);
    g.add(hub);
    wheels.push(wheel);
  }
  return {
    obj: g,
    roll(distance) {
      const spin = distance / 0.14;
      for (const wheel of wheels) wheel.rotation.y = spin;
    },
  };
}

function buildRunner(ctx, shirt) {
  const { THREE, mesh, mat, group } = ctx;
  const g = group();
  const cloth = mat({ color: shirt, roughness: 0.62 });
  const skin = mat({ color: 0xe2b394, roughness: 0.7 });
  const torso = mesh(new THREE.BoxGeometry(0.2, 0.32, 0.14), cloth);
  torso.position.y = 0.58;
  g.add(torso);
  const head = mesh(new THREE.SphereGeometry(0.09, 14, 12), skin);
  head.position.y = 0.84;
  g.add(head);
  const legs = [-0.05, 0.05].map((z) => {
    const leg = mesh(new THREE.BoxGeometry(0.07, 0.3, 0.07), cloth);
    leg.position.set(0, 0.22, z);
    g.add(leg);
    return leg;
  });
  return {
    obj: g,
    step(time, moving) {
      const swing = moving ? Math.sin(time * 11) * 0.55 : 0;
      legs[0].rotation.z = swing;
      legs[1].rotation.z = -swing;
    },
  };
}

function buildAnimal(ctx, kind) {
  const { THREE, mesh, mat, group, rod } = ctx;
  const g = group();
  const tiger = kind === "tiger";
  const fur = mat({ color: tiger ? 0xe07a2f : 0xc4a574, roughness: 0.72 });
  const dark = mat({ color: tiger ? 0x2a2118 : 0x6b4b2a, roughness: 0.7 });
  const body = mesh(new THREE.BoxGeometry(tiger ? 0.78 : 0.62, 0.26, 0.24), fur);
  body.position.set(0, tiger ? 0.42 : 0.5, 0);
  g.add(body);
  const head = mesh(new THREE.BoxGeometry(0.22, 0.18, 0.18), fur);
  head.position.set(tiger ? 0.48 : 0.4, tiger ? 0.56 : 0.68, 0);
  g.add(head);
  if (tiger) {
    for (const x of [-0.2, 0, 0.18]) {
      const stripe = mesh(new THREE.BoxGeometry(0.05, 0.27, 0.25), dark, false);
      stripe.position.set(x, 0.42, 0);
      g.add(stripe);
    }
    const tail = rod(0.03, 0xe07a2f);
    ctx.span(tail, ctx.vec(-0.4, 0.46, 0), ctx.vec(-0.78, 0.36, 0));
    g.add(tail);
  } else {
    const antler = rod(0.015, 0x6b4b2a);
    ctx.span(antler, ctx.vec(0.4, 0.76, 0), ctx.vec(0.28, 0.98, 0.08));
    g.add(antler);
    const antlerB = rod(0.015, 0x6b4b2a);
    ctx.span(antlerB, ctx.vec(0.4, 0.76, 0), ctx.vec(0.28, 0.98, -0.08));
    g.add(antlerB);
  }
  for (const [x, z] of [
    [0.22, 0.08],
    [0.22, -0.08],
    [-0.22, 0.08],
    [-0.22, -0.08],
  ]) {
    const leg = mesh(new THREE.BoxGeometry(0.06, tiger ? 0.28 : 0.36, 0.06), dark);
    leg.position.set(x, tiger ? 0.14 : 0.18, z);
    g.add(leg);
  }
  g.scale.setScalar(1.45);
  return g;
}

function question(q, formula, solve) {
  return { q, formula, solve };
}

const motion = {
  chapter: "motion",
  chapterNo: "২",
  chapterName: "গতি",
  spin: false,
};

export const motionLabScenes = [
  {
    ...motion,
    id: "chase-tiger",
    title: "বাঘ ও হরিণের দৌড়",
    blurb: "বাঁকা পথে দূরত্ব, সোজা ছুটে সরণ।",
    keywords: "tiger deer distance displacement speed velocity acceleration বাঘ হরিণ দূরত্ব সরণ দ্রুতি বেগ ত্বরণ",
    formula: "দ্রুতি = দূরত্ব/t ,   বেগ = সরণ/t",
    verbal: "হরিণের দ্রুতি ৫ m/s, ত্বরণ শূন্য। বাঘ স্থির থেকে ২ m/s² ত্বরণে সোজা ছোটে।",
    proof: "হরিণ ২০ মিটার পূর্বে, তারপর ১০ মিটার উত্তরে। বাঘ শুরু থেকে শেষ বিন্দু পর্যন্ত সোজা যায়।",
    note: "দূরত্ব পথের পুরো দৈর্ঘ্য। সরণ শুধু শুরু ও শেষ। তাই হরিণের দ্রুতি তার বেগের মানের চেয়ে বড়। বাঘের বেগ প্রতি সেকেন্ডে ২ m/s করে বাড়ে, তাই তার ত্বরণ আছে।",
    duration: 9,
    steps: [
      { t: 0, title: "দুই পথ", body: "হরিণ কোণা ঘুরে পালায়। বাঘ সোজা ছোটে। হরিণের দ্রুতি স্থির, তাই তার ত্বরণ শূন্য।" },
      { t: 4, title: "সরণ খাটো", body: "হরিণ উত্তরে ঘুরলে দূরত্ব বাড়তে থাকে, সরণ শুরু-শেষের সরলরেখা। বাঘের দূরত্ব আর সরণ একই।" },
      { t: 6.2, title: "কে আগে", body: "বাঘ ছোট পথে ত্বরণ নিয়ে আগে পৌঁছায়। হরিণের মোট দূরত্ব ৩০ মি, সরণ ২২.৪ মি।" },
    ],
    questions: [
      question(
        "হরিণ ৬ সেকেন্ডে ৩০ মিটার পথ গেল। সরণ ২২.৪ মিটার। দ্রুতি ও বেগের মান কত?",
        "দ্রুতি = দূরত্ব/t , বেগ = সরণ/t",
        "দ্রুতি = ৩০/৬ = ৫ m/s। বেগের মান = ২২.৪/৬ = ৩.৭ m/s। দূরত্ব বড় বলে দ্রুতি বেগের চেয়ে বেশি।",
      ),
      question(
        "বাঘ স্থির থেকে ২ m/s² ত্বরণে ছোটে। ৪ সেকেন্ডে তার বেগ কত?",
        "v = u + at",
        "u = ০। v = ০ + ২×৪ = ৮ m/s। সরণ s = ½at² = ½×২×১৬ = ১৬ মিটার।",
      ),
    ],
    create(ctx) {
      const { mesh, mat, THREE, tag, arrow, shoot, vec } = ctx;
      ctx.frame([1.15, 4.35, 6.1], [0.15, 0.4, -0.2]);
      const field = mesh(new THREE.CircleGeometry(3.6, 40), mat({ color: 0x234233, roughness: 1 }));
      field.rotation.x = -Math.PI / 2;
      field.position.y = 0.012;
      const dust = mat({ color: 0xc4a574, roughness: 0.95 });
      const east = mesh(new THREE.BoxGeometry(4.05, 0.04, 0.55), dust);
      east.position.set(0, 0.05, -1);
      const north = mesh(new THREE.BoxGeometry(0.55, 0.04, 2.05), dust);
      north.position.set(2, 0.05, 0);
      const deer = buildAnimal(ctx, "deer");
      const tiger = buildAnimal(ctx, "tiger");
      const deerTag = tag("হরিণ", 0, 1.15, 0);
      const tigerTag = tag("বাঘ", 0, 1.15, 0);
      const card = banner(ctx, -1.2, 1.85, -1.15);
      const deerVel = arrow(0x3cbe74);
      const tigerAcc = arrow(0xe25b45);
      const M = 5;
      const arrive = Math.sqrt(22.36);

      function deerAt(t) {
        const travel = Math.min(30, 5 * Math.max(t, 0));
        if (travel <= 20) return { x: -2 + (travel / 20) * 4, z: -1, dist: travel, dx: 1, dz: 0 };
        const northM = travel - 20;
        return { x: 2, z: -1 + (northM / 10) * 2, dist: travel, dx: 0, dz: 1 };
      }

      return {
        update(t) {
          const deerP = deerAt(t);
          deer.position.set(deerP.x, 0, deerP.z);
          face(deer, deerP.dx, deerP.dz);
          deerTag.position.set(deerP.x, 1.2, deerP.z);
          const sx = deerP.x + 2;
          const sz = deerP.z + 1;
          const disp = Math.hypot(sx, sz) * M;
          const speed = t < 6 ? 5 : 0;
          const avgVel = t > 0.05 ? disp / Math.min(t, 6) : 0;
          shoot(deerVel, vec(deerP.x, 1.25, deerP.z), vec(deerP.dx * 0.85, 0, deerP.dz * 0.85));

          const ts = t >= arrive ? 22.36 : t * t;
          const u = ts / 22.36;
          const tx = -2 + 4 * u;
          const tz = -1 + 2 * u;
          tiger.position.set(tx, 0, tz);
          face(tiger, 4, 2);
          tigerTag.position.set(tx, 1.15, tz);
          const tv = t >= arrive ? 0 : 2 * t;
          const ta = t >= arrive ? 0 : 2;
          shoot(tigerAcc, vec(tx, 1.35, tz), vec((4 / 4.472) * (ta > 0 ? 0.9 : 0), 0, (2 / 4.472) * (ta > 0 ? 0.9 : 0)));
          card.set(
            `সময় ${n(t, 1)} সে\nহরিণ  দূরত্ব ${n(deerP.dist, 1)} মি   সরণ ${n(disp, 1)} মি\nদ্রুতি ${n(speed, 1)} m/s   গড় বেগ ${n(avgVel, 1)} m/s   ত্বরণ ০\nবাঘ  দূরত্ব = সরণ ${n(ts, 1)} মি\nবেগ ${n(tv, 1)} m/s   ত্বরণ ${n(ta, 1)} m/s²`,
          );
        },
      };
    },
  },
  {
    ...motion,
    id: "traffic-pace",
    title: "গাড়ি ও মোটরসাইকেল",
    blurb: "সোজা সমদ্রুতি, ফিরে আসায় গড় বেগ কমে।",
    keywords: "uniform nonuniform average speed velocity গাড়ি মোটরসাইকেল সমদ্রুতি অসমদ্রুতি গড় দ্রুতি গড় বেগ",
    formula: "গড় দ্রুতি = মোট দূরত্ব/t ,   গড় বেগ = সরণ/t",
    verbal: "গাড়ি ১০ সেকেন্ড সোজা ১০ m/s। বাইক ৫ সেকেন্ড ১৬ m/s পূর্বে, তারপর ৫ সেকেন্ড ৬ m/s পশ্চিমে।",
    proof: "গাড়ির দূরত্ব ও সরণ দুটোই ১০০ মিটার। বাইকের দূরত্ব ১১০ মিটার, সরণ মাত্র ৫০ মিটার পূর্ব।",
    note: "সমদ্রুতিতে সমান সময়ে সমান পথ। দিক না বদলালে সমবেগও হয়। দিক বদলালে দ্রুতি থাকলেও বেগ বদলায়, আর গড় দ্রুতি গড় বেগের চেয়ে বড় হয়।",
    duration: 10,
    steps: [
      { t: 0, title: "সমদ্রুতি", body: "নীল গাড়ি প্রতি সেকেন্ডে ১০ মিটার। দূরত্ব আর সরণ একসাথে বাড়ে।" },
      { t: 5, title: "দিক বদল", body: "লাল বাইক ফিরে আসে। দূরত্ব বাড়তে থাকে, সরণ কমে।" },
      { t: 9.2, title: "গড়", body: "১০ সেকেন্ডে গাড়ির গড় দ্রুতি = গড় বেগ = ১০ m/s। বাইকের গড় দ্রুতি ১১, গড় বেগ ৫ m/s।" },
    ],
    questions: [
      question(
        "গাড়ি ১০ সেকেন্ডে সোজা ১০০ মিটার গেল। গড় দ্রুতি ও গড় বেগ কত?",
        "গড় দ্রুতি = দূরত্ব/t , গড় বেগ = সরণ/t",
        "দূরত্ব = সরণ = ১০০ মি। দুটোই ১০০/১০ = ১০ m/s। দিক একই ছিল বলে সমান।",
      ),
      question(
        "বাইক ৮০ মিটার পূর্বে, তারপর ৩০ মিটার পশ্চিমে গেল। সময় ১০ সেকেন্ড। গড় দ্রুতি ও গড় বেগ?",
        "দূরত্ব = ৮০+৩০ , সরণ = ৮০−৩০",
        "দূরত্ব ১১০ মি, গড় দ্রুতি ১১ m/s। সরণ ৫০ মি পূর্ব, গড় বেগ ৫ m/s পূর্ব।",
      ),
    ],
    create(ctx) {
      const { tag } = ctx;
      ctx.frame([0, 3.05, 6.3], [0, 0.42, 0]);
      road(ctx, 7.2, 0);
      const car = buildCar(ctx, 0x3a67d6, 1);
      const bike = buildBike(ctx);
      const carTag = tag("গাড়ি", 0, 1.15, -0.55);
      const bikeTag = tag("বাইক", 0, 1.15, 0.55);
      const card = banner(ctx, 0, 2.05, -1.2);
      return {
        update(t) {
          const ct = Math.min(t, 10);
          const cx = -2.5 + 0.5 * ct;
          car.obj.position.set(cx, 0, -0.42);
          car.roll(cx + 2.5);
          carTag.position.set(cx, 1.15, -0.42);
          let bx;
          let bikeDist;
          if (t <= 5) {
            bx = -2.5 + 0.8 * t;
            bikeDist = 16 * t;
          } else {
            const dt = Math.min(t, 10) - 5;
            bx = 1.5 - 0.3 * dt;
            bikeDist = 80 + 6 * dt;
          }
          const goingBack = t > 5 && t < 10;
          bike.obj.position.set(bx, 0, 0.42);
          face(bike.obj, goingBack ? -1 : 1, 0);
          bike.roll(bikeDist / 20);
          bikeTag.position.set(bx, 1.2, 0.42);
          const carDist = 10 * ct;
          const bikeDisp = (bx + 2.5) * 20;
          const avgT = Math.max(t, 0.001);
          card.set(
            `সময় ${n(ct, 1)} সে\nগাড়ি  দূরত্ব = সরণ ${n(carDist, 0)} মি\nগড় দ্রুতি = গড় বেগ ${n(carDist / avgT, 1)} m/s\nবাইক  দূরত্ব ${n(bikeDist, 0)} মি   সরণ ${n(Math.max(bikeDisp, 0), 0)} মি\nগড় দ্রুতি ${n(bikeDist / avgT, 1)}   গড় বেগ ${n(Math.max(bikeDisp, 0) / avgT, 1)} m/s`,
          );
        },
      };
    },
  },
  {
    ...motion,
    id: "sprint-race",
    title: "দৌড় প্রতিযোগিতা",
    blurb: "একই ১০০ মিটারে সময় আলাদা, বেগ আলাদা।",
    keywords: "race runners distance time velocity দৌড় প্রতিযোগিতা দূরত্ব সময় বেগ",
    formula: "v = s/t",
    verbal: "লাল দৌড়বিদ ১০ m/s, নীল ৮ m/s। ট্র্যাক ১০০ মিটার।",
    proof: "বেগ বেশি হলে একই পথ কম সময়ে শেষ হয়। ১০ সেকেন্ডে লাল ফিনিশে, নীল তখনও ৮০ মিটারে।",
    note: "দূরত্ব সমান হলে যে বেশি বেগে ছোটে সে কম সময় নেয়। t = s/v। লালের সময় ১০০/১০ = ১০ সে, নীলের ১০০/৮ = ১২.৫ সে।",
    duration: 13,
    steps: [
      { t: 0, title: "একসাথে শুরু", body: "দুজনেই ১০০ মিটারের দৌড়। লালের বেগ বেশি, তাই ফাঁক বাড়তে থাকে।" },
      { t: 10, title: "লাল ফিনিশ", body: "১০ সেকেন্ডে লাল ১০০ মিটার শেষ করে। নীল তখন ৮০ মিটার।" },
      { t: 12.5, title: "নীল ফিনিশ", body: "নীল আরও ২.৫ সেকেন্ড নিয়ে শেষ করে। সময়ের পার্থক্য ২.৫ সেকেন্ড।" },
    ],
    questions: [
      question(
        "১০০ মিটার দৌড়ে লালের বেগ ১০ m/s, নীলের ৮ m/s। কে কত সময়ে শেষ করে?",
        "t = s/v",
        "লাল: ১০০/১০ = ১০ সেকেন্ড। নীল: ১০০/৮ = ১২.৫ সেকেন্ড। নীল ২.৫ সেকেন্ড বেশি নেয়।",
      ),
      question(
        "১০ সেকেন্ডে দুজনের অতিক্রান্ত দূরত্ব কত?",
        "s = vt",
        "লাল: ১০×১০ = ১০০ মিটার। নীল: ৮×১০ = ৮০ মিটার। বাকি ২০ মিটার।",
      ),
    ],
    create(ctx) {
      const { mesh, mat, THREE, tag, line } = ctx;
      ctx.frame([0, 2.85, 6.0], [0, 0.5, 0]);
      road(ctx, 6.4, 0);
      const finish = line(0xf4efe4, false);
      finish.userData.set(2, 0.1, -0.7, 2, 1.3, -0.7);
      const finishB = line(0xf4efe4, false);
      finishB.userData.set(2, 0.1, 0.7, 2, 1.3, 0.7);
      const tape = mesh(new THREE.BoxGeometry(0.04, 0.04, 1.3), mat({ color: 0xf4efe4 }));
      tape.position.set(2, 0.85, 0);
      tag("১০০ মি", 2, 1.45, 0);
      const red = buildRunner(ctx, 0xd24b4b);
      const blue = buildRunner(ctx, 0x3a67d6);
      red.obj.scale.setScalar(1.25);
      blue.obj.scale.setScalar(1.25);
      const redTag = tag("লাল", 0, 1.25, 0);
      const blueTag = tag("নীল", 0, 1.25, 0);
      const card = banner(ctx, 0, 2.15, -1.15);
      return {
        update(t) {
          const redS = Math.min(100, 10 * t);
          const blueS = Math.min(100, 8 * t);
          const rx = -2 + (redS / 100) * 4;
          const bx = -2 + (blueS / 100) * 4;
          red.obj.position.set(rx, 0, -0.32);
          blue.obj.position.set(bx, 0, 0.32);
          red.step(t, redS < 100);
          blue.step(t, blueS < 100);
          redTag.position.set(rx, 1.25, -0.32);
          blueTag.position.set(bx, 1.25, 0.32);
          card.set(
            `সময় ${n(Math.min(t, 12.5), 1)} সে\nলাল  দূরত্ব ${n(redS, 0)} মি   বেগ ১০ m/s   সময় ১০ সে\nনীল  দূরত্ব ${n(blueS, 0)} মি   বেগ ৮ m/s   সময় ১২.৫ সে\nপার্থক্য  দূরত্ব ${n(redS - blueS, 0)} মি   সময় ২.৫ সে`,
          );
        },
      };
    },
  },
  {
    ...motion,
    id: "car-brake",
    title: "চলন্ত গাড়ির ব্রেক",
    blurb: "২০ m/s থেকে ব্রেক, মন্দন ৪ m/s²।",
    keywords: "brake acceleration deceleration velocity গাড়ি ব্রেক ত্বরণ মন্দন বেগ",
    formula: "v = u + at ,   s = ut + ½at²",
    verbal: "প্রথম ৩ সেকেন্ড বেগ ২০ m/s। তারপর ব্রেক, মন্দন ৪ m/s²। ৫ সেকেন্ডে থামে।",
    proof: "ব্রেকের সময় বেগ কমে। ০ = ২০ − ৪t দিলে t = ৫ সে। এই সময়ে পথ ৫০ মিটার।",
    note: "মন্দন ঋণাত্মক ত্বরণ — বেগের বিপরীত দিকে। বেগ কমলেও গাড়ি সামনেই যায়, যতক্ষণ না বেগ শূন্য হয়।",
    duration: 10,
    steps: [
      { t: 0, title: "সমবেগ", body: "ব্রেকের আগে ত্বরণ শূন্য। বেগ ২০ m/s থেকে বদলায় না। ৩ সেকেন্ডে ৬০ মিটার।" },
      { t: 3, title: "ব্রেক", body: "মন্দন ৪ m/s²। বেগের তীর ছোট হতে থাকে। গাড়ি সামনে চলে, বেগ কমে।" },
      { t: 8, title: "থামল", body: "বেগ শূন্য। ব্রেকের পথ ৫০ মিটার। মোট পথ ১১০ মিটার।" },
    ],
    questions: [
      question(
        "২০ m/s বেগে চলতে ব্রেক কষলে মন্দন ৪ m/s²। থামতে কত সময়?",
        "v = u + at",
        "০ = ২০ + (−৪)t। ৪t = ২০। t = ৫ সেকেন্ড।",
      ),
      question(
        "ওই ৫ সেকেন্ডে গাড়ি কত দূর যায়?",
        "s = ut + ½at²",
        "s = ২০×৫ + ½×(−৪)×২৫ = ১০০ − ৫০ = ৫০ মিটার।",
      ),
    ],
    create(ctx) {
      const { tag, arrow, shoot, vec } = ctx;
      ctx.frame([0.25, 3.15, 7.5], [0.4, 0.4, 0]);
      road(ctx, 7.4, 0);
      const car = buildCar(ctx, 0xd7dee6, 1.05);
      const name = tag("গাড়ি", 0, 1.2, 0);
      const card = banner(ctx, 0, 2.05, -1.15);
      const vel = arrow(0x3cbe74);
      const acc = arrow(0xe25b45);
      return {
        update(t) {
          const clock = Math.min(t, 8);
          let s;
          let v;
          let a;
          if (clock <= 3) {
            s = 20 * clock;
            v = 20;
            a = 0;
          } else if (clock < 8) {
            const dt = clock - 3;
            v = 20 - 4 * dt;
            a = -4;
            s = 60 + 20 * dt - 2 * dt * dt;
          } else {
            s = 110;
            v = 0;
            a = 0;
          }
          const x = -2.8 + s / 20;
          car.obj.position.set(x, 0, 0);
          car.roll(s / 20);
          name.position.set(x, 1.25, 0);
          shoot(vel, vec(x, 0.85, 0), vec(v / 28, 0, 0));
          shoot(acc, vec(x, 0.55, 0.55), vec(a / 10, 0, 0));
          card.set(
            `সময় ${n(clock, 1)} সে\nদূরত্ব ${n(s, 0)} মি   সরণ ${n(s, 0)} মি\nবেগ ${n(v, 1)} m/s\nত্বরণ ${n(a, 1)} m/s²`,
          );
        },
      };
    },
  },
  {
    ...motion,
    id: "cliff-fall",
    title: "উঁচু স্থান থেকে পড়া",
    blurb: "৪৫ মিটার, g = ১০ m/s², ৩ সেকেন্ডে ভূমি।",
    keywords: "freefall gravity cliff g অভিকর্ষজ ত্বরণ মুক্তপতন উঁচু",
    formula: "s = ½gt² ,   v = gt",
    verbal: "স্থির থেকে ছাড়া। g = ১০ m/s²। ৪৫ মিটার নামতে ৩ সেকেন্ড, ভূমিতে বেগ ৩০ m/s।",
    proof: "মুক্তপতনে ত্বরণ স্থির g। বেগ সময়ের সাথে বাড়ে, নামার পথ সময়ের বর্গের সাথে।",
    note: "পাঠের হিসাব g = ১০ m/s²। ৪৫ মিটার উচ্চতায় t = √(2h/g) = ৩ সেকেন্ড।",
    duration: 6,
    steps: [
      { t: 0, title: "ছেড়ে দেওয়া", body: "ধরা থাকা অবস্থায় বেগ শূন্য, ত্বরণ শূন্য। হাত ছাড়লে নিচের দিকে ত্বরণ ১০ m/s²।" },
      { t: 0.8, title: "নামছে", body: "প্রতি সেকেন্ডে বেগ ১০ m/s করে বাড়ে। পথ ½gt²।" },
      { t: 3.8, title: "ভূমি", body: "৩ সেকেন্ডে ৪৫ মিটার। ভূমিতে পৌঁছানোর ঠিক আগে বেগ ৩০ m/s।" },
    ],
    questions: [
      question(
        "৪৫ মিটার উঁচু থেকে স্থির বস্তু ছাড়া হলো। g = ১০ m/s²। কতক্ষণে মাটি?",
        "h = ½gt²",
        "৪৫ = ½×১০×t²। t² = ৯। t = ৩ সেকেন্ড।",
      ),
      question(
        "মাটিতে পৌঁছানোর ঠিক আগে বেগ কত?",
        "v = gt",
        "v = ১০×৩ = ৩০ m/s। v² = u² + ২gh = ০ + ২×১০×৪৫ = ৯০০। v = ৩০ m/s।",
      ),
    ],
    create(ctx) {
      const { THREE, mesh, mat, tag } = ctx;
      ctx.frame([1.7, 2.7, 6.5], [-0.15, 1.55, 0]);
      const stone = mat({ color: 0x8d97a0, roughness: 0.8 });
      const tower = mesh(new THREE.BoxGeometry(1.1, 4.2, 1.1), stone);
      tower.position.set(-1.35, 2.1, 0);
      const glassMat = mat({ color: 0xc5e4ee, roughness: 0.15, transparent: true, opacity: 0.45 });
      for (let i = 0; i < 4; i += 1) {
        const window = mesh(new THREE.BoxGeometry(0.28, 0.36, 0.06), glassMat, false);
        window.position.set(-0.78, 0.7 + i * 0.85, 0.28);
      }
      const ledge = mesh(new THREE.BoxGeometry(0.7, 0.1, 0.7), mat({ color: 0xc4925a, roughness: 0.7 }));
      ledge.position.set(0.15, 4.25, 0);
      const ball = mesh(new THREE.SphereGeometry(0.16, 24, 18), mat({ color: 0xf0c36a, roughness: 0.35 }));
      const name = tag("বস্তু", 0.4, 4.7, 0);
      const card = banner(ctx, 1.3, 3.35, 0);
      return {
        update(t) {
          const fall = Math.max(0, t - 0.8);
          const dropped = Math.min(45, 5 * fall * fall);
          const y = 0.16 + (45 - dropped) / 10;
          const held = t < 0.8;
          const landed = dropped >= 44.95;
          const speed = held ? 0 : landed ? 30 : 10 * fall;
          ball.position.set(0.45, Math.max(0.16, y), 0);
          name.position.set(0.45, ball.position.y + 0.45, 0);
          const accel = held || landed ? "০" : "১০ m/s² নিচে";
          card.set(
            `সময় ${n(held ? 0 : fall, 1)} সে\nনামা ${n(dropped, 1)} মি   বাকি ${n(Math.max(45 - dropped, 0), 1)} মি\nবেগ ${n(speed, 1)} m/s${landed ? " (ভূমির আগে)" : ""}\nত্বরণ ${accel}`,
          );
        },
      };
    },
  },
  {
    ...motion,
    id: "slope-car",
    title: "ঢালু রাস্তায় গাড়ি",
    blurb: "৩০° ঢালে নামার ত্বরণ, তারপর ব্রেকের মন্দন।",
    keywords: "incline slope acceleration deceleration ঢাল ত্বরণ মন্দন g sin",
    formula: "a = g sinθ",
    verbal: "g = ১০ m/s², θ = ৩০°। নামার ত্বরণ ৫ m/s²। ২ সেকেন্ড পর মন্দন ২.৫ m/s²।",
    proof: "স্থির থেকে ২ সেকেন্ডে বেগ ১০ m/s, পথ ১০ মিটার। তারপর ৪ সেকেন্ডে থেমে আরও ২০ মিটার।",
    note: "ঘর্ষণ না ধরলে ঢাল বরাবর ত্বরণ g sinθ। ৩০°-এ sinθ = ১/২, তাই a = ৫ m/s²। ব্রেক কষলে ত্বরণ উল্টে মন্দন হয়।",
    duration: 8,
    steps: [
      { t: 0, title: "নামা শুরু", body: "গাড়ি স্থির। ঢাল বরাবর ত্বরণ ৫ m/s², নিচের দিকে।" },
      { t: 2, title: "ব্রেক", body: "বেগ ১০ m/s। এখন মন্দন ২.৫ m/s²। বেগ কমতে থাকে, গাড়ি তখনও নামছে।" },
      { t: 6, title: "থামল", body: "আরও ২০ মিটার গিয়ে থামে। মোট পথ ৩০ মিটার।" },
    ],
    questions: [
      question(
        "৩০° ঢাল, g = ১০ m/s²। ঘর্ষণ না থাকলে নামার ত্বরণ কত?",
        "a = g sinθ",
        "sin৩০° = ১/২। a = ১০×১/২ = ৫ m/s²।",
      ),
      question(
        "১০ m/s বেগে ২.৫ m/s² মন্দন শুরু হলো। থামতে কত পথ?",
        "v² = u² + 2as",
        "০ = ১০০ + ২×(−২.৫)×s। ৫s = ১০০। s = ২০ মিটার। সময় ৪ সেকেন্ড।",
      ),
    ],
    create(ctx) {
      const { THREE, mesh, mat, tag } = ctx;
      ctx.frame([0.45, 2.55, 5.9], [0, 1.0, 0]);
      const ramp = mesh(new THREE.BoxGeometry(4.6, 0.12, 1.35), mat({ color: 0x3a4348, roughness: 0.9 }));
      ramp.rotation.z = -Math.PI / 6;
      ramp.position.y = 1.15;
      const pier = mesh(new THREE.BoxGeometry(0.28, 1.5, 1.2), mat({ color: 0x8d97a0, roughness: 0.8 }));
      pier.position.set(-1.7, 0.75, 0);
      const car = buildCar(ctx, 0xf0c36a, 0.85);
      const name = tag("৩০°", -1.9, 2.15, 0);
      const card = banner(ctx, 0.2, 2.55, 0);
      const axis = -Math.PI / 6;
      return {
        update(t) {
          const clock = Math.min(t, 6);
          let s;
          let v;
          let a;
          if (clock <= 2) {
            a = 5;
            v = 5 * clock;
            s = 2.5 * clock * clock;
          } else {
            const dt = clock - 2;
            a = clock >= 6 ? 0 : -2.5;
            v = Math.max(0, 10 - 2.5 * dt);
            s = 10 + 10 * dt - 1.25 * dt * dt;
          }
          const along = -1.55 + s / 10;
          const x = Math.cos(axis) * along;
          const y = 1.15 + Math.sin(axis) * along;
          car.obj.position.set(x + 0.05, y + 0.16, 0);
          car.obj.rotation.z = axis;
          car.roll(s / 10);
          name.position.set(x, y + 0.7, 0);
          card.set(
            `সময় ${n(clock, 1)} সে    θ = ৩০°\nপথ ${n(s, 1)} মি\nবেগ ${n(v, 1)} m/s\nত্বরণ ${n(a, 1)} m/s²`,
          );
        },
      };
    },
  },
  {
    ...motion,
    id: "oval-run",
    title: "গোল ট্র্যাকে দৌড়",
    blurb: "এক চক্করে দূরত্ব ১২৫.৭ মি, সরণ শূন্য।",
    keywords: "circular track distance displacement বৃত্ত দূরত্ব সরণ চক্কর",
    formula: "দূরত্ব = vt ,   এক চক্কর = 2πr",
    verbal: "ব্যাসার্ধ ২০ মিটার, দ্রুতি ৮ m/s। অর্ধচক্করে সরণ ব্যাস ৪০ মিটার।",
    proof: "দূরত্ব চাপের দৈর্ঘ্য। সরণ জ্যা। শুরুতে ফিরে এলে সরণ শূন্য, দূরত্ব পুরো পরিধি।",
    note: "বৃত্তাকার পথে দ্রুতি স্থির থাকলেও দিক বদলায়, তাই বেগ বদলায়। দূরত্ব কখনো সরণের চেয়ে ছোট নয়। পূর্ণ চক্করে সরণ শূন্য।",
    duration: 16,
    steps: [
      { t: 0, title: "শুরু", body: "দৌড়বিদ ৮ m/s দ্রুতিতে বৃত্তে ছোটে। ব্যাসার্ধ ২০ মিটার।" },
      { t: 7.85, title: "অর্ধচক্কর", body: "দূরত্ব πr ≈ ৬২.৮ মিটার। সরণ ব্যাস = ৪০ মিটার।" },
      { t: 15.7, title: "পুরো চক্কর", body: "দূরত্ব 2πr ≈ ১২৫.৭ মিটার। শুরুতে ফেরায় সরণ ০।" },
    ],
    questions: [
      question(
        "ব্যাসার্ধ ২০ মিটার। অর্ধচক্করে দূরত্ব ও সরণ কত?",
        "দূরত্ব = πr , সরণ = 2r",
        "দূরত্ব = ৩.১৪×২০ = ৬২.৮ মিটার। সরণ = ৪০ মিটার, শুরুর উল্টো প্রান্তে।",
      ),
      question(
        "এক পূর্ণ চক্কর শেষে সরণ কত? দূরত্ব কত?",
        "দূরত্ব = 2πr , সরণ = ০",
        "দূরত্ব = ২×৩.১৪×২০ = ১২৫.৬ মিটার। শুরু ও শেষ এক বিন্দু, তাই সরণ শূন্য।",
      ),
    ],
    create(ctx) {
      const { THREE, mesh, mat, tag, arrow, shoot, vec, poly } = ctx;
      ctx.frame([0.25, 5.1, 6.2], [0, 0.2, 0]);
      const ringGeo = new THREE.RingGeometry(1.78, 2.22, 72);
      ringGeo.rotateX(-Math.PI / 2);
      mesh(ringGeo, mat({ color: 0x2a3136, roughness: 0.92 }));
      const start = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 10), mat({ color: 0xf4efe4 }));
      start.position.set(2, 0.35, 0);
      tag("শুরু", 2.35, 0.9, 0);
      const runner = buildRunner(ctx, 0xf0c36a);
      const trail = poly(0xf2d48a, 80);
      const disp = arrow(0x7d8cf0);
      const card = banner(ctx, 0, 2.15, -0.7);
      const r = 20;
      const speed = 8;
      const omega = speed / r;
      return {
        update(t) {
          const clock = Math.min(t, (2 * Math.PI) / omega);
          const theta = omega * clock;
          const x = 2 * Math.cos(theta);
          const z = 2 * Math.sin(theta);
          runner.obj.position.set(x, 0, z);
          face(runner.obj, -Math.sin(theta), Math.cos(theta));
          runner.step(t, clock < 15.7);
          const pts = [];
          const steps = 64;
          for (let i = 0; i <= steps; i += 1) {
            const a = theta * (i / steps);
            pts.push([2 * Math.cos(a), 0.08, 2 * Math.sin(a)]);
          }
          stroke(trail, pts);
          const dx = x - 2;
          const dz = z;
          shoot(disp, vec(2, 0.35, 0), vec(dx, 0, dz));
          const distance = speed * clock;
          const displacement = 2 * r * Math.sin(Math.min(theta, 2 * Math.PI) / 2);
          const shown = theta >= 2 * Math.PI - 0.02 ? 0 : displacement;
          card.set(
            `সময় ${n(clock, 1)} সে\nদূরত্ব ${n(distance, 1)} মি\nসরণ ${n(shown, 1)} মি\nপার্থক্য ${n(distance - shown, 1)} মি`,
          );
        },
      };
    },
  },
  {
    ...motion,
    id: "vt-graph",
    title: "বেগ–সময় গ্রাফ",
    blurb: "সমবেগ আড়াআড়ি, ত্বরণ ওঠা, মন্দন নামা।",
    keywords: "velocity time graph acceleration deceleration বেগ সময় গ্রাফ সমবেগ ত্বরণ মন্দন",
    formula: "ত্বরণ = ঢাল ,   দূরত্ব = ক্ষেত্রফল",
    verbal: "০–৪ সে বেগ ১০। ৪–৮ সে বেগ ১০ থেকে ২০। ৮–১২ সে বেগ ২০ থেকে ০।",
    proof: "আড়াআড়ি রেখার ঢাল শূন্য, সমবেগ। ওঠার ঢাল ধনাত্মক ত্বরণ। নামার ঢাল মন্দন। ক্ষেত্রফল মোট পথ।",
    note: "সমবেগে ৪০ মি, ত্বরণে ৬০ মি, মন্দনে ৪০ মি। মোট ১৪০ মিটার। মন্দনের ত্বরণ (০−২০)/৪ = −৫ m/s²।",
    duration: 12,
    steps: [
      { t: 0, title: "সমবেগ", body: "গ্রাফ মাটির সমান্তরাল। ঢাল শূন্য, ত্বরণ শূন্য। বেগ ১০ m/s।" },
      { t: 4, title: "ত্বরণ", body: "রেখা ওপরে ওঠে। ঢাল (২০−১০)/৪ = ২.৫ m/s²।" },
      { t: 8, title: "মন্দন", body: "রেখা নিচে নামে। ঢাল (০−২০)/৪ = −৫ m/s²। ১২ সেকেন্ডে গাড়ি থামে।" },
    ],
    questions: [
      question(
        "প্রথম ৪ সেকেন্ড বেগ ১০ m/s। এই অংশের ক্ষেত্রফল কত পথ?",
        "s = v × t",
        "আয়তক্ষেত্রের ক্ষেত্রফল ১০×৪ = ৪০ মিটার।",
      ),
      question(
        "শেষ ৪ সেকেন্ডে বেগ ২০ m/s থেকে ০। ত্বরণ কত?",
        "a = (v − u)/t",
        "a = (০−২০)/৪ = −৫ m/s²। ঋণ চিহ্ন মন্দন। পথ = ½×২০×৪ = ৪০ মিটার।",
      ),
    ],
    create(ctx) {
      const { THREE, mesh, mat, line, poly, tag } = ctx;
      ctx.frame([0, 2.15, 6.9], [0, 1.15, -0.2]);
      const board = mesh(new THREE.PlaneGeometry(5.6, 2.5), mat({ color: 0x172026, roughness: 0.9 }));
      board.position.set(0, 1.85, -1.35);
      const axisX = line(0xf4efe4, false);
      axisX.userData.set(-2.35, 0.85, -1.22, 2.25, 0.85, -1.22);
      const axisY = line(0xf4efe4, false);
      axisY.userData.set(-2.35, 0.85, -1.22, -2.35, 2.75, -1.22);
      tag("সময়", 2.15, 0.62, -1.1);
      tag("বেগ", -2.7, 2.85, -1.1);
      tag("সমবেগ", -1.3, 1.55, -1.05);
      tag("ত্বরণ", 0.15, 2.15, -1.05);
      tag("মন্দন", 1.45, 1.7, -1.05);
      const graph = poly(0xf2d48a, 48);
      const dot = mesh(
        new THREE.SphereGeometry(0.07, 12, 10),
        mat({ color: 0xf2d48a, emissive: 0xf2d48a, emissiveIntensity: 0.4 }),
        false,
      );
      road(ctx, 6.4, 1.15);
      const car = buildCar(ctx, 0xd7dee6, 0.8);
      const card = banner(ctx, 0, 3.15, 0);

      function sample(t) {
        const clock = Math.min(t, 12);
        let v;
        let s;
        let a;
        if (clock <= 4) {
          v = 10;
          a = 0;
          s = 10 * clock;
        } else if (clock <= 8) {
          const dt = clock - 4;
          v = 10 + 2.5 * dt;
          a = 2.5;
          s = 40 + 10 * dt + 1.25 * dt * dt;
        } else {
          const dt = clock - 8;
          v = 20 - 5 * dt;
          a = -5;
          s = 100 + 20 * dt - 2.5 * dt * dt;
        }
        return { clock, v, s, a };
      }

      function point(time, speed) {
        return [-2.35 + (time / 12) * 4.3, 0.85 + (speed / 20) * 1.7, -1.16];
      }

      return {
        update(t) {
          const now = sample(t);
          const pts = [];
          const steps = 36;
          for (let i = 0; i <= steps; i += 1) pts.push(point((now.clock * i) / steps, sample((now.clock * i) / steps).v));
          stroke(graph, pts);
          const dotP = point(now.clock, now.v);
          dot.position.set(dotP[0], dotP[1], dotP[2]);
          const x = -2.8 + now.s / 25;
          car.obj.position.set(x, 0, 1.15);
          car.roll(now.s / 25);
          card.set(
            `সময় ${n(now.clock, 1)} সে\nবেগ ${n(now.v, 1)} m/s   ত্বরণ ${n(now.a, 1)} m/s²\nদূরত্ব ${n(now.s, 0)} মি\nক্ষেত্রফলই অতিক্রান্ত পথ`,
          );
        },
      };
    },
  },
  {
    ...motion,
    id: "st-graph",
    title: "সরণ–সময় গ্রাফ",
    blurb: "স্থির রেখা আড়াআড়ি, সমবেগ সোজা, ত্বরণ বাঁকা।",
    keywords: "displacement time graph stationary uniform acceleration সরণ সময় গ্রাফ স্থির",
    formula: "s = স্থির ,   s = vt ,   s = ½at²",
    verbal: "ধূসর স্থির। সবুজ ৪ m/s। লাল স্থির থেকে ১ m/s²। ৮ সেকেন্ডে সবুজ ও লাল ৩২ মিটারে মিলে।",
    proof: "স্থির বস্তুর সরণ বদলায় না। সমবেগে গ্রাফ সরল। ত্বরণে গ্রাফ বক্র, শুরুতে পিছিয়ে থেকে শেষে ধরে ফেলে।",
    note: "s–t গ্রাফের ঢাল বেগ। আড়াআড়ি রেখার ঢাল শূন্য, বেগ শূন্য। খাড়া ঢাল মানে বেশি বেগ। বাঁকা রেখা মানে বেগ বদলাচ্ছে।",
    duration: 8,
    steps: [
      { t: 0, title: "তিন রেখা", body: "ধূসর বস্তু নড়ে না। সবুজ সমান বেগে। লাল স্থির থেকে ত্বরণ পায়।" },
      { t: 4, title: "লাল পিছিয়ে", body: "৪ সেকেন্ডে সবুজ ১৬ মিটার, লাল মাত্র ৮ মিটার। লালের বেগ তখন সবুজের সমান, ৪ m/s।" },
      { t: 8, title: "ধরে ফেলল", body: "৮ সেকেন্ডে দুজনেই ৩২ মিটার। লালের বেগ তখন ৮ m/s, সবুজের এখনও ৪।" },
    ],
    questions: [
      question(
        "কোন রেখা স্থির বস্তুর? কেন?",
        "s = ধ্রুবক",
        "সময়-অক্ষের সমান্তরাল রেখা। সরণ বদলায় না, ঢাল শূন্য, বেগ শূন্য।",
      ),
      question(
        "৮ সেকেন্ডে সমবেগের বস্তু ও ত্বরণের বস্তু কোথায়?",
        "s = vt , s = ½at²",
        "সবুজ: ৪×৮ = ৩২ মিটার। লাল: ½×১×৬৪ = ৩২ মিটার। একই জায়গায় মিলে যায়।",
      ),
    ],
    create(ctx) {
      const { THREE, mesh, mat, line, poly, tag } = ctx;
      ctx.frame([0, 2.2, 7.0], [0, 1.2, -0.2]);
      const board = mesh(new THREE.PlaneGeometry(5.6, 2.5), mat({ color: 0x172026, roughness: 0.9 }));
      board.position.set(0, 1.9, -1.35);
      const axisX = line(0xf4efe4, false);
      axisX.userData.set(-2.35, 0.9, -1.22, 2.25, 0.9, -1.22);
      const axisY = line(0xf4efe4, false);
      axisY.userData.set(-2.35, 0.9, -1.22, -2.35, 2.8, -1.22);
      tag("সময়", 2.15, 0.66, -1.1);
      tag("সরণ", -2.75, 2.9, -1.1);
      const stillLine = poly(0xb7c2cc, 40);
      const uniformLine = poly(0x3cbe74, 40);
      const accelLine = poly(0xe25b45, 40);
      road(ctx, 6.2, 1.2);
      const still = mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), mat({ color: 0xb7c2cc, roughness: 0.7 }));
      still.position.set(-2, 0.24, 1.2);
      const walker = buildRunner(ctx, 0x3cbe74);
      const racer = buildBike(ctx);
      const card = banner(ctx, 0, 3.2, 0);
      tag("স্থির", -2, 0.7, 1.2);

      function point(time, distance, z) {
        return [-2.35 + (time / 8) * 4.2, 0.9 + (distance / 32) * 1.7, z];
      }

      return {
        update(t) {
          const clock = Math.min(t, 8);
          const uniform = 4 * clock;
          const accel = 0.5 * clock * clock;
          const stillPts = [];
          const uniPts = [];
          const accPts = [];
          for (let i = 0; i <= 32; i += 1) {
            const tt = (clock * i) / 32;
            stillPts.push(point(tt, 0, -1.18));
            uniPts.push(point(tt, 4 * tt, -1.16));
            accPts.push(point(tt, 0.5 * tt * tt, -1.14));
          }
          stroke(stillLine, stillPts);
          stroke(uniformLine, uniPts);
          stroke(accelLine, accPts);
          const ux = -2 + uniform / 8;
          const ax = -2 + accel / 8;
          walker.obj.position.set(ux, 0, 0.85);
          walker.step(t, true);
          racer.obj.position.set(ax, 0, 1.45);
          racer.roll(accel / 8);
          card.set(
            `সময় ${n(clock, 1)} সে\nস্থির  সরণ ০ মি   বেগ ০\nসবুজ  সরণ ${n(uniform, 1)} মি   বেগ ৪ m/s\nলাল  সরণ ${n(accel, 1)} মি   বেগ ${n(clock, 1)} m/s`,
          );
        },
      };
    },
  },
  {
    ...motion,
    id: "train-pass",
    title: "ট্রেন ও প্ল্যাটফর্ম",
    blurb: "প্ল্যাটফর্ম পার হতে ১০ সে, মানুষকে ৪ সে।",
    keywords: "train platform relative motion ট্রেন প্ল্যাটফর্ম আপেক্ষিক গতি অতিক্রম",
    formula: "t = (Lট্রেন + Lপ্ল্যাটফর্ম) / v",
    verbal: "ট্রেন ৮০ মিটার, প্ল্যাটফর্ম ১২০ মিটার, বেগ ২০ m/s।",
    proof: "প্ল্যাটফর্ম পার হতে ট্রেনের নাক থেকে লেজ পর্যন্ত পুরো দৈর্ঘ্য ছাড়াতে হয়। মানুষ এক বিন্দু, তাই শুধু ট্রেনের দৈর্ঘ্য।",
    note: "মাটি থেকে ট্রেনের বেগ ২০ m/s। ট্রেন থেকে দেখলে প্ল্যাটফর্ম উল্টো দিকে ২০ m/s। আপেক্ষিক বেগের মান একই, দিক উল্টো।",
    duration: 12,
    steps: [
      { t: 0, title: "প্ল্যাটফর্মের মুখ", body: "ট্রেনের সামনে প্ল্যাটফর্মের শুরুতে। বেগ ২০ m/s।" },
      { t: 3, title: "মানুষ", body: "প্ল্যাটফর্মের মাঝের মানুষকে পার হতে ট্রেনের নিজের দৈর্ঘ্যই যথেষ্ট। সময় ৮০/২০ = ৪ সে।" },
      { t: 10, title: "পার হলো", body: "প্ল্যাটফর্ম শেষ। সময় (৮০+১২০)/২০ = ১০ সে। ট্রেন থেকে প্ল্যাটফর্ম উল্টো দিকে সরে।" },
    ],
    questions: [
      question(
        "৮০ মিটার ট্রেন ২০ m/s বেগে ১২০ মিটার প্ল্যাটফর্ম পার হতে কত সময়?",
        "t = (৮০ + ১২০) / ২০",
        "মোট দৈর্ঘ্য ২০০ মিটার। সময় ২০০/২০ = ১০ সেকেন্ড।",
      ),
      question(
        "একই ট্রেন প্ল্যাটফর্মে দাঁড়ানো একজনকে পার হতে কত সময়?",
        "t = Lট্রেন / v",
        "মানুষ এক বিন্দু। সময় ৮০/২০ = ৪ সেকেন্ড।",
      ),
    ],
    create(ctx) {
      const { THREE, mesh, mat, tag, arrow, shoot, vec } = ctx;
      ctx.frame([0.2, 2.65, 6.7], [0.15, 0.5, 0]);
      road(ctx, 8.2, -0.35);
      const plat = mesh(new THREE.BoxGeometry(3, 0.18, 0.9), mat({ color: 0xc4925a, roughness: 0.75 }));
      plat.position.set(0, 0.16, 0.55);
      const roof = mesh(new THREE.BoxGeometry(2.4, 0.06, 0.7), mat({ color: 0x8d97a0, roughness: 0.5 }));
      roof.position.set(0, 1.35, 0.55);
      for (const x of [-1, 1]) {
        const post = mesh(new THREE.BoxGeometry(0.08, 1.15, 0.08), mat({ color: 0x667480 }));
        post.position.set(x, 0.75, 0.55);
      }
      const person = buildRunner(ctx, 0x3a67d6);
      person.obj.position.set(0, 0.2, 0.55);
      tag("মানুষ", 0, 1.55, 0.55);
      tag("প্ল্যাটফর্ম ১২০ মি", 0, 0.55, 1.15);
      const train = ctx.group();
      const locoMat = mat({ color: 0xd24b4b, roughness: 0.4, metalness: 0.2 });
      const coachMat = mat({ color: 0xd7dee6, roughness: 0.45, metalness: 0.15 });
      const loco = mesh(new THREE.BoxGeometry(0.62, 0.42, 0.38), locoMat);
      loco.position.set(-0.28, 0.4, 0);
      train.add(loco);
      const nose = mesh(new THREE.BoxGeometry(0.16, 0.22, 0.32), locoMat);
      nose.position.set(0.08, 0.28, 0);
      train.add(nose);
      for (const x of [-0.95, -1.55]) {
        const coach = mesh(new THREE.BoxGeometry(0.58, 0.4, 0.38), coachMat);
        coach.position.set(x, 0.4, 0);
        train.add(coach);
      }
      const rel = arrow(0xe2a63b);
      const card = banner(ctx, 0.2, 2.35, 0);
      return {
        update(t) {
          const clock = Math.min(t, 10);
          const noseX = -1.5 + 0.5 * clock;
          train.position.set(noseX, 0, -0.35);
          const passingPerson = t >= 3 && t < 7;
          const passed = t >= 10;
          if (passed) shoot(rel, vec(0.2, 0.7, 0.55), vec(-1.1, 0, 0));
          else shoot(rel, vec(0, 0, 0), vec(0, 0, 0));
          card.set(
            `সময় ${n(clock, 1)} সে\nবেগ ২০ m/s   অতিক্রান্ত ${n(20 * clock, 0)} মি\nমানুষ ${passingPerson ? "পার হচ্ছে" : t >= 7 ? "পার হয়েছে · ৪ সে" : "সামনে"}\nপ্ল্যাটফর্ম ${passed ? "পার হয়েছে · ১০ সে" : `বাকি ${n(10 - clock, 1)} সে`}`,
          );
        },
      };
    },
  },
];
