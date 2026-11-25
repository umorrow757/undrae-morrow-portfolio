// Dashboard kit: small, generic, data-only components in S1's look (site tokens + .kpi / .cc-track / .tog).
// Each export is (host, data) => cleanup. cleanup() removes the component, its listeners and its timer.
// No storage, no network, no innerHTML. Data never animates: values, bars and items swap in one cut.

const SVG = 'http://www.w3.org/2000/svg';

function h(tag, props, ...kids) {
  const e = tag.startsWith('svg:') ? document.createElementNS(SVG, tag.slice(4)) : document.createElement(tag);
  for (const k in props || {}) {
    const v = props[k];
    if (v == null || v === false) continue;
    if (k === 'text') e.textContent = v;
    else e.setAttribute(k, v);
  }
  kids.flat(Infinity).forEach((c) => c != null && c !== false && e.append(c));
  return e;
}

// Formats a number with the data's own prefix/suffix, e.g. { prefix: '$' } -> "$41,600".
export const num = (n, d = {}) => `${d.prefix || ''}${Number(n).toLocaleString('en-US')}${d.suffix || ''}`;

function box(cls, title, ...kids) {
  return h('section', { class: `dk-box ${cls}` }, title && h('h5', { text: title }), kids);
}

function done(host, el, offs = []) {
  host.append(el);
  return () => { offs.forEach((f) => f()); el.remove(); };
}

// KPI strip: items [[label, value, note?]]. 4-up, 2-up under 600 px.
export function kpiStrip(host, d) {
  return done(host, h('div', { class: 'dk-kpis' }, d.items.map(([label, value, note]) =>
    h('div', { class: 'kpi' }, h('small', { text: label }), h('b', { text: String(value) }), note && h('span', { class: 'dk-dim', text: note })))));
}

// Status board: rows [[name, status, detail?]]; tones { status: 'ok' | 'warn' | 'stop' | 'info' }.
// The status is always a word; the tone only colors the pill's edge.
export function statusBoard(host, d) {
  return done(host, box('dk-board', d.title, h('ul', null, d.rows.map(([name, status, detail]) =>
    h('li', null, h('b', { text: name }), h('span', { class: `dk-pill ${(d.tones || {})[status] || 'info'}`, text: status }),
      detail && h('span', { class: 'dk-dim', text: detail }))))));
}

// Progress bars: rows [[label, value, max]], plus optional prefix/suffix. Static bars; the numbers are in text.
export function progressBars(host, d) {
  return done(host, box('dk-bars', d.title, h('ul', null, d.rows.map(([label, v, max]) => {
    const over = v > max, w = Math.min(100, Math.round(v / max * 1000) / 10);
    return h('li', null,
      h('p', null, h('b', { text: label }), h('span', { text: `${num(v, d)} of ${num(max, d)}${over ? `, over by ${num(v - max, d)}` : ''}` })),
      h('span', { class: 'cc-track', 'aria-hidden': 'true' }, h('i', { class: `cc-bar${over ? ' dk-over' : ''}`, style: `width:${w}%` })));
  }))));
}

// Ticker: items [string]. One item every ms (default 6000), swapped instantly, never scrolled.
// Pause/Play button; auto-paused while hovered or focused and under reduced motion. Full static list below.
export function ticker(host, d) {
  const items = d.items, ms = d.ms || 6000;
  const rm = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  let i = 0, run = !rm.matches, hold = false;
  const slots = items.map((t) => h('p', { class: 'dk-tk-i', text: t }));
  const count = h('span', { class: 'dk-dim' });
  const btn = h('button', { type: 'button', class: 'tog' });
  const stage = h('div', { class: 'dk-tk-stage' }, slots);
  const show = () => {
    slots.forEach((s, k) => { s.hidden = false; s.style.visibility = k === i ? 'visible' : 'hidden'; s.setAttribute('aria-hidden', String(k !== i)); });
    count.textContent = `${i + 1} of ${items.length}${run ? '' : ', paused'}`;
    btn.textContent = run ? 'Pause' : 'Play';
    btn.setAttribute('aria-pressed', String(!run));
    btn.setAttribute('aria-label', run ? 'Pause the ticker' : 'Play the ticker');
  };
  const el = box('dk-tk', d.title, h('div', { class: 'dk-tk-bar' }, btn, count), stage,
    h('details', null, h('summary', { text: `All updates (${items.length})` }), h('ul', null, items.map((t) => h('li', { text: t })))));
  const timer = setInterval(() => { if (run && !hold) { i = (i + 1) % items.length; show(); } }, ms);
  const onBtn = () => { run = !run; show(); };
  const on = () => { hold = true; }, off = () => { hold = el.matches(':hover') || el.contains(document.activeElement); };
  const onRm = () => { if (rm.matches) { run = false; show(); } };
  btn.addEventListener('click', onBtn);
  el.addEventListener('mouseenter', on); el.addEventListener('mouseleave', off);
  el.addEventListener('focusin', on); el.addEventListener('focusout', () => setTimeout(off));
  if (rm.addEventListener) rm.addEventListener('change', onRm);
  show();
  return done(host, el, [() => clearInterval(timer), () => { if (rm.removeEventListener) rm.removeEventListener('change', onRm); }]);
}

// Graph: points [[label, value]]; kind 'bar' (default) or 'line'; optional prefix/suffix.
// Inline SVG. Every point is keyboard-focusable. The readout strip ABOVE the graph shows the focused or
// pointed-at value; no tooltip. Values are also printed on the chart.
export function graph(host, d) {
  const P = d.points, W = 320, H = 170, L = 8, R = 8, T = 22, B = 26, line = d.kind === 'line';
  const max = Math.max(...P.map((p) => p[1])) * 1.12 || 1, step = (W - L - R) / P.length;
  const x = (k) => L + step * k + step / 2, y = (v) => T + (H - T - B) * (1 - v / max);
  const idle = d.idle || 'Focus or point at a value.';
  const read = h('p', { class: 'dk-read', text: idle }); // not live: the focused point already announces its own label
  const say = (p) => { read.textContent = `${p[0]}: ${num(p[1], d)}`; };
  const svg = h('svg:svg', { viewBox: `0 0 ${W} ${H}`, class: 'dk-svg', role: 'group', 'aria-label': `${d.title}. ${P.length} values.` },
    h('svg:line', { x1: L, x2: W - R, y1: H - B, y2: H - B, class: 'dk-axis' }),
    line && h('svg:polyline', { class: 'dk-line', points: P.map((p, k) => `${x(k)},${y(p[1])}`).join(' ') }),
    P.map((p, k) => {
      const g = h('svg:g', { class: 'dk-pt', tabindex: 0, role: 'img', 'aria-label': `${p[0]}: ${num(p[1], d)}` },
        line ? h('svg:circle', { cx: x(k), cy: y(p[1]), r: 6 })
          : h('svg:rect', { x: x(k) - step * 0.3, y: y(p[1]), width: step * 0.6, height: H - B - y(p[1]), rx: 3 }),
        h('svg:text', { x: x(k), y: y(p[1]) - 8, class: 'dk-val', text: num(p[1], d) }),
        h('svg:text', { x: x(k), y: H - 8, class: 'dk-lab', text: p[0] }));
      g.addEventListener('focus', () => say(p));
      g.addEventListener('pointerenter', () => say(p));
      g.addEventListener('blur', () => { read.textContent = idle; });
      g.addEventListener('pointerleave', () => { if (document.activeElement !== g) read.textContent = idle; });
      return g;
    }));
  return done(host, box('dk-graph', d.title, read, svg));
}
