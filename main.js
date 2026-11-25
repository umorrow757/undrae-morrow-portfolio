// Undrae Morrow portfolio: site motion, showcase views, lazy demos.
// No network calls except the three lazy showcase modules. No storage, no cookies.

const root = document.documentElement;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const canVT = typeof document.startViewTransition === 'function';
const EASE = 'cubic-bezier(.2,.7,.2,1)';

const section = $('#showcase');
const frame = $('#sc-frame');
const grid = $('#sc-grid');
const bar = $('#sc-bar');
const statusEl = $('#sc-status');
const items = $$('.sc-item');
const ids = items.map((i) => i.dataset.id);
const movers = [$('#rest'), $('#foot')].filter(Boolean);

/* ---------- Transition engine ---------- */
let vt = null;        // active View Transition
let live = [];        // active fallback animations
let waiting = 0;      // swaps queued behind the running one
let chain = Promise.resolve();

// One fallback animation. If another swap is waiting, it runs in 1 ms so input is never blocked.
function anim(el, frames, ms, fill) {
  const a = el.animate(frames, { duration: waiting > 0 ? 1 : ms, easing: EASE, fill: fill || 'none' });
  live.push(a);
  a.done = a.finished.catch(() => {}).then(() => { live = live.filter((x) => x !== a); });
  return a;
}

const docTop = (el) => el.getBoundingClientRect().top + window.scrollY;

// Where the camera zooms from or to, as a percent of the showcase frame.
function originOf(el) {
  if (!el) return ['50%', '50%'];
  const f = frame.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  if (!f.width || !f.height) return ['50%', '50%'];
  const pct = (v) => Math.min(100, Math.max(0, v * 100)).toFixed(1) + '%';
  return [pct((r.left + r.width / 2 - f.left) / f.width), pct((r.top + r.height / 2 - f.top) / f.height)];
}

// Fallback for the showcase zoom when View Transitions are missing.
// Order keeps the no-overlap rule: old view leaves, neighbors move (FLIP), new view arrives.
async function flipSwap(update, o) {
  const zoomIn = o.kind === 'zoomin';
  frame.style.transformOrigin = o.origin.join(' ');
  const top0 = movers.length ? docTop(movers[0]) : 0;
  const out = anim(frame, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: zoomIn ? 'scale(1.35)' : 'scale(.8)' }], 170, 'forwards');
  await out.done;
  update();
  const d = movers.length ? docTop(movers[0]) - top0 : 0;
  if (d) {
    const slides = movers.map((m) => anim(m, [{ transform: `translateY(${-d}px)` }, { transform: 'none' }], 130));
    if (d > 0) await Promise.all(slides.map((s) => s.done)); // frame grew: neighbors clear the space first
  }
  out.cancel();
  await anim(frame, [{ opacity: 0, transform: zoomIn ? 'scale(.92)' : 'scale(1.2)' }, { opacity: 1, transform: 'none' }], 150).done;
  frame.style.transformOrigin = '';
}

async function run(update, o) {
  waiting--;
  if (reduce.matches) { update(); return; }
  const cls = 'vt-' + o.kind;
  root.classList.add(cls);
  root.style.setProperty('--zx', o.origin[0]);
  root.style.setProperty('--zy', o.origin[1]);
  try {
    if (canVT) {
      vt = document.startViewTransition(update);
      await vt.finished.catch(() => {});
      vt = null;
    } else if (o.kind === 'jump') {
      const m = $('#main');
      const out = anim(m, [{ opacity: 1 }, { opacity: 0 }], 140, 'forwards');
      await out.done;
      update();
      out.cancel();
      await anim(m, [{ opacity: 0 }, { opacity: 1 }], 200).done;
    } else {
      await flipSwap(update, o);
    }
  } finally {
    root.classList.remove(cls);
  }
}

// Public entry: animate a DOM change. Interruptible: a new swap fast-forwards the running one.
function swap(update, opts) {
  const o = { kind: (opts && opts.kind) || 'jump', origin: (opts && opts.origin) || ['50%', '50%'] };
  waiting++;
  live.forEach((a) => { try { a.finish(); } catch (_) {} });
  if (vt) { try { vt.skipTransition(); } catch (_) {} }
  chain = chain.then(() => run(update, o)).catch(() => {});
  return chain;
}

/* ---------- Showcase ---------- */
let current = null;
let lastTile = null;
const mods = {};
const mounted = {};
const DEMOS = ['s1', 's8', 's3', 's5', 's7', 's9', 's10'];

function loadDemo(id) {
  return mods[id] || (mods[id] = import(`./showcase/${id}.js`));
}

function mountDemo(id) {
  const host = $(`[data-demo="${id}"]`);
  if (!host || mounted[id]) return;
  mounted[id] = true;
  loadDemo(id).then((m) => {
    if (current !== id) { mounted[id] = false; return; }
    m.mount(host);
  }).catch(() => {
    mounted[id] = false;
    mods[id] = null;
    host.textContent = '';
    const p = document.createElement('p');
    p.className = 'demo-wait';
    p.textContent = 'The working example could not load. The video walkthrough below still works.';
    host.append(p);
  });
}

function unmountDemo(id) {
  if (mounted[id] && mods[id]) mods[id].then((m) => m.unmount && m.unmount()).catch(() => {});
  mounted[id] = false;
}

// Pure DOM state change. Called inside a transition.
function setView(id) {
  if (current && current !== id) {
    unmountDemo(current);
    $$('video', frame).forEach((v) => { try { v.pause(); } catch (_) {} });
  }
  current = id;
  grid.classList.toggle('closed', !!id);
  bar.hidden = !id;
  items.forEach((it) => it.classList.toggle('open', it.dataset.id === id));
  if (id) {
    const n = ids.indexOf(id) + 1;
    statusEl.textContent = `Showing ${n} of ${ids.length}: ${$('#t-' + id).textContent}`;
    mountDemo(id);
    if (frame.getBoundingClientRect().top < 0) frame.scrollIntoView();
  } else {
    statusEl.textContent = '';
  }
}

function openItem(id, fromEl) {
  if (!ids.includes(id) || id === current) return;
  const tile = $(`.tile[data-open="${id}"]`);
  if (tile) lastTile = tile;
  const origin = originOf(fromEl && frame.contains(fromEl) ? fromEl : null);
  swap(() => setView(id), { kind: 'zoomin', origin }).then(() => {
    const h = $('#t-' + id);
    if (current === id && h) h.focus({ preventScroll: true });
  });
}

function closeItem() {
  if (!current) return;
  swap(() => setView(null), { kind: 'zoomout' }).then(() => {
    if (!current && lastTile) lastTile.focus({ preventScroll: true });
  });
}

function stepItem(dir) {
  if (!current) return;
  const i = (ids.indexOf(current) + dir + ids.length) % ids.length;
  openItem(ids[i], null);
}

function initShowcase() {
  if (!frame) return;
  grid.addEventListener('click', (e) => {
    const t = e.target.closest('.tile');
    if (t) openItem(t.dataset.open, t);
  });
  $('#sc-back').addEventListener('click', closeItem);
  $('#sc-prev').addEventListener('click', () => stepItem(-1));
  $('#sc-next').addEventListener('click', () => stepItem(1));
  frame.addEventListener('keydown', (e) => { if (e.key === 'Escape' && current) closeItem(); });
  // Warm the three working examples when the showcase is near the viewport.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      if (es.some((x) => x.isIntersecting)) { DEMOS.forEach((d) => loadDemo(d).catch(() => { mods[d] = null; })); io.disconnect(); }
    }, { rootMargin: '600px 0px' });
    io.observe(section);
  }
}

/* ---------- Section jumps ---------- */
function initJumps() {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const open = a.dataset.open;
    swap(() => {
      if (open && ids.includes(open)) {
        lastTile = $(`.tile[data-open="${open}"]`) || lastTile;
        setView(open);
      }
      target.scrollIntoView();
    }, { kind: 'jump' }).then(() => {
      try { history.replaceState(null, '', '#' + id); } catch (_) {}
      const focusEl = open && current === open ? $('#t-' + open) : target;
      if (focusEl) focusEl.focus({ preventScroll: true });
    });
  });
}

/* ---------- Entry reveals: play once ---------- */
function initReveals() {
  const els = $$('.reveal');
  if (!('IntersectionObserver' in window) || reduce.matches) { els.forEach((el) => el.classList.add('in')); return; }
  const io = new IntersectionObserver((es) => {
    es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach((el) => io.observe(el));
}

/* ---------- Copy email: inline feedback, no toast ---------- */
function initCopy() {
  const btn = $('#copy-email');
  const out = $('#copy-status');
  if (!btn || !out) return;
  const email = 'umorrow@twomorrowshr.com';
  btn.addEventListener('click', () => {
    const ok = () => { out.textContent = 'Email copied.'; };
    const no = () => { out.textContent = 'Copy did not work. Select the address to copy it.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(email).then(ok, no);
    else no();
  });
}

initShowcase();
initJumps();
initReveals();
initCopy();
