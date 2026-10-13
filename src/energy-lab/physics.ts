/** Work, energy and power. W = F·s, mechanical energy, and P = dW/dt. */

export const G = 9.8;
export const TRACK_RADIUS = 1.5;
export const PENDULUM_LENGTH = 1.2;

export type Params = {
  force: number;
  mass: number;
  angle: number;
  height: number;
  speed: number;
  span: number;
  spring: number;
  time: number;
  friction: number;
};

export const baseParams: Params = {
  force: 12,
  mass: 2,
  angle: 0,
  height: 2,
  speed: 4,
  span: 3,
  spring: 80,
  time: 4,
  friction: 0.2,
};

export function workOf(force: number, span: number, angleDeg: number) {
  return force * span * Math.cos((angleDeg * Math.PI) / 180);
}

export function kinetic(mass: number, speed: number) {
  return 0.5 * mass * speed * speed;
}

export function potential(mass: number, height: number) {
  return mass * G * Math.max(0, height);
}

export function elastic(k: number, stretch: number) {
  return 0.5 * k * stretch * stretch;
}

export function powerOf(work: number, time: number) {
  return work / Math.max(time, 0.05);
}

export function instantPower(force: number, speed: number, angleDeg = 0) {
  return force * speed * Math.cos((angleDeg * Math.PI) / 180);
}

export function fallSpeed(dropped: number) {
  return Math.sqrt(2 * G * Math.max(0, dropped));
}

export function throwHeight(speed: number) {
  return (speed * speed) / (2 * G);
}

export function springAmplitude(mass: number, speed: number, k: number) {
  return speed * Math.sqrt(mass / Math.max(k, 1));
}

export function stoppingDistance(speed: number, mu: number) {
  const drag = mu * G;
  if (drag < 1e-4) return Number.POSITIVE_INFINITY;
  return (speed * speed) / (2 * drag);
}

export function frictionWork(mass: number, mu: number, distance: number) {
  return -mu * mass * G * Math.max(0, distance);
}

export function pendulumAmp(angleDeg: number) {
  return Math.min(70, Math.max(8, angleDeg)) * (Math.PI / 180);
}

export function pendulumHeight(angleRad: number) {
  return PENDULUM_LENGTH * (1 - Math.cos(angleRad));
}

export function circularForce(mass: number, speed: number) {
  return (mass * speed * speed) / TRACK_RADIUS;
}

export function collisionEnergy(mass: number, speed: number) {
  const before = kinetic(mass, speed);
  const stuck = speed / 2;
  return {
    before,
    elastic: before,
    inelastic: kinetic(2 * mass, stuck),
    stuck,
  };
}

export function efficiencyOf(loss: number) {
  return Math.min(1, Math.max(0, 1 - loss));
}
