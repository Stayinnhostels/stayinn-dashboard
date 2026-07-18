/** Synthesized notification rings via Web Audio (no asset files). */

type RingMode = "single" | "bulk";

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  return audioCtx;
}

/** Call from a user gesture (e.g. login submit) so later rings are allowed. */
export function unlockNotificationAudio() {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    void ctx.resume().catch(() => undefined);
  }
}

function tone(
  ctx: AudioContext,
  {
    frequency,
    startAt,
    duration,
    gain = 0.08,
    type = "sine",
  }: {
    frequency: number;
    startAt: number;
    duration: number;
    gain?: number;
    type?: OscillatorType;
  },
) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  g.gain.setValueAtTime(0.0001, startAt);
  g.gain.exponentialRampToValueAtTime(gain, startAt + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

/** Soft two-note chime for a single booking. */
function playSingleRing(ctx: AudioContext) {
  const t0 = ctx.currentTime;
  tone(ctx, { frequency: 880, startAt: t0, duration: 0.18, gain: 0.07 });
  tone(ctx, { frequency: 1174.7, startAt: t0 + 0.14, duration: 0.28, gain: 0.09 });
}

/** Faster, lower triple pulse for a bulk of bookings — clearly different. */
function playBulkRing(ctx: AudioContext) {
  const t0 = ctx.currentTime;
  const pattern = [
    { f: 523.25, at: 0 },
    { f: 523.25, at: 0.16 },
    { f: 392, at: 0.32 },
    { f: 659.25, at: 0.52 },
  ];
  for (const p of pattern) {
    tone(ctx, {
      frequency: p.f,
      startAt: t0 + p.at,
      duration: 0.14,
      gain: 0.11,
      type: "triangle",
    });
  }
}

export function playBookingRing(mode: RingMode = "single") {
  const ctx = getCtx();
  if (!ctx) return;
  const run = () => {
    if (mode === "bulk") playBulkRing(ctx);
    else playSingleRing(ctx);
  };
  if (ctx.state === "suspended") {
    void ctx.resume().then(run).catch(() => undefined);
  } else {
    run();
  }
}

export type { RingMode };
