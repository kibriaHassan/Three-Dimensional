export const matterScenes = [
  {
    id: "work",
    chapter: "energy",
    chapterNo: "৪",
    chapterName: "কাজ, ক্ষমতা ও শক্তি",
    title: "কাজ",
    blurb: "বল আর সরণ এক দিকে হলেই কাজ হয়।",
    keywords: "work কাজ বল সরণ cos energy",
    formula: "W = F s cosθ",
    verbal: "কাজ = বল × সরণ × মাঝের কোণের কোসাইন।",
    proof: "বল সরণের দিকে থাকলে কাজ হয়। বল সরণের সাথে লম্ব হলে কাজ শূন্য।",
    note: "θ = ০° হলে cosθ = ১, কাজ সবচেয়ে বেশি। θ = ৯০° হলে cosθ = ০, বল সরাসরি সরণের ওপর কোনো কাজ করে না। ক্ষমতা হলো সময় প্রতি কাজ, P = W/t।",
    duration: 8,
    steps: [
      { t: 0, title: "বল সরণের দিকে", body: "বাক্স ডানে যাচ্ছে, বলও ডানে। θ = ০°, তাই W = Fs। কাজ ধনাত্মক।" },
      { t: 4.1, title: "বল লম্বভাবে", body: "বাক্স আগের মতো ডানে চলছে, কিন্তু বল এখন ওপরের দিকে। θ = ৯০°, কাজ শূন্য।" },
    ],
    create(ctx) {
      const { THREE, C, mesh, mat, arrow, shoot, tag, vec } = ctx;
      ctx.frame([4.4, 3.0, 5.4], [0, 0.9, 0]);
      const surface = ctx.table({ w: 4.8, d: 1.7, h: 0.78 });
      const box = mesh(new THREE.BoxGeometry(0.62, 0.4, 0.48), mat({ color: 0xd7b07a, roughness: 0.55 }));
      const f = arrow(C.force);
      const s = arrow(C.displacement);
      const lab = tag("W = Fs", 0, 1.5, 0);

      return {
        update(t) {
          const slide = (t % 4) / 4;
          const x = -1.4 + slide * 2.4;
          box.position.set(x, surface + 0.2, 0);
          const perp = t >= 4.1;
          shoot(f, vec(x - 0.15, surface + 0.55, 0), perp ? vec(0, 1.05, 0) : vec(1.15, 0, 0));
          shoot(s, vec(x - 0.7, surface + 0.15, 0.45), vec(1.3, 0, 0));
          lab.position.set(x, surface + 1.15, 0);
          lab.set(perp ? "θ = 90° · কাজ শূন্য" : "θ = 0° · W = Fs");
        },
      };
    },
  },
  {
    id: "energy",
    chapter: "energy",
    chapterNo: "৪",
    chapterName: "কাজ, ক্ষমতা ও শক্তি",
    title: "শক্তির রূপান্তর",
    blurb: "বিভব কমে, গতিশক্তি বাড়ে, যোগফল থাকে।",
    keywords: "energy kinetic potential শক্তি বিভব গতিশক্তি",
    formula: "mgh = ½ mv²",
    verbal: "ঘর্ষণ না থাকলে হারানো বিভব শক্তি গতিশক্তিতে যায়।",
    proof: "উঁচু থেকে নামলে বিভব কমে, গতি বাড়ে। দুই শক্তির যোগফল এই দৃশ্যে স্থির।",
    note: "যান্ত্রিক শক্তি = গতিশক্তি + বিভব শক্তি। ঘর্ষণ থাকলে কিছু শক্তি তাপ হয়ে যায়, যোগফল আর স্থির থাকে না। এ দৃশ্য ঘর্ষণহীন।",
    duration: 7.2,
    steps: [
      { t: 0, title: "ওপরে বিভব", body: "গাড়ি প্রায় থেমে আছে ওপরে। নীল স্তম্ভ বিভব শক্তি, সবুজ স্তম্ভ গতিশক্তি।" },
      { t: 1.6, title: "নামতে নামতে", body: "উচ্চতা কমছে, বেগ বাড়ছে। নীল স্তম্ভ খাটো হয়, সবুজ লম্বা হয়।" },
      { t: 4.8, title: "যোগফল", body: "সোনালি স্তম্ভ মোট যান্ত্রিক শক্তি। সেটা একই থাকে — শক্তি নষ্ট হয়নি, রূপ বদলেছে।" },
    ],
    create(ctx) {
      const { THREE, C, mesh, mat, group, tag } = ctx;
      ctx.frame([5.2, 3.0, 5.8], [0.2, 1.1, 0]);
      const rig = group();
      rig.position.set(-0.15, 1.2, 0);
      rig.rotation.z = -0.42;
      const ramp = mesh(new THREE.BoxGeometry(3.5, 0.1, 1.15), mat({ color: C.wood, roughness: 0.7 }));
      rig.add(ramp);
      const car = mesh(new THREE.BoxGeometry(0.42, 0.28, 0.36), mat({ color: 0xc46a4a, roughness: 0.45 }));
      rig.add(car);
      function bar(color, x) {
        const m = mesh(new THREE.BoxGeometry(0.28, 1, 0.28), mat({ color, roughness: 0.4, emissive: color, emissiveIntensity: 0.08 }));
        m.position.x = x;
        return m;
      }
      const pe = bar(C.weight, 2.55);
      const ke = bar(C.velocity, 3.0);
      const total = bar(C.tension, 3.45);
      tag("বিভব", 2.55, 2.15, 0);
      tag("গতি", 3.0, 2.15, 0);
      tag("মোট", 3.45, 2.15, 0);

      function setBar(m, h) {
        const H = Math.max(h, 0.05);
        m.scale.y = H;
        m.position.y = 0.08 + H / 2;
      }

      return {
        update(t) {
          const s = ctx.smooth((t - 0.35) / 5.2);
          car.position.set(-1.45 + s * 2.9, 0.2, 0);
          setBar(pe, 1.55 * (1 - s) + 0.12);
          setBar(ke, 1.55 * s + 0.12);
          setBar(total, 1.79);
        },
      };
    },
  },
  {
    id: "pressure",
    chapter: "matter",
    chapterNo: "৫",
    chapterName: "পদার্থের অবস্থা ও চাপ",
    title: "তরলের গভীরতা ও চাপ",
    blurb: "যত গভীর, তরল তত জোরে বেরোয়।",
    keywords: "pressure depth তরল চাপ গভীরতা torricelli",
    formula: "P = ρgh ,   v = √(2gh)",
    verbal: "গভীরতা বাড়লে চাপ বাড়ে, ফোয়ারার বেগও বাড়ে।",
    proof: "একই পাত্রের নিচের ছিদ্র থেকে পানি দ্রুত ও দূরে যায়, কারণ সেখানে চাপ বেশি।",
    note: "তরলের মুক্ত পৃষ্ঠ থেকে গভীরতা h হলে চাপ ρgh। ছিদ্র দিয়ে বেরোনোর দ্রুতি √(2gh) — মুক্তপতনের বেগের মতোই।",
    duration: 8,
    steps: [
      { t: 0, title: "তিনটি ছিদ্র", body: "পাত্রে পানি ভরা। ছিদ্র তিনটি ভিন্ন গভীরতায়। ওপরের ছিদ্রে পানির স্তম্ভ খাটো।" },
      { t: 1.2, title: "নিচে চাপ বেশি", body: "নিচের ধারা সবচেয়ে জোরে বেরোয়। বেগ গভীরতার বর্গমূলের সাথে বাড়ে।" },
      { t: 3.5, title: "বাঁকা ধারা", body: "বেরিয়েই অভিকর্ষ ধারাকে নিচে নামায়, তাই পথ বাঁকে। এটাই পাঠ্যবইয়ের পরিচিত পরীক্ষা।" },
    ],
    create(ctx) {
      const { THREE, C, mesh, mat, glass, tag } = ctx;
      ctx.frame([4.8, 2.5, 5.6], [0.8, 1.2, 0]);
      const tankMat = glass({ opacity: 0.34 });
      const bottom = mesh(new THREE.BoxGeometry(1.7, 0.08, 1.15), tankMat);
      bottom.position.set(-0.15, 0.2, 0);
      const left = mesh(new THREE.BoxGeometry(0.06, 2.05, 1.15), tankMat);
      left.position.set(-0.97, 1.2, 0);
      const back = mesh(new THREE.BoxGeometry(1.7, 2.05, 0.06), tankMat);
      back.position.set(-0.15, 1.2, -0.55);
      const water = mesh(
        new THREE.BoxGeometry(1.5, 1.72, 0.95),
        mat({ color: C.water, transparent: true, opacity: 0.45, roughness: 0.15, depthWrite: false }),
        false
      );
      water.position.set(-0.2, 1.12, 0);
      const holes = [
        { y: 1.72, h: 0.42, name: "কম গভীর" },
        { y: 1.18, h: 0.96, name: "মাঝারি" },
        { y: 0.62, h: 1.52, name: "বেশি গভীর" },
      ];
      const g = 3.1;
      const per = 14;
      const dots = [];
      const geo = new THREE.SphereGeometry(0.035, 8, 8);
      const dropMat = mat({ color: 0x9ad7ef, roughness: 0.2, emissive: 0x2f8fbf, emissiveIntensity: 0.15 });
      holes.forEach((hole) => {
        tag(hole.name, 0.85, hole.y, 0.35);
        for (let i = 0; i < per; i++) {
          const d = mesh(geo, dropMat, false);
          dots.push({ mesh: d, hole, i });
        }
      });

      return {
        update(t) {
          dots.forEach((d) => {
            const vx = 0.95 * Math.sqrt(d.hole.h);
            const age = (t * 0.85 + d.i * 0.11) % 1.25;
            if (age > 1.05) {
              d.mesh.visible = false;
              return;
            }
            d.mesh.visible = true;
            d.mesh.position.set(0.72 + vx * age, d.hole.y - 0.5 * g * age * age, ((d.i % 3) - 1) * 0.05);
          });
        },
      };
    },
  },
  {
    id: "buoyancy",
    chapter: "matter",
    chapterNo: "৫",
    chapterName: "পদার্থের অবস্থা ও চাপ",
    title: "আর্কিমিডিসের নীতি",
    blurb: "প্লবতা ওজনের সমান হলে বস্তু ভাসে।",
    keywords: "buoyancy archimedes প্লবতা আর্কিমিডিস ভাসা",
    formula: "Fᵦ = ρ V g",
    verbal: "প্লবতা = অপসারিত তরলের ওজন।",
    proof: "ডোবানোর সাথে প্লবতা বাড়ে। ওজনের সমান হলেই নাম থেমে বস্তু ভেসে থাকে।",
    note: "বস্তু ভাসে যদি তার ঘনত্ব তরলের চেয়ে কম হয়। নিমজ্জিত অংশের অনুপাত = বস্তুর ঘনত্ব / তরলের ঘনত্ব। পুরো ডুবলেও প্লবতা ওজনের চেয়ে কম হলে বস্তু ডুবে যায়।",
    duration: 8,
    steps: [
      { t: 0, title: "শুধু ওজন", body: "বাতাসে ব্লকের নিচে নীল তীর — ওজন। পানিতে ঢোকেনি, প্লবতা নেই।" },
      { t: 2, title: "প্লবতা বাড়ছে", body: "যতটুকু ডোবে, ততটুকু পানি সরে। সোনালি তীর প্লবতা, ওপরের দিকে।" },
      { t: 5, title: "ভেসে থাকা", body: "প্লবতা ওজনের সমান। নিট বল শূন্য, তাই ব্লক আর নামে না — আংশিক ডুবে ভাসে।" },
    ],
    create(ctx) {
      const { THREE, C, mesh, mat, glass, arrow, shoot, tag, vec } = ctx;
      ctx.frame([4.3, 2.8, 5.2], [0, 1.3, 0]);
      const tank = glass({ opacity: 0.3 });
      const bottom = mesh(new THREE.BoxGeometry(2.2, 0.08, 1.4), tank);
      bottom.position.set(0, 0.16, 0);
      const back = mesh(new THREE.BoxGeometry(2.2, 1.7, 0.06), tank);
      back.position.set(0, 0.98, -0.67);
      const left = mesh(new THREE.BoxGeometry(0.06, 1.7, 1.4), tank);
      left.position.set(-1.07, 0.98, 0);
      const right = mesh(new THREE.BoxGeometry(0.06, 1.7, 1.4), tank);
      right.position.set(1.07, 0.98, 0);
      const water = mesh(
        new THREE.BoxGeometry(2.0, 1.15, 1.22),
        mat({ color: C.water, transparent: true, opacity: 0.42, roughness: 0.12, depthWrite: false }),
        false
      );
      const block = mesh(new THREE.BoxGeometry(0.62, 0.62, 0.62), mat({ color: 0xe2b56a, roughness: 0.55 }));
      const wArrow = arrow(C.weight);
      const bArrow = arrow(C.tension);
      const lab = tag("প্লবতা বাড়ছে", 0, 2.2, 0);
      const waterTop = 1.38;

      return {
        update(t) {
          const k = ctx.smooth((t - 0.4) / 4.8);
          const y = ctx.lerp(2.45, 1.42, k);
          block.position.set(0, y, 0);
          water.position.set(0, 0.2 + 0.62, 0);
          const sub = ctx.clamp(waterTop - (y - 0.31), 0, 0.62) / 0.62;
          const fb = Math.min(1, sub / 0.55);
          shoot(wArrow, vec(0.05, y, 0.2), vec(0, -1.05, 0));
          shoot(bArrow, vec(-0.05, y, 0.2), vec(0, 1.05 * fb, 0));
          lab.position.set(0, y + 0.7, 0);
          lab.set(fb > 0.98 ? "প্লবতা = ওজন · ভাসছে" : "প্লবতা বাড়ছে");
        },
      };
    },
  },
  {
    id: "expansion",
    chapter: "heat",
    chapterNo: "৬",
    chapterName: "বস্তুর ওপর তাপের প্রভাব",
    title: "দৈর্ঘ্য প্রসারণ",
    blurb: "তাপে দণ্ড লম্বা হয়ে ফাঁক বন্ধ করে।",
    keywords: "thermal expansion তাপ প্রসারণ দৈর্ঘ্য",
    formula: "ΔL = α L₀ ΔT",
    verbal: "দৈর্ঘ্য বাড়ে = প্রসারণ গুণাঙ্ক × আগের দৈর্ঘ্য × তাপমাত্রা বৃদ্ধি।",
    proof: "দণ্ড গরম হলে লম্বা হয়। দুই খামার মাঝের ফাঁক কমতে কমতে প্রায় মিলে যায়।",
    note: "α পদার্থের নিজস্ব গুণাঙ্ক। পিতলের α লোহার চেয়ে বেশি, তাই একই তাপে পিতল বেশি লম্বায়। আয়তন প্রসারণে γ ≈ 3α।",
    duration: 7.5,
    steps: [
      { t: 0, title: "ঠান্ডা দণ্ড", body: "পিতলের দণ্ড দুই খুঁটির মাঝে। ডান দিকে স্পষ্ট ফাঁক।" },
      { t: 1.4, title: "তাপ দিলে", body: "নিচের হিটার জ্বলছে। দণ্ডের রং বদলায় — তাপমাত্রা বাড়ছে।" },
      { t: 4, title: "ফাঁক বন্ধ", body: "দৈর্ঘ্য বেড়ে ফাঁক কমে। বাঁধা না থাকলে দণ্ড সোজা লম্বা হয়; আটকে থাকলে ভেতরে প্রচণ্ড বল পড়ে।" },
    ],
    create(ctx) {
      const { THREE, C, mesh, mat, tag } = ctx;
      ctx.frame([4.2, 2.4, 4.8], [0, 0.8, 0]);
      const postMat = mat({ color: 0x6e7b88, metalness: 0.35, roughness: 0.4 });
      const left = mesh(new THREE.BoxGeometry(0.14, 1.3, 0.14), postMat);
      left.position.set(-1.7, 0.65, 0);
      const right = mesh(new THREE.BoxGeometry(0.14, 1.3, 0.14), postMat);
      right.position.set(1.75, 0.65, 0);
      const rodMat = mat({ color: C.brass, metalness: 0.45, roughness: 0.35, emissive: C.hot, emissiveIntensity: 0 });
      const rod = mesh(new THREE.BoxGeometry(1, 0.16, 0.16), rodMat);
      const heater = mesh(
        new THREE.BoxGeometry(1.4, 0.08, 0.28),
        mat({ color: 0x333333, emissive: C.hot, emissiveIntensity: 0.2, roughness: 0.5 })
      );
      heater.position.set(-0.2, 0.28, 0);
      const gapTag = tag("ফাঁক", 1.3, 1.15, 0);
      const L0 = 2.85;

      return {
        update(t) {
          const heat = ctx.smooth((t - 0.6) / 5.2);
          const length = L0 * (1 + 0.12 * heat);
          rod.scale.x = length;
          rod.position.set(-1.55 + length / 2, 0.95, 0);
          const gap = 1.68 - (-1.55 + length);
          rodMat.emissiveIntensity = heat * 0.85;
          rodMat.color.setHex(heat > 0.5 ? 0xe8834a : C.brass);
          heater.material.emissiveIntensity = 0.2 + heat * 1.1;
          gapTag.position.set(1.35, 1.25, 0);
          gapTag.set(`ফাঁক ${Math.max(gap, 0).toFixed(2)}`);
        },
      };
    },
  },
];
