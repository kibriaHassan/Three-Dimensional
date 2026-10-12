function ask(q, formula, solve) {
  return { q, formula, solve };
}

const law = {
  chapter: "force",
  chapterNo: "৩",
  chapterName: "বল",
  autoProof: true,
  spin: false,
};

function disc(ctx, color, radius) {
  const g = ctx.group();
  const body = ctx.mesh(
    new ctx.THREE.CylinderGeometry(radius, radius, 0.1, 32),
    ctx.mat({ color, metalness: 0.55, roughness: 0.24 })
  );
  body.position.y = 0.05;
  g.add(body);
  const ring = ctx.mesh(
    new ctx.THREE.TorusGeometry(radius * 0.62, 0.014, 8, 28),
    ctx.mat({ color: 0xf6f1e6, metalness: 0.35, roughness: 0.32 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.108;
  g.add(ring);
  return g;
}

function labCart(ctx, color, scale, blocks) {
  const g = ctx.group();
  const { THREE, mesh, mat, C } = ctx;
  const body = mesh(
    new THREE.BoxGeometry(0.92 * scale, 0.24 * scale, 0.48 * scale),
    mat({ color, roughness: 0.36, metalness: 0.12 })
  );
  body.position.y = 0.2 * scale;
  g.add(body);
  const lip = mesh(
    new THREE.BoxGeometry(0.96 * scale, 0.045 * scale, 0.52 * scale),
    mat({ color: 0xf4efe4, roughness: 0.42 })
  );
  lip.position.y = 0.33 * scale;
  g.add(lip);
  const rubber = mat({ color: C.rubber, roughness: 0.88 });
  const geo = new THREE.CylinderGeometry(0.11 * scale, 0.11 * scale, 0.07 * scale, 16);
  for (const x of [-0.3, 0.3]) {
    for (const z of [-0.2, 0.2]) {
      const wheel = mesh(geo, rubber);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x * scale, 0.11 * scale, z * scale);
      g.add(wheel);
    }
  }
  for (let i = 0; i < blocks; i += 1) {
    const block = mesh(
      new THREE.BoxGeometry(0.38 * scale, 0.12, 0.3 * scale),
      mat({ color: i % 2 ? 0x6e7c8a : 0x8d6840, roughness: 0.72 })
    );
    block.position.set(0, 0.4 * scale + i * 0.13, 0);
    g.add(block);
  }
  return g;
}

function springMesh(ctx) {
  const pts = [];
  for (let i = 0; i <= 72; i += 1) {
    const u = i / 72;
    const a = u * 7 * Math.PI * 2;
    pts.push(new ctx.THREE.Vector3((u - 0.5) * 0.86, Math.cos(a) * 0.11, Math.sin(a) * 0.11));
  }
  return ctx.mesh(
    new ctx.THREE.TubeGeometry(new ctx.THREE.CatmullRomCurve3(pts), 110, 0.02, 7, false),
    ctx.mat({ color: ctx.C.metal, metalness: 0.72, roughness: 0.24 })
  );
}

export const newtonScenes = [
  {
    ...law,
    id: "newton1",
    title: "নিউটনের প্রথম সূত্র",
    blurb: "বাহ্যিক বল না লাগলে স্থির থাকে, নইলে সমবেগে চলে।",
    keywords: "newton first law inertia জড়তা নিউটন প্রথম সূত্র সমবেগ স্থির",
    formula: "F = 0 হলে v স্থির",
    verbal: "বাহ্যিক বল না লাগা পর্যন্ত স্থির বস্তু স্থির, চলমান বস্তু সরলরেখায় সমবেগে চলে।",
    proof: "মসৃণ তলে নিট বল শূন্য থাকলে চাকতি নড়ে না। একবার বেগ পেলে বল না থাকায় সমবেগে যায়। বাধা লাগলে তবেই থামে।",
    note: "এটাই জড়তার সূত্র। বেগ বদলাতে হলে বাইরে থেকে নিট বল লাগে। বল না থাকলে বেগ — শূন্য হোক বা না হোক — একই থাকে।",
    duration: 12,
    steps: [
      { t: 0, title: "স্থির", body: "নিট বল শূন্য। নীল ওজন আর সবুজ লম্ব বল সমান ও উল্টো, তাই চাকতি স্থিরই থাকে।" },
      { t: 2.6, title: "বাহ্যিক বল", body: "অল্প সময়ের ধাক্কা বেগ বদলায়। বল যেদিকে, চাকতি সেদিকেই এগোয়।" },
      { t: 3.9, title: "সমবেগ", body: "ধাক্কা সরে গেছে। মসৃণ তলে আর বাধা নেই, তাই সরলরেখায় সমবেগে চলে। সমান ফাঁকের ছাপ সেটাই বলে।" },
      { t: 8, title: "বেগ বদল", body: "বাম্পারে উল্টো বল লাগে। নিট বল শূন্য নয়, তাই বেগ কমে চাকতি থেমে যায়।" },
    ],
    questions: [
      ask(
        "মসৃণ তলে একটি চাকতি ৪ m/s বেগে চলছে। বাহ্যিক বল শূন্য। ৩ সেকেন্ড পরে বেগ কত?",
        "F = 0 ⇒ v স্থির",
        "প্রথম সূত্রে নিট বল শূন্য হলে বেগ বদলায় না। বেগ ৪ m/s-ই থাকে।",
      ),
      ask(
        "স্থির বই নিজে থেকে নড়ে না কেন?",
        "জড়তা",
        "স্থির অবস্থা বজায় রাখার জড়তা আছে। বাহ্যিক নিট বল না লাগলে সে স্থিরই থাকে।",
      ),
    ],
    create(ctx) {
      const { THREE, C, mesh, mat, arrow, shoot, tag, vec } = ctx;
      ctx.frame([1.8, 1.7, 3.1], [-0.15, 0.9, 0]);
      ctx.spin(false);
      const top = ctx.table({ w: 6.6, d: 1.85, h: 0.72 });
      const ice = mesh(
        new THREE.BoxGeometry(5.7, 0.06, 0.92),
        mat({ color: 0xd7e8ee, roughness: 0.16, metalness: 0.28 })
      );
      ice.position.set(0, top + 0.03, 0);
      const railY = top + 0.06;
      const bumper = mesh(new THREE.BoxGeometry(0.16, 0.32, 0.78), mat({ color: C.rubber, roughness: 0.86 }));
      bumper.position.set(2.22, railY + 0.16, 0);
      const puck = disc(ctx, 0xe2b34a, 0.2);
      const hand = mesh(new THREE.SphereGeometry(0.11, 16, 12), mat({ color: 0xe7b89a, roughness: 0.55 }));
      const weight = arrow(C.weight);
      const normal = arrow(C.normal);
      const push = arrow(C.force);
      const speed = arrow(C.velocity);
      const label = tag("নিট বল = 0", -1.6, railY + 0.85, 0);
      const ghosts = [];
      for (let i = 0; i < 5; i += 1) {
        const material = mat({
          color: 0xf0c36a,
          transparent: true,
          opacity: 0.0,
          roughness: 0.4,
          depthWrite: false,
        });
        const mark = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.025, 20), material, false);
        mark.position.y = railY + 0.02;
        mark.visible = false;
        ghosts.push({ mark, material });
      }
      const x0 = -2.2;
      const xPush = -1.28;
      const xHit = 1.55;
      const xStop = 1.86;

      return {
        update(t) {
          let x = x0;
          let phase = "rest";
          if (t < 2.6) {
            x = x0;
          } else if (t < 3.9) {
            phase = "push";
            const u = ctx.seg(t, 2.6, 3.75);
            x = ctx.lerp(x0, xPush, u);
          } else if (t < 8) {
            phase = "coast";
            const u = ctx.clamp((t - 3.9) / (8 - 3.9), 0, 1);
            x = ctx.lerp(xPush, xHit, u);
          } else {
            phase = "stop";
            const u = ctx.seg(t, 8, 9.6);
            x = ctx.lerp(xHit, xStop, u);
          }
          puck.position.set(x, railY, 0);
          const y = railY + 0.16;
          const rest = phase === "rest" ? 1 : ctx.clamp(1 - (t - 2.6) / 0.45, 0, 1);
          shoot(weight, vec(x, y, 0), vec(0, -0.72 * rest, 0));
          shoot(normal, vec(x, y, 0), vec(0, 0.72 * rest, 0));
          const pushing = ctx.seg(t, 2.45, 2.85) * (1 - ctx.seg(t, 3.45, 3.9));
          hand.visible = pushing > 0.05;
          hand.position.set(x - 0.48 - (1 - pushing) * 0.35, y, 0);
          shoot(push, vec(x - 0.28, y, 0), vec(1.15 * pushing, 0, 0));
          const coasting = phase === "coast" || phase === "stop";
          const vLen = phase === "coast" ? 1.05 : phase === "stop" ? 1.05 * (1 - ctx.seg(t, 8, 9.6)) : 0;
          shoot(speed, vec(x, y + 0.42, 0), vec(vLen, 0, 0));
          ghosts.forEach((ghost, index) => {
            const markX = ctx.lerp(xPush, xHit, (index + 1) / 6);
            ghost.mark.position.x = markX;
            const seen = coasting && x >= markX - 0.02;
            ghost.mark.visible = seen;
            ghost.material.opacity = seen ? 0.55 : 0;
          });
          label.position.set(x, railY + 0.95, 0.15);
          label.set(
            phase === "rest" ? "নিট বল = 0 · স্থির" : phase === "push" ? "বাহ্যিক বল" : phase === "coast" ? "বল নেই · সমবেগ" : "উল্টো বল · থামছে"
          );
        },
      };
    },
  },
  {
    ...law,
    id: "newton2",
    title: "নিউটনের দ্বিতীয় সূত্র",
    blurb: "বল সমান হলে ভর বাড়লে ত্বরণ কমে।",
    keywords: "newton second law F=ma বল ত্বরণ ভর নিউটন দ্বিতীয়",
    formula: "F = ma",
    verbal: "বল = ভর × ত্বরণ। ত্বরণ বলের দিকে, এবং বলের সমানুপাতিক।",
    proof: "সমান বলে হালকা গাড়ির ত্বরণ বেশি। ভর তিনগুণ হলে ত্বরণ তিনভাগের এক ভাগ। বল দ্বিগুণ করলে ত্বরণও দ্বিগুণ।",
    note: "ভর স্থির থাকলে বল দ্বিগুণে ত্বরণ দ্বিগুণ। বল স্থির থাকলে ভর দ্বিগুণে ত্বরণ অর্ধেক। বল বেগের সাথে নয়, বেগের পরিবর্তনের সাথে যুক্ত।",
    duration: 9,
    steps: [
      { t: 0, title: "সমান বল", body: "দুই গাড়িতে লাল তীর সমান লম্বা। ওপরের ভর m, নিচের গাড়িতে বাড়তি ব্লক — ভর 3m।" },
      { t: 2.4, title: "ত্বরণ আলাদা", body: "হালকা গাড়ি বেশি পথ যায়। a = F/m। ভর তিনগুণ হলে ত্বরণ তিনভাগের এক ভাগ।" },
      { t: 4.4, title: "বল দ্বিগুণ", body: "হালকা গাড়ির বল এখন 2F। তীর লম্বা, ত্বরণ দ্বিগুণ। ভারী গাড়ির বল আগের মতোই।" },
      { t: 5.6, title: "F = ma", body: "বল ত্বরণের দিকে। বেগ সবুজ তীরে — সেটা বলের তীর নয়। বল বাড়লে বেগ বদলের হার বাড়ে।" },
    ],
    questions: [
      ask(
        "২ kg ভরের গাড়িতে ৬ N বল প্রয়োগ করা হলো। ত্বরণ কত?",
        "a = F/m",
        "a = ৬/২ = ৩ m/s²। ত্বরণ বলের দিকে।",
      ),
      ask(
        "একই ৬ N বল ৬ kg গাড়িতে দিলে ত্বরণ কত?",
        "a = F/m",
        "a = ৬/৬ = ১ m/s²। ভর তিনগুণ, তাই ত্বরণ তিনভাগের এক ভাগ।",
      ),
    ],
    create(ctx) {
      const { C, mesh, mat, THREE, arrow, shoot, tag, vec } = ctx;
      ctx.frame([0.1, 2.15, 4.8], [0, 0.45, 0]);
      ctx.spin(false);
      const deck = mesh(new THREE.BoxGeometry(8.2, 0.08, 2.15), mat({ color: 0x314048, roughness: 0.78 }));
      deck.position.set(0, 0.08, 0);
      for (const z of [-0.52, 0.52]) {
        const lane = mesh(
          new THREE.BoxGeometry(7.6, 0.035, 0.62),
          mat({ color: 0xd5e4ea, roughness: 0.2, metalness: 0.22 })
        );
        lane.position.set(0, 0.14, z);
      }
      const light = labCart(ctx, 0xf0c36a, 0.92, 0);
      const heavy = labCart(ctx, 0x7f97b0, 1.02, 2);
      const f1 = arrow(C.force);
      const f2 = arrow(C.force);
      const v1 = arrow(C.velocity);
      const v2 = arrow(C.velocity);
      const lab1 = tag("ভর m", 0, 1, 0);
      const lab2 = tag("ভর 3m", 0, 1, 0);
      const z1 = -0.52;
      const z2 = 0.52;
      const y1 = 0.16;
      const y2 = 0.16;

      return {
        update(t) {
          const t0 = 0.4;
          const boost = 4.4;
          const a = 0.36;
          const sim = Math.min(t, 5.85);
          const tau = Math.max(0, sim - t0);
          const pre = Math.min(tau, Math.max(0, boost - t0));
          const extra = Math.max(0, sim - boost);
          const x1 = -2.7 + 0.5 * a * pre * pre + a * pre * extra + 0.5 * (2 * a) * extra * extra;
          const vel1 = a * pre + 2 * a * extra;
          const x2 = -2.7 + 0.5 * (a / 3) * tau * tau;
          const vel2 = (a / 3) * tau;
          light.position.set(x1, y1, z1);
          heavy.position.set(x2, y2, z2);
          const doubled = sim >= boost;
          const fLen = doubled ? 1.7 : 0.95;
          shoot(f1, vec(x1 - 0.15, y1 + 0.38, z1), vec(fLen, 0, 0));
          shoot(f2, vec(x2 - 0.2, y2 + 0.55, z2), vec(0.95, 0, 0));
          shoot(v1, vec(x1, y1 + 0.78, z1), vec(Math.min(vel1 * 1.15, 1.6), 0, 0));
          shoot(v2, vec(x2, y2 + 0.95, z2), vec(Math.min(vel2 * 1.15, 1.2), 0, 0));
          lab1.position.set(x1, y1 + 1.15, z1);
          lab2.position.set(x2, y2 + 1.35, z2);
          lab1.set(doubled ? "2F · ত্বরণ দ্বিগুণ" : "ভর m · ত্বরণ বড়");
          lab2.set("ভর 3m · ত্বরণ ছোট");
        },
      };
    },
  },
  {
    ...law,
    id: "newton3",
    title: "নিউটনের তৃতীয় সূত্র",
    blurb: "ক্রিয়া ও প্রতিক্রিয়া সমান, দিক উল্টো।",
    keywords: "newton third law action reaction ক্রিয়া প্রতিক্রিয়া নিউটন তৃতীয়",
    formula: "F₁₂ = − F₂₁",
    verbal: "দুটি বস্তু পরস্পরের ওপর সমান ও বিপরীত বল দেয়।",
    proof: "স্প্রিং ছাড়লে দুই গাড়ি উল্টো দিকে সমান বল পায়। বল আলাদা বস্তুতে লাগে, তাই কাটাকাটি হয় না। হালকা গাড়ির বেগ দ্বিগুণ।",
    note: "ক্রিয়া ও প্রতিক্রিয়া একসঙ্গে লাগে, কিন্তু একই বস্তুতে নয়। তাই একটি বস্তুর ওপর তারা একে অপরকে বাতিল করে না। সমান বলে ভর বেশি হলে বেগের বদল কম।",
    duration: 9.5,
    steps: [
      { t: 0, title: "একসাথে", body: "স্প্রিং সংকুচিত। বাঁয়ের গাড়ির ভর m, ডানের ভর 2m। এখনো ছাড়া হয়নি।" },
      { t: 1.5, title: "সমান ও উল্টো", body: "ছেড়ে দিলে লাল তীর দুটি সমান লম্বা, দিক উল্টো। ক্রিয়া যত, প্রতিক্রিয়াও তত।" },
      { t: 3.3, title: "ভিন্ন বস্তু", body: "এক বল হালকা গাড়িতে, অন্য বল ভারী গাড়িতে। একই বস্তুতে না লাগায় এরা কাটাকাটি হয় না।" },
      { t: 5.1, title: "বেগ উল্টো অনুপাতে", body: "বল সমান, তাই ভরবেগের বদল সমান। ভর অর্ধেক হলে বেগ দ্বিগুণ — সবুজ তীর সেটাই দেখায়।" },
    ],
    questions: [
      ask(
        "এক গাড়ি অন্য গাড়িকে ৩ N বল দিয়ে ঠেললে প্রতিক্রিয়া বল কত?",
        "F₁₂ = − F₂₁",
        "প্রতিক্রিয়া ৩ N, দিক উল্টো। বল দুটি দুই গাড়ির ওপর আলাদাভাবে লাগে।",
      ),
      ask(
        "ভর m ও 2m। হালকা গাড়ি ৪ m/s বেগে সরে। ভারী গাড়ির বেগ কত?",
        "m v₁ = 2m v₂",
        "সমান বলে ভরবেগের বদল সমান। 2m × v₂ = m × ৪, তাই v₂ = ২ m/s, দিক উল্টো।",
      ),
    ],
    create(ctx) {
      const { THREE, C, mesh, mat, arrow, shoot, tag, vec } = ctx;
      ctx.frame([0.15, 1.85, 4.1], [0, 0.4, 0]);
      ctx.spin(false);
      const ice = mesh(
        new THREE.CylinderGeometry(3.3, 3.3, 0.08, 48),
        mat({ color: 0xd5e6ee, roughness: 0.14, metalness: 0.25 })
      );
      ice.position.y = 0.04;
      const light = labCart(ctx, 0xf0c36a, 0.88, 0);
      const heavy = labCart(ctx, 0x7f97b0, 1.05, 2);
      const spring = springMesh(ctx);
      const f1 = arrow(C.force);
      const f2 = arrow(C.force);
      const v1 = arrow(C.velocity);
      const v2 = arrow(C.velocity);
      const pair = tag("ক্রিয়া = প্রতিক্রিয়া", 0, 1.45, 0);
      const left = tag("m", 0, 1, 0);
      const right = tag("2m", 0, 1, 0);

      return {
        update(t) {
          const tau = Math.min(Math.max(0, t - 1.45), 6.6);
          const x1 = -0.72 - 0.28 * tau;
          const x2 = 0.78 + 0.14 * tau;
          light.position.set(x1, 0.1, 0);
          heavy.position.set(x2, 0.1, 0);
          const gap = x2 - x1;
          spring.position.set((x1 + x2) / 2, 0.38, 0);
          spring.scale.x = ctx.clamp(gap / 1.35, 0.42, 2.6);
          spring.visible = gap < 2.15;
          const push = ctx.seg(t, 1.35, 1.8) * (1 - ctx.seg(t, 3.1, 4));
          shoot(f1, vec(x1 + 0.28, 0.48, 0), vec(-1.15 * push, 0, 0));
          shoot(f2, vec(x2 - 0.34, 0.58, 0), vec(1.15 * push, 0, 0));
          const moving = tau > 0.08 ? 1 : 0;
          shoot(v1, vec(x1, 0.95, 0), vec(-1.25 * moving, 0, 0));
          shoot(v2, vec(x2, 1.15, 0), vec(0.62 * moving, 0, 0));
          pair.position.set((x1 + x2) / 2, 1.55, 0);
          pair.set(t < 3.3 ? "ক্রিয়া = প্রতিক্রিয়া" : t < 5.1 ? "দুই বস্তুতে, কাটে না" : "হালকা গাড়ির বেগ দ্বিগুণ");
          left.position.set(x1, 0.72, 0.42);
          right.position.set(x2, 0.95, 0.42);
          left.set("ভর m");
          right.set("ভর 2m");
        },
      };
    },
  },
];
