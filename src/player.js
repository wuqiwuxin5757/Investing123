// ───────────────────────── projection booth ─────────────────────────
const RENDER = /render/.test(location.search);
const grainAt = t => t < 19.5 ? .05 : (t > 136 && t < 147) ? .13 : (t > 172 && t < 184) ? .11 : .085;

function renderFrame(t) {
  fitCanvas(RENDER);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.fillStyle = '#000'; g.fillRect(0, 0, cv.width, cv.height);
  ROOT();
  for (const s of SCENES) if (t >= s.a && t < s.b) { g.save(); s.draw(t, t - s.a); g.restore(); ROOT(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.shadowBlur = 0; }
  post(t, grainAt(t), 1);
  drawLines(t);
  for (const o of OVER) if (t >= o.a && t < o.b) { g.save(); ROOT(); o.draw(t); g.restore(); }
}

const FONTS = ['300 40px "Noto Serif SC"', '500 40px "Noto Serif SC"', '700 40px "Noto Serif SC"', '300 30px "Noto Sans SC"', '400 30px "Noto Sans SC"',
  '400 30px "Cormorant Garamond"', '600 30px "Cormorant Garamond"', 'italic 400 30px "Cormorant Garamond"', '300 20px "JetBrains Mono"', '500 20px "JetBrains Mono"',
  '400 20px "Noto Serif"', 'italic 400 20px "Noto Serif"', '400 40px "Ma Shan Zheng"'];
async function loadFonts() {
  const sample = ALLTEXT + GLYPHS.join('') + TAPE.join('');
  const all = Promise.all(FONTS.map(f => document.fonts.load(f, sample).catch(() => null)));
  await Promise.race([all, new Promise(r => setTimeout(r, 12000))]);
  try { await document.fonts.ready; } catch (e) { }
}

async function renderAudio(onp) {
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const ac = new OAC(2, Math.ceil(SR * DURATION), SR);
  buildScore(ac);
  try { for (let s = 6; s < DURATION; s += 6) ac.suspend(s).then(() => { onp && onp(s / DURATION); ac.resume(); }); } catch (e) { }
  const buf = await ac.startRendering();
  let pk = 0; for (let c = 0; c < buf.numberOfChannels; c++) { const d = buf.getChannelData(c); for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > pk) pk = v; } }
  const k = pk > 0 ? .89 / pk : 1; for (let c = 0; c < buf.numberOfChannels; c++) { const d = buf.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] *= k; }
  // fade the last half-second to true silence
  for (let c = 0; c < buf.numberOfChannels; c++) { const d = buf.getChannelData(c), n = SR / 2; for (let i = 0; i < n; i++) d[d.length - 1 - i] *= i / n; }
  return buf;
}

let AUDIO = null, actx = null, src = null, playing = false, t0c = 0, offset = 0, hideT = 0;
const $ = id => document.getElementById(id);
const fmt = s => { s = Math.max(0, Math.floor(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
function now() { return playing ? Math.max(offset, offset + (actx.currentTime - t0c)) : offset; }
function start() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  actx.resume && actx.resume();
  src = actx.createBufferSource(); src.buffer = AUDIO; src.connect(actx.destination);
  t0c = actx.currentTime + .06; src.start(t0c, offset); playing = true; setPP(); tick();
}
function stop() { if (!playing) return; offset = now(); try { src.stop(); } catch (e) { } src.disconnect(); playing = false; setPP(); showBar(true); }
function seekTo(x) { const was = playing; if (playing) stop(); offset = clamp(x, 0, DURATION - .05); if (was) start(); else renderFrame(offset); updUI(offset); }
function setPP() { $('ppi').setAttribute('d', playing ? 'M6 4h4v16H6zM14 4h4v16h-4z' : 'M6 4l14 8-14 8z'); $('pp').setAttribute('aria-label', playing ? '暂停' : '播放'); }
function updUI(t) { $('seek').value = Math.round(t / DURATION * 1000); $('time').textContent = fmt(t) + ' / ' + fmt(DURATION); }
function tick() {
  if (!playing) return;
  const t = now();
  if (t >= DURATION) { stop(); offset = 0; renderFrame(DURATION - .01); return; }
  renderFrame(t); updUI(t);
  requestAnimationFrame(tick);
}
function showBar(stay) { const b = $('bar'); b.classList.add('show'); clearTimeout(hideT); if (!stay && playing) hideT = setTimeout(() => b.classList.remove('show'), 2400); }
function fullscreen() { const st = $('stage'); try { if (document.fullscreenElement) document.exitFullscreen(); else st.requestFullscreen && st.requestFullscreen().catch(() => { }); } catch (e) { } }

async function boot() {
  await loadFonts();
  buildAtlas(); tintAtlas('warm', '#efe2c8'); tintAtlas('gold', '#e3bb6a'); tintAtlas('red', '#d4493a'); tintAtlas('green', '#3dae72'); tintAtlas('white', '#ffffff');
  buildPost(); if (window.prepScenes) prepScenes();
  renderFrame(0);
  if (RENDER) { window.__ready = true; return; }
  window.addEventListener('resize', () => { if (!playing) renderFrame(offset); });
  const pr = $('prog');
  // the score was synthesised offline by buildScore() and shipped beside the page; if it cannot be fetched, synthesise it here
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    pr.textContent = '正在载入配乐';
    const r = await fetch('score.mp4'); if (!r.ok) throw new Error('no score');
    const ab = await r.arrayBuffer();
    AUDIO = await new Promise((ok, no) => { const p = actx.decodeAudioData(ab, ok, no); if (p && p.then) p.then(ok, no); });
    pr.textContent = '配乐就绪 · ' + fmt(DURATION);
  } catch (e) {
    try {
      AUDIO = await renderAudio(p => pr.textContent = '正在合成配乐  ' + Math.round(p * 100) + '%');
      pr.textContent = '配乐就绪 · ' + fmt(DURATION);
    } catch (e2) { pr.textContent = '配乐不可用'; }
  }
  const play = $('play'); play.disabled = false;
  play.addEventListener('click', () => {
    if (!AUDIO) return; actx.resume && actx.resume(); $('gate').classList.add('gone'); fullscreen();
    try { navigator.wakeLock && navigator.wakeLock.request('screen').catch(() => { }); } catch (e) { }
    start(); showBar();
  });
  $('pp').addEventListener('click', () => playing ? stop() : (AUDIO && start()));
  $('seek').addEventListener('input', e => seekTo(e.target.value / 1000 * DURATION));
  $('fs').addEventListener('click', fullscreen);
  $('frame').addEventListener('mousemove', () => showBar()); $('frame').addEventListener('touchstart', () => showBar(), { passive: true });
  window.addEventListener('keydown', e => {
    if ($('gate').classList.contains('gone') === false) return;
    if (e.code === 'Space' || e.key === 'k') { e.preventDefault(); playing ? stop() : start(); }
    else if (e.key === 'f') fullscreen();
    else if (e.key === 'ArrowRight') seekTo(now() + 5);
    else if (e.key === 'ArrowLeft') seekTo(now() - 5);
  });
}
// hooks for the offline renderer
window.__frame = t => renderFrame(t);
window.__audio = async () => { const b = await renderAudio(); const L = b.getChannelData(0), Rr = b.getChannelData(1), n = L.length, pcm = new Int16Array(n * 2); for (let i = 0; i < n; i++) { pcm[2 * i] = Math.max(-1, Math.min(1, L[i])) * 32767; pcm[2 * i + 1] = Math.max(-1, Math.min(1, Rr[i])) * 32767; } window.__pcm = new Uint8Array(pcm.buffer); return window.__pcm.length; };
window.__pcmChunk = (i, size) => { const a = window.__pcm.subarray(i, i + size); let s = ''; for (let k = 0; k < a.length; k += 8192) s += String.fromCharCode.apply(null, a.subarray(k, k + 8192)); return btoa(s); };
boot();
