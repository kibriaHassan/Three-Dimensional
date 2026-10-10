export const motionScenes = [
  {
    id: "path",
    chapter: "motion",
    chapterNo: "২",
    chapterName: "গতি",
    title: "দূরত্ব ও সরণ",
    blurb: "বাঁকা পথে দূরত্ব আর সোজা সরণ এক নয়।",
    keywords: "distance displacement দূরত্ব সরণ স্কেলার ভেক্টর path",
    formula: "দূরত্ব ≥ |সরণ|",
    verbal: "দূরত্ব পথের মোট দৈর্ঘ্য, সরণ শুরু থেকে শেষের সরলরেখা।",
    proof: "একই যাত্রায় পথ ঘুরলে দূরত্ব বাড়ে, সরণ শুধু শুরু ও শেষ বিন্দু দেখে।",
    note: "দূরত্ব স্কেলার — মান আছে, দিক নেই। সরণ ভেক্টর — মান ও দিক দুটোই আছে। তাই দূরত্ব কখনো সরণের মানের চেয়ে ছোট হয় না।",
    duration: 8,
    steps: [
      { t: 0, title: "যাত্রা শুরু", body: "বলটি টেবিলের ওপর এক কোণা ঘুরে যাবে। পথের দাগ ধীরে ধীরে লম্বা হয় — এটাই দূরত্ব।" },
      { t: 4.6, title: "সরণ আলাদা", body: "চলা থামলে শুরু থেকে শেষ পর্যন্ত একটা সোজা তীর আসে। ওটা সরণ। ঘোরানো পথের চেয়ে এই তীর খাটো।" },
    ],
    create(ctx) {
      const { THREE, C, mesh, mat, add, arrow, shoot, tag, poly, vec } = ctx;
      ctx.frame([4.2, 4.6, 4.4], [0, 0.4, 0]);
      ctx.spin(true);
      const y = 0.28;
      const A = vec(-1.8, y, -1);
      const B = vec(1.05, y, -1);
      const Cc = vec(1.05, y, 1.2);
      const ball = mesh(new THREE.SphereGeometry(0.16, 24, 18), mat({ color: 0xf2d48a, roughness: 0.35 }));
      const trail = poly(0xf2d48a, 48);
      const disp = arrow(C.displacement);
      const startMark = mesh(new THREE.SphereGeometry(0.07, 12, 10), mat({ color: C.velocity }));
      startMark.position.copy(A);
      const distTag = tag("দূরত্ব", -1.2, 0.85, -1);
      const dispTag = tag("সরণ", -0.3, 1.15, 0.1);
      const scaleA = vec(-2.2, 0.02, 1.7);
      const scaleB = vec(-1.2, 0.02, 1.7);
      const ruler = ctx.rod(0.015, C.ink);
      ctx.span(ruler, scaleA, scaleB);
      tag("১ একক", -1.7, 0.28, 1.7);
      const ab = A.distanceTo(B);
      const bc = B.distanceTo(Cc);
      const straight = A.distanceTo(Cc);

      function at(u) {
        if (u < 0.5) return A.clone().lerp(B, u / 0.5);
        return B.clone().lerp(Cc, (u - 0.5) / 0.5);
      }

      return {
        update(t) {
          const u = Math.min(t / 5.2, 1);
          const p = at(u);
          ball.position.copy(p);
          const arr = trail.geometry.attributes.position.array;
          const n = trail.userData.count;
          for (let i = 0; i < n; i++) {
            const q = at(u * (i / (n - 1)));
            arr[i * 3] = q.x;
            arr[i * 3 + 1] = 0.08;
            arr[i * 3 + 2] = q.z;
          }
          trail.geometry.attributes.position.needsUpdate = true;
          const travelled = u < 0.5 ? (u / 0.5) * ab : ab + ((u - 0.5) / 0.5) * bc;
          distTag.position.set(p.x, 0.78, p.z);
          distTag.set(`দূরত্ব ${travelled.toFixed(2)}`);
          const show = ctx.seg(t, 5.1, 6.1);
          disp.visible = show > 0.02;
          const delta = Cc.clone().sub(A);
          shoot(disp, A.clone().setY(0.62), delta.multiplyScalar(show));
          dispTag.position.set((A.x + Cc.x) / 2, 1.2, (A.z + Cc.z) / 2);
          dispTag.set(show > 0.4 ? `সরণ ${straight.toFixed(2)}` : "");
          dispTag.element.style.opacity = String(show);
        },
      };
    },
  },
  {
    id: "freefall",
    chapter: "motion",
    chapterNo: "২",
    chapterName: "গতি",
    title: "মুক্তপতন",
    blurb: "ভারী আর হালকা, বাধা না থাকলে একসাথে পড়ে।",
    keywords: "freefall gravity গতি মুক্তপতন অভিকর্ষ g",
    formula: "h = ½ g t²",
    verbal: "স্থির থেকে ছাড়লে সময়ে যতটা, উচ্চতা সময়ের বর্গের সাথে বাড়ে।",
    proof: "বায়ুর বাধা না থাকলে ভর যাই হোক, ত্বরণ একই g। তাই দুই বল একসাথে মাটিতে পড়ে।",
    note: "প্রতি সেকেন্ডে বেগ বাড়ে g এর মানে, প্রায় ৯.৮ m/s²। বইয়ের অঙ্কে অনেক সময় g = ৯.৮ বা ১০ m/s² নেওয়া হয়। এখানকার দৃশ্য সময় একটু ধীর, যাতে পড়াটা চোখে ধরা যায়।",
    duration: 6.5,
    steps: [
      { t: 0, title: "একসাথে ছাড়া", body: "বড় আর ছোট বল একই উচ্চতা থেকে ছাড়া হলো। ওপরের দিকে কোনো টান নেই, নিচে অভিকর্ষ।" },
      { t: 1.5, title: "ফাঁক বাড়ে সময়ের বর্গে", body: "সমান সময়ের ছাপে দাগগুলো নিচে ক্রমশ দূরে দূরে। প্রথম সেকেন্ডের চেয়ে পরের সেকেন্ডে বেশি পথ।" },
      { t: 3.3, title: "একসাথে ভূমি", body: "ভর আলাদা, কিন্তু মাটি স্পর্শ একই মুহূর্তে। মুক্তপতনে ত্বরণ ভরের ওপর নির্ভর করে না।" },
    ],
    create(ctx) {
      const { THREE, C, mesh, mat, arrow, shoot, tag, vec } = ctx;
      ctx.frame([0.6, 2.15, 8.6], [0.05, 1.55, 0]);
      ctx.spin(false);
      const heavy = mesh(new THREE.SphereGeometry(0.28, 28, 20), mat({ color: 0xd7dee6, metalness: 0.55, roughness: 0.28 }));
      const light = mesh(new THREE.SphereGeometry(0.16, 24, 18), mat({ color: 0xf0c36a, roughness: 0.35 }));
      heavy.position.x = -0.45;
      light.position.x = 0.55;
      const gArrow = arrow(C.weight);
      const marks = [];
      for (let i = 0; i < 5; i++) {
        const m = mesh(new THREE.SphereGeometry(0.045, 10, 8), mat({ color: 0xf4efe4, emissive: 0xf4efe4, emissiveIntensity: 0.2 }), false);
        m.position.x = -1.15;
        marks.push(m);
      }
      const heavyTag = tag("ভারী", -0.45, 4.55, 0);
      const lightTag = tag("হালকা", 0.55, 4.55, 0);
      const g = 3.6;
      const y0 = 3.05;
      const ground = 0.28;
      const fallT = Math.sqrt((2 * (y0 - ground)) / g);
      const start = 0.45;

      return {
        update(t) {
          const tau = Math.max(0, t - start);
          const y = Math.max(ground, y0 - 0.5 * g * tau * tau);
          heavy.position.y = y;
          light.position.y = y;
          heavyTag.position.set(-0.45, y + 0.48, 0);
          lightTag.position.set(0.55, y + 0.4, 0);
          const squash = y <= ground + 0.001 ? 0.82 : 1;
          heavy.scale.y = squash;
          light.scale.y = squash;
          shoot(gArrow, vec(1.25, y + 0.2, 0), vec(0, -1.15, 0));
          for (let i = 0; i < marks.length; i++) {
            const mt = (i + 1) * (fallT / marks.length);
            const my = y0 - 0.5 * g * mt * mt;
            marks[i].position.y = Math.max(ground, my);
            marks[i].visible = tau >= mt;
          }
        },
      };
    },
  },
  {
    id: "projectile",
    chapter: "motion",
    chapterNo: "২",
    chapterName: "গতি",
    title: "প্রক্ষেপ্য গতি",
    blurb: "অনুভূমিক বেগ থাকে, খাড়া বেগ বদলায়।",
    keywords: "projectile প্রক্ষেপ্য নিক্ষেপ parabola গতি",
    formula: "x = vₓ t ,   y = vᵧ t − ½ g t²",
    verbal: "আড়াআড়ি আর খাড়া গতি আলাদা। আড়াআড়িতে ত্বরণ শূন্য।",
    proof: "ছুড়ে দিলে পথ বাঁকা হয়, কারণ খাড়া বেগ অভিকর্ষে বদলায়, অনুভূমিক বেগ একই থাকে।",
    note: "সর্বোচ্চ উচ্চতায় খাড়া বেগ শূন্য, কিন্তু অনুভূমিক বেগ তখনও আছে। তাই বল ওপরে থেমে ঝুলে থাকে না।",
    duration: 6.2,
    steps: [
      { t: 0, title: "ছুড়ে দেওয়া", body: "বলের বেগের দুই অংশ: সামনের দিকে vₓ, ওপরের দিকে vᵧ।" },
      { t: 1.6, title: "ওপরে vᵧ কমে", body: "সবুজ তীর প্রায় একই থাকে। নীল খাড়া তীর ছোট হতে হতে উল্টে যায় — ওঠা থেকে নামা।" },
      { t: 3.4, title: "বাঁকা পথ", body: "দুই বেগ মিলে পথটা পরাবৃত্ত। মাটিতে নামার সময় অনুভূমিক বেগ সেই আগেরটাই।" },
    ],
    create(ctx) {
      const { THREE, C, mesh, mat, arrow, shoot, tag, poly, vec } = ctx;
      ctx.frame([1.2, 2.5, 7.2], [0.2, 1.3, 0]);
      ctx.spin(false);
      const ball = mesh(new THREE.SphereGeometry(0.14, 24, 16), mat({ color: 0xf28b62, roughness: 0.4 }));
      const trail = poly(0xf2d48a, 70);
      const vxA = arrow(C.velocity);
      const vyA = arrow(C.weight);
      const vxTag = tag("vₓ স্থির", 0, 1, 0);
      const vyTag = tag("vᵧ", 0, 1, 0);
      const vx = 1.55;
      const vy0 = 4.35;
      const g = 3.5;
      const y0 = 0.28;
      const x0 = -2.15;
      const tof = (2 * vy0) / g;

      return {
        update(t) {
          const tau = ctx.clamp(t - 0.35, 0, tof);
          const x = x0 + vx * tau;
          const y = y0 + vy0 * tau - 0.5 * g * tau * tau;
          const vy = vy0 - g * tau;
          ball.position.set(x, Math.max(y0, y), 0);
          const arr = trail.geometry.attributes.position.array;
          const n = trail.userData.count;
          for (let i = 0; i < n; i++) {
            const s = tau * (i / (n - 1));
            arr[i * 3] = x0 + vx * s;
            arr[i * 3 + 1] = Math.max(y0, y0 + vy0 * s - 0.5 * g * s * s);
            arr[i * 3 + 2] = 0;
          }
          trail.geometry.attributes.position.needsUpdate = true;
          shoot(vxA, vec(x, y + 0.05, 0), vec(1.15, 0, 0));
          const vyVec = vec(0, Math.sign(vy || 1) * ctx.clamp(Math.abs(vy) * 0.22, 0.12, 1.3), 0);
          if (Math.abs(vy) < 0.25) vyVec.set(0, 0, 0);
          shoot(vyA, vec(x, y + 0.05, 0), vyVec);
          vxTag.position.set(x + 0.85, y + 0.35, 0);
          vxTag.set("vₓ স্থির");
          vyTag.position.set(x - 0.15, y + vyVec.y + 0.25, 0);
          vyTag.set(vy >= 0 ? "vᵧ ওপরে" : "vᵧ নিচে");
          vyTag.element.style.opacity = Math.abs(vy) < 0.25 ? "0" : "1";
        },
      };
    },
  },
];
