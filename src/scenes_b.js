// ───────────────────────── scenes II: the oldest word · the seed ─────────────────────────
let CLAY, MARBLE, PAPER;
PREP.push(() => {
  CLAY = texture(640, 420, (i, j) => { const n = fbm(i * .03, j * .03, 5), m = fbm(i * .25, j * .25, 2) * .25, v = 1 + n * .35 + m; return [150 * v, 112 * v, 78 * v]; });
  MARBLE = texture(960, 540, (i, j) => { const wx = fbm(i * .003, j * .003, 3) * 1.6, n = fbm(i * .0042 + wx, j * .0055 - wx, 5), v = Math.pow(1 - Math.min(1, Math.abs(n) * 3.2), 14) * (.4 + .6 * sstep(-.3, .4, fbm(i * .002 + 7, j * .002, 2))), v2 = Math.pow(1 - Math.min(1, Math.abs(fbm(i * .011 + 4, j * .009, 4)) * 4), 22) * .45, c = fbm(i * .006 + 9, j * .006, 4); const b = 226 + c * 22 - v * 95 - v2 * 50; return [b, b - 2, b - 7]; });
  PAPER = texture(960, 540, (i, j) => { const f = fbm(i * .05, j * .05, 4) * .05 + fbm(i * .6, j * .02, 2) * .03, b = 1 + f; return [236 * b, 228 * b, 210 * b]; });
});

// ── 1:01  CLAY ──
const WEDGE = (() => { const r = rng(31), a = []; let i = 0; for (let row = 0; row < 6; row++) { let x = -400 + r() * 40; while (x < 380 && i < WEDGES) { const ty = r() < .55 ? 'v' : r() < .6 ? 'h' : 'd'; a.push({ x, y: -250 + row * 98 + (r() - .5) * 10, ty, s: .8 + r() * .5, i }); x += 70 + r() * 70; i++; } } return a; })();
function drawWedge(c, w, k, lit) {
  c.save(); c.translate(w.x, w.y); c.rotate(w.ty === 'h' ? -Math.PI / 2 : w.ty === 'd' ? -Math.PI / 4 : 0); c.scale(w.s * (1 + (1 - k) * .4), w.s * (1 + (1 - k) * .4));
  c.globalAlpha = k;
  // head: a triangular pit; tail: a groove
  c.fillStyle = lit ? 'rgba(255,200,110,.95)' : 'rgba(40,24,12,.78)';
  c.beginPath(); c.moveTo(-22, -24); c.lineTo(22, -24); c.lineTo(0, 8); c.closePath(); c.fill();
  c.fillStyle = lit ? 'rgba(255,236,190,.9)' : 'rgba(225,180,130,.35)'; c.beginPath(); c.moveTo(22, -24); c.lineTo(0, 8); c.lineTo(5, -19); c.closePath(); c.fill();
  c.strokeStyle = lit ? 'rgba(255,200,110,.9)' : 'rgba(40,24,12,.7)'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 4); c.lineTo(0, 38); c.stroke();
  c.strokeStyle = lit ? 'rgba(255,240,200,.5)' : 'rgba(225,180,130,.25)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(3, 6); c.lineTo(3, 38); c.stroke();
  c.restore();
}
const MAS = [14, 15, 16, 17];
scene(61, 70.55, (t) => {
  ROOT(); fill('#070403');
  const k = env(t, 61, 70.55, .7, .3), fl = .82 + .18 * n1(t * 7) * n1(t * 2.3 + 4);
  const foc = sstep(66.6, 69, t), mw = WEDGE.find(w => w.i === 15) || WEDGE[0];
  g.save(); g.globalAlpha = k;
  cam(lerp(0, mw.x, foc * .55), lerp(0, mw.y, foc * .55), lerp(1, 1.12, inv(61, 70.7, t)) * (1 + foc * .25), -.04 + (t - 61) * .002);
  // the tablet: pillowed clay
  g.save(); rrect(g, -540, -330, 1080, 660, 70); g.clip();
  g.drawImage(CLAY, -560, -350, 1120, 700);
  const sh = g.createRadialGradient(-80, -60, 100, 0, 0, 700); sh.addColorStop(0, 'rgba(255,220,170,.10)'); sh.addColorStop(1, 'rgba(20,8,0,.6)'); g.fillStyle = sh; g.fillRect(-560, -350, 1120, 700);
  for (const w of WEDGE) { const p = clamp((t - wedgeT(w.i)) / .14); if (p > 0) drawWedge(g, w, eOut(p), false); }
  if (foc > 0) for (const w of WEDGE) if (MAS.includes(w.i)) { g.save(); g.globalCompositeOperation = 'screen'; drawWedge(g, w, foc, true); g.restore(); }
  g.restore();
  // torchlight from the left
  g.save(); g.globalCompositeOperation = 'screen'; const tl = g.createRadialGradient(-700, -300, 0, -700, -300, 1400); tl.addColorStop(0, `rgba(255,150,60,${.32 * fl})`); tl.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = tl; g.fillRect(-1200, -800, 2400, 1600); g.restore();
  // museum annotation
  if (foc > 0) {
    const ax = (WEDGE.find(w => w.i === 17) || mw).x + 60, ay = mw.y - 30;
    g.strokeStyle = `rgba(230,200,150,${.6 * foc})`; g.lineWidth = 1; g.beginPath(); g.moveTo(ax, ay); g.lineTo(ax + 120 * foc, ay - 90 * foc); g.stroke();
    g.fillStyle = `rgba(12,7,3,${.72 * foc})`; rrect(g, ax + 118, ay - 146, 300, 108, 6); g.fill();
    T('máš', ax + 135, ay - 106, { f: F.latin, it: 1, s: 48, al: 'left', a: foc, c: '#ffe3b0' });
    T('幼崽 · the young of a goat', ax + 137, ay - 62, { s: 18, w: 500, al: 'left', a: foc, c: '#e9d6b4', ls: 2 });
  }
  g.restore();
  // dust drifting in the torchlight
  for (let i = 0; i < 40; i++) { const x = (hash(i, 1) * W + t * 12 * (hash(i, 2) + .2)) % W, y = (hash(i, 3) * H - t * 6 * hash(i, 4) + H * 3) % H; g.globalAlpha = k * .5 * hash(i, 5) * (.6 + .4 * Math.sin(t * 2 + i)); g.fillStyle = '#ffcf90'; g.fillRect(x, y, 2, 2); }
}, 'clay');

// ── 1:10  MARBLE ──
scene(70.4, 77.7, (t) => {
  ROOT();
  const k = env(t, 70.4, 77.7, .35, .4), u = inv(70.4, 77.7, t);
  g.save(); g.globalAlpha = k;
  g.drawImage(MARBLE, -40 - u * 60, -30, W + 120, H + 60);
  const word = 'ΤΟΚΟΣ', o = { f: F.greek, s: 230, w: 400, ls: 60 };
  const x = CX + 40 - u * 90, y = CY - 30;
  T(word, x - 3, y - 3, { ...o, c: 'rgba(70,64,56,.85)' });
  T(word, x + 2.5, y + 2.5, { ...o, c: 'rgba(255,255,250,.9)' });
  T(word, x, y, { ...o, c: '#9d978d' });
  // a band of sunlight crossing the stone
  const sx = lerp(-600, W + 400, eIO(inv(70.6, 76.5, t)));
  g.save(); g.globalCompositeOperation = 'soft-light'; const lg = g.createLinearGradient(sx - 500, 0, sx + 500, 0); lg.addColorStop(0, 'rgba(255,240,210,0)'); lg.addColorStop(.5, 'rgba(255,240,210,.85)'); lg.addColorStop(1, 'rgba(255,240,210,0)'); g.fillStyle = lg; g.fillRect(0, 0, W, H); g.restore();
  // cool shade so the subtitle stays legible
  const sg = g.createLinearGradient(0, H * .55, 0, H); sg.addColorStop(0, 'rgba(30,28,26,0)'); sg.addColorStop(1, 'rgba(30,28,26,.65)'); g.fillStyle = sg; g.fillRect(0, 0, W, H);
  T('τόκος', x, y + 190, { f: F.greek, it: 1, s: 40, a: sstep(71.5, 73, t) * .9, c: '#4d473f' });
  g.restore();
}, 'marble');

// ── 1:17  INK ──
const SPLAT = (() => { const r = rng(17), a = []; for (let i = 0; i < 26; i++) { const an = r() * TAU, d = 140 + r() * 260; a.push([Math.cos(an) * d, Math.sin(an) * d * .8, 2 + r() * 9, r()]); } return a; })();
scene(77.5, 84.8, (t) => {
  ROOT();
  const k = env(t, 77.5, 84.8, .3, .6), hit = 78.05, u = inv(77.5, 84.8, t);
  g.save(); g.globalAlpha = k;
  g.drawImage(PAPER, -30 + u * 40, -20, W + 60, H + 40);
  const gx = CX - 150, gy = CY - 40;
  if (t < hit) { const p = inv(77.5, hit, t), y = lerp(-80, gy, p * p); g.fillStyle = '#16120e'; g.beginPath(); g.ellipse(gx, y, 9, 15 + p * 8, 0, 0, TAU); g.fill(); }
  else {
    const p = inv(hit, 80.6, t);
    // diluted halo spreading through the fibres
    g.save(); g.globalAlpha = k * .22 * sstep(hit, hit + 1.2, t); const s = 1 + eOut(inv(hit, 83, t)) * .08;
    g.drawImage(blurInto(xiGlyph(), 12, 'xh'), gx - 470 * s, gy - 490 * s, 940 * s, 940 * s); g.restore();
    g.save(); g.filter = 'none'; g.globalCompositeOperation = 'multiply';
    // the paper is light, so the glyph is printed dark
    inkReveal(eOut(p), g, gx, gy, .82, k, '#1b1714');
    g.restore();
    for (const [dx, dy, r, d] of SPLAT) { const q = eOut(clamp((t - hit) / (.25 + d * .3))); g.fillStyle = 'rgba(25,20,16,.85)'; g.beginPath(); g.arc(gx + dx * (.6 + .4 * q), gy + dy * (.6 + .4 * q), r * q, 0, TAU); g.fill(); }
  }
  // three readings, set vertically
  [['利', '息'], ['子', '息'], ['气', '息']].forEach((col, i) => {
    const a = sstep(79.3 + i * .9, 80.1 + i * .9, t), x = 1290 + i * 96;
    col.forEach((ch, j) => T(ch, x, 330 + j * 74, { s: 54, w: 500, c: '#2a241e', a: a }));
    T(['interest', 'offspring', 'breath'][i], x, 330 + 2 * 74 - 8, { f: F.latin, it: 1, s: 20, c: '#6b6156', a: a * .9 });
  });
  // the artist's seal
  const st = clamp((t - 82.4) / .18);
  if (st > 0) {
    const sc = lerp(1.6, 1, eOut(st)); g.save(); g.translate(gx + 250, gy + 210); g.scale(sc, sc); g.rotate(.03); g.globalAlpha = k * st * .92;
    g.fillStyle = '#b3261e'; rrect(g, -38, -38, 76, 76, 6); g.fill();
    T('OP', 0, -13, { f: F.latin, s: 30, w: 600, c: '#f3e6d6' }); T('US', 0, 17, { f: F.latin, s: 30, w: 600, c: '#f3e6d6' });
    g.restore();
  }
  const sg = g.createLinearGradient(0, H * .62, 0, H); sg.addColorStop(0, 'rgba(20,16,12,0)'); sg.addColorStop(1, 'rgba(20,16,12,.55)'); g.fillStyle = sg; g.fillRect(0, 0, W, H);
  g.restore();
}, 'ink');

// ── 1:24  THREE POINTS ON ONE EARTH ──
const PLACES = [['苏美尔', 'máš', 31, 46, 85.0], ['希腊', 'τόκος', 38, 23.7, 85.8], ['中国', '息', 34.3, 108.9, 86.6]];
const DEG = Math.PI / 180;
function ortho(lat, lon, lon0, lat0, R, cx, cy) { const p = lat * DEG, l = (lon - lon0) * DEG, p0 = lat0 * DEG; const x = R * Math.cos(p) * Math.sin(l), y = R * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l)), vis = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l); return [cx + x, cy - y, vis]; }
scene(84.4, 93.8, (t) => {
  ROOT(); fill('#010205');
  const k = env(t, 84.4, 93.8, .5, 1.2), lon0 = lerp(72, 62, inv(84.4, 93.8, t)), lat0 = 15, R = 700, cx = CX, cy = CY + 380;
  const zoom = 1 + eIn(inv(91.5, 93.8, t)) * 1.5;
  g.save(); g.globalAlpha = k; cam(CX, CY + 60, zoom, 0, CX, CY + 60);
  // stars
  for (let i = 0; i < 220; i++) { g.globalAlpha = k * hash(i, 8) * .7; g.fillStyle = '#cfd8ff'; g.fillRect(hash(i, 6) * W, hash(i, 7) * H * .7, 1.5, 1.5); }
  g.globalAlpha = k;
  // atmosphere + body
  const at = g.createRadialGradient(cx, cy, R * .96, cx, cy, R * 1.12); at.addColorStop(0, 'rgba(120,160,255,.35)'); at.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = at; g.beginPath(); g.arc(cx, cy, R * 1.12, 0, TAU); g.fill();
  const bd = g.createRadialGradient(cx - 200, cy - 420, 50, cx, cy, R); bd.addColorStop(0, '#16202e'); bd.addColorStop(1, '#03050a'); g.fillStyle = bd; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fill();
  // graticule
  g.lineWidth = 1; g.strokeStyle = 'rgba(140,170,220,.10)';
  for (let lon = -180; lon < 180; lon += 15) { g.beginPath(); let pen = false; for (let lat = -90; lat <= 90; lat += 3) { const [x, y, v] = ortho(lat, lon, lon0, lat0, R, cx, cy); if (v > 0) { pen ? g.lineTo(x, y) : g.moveTo(x, y); pen = true; } else pen = false; } g.stroke(); }
  for (let lat = -75; lat <= 75; lat += 15) { g.beginPath(); let pen = false; for (let lon = -180; lon <= 180; lon += 3) { const [x, y, v] = ortho(lat, lon, lon0, lat0, R, cx, cy); if (v > 0) { pen ? g.lineTo(x, y) : g.moveTo(x, y); pen = true; } else pen = false; } g.stroke(); }
  const pts = PLACES.map(p => ortho(p[2], p[3], lon0, lat0, R, cx, cy));
  // arcs joining them, lifted off the surface
  const ap = sstep(86.8, 88.6, t);
  if (ap > 0) for (const [a, b] of [[1, 0], [0, 2]]) {
    const [x0, y0] = pts[a], [x1, y1] = pts[b], mx = (x0 + x1) / 2, my = Math.min(y0, y1) - Math.abs(x1 - x0) * .35;
    g.strokeStyle = 'rgba(230,190,110,.75)'; g.lineWidth = 2; g.shadowColor = '#e3bb6a'; g.shadowBlur = 14 * RES;
    g.beginPath(); g.moveTo(x0, y0); const N = 40; for (let i = 1; i <= N * ap; i++) { const s = i / N, x = (1 - s) * (1 - s) * x0 + 2 * (1 - s) * s * mx + s * s * x1, y = (1 - s) * (1 - s) * y0 + 2 * (1 - s) * s * my + s * s * y1; g.lineTo(x, y); } g.stroke(); g.shadowBlur = 0;
  }
  PLACES.forEach((p, i) => {
    const [x, y] = pts[i], a = sstep(p[4], p[4] + .5, t), pulse = (t - p[4]) % 2.2 / 2.2, big = sstep(89.2, 90.2, t);
    if (a <= 0) return;
    g.fillStyle = '#ffe2a8'; g.shadowColor = '#e3bb6a'; g.shadowBlur = (20 + big * 40) * RES; g.globalAlpha = k * a; g.beginPath(); g.arc(x, y, 6 + big * 3, 0, TAU); g.fill(); g.shadowBlur = 0;
    g.strokeStyle = `rgba(255,220,160,${(1 - pulse) * .6 * a})`; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, 8 + pulse * 46, 0, TAU); g.stroke();
    const ly = y - 70 - (i === 1 ? 40 : 0);
    g.strokeStyle = `rgba(230,210,170,${.35 * a})`; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y - 12); g.lineTo(x, ly + 22); g.stroke();
    T(p[0], x, ly, { s: 24, w: 500, a: a * k * (1 - big), ls: 6 });
    T(p[1], x, ly - 34, { f: i === 2 ? F.brush : F.greek, it: i < 2, s: 26, a: a * k * .8 * (1 - big), c: '#e8cf9a' });
  });
  g.restore();
  g.globalAlpha = 1;
}, 'globe');

// ── 1:33  THE SEED, THE WAITING, THE FIELD ──
const STALKS = (() => { const r = rng(101), a = []; for (let i = 0; i < 1000; i++) { const d = Math.pow(r(), 1.1); a.push({ x: r() * 2300 - 190, d, h: lerp(50, 430, d) * (.75 + r() * .4), w: lerp(1, 4.2, d), ph: r() * 10, lean: (r() - .5) * .12 }); } return a.sort((p, q) => p.d - q.d); })();
const SEEDX = CX - 40, HORIZ = 770;
function skyAt(t) {
  // returns [daylight 0..1, sun angle] — timelapse days that slow down into one golden evening
  if (t < 113.3) return [0, -1];
  const u = inv(113.3, 125, t), ph = 5.25 * (1 - Math.pow(1 - u, 2.2));
  const day = .5 - .5 * Math.cos(ph * TAU);
  return [t > 124 ? lerp(day, .62, sstep(124, 126.5, t)) : day, (ph % 1)];
}
scene(93, 130.6, (t) => {
  ROOT();
  const k = env(t, 93, 130.6, 1.4, .01), [day, sa] = skyAt(t), gold = sstep(123.5, 127, t);
  const grow = sstep(113.6, 125.5, t);
  const zm = lerp(1.9, 1, eIO(inv(112.8, 121.5, t))), ex = lerp(SEEDX, CX, eIO(inv(112.8, 121.5, t)));
  g.save(); cam(ex, HORIZ, zm, 0, CX, lerp(690, HORIZ, eIO(inv(112.8, 121.5, t))));
  // sky
  const top = [lerp(4, 38, day) * (1 - gold) + 46 * gold, lerp(6, 92, day) * (1 - gold) + 30 * gold, lerp(14, 168, day) * (1 - gold) + 26 * gold];
  const hor = [lerp(14, 196, day) * (1 - gold) + 240 * gold, lerp(22, 214, day) * (1 - gold) + 150 * gold, lerp(40, 232, day) * (1 - gold) + 72 * gold];
  const sk = g.createLinearGradient(0, 0, 0, HORIZ); sk.addColorStop(0, `rgb(${top.map(Math.round)})`); sk.addColorStop(1, `rgb(${hor.map(Math.round)})`);
  g.globalAlpha = k; g.fillStyle = sk; g.fillRect(-200, -400, W + 400, HORIZ + 402);
  // stars wheel overhead while we wait
  const night = 1 - day, rot = (t - 93) * .006 + (t > 113.3 ? (t - 113.3) * .05 : 0);
  if (night > .05) for (let i = 0; i < 380; i++) {
    const r0 = 200 + hash(i, 1) * 1800, a0 = hash(i, 2) * TAU + rot, x = CX * 1.2 + Math.cos(a0) * r0, y = -260 + Math.sin(a0) * r0 * .9;
    if (y > HORIZ || x < 0 || x > W || y < 0) continue; g.globalAlpha = k * night * (.25 + .75 * hash(i, 3)) * (.7 + .3 * Math.sin(t * 3 + i)); g.fillStyle = '#e9eeff'; g.fillRect(x, y, hash(i, 4) < .1 ? 2.4 : 1.4, hash(i, 4) < .1 ? 2.4 : 1.4);
  }
  // the sun: racing across the timelapse, then settling low on the right
  let sx = 0, sy = 0, sun = 0;
  if (t > 113.3) { const ang = Math.PI * (1 - sa * 2); sx = lerp(CX + Math.cos(ang) * 1100, 1480, gold); sy = lerp(HORIZ - Math.max(0, Math.sin(ang)) * 650, 600, gold); sun = gold > 0 ? 1 : clamp(Math.sin(ang) * 3); }
  if (sun > 0) { g.save(); g.globalAlpha = k * sun; const sg = g.createRadialGradient(sx, sy, 0, sx, sy, 520); sg.addColorStop(0, 'rgba(255,240,200,1)'); sg.addColorStop(.06, 'rgba(255,214,140,.9)'); sg.addColorStop(.25, 'rgba(255,170,80,.28)'); sg.addColorStop(1, 'rgba(255,140,60,0)'); g.globalCompositeOperation = 'screen'; g.fillStyle = sg; g.fillRect(0, 0, W, H); g.restore(); }
  // earth
  g.globalAlpha = k;
  const eg = g.createLinearGradient(0, HORIZ, 0, H); eg.addColorStop(0, `rgb(${Math.round(lerp(8, 60, day))},${Math.round(lerp(7, 42, day))},${Math.round(lerp(8, 24, day))})`); eg.addColorStop(1, '#030201'); g.fillStyle = eg; g.fillRect(-200, HORIZ, W + 400, H - HORIZ + 300);
  if (grow > 0) { g.globalAlpha = k * grow * .9; const fg = g.createLinearGradient(0, HORIZ, 0, H); fg.addColorStop(0, `rgb(${Math.round(lerp(60, 150, day))},${Math.round(lerp(45, 104, day))},${Math.round(lerp(20, 44, day))})`); fg.addColorStop(1, '#1a1206'); g.fillStyle = fg; g.fillRect(-200, HORIZ, W + 400, H - HORIZ + 300); g.globalAlpha = k; }
  // the grain: slow fall, impact, burial, glow
  const hit = 104.05;
  if (t < hit + .2) {
    const p = inv(94, hit, t), y = lerp(380, HORIZ + 6, p < 0 ? 0 : 1 - Math.pow(1 - p, 1.6) * (1 - p * .2) - (1 - p) * 0), x = SEEDX + Math.sin(t * .7) * 30 * (1 - p), rot = t * .6;
    const gy = t < 94 ? 380 : y;
    g.save(); g.translate(x, gy); g.rotate(rot); g.globalAlpha = k * sstep(93.4, 94.5, t);
    const gl = g.createRadialGradient(0, 0, 0, 0, 0, 90); gl.addColorStop(0, 'rgba(255,214,140,.55)'); gl.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = gl; g.fillRect(-90, -90, 180, 180);
    g.fillStyle = '#e8bf6c'; g.beginPath(); g.ellipse(0, 0, 9, 19, 0, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(120,80,30,.8)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, -14); g.lineTo(0, 14); g.stroke();
    g.fillStyle = 'rgba(255,250,230,.8)'; g.beginPath(); g.ellipse(-3, -4, 2, 6, 0, 0, TAU); g.fill();
    g.restore();
  }
  if (t >= hit) {
    for (let i = 0; i < 46; i++) { const d = t - hit, a = hash(i, 11) * Math.PI, v = 120 + hash(i, 12) * 260, x = SEEDX + Math.cos(a) * v * d * (hash(i, 13) < .5 ? 1 : -1), y = HORIZ + 4 - Math.sin(a) * v * d + 420 * d * d; if (d > 1.4 || y > HORIZ + 10) continue; g.globalAlpha = k * (1 - d / 1.4); g.fillStyle = '#4a3624'; g.fillRect(x, y, 3, 3); }
    // a mound, and a glow under the soil that breathes
    g.globalAlpha = k * (1 - grow); g.fillStyle = '#120d08'; g.beginPath(); g.ellipse(SEEDX, HORIZ + 4, 26, 6, 0, Math.PI, TAU); g.fill();
    const br = (.5 + .5 * Math.sin((t - hit) * 1.4)) * sstep(hit + .5, hit + 2, t) * (1 - grow);
    g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = k * br * .85; const ug = g.createRadialGradient(SEEDX, HORIZ + 14, 0, SEEDX, HORIZ + 14, 110); ug.addColorStop(0, 'rgba(255,190,100,.6)'); ug.addColorStop(1, 'rgba(255,170,80,0)'); g.fillStyle = ug; g.fillRect(SEEDX - 120, HORIZ - 100, 240, 230); g.restore();
  }
  // the field rises from the place the seed went in
  if (grow > 0) {
    const wind = t * .55;
    for (const s of STALKS) {
      const dist = Math.abs(s.x - SEEDX) / 1200, born = clamp((grow - dist * .55) / .45); if (born <= 0) continue;
      const by = lerp(HORIZ + 2, H + 40, s.d), h = s.h * eOut(born), sw = (n2(s.x * .0035 - wind, s.d * 2) * .32 + .1) * (.4 + s.d * .7) + s.lean;
      const tx = s.x + Math.sin(sw) * h, ty = by - Math.cos(sw) * h, mx = s.x + Math.sin(sw * .5) * h * .5, my = by - h * .55;
      const lum = lerp(.35, 1, s.d) * lerp(.35, 1, day);
      g.globalAlpha = k * lerp(.55, 1, s.d);
      const sil = gold * s.d * .75;
      g.strokeStyle = `rgb(${Math.round(lerp(lerp(40, 150, lum) + gold * 40, 52, sil))},${Math.round(lerp(lerp(34, 112, lum) + gold * 20, 34, sil))},${Math.round(lerp(lerp(20, 50, lum), 16, sil))})`;
      g.lineWidth = s.w; g.beginPath(); g.moveTo(s.x, by); g.quadraticCurveTo(mx, my, tx, ty); g.stroke();
      if (born > .5) {
        const hl = h * .17 * sstep(.5, 1, born), an = sw + Math.PI;
        g.save(); g.translate(tx, ty); g.rotate(sw); g.fillStyle = `rgb(${Math.round(lerp(lerp(70, 226, lum) + gold * 25, 120, sil * .7))},${Math.round(lerp(lerp(55, 176, lum) + gold * 10, 78, sil * .7))},${Math.round(lerp(lerp(30, 84, lum), 30, sil * .7))})`;
        g.beginPath(); g.ellipse(0, -hl * .5, s.w * 1.6, hl * .6, 0, 0, TAU); g.fill();
        if (sil > .1) { g.strokeStyle = `rgba(255,214,140,${sil * .8})`; g.lineWidth = 1.2; g.beginPath(); g.ellipse(0, -hl * .5, s.w * 1.6, hl * .6, 0, -1.2, 1.2); g.stroke(); }
        if (s.d > .55) { g.strokeStyle = `rgba(255,220,150,${.35 * gold})`; g.lineWidth = .8; for (let a = -1; a <= 1; a += 1) { g.beginPath(); g.moveTo(0, -hl); g.lineTo(a * 6, -hl - 26 * s.d); g.stroke(); } }
        g.restore();
      }
    }
  }
  g.restore();
  // golden hour: haze, pollen, flare
  if (gold > 0) {
    g.save(); g.globalCompositeOperation = 'screen';
    g.globalAlpha = k * gold * .35; const hz = g.createLinearGradient(0, HORIZ - 200, 0, HORIZ + 120); hz.addColorStop(0, 'rgba(255,170,90,0)'); hz.addColorStop(.6, 'rgba(255,170,90,.6)'); hz.addColorStop(1, 'rgba(255,170,90,0)'); g.fillStyle = hz; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 70; i++) { const x = (hash(i, 21) * W + t * 20 * hash(i, 22)) % W, y = HORIZ - 300 + hash(i, 23) * 500 + Math.sin(t + i) * 12; g.globalAlpha = k * gold * hash(i, 24) * .8; g.fillStyle = '#ffd9a0'; g.beginPath(); g.arc(x, y, 1 + hash(i, 25) * 2.5, 0, TAU); g.fill(); }
    const fx = CX - sx, fy = CY - sy;
    [[.4, 60, .10], [.75, 26, .14], [1.25, 110, .06], [1.6, 40, .08]].forEach(([m, r, a]) => { g.globalAlpha = k * gold * a; g.fillStyle = '#ffcf8a'; g.beginPath(); g.arc(sx + fx * m * 2, sy + fy * m * 2, r, 0, TAU); g.fill(); });
    g.restore();
  }
  g.globalAlpha = 1;
}, 'seed');
