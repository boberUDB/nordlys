/**
 * Nordlys sound identity: cold, glassy, contained.
 *
 * Everything is synthesised on the fly (no samples, nothing to download) and shares one
 * character: inharmonic glass partials through a dark plate reverb, tuned to D major
 * pentatonic so any two sounds that overlap are always consonant.
 *
 *   glass tick  -> hover on links and buttons
 *   soft thud   -> a real click
 *   thaw swoosh -> page transitions and reveals (a high-pass sweep that rises in pitch)
 *   aurora pad  -> loading screen: grows with the counter, resolves into a chord as the curtain opens
 *
 * Levels are very low, attacks are instant and tails are short. There is no loop and no
 * background music. Nothing is created until sound has been switched on in the settings menu.
 */

let ctx: AudioContext | null = null;
let bus: GainNode; // dry sum, into the compressor
let send: GainNode; // reverb send

// D major pentatonic, high register: the "glass" of the brand
const GLASS = [1174.66, 1318.51, 1479.98, 1760.0, 1975.53]; // D6 E6 F#6 A6 B6

/** A dark, dense plate: noise with a fast-rising, exponentially decaying, progressively darker tail. */
function plateImpulse(c: AudioContext, seconds = 2.2) {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      const t = i / c.sampleRate;
      const env = Math.min(1, t / 0.004) * Math.exp(-t * 3.1);
      const coef = 0.06 + 0.5 * Math.exp(-t * 1.6); // the tail loses its highs as it decays
      lp += ((Math.random() * 2 - 1) - lp) * coef;
      d[i] = lp * env;
    }
  }
  return buf;
}

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -26;
    comp.ratio.value = 5;
    comp.attack.value = 0.003;
    comp.release.value = 0.18;
    const master = ctx.createGain();
    master.gain.value = 0.85;
    comp.connect(master).connect(ctx.destination);

    bus = ctx.createGain();
    bus.connect(comp);

    send = ctx.createGain();
    const verb = ctx.createConvolver();
    verb.buffer = plateImpulse(ctx);
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    send.connect(verb).connect(wet).connect(comp);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Only ever schedule sounds on a running context; a suspended one would replay them all at once. */
function live(): AudioContext | null {
  const c = ensure();
  return c && c.state === "running" ? c : null;
}

/** One glass bell: inharmonic partials, the upper ones dying faster. */
function bell(freq: number, gain: number, decay: number, reverb: number, delay = 0) {
  const c = live();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const tone = c.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 5200;
  tone.Q.value = 0.4;
  const out = c.createGain();
  out.gain.value = gain;
  tone.connect(out);
  out.connect(bus);
  const s = c.createGain();
  s.gain.value = reverb;
  out.connect(s).connect(send);

  const partials: [number, number][] = [
    [1, 1],
    [2.32, 0.42],
    [4.25, 0.18],
    [6.63, 0.07],
  ];
  partials.forEach(([ratio, amp], i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = freq * ratio;
    const d = decay / (1 + i * 0.7);
    g.gain.setValueAtTime(amp, t0); // instant attack
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g).connect(tone);
    o.start(t0);
    o.stop(t0 + d + 0.05);
  });
}

let lastTick = 0;
let lastGlass = -1;
let lastSwoosh = 0;

export const sound = {
  /** hover: a single, quiet glass tick, different pitch each time but always in key */
  hover() {
    const now = performance.now();
    if (now - lastTick < 80) return;
    lastTick = now;
    let i = Math.floor(Math.random() * GLASS.length);
    if (i === lastGlass) i = (i + 2) % GLASS.length;
    lastGlass = i;
    bell(GLASS[i], 0.016, 0.34, 0.45);
  },

  /** click: a muted, low thud. Not a beep. */
  click() {
    const c = live();
    if (!c) return;
    const t0 = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(128, t0);
    o.frequency.exponentialRampToValueAtTime(46, t0 + 0.13);
    g.gain.setValueAtTime(0.11, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
    o.connect(g).connect(bus);
    o.start(t0);
    o.stop(t0 + 0.2);

    // the tiniest felt "contact", dark and 5ms long
    const n = c.createBufferSource();
    const nb = c.createBuffer(1, Math.floor(c.sampleRate * 0.02), c.sampleRate);
    const nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.004));
    n.buffer = nb;
    const nf = c.createBiquadFilter();
    nf.type = "lowpass";
    nf.frequency.value = 700;
    const ng = c.createGain();
    ng.gain.value = 0.05;
    n.connect(nf).connect(ng).connect(bus);
    n.start(t0);
  },

  /** transitions and reveals: something thawing. A high-pass sweep that climbs in pitch. */
  swoosh() {
    const now = performance.now();
    if (now - lastSwoosh < 600) return;
    lastSwoosh = now;
    const c = live();
    if (!c) return;
    const t0 = c.currentTime;
    const dur = 0.55;

    const nb = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = nb;

    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.Q.value = 1.1;
    hp.frequency.setValueAtTime(260, t0);
    hp.frequency.exponentialRampToValueAtTime(7200, t0 + dur);

    const g = c.createGain();
    g.gain.setValueAtTime(0.05, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    src.connect(hp).connect(g);
    g.connect(bus);
    const s = c.createGain();
    s.gain.value = 0.6;
    g.connect(s).connect(send);
    src.start(t0);
  },

  /** the moment sound is switched on: two glass notes, a fifth apart */
  on() {
    bell(1174.66, 0.03, 1.1, 0.7);
    bell(1760.0, 0.024, 1.3, 0.7, 0.09);
  },

  /**
   * Loading pad. Very quiet, it swells in volume and brightness with the counter and, when
   * `resolve()` is called as the curtain opens, lands on a plain D major chord with a shimmer.
   */
  startPad(): Pad | null {
    const c = ensure(); // may stay suspended until the first gesture: that is fine, it just starts late
    if (!c) return null;

    const out = c.createGain();
    out.gain.value = 0;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 240;
    lp.Q.value = 0.5;
    lp.connect(out);
    out.connect(bus);
    const s = c.createGain();
    s.gain.value = 0.7;
    out.connect(s).connect(send);

    const oscs: OscillatorNode[] = [];
    // D3, A3, D4, each doubled and detuned a few cents: a slow, wide shimmer instead of a fixed tone
    [146.83, 220.0, 293.66].forEach((f, i) => {
      [-6, 6].forEach((cents) => {
        const o = c.createOscillator();
        o.type = i === 0 ? "sine" : "triangle";
        o.frequency.value = f;
        o.detune.value = cents;
        const g = c.createGain();
        g.gain.value = i === 0 ? 0.55 : 0.32;
        o.connect(g).connect(lp);
        o.start();
        oscs.push(o);
      });
    });

    // the "aurora" part: two high partials that only appear as the counter climbs
    const shimmer = c.createGain();
    shimmer.gain.value = 0;
    const trem = c.createGain();
    trem.gain.value = 0.5;
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.21;
    const lfoAmt = c.createGain();
    lfoAmt.gain.value = 0.5;
    lfo.connect(lfoAmt).connect(trem.gain);
    lfo.start();
    [587.33, 880.0].forEach((f) => {
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      o.connect(shimmer);
      o.start();
      oscs.push(o);
    });
    shimmer.connect(trem).connect(out);
    oscs.push(lfo);

    let stopped = false;
    const kill = (after: number) => {
      if (stopped) return;
      stopped = true;
      const t = c.currentTime;
      out.gain.cancelScheduledValues(t);
      out.gain.setTargetAtTime(0, t, after / 4);
      window.setTimeout(() => {
        oscs.forEach((o) => {
          try {
            o.stop();
          } catch {
            /* already stopped */
          }
        });
        out.disconnect();
      }, after * 1000 + 200);
    };

    return {
      setProgress(p: number) {
        if (stopped) return;
        const t = c.currentTime;
        out.gain.setTargetAtTime(0.012 + p * 0.04, t, 0.3);
        lp.frequency.setTargetAtTime(240 + p * p * 3400, t, 0.35);
        shimmer.gain.setTargetAtTime(p * p * 0.05, t, 0.4);
      },
      resolve() {
        if (stopped) return;
        // land on D major (D A F# + the shimmering 9th): a short bloom, then the pad lets go
        const t = c.currentTime;
        out.gain.setTargetAtTime(0.07, t, 0.12);
        bell(739.99, 0.03, 2.2, 0.8); // F#5
        bell(1174.66, 0.026, 2.6, 0.8, 0.06); // D6
        bell(1760.0, 0.02, 2.6, 0.85, 0.12); // A6
        bell(1318.51, 0.014, 2.8, 0.9, 0.2); // E6, the added 9th
        kill(1.4);
      },
      stop() {
        kill(0.25);
      },
    };
  },
};

export type Pad = {
  setProgress: (p: number) => void;
  resolve: () => void;
  stop: () => void;
};
