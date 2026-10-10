export const waveScenes = [
  {
    id: "pendulum",
    chapter: "wave",
    chapterNo: "৭",
    chapterName: "তরঙ্গ ও শব্দ",
    title: "সরল দোলক",
    blurb: "দোলনকাল দৈর্ঘ্যে বদলায়, ভরে নয়।",
    keywords: "pendulum দোলক সরল দোলনকাল তরঙ্গ",
    formula: "T = 2π √(L/g)",
    verbal: "এক পূর্ণ দোলনের সময় শুধু দৈর্ঘ্য আর g-এর ওপর নির্ভর করে।",
    proof: "সমান দৈর্ঘ্যের ভারী-হালকা দোলক একসাথে দোলে। খাটো দোলক এগিয়ে যায়।",
    note: "ছোট কোণে দোলন সরল ছন্দিত। ভর সূত্রে নেই, তাই বব বদলালে দোলনকাল বদলায় না। দৈর্ঘ্য চারগুণ করলে দোলনকাল দ্বিগুণ।",
    duration: 8,
    steps: [
      { t: 0, title: "তিনটি দোলক", body: "বাঁয়ের দুটির দৈর্ঘ্য সমান, ববের আকার আলাদা। ডানদিকের দোলক খাটো।" },
      { t: 2.2, title: "ভর নয়", body: "সমান দৈর্ঘ্যের দুটি এখনও একসাথে। ভর আলাদা হলেও দোলনকাল এক।" },
      { t: 4.2, title: "দৈর্ঘ্য", body: "খাটো দোলক বেশি দোল দিয়ে ফেলেছে। T দৈর্ঘ্যের বর্গমূলের সমানুপাতিক।" },
    ],
    create(ctx) {
      const { C, rod, span, mesh, mat, THREE, tag, vec } = ctx;
      ctx.frame([5.6, 2.6, 6.4], [0, 1.6, 0]);
      const posts = [rod(0.04, C.metal), rod(0.04, C.metal), rod(0.045, C.metal)];
      span(posts[0], vec(-2.1, 0, 0), vec(-2.1, 3.15, 0));
      span(posts[1], vec(2.1, 0, 0), vec(2.1, 3.15, 0));
      span(posts[2], vec(-2.1, 3.15, 0), vec(2.1, 3.15, 0));
      const specs = [
        { x: -1.25, L: 1.7, r: 0.13, color: 0xf0c36a, w: Math.sqrt(4.2 / 1.7), name: "L , হালকা" },
        { x: 0, L: 1.7, r: 0.22, color: 0xd7dee6, w: Math.sqrt(4.2 / 1.7), name: "L , ভারী" },
        { x: 1.3, L: 0.95, r: 0.13, color: 0xf0c36a, w: Math.sqrt(4.2 / 0.95), name: "খাটো L" },
      ];
      const pend = specs.map((s) => {
        const string = rod(0.012, C.tension);
        const bob = mesh(new THREE.SphereGeometry(s.r, 22, 16), mat({ color: s.color, metalness: 0.35, roughness: 0.3 }));
        const lab = tag(s.name, s.x, 3.35, 0);
        return { ...s, string, bob, lab, pivotY: 3.05 };
      });

      return {
        update(t) {
          pend.forEach((p) => {
            const th = 0.48 * Math.cos(p.w * t);
            const x = p.x + Math.sin(th) * p.L;
            const y = p.pivotY - Math.cos(th) * p.L;
            p.bob.position.set(x, y, 0);
            span(p.string, vec(p.x, p.pivotY, 0), vec(x, y + p.r * 0.2, 0));
            p.lab.position.set(p.x, 3.4, 0);
          });
        },
      };
    },
  },
  {
    id: "wave",
    chapter: "wave",
    chapterNo: "৭",
    chapterName: "তরঙ্গ ও শব্দ",
    title: "অনুপ্রস্থ তরঙ্গ",
    blurb: "তরঙ্গ এগোয়, কণা শুধু ওপরে-নিচে দোলে।",
    keywords: "transverse wave অনুপ্রস্থ তরঙ্গ তরঙ্গদৈর্ঘ্য",
    formula: "v = f λ",
    verbal: "তরঙ্গের বেগ = কম্পাঙ্ক × তরঙ্গদৈর্ঘ্য।",
    proof: "দাগের কণা ডানে সরে না। সে ওপরে-নিচে দোলে, আর তরঙ্গের আকৃতি ডানে এগোয়।",
    note: "শিখর থেকে পরের শিখর পর্যন্ত দূরত্ব তরঙ্গদৈর্ঘ্য λ। কণার দোলন তরঙ্গের গতির সাথে লম্ব বলে একে অনুপ্রস্থ তরঙ্গ বলে। আলোও অনুপ্রস্থ।",
    duration: 8,
    steps: [
      { t: 0, title: "কণা স্থানেই", body: "মাঝের লাল কণা একটা খাড়া দাগের ওপর। তার x বদলায় না।" },
      { t: 1.5, title: "আকৃতি এগোয়", body: "শিখর ডান দিকে চলে যায়। কণাগুলো শুধু ওঠানামা করে।" },
      { t: 3.5, title: "তরঙ্গদৈর্ঘ্য", body: "পরপর দুই শিখরের ফাঁক λ। যত ঘন দোলন, তত বেশি কম্পাঙ্ক।" },
    ],
    create(ctx) {
      const { THREE, C, mesh, mat, poly, tag, line } = ctx;
      ctx.frame([0.2, 2.2, 7.4], [0, 1.2, 0]);
      ctx.spin(false);
      const n = 36;
      const spacing = 0.22;
      const beads = [];
      const geo = new THREE.SphereGeometry(0.055, 12, 10);
      const beadMat = mat({ color: 0xd5dde4, roughness: 0.35 });
      const hot = mat({ color: C.force, emissive: C.force, emissiveIntensity: 0.25 });
      for (let i = 0; i < n; i++) {
        beads.push(mesh(geo, i === 16 ? hot : beadMat, false));
      }
      const string = poly(0xf2d48a, n);
      const guide = line(0xf4efe4, true);
      const watch = tag("এই কণা ডানে যায় না", 0, 1.8, 0);
      const lam = tag("λ", 0, 1.7, 0);
      const A = 0.42;
      const k = 1.15;
      const w = 2.1;
      const y0 = 1.15;

      return {
        update(t) {
          const arr = string.geometry.attributes.position.array;
          let crestA = null;
          let crestB = null;
          for (let i = 0; i < n; i++) {
            const x = (i - (n - 1) / 2) * spacing;
            const y = y0 + A * Math.sin(k * x - w * t);
            beads[i].position.set(x, y, 0);
            arr[i * 3] = x;
            arr[i * 3 + 1] = y;
            arr[i * 3 + 2] = 0;
            const phase = (k * x - w * t) % (Math.PI * 2);
            const near = Math.abs(Math.sin(k * x - w * t) - 1) < 0.08;
            if (near) {
              if (!crestA) crestA = x;
              else if (!crestB && x - crestA > 1) crestB = x;
            }
          }
          string.geometry.attributes.position.needsUpdate = true;
          const xw = (16 - (n - 1) / 2) * spacing;
          guide.userData.set(xw, y0 - 0.7, 0, xw, y0 + 0.7, 0);
          watch.position.set(xw, y0 + 0.85, 0);
          if (crestA !== null && crestB !== null) {
            lam.position.set((crestA + crestB) / 2, y0 + A + 0.28, 0);
            lam.set("λ");
            lam.element.style.opacity = "1";
          } else {
            lam.element.style.opacity = "0";
          }
        },
      };
    },
  },
  {
    id: "sound",
    chapter: "wave",
    chapterNo: "৭",
    chapterName: "তরঙ্গ ও শব্দ",
    title: "অনুদৈর্ঘ্য তরঙ্গ",
    blurb: "শব্দ তরঙ্গে কণা সামনে-পেছনে দোলে।",
    keywords: "sound longitudinal অনুদৈর্ঘ্য শব্দ তরঙ্গ সংকোচন",
    formula: "v = f λ",
    verbal: "শব্দ বায়ুতে অনুদৈর্ঘ্য তরঙ্গ — সংকোচন আর প্রসারণ এগোয়।",
    proof: "কণাগুলো তরঙ্গের দিকেই দোলে। কাছে ঘেঁষলে সংকোচন, ফাঁকা হলে প্রসারণ।",
    note: "বায়ুতে শব্দের বেগ তাপমাত্রার সাথে বাড়ে। শূন্য মাধ্যমে শব্দ চলে না, কারণ দোলানোর মতো কণা থাকে না। আলো শূন্যেও চলে।",
    duration: 8,
    steps: [
      { t: 0, title: "কণা সামনে-পেছনে", body: "লাল কণা তার জায়গার আশেপাশে ডানে-বাঁয়ে দোলে। ওপরে ওঠে না।" },
      { t: 1.6, title: "সংকোচন", body: "যেখানে কণা ঘন, সেটা সংকোচন। এই ঘন জায়গা ডান দিকে এগোয়।" },
      { t: 4, title: "প্রসারণ", body: "ঘন জায়গার পাশে ফাঁকা অংশ প্রসারণ। শব্দ এই দুইয়ের পরম্পরা।" },
    ],
    create(ctx) {
      const { THREE, C, mesh, mat, tag, line } = ctx;
      ctx.frame([0.1, 2.3, 7.2], [0, 1.05, 0]);
      ctx.spin(false);
      const n = 28;
      const spacing = 0.28;
      const geo = new THREE.SphereGeometry(0.07, 14, 12);
      const base = mat({ color: 0xd5dde4, roughness: 0.35 });
      const hot = mat({ color: C.force, emissive: C.force, emissiveIntensity: 0.25 });
      const beads = [];
      for (let i = 0; i < n; i++) {
        beads.push(mesh(geo, i === 10 ? hot : base, false));
      }
      const guide = line(0xf4efe4, true);
      const lab = tag("সংকোচন →", 0, 1.5, 0);
      const A = 0.1;
      const k = 0.95;
      const w = 2.0;
      const y = 1.05;

      return {
        update(t) {
          let denseX = 0;
          let best = -1;
          for (let i = 0; i < n; i++) {
            const x0 = (i - (n - 1) / 2) * spacing;
            const x = x0 + A * Math.sin(k * x0 - w * t);
            beads[i].position.set(x, y, 0);
            if (i > 0) {
              const prev = beads[i - 1].position.x;
              const gap = x - prev;
              if (best < 0 || gap < best) {
                best = gap;
                denseX = (x + prev) / 2;
              }
            }
          }
          const xw = (10 - (n - 1) / 2) * spacing;
          guide.userData.set(xw, y - 0.45, 0, xw, y + 0.45, 0);
          lab.position.set(denseX, y + 0.48, 0);
          lab.set("সংকোচন");
        },
      };
    },
  },
];
