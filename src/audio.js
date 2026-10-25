// ───────────────────────── the score: every sound synthesised ─────────────────────────
const SR = 44100;
const M = n => 440 * Math.pow(2, (n - 69) / 12);
const CH = {
  Dm: [38, 50, 57, 62, 65], Bb: [34, 46, 53, 58, 62], F: [41, 48, 53, 57, 60], C: [36, 48, 55, 60, 64],
  Gm: [43, 50, 55, 58, 62], D: [38, 50, 57, 62, 66], Fadd9: [41, 53, 60, 65, 67, 69], Dlow: [26, 38, 45],
};

function buildScore(ac) {
  const R = rng(2026);
  const A = {};
  const master = ac.createGain();
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = .006; comp.release.value = .3;
  master.connect(comp); comp.connect(ac.destination);
  const dry = ac.createGain(); dry.connect(master);
  const conv = ac.createConvolver(); conv.buffer = makeIR(4.5, 2.4);
  const wet = ac.createGain(); conv.connect(wet); wet.connect(master);
  const send = ac.createGain(); send.connect(conv);
  const NB = (() => { const b = ac.createBuffer(1, SR * 6, SR), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = R() * 2 - 1; return b; })();

  function makeIR(sec, decay) {
    const n = Math.floor(SR * sec), b = ac.createBuffer(2, n, SR);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c); let lp = 0;
      for (let i = 0; i < n; i++) { const x = i / n, k = .25 + .7 * x; lp = lp * k + (R() * 2 - 1) * (1 - k); d[i] = lp * Math.pow(1 - x, decay) * (i < SR * .012 ? i / (SR * .012) : 1); }
    }
    return b;
  }
  // route a node: dry/wet/pan
  function out(node, d = 1, w = .3, pan = 0) {
    let n = node;
    if (pan) { const p = ac.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); n.connect(p); n = p; }
    if (d) { const gd = ac.createGain(); gd.gain.value = d; n.connect(gd); gd.connect(dry); }
    if (w) { const gw = ac.createGain(); gw.gain.value = w; n.connect(gw); gw.connect(send); }
    return n;
  }
  function noise(t0, t1) { const s = ac.createBufferSource(); s.buffer = NB; s.loop = true; s.start(t0, R() * 5); s.stop(t1); return s; }
  function filt(type, f, q = .7) { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; }
  function gain(v = 0) { const x = ac.createGain(); x.gain.value = v; return x; }
  function osc(type, f, t0, t1) { const o = ac.createOscillator(); o.type = type; o.frequency.value = f; o.start(t0); o.stop(t1); return o; }
  function adsr(p, t0, a, peak, t1, rel) { p.setValueAtTime(0, t0); p.linearRampToValueAtTime(peak, t0 + a); p.setValueAtTime(peak, Math.max(t0 + a, t1)); p.linearRampToValueAtTime(0, t1 + rel); }
  const curve = (n, fn) => { const a = new Float32Array(n); for (let i = 0; i < n; i++) a[i] = fn(i / (n - 1)); return a; };

  // ── instruments ──
  A.pad = (t0, dur, notes, o = {}) => {
    const gpk = (o.g || .2) / Math.sqrt(notes.length * 3), att = o.a || 2.5, rel = o.r || 3, type = o.type || 'sawtooth';
    const lp = filt('lowpass', o.cut || 1400, .4), vg = gain();
    if (o.cut2) { lp.frequency.setValueAtTime(o.cut, t0); lp.frequency.exponentialRampToValueAtTime(o.cut2, t0 + dur); }
    lp.connect(vg); adsr(vg.gain, t0, att, 1, t0 + dur, rel);
    for (const n of notes) for (const dt of [-o.det || -9, 0, o.det || 9]) {
      const s = osc(type, M(n), t0, t0 + dur + rel + .1); s.detune.value = dt + (R() - .5) * 4;
      const og = gain(gpk); s.connect(og); og.connect(lp);
    }
    out(vg, o.d == null ? .7 : o.d, o.w == null ? .55 : o.w, o.pan || 0);
  };
  A.piano = (t, n, v = .4, o = {}) => {
    const f = M(n), tau = clamp(3.2 * Math.sqrt(220 / f), .7, 5) * (o.len || 1), vg = gain(1);
    const amps = [1, .45, .28, .16, .1, .06, .035];
    amps.forEach((a, i) => {
      const k = i + 1, fk = f * k * Math.sqrt(1 + .0004 * k * k); if (fk > 15000) return;
      const s = osc('sine', fk, t, t + tau * 2.2); const pg = gain(); s.connect(pg); pg.connect(vg);
      pg.gain.setValueAtTime(0, t); pg.gain.linearRampToValueAtTime(a * v * .32, t + .005); pg.gain.setTargetAtTime(0, t + .005, tau / (1 + i * .7) / 2.2);
    });
    const h = noise(t, t + .03), hb = filt('bandpass', 2400, 1), hg = gain(); h.connect(hb); hb.connect(hg); hg.connect(vg);
    hg.gain.setValueAtTime(v * .05, t); hg.gain.exponentialRampToValueAtTime(.0001, t + .025);
    out(vg, .55, o.w == null ? .6 : o.w, o.pan || (n - 62) / 40);
  };
  A.chord = (t, ns, v = .3, spread = .03) => ns.forEach((n, i) => A.piano(t + i * spread, n, v));
  A.braam = (t, n = 26, v = 1, len = 6) => {
    const f = M(n), sh = ac.createWaveShaper(); sh.curve = curve(1024, x => Math.tanh((x * 2 - 1) * 2.4));
    const lp = filt('lowpass', 150, 1.2), vg = gain();
    lp.frequency.setValueAtTime(140, t); lp.frequency.exponentialRampToValueAtTime(1500, t + .28); lp.frequency.exponentialRampToValueAtTime(260, t + len);
    vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(v * .5, t + .06); vg.gain.setTargetAtTime(0, t + .4, len / 3.5);
    const mix = gain(.22); mix.connect(sh); sh.connect(lp); lp.connect(vg);
    for (const m of [1, 2, 3, 4]) for (const dt of [-12, 0, 11]) { const s = osc('sawtooth', f * m, t, t + len + 1); s.detune.value = dt; const og = gain(1 / m); s.connect(og); og.connect(mix); }
    out(vg, .9, .5);
    const sub = osc('sine', f, t, t + len), sg = gain(); sub.connect(sg); sg.gain.setValueAtTime(0, t); sg.gain.linearRampToValueAtTime(v * .55, t + .03); sg.gain.setTargetAtTime(0, t + .5, len / 4); out(sg, 1, .1);
    A.boom(t, v * .7);
  };
  A.boom = (t, v = 1, f0 = 110, f1 = 30) => {
    const s = osc('sine', f0, t, t + 2.5), sg = gain(); s.frequency.setValueAtTime(f0, t); s.frequency.exponentialRampToValueAtTime(f1, t + .7);
    s.connect(sg); sg.gain.setValueAtTime(0, t); sg.gain.linearRampToValueAtTime(v * .8, t + .006); sg.gain.setTargetAtTime(0, t + .05, .45); out(sg, 1, .35);
    const nz = noise(t, t + .6), lp = filt('lowpass', 260, .8), ng = gain(); nz.connect(lp); lp.connect(ng);
    ng.gain.setValueAtTime(v * .5, t); ng.gain.exponentialRampToValueAtTime(.0001, t + .5); out(ng, 1, .4);
  };
  A.hit = (t, v = .6) => { A.boom(t, v, 90, 34); const nz = noise(t, t + .35), hp = filt('highpass', 1200, .7), ng = gain(); nz.connect(hp); hp.connect(ng); ng.gain.setValueAtTime(v * .22, t); ng.gain.exponentialRampToValueAtTime(.0001, t + .3); out(ng, .8, .5); };
  A.whoosh = (t, dur = 1.2, v = .3, f0 = 260, f1 = 2600, p0 = -.8, p1 = .8) => {
    const nz = noise(t, t + dur + .05), bp = filt('bandpass', f0, 1.1), vg = gain(), pn = ac.createStereoPanner();
    bp.frequency.setValueCurveAtTime(curve(64, x => f0 + (f1 - f0) * Math.sin(Math.PI * x)), t, dur);
    vg.gain.setValueCurveAtTime(curve(64, x => v * Math.pow(Math.sin(Math.PI * x), 2)), t, dur);
    pn.pan.setValueAtTime(p0, t); pn.pan.linearRampToValueAtTime(p1, t + dur);
    nz.connect(bp); bp.connect(vg); vg.connect(pn); out(pn, .9, .4);
  };
  A.riser = (t0, t1, v = .4) => {
    const nz = noise(t0, t1), hp = filt('highpass', 150, .9), vg = gain(); nz.connect(hp); hp.connect(vg);
    hp.frequency.setValueAtTime(150, t0); hp.frequency.exponentialRampToValueAtTime(7000, t1);
    vg.gain.setValueAtTime(.0001, t0); vg.gain.exponentialRampToValueAtTime(v, t1 - .01); vg.gain.linearRampToValueAtTime(0, t1);
    out(vg, 1, .25);
    const s = osc('sawtooth', 55, t0, t1), lp = filt('lowpass', 200, 2), sg = gain(); s.frequency.exponentialRampToValueAtTime(220, t1); lp.frequency.setValueAtTime(200, t0); lp.frequency.exponentialRampToValueAtTime(3000, t1);
    sg.gain.setValueAtTime(.0001, t0); sg.gain.exponentialRampToValueAtTime(v * .25, t1 - .01); sg.gain.linearRampToValueAtTime(0, t1); s.connect(lp); lp.connect(sg); out(sg, 1, .2);
  };
  A.click = (t, v, f, q, len, pan = 0, w = .15) => {
    const nz = noise(t, t + len + .01), bp = filt('bandpass', f, q), vg = gain(); nz.connect(bp); bp.connect(vg);
    vg.gain.setValueAtTime(v, t); vg.gain.exponentialRampToValueAtTime(.0001, t + len); out(vg, 1, w, pan);
  };
  A.key = t => { A.click(t, .5, 2800 + R() * 1400, 1.4, .028, (R() - .5) * .3, .08); A.click(t + .004, .35, 380, 1, .04, 0, .02); };
  A.tick = (t, v = .3, hi = true) => { A.click(t, v, hi ? 3600 : 2500, 6, .035, hi ? .15 : -.15, .2); A.click(t, v * .5, hi ? 1200 : 900, 3, .02, 0, .1); };
  A.clack = (t, v = .3) => { A.click(t, v, 1500 + R() * 900, 3, .022, (R() - .5) * .5, .1); A.click(t, v * .6, 520, 2, .03, 0, .05); };
  A.heart = (t, v = .6) => {
    for (const [dt, f0, f1, k] of [[0, 62, 40, 1], [.27, 56, 38, .6]]) {
      const s = osc('sine', f0, t + dt, t + dt + .4), sg = gain(); s.frequency.setValueAtTime(f0, t + dt); s.frequency.exponentialRampToValueAtTime(f1, t + dt + .18);
      s.connect(sg); sg.gain.setValueAtTime(0, t + dt); sg.gain.linearRampToValueAtTime(v * k, t + dt + .012); sg.gain.setTargetAtTime(0, t + dt + .04, .07); out(sg, 1, .05);
    }
  };
  A.bed = (t0, t1, o) => {
    const nz = noise(t0, t1 + .1), f1 = filt(o.type || 'lowpass', o.f || 600, o.q || .7), vg = gain(); nz.connect(f1);
    let last = f1; if (o.hp) { const h = filt('highpass', o.hp, .5); last.connect(h); last = h; }
    last.connect(vg);
    const dur = t1 - t0, n = Math.max(8, Math.floor(dur * 12)), seed = R() * 100;
    vg.gain.setValueCurveAtTime(curve(n, x => { const tt = t0 + x * dur; return o.g * env(tt, t0, t1, o.fi || 1, o.fo || 1) * (o.shape ? o.shape(x) : 1) * (1 + (o.lfo || 0) * n1(tt * (o.lfr || .7) + seed)); }), t0, dur);
    if (o.fm) f1.frequency.setValueCurveAtTime(curve(n, x => Math.max(40, (o.f || 600) * (1 + o.fm * n1((t0 + x * dur) * .4 + seed + 9)))), t0, dur);
    out(vg, o.d == null ? 1 : o.d, o.w == null ? .2 : o.w, o.pan || 0);
  };
  A.sine = (t0, t1, n, v, o = {}) => {
    const s = osc(o.type || 'sine', M(n), t0, t1 + (o.r || 2)), vg = gain(); s.connect(vg); adsr(vg.gain, t0, o.a || 1.5, v, t1, o.r || 2); out(vg, .8, o.w == null ? .5 : o.w, o.pan || 0);
    if (o.trem) { const l = osc('sine', o.trem, t0, t1 + (o.r || 2)), lg = gain(v * .4); l.connect(lg); lg.connect(vg.gain); }
  };
  A.shepard = (t0, t1, v, v0 = .08, v1 = .6) => {
    const N = 7, fmin = 48, dur = t1 - t0, n = Math.floor(dur * 60);
    const X = new Float32Array(n); let acc = 0; for (let i = 0; i < n; i++) { const u = i / (n - 1); X[i] = acc; acc += (v0 + (v1 - v0) * u * u) * dur / (n - 1); }
    for (let k = 0; k < N; k++) {
      const s = osc('sine', fmin, t0, t1 + .05), vg = gain(); s.connect(vg);
      const pos = i => (((k + X[i]) % N) + N) % N / N;
      s.frequency.setValueCurveAtTime(Float32Array.from({ length: n }, (_, i) => fmin * Math.pow(2, pos(i) * N)), t0, dur);
      vg.gain.setValueCurveAtTime(Float32Array.from({ length: n }, (_, i) => { const p = pos(i); return v * Math.pow(Math.sin(Math.PI * p), 2) * sstep(0, .25, i / n) ; }), t0, dur);
      out(vg, .8, .35);
    }
  };
  A.glass = (t, v = .5) => {
    for (let i = 0; i < 46; i++) {
      const tt = t + Math.pow(R(), 2.2) * 1.6, f = 2200 + R() * 7000, d = .04 + R() * .35;
      const s = osc('triangle', f, tt, tt + d + .02), sg = gain(); s.connect(sg); sg.gain.setValueAtTime(v * (.15 + R() * .35), tt); sg.gain.exponentialRampToValueAtTime(.0001, tt + d); out(sg, .7, .35, R() * 2 - 1);
    }
    const nz = noise(t, t + 1), hp = filt('highpass', 3000, .7), ng = gain(); nz.connect(hp); hp.connect(ng); ng.gain.setValueAtTime(v * .5, t); ng.gain.exponentialRampToValueAtTime(.0001, t + .9); out(ng, .8, .5);
  };
  A.breath = (t, v = .35, dur = 2.4) => {
    const nz = noise(t, t + dur), bp = filt('bandpass', 1000, .5), lp = filt('lowpass', 2600, .5), vg = gain(); nz.connect(bp); bp.connect(lp); lp.connect(vg);
    bp.frequency.setValueCurveAtTime(curve(32, x => 1300 - x * 600), t, dur);
    vg.gain.setValueCurveAtTime(curve(64, x => v * (x < .18 ? x / .18 : Math.pow(Math.max(0, 1 - (x - .18) / .82), 1.6))), t, dur); out(vg, 1, .45);
  };
  A.drop = (t, v = .05) => A.click(t, v, 2500 + R() * 3500, 4, .012 + R() * .02, R() * 2 - 1, .1);
  A.buzz = (t, v = .12) => { for (const dt of [0, .32]) { const s = osc('sawtooth', 150, t + dt, t + dt + .2), bp = filt('bandpass', 300, 2), sg = gain(); s.connect(bp); bp.connect(sg); adsr(sg.gain, t + dt, .01, v, t + dt + .16, .02); out(sg, 1, .1, .3); } };

  // master envelope: the silence before the crash
  master.gain.setValueAtTime(1, 0);
  master.gain.setValueAtTime(1, T_PEAK - .012); master.gain.linearRampToValueAtTime(0, T_PEAK);
  master.gain.setValueAtTime(0, T_CRASH - .004); master.gain.linearRampToValueAtTime(1, T_CRASH);
  wet.gain.setValueAtTime(1, 0); wet.gain.setValueAtTime(1, T_PEAK - .01); wet.gain.linearRampToValueAtTime(0, T_PEAK); wet.gain.setValueAtTime(0, T_CRASH); wet.gain.linearRampToValueAtTime(1, T_CRASH + .05);

  cue(A, R);
  return ac;
}

// ── the cue sheet ──
function cue(A, R) {
  const P = (t, n, v, o) => A.piano(t, n, v, o);
  // COLD OPEN: a room, a keyboard, a thought
  A.bed(1.0, 19.5, { f: 220, g: .05, fi: 1.5, fo: .01, w: 0 });
  A.sine(1.0, 19.4, 31, .012, { a: 1, r: .02, w: 0 });
  [...TYPE1, ...TYPE2].forEach(t => A.key(t));
  A.click(T_SEND, .6, 600, 1, .08, 0, .2); A.whoosh(T_SEND, .7, .12, 400, 1600, 0, .3);
  A.sine(8.4, 19.45, 50, .05, { a: 5, r: .03, trem: .5 }); A.sine(8.4, 19.45, 57, .035, { a: 6, r: .03 });
  P(11.0, 50, .3); P(14.2, 57, .2);
  A.riser(15.6, 19.5, .5);
  // ACT I: inside — the archive
  A.braam(19.5, 26, 1.1, 7); A.whoosh(19.5, 2.2, .35, 200, 3000, -.4, .4);
  A.pad(19.6, 16.5, CH.Dm, { g: .26, a: 3, r: 3, cut: 1600 });
  A.sine(20, 34, 86, .012, { a: 4, r: 3, trem: .3 }); A.sine(22, 34, 81, .01, { a: 4, r: 3 });
  [23.5, 26.8, 30.2, 33.0].forEach((t, i) => A.whoosh(t, 1.6, .22, 300, 2400, i % 2 ? .9 : -.9, i % 2 ? -.9 : .9));
  [24.1, 28.6, 32.4].forEach((t, i) => P(t, [74, 77, 72][i], .22));
  // ticker tape: the clatter of a century
  A.pad(36, 9.5, CH.Bb, { g: .17, a: 2, r: 2.5, cut: 1100 }); A.pad(45, 6.5, CH.Gm, { g: .15, a: 2.5, r: 3, cut: 1000 });
  A.bed(36, 49, { type: 'bandpass', f: 700, q: .8, g: .045, lfo: .5, lfr: 2, w: .3 });
  { let t = 36.2; while (t < 49) { A.clack(t, .26 + R() * .12); const slow = t > 45.5 ? 1 + Math.pow((t - 45.5) / 3.5, 2) * 5 : 1; t += (.07 + R() * .05) * slow; } }
  P(49.05, 81, .28); A.sine(49, 51.4, 81, .02, { a: .05, r: 2 });
  // credit + title
  A.boom(51.7, .35, 80, 30); P(51.75, 50, .3); P(51.8, 57, .2);
  A.riser(54.0, 55.5, .3);
  A.braam(55.5, 26, 1.25, 7.5); A.pad(55.6, 5, [50, 57, 62, 65, 69], { g: .2, a: 1.5, r: 3, cut: 2200, type: 'triangle' });
  // ACT II: the oldest word
  A.pad(61, 23, [38, 45], { g: .2, a: 3, r: 3, cut: 500, type: 'triangle' });
  for (let t = 61.4; t < 84; t += 2.4) A.boom(t, .26, 92, 48);
  for (let i = 0; i < WEDGES; i++) A.click(wedgeT(i), .16, 260 + R() * 180, 1.5, .06, (R() - .5) * .6, .2);
  P(66.8, 69, .3); P(67.1, 74, .2);
  A.bed(70.4, 77.6, { type: 'bandpass', f: 3200, q: .5, g: .03, fi: .8, fo: 1, w: .5 });
  A.sine(70.5, 77.3, 69, .022, { a: 1.2, r: 1.5 }); A.sine(70.5, 77.3, 76, .016, { a: 1.5, r: 1.5 }); A.whoosh(71, 2.6, .12, 1500, 5000, -.6, .6);
  { const t = 78.05, s = 1; A.click(t, .35, 1100, 6, .09, 0, .5); A.boom(t + .02, .15, 300, 120); A.whoosh(t + .05, 2.4, .1, 150, 700, 0, 0); }
  P(79.5, 65, .25); P(81.3, 69, .22);
  // three points; the theme is born
  [[85.0, 69], [85.7, 74], [86.4, 72], [87.1, 69], [88.2, 65], [88.6, 67], [89.0, 69]].forEach(([t, n]) => P(t, n, .3));
  A.pad(88.6, 4.6, CH.Bb, { g: .3, a: 1.4, r: 3, cut: 1800 }); A.chord(89.2, [46, 58, 62, 65], .26);
  // ACT III: the seed
  A.bed(93, 130, { f: 520, g: .08, fi: 3, fo: 2, lfo: .6, lfr: .35, fm: .5, w: .2, shape: x => .5 + .9 * sstep(.55, .9, x) });
  for (let t = 93.6; t < 111; t += .55 + R() * .6) for (let k = 0; k < 3; k++) A.click(t + k * .045, .03, 4400 + R() * 300, 18, .02, R() > .5 ? .7 : -.7, .3);
  [[95.2, 62], [97.6, 69], [100.1, 65], [102.6, 67], [105.5, 62], [108.4, 57]].forEach(([t, n]) => P(t, n, .36));
  A.pad(94, 18, [38, 45, 50], { g: .1, a: 4, r: 3, cut: 500, type: 'triangle' });
  A.sine(94, 104, 86, .008, { a: 2, r: 1 });
  A.boom(104.05, .3, 140, 45); A.bed(104.05, 104.9, { f: 900, g: .12, fi: .01, fo: .6, w: .2 });
  A.chord(113.3, [38, 57, 65], .22, .08);
  A.pad(113.6, 4.2, CH.F, { g: .22, a: 2, r: 2 }); A.pad(117.6, 4.2, CH.C, { g: .25, a: 1.5, r: 2 });
  A.pad(121.6, 3.4, CH.Dm, { g: .28, a: 1.2, r: 2 }); A.pad(124.8, 5.6, CH.Bb, { g: .3, a: 1.2, r: 3 });
  [[114, 69], [115.2, 72], [116.4, 74], [118.3, 76], [119.6, 74], [120.8, 72], [122.2, 69], [123.4, 74], [125, 77], [126.8, 74], [128.2, 72]].forEach(([t, n]) => P(t, n, .27));
  // ACT IV: the same sentence
  { let t = 129, k = 0; while (t < T_PEAK - .05) { A.tick(t, .22 + .1 * inv(129, 165, t), k++ % 2 === 0); const u = inv(129, T_PEAK, t); t += lerp(1, .11, Math.pow(u, 1.6)); } }
  { let t = 131; while (t < T_PEAK - .3) { A.heart(t, .55 + .35 * inv(131, 165, t)); t += 60 / lerp(62, 150, Math.pow(inv(131, T_PEAK, t), 1.4)); } }
  A.shepard(130, T_PEAK, .07, .06, .55);
  A.pad(130, T_PEAK - 130, CH.Dm, { g: .2, a: 6, r: .01, cut: 400, cut2: 3800, d: .8, w: .35 });
  A.sine(130, T_PEAK - .01, 26, .12, { a: 20, r: .01, w: 0 });
  A.bed(140, T_PEAK, { type: 'bandpass', f: 600, q: .7, g: .22, fi: 6, fo: .01, lfo: .4, lfr: 1.5, w: .25, shape: x => x * x });
  A.bed(146, T_PEAK, { type: 'bandpass', f: 1300, q: 1, g: .1, fi: 6, fo: .01, lfo: .5, lfr: 3, w: .2, shape: x => x * x });
  CUTS.forEach((t, i) => { A.hit(t, .45 + i * .04); A.whoosh(t - .5, .7, .18, 300, 3500, -.5, .5); });
  P(143.6, 62, .3); P(143.62, 69, .25);
  for (let t = 158; t < T_PEAK - .05; t += lerp(.32, .06, inv(158, T_PEAK, t))) { A.key(t); if (R() < .3) A.whoosh(t, .4, .08, 600, 4000, R() * 2 - 1, R() * 2 - 1); }
  // the crash
  A.boom(T_CRASH, 1.3, 120, 26); A.braam(T_CRASH, 21, 1.1, 8); A.glass(T_CRASH + .02, .55);
  A.bed(T_CRASH, 173, { f: 140, g: .4, fi: .01, fo: 5, w: .3 });
  A.bed(T_CRASH, 169.5, { type: 'highpass', f: 2000, g: .12, fi: .01, fo: 2.2, w: .5 });
  for (let i = 0; i < 40; i++) A.click(T_CRASH + .3 + R() * 4.5, .05 + R() * .08, 800 + R() * 3000, 3, .03, R() * 2 - 1, .3);
  // 3 a.m.
  A.bed(172, 184.6, { type: 'bandpass', f: 2200, q: .3, g: .09, fi: 1.5, fo: .8, lfo: .2, w: .25, hp: 400 });
  for (let t = 172.3; t < 184.3; t += .04 + R() * .12) A.drop(t, .02 + R() * .05);
  for (let t = 172.5; t < 184; t += 1.05) A.heart(t, .28);
  A.pad(172.5, 11.5, [38, 50, 53, 57], { g: .1, a: 3, r: 1.5, cut: 700, type: 'triangle' });
  A.buzz(175.2); P(178.2, 65, .18); P(180.6, 62, .16);
  // ACT V: greed, fear, patience
  P(185.0, 38, .35); A.pad(185, 4, [38, 50, 57], { g: .12, a: 1.5, r: 1.5, cut: 800 });
  { let t = 189; while (t < 194) { A.tick(t, .2, R() > .5); t += lerp(.28, .03, Math.pow(inv(189, 194, t), 1.3)); } }
  { const s = 189, e = 194; A.pad(s, e - s, [50, 57, 62], { g: .18, a: 2, r: .02, cut: 700, cut2: 4500 }); }
  A.whoosh(189, 5, .1, 400, 6000, -.5, .5);
  A.sine(194.05, 198.7, 93, .02, { a: .3, r: .5 }); A.sine(194.05, 198.7, 100, .012, { a: .3, r: .5 }); A.bed(194.05, 198.8, { f: 90, g: .2, fi: .1, fo: .5, w: .3 });
  for (let t = 199.2; t < 205; t += 1) A.tick(t, .16, Math.round(t) % 2 === 0);
  A.pad(199.2, 5.6, CH.F, { g: .3, a: 2.4, r: 2 }); [[199.6, 69], [200.8, 72], [202, 74], [203.4, 72]].forEach(([t, n]) => P(t, n, .26));
  A.pad(205.2, 4.2, CH.Gm, { g: .2, a: 1.5, r: 1.6, cut: 900 }); A.bed(205, 209.6, { type: 'bandpass', f: 1800, q: .3, g: .04, fi: 1, fo: 1, w: .6 });
  A.pad(209.6, 2.7, CH.Bb, { g: .28, a: 1.2, r: 1.2 }); A.pad(212.2, 2.75, CH.F, { g: .3, a: 1, r: .03 });
  [[210, 74], [211.2, 72], [212.4, 69], [213.6, 65]].forEach(([t, n]) => P(t, n, .26));
  // ACT VI: no tomorrow
  A.sine(216, 232.6, 26, .07, { a: 3, r: .5, w: .1 });
  [[217.1, 81], [220.9, 77], [222.6, 76], [225.5, 74], [229.9, 69]].forEach(([t, n]) => P(t, n, .3, { w: .85 }));
  A.whoosh(222.2, 2.6, .07, 2000, 300, .6, -.6);
  // the tree
  A.pad(233.4, 3.9, CH.Dm, { g: .2, a: 2, r: 1.5 }); A.pad(237.2, 4.2, CH.Bb, { g: .3, a: .8, r: 1.6 });
  A.braam(237.2, 34, .5, 5); A.whoosh(236.8, 2, .18, 200, 2500, -.3, .3);
  A.pad(241.3, 5.1, CH.F, { g: .33, a: 1.5, r: 1.5 }); A.pad(246.3, 6, CH.C, { g: .35, a: 1.5, r: 1.5 });
  A.pad(252.2, 3.1, CH.Dm, { g: .35, a: 1.2, r: 1.2 }); A.pad(255.2, 3.1, CH.Bb, { g: .36, a: 1, r: 1.2 });
  A.pad(258.2, 3.9, CH.Fadd9, { g: .42, a: .8, r: 2.4, cut: 2400 }); A.boom(258.2, .4, 70, 30);
  // a voice made of filters: "ah"
  for (const [f0, q] of [[800, 6], [1150, 7]]) { const t0 = 246, t1 = 262; for (const n of [57, 60, 65]) A.pad(t0, t1 - t0, [n], { g: .1, a: 4, r: 2, cut: f0, type: 'sawtooth', d: .5, w: .8 }); }
  const theme = [[233.6, 69], [234.3, 74], [235, 72], [235.7, 69], [236.8, 65], [237.2, 67], [237.6, 69], [241.4, 72], [242.2, 77], [243, 76], [243.8, 72], [245, 69], [246.4, 67], [247.3, 72], [248.2, 76], [249.4, 79], [252.3, 77], [253.2, 74], [254.1, 72], [255.3, 74], [256.2, 77], [258.3, 81], [259.2, 79], [260.1, 77]];
  theme.forEach(([t, n]) => P(t, n, .3));
  for (let t = 233.6; t < 261; t += .7) P(t, [50, 57, 62, 57][Math.round((t - 233.6) / .7) % 4] - (t > 237 && t < 241.3 ? 4 : t > 241.3 && t < 246.3 ? -3 : t > 246.3 && t < 252.2 ? -2 : t > 255.2 && t < 258.2 ? 4 : t > 258.2 ? -3 : 0), .12);
  // the viewer's time, ticking
  A.sine(262, 278.5, 69, .03, { a: 1.5, r: 2 }); A.sine(262, 278.5, 81, .012, { a: 2, r: 2 });
  for (let s = 263; s <= 275; s++) A.tick(s, .2, s % 2 === 0);
  A.pad(262.5, 12.5, [41, 48, 53, 57], { g: .1, a: 3, r: 2, cut: 700, type: 'triangle' });
  A.chord(275.4, [41, 53, 57, 60, 65], .25, .05); A.pad(275.4, 3.6, CH.F, { g: .2, a: 1.2, r: 1.5 });
  // breath; D major
  A.breath(279.6, .4);
  A.pad(280.6, 12, CH.D, { g: .28, a: 3, r: 4, cut: 1500 }); A.chord(281, [50, 57, 62, 66, 69], .22, .18);
  [[287.8, 69], [288.6, 74], [289.4, 73], [290.2, 69], [291.6, 66], [292.1, 67], [292.6, 69], [294.4, 62]].forEach(([t, n]) => P(t, n, .24, { w: .7 }));
  A.sine(288, 295.5, 26, .05, { a: 2, r: 1.4 });
}
