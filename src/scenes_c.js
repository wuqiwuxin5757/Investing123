// ───────────────────────── scenes III: the same sentence · the fall · 3 a.m. ─────────────────────────
// the price of impatience: one line that runs under the whole montage
const PX = t => (t - 129.5) * 150;
const PY = t => { const u = t - 129.5; return -(30 * (Math.exp(u / 8.2) - 1) + u * 6 + n1(u * 1.7) * 18 * (1 + u * .08) + n1(u * 6.1 + 3) * 6 * (1 + u * .1)); };
function chartCam(t) { const hx = PX(t), hy = PY(t); return [hx - 330, hy + 180]; } // world point that sits at screen centre
function drawPrice(t, a, col = '#e9b866', lw = 3) {
  if (a <= 0) return; const [ox, oy] = chartCam(t), t0 = Math.max(129.5, t - 14);
  g.save(); g.translate(CX - ox, CY - oy);
  // faint grid in chart space
  g.globalAlpha = a * .5; g.strokeStyle = 'rgba(220,200,160,.12)'; g.lineWidth = 1;
  const gx0 = Math.floor((ox - CX) / 160) * 160, gy0 = Math.floor((oy - CY) / 120) * 120;
  for (let x = gx0; x < ox + CX + 160; x += 160) { g.beginPath(); g.moveTo(x, oy - CY); g.lineTo(x, oy + CY); g.stroke(); }
  for (let y = gy0; y < oy + CY + 120; y += 120) { g.beginPath(); g.moveTo(ox - CX, y); g.lineTo(ox + CX, y); g.stroke(); }
  g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = 'round'; g.shadowColor = col; g.shadowBlur = 16 * RES;
  g.beginPath(); for (let s = t0; s <= t; s += .05) { const x = PX(s), y = PY(s); s === t0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
  g.fillStyle = '#fff4dc'; g.beginPath(); g.arc(PX(t), PY(t), 5, 0, TAU); g.fill();
  g.restore();
}
function card(t, a, b, year, en, zh, dark) {
  const k = env(t, a + .05, b, .25, .2); if (k <= 0) return;
  T(year, 150, 210, { f: F.latin, s: 64, w: 600, al: 'left', a: k, c: dark ? '#2a1d10' : '#f0e2c4' });
  T(en + '  ·  ' + zh, 154, 262, { f: F.mono, s: 16, w: 500, al: 'left', a: k * .8, ls: 5, c: dark ? '#4a3a26' : '#d6c7a8' });
}

// ── 2:09  the field becomes a chart ──
scene(129.4, 136.4, (t) => {
  ROOT();
  const k = sstep(129.4, 130.6, t), bars = sstep(129.6, 131.6, t), out = 1 - sstep(135.8, 136.4, t);
  fill('#060504', k);
  // wheat stalks straighten into bars of a rising series
  const n = 64;
  for (let i = 0; i < n; i++) {
    const x = 60 + i * (W - 120) / (n - 1), hv = 120 + i * 6 + Math.pow(i / n, 3) * 380 + n1(i * .7) * 50, by = 900;
    const sway = (1 - bars) * n2(x * .0035 - 129.6 * .55, .9) * .3, h = lerp(330 + hash(i, 3) * 80, hv, eIO(bars)) * k;
    const up = n1(i * .9 + 1) > -.2, col = bars < .5 ? '#b8903f' : up ? '#c7443a' : '#3aa36c';
    g.globalAlpha = k * out * lerp(1, .55, sstep(131.5, 133, t));
    g.strokeStyle = col; g.lineWidth = lerp(3, 14, eIO(bars)); g.lineCap = 'butt';
    g.beginPath(); g.moveTo(x, by); g.quadraticCurveTo(x + Math.sin(sway) * h * .5, by - h * .55, x + Math.sin(sway) * h, by - Math.cos(sway) * h); g.stroke();
    if (bars > .6) { g.lineWidth = 2; g.beginPath(); g.moveTo(x, by - h - 18 * hash(i, 5)); g.lineTo(x, by + 14 * hash(i, 6)); g.stroke(); }
  }
  g.globalAlpha = 1;
  drawPrice(t, sstep(131.2, 132.6, t) * out);
}, 'chart');

// ── 2:16  MONTAGE: four centuries, one sentence ──
const STORM = ['这次不一样。', 'This time is different.', 'Dit keer is het anders.', '今回は違う。', 'Diesmal ist alles anders.', 'Cette fois, c’est différent.', 'Esta vez es diferente.', 'На этот раз всё иначе.', 'Questa volta è diverso.'];
function tulip(x, y, s, a) {
  g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha = a; g.strokeStyle = '#3b2a18'; g.lineWidth = 2.2; g.lineCap = 'round';
  g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-6, 120, 8, 240, -4, 360); g.stroke();
  g.beginPath(); g.moveTo(-2, 250); g.bezierCurveTo(-90, 200, -120, 120, -100, 60); g.bezierCurveTo(-60, 120, -30, 190, -2, 250); g.stroke();
  g.beginPath(); g.moveTo(-60, -10); g.bezierCurveTo(-70, -90, -40, -150, -10, -170); g.bezierCurveTo(-5, -120, 0, -60, 0, 0); g.stroke();
  g.beginPath(); g.moveTo(60, -10); g.bezierCurveTo(70, -90, 40, -150, 10, -170); g.bezierCurveTo(5, -120, 0, -60, 0, 0); g.stroke();
  g.beginPath(); g.moveTo(-60, -10); g.bezierCurveTo(-40, 20, 40, 20, 60, -10); g.stroke();
  g.beginPath(); g.moveTo(-25, -40); g.bezierCurveTo(-20, -110, 0, -160, 0, -190); g.bezierCurveTo(0, -160, 20, -110, 25, -40); g.stroke();
  for (let i = 0; i < 16; i++) { g.lineWidth = .8; g.beginPath(); g.moveTo(-50 + i * 6, -20 - (i % 4) * 8); g.lineTo(-44 + i * 6, -60 - (i % 5) * 12); g.stroke(); }
  g.restore();
}
scene(136, T_PEAK, (t) => {
  ROOT();
  const seg = CUTS.findIndex((c, i) => t >= c && (i === CUTS.length - 1 || t < CUTS[i + 1]));
  const lt = t - CUTS[seg], hit = 1 - sstep(0, .35, lt);
  const [sx, sy] = shake(t, 4 * hit + (seg === 6 ? 2 + 14 * inv(158, T_PEAK, t) : 0));
  g.save(); g.translate(sx, sy);
  if (seg === 0) { // 1637 · engraving
    fill('#c8b28a'); g.globalAlpha = .18; g.fillStyle = '#4a3520'; for (let y = 0; y < H; y += 5) g.fillRect(0, y, W, 1.2); g.globalAlpha = 1;
    tulip(560, 470 + lt * 4, 1.05 + lt * .01, 1);
    T('Dit keer is het anders.', 1180, 520, { f: F.latin, it: 1, s: 76, c: '#2d2014', a: sstep(136.3, 137, t) });
    const vg = g.createRadialGradient(CX, CY, 300, CX, CY, 1100); vg.addColorStop(0, 'rgba(40,25,10,0)'); vg.addColorStop(1, 'rgba(40,25,10,.75)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    drawPrice(t, .55, '#7a2a1c', 3);
    card(t, 136, 140, '1637', 'AMSTERDAM', '阿姆斯特丹', 1);
  } else if (seg === 1) { // 1720 · the orrery goes mad
    fill('#0c0a10');
    const mad = sstep(143.4, 145.5, t), cx = CX + 120, cy = CY - 20;
    for (let i = 1; i <= 6; i++) {
      const rx = 70 + i * 62, ry = rx * .42;
      g.strokeStyle = `rgba(214,190,140,${.35 - i * .03})`; g.lineWidth = 1.2; g.beginPath();
      for (let a = 0; a <= TAU + .01; a += .05) { const j = mad * 60 * n2(a * 3 + i, t * 2 + i), x = cx + Math.cos(a) * (rx + j), y = cy + Math.sin(a) * (ry + j * .7); a === 0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
      const pa = t * (1.4 / i) + i * 1.3 + mad * n1(t * 5 + i) * 4, px = cx + Math.cos(pa) * rx, py = cy + Math.sin(pa) * ry;
      g.fillStyle = '#f2dcae'; g.beginPath(); g.arc(px, py, 4 + i * .8, 0, TAU); g.fill();
    }
    g.fillStyle = '#ffd88a'; g.shadowColor = '#ffb84a'; g.shadowBlur = 40 * RES; g.beginPath(); g.arc(cx, cy, 22, 0, TAU); g.fill(); g.shadowBlur = 0;
    drawPrice(t, .45);
    card(t, 140, 147, '1720', 'LONDON', '伦敦');
  } else if (seg === 2) { // 1929 · newsprint
    fill('#d9d4c8');
    g.fillStyle = 'rgba(30,30,30,.08)'; for (let y = 0; y < H; y += 9) for (let x = (y / 9 % 2) * 4.5; x < W; x += 9) g.fillRect(x, y, 2.4, 2.4);
    g.fillStyle = 'rgba(30,30,30,.55)'; for (let c = 0; c < 6; c++) for (let l = 0; l < 26; l++) { const x = 140 + c * 280, y = 560 + l * 15; if (y > 960) break; g.fillRect(x, y, 230 * (.6 + .4 * hash(c, l)), 5); }
    g.fillStyle = '#1b1b1b'; g.fillRect(140, 380, W - 280, 4); g.fillRect(140, 540, W - 280, 2);
    T('“A PERMANENTLY HIGH PLATEAU”', CX, 450, { f: F.latin, s: 92, w: 600, c: '#141414', a: sstep(147.1, 147.5, t) });
    T('Prof. Irving Fisher  ·  October 1929', CX, 510, { f: F.latin, it: 1, s: 30, c: '#333' });
    drawPrice(t, .5, '#1c1c1c', 3);
    card(t, 147, 151.5, '1929', 'NEW YORK', '纽约', 1);
    g.globalCompositeOperation = 'multiply'; fill('#c9c2b0', .35); g.globalCompositeOperation = 'source-over';
  } else if (seg === 3) { // 1989 · neon in the rain
    fill('#07040c');
    for (let i = 0; i < 140; i++) { const x = hash(i, 1) * W, y = ((hash(i, 2) * H + t * 1400 * (.6 + hash(i, 3))) % (H + 200)) - 100; g.strokeStyle = 'rgba(160,170,255,.18)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 6, y + 50); g.stroke(); }
    const fl = n1(t * 30) > -.7 ? 1 : .35, ch = [...'今回は違う'];
    ch.forEach((c, i) => { T(c, CX + 260, 300 + i * 110, { s: 96, w: 700, c: '#ff4fd8', glow: 50, gc: '#ff2fc0', a: fl }); T(c, CX + 260, 300 + i * 110, { s: 96, w: 700, c: '#ffe6fb', a: fl * .85 }); });
    g.globalAlpha = .5; g.fillStyle = '#2fd8ff'; g.shadowColor = '#2fd8ff'; g.shadowBlur = 30 * RES; g.fillRect(CX - 520, 300, 6, 460); g.shadowBlur = 0; g.globalAlpha = 1;
    drawPrice(t, .6, '#ff6fd2');
    card(t, 151.5, 154, '1989', 'TOKYO', '东京');
  } else if (seg === 4) { // 2000 · phosphor
    fill('#020a04');
    const s = 'THIS TIME IS DIFFERENT', n = Math.floor(clamp((t - 154.15) / 1.1) * s.length);
    T('> ' + s.slice(0, n) + (Math.floor(t * 4) % 2 ? '_' : ' '), 300, CY, { f: F.mono, s: 58, w: 500, al: 'left', c: '#6dff9a', glow: 22, gc: '#2aff6a' });
    g.fillStyle = 'rgba(0,0,0,.35)'; for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 2);
    drawPrice(t, .5, '#6dff9a');
    card(t, 154, 156, '2000', 'SILICON VALLEY', '硅谷');
  } else if (seg === 5) { // 2021 · a screen in a hand
    fill('#050506');
    const px = CX + 140, py = CY + 20;
    g.fillStyle = '#121216'; rrect(g, px - 190, py - 380, 380, 760, 48); g.fill(); g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#1d1d24'; rrect(g, px - 160, py - 200, 320, 150, 18); g.fill();
    T('这次不一样。', px - 135, py - 145, { f: F.sans, s: 34, w: 400, al: 'left', c: '#f2f2f2' });
    T('♥ ' + Math.floor(1200 + Math.pow(clamp((t - 156) / 2), 2) * 38000).toLocaleString('en-US'), px - 135, py - 88, { f: F.mono, s: 20, w: 300, al: 'left', c: '#ff5a5a' });
    g.strokeStyle = '#ff4a4a'; g.lineWidth = 3; g.beginPath(); for (let i = 0; i <= 40; i++) { const x = px - 150 + i * 7.5, y = py + 220 - Math.pow(i / 40, 3) * 200 + n1(i * .8) * 8; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    drawPrice(t, .45, '#ff4a4a');
    card(t, 156, 158, '2021', 'A SCREEN', '某块屏幕');
  } else { // the storm
    const u = inv(158, T_PEAK, t);
    fill(`rgb(${Math.round(lerp(8, 46, u))},${Math.round(lerp(6, 6, u))},${Math.round(lerp(6, 8, u))})`);
    drawPrice(t, 1, '#ffcf7a', 3 + u * 3);
    const NS = 460, span = T_PEAK - 158;
    for (let i = 0; i < NS; i++) {
      const bt = 158 + span * Math.sqrt(i / NS), age = t - bt; if (age < 0 || age > 1.6) continue;
      const s = STORM[i % STORM.length], x = 120 + hash(i, 1) * (W - 240), y = 190 + hash(i, 2) * 560, sz = 26 + Math.pow(hash(i, 3), 3) * 90;
      T(s, x, y, { f: /[一-龥ぁ-ん]/.test(s) ? F.serif : F.latin, s: sz, w: 500, a: (1 - age / 1.6) * sstep(0, .08, age) * .9, c: hash(i, 4) < .3 ? '#ff6a5a' : '#f3e7d2' });
    }
  }
  g.restore();
  // a hard flash on each cut
  if (hit > .6 && seg > 0) fill('#fff', (hit - .6) * .5);
}, 'montage');

// ── 2:45  the peak: silence ──
scene(T_PEAK, T_CRASH, (t) => {
  ROOT(); fill('#000');
  const x = CX + 120, y = 300;
  g.strokeStyle = 'rgba(255,214,140,.7)'; g.lineWidth = 3; g.shadowColor = '#ffcf7a'; g.shadowBlur = 20 * RES;
  g.beginPath(); g.moveTo(x - 420, y + 700); g.bezierCurveTo(x - 200, y + 500, x - 60, y + 200, x, y); g.stroke();
  g.fillStyle = '#fff8e8'; g.shadowBlur = 40 * RES; g.beginPath(); g.arc(x, y, 7, 0, TAU); g.fill(); g.shadowBlur = 0;
}, 'peak');

// ── 2:47  the fall ──
const CRACKS = (() => { const r = rng(66), a = []; for (let i = 0; i < 16; i++) { let x = 0, y = 0, an = (i / 16) * TAU + r() * .3; const pts = [[0, 0]]; const len = 300 + r() * 900; for (let s = 0; s < len; s += 40 + r() * 50) { an += (r() - .5) * .6; x += Math.cos(an) * 55; y += Math.sin(an) * 55; pts.push([x, y]); } a.push(pts); } return a; })();
const DEBRIS = (() => { const r = rng(67), a = []; for (let i = 0; i < 320; i++) a.push({ x: r() * W, y: -100 + r() * 700, vx: (r() - .5) * 260, vy: -r() * 300, gi: Math.floor(r() * GLYPHS.length), s: 16 + r() * 50, rot: r() * 6, vr: (r() - .5) * 6, red: r() < .55 }); return a; })();
scene(T_CRASH, 172.6, (t) => {
  ROOT(); fill('#000');
  const u = t - T_CRASH, x0 = CX + 120, y0 = 300, [sx, sy] = shake(t, 34 * Math.exp(-u * 2.2));
  g.save(); g.translate(sx, sy);
  // the line falls straight through the floor
  const fall = eIn(clamp(u / .55));
  g.strokeStyle = '#ff5040'; g.lineWidth = 4; g.shadowColor = '#ff3020'; g.shadowBlur = 26 * RES; g.globalAlpha = 1 - sstep(1.5, 3.5, u);
  g.beginPath(); g.moveTo(x0, y0); for (let s = 0; s <= fall; s += .02) g.lineTo(x0 + s * 120 + n1(s * 30) * 20, y0 + s * 900); g.stroke(); g.shadowBlur = 0;
  // the glass of the frame cracks
  const cr = eOut(clamp(u / .2)), ca = 1 - sstep(.8, 4.5, u);
  const drawCracks = (dx, col, a) => { g.strokeStyle = col; g.globalAlpha = a; g.lineWidth = 1.6; for (const pts of CRACKS) { g.beginPath(); const n = Math.max(1, Math.floor(pts.length * cr)); for (let i = 0; i < n; i++) i ? g.lineTo(x0 + pts[i][0] + dx, y0 + pts[i][1]) : g.moveTo(x0 + dx, y0); g.stroke(); } };
  if (u < .7) { g.globalCompositeOperation = 'screen'; drawCracks(-6, '#ff2a2a', ca * .8); drawCracks(6, '#2ad4ff', ca * .8); g.globalCompositeOperation = 'source-over'; }
  drawCracks(0, '#f6efe4', ca);
  // and four centuries of numbers come down
  g.globalAlpha = 1;
  for (const d of DEBRIS) {
    const x = d.x + d.vx * u * .6, y = d.y + d.vy * u * .5 + 150 * u * u; if (y > H + 60) continue;
    g.save(); g.translate(x, y); g.rotate(d.rot + d.vr * u); glyph(d.gi, 0, 0, d.s, (1 - sstep(2.5, 5.5, u)) * .85, d.red ? 'red' : 'warm'); g.restore();
  }
  g.restore();
  const fl = 1 - sstep(0, .25, u); if (fl > 0) fill('#fff', fl * .9);
  fill('#000', sstep(4.6, 5.6, u));
}, 'crash');

// ── 2:52  3 a.m. ──
function smoothPath(c, P, close = true) {
  const n = P.length; c.beginPath(); c.moveTo(P[0][0], P[0][1]);
  for (let i = 0; i < (close ? n : n - 1); i++) { const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n]; c.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]); }
  if (close) c.closePath();
}
const PROFILE = [[300, 380], [335, 230], [318, 90], [240, 8], [140, 14], [92, 70], [80, 130], [72, 158], [60, 182], [30, 232], [44, 246], [58, 252], [52, 270], [60, 282], [54, 296], [62, 330], [92, 356], [124, 380], [128, 450], [70, 540], [-20, 640], [-60, 760], [560, 760], [520, 560], [420, 470]];
scene(172, 184.8, (t) => {
  ROOT();
  const k = env(t, 172, 184.8, 1.2, .8);
  fill('#03050a', k);
  g.save(); g.globalAlpha = k;
  // the window: rain, and a city that does not sleep
  const wx = 150, wy = 190, ww = 760, wh = 560;
  g.fillStyle = '#070b14'; g.fillRect(wx, wy, ww, wh);
  g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
  for (let i = 0; i < 46; i++) { const cx = wx + hash(i, 1) * ww, cy = wy + wh * .35 + hash(i, 2) * wh * .7, r = 10 + hash(i, 3) * 34; const col = hash(i, 4) < .5 ? '255,180,90' : hash(i, 4) < .8 ? '120,170,255' : '255,90,90'; const rg = g.createRadialGradient(cx, cy, 0, cx, cy, r); rg.addColorStop(0, `rgba(${col},.35)`); rg.addColorStop(1, `rgba(${col},0)`); g.fillStyle = rg; g.fillRect(cx - r, cy - r, r * 2, r * 2); }
  for (let i = 0; i < 90; i++) { const x = wx + hash(i, 7) * ww, sp = 40 + hash(i, 8) * 120, y = wy + ((hash(i, 9) * wh + (t - 172) * sp) % wh); g.strokeStyle = 'rgba(190,210,255,.22)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 1, y + 10 + hash(i, 10) * 18); g.stroke(); }
  for (let i = 0; i < 70; i++) { g.fillStyle = 'rgba(200,220,255,.25)'; g.beginPath(); g.arc(wx + hash(i, 11) * ww, wy + hash(i, 12) * wh, 1.5 + hash(i, 13) * 3, 0, TAU); g.fill(); }
  g.restore();
  g.strokeStyle = '#0d1018'; g.lineWidth = 14; g.strokeRect(wx, wy, ww, wh); g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.stroke();
  // red, green, red: the ticker reflected in a face
  const mixv = .5 + .5 * Math.tanh(n1((t - 172) * .9) * 5), cr = Math.round(lerp(225, 40, mixv)), cg = Math.round(lerp(60, 200, mixv)), cb = Math.round(lerp(50, 110, mixv)), col = `rgb(${cr},${cg},${cb})`;
  const fx = 1180, fy = 250, fs = 1.18;
  const lg = g.createRadialGradient(1040, 680, 0, 1040, 680, 620); lg.addColorStop(0, `rgba(${cr},${cg},${cb},.32)`); lg.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalCompositeOperation = 'screen'; g.fillStyle = lg; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
  const [LF, fc] = layer('face');
  fc.save(); fc.translate(fx, fy); fc.scale(fs, fs);
  fc.shadowColor = col; fc.shadowBlur = 26 * RES; fc.fillStyle = col; fc.translate(-6, 4); smoothPath(fc, PROFILE); fc.fill(); fc.translate(6, -4); fc.shadowBlur = 0;
  fc.fillStyle = '#020306'; smoothPath(fc, PROFILE); fc.fill(); fc.restore();
  fc.globalCompositeOperation = 'destination-in'; const rg2 = fc.createLinearGradient(fx + 40, 0, fx + 300, 0); rg2.addColorStop(0, 'rgba(0,0,0,1)'); rg2.addColorStop(1, 'rgba(0,0,0,0)'); fc.fillStyle = rg2; fc.fillRect(0, 0, W, H); fc.globalCompositeOperation = 'source-over';
  g.save(); g.translate(fx, fy); g.scale(fs, fs); g.fillStyle = '#020306'; smoothPath(g, PROFILE); g.fill(); g.restore();
  blit(LF, k);
  // the phone
  g.save(); g.translate(990, 720); g.rotate(-.5);
  g.fillStyle = '#0a0a0c'; rrect(g, -70, -130, 140, 260, 18); g.fill();
  g.fillStyle = `rgba(${cr},${cg},${cb},.25)`; rrect(g, -62, -120, 124, 240, 12); g.fill();
  T('03:07', 0, -90, { f: F.mono, s: 18, w: 500, c: '#f0f0f0', a: .9 });
  g.strokeStyle = col; g.lineWidth = 2.5; g.beginPath(); for (let i = 0; i <= 24; i++) { const x = -52 + i * 4.4, y = 30 - n1(i * .5 + (t - 172) * 1.2) * 40; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  g.restore();
  g.restore();
}, 'room');
