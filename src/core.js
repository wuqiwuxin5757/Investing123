// ───────────────────────── core: math, noise, canvas, type, post ─────────────────────────
const W = 1920, H = 1080, CX = W / 2, CY = H / 2;
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, x) => a + (b - a) * x;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const sstep = (a, b, x) => { const u = inv(a, b, x); return u * u * (3 - 2 * u); };
const eIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eOut = x => 1 - Math.pow(1 - x, 3);
const eIn = x => x * x * x;
const eOutExpo = x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
const eInExpo = x => x <= 0 ? 0 : Math.pow(2, 10 * x - 10);
// envelope: 0 outside [a,b], ramps in over fi, out over fo
const env = (t, a, b, fi = .5, fo = .5) => t < a || t > b ? 0 : Math.min(fi > 0 ? sstep(a, a + fi, t) : 1, fo > 0 ? 1 - sstep(b - fo, b, t) : 1);

function rng(seed) { let s = seed >>> 0; return () => { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(i, j = 0) { let h = (i * 374761393 + j * 668265263) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; }
function n1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }
function n2(x, y) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  return lerp(lerp(hash(i, j), hash(i + 1, j), ux), lerp(hash(i, j + 1), hash(i + 1, j + 1), ux), uy) * 2 - 1;
}
function fbm(x, y, o = 4) { let s = 0, a = .5, f = 1; for (let k = 0; k < o; k++) { s += a * n2(x * f, y * f); f *= 2.03; a *= .5; } return s; }

// ── canvas ──
const cv = document.getElementById('c');
const g = cv.getContext('2d');
let RES = 1; // device pixels per virtual pixel
function fitCanvas(fixed) {
  let w;
  if (fixed) w = 1920;
  else { const r = cv.getBoundingClientRect(); w = Math.round(Math.min(1920, Math.max(640, r.width * (window.devicePixelRatio || 1)))); }
  const h = Math.round(w * 9 / 16);
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  RES = w / W;
}
function mk(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return [c, c.getContext('2d')]; }
const ROOT = () => g.setTransform(RES, 0, 0, RES, 0, 0);

// ── type ──
const F = {
  serif: '"Noto Serif SC","Songti SC","STSong",serif',
  sans: '"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif',
  latin: '"Cormorant Garamond","Times New Roman",serif',
  mono: '"JetBrains Mono",ui-monospace,Menlo,monospace',
  brush: '"Ma Shan Zheng","Noto Serif SC",serif',
  greek: '"Noto Serif","Cormorant Garamond",serif',
};
const HAS_LS = 'letterSpacing' in g;
// draw text; o: {f,s,w,c,a,al,ls,base,glow,gc,it}
function T(str, x, y, o = {}) {
  const c = o.ctx || g;
  c.save();
  c.font = `${o.it ? 'italic ' : ''}${o.w || 400} ${o.s || 40}px ${o.f || F.serif}`;
  c.textAlign = o.al || 'center'; c.textBaseline = o.base || 'middle';
  c.globalAlpha *= o.a == null ? 1 : o.a;
  c.fillStyle = o.c || '#ece4d4';
  if (o.glow) { c.shadowColor = o.gc || o.c || '#ece4d4'; c.shadowBlur = o.glow * RES; }
  const ls = o.ls || 0;
  if (ls && HAS_LS) { c.letterSpacing = ls + 'px'; const off = c.textAlign === 'center' ? ls / 2 : 0; c.fillText(str, x + off, y); }
  else if (ls) { // manual tracking
    const chars = [...str]; const ws = chars.map(ch => c.measureText(ch).width); const tot = ws.reduce((p, q) => p + q, 0) + ls * (chars.length - 1);
    let px = c.textAlign === 'center' ? x - tot / 2 : c.textAlign === 'right' ? x - tot : x; c.textAlign = 'left';
    chars.forEach((ch, i) => { c.fillText(ch, px, y); px += ws[i] + ls; });
  } else c.fillText(str, x, y);
  c.restore();
}
function TW(str, o = {}) { const c = o.ctx || g; c.save(); c.font = `${o.it ? 'italic ' : ''}${o.w || 400} ${o.s || 40}px ${o.f || F.serif}`; const w = c.measureText(str).width + (o.ls || 0) * ([...str].length - 1); c.restore(); return w; }

// ── glyph atlas (fast particles made of writing) ──
const GLYPHS = ('钱金银利息债股价涨跌买卖等时年风险贪惧心命种子田粮契约账本信日记割肉明天今天未来希望恐慌泡沫崩盘复利耐心价值种树荫光阴岁月' +
  'MONEYTIMEBUYSELLRISKDEBTVALUEHOPEFEARGREEDyieldinterestprice0123456789$£¥€ƒ%▲▼ΤΟΚΟΣτόκος').split('');
const ATLAS = { size: 72, map: {}, c: null };
function buildAtlas() {
  const s = ATLAS.size, cols = 16, rows = Math.ceil(GLYPHS.length / cols);
  const [c, x] = mk(cols * s, rows * s); ATLAS.c = c;
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
  GLYPHS.forEach((ch, i) => {
    const cx = (i % cols) * s, cy = Math.floor(i / cols) * s;
    x.font = /[A-Za-z0-9$£¥€ƒ%]/.test(ch) ? `500 ${s * .62}px ${F.latin}` : `400 ${s * .6}px ${F.serif}`;
    x.fillText(ch, cx + s / 2, cy + s / 2 + 2);
    ATLAS.map[i] = [cx, cy];
  });
}
// tinted copies of the atlas
const TINT = {};
function tintAtlas(name, col) { const [c, x] = mk(ATLAS.c.width, ATLAS.c.height); x.drawImage(ATLAS.c, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); TINT[name] = c; }
function glyph(i, x, y, size, a, tint = 'warm', ctx = g) {
  const p = ATLAS.map[i % GLYPHS.length], s = ATLAS.size; if (a <= .003) return;
  ctx.globalAlpha = a; ctx.drawImage(TINT[tint], p[0], p[1], s, s, x - size / 2, y - size / 2, size, size);
}

// ── soft blur via down/up sampling (works everywhere) ──
const BL = {};
function blurInto(src, k, key = 'a') {
  // returns canvas containing src blurred by factor k (2..32)
  const w = Math.max(2, Math.round(src.width / k)), h = Math.max(2, Math.round(src.height / k));
  let b = BL[key + w]; if (!b) { b = BL[key + w] = mk(w, h); }
  const [c, x] = b; x.clearRect(0, 0, w, h); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
  if (k > 4) { const k2 = Math.round(k / 2), w2 = Math.round(src.width / k2), h2 = Math.round(src.height / k2); let b2 = BL[key + 'm' + w2]; if (!b2) b2 = BL[key + 'm' + w2] = mk(w2, h2); b2[1].clearRect(0, 0, w2, h2); b2[1].drawImage(src, 0, 0, w2, h2); x.drawImage(b2[0], 0, 0, w, h); }
  else x.drawImage(src, 0, 0, w, h);
  return c;
}
// a full-frame offscreen layer in device pixels
const LAYERS = {};
function layer(name) {
  let L = LAYERS[name];
  if (!L || L[0].width !== cv.width) { L = LAYERS[name] = mk(cv.width, cv.height); }
  L[1].setTransform(1, 0, 0, 1, 0, 0); L[1].clearRect(0, 0, cv.width, cv.height); L[1].setTransform(RES, 0, 0, RES, 0, 0);
  return L;
}
function blit(c, a = 1, op = 'source-over') { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.globalCompositeOperation = op; g.imageSmoothingEnabled = true; g.drawImage(c, 0, 0, cv.width, cv.height); g.restore(); }

// ── post: grain, vignette, letterbox ──
let GRAIN = [], VIG = null;
function buildPost() {
  const r = rng(7);
  for (let k = 0; k < 6; k++) {
    const [c, x] = mk(384, 384); const id = x.createImageData(384, 384);
    for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (r() + r() + r() - 1.5) * 120; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    x.putImageData(id, 0, 0); GRAIN.push(c);
  }
  const [vc, vx] = mk(960, 540); const gr = vx.createRadialGradient(480, 270, 140, 480, 270, 620);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.65, 'rgba(0,0,0,.22)'); gr.addColorStop(1, 'rgba(0,0,0,.82)');
  vx.fillStyle = gr; vx.fillRect(0, 0, 960, 540); VIG = vc;
}
const SCOPE = Math.round((H - W / 2.39) / 2); // ≈138px bars for 2.39:1
let barsFn = t => SCOPE;
function post(t, grainAmt = .085, vig = 1) {
  ROOT();
  g.save();
  // vignette
  g.globalAlpha = vig; g.drawImage(VIG, 0, 0, W, H);
  // grain (24fps cadence so it feels like film, not video noise)
  const fr = Math.floor(t * 24), gc = GRAIN[fr % GRAIN.length], ox = hash(fr, 3) * 384, oy = hash(fr, 9) * 384;
  g.globalCompositeOperation = 'overlay'; g.globalAlpha = grainAmt * 2.2;
  const pat = g.createPattern(gc, 'repeat'); g.translate(-ox, -oy); g.fillStyle = pat; g.fillRect(ox, oy, W, H); g.translate(ox, oy);
  g.restore();
  // letterbox
  const b = barsFn(t);
  if (b > .5) { g.fillStyle = '#000'; g.fillRect(0, 0, W, b); g.fillRect(0, H - b, W, b); }
}

// ── scene registry ──
const SCENES = [];
function scene(a, b, draw, name) { SCENES.push({ a, b, draw, name }); }
const OVER = []; // overlays drawn after post (e.g. subtitles, flashes)
function overlay(a, b, draw) { OVER.push({ a, b, draw }); }

// camera: zoom s around (px,py) placed at screen (sx,sy), rotation r
function cam(px, py, s = 1, r = 0, sx = CX, sy = CY, c = g) { c.translate(sx, sy); if (r) c.rotate(r); c.scale(s, s); c.translate(-px, -py); }
function shake(t, amp, seed = 1) { if (RM) amp *= .15; return [n1(t * 23 + seed) * amp, n1(t * 19 + seed + 50) * amp]; }
function black(a = 1) { g.save(); ROOT(); g.globalAlpha = a; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.restore(); }
function fill(col, a = 1) { g.save(); ROOT(); g.globalAlpha = a; g.fillStyle = col; g.fillRect(0, 0, W, H); g.restore(); }
const PREP = []; window.prepScenes = () => PREP.forEach(f => f());
const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
// procedural texture: fn(x,y) -> [r,g,b] on a w×h canvas
function texture(w, h, fn) { const [c, x] = mk(w, h), id = x.createImageData(w, h); let k = 0; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const p = fn(i, j); id.data[k++] = p[0]; id.data[k++] = p[1]; id.data[k++] = p[2]; id.data[k++] = 255; } x.putImageData(id, 0, 0); return c; }
