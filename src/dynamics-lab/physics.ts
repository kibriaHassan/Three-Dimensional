/** HSC kinematics. Upward is positive for vertical motion. g = 9.8 m/s². */

export const G = 9.8;

export type Params = {
  east: number;
  north: number;
  pace: number;
  u: number;
  accel: number;
  time: number;
  jerk: number;
  height: number;
  launch: number;
  shot: number;
};

export const baseParams: Params = {
  east: 30,
  north: 40,
  pace: 5,
  u: 5,
  accel: 2,
  time: 4,
  jerk: 0,
  height: 0,
  launch: 20,
  shot: 30,
};

export type Fact = { id: string; value: number; digits: number; unit: string };

function plain(id: string, value: number, digits: number, unit: string): Fact {
  return { id, value, digits, unit };
}

export function trip(p: Params) {
  const distance = p.east + p.north;
  const shift = Math.hypot(p.east, p.north);
  const duration = p.pace > 0 ? distance / p.pace : 0;
  const average = duration > 0 ? shift / duration : 0;
  const heading = (Math.atan2(p.north, p.east) * 180) / Math.PI;
  return { distance, shift, duration, average, heading, instant: p.pace };
}

export function ride(p: Params, t = p.time) {
  const { u, accel: a, jerk: j } = p;
  const v = u + a * t + 0.5 * j * t * t;
  const s = u * t + 0.5 * a * t * t + (j * t * t * t) / 6;
  const predict = u * t + 0.5 * a * t * t;
  const square = v * v - (u * u + 2 * a * s);
  return { v, s, predict, gap: s - predict, square, aNow: a + j * t };
}

export function vertical(p: Params) {
  const u = p.u;
  const h = p.height;
  const rise = u > 0 ? (u * u) / (2 * G) : 0;
  const top = h + rise;
  const hang = u > 0 ? u / G : 0;
  const impact = Math.sqrt(u * u + 2 * G * h);
  const flight = (u + impact) / G;
  return { top, hang, flight, impact, gee: G };
}

export function shot(p: Params) {
  const rad = (p.shot * Math.PI) / 180;
  const vx = p.launch * Math.cos(rad);
  const vy = p.launch * Math.sin(rad);
  return {
    vx,
    vy,
    height: (vy * vy) / (2 * G),
    range: (p.launch * p.launch * Math.sin(2 * rad)) / G,
    flight: (2 * vy) / G,
    best: (p.launch * p.launch) / G,
  };
}

export function factsFor(focus: string, p: Params): Fact[] {
  if (focus === "path") {
    const leg = trip(p);
    return [
      plain("distance", leg.distance, 1, "m"),
      plain("shift", leg.shift, 2, "m"),
      plain("instant", leg.instant, 1, "m/s"),
      plain("avg", leg.average, 2, "m/s"),
      plain("heading", leg.heading, 1, "°"),
    ];
  }
  if (focus === "equations") {
    const run = ride(p);
    return [
      plain("vel", run.v, 2, "m/s"),
      plain("span", run.s, 2, "m"),
      plain("predict", run.predict, 2, "m"),
      plain("gap", run.gap, 2, "m"),
      plain("square", run.square, 1, "(m/s)²"),
    ];
  }
  if (focus === "graphs") {
    const run = ride(p);
    return [
      plain("slopeS", run.v, 2, "m/s"),
      plain("areaV", run.s, 2, "m"),
      plain("slopeV", run.aNow, 2, "m/s²"),
      plain("areaA", run.v - p.u, 2, "m/s"),
    ];
  }
  if (focus === "vertical") {
    const fall = vertical(p);
    return [
      plain("gee", fall.gee, 1, "m/s²"),
      plain("top", fall.top, 2, "m"),
      plain("hang", fall.hang, 2, "s"),
      plain("flight", fall.flight, 2, "s"),
      plain("impact", fall.impact, 2, "m/s"),
    ];
  }
  const ball = shot(p);
  return [
    plain("vx", ball.vx, 2, "m/s"),
    plain("vy", ball.vy, 2, "m/s"),
    plain("height", ball.height, 2, "m"),
    plain("range", ball.range, 2, "m"),
    plain("air", ball.flight, 2, "s"),
    plain("best", ball.best, 2, "m"),
  ];
}
