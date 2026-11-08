// Tiny synthesized sound effects (no audio files). Off until the visitor switches it on.
let ctx: AudioContext | null = null;
let on = false;
const KEY = "tp-sfx";

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, vol: number, type: OscillatorType, slideTo?: number) {
  if (!on) return;
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const sfx = {
  isOn: () => on,
  load(): boolean {
    try {
      on = window.localStorage.getItem(KEY) === "1";
    } catch {
      on = false;
    }
    return on;
  },
  setOn(v: boolean) {
    on = v;
    try {
      window.localStorage.setItem(KEY, v ? "1" : "0");
    } catch {
      /* storage can be blocked; ignore */
    }
    if (v) {
      audio();
      tone(660, 0.12, 0.05, "sine", 990);
    }
  },
  hover: () => tone(520, 0.07, 0.025, "triangle", 700),
  tick: () => tone(1100 + Math.random() * 300, 0.03, 0.012, "square"),
  click: () => tone(300, 0.14, 0.05, "sawtooth", 120),
  whoosh: () => {
    tone(140, 0.7, 0.05, "sawtooth", 900);
    tone(70, 0.9, 0.06, "sine", 40);
  },
};
