/** HSC Newtonian mechanics. g = 9.8 m/s². One-dimensional signs are stated beside each formula. */

export const G = 9.8;

export type Params = {
  mass: number;
  mass1: number;
  mass2: number;
  force: number;
  speed: number;
  speed2: number;
  incline: number;
  shot: number;
  muS: number;
  muK: number;
  restitution: number;
  duration: number;
  radius: number;
  span: number;
  time: number;
  drag: number;
  spring: number;
  launch: number;
};

export const baseParams: Params = {
  mass: 2,
  mass1: 2,
  mass2: 3,
  force: 10,
  speed: 0,
  speed2: 0,
  incline: 30,
  shot: 45,
  muS: 0.4,
  muK: 0.2,
  restitution: 1,
  duration: 0.1,
  radius: 1,
  span: 2,
  time: 2,
  drag: 4,
  spring: 20,
  launch: 20,
};

export type Fact = { id: string; value: number; digits: number; unit: string };

function plain(id: string, value: number, digits: number, unit: string): Fact {
  return { id, value, digits, unit };
}

export function systemAccel(p: Params) {
  const mass = p.mass1 + p.mass2;
  if (mass <= 0) return 0;
  return p.force / mass;
}

export function contactForce(p: Params) {
  return p.mass2 * systemAccel(p);
}

export function plane(p: Params) {
  const rad = (p.incline * Math.PI) / 180;
  const normal = p.mass * G * Math.cos(rad);
  const down = p.mass * G * Math.sin(rad);
  const drive = down - p.force;
  const limit = p.muS * normal;
  const muK = Math.min(p.muK, p.muS);
  const kinetic = muK * normal;
  if (Math.abs(drive) <= limit + 1e-6) {
    return { normal, friction: Math.abs(drive), limit, accel: 0, sliding: false, down: drive > 0 };
  }
  const sign = Math.sign(drive) || 1;
  return { normal, friction: kinetic, limit, accel: (Math.abs(drive) - kinetic) / p.mass, sliding: true, down: sign > 0 };
}

export function collide(p: Params) {
  const m1 = p.mass1;
  const m2 = p.mass2;
  const u1 = p.speed;
  const u2 = p.speed2;
  const e = p.restitution;
  const total = m1 + m2;
  const before = m1 * u1 + m2 * u2;
  const v1 = (before - m2 * e * (u1 - u2)) / total;
  const v2 = (before + m1 * e * (u1 - u2)) / total;
  const after = m1 * v1 + m2 * v2;
  const impulse = m1 * (v1 - u1);
  const hit = p.duration > 0 ? impulse / p.duration : 0;
  const kBefore = 0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2;
  const kAfter = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
  return { v1, v2, before, after, impulse, hit, kBefore, kAfter };
}

export function whirl(p: Params) {
  const omega = p.speed / p.radius;
  const accel = (p.speed * p.speed) / p.radius;
  return { omega, accel, pull: p.mass * accel, period: p.speed > 0.001 ? (2 * Math.PI * p.radius) / p.speed : 0 };
}

export function projectile(p: Params) {
  const rad = (p.shot * Math.PI) / 180;
  const vx = p.launch * Math.cos(rad);
  const vy = p.launch * Math.sin(rad);
  return {
    vx,
    vy,
    height: (vy * vy) / (2 * G),
    range: (p.launch * p.launch * Math.sin(2 * rad)) / G,
    flight: (2 * vy) / G,
  };
}

export function linked(p: Params) {
  const moves = p.force > p.drag;
  const s = moves ? p.span : 0;
  const work = p.force * s;
  const net = (p.force - p.drag) * s;
  const kinetic = Math.max(0, net);
  const climb = kinetic / (p.mass * G);
  const power = p.time > 0 ? work / p.time : 0;
  const variable = 0.5 * p.spring * p.span * p.span;
  return { work, net, kinetic, climb, power, variable, speed: Math.sqrt((2 * kinetic) / p.mass) };
}

export function factsFor(focus: string, p: Params): Fact[] {
  if (focus === "laws") {
    const a = systemAccel(p);
    return [
      plain("accel", a, 2, "m/s²"),
      plain("contact", contactForce(p), 2, "N"),
      plain("net", p.force - contactForce(p), 2, "N"),
      plain("later", p.speed + a, 2, "m/s"),
    ];
  }
  if (focus === "friction") {
    const face = plane(p);
    return [
      plain("normal", face.normal, 2, "N"),
      plain("friction", face.friction, 2, "N"),
      plain("limit", face.limit, 2, "N"),
      plain("accel", face.accel, 2, "m/s²"),
    ];
  }
  if (focus === "crash") {
    const hit = collide(p);
    return [
      plain("before", hit.before, 2, "kg·m/s"),
      plain("after", hit.after, 2, "kg·m/s"),
      plain("one", hit.v1, 2, "m/s"),
      plain("two", hit.v2, 2, "m/s"),
      plain("impulse", hit.impulse, 2, "N·s"),
      plain("hit", hit.hit, 1, "N"),
      plain("loss", hit.kBefore - hit.kAfter, 2, "J"),
    ];
  }
  if (focus === "circle") {
    const spin = whirl(p);
    return [
      plain("pull", spin.pull, 2, "N"),
      plain("accel", spin.accel, 2, "m/s²"),
      plain("omega", spin.omega, 2, "rad/s"),
      plain("period", spin.period, 2, "s"),
    ];
  }
  if (focus === "shot") {
    const ball = projectile(p);
    return [
      plain("vx", ball.vx, 2, "m/s"),
      plain("vy", ball.vy, 2, "m/s"),
      plain("height", ball.height, 2, "m"),
      plain("range", ball.range, 2, "m"),
      plain("flight", ball.flight, 2, "s"),
    ];
  }
  const job = linked(p);
  return [
    plain("work", job.work, 2, "J"),
    plain("netWork", job.net, 2, "J"),
    plain("kinetic", job.kinetic, 2, "J"),
    plain("climb", job.climb, 2, "m"),
    plain("power", job.power, 2, "W"),
    plain("variable", job.variable, 2, "J"),
  ];
}
