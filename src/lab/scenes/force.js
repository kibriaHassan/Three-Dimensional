function cart(ctx, color, scale) {
  const g = ctx.group();
  const body = ctx.mesh(
    new ctx.THREE.BoxGeometry(0.78 * scale, 0.3 * scale, 0.42 * scale),
    ctx.mat({ color, roughness: 0.42 })
  );
  g.add(body);
  const geo = new ctx.THREE.CylinderGeometry(0.1 * scale, 0.1 * scale, 0.08 * scale, 14);
  const rubber = ctx.mat({ color: ctx.C.rubber, roughness: 0.86 });
  for (const x of [-0.24, 0.24]) {
    for (const z of [-0.16, 0.16]) {
      const w = ctx.mesh(geo, rubber);
      w.rotation.x = Math.PI / 2;
      w.position.set(x * scale, -0.2 * scale, z * scale);
      g.add(w);
    }
  }
  g.userData.base = 0.1 + 0.3 * scale;
  return g;
}

function wheel(ctx, r) {
  const g = ctx.group();
  const disc = ctx.mesh(
    new ctx.THREE.CylinderGeometry(r, r, 0.14, 28),
    ctx.mat({ color: ctx.C.metal, metalness: 0.62, roughness: 0.28 })
  );
  disc.rotation.x = Math.PI / 2;
  g.add(disc);
  const ring = ctx.mesh(
    new ctx.THREE.TorusGeometry(r, 0.04, 8, 28),
    ctx.mat({ color: ctx.C.metalDark, metalness: 0.45, roughness: 0.4 })
  );
  g.add(ring);
  return g;
}

export const forceScenes = [
  {
    id: "vector",
    chapter: "force",
    chapterNo: "৩",
    chapterName: "বল",
    title: "বলের সামান্তরিক সূত্র",
    blurb: "দুই বলের লব্ধি সামান্তরিকের কর্ণ।",
    keywords: "force vector parallelogram বল ভেক্টর সামান্তরিক লব্ধি",
    formula: "R = √(P² + Q² + 2PQ cosθ)",
    verbal: "একবিন্দুতে দুই বল সামান্তরিকের সন্নিহিত বাহু হলে, কর্ণই লব্ধি।",
    proof: "বলের মান আর দিক দুটোই ধরতে হয়। দুই বলের যোগফল তির্যক তীরটা — একা ওই লব্ধি দিলে একই ফল।",
    note: "বল ভেক্টর রাশি। সরলরেখায় একই দিকে হলে মান যোগ হয়, উল্টো দিকে বিয়োগ হয়। কোণ থাকলে সামান্তরিক সূত্র।",
    duration: 9,
    steps: [
      { t: 0, title: "প্রথম বল", body: "একটা বল ডান দিকে ক্রিয়া করছে। তীরের দৈর্ঘ্য মান, ফলা দিক।" },
      { t: 2.3, title: "দ্বিতীয় বল", body: "একই বিন্দুতে আরেকটি বল তির্যকভাবে। দুটোকে আলাদা আলাদা তীর দিয়ে দেখা যাচ্ছে।" },
      { t: 4.6, title: "সামান্তরিক", body: "তীর দুটিকে সন্নিহিত বাহু ধরে সামান্তরিক পূর্ণ হয়।" },
      { t: 6.4, title: "লব্ধি", body: "মাঝের কর্ণটি লব্ধি বল। এই একটি বলই আগের দুই বলের সম্মিলিত ফল দেয়।" },
    ],
    create(ctx) {
      const { C, arrow, shoot, line, tag, mesh, mat, vec, THREE } = ctx;
      ctx.frame([3.4, 2.8, 5.2], [1.1, 0.9, 0]);
      ctx.spin(false);
      const origin = mesh(new THREE.SphereGeometry(0.08, 16, 12), mat({ color: 0xf4efe4 }));
      origin.position.set(0, 1.15, 0);
      const a = arrow(C.force);
      const b = arrow(C.tension);
      const r = arrow(C.velocity);
      const side1 = line(0xf4efe4, true);
      const side2 = line(0xf4efe4, true);
      const tagA = tag("P", 1.4, 1.45, 0);
      const tagB = tag("Q", 0.5, 2.5, 0);
      const tagR = tag("লব্ধি R", 1.8, 2.2, 0);
      const O = vec(0, 1.15, 0);
      const A = vec(2.35, 0, 0);
      const B = vec(0.8, 1.7, 0);

      return {
        update(t) {
          const p = ctx.seg(t, 0.2, 2.1);
          const q = ctx.seg(t, 2.3, 4.3);
          const box = ctx.seg(t, 4.5, 6.1);
          const res = ctx.seg(t, 6.3, 7.6);
          shoot(a, O, A.clone().multiplyScalar(p));
          shoot(b, O, B.clone().multiplyScalar(q));
          const tipA = O.clone().add(A);
          const tipB = O.clone().add(B);
          const tipR = O.clone().add(A).add(B);
          side1.visible = box > 0.05;
          side2.visible = box > 0.05;
          side1.userData.set(tipA.x, tipA.y, tipA.z, tipA.x + B.x * box, tipA.y + B.y * box, tipA.z);
          side2.userData.set(tipB.x, tipB.y, tipB.z, tipB.x + A.x * box, tipB.y + A.y * box, tipB.z);
          shoot(r, O, A.clone().add(B).multiplyScalar(res));
          tagA.position.set(1.3, 1.35, 0);
          tagA.element.style.opacity = String(p);
          tagB.position.set(0.35, 2.55, 0);
          tagB.element.style.opacity = String(q);
          tagR.position.set(tipR.x * 0.55 + 0.2, tipR.y * 0.72 + 0.3, 0.2);
          tagR.element.style.opacity = String(res);
        },
      };
    },
  },
  {
    id: "newton2",
    chapter: "force",
    chapterNo: "৩",
    chapterName: "বল",
    title: "নিউটনের দ্বিতীয় সূত্র",
    blurb: "একই বল, ভর বেশি হলে ত্বরণ কম।",
    keywords: "newton second law F=ma বল ত্বরণ ভর",
    formula: "F = ma",
    verbal: "বল = ভর × ত্বরণ। ত্বরণ বলের দিকে।",
    proof: "সমান বল দিলে হালকা গাড়ি তাড়াতাড়ি এগোয়, ভারী গাড়ি পিছিয়ে পড়ে। ত্বরণ ভরের ব্যস্তানুপাতিক।",
    note: "ভর স্থির থাকলে বল দ্বিগুণ করলে ত্বরণ দ্বিগুণ। বল স্থির থাকলে ভর দ্বিগুণ করলে ত্বরণ অর্ধেক। বেগ নয় — বল ত্বরণের সাথে যুক্ত।",
    duration: 7,
    steps: [
      { t: 0, title: "সমান বল", body: "দুই গাড়িতে সমান লাল তীর, মানে বল সমান। নিচের গাড়ির ভর তিনগুণ।" },
      { t: 1.2, title: "ত্বরণ আলাদা", body: "হালকা গাড়ি দ্রুত সরে যায়। ভারী গাড়ি একই সময়ে অল্প পথ যায়, কারণ a = F/m।" },
      { t: 4.2, title: "মনে রাখো", body: "F = ma। বল না থাকলে ত্বরণও থাকে না — বেগ বদলায় না।" },
    ],
    create(ctx) {
      const { C, mesh, mat, THREE, arrow, shoot, tag, vec } = ctx;
      ctx.frame([2.4, 3.3, 6.6], [0, 0.5, 0]);
      const rail = mesh(new THREE.BoxGeometry(5.4, 0.06, 1.8), mat({ color: 0x303a3a, roughness: 0.85 }));
      rail.position.set(0, 0.04, 0);
      const light = cart(ctx, 0xf0c36a, 0.85);
      const heavy = cart(ctx, 0x8aa0b8, 1.25);
      const f1 = arrow(C.force);
      const f2 = arrow(C.force);
      const lab1 = tag("ভর m", 0, 1, 0);
      const lab2 = tag("ভর 3m", 0, 1, 0);
      light.position.z = -0.48;
      heavy.position.z = 0.5;

      return {
        update(t) {
          const tau = ctx.clamp(t - 0.7, 0, 2.55);
          const x1 = -1.85 + 0.5 * 0.72 * tau * tau;
          const x2 = -1.85 + 0.5 * 0.24 * tau * tau;
          light.position.x = x1;
          light.position.y = light.userData.base;
          heavy.position.x = x2;
          heavy.position.y = heavy.userData.base;
          const o1 = vec(x1 + 0.35, light.userData.base + 0.15, -0.48);
          const o2 = vec(x2 + 0.5, heavy.userData.base + 0.15, 0.5);
          shoot(f1, o1, vec(1.15, 0, 0));
          shoot(f2, o2, vec(1.15, 0, 0));
          lab1.position.set(x1, light.userData.base + 0.7, -0.48);
          lab2.position.set(x2, heavy.userData.base + 0.85, 0.5);
        },
      };
    },
  },
  {
    id: "torque",
    chapter: "force",
    chapterNo: "৩",
    chapterName: "বল",
    title: "টর্ক",
    blurb: "একই বল দূরে দিলে দরজা সহজে খোলে।",
    keywords: "torque টর্ক moment দরজা ঘূর্ণন বল",
    formula: "τ = r F sinθ",
    verbal: "টর্ক = বল × অক্ষ থেকে লম্ব দূরত্ব।",
    proof: "বল সমান, কিন্তু কব্জা থেকে দূরত্ব বাড়লে টর্ক বাড়ে — দরজা ঘুরে খুলে যায়।",
    note: "এখানে বল দরজার তলের সাথে লম্ব, তাই θ = ৯০° এবং sinθ = ১। তখন τ = rF। হাতল কব্জা থেকে দূরে বলে অল্প বলেই দরজা খোলে।",
    duration: 10,
    steps: [
      { t: 0, title: "কব্জার কাছে", body: "একই লাল বল কব্জার কাছে ঠেলছে। বাহু r ছোট, টর্ক ছোট। দরজা প্রায় নড়ে না।" },
      { t: 4.8, title: "হাতলের কাছে", body: "বলের মান আগের মতোই, কিন্তু এবার হাতলে। r বড়, টর্ক বড়। দরজা খুলে যায়।" },
    ],
    create(ctx) {
      const { THREE, C, mesh, mat, group, arrow, shoot, tag, vec } = ctx;
      ctx.frame([3.3, 2.15, 3.8], [0.7, 1.05, 0.15]);
      ctx.spin(true);
      const frameMat = mat({ color: 0x6d543c, roughness: 0.7 });
      const post = mesh(new THREE.BoxGeometry(0.12, 2.15, 0.12), frameMat);
      post.position.set(-0.15, 1.05, 0);
      const lintel = mesh(new THREE.BoxGeometry(2.35, 0.1, 0.12), frameMat);
      lintel.position.set(0.95, 2.1, 0);
      const door = group();
      door.position.set(-0.08, 0, 0);
      const panel = mesh(new THREE.BoxGeometry(2.05, 1.9, 0.07), mat({ color: 0xc9844e, roughness: 0.62 }));
      panel.position.set(1.02, 1.02, 0);
      door.add(panel);
      const handle = mesh(new THREE.SphereGeometry(0.07, 14, 12), mat({ color: 0xe8d7a8, metalness: 0.4, roughness: 0.3 }));
      handle.position.set(1.82, 1.0, 0.08);
      door.add(handle);
      const force = arrow(C.force);
      const near = tag("r ছোট · τ ছোট", 0.4, 1.7, 0.4);
      const far = tag("r বড় · τ বড়", 1.5, 1.75, 0.8);
      const local = vec();
      const world = vec();
      const dir = vec();

      return {
        update(t) {
          let angle = 0;
          let fx = 0.48;
          let which = "near";
          if (t < 4.7) {
            angle = -0.2 * ctx.seg(t, 0.5, 3.2);
            fx = 0.48;
            which = "near";
          } else {
            angle = -1.18 * ctx.seg(t, 5.15, 8.6);
            fx = 1.86;
            which = "far";
          }
          door.rotation.y = angle;
          local.set(fx, 1.05, 0.16);
          world.copy(local);
          door.localToWorld(world);
          dir.set(fx, 1.05, 1.25);
          door.localToWorld(dir);
          dir.sub(world);
          shoot(force, world, dir);
          near.element.style.opacity = which === "near" ? "1" : "0";
          far.element.style.opacity = which === "far" ? "1" : "0";
          near.position.copy(world).add(vec(0, 0.45, 0.2));
          far.position.copy(world).add(vec(0, 0.48, 0.15));
        },
      };
    },
  },
  {
    id: "tension",
    chapter: "force",
    chapterNo: "৩",
    chapterName: "বল",
    title: "টান",
    blurb: "দড়ির টান ঝুলন্ত বস্তুর ওজনের চেয়ে কম।",
    keywords: "tension টান দড়ি string বল কপিকল",
    formula: "T = m₁ m₂ g / (m₁ + m₂)",
    verbal: "ঘর্ষণহীন টেবিলে টান দুদিকেই সমান, ঝুলন্ত ওজনের চেয়ে ছোট।",
    proof: "দড়ি টানলে ভেতরের টান বস্তুকে টেনে ত্বরণ দেয়। ঝুলন্ত বস্তু নামে, কারণ তার ওজন টানের চেয়ে বেশি।",
    note: "আদর্শ হালকা দড়িতে টান সর্বত্র সমান। এখানে টেবিলের বস্তুর ভর m₁ = 2m, ঝুলন্ত বস্তুর ভর m₂ = m। তাই T = (2/3) m g, আর নিচের দিকে লব্ধি বল m g − T।",
    duration: 7,
    steps: [
      { t: 0, title: "মুক্ত বস্তু", body: "টেবিলের বস্তুতে টান T ডান দিকে। খাড়াভাবে ওজন আর অভিলম্ব বল সমান, তাই ওপর-নিচ নড়ে না।" },
      { t: 1.4, title: "ঝুলন্ত বস্তু", body: "নিচে mg লম্বা তীর, ওপরে T খাটো। অসম বল বলে বস্তু নিচে নামে এবং গতি বাড়তে থাকে।" },
      { t: 3.6, title: "একই টান", body: "দড়ি হালকা ধরলে পুলির দুপাশে টান সমান। দুই বস্তু একই ত্বরণে বাঁধা থাকে।" },
    ],
    create(ctx) {
      const { THREE, C, mesh, mat, arrow, shoot, tag, rod, span, vec } = ctx;
      ctx.frame([4.4, 3.2, 5.6], [0.2, 1.1, 0]);
      const surface = ctx.table({ w: 3.5, d: 1.7, h: 0.78, x: -0.7 });
      const block = mesh(new THREE.BoxGeometry(0.62, 0.4, 0.48), mat({ color: 0xd7b07a, roughness: 0.55 }));
      const hang = mesh(new THREE.BoxGeometry(0.38, 0.38, 0.38), mat({ color: 0xc46a4a, roughness: 0.48 }));
      const pulley = wheel(ctx, 0.22);
      pulley.position.set(1.05, surface + 0.22, 0);
      const ropeA = rod(0.018, C.tension);
      const ropeB = rod(0.018, C.tension);
      const tBlock = arrow(C.tension);
      const nBlock = arrow(C.normal);
      const wBlock = arrow(C.weight);
      const tHang = arrow(C.tension);
      const wHang = arrow(C.weight);
      const lab = tag("T সমান", 0.4, 1.6, 0);
      const px = 1.05;
      const pr = 0.22;
      const cy = surface + pr;

      return {
        update(t) {
          const tau = ctx.clamp(t - 0.4, 0, 4.4);
          const s = Math.min(0.5 * 0.16 * tau * tau, 1.2);
          const bx = -1.05 + s;
          block.position.set(bx, surface + 0.2, 0);
          const hy = surface - 0.15 - s;
          hang.position.set(px + pr, hy, 0);
          const spin = s / pr;
          pulley.rotation.z = -spin;
          span(ropeA, vec(bx + 0.32, surface + 0.34, 0), vec(px, cy + pr * 0.15, 0));
          span(ropeB, vec(px + pr, cy, 0), vec(px + pr, hy + 0.2, 0));
          shoot(tBlock, vec(bx + 0.28, surface + 0.42, 0), vec(0.8, 0, 0));
          shoot(nBlock, vec(bx, surface + 0.7, 0.42), vec(0, 0.62, 0));
          shoot(wBlock, vec(bx, surface + 0.7, 0.42), vec(0, -0.5, 0));
          const oy = Math.max(hy + 0.05, 1.05);
          shoot(tHang, vec(px + pr + 0.28, oy, 0), vec(0, 0.48, 0));
          shoot(wHang, vec(px + pr + 0.28, oy, 0), vec(0, -0.72, 0));
          lab.position.set(bx + 0.9, surface + 0.85, 0);
        },
      };
    },
  },
  {
    id: "pulley-fixed",
    chapter: "force",
    chapterNo: "৩",
    chapterName: "বল",
    title: "স্থির কপিকল",
    blurb: "স্থির কপিকল শুধু বলের দিক বদলায়।",
    keywords: "pulley fixed কপিকল স্থির যান্ত্রিক সুবিধা",
    formula: "যান্ত্রিক সুবিধা = 1",
    verbal: "আদর্শ স্থির কপিকলে ভার আর প্রচেষ্টা সমান।",
    proof: "দড়ি দুপাশে সমান সরে। বল অর্ধেক হয় না — শুধু নিচের দিকে টানলে ভার ওপরে ওঠে।",
    note: "কপিকলের অক্ষ স্থির থাকলে সেটা স্থির কপিকল। ঘর্ষণহীন ও হালকা হলে যান্ত্রিক সুবিধা ১। সুবিধা দিক বদলানোতে।",
    duration: 7.5,
    steps: [
      { t: 0, title: "দিক বদল", body: "ডান দিকে দড়ি টানলে বাঁয়ের ভার ওপরে ওঠে। বল নিচের দিকে, ভারের গতি ওপরের দিকে।" },
      { t: 2.2, title: "সরণ সমান", body: "যতটুকু দড়ি নামে, ভার ঠিক ততটুকু ওঠে। বেগ অনুপাত ১।" },
      { t: 4.4, title: "সুবিধা ১", body: "দুপাশের বস্তু সমান ভারী। আদর্শ স্থির কপিকল বল কমায় না।" },
    ],
    create(ctx) {
      const { C, mesh, mat, THREE, rod, span, tag, vec } = ctx;
      ctx.frame([4.2, 2.8, 5.4], [0, 1.6, 0]);
      const leftPost = rod(0.045, C.metal);
      const rightPost = rod(0.045, C.metal);
      const beam = rod(0.05, C.metal);
      span(leftPost, vec(-1.15, 0, 0), vec(-1.15, 3.05, 0));
      span(rightPost, vec(1.15, 0, 0), vec(1.15, 3.05, 0));
      span(beam, vec(-1.15, 3.05, 0), vec(1.15, 3.05, 0));
      const pulley = wheel(ctx, 0.4);
      pulley.position.set(0, 2.45, 0);
      const hanger = rod(0.03, C.metalDark);
      span(hanger, vec(0, 3.05, 0), vec(0, 2.88, 0));
      const load = mesh(new THREE.BoxGeometry(0.46, 0.46, 0.46), mat({ color: 0xc46a4a, roughness: 0.5 }));
      const effort = mesh(new THREE.BoxGeometry(0.46, 0.46, 0.46), mat({ color: 0x4f8f8a, roughness: 0.5 }));
      const ropeL = rod(0.02, C.tension);
      const ropeR = rod(0.02, C.tension);
      const loadTag = tag("ভার", -0.7, 1, 0);
      const effortTag = tag("প্রচেষ্টা", 0.7, 1, 0);
      const ratio = tag("সরণ সমান", 0, 1.7, 0.4);

      return {
        update(t) {
          const s = 0.95 * ctx.seg(t, 0.3, 5.4);
          const ly = 0.55 + s;
          const ey = 1.65 - s;
          load.position.set(-0.4, ly, 0);
          effort.position.set(0.4, ey, 0);
          pulley.rotation.z = -s / 0.4;
          span(ropeL, vec(-0.4, 2.45, 0), vec(-0.4, ly + 0.28, 0));
          span(ropeR, vec(0.4, 2.45, 0), vec(0.4, ey + 0.28, 0));
          loadTag.position.set(-0.85, ly + 0.15, 0);
          effortTag.position.set(0.9, ey + 0.15, 0);
          ratio.set(`দুপাশে সরণ ${s.toFixed(2)}`);
          ratio.position.set(0, 1.55, 0.55);
        },
      };
    },
  },
  {
    id: "pulley-move",
    chapter: "force",
    chapterNo: "৩",
    chapterName: "বল",
    title: "চল কপিকল",
    blurb: "চল কপিকলে ভার অর্ধেক বল দিয়ে ওঠে।",
    keywords: "movable pulley চল কপিকল যান্ত্রিক সুবিধা টান",
    formula: "যান্ত্রিক সুবিধা = 2",
    verbal: "আদর্শ চল কপিকলে প্রচেষ্টা ভারের অর্ধেক।",
    proof: "ভার দুই খণ্ড দড়িতে ঝোলে। দড়ি ২ একক টানলে ভার ১ একক ওঠে, তাই সুবিধা ২।",
    note: "ওপরের স্থির কপিকল শুধু দিক বদলায়। সুবিধা আসে নিচের চল কপিকল থেকে। আদর্শ যন্ত্রে যান্ত্রিক সুবিধা = ভার / প্রচেষ্টা = বেগ অনুপাত।",
    duration: 8,
    steps: [
      { t: 0, title: "ভার দুই দড়িতে", body: "নিচের চল কপিকলের সাথে ভার বাঁধা। কপিকলটা দড়ির ওপর দিয়ে ওপরে উঠতে পারে।" },
      { t: 2, title: "প্রচেষ্টা অর্ধেক", body: "ছোট বস্তুটি ভারের অর্ধেক। আদর্শ অবস্থায় এতেই ভার সমবেগে ওঠে।" },
      { t: 4.2, title: "সরণ দ্বিগুণ", body: "ভার যত ওঠে, প্রচেষ্টার দিকের দড়ি তার দ্বিগুণ নামে। তাই যান্ত্রিক সুবিধা ২।" },
    ],
    create(ctx) {
      const { C, mesh, mat, THREE, rod, span, tag, vec } = ctx;
      ctx.frame([5.2, 2.7, 6.2], [0.35, 1.6, 0]);
      const posts = [
        [rod(0.045, C.metal), vec(-1.3, 0, 0), vec(-1.3, 3.2, 0)],
        [rod(0.045, C.metal), vec(1.7, 0, 0), vec(1.7, 3.2, 0)],
      ];
      posts.forEach(([m, a, b]) => span(m, a, b));
      const beam = rod(0.05, C.metal);
      span(beam, vec(-1.3, 3.2, 0), vec(1.7, 3.2, 0));
      const fixed = wheel(ctx, 0.28);
      fixed.position.set(1.15, 2.78, 0);
      const moving = wheel(ctx, 0.36);
      const hook = rod(0.028, C.metalDark);
      const load = mesh(new THREE.BoxGeometry(0.7, 0.5, 0.55), mat({ color: 0xc46a4a, roughness: 0.5 }));
      const effort = mesh(new THREE.BoxGeometry(0.36, 0.36, 0.36), mat({ color: 0x4f8f8a, roughness: 0.48 }));
      const ropes = [rod(0.02, C.tension), rod(0.02, C.tension), rod(0.02, C.tension)];
      const loadTag = tag("ভার W", -0.2, 0.6, 0);
      const effortTag = tag("প্রচেষ্টা W/2", 1.5, 1, 0);
      const moveTag = tag("ভারের সরণ", 0, 1, 0);

      return {
        update(t) {
          const h = 0.5 * ctx.seg(t, 0.4, 6.2);
          const yM = 1.2 + h;
          const yE = 1.9 - 2 * h;
          moving.position.set(-0.15, yM, 0);
          moving.rotation.z = (2 * h) / 0.36;
          fixed.rotation.z = (2 * h) / 0.28;
          load.position.set(-0.15, yM - 0.78, 0);
          effort.position.set(1.43, yE, 0);
          span(hook, vec(-0.15, yM - 0.36, 0), vec(-0.15, yM - 0.5, 0));
          span(ropes[0], vec(-0.5, 3.2, 0), vec(-0.51, yM, 0));
          span(ropes[1], vec(0.21, yM, 0), vec(0.87, 2.78, 0));
          span(ropes[2], vec(1.43, 2.78, 0), vec(1.43, yE + 0.22, 0));
          loadTag.position.set(-0.75, yM - 0.85, 0);
          effortTag.position.set(1.95, yE + 0.15, 0);
          moveTag.position.set(0.5, 0.45, 0.6);
          moveTag.set(`ভার ↑ ${h.toFixed(2)}   প্রচেষ্টা ↓ ${(2 * h).toFixed(2)}`);
        },
      };
    },
  },
  {
    id: "friction",
    chapter: "force",
    chapterNo: "৩",
    chapterName: "বল",
    title: "ঘর্ষণ",
    blurb: "স্থিতি ঘর্ষণ সামলায়, সীমা ছাড়ালে গতি।",
    keywords: "friction ঘর্ষণ স্থিতি গতি বল",
    formula: "f = μ N",
    verbal: "ঘর্ষণ অভিলম্ব প্রতিক্রিয়ার সমানুপাতিক, গতির বিরুদ্ধে।",
    proof: "ছোট বলকে স্থিতি ঘর্ষণ আটকায়। বল সীমা ছাড়ালে বস্তু চলে, ছেড়ে দিলে গতি ঘর্ষণ থামায়।",
    note: "স্থিতি ঘর্ষণ প্রযুক্ত বলের সমান হয়ে বাড়তে পারে, একটা সর্বোচ্চ সীমা পর্যন্ত। চলতে শুরু করলে গতি ঘর্ষণ প্রায় স্থির থাকে এবং বেগের উল্টো দিকে কাজ করে।",
    duration: 9.5,
    steps: [
      { t: 0, title: "স্থিতি ঘর্ষণ", body: "ঠেলা ছোট। ঘর্ষণ ঠিক সমান ও উল্টো দিকে, তাই বাক্স নড়ে না।" },
      { t: 3.8, title: "সীমা ছাড়াল", body: "ঠেলা বাড়ল। ঘর্ষণ আর সামলাতে পারছে না। নিট বল মাটির দিকে ত্বরণ দেয় — F − f = ma।" },
      { t: 6.5, title: "ছেড়ে দিলে থামে", body: "ঠেলা সরিয়ে নিলে শুধু গতি ঘর্ষণ থাকে। বেগ কমে বাক্স থেমে যায়।" },
    ],
    create(ctx) {
      const { C, mesh, mat, THREE, arrow, shoot, tag, vec } = ctx;
      ctx.frame([4.6, 3.1, 5.2], [0, 0.9, 0]);
      const surface = ctx.table({ w: 5.2, d: 1.8, h: 0.78 });
      const box = mesh(new THREE.BoxGeometry(0.7, 0.42, 0.5), mat({ color: 0xd7b07a, roughness: 0.58 }));
      const push = arrow(C.force);
      const fr = arrow(C.friction);
      const label = tag("স্থিতি ঘর্ষণ", 0, 1.6, 0);
      const x0 = -1.55;
      const t0 = 3.8;
      const t1 = 6.5;
      const a = 0.48;
      const fk = 1.05;

      return {
        update(t) {
          let x = x0;
          let phase = "স্থিতি ঘর্ষণ = প্রযুক্ত বল";
          let F = 0.75;
          let f = 0.75;
          if (t < 1.2) {
            F = 0.45;
            f = 0.45;
          } else if (t < t0) {
            F = 0.9;
            f = 0.9;
          } else if (t < t1) {
            const dt = t - t0;
            x = x0 + 0.5 * a * dt * dt;
            F = 1.7;
            f = fk;
            phase = "প্রযুক্ত বল > ঘর্ষণ";
          } else {
            const dt1 = t1 - t0;
            const v1 = a * dt1;
            const x1 = x0 + 0.5 * a * dt1 * dt1;
            const dt = t - t1;
            const v = v1 - fk * dt;
            F = 0;
            if (v <= 0) {
              const ts = v1 / fk;
              x = x1 + v1 * ts - 0.5 * fk * ts * ts;
              f = 0;
              phase = "থেমে গেছে";
            } else {
              x = x1 + v1 * dt - 0.5 * fk * dt * dt;
              f = fk;
              phase = "গতি ঘর্ষণ থামাচ্ছে";
            }
          }
          box.position.set(x, surface + 0.21, 0);
          shoot(push, vec(x - 0.55, surface + 0.48, 0), vec(F * 0.62, 0, 0));
          shoot(fr, vec(x + 0.48, surface + 0.48, 0), vec(-f * 0.55, 0, 0));
          label.position.set(x, surface + 0.95, 0);
          label.set(phase);
        },
      };
    },
  },
  {
    id: "inertia",
    chapter: "force",
    chapterNo: "৩",
    chapterName: "বল",
    title: "জড়তা",
    blurb: "কার্ড সরে, মুদ্রা সোজা নিচে পড়ে।",
    keywords: "inertia জড়তা newton first coin card নিউটন প্রথম",
    formula: "F = 0 হলে v স্থির",
    verbal: "নিট বল শূন্য হলে স্থির বস্তু স্থিরই থাকে।",
    proof: "কার্ড টানলে মুদ্রার ওপর অনুভূমিক বল নেই। জড়তার জন্য মুদ্রা সোজা নিচে গ্লাসে পড়ে।",
    note: "নিউটনের প্রথম সূত্রই জড়তার সূত্র। বস্তু নিজে থেকে তার বেগ বদলাতে চায় না। বেগ বদলাতে নিট বল লাগে।",
    duration: 6.5,
    steps: [
      { t: 0, title: "মুদ্রা কার্ডের ওপর", body: "গ্লাসের মুখে কার্ড, তার ওপর মুদ্রা। সব স্থির — জড়তা এই অবস্থা ধরে রাখতে চায়।" },
      { t: 1.5, title: "কার্ড সরে", body: "কার্ডকে পাশে টানা হলো। মুদ্রা কার্ডের সাথে সরে না, কারণ তাকে সরিয়ে নেওয়ার মতো ঘর্ষণ যথেষ্ট নয়।" },
      { t: 2.6, title: "সোজা নিচে", body: "অনুভূমিক বল শূন্য, তাই অনুভূমিক বেগ শূন্য। অভিকর্ষ মুদ্রাকে সোজা গ্লাসে নামায়।" },
    ],
    create(ctx) {
      const { THREE, C, mesh, mat, glass, tag, line, vec } = ctx;
      ctx.frame([3.2, 2.8, 4.2], [0.1, 1.25, 0]);
      const surface = ctx.table({ w: 3.4, d: 1.8, h: 0.78 });
      const gmat = glass({ opacity: 0.38 });
      const cup = mesh(new THREE.CylinderGeometry(0.36, 0.28, 0.72, 28, 1, true), gmat);
      cup.position.set(0, surface + 0.36, 0);
      const base = mesh(new THREE.CircleGeometry(0.28, 24), gmat, false);
      base.rotation.x = -Math.PI / 2;
      base.position.set(0, surface + 0.02, 0);
      const card = mesh(new THREE.BoxGeometry(0.78, 0.03, 0.5), mat({ color: 0xf4efe4, roughness: 0.55 }));
      const coin = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 20), mat({ color: 0xe2b84a, metalness: 0.6, roughness: 0.3 }));
      const finger = mesh(new THREE.SphereGeometry(0.1, 14, 12), mat({ color: 0xe7b89a, roughness: 0.6 }));
      const drop = line(0xf2d48a, true);
      const lab = tag("অনুভূমিক বেগ শূন্য", 0, 2, 0);
      const rim = surface + 0.74;

      return {
        update(t) {
          const flick = ctx.seg(t, 1.45, 1.85);
          const cardX = flick * 1.8;
          card.position.set(cardX, rim, 0);
          card.visible = cardX < 1.55;
          const tau = Math.max(0, t - 1.5);
          const fall = 0.5 * 2.4 * tau * tau;
          const coinY = Math.max(surface + 0.28, rim + 0.06 - fall);
          coin.position.set(0, coinY, 0);
          const touched = t > 1.35 && t < 1.9;
          finger.visible = touched;
          finger.position.set(-0.55 + flick * 0.4, rim, 0);
          drop.userData.set(0, rim + 0.06, 0, 0, coinY, 0);
          drop.visible = t > 1.5;
          lab.position.set(0.15, coinY + 0.38, 0);
          lab.element.style.opacity = t > 1.7 ? "1" : "0";
        },
      };
    },
  },
  {
    id: "reaction",
    chapter: "force",
    chapterNo: "৩",
    chapterName: "বল",
    title: "ক্রিয়া ও প্রতিক্রিয়া",
    blurb: "ধাক্কা সমান, হালকা বস্তুর বেগ বেশি।",
    keywords: "newton third action reaction ক্রিয়া প্রতিক্রিয়া",
    formula: "F₁₂ = − F₂₁",
    verbal: "দুই বস্তুর পরস্পর বল সমান ও বিপরীত।",
    proof: "স্প্রিং ছাড়লে দুই গাড়ি উল্টো দিকে ধাক্কা খায়। বল সমান, তাই হালকা গাড়ির বেগ বেশি।",
    note: "ক্রিয়া ও প্রতিক্রিয়া এক বস্তুর ওপর পড়ে না — তাই তারা একে অপরকে বাতিল করে না। ভিন্ন ভিন্ন বস্তুর ওপর লাগে। ভরবেগের পরিবর্তন সমান ও বিপরীত।",
    duration: 7,
    steps: [
      { t: 0, title: "স্প্রিং চাপা", body: "দুই গাড়ি একসাথে। মাঝের স্প্রিং সংকুচিত। ছোট গাড়ির ভর m, বড়টার 2m।" },
      { t: 1.4, title: "সমান ধাক্কা", body: "ছেড়ে দিলে লাল তীর দুটি সমান লম্বা, দিক উল্টো। বল সমান।" },
      { t: 3.2, title: "বেগ উল্টো অনুপাতে", body: "হালকা গাড়ি দ্বিগুণ বেগে সরে। m v সমান থাকলে ভর বেশি হলে বেগ কম।" },
    ],
    create(ctx) {
      const { THREE, C, arrow, shoot, tag, vec, mat, mesh } = ctx;
      ctx.frame([5.4, 3.2, 6.4], [0, 0.5, 0]);
      const light = cart(ctx, 0xf0c36a, 0.8);
      const heavy = cart(ctx, 0x8aa0b8, 1.15);
      const pts = [];
      const turns = 8;
      for (let i = 0; i <= 80; i++) {
        const u = i / 80;
        const a = u * turns * Math.PI * 2;
        pts.push(new THREE.Vector3((u - 0.5) * 0.9, Math.cos(a) * 0.13, Math.sin(a) * 0.13));
      }
      const spring = mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.018, 6, false),
        mat({ color: C.metal, metalness: 0.7, roughness: 0.28 })
      );
      const f1 = arrow(C.force);
      const f2 = arrow(C.force);
      const v1 = arrow(C.velocity);
      const v2 = arrow(C.velocity);
      const lab = tag("বল সমান", 0, 1.2, 0);

      return {
        update(t) {
          const tau = Math.max(0, t - 1.35);
          const x1 = -0.62 - 1.05 * tau;
          const x2 = 0.72 + 0.525 * tau;
          light.position.set(x1, light.userData.base, 0);
          heavy.position.set(x2, heavy.userData.base, 0);
          const gap = x2 - x1;
          spring.position.set((x1 + x2) / 2, 0.32, 0);
          spring.scale.x = ctx.clamp(gap / 1.5, 0.35, 2.4);
          spring.visible = gap < 1.75;
          const push = ctx.seg(t, 1.2, 1.7) * (1 - ctx.seg(t, 2.5, 3.3));
          shoot(f1, vec(x1 + 0.2, 0.55, 0), vec(-1.05 * push, 0, 0));
          shoot(f2, vec(x2 - 0.25, 0.62, 0), vec(1.05 * push, 0, 0));
          const moving = tau > 0.05 ? 1 : 0;
          shoot(v1, vec(x1, light.userData.base + 0.45, 0), vec(-1.15 * moving, 0, 0));
          shoot(v2, vec(x2, heavy.userData.base + 0.55, 0), vec(0.58 * moving, 0, 0));
          lab.position.set(0, 1.35, 0);
          lab.set(t < 3 ? "ক্রিয়া = প্রতিক্রিয়া" : "হালকা গাড়ির বেগ দ্বিগুণ");
        },
      };
    },
  },
  {
    id: "collision",
    chapter: "force",
    chapterNo: "৩",
    chapterName: "বল",
    title: "ভরবেগের সংরক্ষণ",
    blurb: "সমান ভরের ধাক্কায় বেগ বদল হয়।",
    keywords: "momentum collision ভরবেগ সংঘর্ষ সংরক্ষণ",
    formula: "m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂",
    verbal: "বাইরের বল না থাকলে মোট ভরবেগ আগে পরে সমান।",
    proof: "সমান দুই বলের স্থিতিস্থাপক ধাক্কায় চলা বল থেমে যায়, দাঁড়ানো বল সেই বেগ নিয়ে এগোয়।",
    note: "ভরবেগ = ভর × বেগ, একটি ভেক্টর। এই দৃশ্যে ভর সমান এবং ধাক্কা স্থিতিস্থাপক, তাই বেগ পরস্পর বিনিময় হয়। মোট ভরবেগ একই থাকে।",
    duration: 5.5,
    steps: [
      { t: 0, title: "আগে", body: "বাঁয়ের বলের বেগ আছে, ডানদিকের বল স্থির। মোট ভরবেগ বাঁয়ের বলেরটাই।" },
      { t: 1.7, title: "ধাক্কা", body: "স্পর্শের সময় ভেতরের বল সমান ও উল্টো। বাইরে থেকে কোনো বল নেই।" },
      { t: 2.4, title: "পরে", body: "বাঁয়ের বল থামল, ডানদিকের বল একই বেগে চলল। মোট ভরবেগ আগের সমান।" },
    ],
    create(ctx) {
      const { THREE, C, mesh, mat, arrow, shoot, tag, vec } = ctx;
      ctx.frame([4.2, 2.6, 5.6], [0, 0.45, 0]);
      const track = mesh(new THREE.BoxGeometry(6.2, 0.08, 0.7), mat({ color: 0x303a3a, roughness: 0.8 }));
      track.position.set(0.2, 0.06, 0);
      const a = mesh(new THREE.SphereGeometry(0.28, 28, 18), mat({ color: 0xf0c36a, roughness: 0.32 }));
      const b = mesh(new THREE.SphereGeometry(0.28, 28, 18), mat({ color: 0x7eb0d8, roughness: 0.32 }));
      const va = arrow(C.velocity);
      const vb = arrow(C.velocity);
      const lab = tag("মোট ভরবেগ সমান", 0, 1.3, 0);
      const speed = 1.15;
      const hit = 1.64;
      const rest = 0.4;

      return {
        update(t) {
          let x1;
          let x2;
          let leftMoving = true;
          if (t < hit) {
            x1 = -2.05 + speed * t;
            x2 = rest;
          } else {
            x1 = -2.05 + speed * hit;
            x2 = rest + speed * (t - hit);
            leftMoving = false;
          }
          a.position.set(x1, 0.36, 0);
          b.position.set(x2, 0.36, 0);
          shoot(va, vec(x1, 0.75, 0), leftMoving ? vec(1.2, 0, 0) : vec(0, 0, 0));
          shoot(vb, vec(x2, 0.75, 0), leftMoving ? vec(0, 0, 0) : vec(1.2, 0, 0));
          lab.position.set((x1 + x2) / 2, 1.25, 0);
          lab.set(leftMoving ? "আগে: শুধু বাঁয়ে ভরবেগ" : "পরে: শুধু ডানে, মান সমান");
        },
      };
    },
  },
];
