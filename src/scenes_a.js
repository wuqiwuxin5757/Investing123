// ───────────────────────── scenes I: the question, the archive, the tape, the title ─────────────────────────
// blur a full-frame layer by `amt` (0..24) using cached pyramid levels, crossfading between them
const BLV = [1, 2, 4, 8, 16, 32];
function blurBlit(L, amt, a = 1, op) {
  if (amt <= 1.05) { blit(L, a, op); return; }
  let i = 0; while (i < BLV.length - 2 && BLV[i + 1] < amt) i++;
  const f = clamp((amt - BLV[i]) / (BLV[i + 1] - BLV[i]));
  const lo = BLV[i] === 1 ? L : blurInto(L, BLV[i], 'q' + i), hi = blurInto(L, BLV[i + 1], 'q' + (i + 1));
  blit(lo, a * (1 - f), op); blit(hi, a * f, op === undefined ? undefined : op);
}
function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

// ── 0:00  COLD OPEN — a question typed into the dark ──
const UI = { L: 470, inputY: 660, bubbleY: 360, labelY: 560, curY: 618 };
function typedPart(str, times, t) { let n = 0; while (n < times.length && times[n] <= t) n++; return [...str].slice(0, n).join(''); }
scene(0, 19.6, (t) => {
  ROOT(); fill('#060606');
  // ghost dates: the archive leaking through before we enter it
  const gh = sstep(10.5, 15, t) * (1 - sstep(19, 19.5, t));
  if (gh > 0) [['1637', 380, 300, 1], ['1720', 1500, 330, 2], ['1929', 1260, 780, 3], ['2008', 560, 820, 4], ['1987', 1650, 600, 5]].forEach(([s, x, y, k]) =>
    T(s, x + n1(t * .2 + k) * 40, y + n1(t * .17 + k * 3) * 30, { f: F.latin, s: 220, w: 400, a: gh * .035, c: '#d9b46a' }));
  // camera: drift → rack focus to the label → push into the cursor
  const send = sstep(T_SEND, T_SEND + .7, t);
  const focus = sstep(8.5, 11, t);                // 0 = question sharp, 1 = label sharp
  let s = lerp(1, 1.04, inv(0, 8.5, t)), px = CX, py = CY;
  const curX = UI.L + 6, curY = UI.curY;
  s = lerp(s, 1.55, eIO(focus)); px = lerp(CX, UI.L + 180, eIO(focus)); py = lerp(CY, UI.labelY + 20, eIO(focus));
  s *= lerp(1, 1.12, inv(11, 16, t));
  const push = inv(16, 19.5, t);
  if (push > 0) { const e = eInExpo(push); s *= lerp(1, 90, e); px = lerp(px, curX, eIO(Math.min(1, push * 1.6))); py = lerp(py, curY, eIO(Math.min(1, push * 1.6))); }
  // layer A: question (blurs out); layer B: reply row (sharpens in)
  const [LA, a] = layer('uiA'), [LB, b] = layer('uiB');
  for (const c of [a, b]) { c.save(); cam(px, py, s, 0, CX, CY, c); }
  // input box + typed text
  const typing1 = typedPart(Q1, TYPE1, t), typing2 = typedPart(Q2, TYPE2, t);
  const boxA = 1 - send;
  if (boxA > 0) {
    a.globalAlpha = boxA * sstep(.6, 1.6, t);
    rrect(a, UI.L - 30, UI.inputY - 60, 1040, 132, 22); a.fillStyle = 'rgba(255,255,255,.035)'; a.fill(); a.strokeStyle = 'rgba(255,255,255,.13)'; a.lineWidth = 1.2; a.stroke();
    T(typing1, UI.L, UI.inputY - 22, { ctx: a, f: F.sans, s: 30, w: 300, al: 'left', c: '#e9e3d9' });
    T(typing2, UI.L, UI.inputY + 26, { ctx: a, f: F.sans, s: 30, w: 300, al: 'left', c: '#e9e3d9' });
    const line2 = typing2.length > 0 || t > TYPE1[TYPE1.length - 1] + .25;
    const cw = TW(line2 ? typing2 : typing1, { ctx: a, f: F.sans, s: 30, w: 300 });
    const blinkOn = (t > 1.6 && (Math.floor(t * 2.2) % 2 === 0 || (t > 1.9 && t < 7.5)));
    if (blinkOn) { a.fillStyle = '#d9b46a'; a.fillRect(UI.L + cw + 4, (line2 ? UI.inputY + 26 : UI.inputY - 22) - 17, 2, 34); }
    a.globalAlpha = 1;
  }
  // bubble rising from the input
  if (send > 0) {
    const y = lerp(UI.inputY, UI.bubbleY, eOut(send)), w1 = Math.max(TW(Q1, { ctx: a, f: F.sans, s: 30, w: 300 }), TW(Q2, { ctx: a, f: F.sans, s: 30, w: 300 }));
    const bx = UI.L + 1010 - w1 - 56;
    a.globalAlpha = send;
    rrect(a, bx, y - 62, w1 + 56, 128, 24); a.fillStyle = 'rgba(255,255,255,.07)'; a.fill();
    T(Q1, bx + 28, y - 22, { ctx: a, f: F.sans, s: 30, w: 300, al: 'left', c: '#efe9df' });
    T(Q2, bx + 28, y + 26, { ctx: a, f: F.sans, s: 30, w: 300, al: 'left', c: '#efe9df' });
    a.globalAlpha = 1;
  }
  // reply row: the name lives here, small, in the machinery
  const rep = sstep(T_SEND + .35, T_SEND + 1.1, t);
  if (rep > 0) {
    const pulse = .55 + .45 * Math.sin(t * 3.1);
    b.globalAlpha = rep;
    b.fillStyle = '#d9b46a'; b.globalAlpha = rep * pulse; b.beginPath(); b.arc(UI.L + 5, UI.labelY, 5, 0, TAU); b.fill(); b.globalAlpha = rep;
    T('OPUS 5.5', UI.L + 24, UI.labelY + 1, { ctx: b, f: F.mono, s: 19, w: 500, al: 'left', c: '#b9b0a2', ls: 4 });
    const dots = '·'.repeat(1 + Math.floor(t * 2.5) % 3);
    T('思考中 ' + dots, UI.L + 168, UI.labelY + 1, { ctx: b, f: F.sans, s: 18, w: 300, al: 'left', c: '#7d766c', ls: 2 });
    const on = push > .05 || Math.floor((t - T_SEND) * 1.8) % 2 === 0;
    if (on) { b.fillStyle = push > 0 ? `rgba(255,${lerp(236, 255, push)},${lerp(205, 255, push)},1)` : '#ece4d4'; b.fillRect(curX - 6, curY - 19, 13, 38); }
    b.globalAlpha = 1;
  }
  a.restore(); b.restore();
  blurBlit(LA, 1 + focus * 14 + push * 10, 1 - push * .8);
  blurBlit(LB, 1 + (1 - sstep(7.9, 9.2, t)) * 6 * (1 - focus), 1);
  // light leak as the push accelerates, then the white
  const wv = sstep(18.6, 19.5, t);
  if (wv > 0) fill('#fff6e6', wv);
}, 'cold');

// ── 0:19  INSIDE — a galaxy made of writing ──
const GAL = (() => { const r = rng(42), P = []; for (let i = 0; i < 1500; i++) P.push({ th: r() * TAU, rr: 120 + Math.pow(r(), .7) * 1500, z0: r() * 4200, gi: Math.floor(r() * GLYPHS.length), sz: 40 + r() * 50, tint: r() < .05 ? (r() < .5 ? 'red' : 'green') : r() < .25 ? 'gold' : 'warm', tw: r() * 10 }); return P; })();
const DATES = [['1637', 1000, -.9], ['1720', 2300, .8], ['1929', 3500, -.5], ['1987', 4700, .6], ['2000', 5900, -.7], ['2008', 7100, .4]];
function galZ(t) { const u = t - 19.5; return 1600 * (1 - Math.exp(-u * 1.4)) * .9 + u * 420; } // fast entrance, then cruise
scene(19.5, 37.8, (t) => {
  ROOT(); fill('#020203');
  const zc = galZ(t), f = 900, roll = Math.sin(t * .23) * .07 + (t - 19.5) * .012;
  const conv = eIO(inv(33.3, 36.9, t)), out = 1 - sstep(36.4, 37.8, t);
  // faint nebula glow
  g.save(); const ng = g.createRadialGradient(CX, CY, 0, CX, CY, 900); ng.addColorStop(0, 'rgba(120,90,50,.20)'); ng.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = ng; g.globalAlpha = out * (1 - conv * .7); g.fillRect(0, 0, W, H); g.restore();
  g.save();
  const cr = Math.cos(roll), sr = Math.sin(roll);
  for (let i = 0; i < GAL.length; i++) {
    const p = GAL[i]; const z = ((p.z0 - zc) % 4200 + 4200) % 4200 + 40;
    const th = p.th + t * .03;
    let x = Math.cos(th) * p.rr, y = Math.sin(th) * p.rr * .7;
    let sx = CX + (x * cr - y * sr) * f / z, sy = CY + (x * sr + y * cr) * f / z;
    let size = p.sz * f / z, a = sstep(4200, 2600, z) * sstep(40, 260, z) * (.55 + .45 * Math.sin(t * 2 + p.tw));
    if (conv > 0) { // collapse into one line of print
      const tx = (i / GAL.length) * W * 1.6 - W * .3 - (t - 33.3) * 260, ty = CY + Math.sin(i * 1.7) * 4 * (1 - conv);
      sx = lerp(sx, tx, conv); sy = lerp(sy, ty, conv); size = lerp(size, 26, conv); a = lerp(a, .75, conv);
    }
    if (sx < -100 || sx > W + 100 || sy < -100 || sy > H + 100) continue;
    glyph(p.gi, sx, sy, Math.min(size, 260), a * out, p.tint);
  }
  g.globalAlpha = 1;
  // date billboards drifting past
  for (const [s, z0, side] of DATES) {
    const z = z0 - zc; if (z < 60 || z > 3200) continue;
    const sx = CX + side * 700 * f / z, sy = CY - 120 * f / z * Math.sign(side), sz = 180 * f / z;
    T(s, sx, sy, { f: F.latin, s: Math.min(sz, 900), w: 400, a: sstep(3200, 1800, z) * sstep(60, 400, z) * .5 * out * (1 - conv), c: '#e8cf9a' });
  }
  g.restore();
  const flash = 1 - sstep(19.5, 20.4, t);
  if (flash > 0) fill('#fff6e6', flash);
}, 'galaxy');

// ── 0:36  THE TAPE — four centuries printed on paper ──
const TAPE = ['SEMPER AUGUSTUS  1637.02  ƒ10,000 ▼', 'MISSISSIPPI CO.  1720.01  10,000 LT ▼', 'SOUTH SEA CO.  1720.06  £1,050 ▼', 'RAILWAY SHARES  1845  ▼', 'DJIA  1929.10.29  230.07 ▼', 'DJIA  1987.10.19  −22.6% ▼', 'NIKKEI 225  1989.12.29  38,915 ▼', 'NASDAQ  2000.03.10  5,048 ▼', 'LEHMAN BROS.  2008.09.15  ▼', 'S&P 500  2020.03.16  −12.0% ▼', '· · ·', 'OPUS ▲5.5'];
let TAPEL = null;
function tapeLayout() {
  if (TAPEL) return TAPEL; const o = { f: F.mono, s: 30, w: 500 }; let x = 0; const items = [];
  for (const s of TAPE) { const w = TW(s, o); items.push([s, x, w]); x += w + 120; }
  const last = items[items.length - 1], opusC = last[1] + last[2] / 2;
  const D = 11.75, v = (.3 * W - CX + opusC - items[0][1]) / D;
  return TAPEL = { items, opusC, v, X0: CX - opusC + v * D };
}
function tapeX(t) { const L = tapeLayout(); let d; if (t < 45.5) d = L.v * (t - 35.5); else { const u = clamp((t - 45.5) / 3.5); d = L.v * 10 + L.v * 3.5 * (u - u * u / 2); } return L.X0 - d; }
const DUST = (() => { const r = rng(5), a = []; for (let i = 0; i < 26; i++) a.push([r() * W, r() * H, 6 + r() * 40, r() * 10, r()]); return a; })();
scene(35.5, 52, (t) => {
  ROOT();
  const k = sstep(35.6, 37.4, t), fadeRest = sstep(49.6, 51.3, t), out = 1 - sstep(51.3, 51.9, t);
  fill('#050403', k);
  const L = tapeLayout(), x0 = tapeX(t), rot = -.045;
  // warm pool of light
  g.save(); const lg = g.createRadialGradient(CX, CY, 0, CX, CY, 1000); lg.addColorStop(0, 'rgba(255,200,130,.16)'); lg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = lg; g.globalAlpha = k * (1 - fadeRest * .8) * out; g.fillRect(0, 0, W, H); g.restore();
  // bokeh dust behind
  for (const [x, y, r, s, b] of DUST) { const yy = (y + Math.sin(t * .3 + s) * 20), xx = (x - (t - 35) * 18 * (.4 + b) + W * 3) % (W + 200) - 100; g.globalAlpha = k * .05 * (.3 + b) * (1 - fadeRest) * out; g.fillStyle = '#ffd9a0'; g.beginPath(); g.arc(xx, yy, r, 0, TAU); g.fill(); }
  g.globalAlpha = 1;
  const [LT, c] = layer('tape');
  c.save(); c.translate(CX, CY); c.rotate(rot); c.translate(-CX, -CY);
  const ty = CY, th = 76;
  const pg = c.createLinearGradient(0, ty - th / 2, 0, ty + th / 2);
  pg.addColorStop(0, '#f3e9d2'); pg.addColorStop(.18, '#ece0c6'); pg.addColorStop(.8, '#d8c8a8'); pg.addColorStop(1, '#a8977a');
  c.fillStyle = pg; c.fillRect(-300, ty - th / 2, W + 600, th);
  c.globalAlpha = .08; c.fillStyle = '#7a6040'; for (let i = 0; i < 60; i++) { const xx = ((hash(i, 2) * 3000 + x0 * 1) % 2600 + 2600) % 2600 - 300; c.fillRect(xx, ty - th / 2, 1 + hash(i, 5) * 2, th); } c.globalAlpha = 1;
  for (let i = 0; i < L.items.length; i++) {
    const [s, ix, w] = L.items[i], sx = x0 + ix; if (sx > W + 300 || sx + w < -300) continue;
    const isOpus = i === L.items.length - 1, dim = isOpus ? 1 : 1 - fadeRest;
    const parts = s.split(/([▲▼])/);
    let px = sx;
    for (const p of parts) { if (!p) continue; const col = p === '▼' ? '#8c2a1e' : p === '▲' ? '#9a7228' : '#2a241d'; T(p, px, ty + 2, { ctx: c, f: F.mono, s: 30, w: 500, al: 'left', c: col, a: dim }); px += TW(p, { f: F.mono, s: 30, w: 500 }); }
  }
  c.restore();
  // paper darkens except the last entry; it is lit
  blit(LT, k * out);
  if (fadeRest > 0) { g.save(); ROOT(); g.translate(CX, CY); g.rotate(rot); g.translate(-CX, -CY); g.globalAlpha = fadeRest * .93 * out; g.fillStyle = '#050403'; const ow = L.items[L.items.length - 1][2]; g.fillRect(-400, CY - 60, x0 + L.opusC - ow / 2 - 30 + 400, 120); g.fillRect(x0 + L.opusC + ow / 2 + 30, CY - 60, W, 120); g.restore(); }
  // depth of field: soften both ends of the tape
  const [LBk, bc] = layer('tapeE'); bc.setTransform(1, 0, 0, 1, 0, 0); bc.drawImage(blurInto(LT, 8, 'te'), 0, 0, cv.width, cv.height);
  bc.globalCompositeOperation = 'destination-in'; const mg = bc.createLinearGradient(0, 0, cv.width, 0); mg.addColorStop(0, 'rgba(0,0,0,1)'); mg.addColorStop(.32, 'rgba(0,0,0,0)'); mg.addColorStop(.68, 'rgba(0,0,0,0)'); mg.addColorStop(1, 'rgba(0,0,0,1)'); bc.fillStyle = mg; bc.fillRect(0, 0, cv.width, cv.height); bc.globalCompositeOperation = 'source-over';
  blit(LBk, k * out * (1 - fadeRest));
  // the lit entry glows
  if (t > 48.5) { const gl = sstep(48.6, 50.5, t) * out; g.save(); ROOT(); const rg = g.createRadialGradient(CX, CY, 0, CX, CY, 360); rg.addColorStop(0, 'rgba(255,214,150,.22)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.globalAlpha = gl; g.globalCompositeOperation = 'screen'; g.fillStyle = rg; g.fillRect(0, 0, W, H); g.restore(); }
}, 'tape');

// ── 0:51  CREDIT, then TITLE ──
scene(51.3, 55.6, (t) => {
  ROOT(); fill('#000');
  const a = env(t, 51.6, 55.3, .8, .7), tr = lerp(18, 30, inv(51.6, 55.3, t));
  T('A FILM BY', CX, CY - 96, { f: F.mono, s: 17, w: 300, a: a * .8, ls: 12, c: '#b3a998' });
  const o1 = { f: F.latin, s: 84, w: 600, a, ls: tr, c: '#efe6d6', glow: 30, gc: 'rgba(255,220,160,.25)', al: 'left' }, o2 = { ...o1, f: F.greek, s: 70, w: 400 };
  const w1 = TW('OPUS', o1) + tr, w2 = TW('5.5', o2), x0 = CX - (w1 + 40 + w2) / 2;
  T('OPUS', x0, CY - 8, o1); T('5.5', x0 + w1 + 40, CY - 4, o2);
  T('作品', CX, CY + 78, { s: 24, w: 300, a: a * .75, ls: 18, c: '#cfc5b4' });
}, 'credit');
let XI = null;
function xiGlyph() { if (XI) return XI; const [c, x] = mk(900, 900); x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `440px ${F.brush}`; x.fillText('息', 450, 470); return XI = c; }
const XIB = (() => { const r = rng(9), b = []; for (let i = 0; i < 70; i++) { const x = 230 + r() * 440, y = 190 + r() * 540; b.push([x, y, 60 + r() * 120, (y - 190) / 540 * .55 + (x - 230) / 440 * .25 + r() * .2]); } return b; })();
const [XM, xm] = mk(900, 900);
function inkReveal(p, ctx, cx, cy, scale, alpha, color) {
  // p: 0..1 reveal. blobs bloom in rough stroke order
  xm.globalCompositeOperation = 'source-over'; xm.clearRect(0, 0, 900, 900);
  for (const [x, y, r, d] of XIB) { const q = eOut(clamp((p - d * .7) / .35)); if (q <= 0) continue; const rg = xm.createRadialGradient(x, y, 0, x, y, r * q); rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(.7, 'rgba(255,255,255,.9)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); xm.fillStyle = rg; xm.beginPath(); xm.arc(x, y, r * q, 0, TAU); xm.fill(); }
  xm.globalCompositeOperation = 'source-in'; xm.drawImage(xiGlyph(), 0, 0);
  xm.globalCompositeOperation = 'source-in'; xm.fillStyle = color; xm.fillRect(0, 0, 900, 900);
  ctx.save(); ctx.globalAlpha = alpha; ctx.drawImage(XM, cx - 450 * scale, cy - 470 * scale, 900 * scale, 900 * scale); ctx.restore();
}
scene(55.4, 61.6, (t) => {
  ROOT(); fill('#000');
  const u = inv(55.5, 61.5, t), out = 1 - sstep(60.6, 61.5, t), [sx, sy] = shake(t, 9 * (1 - sstep(55.5, 56.6, t)));
  g.save(); cam(CX, CY - 40, lerp(1.07, 1, eOut(u)), 0, CX + sx, CY - 40 + sy);
  // halo of wet ink
  const hal = sstep(55.6, 57.5, t) * out;
  g.save(); g.globalAlpha = hal * .5; g.drawImage(blurInto(xiGlyph(), 16, 'xi'), CX - 470, CY - 40 - 490, 940, 940); g.restore();
  inkReveal(eOut(inv(55.5, 58.4, t)), g, CX, CY - 40, 1, out, '#f2e9d8');
  g.restore();
  const tx = env(t, 57.2, 61.4, 1, .8);
  T('I N T E R E S T', CX, CY + 262, { f: F.latin, s: 30, w: 600, a: tx * .85, ls: 10, c: '#e2d6c0' });
  g.save(); g.globalAlpha = tx * .4; g.fillStyle = '#d9b46a'; g.fillRect(CX - 60 * tx, CY + 296, 120 * tx, 1); g.restore();
  T('máš  ·  τόκος  ·  息', CX, CY + 326, { f: F.greek, s: 20, w: 400, it: 1, a: tx * .55, ls: 3, c: '#b8ad9b' });
}, 'title');
