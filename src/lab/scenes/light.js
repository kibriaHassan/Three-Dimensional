function rayLine(ctx, color) {
  return ctx.poly(color, 2);
}

function setSeg(line, a, b) {
  const p = line.geometry.attributes.position.array;
  p[0] = a.x;
  p[1] = a.y;
  p[2] = a.z;
  p[3] = b.x;
  p[4] = b.y;
  p[5] = b.z;
  line.geometry.attributes.position.needsUpdate = true;
}

export const lightScenes = [
  {
    id: "reflection",
    chapter: "reflect",
    chapterNo: "৮",
    chapterName: "আলোর প্রতিফলন",
    title: "প্রতিফলনের সূত্র",
    blurb: "আপতন কোণ আর প্রতিফলন কোণ সমান।",
    keywords: "reflection প্রতিফলন আলো দর্পণ i=r",
    formula: "i = r",
    verbal: "আপতন কোণ = প্রতিফলন কোণ, একই সমতলে।",
    proof: "আলো দর্পণে লেগে যে কোণে পড়ে, সেই কোণেই ফিরে যায়। অভিলম্বের দুপাশে কোণ সমান।",
    note: "অভিলম্ব দর্পণের তলের সাথে লম্ব। আপতিত রশ্মি, প্রতিফলিত রশ্মি আর অভিলম্ব একই সমতলে থাকে। দর্পণ ঘোরালে প্রতিফলিত রশ্মি দ্বিগুণ কোণে ঘোরে।",
    duration: 7,
    steps: [
      { t: 0, title: "আপতিত রশ্মি", body: "আলোর কণা দর্পণের দিকে যাচ্ছে। সাদা ড্যাশ-রেখা অভিলম্ব।" },
      { t: 2.4, title: "প্রতিফলন", body: "দর্পণ স্পর্শ করে আলো ফিরে আসে। আপতন কোণ i আর প্রতিফলন কোণ r সমান।" },
      { t: 4.5, title: "এক সমতল", body: "ঘুরিয়ে দেখো — দুই রশ্মি আর অভিলম্ব একই সমতলে।" },
    ],
    create(ctx) {
      const { THREE, C, mesh, mat, poly, line, tag, vec } = ctx;
      ctx.frame([1.4, 2.4, 6.6], [0.2, 1.2, 0]);
      ctx.spin(true);
      const mirror = mesh(
        new THREE.BoxGeometry(0.08, 2.4, 1.8),
        mat({ color: 0xe7eef5, metalness: 0.82, roughness: 0.08 })
      );
      mirror.position.set(1.35, 1.25, 0);
      const hit = vec(1.31, 1.15, 0);
      const start = vec(-1.7, 2.15, 0.55);
      const end = vec(-1.7, 0.15, -0.55);
      const incident = poly(0xf2d48a, 2);
      const reflected = poly(0x8fd0ff, 2);
      const normal = line(0xf4efe4, true);
      normal.userData.set(hit.x, hit.y, hit.z, hit.x - 1.1, hit.y, hit.z);
      const photon = mesh(new THREE.SphereGeometry(0.07, 14, 12), mat({ color: 0xfff1c2, emissive: 0xf2d48a, emissiveIntensity: 0.8 }), false);
      tag("i = r", 0.15, 1.85, 0.2);
      tag("অভিলম্ব", 0.35, 1.15, 0);

      return {
        update(t) {
          const u = (t % 7) / 7;
          const go = Math.min(u / 0.42, 1);
          const back = ctx.clamp((u - 0.42) / 0.42, 0, 1);
          const tipI = start.clone().lerp(hit, go);
          setSeg(incident, start, tipI);
          const tipR = hit.clone().lerp(end, back);
          setSeg(reflected, hit, back > 0.02 ? tipR : hit);
          photon.position.copy(back > 0 ? tipR : tipI);
        },
      };
    },
  },
  {
    id: "refraction",
    chapter: "light",
    chapterNo: "৯",
    chapterName: "আলোর প্রতিসরণ",
    title: "প্রতিসরণ",
    blurb: "কাচে ঢুকলে আলো অভিলম্বের দিকে বাঁকে।",
    keywords: "refraction প্রতিসরণ স্নেল কাচ আলো",
    formula: "n₁ sin i = n₂ sin r",
    verbal: "ঘন মাধ্যমে ঢুকলে আলো অভিলম্বের দিকে বাঁকে।",
    proof: "বায়ু থেকে কাচে i = ৩৫°, r = ২২°। আয়তাকার ফলকে বেরোনোর রশ্মি আপতিত রশ্মির সমান্তরাল।",
    note: "কাচের পরম প্রতিসরাঙ্ক প্রায় ১.৫। আলো লম্বভাবে পড়লে বাঁকে না। ফলক সমান্তরাল হলে নির্গত রশ্মি আপতিত রশ্মির সমান্তরাল, একটু পাশে সরে।",
    duration: 7.5,
    steps: [
      { t: 0, title: "বায়ুতে", body: "রশ্মি কাচের ফলকের দিকে আসছে। অভিলম্বের সাথে কোণ i = ৩৫°।" },
      { t: 2.2, title: "কাচের ভেতর", body: "ঘন মাধ্যমে কোণ কমে r = ২২°। আলো অভিলম্বের দিকে বাঁকল। স্নেলের সূত্র মিলবে: sin৩৫° / sin২২° ≈ ১.৫।" },
      { t: 4.4, title: "সমান্তরাল নির্গত", body: "বেরিয়ে আবার বায়ু। দিক আগের মতোই, পথ একটু পাশে সরে গেছে।" },
    ],
    create(ctx) {
      const { THREE, C, mesh, glass, mat, poly, line, tag, vec } = ctx;
      ctx.frame([0.6, 2.2, 7.4], [0.7, 1.15, 0]);
      ctx.spin(false);
      const slab = mesh(new THREE.BoxGeometry(1.5, 2.5, 1.15), glass({ opacity: 0.32, color: 0xb7e3c8 }));
      slab.position.set(0.75, 1.15, 0);
      const p0 = vec(-1.7, 2.35, 0.2);
      const p1 = vec(0, 1.16, 0.2);
      const p2 = vec(1.5, 0.54, 0.2);
      const p3 = vec(3.05, -0.545, 0.2);
      const a = poly(0xf2d48a, 2);
      const b = poly(0x9be7c4, 2);
      const c = poly(0x8fd0ff, 2);
      const normal = line(0xf4efe4, true);
      normal.userData.set(-0.8, 1.16, 0.2, 0.7, 1.16, 0.2);
      const photon = mesh(new THREE.SphereGeometry(0.065, 12, 10), mat({ color: 0xfff1c2, emissive: 0xf2d48a, emissiveIntensity: 0.85 }), false);
      tag("i = 35°", -0.85, 1.85, 0.35);
      tag("r = 22°", 0.55, 0.85, 0.35);

      return {
        update(t) {
          const u = ctx.clamp(t / 5.8, 0, 1);
          let pos;
          if (u < 0.34) {
            pos = p0.clone().lerp(p1, u / 0.34);
            setSeg(a, p0, pos);
            setSeg(b, p1, p1);
            setSeg(c, p2, p2);
          } else if (u < 0.67) {
            pos = p1.clone().lerp(p2, (u - 0.34) / 0.33);
            setSeg(a, p0, p1);
            setSeg(b, p1, pos);
            setSeg(c, p2, p2);
          } else {
            pos = p2.clone().lerp(p3, (u - 0.67) / 0.33);
            setSeg(a, p0, p1);
            setSeg(b, p1, p2);
            setSeg(c, p2, pos);
          }
          photon.position.copy(pos);
        },
      };
    },
  },
  {
    id: "lens",
    chapter: "light",
    chapterNo: "৯",
    chapterName: "আলোর প্রতিসরণ",
    title: "উত্তল লেন্স",
    blurb: "সমান্তরাল রশ্মি ফোকাসে মিলে।",
    keywords: "convex lens উত্তল লেন্স ফোকাস আলো",
    formula: "1/v − 1/u = 1/f",
    verbal: "প্রধান অক্ষের সমান্তরাল রশ্মি ফোকাসের মধ্য দিয়ে যায়।",
    proof: "তিনটি সমান্তরাল রশ্মি লেন্সের পর এক বিন্দুতে মিলেছে। ওই বিন্দুই প্রধান ফোকাস।",
    note: "ফোকাস দূরত্ব f। উত্তল লেন্স মাঝখানে মোটা, আলোকে জড়ো করে। বস্তু ফোকাসের বাইরে থাকলে বিপরীত দিকে বাস্তব প্রতিবিম্ব হয়।",
    duration: 7,
    steps: [
      { t: 0, title: "সমান্তরাল রশ্মি", body: "বাঁ দিক থেকে তিনটি রশ্মি প্রধান অক্ষের সমান্তরালে আসছে।" },
      { t: 2.2, title: "লেন্সে বাঁক", body: "উত্তল লেন্স ওপর-নিচের রশ্মিকে অক্ষের দিকে বাঁকায়। মাঝের রশ্মি সোজা যায়।" },
      { t: 4.2, title: "ফোকাস", body: "তিনটি রশ্মি এক বিন্দুতে মিলল। লেন্স থেকে ওই দূরত্বই ফোকাস দূরত্ব f।" },
    ],
    create(ctx) {
      const { THREE, C, mesh, mat, poly, line, tag, vec } = ctx;
      ctx.frame([0.4, 1.8, 6.8], [0.4, 0.2, 0]);
      ctx.spin(false);
      const lens = mesh(
        new THREE.SphereGeometry(0.95, 32, 24),
        mat({
          color: 0xd5f3ea,
          roughness: 0.05,
          metalness: 0.02,
          transparent: true,
          opacity: 0.45,
          depthWrite: false,
        }),
        false
      );
      lens.scale.set(0.28, 1, 1);
      lens.position.set(0, 0.15, 0);
      const axis = line(0xf4efe4, true);
      axis.userData.set(-2.8, 0.15, 0, 2.8, 0.15, 0);
      const focus = vec(1.55, 0.15, 0);
      const dot = mesh(new THREE.SphereGeometry(0.06, 12, 10), mat({ color: C.force, emissive: C.force, emissiveIntensity: 0.4 }), false);
      dot.position.copy(focus);
      tag("F", 1.55, 0.45, 0);
      const rays = [-0.62, 0, 0.62].map((y) => ({
        y,
        line: poly(0xf2d48a, 24),
        photon: mesh(new THREE.SphereGeometry(0.05, 10, 8), mat({ color: 0xfff1c2, emissive: 0xf2d48a, emissiveIntensity: 0.8 }), false),
      }));

      function point(y, u) {
        const bend = 0.46;
        if (u < bend) {
          const k = u / bend;
          return vec(-2.5 + k * 2.5, 0.15 + y, 0);
        }
        const k = (u - bend) / (1 - bend);
        return vec(ctx.lerp(0, focus.x + 0.8, k), ctx.lerp(0.15 + y, focus.y, Math.min(k / 0.72, 1)), 0);
      }

      return {
        update(t) {
          const grow = ctx.clamp(t / 4.5, 0, 1);
          rays.forEach((r) => {
            const arr = r.line.geometry.attributes.position.array;
            const n = r.line.userData.count;
            for (let i = 0; i < n; i++) {
              const p = point(r.y, grow * (i / (n - 1)));
              arr[i * 3] = p.x;
              arr[i * 3 + 1] = p.y;
              arr[i * 3 + 2] = 0;
            }
            r.line.geometry.attributes.position.needsUpdate = true;
            r.photon.position.copy(point(r.y, grow));
          });
        },
      };
    },
  },
  {
    id: "charge",
    chapter: "electro",
    chapterNo: "১০",
    chapterName: "স্থির বিদ্যুৎ",
    title: "আধানের বল",
    blurb: "বিপরীত আধান টানে, সমজাতীয় ঠেলে।",
    keywords: "charge coulomb আধান স্থির বিদ্যুৎ আকর্ষণ বিকর্ষণ",
    formula: "F = k q₁ q₂ / r²",
    verbal: "বল আধানের গুণফলের সমানুপাতিক, দূরত্বের বর্গের ব্যস্তানুপাতিক।",
    proof: "বিপরীত আধান কাছে আসে, সমজাতীয় আধান দূরে সরে। দিক আধানের চিহ্ন দেখে।",
    note: "কুলম্বের সূত্র। মাঝের বস্তু না থাকলেও বল লাগে — ক্ষেত্রের ধারণা এখান থেকে। ধনাত্মক আধান থেকে বলরেখা বেরোয়, ঋণাত্মকে ঢোকে।",
    duration: 8,
    steps: [
      { t: 0, title: "বিপরীত আধান", body: "লাল ধনাত্মক, নীল ঋণাত্মক। তীর দুটি একে অপরের দিকে — আকর্ষণ।" },
      { t: 4.1, title: "সমজাতীয় আধান", body: "এবার দুটোই ধনাত্মক। তীর বাইরের দিকে — বিকর্ষণ। দূরত্ব বাড়লে বল কমে।" },
    ],
    create(ctx) {
      const { THREE, C, mesh, mat, arrow, shoot, tag, vec } = ctx;
      ctx.frame([4.2, 2.6, 5.6], [0, 1.1, 0]);
      const left = mesh(new THREE.SphereGeometry(0.32, 24, 18), mat({ color: C.north, roughness: 0.35, emissive: C.north, emissiveIntensity: 0.18 }));
      const right = mesh(new THREE.SphereGeometry(0.32, 24, 18), mat({ color: C.south, roughness: 0.35, emissive: C.south, emissiveIntensity: 0.18 }));
      const a1 = arrow(C.force);
      const a2 = arrow(C.force);
      const labL = tag("+", -1.4, 1.7, 0);
      const labR = tag("−", 1.4, 1.7, 0);
      const word = tag("আকর্ষণ", 0, 1.9, 0);

      return {
        update(t) {
          const attract = t < 4;
          const k = attract ? ctx.smooth(t / 3.4) : ctx.smooth((t - 4.2) / 3);
          const gap = attract ? ctx.lerp(1.7, 0.85, k) : ctx.lerp(0.85, 1.75, k);
          left.position.set(-gap, 1.1, 0);
          right.position.set(gap, 1.1, 0);
          const col = attract ? C.south : C.north;
          right.material.color.setHex(col);
          right.material.emissive.setHex(col);
          const dir = attract ? 1 : -1;
          shoot(a1, vec(-gap + 0.36, 1.1, 0), vec(0.85 * dir, 0, 0));
          shoot(a2, vec(gap - 0.36, 1.1, 0), vec(-0.85 * dir, 0, 0));
          labL.position.set(-gap, 1.65, 0);
          labR.position.set(gap, 1.65, 0);
          labL.set("+");
          labR.set(attract ? "−" : "+");
          word.position.set(0, 1.95, 0);
          word.set(attract ? "আকর্ষণ" : "বিকর্ষণ");
        },
      };
    },
  },
  {
    id: "circuit",
    chapter: "electro",
    chapterNo: "১১",
    chapterName: "বিদ্যুতের চৌম্বক ক্রিয়া",
    title: "বদ্ধ বর্তনী",
    blurb: "সুইচ বন্ধ হলেই বর্তনী পূর্ণ, বাল্ব জ্বলে।",
    keywords: "circuit current বর্তনী বিদ্যুৎ সুইচ বাল্ব",
    formula: "V = IR",
    verbal: "বিভব পার্থক্য থাকলে বদ্ধ পথে তড়িৎ প্রবাহ চলে।",
    proof: "সুইচ খোলা থাকলে পথ ভাঙা, ইলেকট্রন ঘোরে না, বাল্ব নিভে থাকে। বন্ধ করলে বর্তনী পূর্ণ হয়।",
    note: "ওহমের সূত্রে একই রোধে ভোল্টেজ বাড়লে প্রবাহ বাড়ে। বাল্বের উজ্জ্বলতা প্রবাহের সাথে বাড়ে। তড়িৎ প্রবাহের প্রচলিত দিক ধনাত্মক থেকে ঋণাত্মকের দিকে, ইলেকট্রন উল্টো দিকে চলে।",
    duration: 8,
    steps: [
      { t: 0, title: "সুইচ খোলা", body: "পথের এক জায়গায় ফাঁক। ইলেকট্রন আবর্তন করতে পারে না। বাল্ব নিভে আছে।" },
      { t: 2.2, title: "সুইচ বন্ধ", body: "লিভার নেমে পথ জুড়ে দিল। বর্তনী এখন বদ্ধ।" },
      { t: 3.2, title: "প্রবাহ", body: "নীল কণাগুলো তার বরাবর ঘুরছে, বাল্ব জ্বলছে। পথ খুললেই আবার নিভে যাবে।" },
    ],
    create(ctx) {
      const { THREE, C, mesh, mat, group, tag, vec } = ctx;
      ctx.frame([3.6, 2.6, 5.2], [0, 0.2, 0]);
      ctx.spin(false);
      const w = 2.4;
      const h = 1.5;
      const segs = [
        [vec(-w / 2, -h / 2, 0), vec(w / 2, -h / 2, 0)],
        [vec(w / 2, -h / 2, 0), vec(w / 2, h / 2, 0)],
        [vec(w / 2, h / 2, 0), vec(-w / 2, h / 2, 0)],
        [vec(-w / 2, h / 2, 0), vec(-w / 2, 0.18, 0)],
        [vec(-w / 2, -0.18, 0), vec(-w / 2, -h / 2, 0)],
      ];
      segs.forEach(([a, b]) => ctx.span(ctx.rod(0.025, 0xd7b15a), a, b));
      const cell = mesh(new THREE.BoxGeometry(0.46, 0.28, 0.2), mat({ color: 0x2f3338, roughness: 0.5 }));
      cell.position.set(0, -h / 2, 0);
      tag("+", 0.38, -h / 2 + 0.28, 0);
      tag("−", -0.38, -h / 2 + 0.28, 0);
      const bulbMat = mat({ color: 0xf4efe4, emissive: 0xffd27a, emissiveIntensity: 0.05, roughness: 0.25 });
      const bulb = mesh(new THREE.SphereGeometry(0.2, 20, 16), bulbMat);
      bulb.position.set(0, h / 2, 0);
      const glowMat = mat({
        color: 0xffd27a,
        emissive: 0xffd27a,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const glow = mesh(new THREE.SphereGeometry(0.34, 16, 12), glowMat, false);
      glow.position.copy(bulb.position);
      const lever = group();
      lever.position.set(-w / 2, 0, 0);
      const arm = mesh(new THREE.BoxGeometry(0.08, 0.42, 0.08), mat({ color: 0xeeeeee, metalness: 0.4, roughness: 0.3 }));
      arm.position.set(0.12, 0.12, 0);
      lever.add(arm);
      tag("সুইচ", -w / 2 - 0.15, 0.55, 0);
      const electrons = [];
      const eGeo = new THREE.SphereGeometry(0.05, 10, 8);
      const eMat = mat({ color: 0x8fd0ff, emissive: 0x3a67d6, emissiveIntensity: 0.45 });
      for (let i = 0; i < 10; i++) electrons.push(mesh(eGeo, eMat, false));

      function onRect(u) {
        const per = 2 * (w + h);
        let d = ((u % 1) + 1) % 1 * per;
        if (d < w) return vec(-w / 2 + d, -h / 2, 0);
        d -= w;
        if (d < h) return vec(w / 2, -h / 2 + d, 0);
        d -= h;
        if (d < w) return vec(w / 2 - d, h / 2, 0);
        d -= w;
        return vec(-w / 2, h / 2 - d, 0);
      }

      return {
        update(t) {
          const closed = ctx.smooth((t - 2.1) / 0.45);
          lever.rotation.z = ctx.lerp(-0.7, 0, closed);
          const lit = closed > 0.85 && t < 7.3 ? 1 : closed > 0.85 ? 1 : closed;
          const flow = t > 2.5 && t < 7.4;
          bulbMat.emissiveIntensity = flow ? 0.95 : 0.05;
          glowMat.opacity = flow ? 0.35 : 0;
          electrons.forEach((e, i) => {
            e.visible = flow;
            if (!flow) return;
            e.position.copy(onRect(t * 0.12 + i / electrons.length));
          });
        },
      };
    },
  },
  {
    id: "magnet",
    chapter: "electro",
    chapterNo: "১১",
    chapterName: "বিদ্যুতের চৌম্বক ক্রিয়া",
    title: "চুম্বক ক্ষেত্র",
    blurb: "বলরেখা উত্তর মেরু থেকে দক্ষিণ মেরুতে যায়।",
    keywords: "magnet field চুম্বক ক্ষেত্র বলরেখা",
    formula: "বলরেখা N → S",
    verbal: "চুম্বকের বাইরে বলরেখা উত্তর মেরু থেকে দক্ষিণ মেরুতে।",
    proof: "কণাগুলো বলরেখা ধরে উত্তর থেকে দক্ষিণে যায়। রেখাগুলো কাছে ঘন, দূরে ফাঁকা।",
    note: "বলরেখা কখনো একে অপরকে কাটে না। ঘন রেখা মানে শক্তিশালী ক্ষেত্র। পৃথিবী নিজেও একটি দণ্ড চুম্বকের মতো।",
    duration: 8,
    steps: [
      { t: 0, title: "দণ্ড চুম্বক", body: "লাল উত্তর মেরু, নীল দক্ষিণ মেরু। বাইরের জগতে রেখা N থেকে বেরিয়ে S-এ ঢোকে।" },
      { t: 1.2, title: "রেখা বরাবর", body: "ছোট কণাগুলো বাইরের রেখা ধরে উত্তর মেরু থেকে দক্ষিণ মেরুতে যায়।" },
      { t: 4, title: "ঘন আর ফাঁকা", body: "মেরুর কাছে রেখা ঘন — ক্ষেত্র বেশি। দূরে ফাঁকা — ক্ষেত্র দুর্বল।" },
    ],
    create(ctx) {
      const { THREE, C, mesh, mat, tag } = ctx;
      ctx.frame([4.4, 2.8, 5.4], [0, 0.7, 0]);
      const bar = ctx.group();
      const north = mesh(new THREE.BoxGeometry(1.15, 0.38, 0.38), mat({ color: C.north, roughness: 0.4 }));
      north.position.set(0.58, 0.7, 0);
      bar.add(north);
      const south = mesh(new THREE.BoxGeometry(1.15, 0.38, 0.38), mat({ color: C.south, roughness: 0.4 }));
      south.position.set(-0.58, 0.7, 0);
      bar.add(south);
      tag("N", 1.05, 1.15, 0);
      tag("S", -1.05, 1.15, 0);
      const curves = [];
      const heights = [0.55, 0.95, 1.35];
      const zs = [0, 0.35, -0.35];
      heights.forEach((h, hi) => {
        zs.forEach((z) => {
          if (hi === 0 && z !== 0) return;
          const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(1.2, 0.7, 0),
            new THREE.Vector3(1.7, 0.7 + h * 0.3, z * 0.4),
            new THREE.Vector3(0.2, 0.7 + h, z),
            new THREE.Vector3(-1.7, 0.7 + h * 0.3, z * 0.4),
            new THREE.Vector3(-1.2, 0.7, 0),
          ]);
          mesh(
            new THREE.TubeGeometry(curve, 40, 0.012, 5, false),
            mat({ color: 0x9ec4de, transparent: true, opacity: 0.75, roughness: 0.4 }),
            false
          );
          curves.push(curve);
        });
      });
      const geo = new THREE.SphereGeometry(0.045, 8, 8);
      const pMat = mat({ color: 0xfff1c2, emissive: 0xf2d48a, emissiveIntensity: 0.7 });
      const dots = [];
      curves.forEach((curve) => {
        for (let i = 0; i < 3; i++) dots.push({ mesh: mesh(geo, pMat, false), curve, i });
      });

      return {
        update(t) {
          dots.forEach((d) => {
            const u = (t * 0.07 + d.i / 3) % 1;
            d.mesh.position.copy(d.curve.getPointAt(u));
          });
        },
      };
    },
  },
  {
    id: "halflife",
    chapter: "modern",
    chapterNo: "১২",
    chapterName: "তেজস্ক্রিয়তা ও ইলেকট্রনিক্স",
    title: "অর্ধায়ু",
    blurb: "এক অর্ধায়ুতে সক্রিয় নিউক্লিয়াস অর্ধেক থাকে।",
    keywords: "half life অর্ধায়ু তেজস্ক্রিয় ক্ষয়",
    formula: "N = N₀ / 2^(t/T)",
    verbal: "অর্ধায়ু সেই সময়, যাতে সক্রিয় নিউক্লিয়াস অর্ধেক হয়।",
    proof: "৩২টি নিউক্লিয়াস থেকে প্রতি অর্ধায়ুতে অর্ধেক নিভে যায়: ৩২, ১৬, ৮, ৪।",
    note: "কোন নিউক্লিয়াস কখন ভাঙবে আগে থেকে বলা যায় না, কিন্তু বিপুল সংখ্যায় অর্ধেক হতে নির্দিষ্ট সময় লাগে। অর্ধায়ু পদার্থের নিজস্ব ধর্ম, চাপ বা তাপে বদলায় না।",
    duration: 11,
    steps: [
      { t: 0, title: "শুরুতে ৩২", body: "প্রতিটি গোলক একটি সক্রিয় নিউক্লিয়াস। এখনো কোনো ক্ষয় হয়নি।" },
      { t: 2.2, title: "এক অর্ধায়ু", body: "অর্ধেক নিভে গেছে। ১৬টি এখনও সক্রিয়। সময়টাই এই নমুনার অর্ধায়ু T।" },
      { t: 4.4, title: "আবার অর্ধেক", body: "পরের অর্ধায়ুতে ১৬ থেকে ৮। তার পর ৪। প্রতি ধাপে বাকি সংখ্যা অর্ধেক।" },
    ],
    create(ctx) {
      const { THREE, C, mesh, mat, tag } = ctx;
      ctx.frame([4.2, 3.1, 5.8], [0, 0.9, 0]);
      const nuclei = [];
      const geo = new THREE.SphereGeometry(0.12, 14, 12);
      const aliveMat = mat({ color: 0xf0c36a, emissive: 0xe2a63b, emissiveIntensity: 0.35 });
      const deadMat = mat({ color: 0x394248, roughness: 0.8, emissive: 0x000000, emissiveIntensity: 0 });
      let n = 0;
      for (let y = 0; y < 2; y++) {
        for (let z = 0; z < 4; z++) {
          for (let x = 0; x < 4; x++) {
            const m = mesh(geo, aliveMat.clone(), false);
            aliveMat.clone();
            m.material = mat({ color: 0xf0c36a, emissive: 0xe2a63b, emissiveIntensity: 0.35 });
            m.position.set((x - 1.5) * 0.42, 0.45 + y * 0.42, (z - 1.5) * 0.42);
            const decayAt = n < 16 ? 2.2 : n < 24 ? 4.4 : n < 28 ? 6.6 : n < 30 ? 8.8 : 10.4;
            nuclei.push({ mesh: m, decayAt });
            n += 1;
          }
        }
      }
      const counter = tag("সক্রিয় 32", 0, 1.7, 0);
      const bar = mesh(new THREE.BoxGeometry(0.3, 1, 0.3), mat({ color: C.tension, emissive: C.tension, emissiveIntensity: 0.12 }));
      bar.position.x = 2.1;

      return {
        update(t) {
          let left = 0;
          nuclei.forEach((item) => {
            const on = t < item.decayAt;
            item.mesh.material.color.setHex(on ? 0xf0c36a : 0x3a4248);
            item.mesh.material.emissive.setHex(on ? 0xe2a63b : 0x000000);
            item.mesh.material.emissiveIntensity = on ? 0.35 : 0;
            item.mesh.scale.setScalar(on ? 1 : 0.55);
            if (on) left += 1;
          });
          counter.set(`সক্রিয় ${left}`);
          const H = Math.max(0.08, (left / 32) * 1.6);
          bar.scale.y = H;
          bar.position.set(2.1, 0.2 + H / 2, 0);
        },
      };
    },
  },
];
