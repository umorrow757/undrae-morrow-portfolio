// S3: Little Legends racing slice. One 30 second race, three lanes.
// Generic players only. Nothing is saved, sent or recorded.
// Keyboard: Left and Right arrows, or A and D. Touch: the two buttons, or tap a side of the track.

const W = 360, H = 480, LANES = 3, DURATION = 30, PLAYER_Y = H - 78;
const RIVALS = [['Player 2', 520], ['Player 3', 440], ['Player 4', 360]];
const C = { road: '#0A0F1E', line: 'rgba(255,255,255,.2)', edge: '#6366F1', car: '#6366F1', glass: '#F1F5F9', wall: '#A8B3CF', wallDark: '#0F172A', boost: '#818CF8' };

let host = null, cv = null, ctx = null, raf = 0, last = 0, s = null, ui = {};
let onVis = null;

const laneX = (i) => (W * (i + 0.5)) / LANES;

function fresh() {
  return { run: false, over: false, paused: false, t: DURATION, lane: 1, x: laneX(1), speed: 10, dist: 0, scroll: 0, gap: 0, objs: [], hits: 0, boosts: 0, flash: 0, shownT: -1, shownD: -1 };
}

function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  for (const k in props || {}) {
    if (k === 'text') e.textContent = props[k];
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), props[k]);
    else e.setAttribute(k, props[k]);
  }
  kids.forEach((c) => c && e.append(c));
  return e;
}

function say(text) { if (ui.status) ui.status.textContent = text; }

function rr(x, y, w, hh, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + hh, r);
  ctx.arcTo(x + w, y + hh, x, y + hh, r);
  ctx.arcTo(x, y + hh, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function draw() {
  if (!ctx) return;
  ctx.fillStyle = C.road;
  ctx.fillRect(0, 0, W, H);
  // lane dashes scroll with the road
  ctx.fillStyle = C.line;
  for (let l = 1; l < LANES; l++) {
    const x = (W * l) / LANES - 2;
    for (let y = (s.scroll % 60) - 60; y < H; y += 60) ctx.fillRect(x, y, 4, 30);
  }
  ctx.fillStyle = C.edge;
  ctx.fillRect(0, 0, 4, H);
  ctx.fillRect(W - 4, 0, 4, H);
  // barriers are squares, boosts are rings: shape tells them apart, not color
  s.objs.forEach((o) => {
    if (o.done) return;
    const x = laneX(o.lane);
    if (o.type === 'wall') {
      ctx.fillStyle = C.wall;
      rr(x - 34, o.y - 16, 68, 32, 6); ctx.fill();
      ctx.fillStyle = C.wallDark;
      for (let i = -24; i <= 12; i += 18) ctx.fillRect(x + i, o.y - 16, 8, 32);
    } else {
      ctx.strokeStyle = C.boost; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(x, o.y, 15, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = C.boost;
      ctx.beginPath(); ctx.arc(x, o.y, 5, 0, Math.PI * 2); ctx.fill();
    }
  });
  // player car
  ctx.fillStyle = C.car;
  rr(s.x - 22, PLAYER_Y - 32, 44, 64, 10); ctx.fill();
  ctx.fillStyle = C.glass;
  rr(s.x - 15, PLAYER_Y - 20, 30, 16, 4); ctx.fill();
  if (s.flash > 0) {
    ctx.strokeStyle = C.glass; ctx.lineWidth = 4;
    rr(s.x - 26, PLAYER_Y - 36, 52, 72, 12); ctx.stroke();
  }
}

function hud() {
  const t = Math.ceil(Math.max(0, s.t));
  const d = Math.floor(s.dist);
  if (t !== s.shownT) { ui.time.textContent = `Time ${t}s`; s.shownT = t; }
  if (d !== s.shownD) { ui.dist.textContent = `${d} m`; s.shownD = d; }
  ui.boosts.textContent = `Boosts ${s.boosts}`;
}

function spawn() {
  const lane = Math.floor(Math.random() * LANES);
  s.objs.push({ type: 'wall', lane, y: -40, done: false });
  if (Math.random() < 0.45) {
    const other = (lane + 1 + Math.floor(Math.random() * (LANES - 1))) % LANES;
    s.objs.push({ type: 'boost', lane: other, y: -40, done: false });
  }
}

function finish() {
  s.run = false; s.over = true;
  const d = Math.floor(s.dist);
  const place = 1 + RIVALS.filter((r) => r[1] > d).length;
  const ord = ['1st', '2nd', '3rd', '4th'][place - 1];
  const board = RIVALS.map((r) => `${r[0]}: ${r[1]} m`).join(', ');
  say(`Finish. You drove ${d} m and placed ${ord} of 4. ${board}.`);
  ui.go.textContent = 'Race again';
}

function step(dt) {
  s.t -= dt;
  if (s.t <= 0) { s.t = 0; hud(); finish(); return; }
  const top = 10 + (DURATION - s.t) * 0.35;
  s.speed = Math.min(top, s.speed + 6 * dt);
  const px = s.speed * 22 * dt;
  s.scroll += px; s.gap += px; s.dist += s.speed * dt;
  if (s.gap >= 150) { s.gap = 0; spawn(); }
  s.x += (laneX(s.lane) - s.x) * Math.min(1, dt * 16);
  if (s.flash > 0) s.flash -= dt;
  s.objs.forEach((o) => {
    o.y += px;
    if (!o.done && o.lane === s.lane && Math.abs(o.y - PLAYER_Y) < 44) {
      o.done = true;
      if (o.type === 'wall') { s.hits++; s.speed = 6; s.flash = 0.35; say('Bump. You slowed down.'); }
      else { s.boosts++; s.dist += 15; }
    }
  });
  s.objs = s.objs.filter((o) => o.y < H + 50);
  hud();
}

function loop(ts) {
  if (!s || !s.run) return;
  const dt = Math.min(0.05, (ts - last) / 1000 || 0);
  last = ts;
  step(dt);
  draw();
  if (s.run) raf = requestAnimationFrame(loop);
}

function start() {
  if (s.run) return;
  if (s.over || !s.paused) { s = fresh(); }
  s.run = true; s.paused = false;
  ui.go.textContent = 'Racing';
  say('Go. Dodge the barriers and pick up the rings.');
  last = performance.now();
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(loop);
}

function pause() {
  if (!s || !s.run) return;
  s.run = false; s.paused = true;
  cancelAnimationFrame(raf);
  ui.go.textContent = 'Resume';
  say('Paused. Press Resume to keep racing.');
}

function steer(dir) {
  if (!s) return;
  s.lane = Math.max(0, Math.min(LANES - 1, s.lane + dir));
  if (!s.run) { s.x = laneX(s.lane); draw(); }
}

function onKey(e) {
  const k = e.key;
  if (k === 'ArrowLeft' || k === 'a' || k === 'A') { steer(-1); e.preventDefault(); }
  else if (k === 'ArrowRight' || k === 'd' || k === 'D') { steer(1); e.preventDefault(); }
}

export function mount(el) {
  unmount();
  host = el;
  host.textContent = '';
  s = fresh();
  cv = h('canvas', { role: 'img', 'aria-label': 'Top-down race track with three lanes. Your car is at the bottom. Barriers and boost rings come down the track.' });
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = W * dpr; cv.height = H * dpr;
  ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cv.addEventListener('pointerdown', (e) => {
    const r = cv.getBoundingClientRect();
    steer(e.clientX - r.left < r.width / 2 ? -1 : 1);
  });

  ui.time = h('span', { text: `Time ${DURATION}s` });
  ui.dist = h('span', { text: '0 m' });
  ui.boosts = h('span', { text: 'Boosts 0' });
  ui.go = h('button', { type: 'button', class: 'ghost go', text: 'Start race', onclick: start });
  ui.status = h('p', { class: 'race-status', 'aria-live': 'polite', text: 'You are Player 1. Press Start race.' });

  const wrap = h('div', { class: 'race', onkeydown: onKey },
    h('p', { class: 'mock', text: 'SAMPLE / MOCK DATA' }),
    h('div', { class: 'race-hud' }, ui.time, ui.dist, ui.boosts),
    cv,
    h('div', { class: 'race-pad' },
      h('button', { type: 'button', class: 'ghost', 'aria-label': 'Steer left', text: '← Left', onclick: () => steer(-1) }),
      ui.go,
      h('button', { type: 'button', class: 'ghost', 'aria-label': 'Steer right', text: 'Right →', onclick: () => steer(1) })),
    ui.status,
    h('p', { class: 'race-help', text: 'Keys: Left and Right arrows, or A and D, while a game button has focus. Touch: use the buttons or tap a side of the track.' }));
  host.append(wrap);
  onVis = () => { if (document.hidden) pause(); };
  document.addEventListener('visibilitychange', onVis);
  draw();
}

export function unmount() {
  cancelAnimationFrame(raf);
  if (onVis) document.removeEventListener('visibilitychange', onVis);
  onVis = null; s = null; ctx = null; cv = null; ui = {};
}
