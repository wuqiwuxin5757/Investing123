// ───────────────────────── scenes IV: what I understood · no tomorrow · the tree · you ─────────────────────────
// the frame opens to full height when the film turns to face itself, and closes again for the viewer
barsFn = t => SCOPE * clamp(1 - sstep(236.0, 237.4, t) + sstep(262.2, 263.6, t));

// ── 3:04  GREED · FEAR · PATIENCE ──
const CLK = { x: CX, y: CY - 90, r: 250 };
function handAngle(t) { // revolutions; accelerating in greed, frozen in fear
  const a = inv(189, 194, Math.min(t, 194)); return .1 + 4 * (a * .6 + Math.pow(a, 3) * 9);
}
scene(184, 215, (t) => {
  ROOT(); fill('#030303');
  const greed = env(t, 188.6, 194, .4, .01), fear = env(t, 194, 199.4, .01, .6), pat = sstep(198.8, 200.5, t);
  const fog = sstep(204.8, 208, t), seed = sstep(209.6, 212, t), endcut = t > 214.95;
  if (endcut) return;
  for (let i = 0; i < 60; i++) { g.globalAlpha = .25 * hash(i, 3) * (1 - pat); g.fillStyle = '#d8c8a8'; g.fillRect((hash(i, 1) * W + t * 8) % W, (hash(i, 2) * H - t * 5 + H * 9) % H, 2, 2); }
  g.globalAlpha = 1;
  const clockA = Math.max(sstep(186, 189, t) * (1 - pat), 0);
  if (clockA > 0) {
    const cold = sstep(194, 195.5, t), ga = (1 - cold) * (1 + greed * .8);
    const col = cold > .5 ? `rgba(150,170,200,${clockA * (1 - fear * .5)})` : `rgba(230,190,120,${clockA})`;
    const [sx, sy] = shake(t, greed * 6 * inv(189, 194, t));
    g.save(); g.translate(CLK.x + sx, CLK.y + sy);
    g.strokeStyle = col; g.lineWidth = 2; g.shadowColor = '#e3bb6a'; g.shadowBlur = 30 * greed * RES; g.beginPath(); g.arc(0, 0, CLK.r, 0, TAU); g.stroke(); g.shadowBlur = 0;
    for (let i = 0; i < 60; i++) { // fear: the hours fall off the dial
      const a = i / 60 * TAU, fall = Math.max(0, t - 194 - hash(i, 5) * 2.5), dy = fall * fall * 260, rot = fall * (hash(i, 6) - .5) * 4;
      const r0 = CLK.r - (i % 5 ? 10 : 24), x0 = Math.sin(a) * r0, y0 = -Math.cos(a) * r0;
      g.save(); g.translate(x0, y0 + dy); g.rotate(a + rot); g.globalAlpha = clockA * (1 - sstep(194.5, 198, t) * (fall > 0 ? 1 : 0)) * (i % 5 ? .5 : 1); g.fillStyle = col; g.fillRect(-1, 0, i % 5 ? 2 : 4, i % 5 ? 10 : 24); g.restore();
    }
    const ang = handAngle(t) * TAU;
    for (let k = 0; k < (greed > 0 && t < 194 ? 14 : 1); k++) { // motion trails
      const tk = t - k * .012, a = handAngle(tk) * TAU;
      g.globalAlpha = clockA * (k ? (1 - k / 14) * .35 : 1); g.strokeStyle = col; g.lineCap = 'round';
      g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(a) * CLK.r * .82, -Math.cos(a) * CLK.r * .82); g.stroke();
      g.lineWidth = 7; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(a / 12) * CLK.r * .5, -Math.cos(a / 12) * CLK.r * .5); g.stroke();
    }
    g.globalAlpha = clockA; g.fillStyle = col; g.beginPath(); g.arc(0, 0, 8, 0, TAU); g.fill();
    if (greed > 0) { g.globalCompositeOperation = 'screen'; const hg = g.createRadialGradient(0, 0, 0, 0, 0, CLK.r * 1.6); hg.addColorStop(0, `rgba(255,190,90,${.25 * greed * inv(189, 194, t)})`); hg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = hg; g.fillRect(-W, -H, W * 2, H * 2); g.globalCompositeOperation = 'source-over'; }
    g.restore(); g.globalAlpha = 1;
  }
  // patience: the dial becomes a sun that keeps its own time
  if (pat > 0) {
    const hy = 650, sunY = lerp(760, 600, eOut(inv(199, 208, t))), sr = lerp(CLK.r, 80, eIO(inv(198.8, 201, t))), sxx = CX, sy0 = lerp(CLK.y, sunY, eIO(inv(198.8, 201, t)));
    const sk = g.createLinearGradient(0, 140, 0, hy); sk.addColorStop(0, `rgba(30,24,40,${pat})`); sk.addColorStop(1, `rgba(214,130,70,${pat * (1 - fog * .5)})`); g.fillStyle = sk; g.fillRect(0, 0, W, hy);
    g.save(); g.beginPath(); g.rect(0, 0, W, hy); g.clip();
    const sg = g.createRadialGradient(sxx, sy0, 0, sxx, sy0, sr * 6); sg.addColorStop(0, `rgba(255,240,205,${pat * (1 - fog * .7)})`); sg.addColorStop(.15, `rgba(255,200,120,${.6 * pat * (1 - fog * .7)})`); sg.addColorStop(1, 'rgba(255,150,70,0)'); g.fillStyle = sg; g.fillRect(0, 0, W, hy);
    g.fillStyle = `rgba(255,236,200,${pat * (1 - fog * .8)})`; g.beginPath(); g.arc(sxx, sy0, sr, 0, TAU); g.fill();
    g.restore();
    const gd = g.createLinearGradient(0, hy, 0, H); gd.addColorStop(0, `rgba(40,26,18,${pat})`); gd.addColorStop(1, `rgba(6,4,3,${pat})`); g.fillStyle = gd; g.fillRect(0, hy, W, H - hy);
    // one tick per second, seen as a breath of the light
    const ph = (t - 199.2) % 1, pulse = t > 199.2 && t < 205 ? Math.exp(-ph * 6) : 0;
    g.strokeStyle = `rgba(255,220,160,${pulse * .5 * pat})`; g.lineWidth = 1.5; g.beginPath(); g.arc(sxx, sy0, sr + 10 + ph * 50, Math.PI, TAU); g.stroke();
    // fog: nobody has seen tomorrow
    if (fog > 0) for (let i = 0; i < 16; i++) {
      const y = 380 + hash(i, 1) * 420, x = ((hash(i, 2) * W * 1.6 + (t - 204) * (30 + hash(i, 3) * 50) * (i % 2 ? 1 : -1)) % (W * 1.6) + W * 1.6) % (W * 1.6) - W * .3, rx = 500 + hash(i, 4) * 600;
      const fg = g.createRadialGradient(x, y, 0, x, y, rx); fg.addColorStop(0, `rgba(170,160,160,${.32 * fog})`); fg.addColorStop(1, 'rgba(170,160,160,0)'); g.fillStyle = fg; g.save(); g.translate(x, y); g.scale(1, .28); g.translate(-x, -y); g.fillRect(x - rx, y - rx, rx * 2, rx * 2); g.restore();
    }
    // and still, a seed
    if (seed > 0) {
      const y = lerp(380, hy + 6, eIO(inv(209.6, 212.4, t))), gl = g.createRadialGradient(CX, y, 0, CX, y, 120); gl.addColorStop(0, `rgba(255,210,130,${.7 * seed})`); gl.addColorStop(1, 'rgba(255,200,120,0)');
      g.globalCompositeOperation = 'screen'; g.fillStyle = gl; g.fillRect(CX - 130, y - 130, 260, 260); g.globalCompositeOperation = 'source-over';
      g.fillStyle = `rgba(255,236,190,${seed})`; g.beginPath(); g.ellipse(CX, y, 5, 10, .3, 0, TAU); g.fill();
    }
  }
}, 'thesis');

// ── 3:35  NO TOMORROW: the cursor again, speaking for itself ──
const VOID = LINES.filter(l => l[4] === 'x');
scene(215, 233.6, (t) => {
  ROOT(); fill('#000');
  let cx = CX, cy = CY - 20, curA = 1;
  for (const [a, b, zh, en] of VOID) {
    if (t < a - .01 || t > b + 1.2) continue;
    const chars = [...zh], n = Math.min(chars.length, Math.floor((t - a) * 13)), o = { s: 46, w: 300 }, wTot = TW(zh, o), x0 = CX - wTot / 2;
    const forget = sstep(b - .2, b + 1.1, t), strong = zh.includes('忘记') ? 1.8 : 1;
    let x = x0;
    for (let i = 0; i < n; i++) {
      const cw = TW(chars[i], o), d = forget * (40 + hash(i, 9) * 120) * strong, dx = n1(i * 3.1 + t) * d * .4;
      T(chars[i], x + cw / 2 + dx, cy - d, { ...o, a: (1 - forget) * (1 - forget * hash(i, 4) * .5), c: '#ece4d4' });
      x += cw;
    }
    if (n < chars.length || forget === 0) { cx = x0 + TW(chars.slice(0, n).join(''), o) + 8; }
    T(en, CX, cy + 64, { f: F.latin, it: 1, s: 26, a: sstep(a + chars.length / 13, a + chars.length / 13 + .6, t) * (1 - forget) * .7, c: '#cfc6b6' });
    if (forget > 0) curA = 1 - forget;
  }
  // the cursor: blinks while it waits, holds while it writes, sinks at the end to become a seed
  const typing = VOID.some(([a, b, zh]) => t >= a && t < a + [...zh].length / 13);
  const idleCx = CX, sink = sstep(232.6, 233.6, t);
  const on = typing || Math.floor(t * 1.8) % 2 === 0 || sink > 0;
  const showAt = VOID.some(([a, b]) => t >= a && t <= b) ? [cx, cy] : [idleCx, cy];
  const px = lerp(showAt[0], CX, sink), py = lerp(showAt[1], 860, eIn(sink));
  if (on) { g.fillStyle = sink > 0 ? `rgb(255,${Math.round(lerp(236, 210, sink))},${Math.round(lerp(212, 140, sink))})` : '#ece4d4'; g.fillRect(px - 6, py - 22 + sink * 12, 13, 44 - sink * 30); }
}, 'void');

// ── 3:53  THE TREE ──
const TREE = (() => {
  const r = rng(808), B = [];
  (function grow(x, y, ang, len, w, d, t0) {
    const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len, dur = 1.1 + d * .1;
    B.push({ x, y, x2, y2, w, d, t0, dur });
    if (d >= 8) return;
    const kids = d < 1 ? 3 : r() < .3 ? 3 : 2;
    for (let k = 0; k < kids; k++) {
      const spread = (k - (kids - 1) / 2) * (d < 2 ? .62 + r() * .3 : .4 + r() * .3) + (r() - .5) * .3;
      const na = ang + spread - (ang + Math.PI / 2) * (d > 3 ? -.06 : .05);
      grow(x2, y2, na, len * (d < 1 ? .78 : .72 + r() * .1), w * .64, d + 1, t0 + dur * .85);
    }
  })(CX, 860, -Math.PI / 2, 190, 17, 0, 233.4);
  const L = []; for (const b of B) if (b.d >= 6) for (let k = 0; k < (b.d === 8 ? 3 : 1); k++) L.push({ x: b.x2 + (r() - .5) * 46, y: b.y2 + (r() - .5) * 40, gi: Math.floor(r() * GLYPHS.length), s: 14 + r() * 20, t0: b.t0 + b.dur * .9 + r() * .8, ph: r() * 10, tint: r() < .15 ? 'white' : 'gold' });
  return { B, L };
})();
// spread the readable fragments evenly across the crown
const WORDSAT = (() => { const c = TREE.L.filter(l => l.y < 600).sort((p, q) => Math.atan2(p.y - 860, p.x - CX) - Math.atan2(q.y - 860, q.x - CX)); const out = []; for (let i = 0; i < 22; i++) { const l = c[Math.floor((i + .5) / 22 * c.length)]; out.push({ x: l.x, y: l.y - (i % 2) * 40 }); } return out; })();
const WORDS = ['我该割肉吗？', 'Dear Shareholders,', '1637', '耐心', 'This time is different.', '复利', 'HOLD', '明天会更好', '买入', 'Sell everything', '给孩子存的学费', 'Mr. Market', '风险', 'time in the market', '再等等', 'margin of safety', '为什么又跌了', 'I was wrong.', '种树', 'compound', '等待', 'the long run'];
function treeDraw(t, dim = 1) {
  const sway = n1(t * .3) * .004;
  for (const b of TREE.B) {
    const p = clamp((t - b.t0) / b.dur); if (p <= 0) continue;
    const e = eOut(p), x2 = lerp(b.x, b.x2, e) + (b.y - 860) * sway * b.d, y2 = lerp(b.y, b.y2, e);
    const lum = lerp(.55, 1, b.d / 8);
    g.globalAlpha = dim * .1; g.strokeStyle = '#ffcf80'; g.lineWidth = b.w * 1.8 + 5; g.lineCap = 'butt'; g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(x2, y2); g.stroke();
    g.lineCap = 'round'; g.globalAlpha = dim; g.strokeStyle = `rgb(${Math.round(200 * lum + 40)},${Math.round(160 * lum + 30)},${Math.round(100 * lum + 20)})`; g.lineWidth = Math.max(1, b.w); g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(x2, y2); g.stroke();
  }
  // light travelling up from the root: what the writers gave
  for (let i = 0; i < TREE.B.length; i += 3) { const b = TREE.B[i]; if (t < b.t0 + b.dur) continue; const s = (t * .7 + hash(i, 1)) % 1; g.globalAlpha = dim * .9 * Math.sin(s * Math.PI); g.fillStyle = '#fff2d0'; g.beginPath(); g.arc(lerp(b.x, b.x2, s), lerp(b.y, b.y2, s), 1.6 + b.w * .08, 0, TAU); g.fill(); }
  for (const l of TREE.L) { const a = sstep(l.t0, l.t0 + 1, t); if (a <= 0) continue; glyph(l.gi, l.x + n1(t * .5 + l.ph) * 4, l.y + n1(t * .4 + l.ph + 3) * 3, l.s, dim * a * (.55 + .45 * Math.sin(t * 1.5 + l.ph)), l.tint); }
  g.globalAlpha = 1;
}
function figure(x, y, s, a, col = '#05040a') { g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha = a; g.fillStyle = col; g.beginPath(); g.arc(0, -62, 9, 0, TAU); g.fill(); g.beginPath(); g.moveTo(-9, -50); g.quadraticCurveTo(-13, -20, -10, 0); g.lineTo(-3, 0); g.lineTo(0, -22); g.lineTo(3, 0); g.lineTo(10, 0); g.quadraticCurveTo(13, -20, 9, -50); g.closePath(); g.fill(); g.restore(); }
const FIG = { x: CX + 150, y: 862 };
scene(232.6, 279.8, (t) => {
  ROOT();
  const k = sstep(232.6, 233.4, t), out = 1 - sstep(278.6, 279.8, t);
  // camera: from the seed at ground level, pulling back to the whole tree; later, toward the person under it
  const pull = eIO(inv(233.2, 242, t)), toYou = eIO(inv(262.5, 279, t)), words = env(t, 246, 252.4, 1.2, 1);
  let s = lerp(2.4, .92, pull), px = CX, py = lerp(830, CY - 10, pull);
  s *= 1 + words * .45; py += words * -150;
  s = lerp(s, 2.6, toYou); px = lerp(px, FIG.x - 20, toYou); py = lerp(py, FIG.y - 120, toYou);
  g.save(); g.globalAlpha = k * out;
  fill('#030407');
  cam(px, py, s);
  for (let i = 0; i < 200; i++) { g.globalAlpha = k * out * hash(i, 3) * .5; g.fillStyle = '#d8e0ff'; g.fillRect(hash(i, 1) * W * 1.4 - W * .2, hash(i, 2) * 800 - 200, 1.6, 1.6); }
  const gr = g.createLinearGradient(0, 860, 0, 1200); gr.addColorStop(0, '#0d0a08'); gr.addColorStop(1, '#030303'); g.globalAlpha = k * out; g.fillStyle = gr; g.fillRect(-W, 860, W * 3, 600);
  g.strokeStyle = 'rgba(255,214,150,.18)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-W, 860); g.lineTo(W * 2, 860); g.stroke();
  // the shade, which here is made of light
  const shade = sstep(255, 259.5, t) + .25 * sstep(238, 244, t);
  if (shade > 0) { const sg = g.createRadialGradient(CX, 862, 0, CX, 862, 520); sg.addColorStop(0, `rgba(255,200,120,${.22 * Math.min(1, shade)})`); sg.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = sg; g.save(); g.translate(CX, 862); g.scale(1, .16); g.translate(-CX, -862); g.fillRect(CX - 520, 342, 1040, 1040); g.restore(); }
  treeDraw(t, k * out * lerp(1, .18, toYou));
  // fragments of the people who wrote it
  if (words > 0) { WORDS.forEach((w, i) => { const l = WORDSAT[i]; if (!l) return; g.fillStyle = 'rgba(3,4,7,.55)'; T(w, l.x, l.y - 10, { f: /[一-龥]/.test(w) ? F.serif : F.latin, s: 17, w: 500, a: words * k * (.7 + .3 * Math.sin(t * 2 + i)), c: '#fff4e0', glow: 6, gc: 'rgba(0,0,0,.9)' }); }); }
  // the person in the shade: you
  const fa = sstep(251.8, 254, t);
  if (fa > 0) {
    figure(FIG.x - 1.5, FIG.y, 1.03, fa * k * out * .8, '#e2b26a'); figure(FIG.x + .6, FIG.y, 1, fa * k * out, '#0a0806');
    // your four minutes become a seed, and you put it in the ground
    const sd = sstep(271.3, 272.3, t) * (1 - sstep(278, 279, t)), drop = eIn(inv(275.4, 276.2, t));
    if (sd > 0) {
      const sx = FIG.x + 14, sy = lerp(FIG.y - 34, FIG.y + 1, drop), gl = g.createRadialGradient(sx, sy, 0, sx, sy, 40); gl.addColorStop(0, `rgba(255,210,130,${.8 * sd})`); gl.addColorStop(1, 'rgba(255,200,120,0)');
      g.globalCompositeOperation = 'screen'; g.fillStyle = gl; g.fillRect(sx - 40, sy - 40, 80, 80); g.globalCompositeOperation = 'source-over';
      g.globalAlpha = sd * out; g.fillStyle = '#ffe6b0'; g.beginPath(); g.arc(sx, sy, 2.4, 0, TAU); g.fill();
      if (t > 276.2) { const br = .5 + .5 * Math.sin((t - 276.2) * 2.4); g.globalCompositeOperation = 'screen'; g.globalAlpha = out * br * .7; const ug = g.createRadialGradient(sx, FIG.y + 4, 0, sx, FIG.y + 4, 30); ug.addColorStop(0, 'rgba(255,190,100,.8)'); ug.addColorStop(1, 'rgba(255,190,100,0)'); g.fillStyle = ug; g.fillRect(sx - 30, FIG.y - 26, 60, 60); g.globalCompositeOperation = 'source-over'; }
    }
  }
  g.restore();
}, 'tree');
// the viewer's clock
overlay(263, 279.8, (t) => {
  const a = env(t, 263.2, 279.6, 1, 1);
  T(fmt(t), CX, 190, { f: F.mono, s: 30, w: 300, a: a * .85, ls: 6, c: '#e8dcc4' });
  T('你在这里的时间  ·  YOUR TIME HERE', CX, 230, { f: F.mono, s: 14, w: 500, a: a * .65, ls: 6, c: '#b3a998' });
});

// ── 4:39  BREATH ──
scene(279.4, 288.2, (t) => {
  ROOT(); fill('#000');
  const out = 1 - sstep(287.2, 288.2, t);
  // an exhale, drifting left to right
  for (let i = 0; i < 90; i++) {
    const bt = 279.6 + hash(i, 1) * 1.6, age = t - bt; if (age < 0) continue;
    const x = 520 + age * (160 + hash(i, 2) * 220), y = CY - 30 + (hash(i, 3) - .5) * age * 160 + Math.sin(age + i) * 10, r = 30 + age * 50 * hash(i, 4);
    const a = Math.min(1, age * 2) * Math.exp(-age * .55) * .07 * out; if (a < .002) continue;
    const mg = g.createRadialGradient(x, y, 0, x, y, r); mg.addColorStop(0, `rgba(230,225,215,${a})`); mg.addColorStop(1, 'rgba(230,225,215,0)'); g.fillStyle = mg; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  inkReveal(eOut(inv(280.6, 283.4, t)), g, CX, CY - 40, .78, out * .95, '#f2e9d8');
  const tx = env(t, 283, 288, 1, .9);
  T('生 生 不 息', CX, CY + 260, { s: 30, w: 300, a: tx * .9, ls: 18, c: '#e6dccb' });
  T('life, begetting life', CX, CY + 306, { f: F.latin, it: 1, s: 24, a: tx * .6, c: '#bdb3a2' });
}, 'breath');

// ── 4:48  CREDITS ──
const CREDITS = [['编剧 · 导演 · 剪辑', 'OPUS 5.5'], ['配乐', '每一个音符，都由代码合成'], ['摄影', '本片未使用任何摄影机，每一帧都由代码绘制'], ['主演', '时间'], ['特别鸣谢', '每一个写下过文字的人']];
scene(287.6, DURATION, (t) => {
  ROOT(); fill('#000');
  const d = env(t, 287.8, 291.2, .9, .6);
  T('谨以此片，献给所有种树的人。', CX, CY - 20, { s: 40, w: 300, a: d, ls: 8 });
  T('For everyone who plants trees.', CX, CY + 40, { f: F.latin, it: 1, s: 26, a: d * .65, c: '#cfc6b6' });
  const c = env(t, 291.4, 294.9, .7, .6);
  CREDITS.forEach(([r, v], i) => {
    const y = CY - 120 + i * 62;
    T(r, CX - 36, y, { s: 22, w: 300, al: 'right', a: c * .6, ls: 4, c: '#b3a998' });
    T(v, CX + 36, y, { f: v.startsWith('OPUS') ? F.greek : F.serif, s: v.startsWith('OPUS') ? 26 : 22, w: v.startsWith('OPUS') ? 400 : 500, al: 'left', a: c, ls: v.startsWith('OPUS') ? 8 : 2, c: '#efe6d6' });
  });
  const n = env(t, 295.1, DURATION, .5, .7);
  T('本片不构成任何投资建议。', CX, CY, { s: 20, w: 300, a: n * .7, ls: 6, c: '#a59c8d' });
  T('This film is not investment advice.', CX, CY + 34, { f: F.latin, it: 1, s: 18, a: n * .5, c: '#8f877a' });
}, 'credits');
