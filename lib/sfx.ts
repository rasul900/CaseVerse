'use client';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
  }
  return ctx;
}

export function unlockSfx() {
  const c = audio();
  if (c?.state === 'suspended') void c.resume();
}

function dest() {
  return master ?? audio()?.destination ?? null;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType,
  peak: number,
  at = 0,
  slideTo?: number,
) {
  const c = audio();
  const out = dest();
  if (!c || !out) return;
  const t = c.currentTime + at;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t + duration);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(g);
  g.connect(out);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

function noise(duration: number, peak: number, hp = 900, at = 0) {
  const c = audio();
  const out = dest();
  if (!c || !out) return;
  const n = Math.max(1, Math.floor(c.sampleRate * duration));
  const buf = c.createBuffer(1, n, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = hp;
  const g = c.createGain();
  const t = c.currentTime + at;
  g.gain.setValueAtTime(peak, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  src.connect(f);
  f.connect(g);
  g.connect(out);
  src.start(t);
  src.stop(t + duration + 0.02);
}

export function playCaseCrack() {
  noise(0.08, 0.18, 400);
  tone(140, 0.16, 'sine', 0.12, 0, 70);
  tone(420, 0.09, 'triangle', 0.08);
}

export function playTick(pace = 0) {
  const bright = 1680 + pace * 420;
  tone(bright, 0.035, 'square', 0.045 + pace * 0.02);
  noise(0.018, 0.06 + pace * 0.03, 1800);
}

export function playWin(rarity: string) {
  noise(0.05, 0.1, 600);
  if (rarity === 'mythic' || rarity === 'legendary') {
    tone(330, 0.55, 'sine', 0.16);
    tone(415, 0.6, 'triangle', 0.12, 0.04);
    tone(523, 0.7, 'sine', 0.1, 0.08);
    tone(784, 0.45, 'triangle', 0.08, 0.16);
    return;
  }
  if (rarity === 'epic' || rarity === 'rare') {
    tone(392, 0.35, 'sine', 0.14);
    tone(523, 0.4, 'triangle', 0.1, 0.05);
    return;
  }
  tone(520, 0.22, 'sine', 0.12);
  tone(780, 0.18, 'triangle', 0.07, 0.04);
}

export function startSpinTicks(durationMs: number, onDone?: () => void) {
  let elapsed = 0;
  let timer = 0;
  const started = performance.now();

  const tick = () => {
    elapsed = performance.now() - started;
    const p = Math.min(1, elapsed / durationMs);
    if (p >= 0.98) {
      onDone?.();
      return;
    }
    playTick(1 - p);
    const wait = 26 + p * p * 210;
    timer = window.setTimeout(tick, wait);
  };

  tick();
  return () => window.clearTimeout(timer);
}
