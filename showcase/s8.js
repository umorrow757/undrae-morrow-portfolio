// S8: Footprint map sample. A long list of locations turned into one map you can explore.
// Same pretend world as S1 (dragon daycare). Every region, site name and number is invented.
// No storage, no network, no links. State lives in memory.
// Data rule: nothing animates. Every change lands in one cut.

const CO = 'Smolder & Snooze Dragon Daycare';
// plural, singular, color. This order is the wedge order, the bar order and the donut order.
const TYPES = [['Lairs', 'Lair', '#22D3EE'], ['Nap caves', 'Nap Cave', '#FBBF24'], ['Hoard vaults', 'Hoard Vault', '#F472B6']];
const MEAS = [['Sites', 'site', 'sites'], ['Dragon beds', 'dragon bed', 'dragon beds']];
const RAMP = ['#E0E7FF', '#C7D2FE', '#A5B4FC', '#818CF8', '#7073F3']; // one hue, light to dark, low to high
const DARK = '#070B14';
const ADJ = ['Toasty', 'Sooty', 'Drowsy', 'Snug', 'Glowing', 'Mossy', 'Wobbly', 'Sleepy', 'Smoky', 'Cozy', 'Singed', 'Fuzzy', 'Yawning'];
const NOUN = ['Mitten', 'Kettle', 'Pebble', 'Thimble', 'Noodle', 'Button', 'Pickle', 'Marble', 'Biscuit', 'Teacup', 'Sock'];

// Region name, hex column, hex row, then dragon beds per site for lairs, nap caves, hoard vaults.
// One array entry is one site. A trailing 1 marks a hub: label outside the tile, with a leader line.
const RAW = [
  ['Cinder Fen', 0, 0, [18, 12, 9], [6, 7], []],
  ['Mount Singe', 1, 0, [24, 19, 15, 12, 10, 8, 8, 6], [], [30, 22, 14, 9], 1],
  ['Ember Hollow', 0, 1, [14, 9], [8, 6, 6, 5, 4], []],
  ['Soot Lake', 1, 1, [], [7, 5, 5, 4], [26, 18, 11]],
  ['Snore Ridge', 2, 1, [], [9, 8, 7, 6, 5, 5, 4, 3], []],
  ['Yawn Valley', 0, 2, [], [7, 6, 5], [12]],
  ['Wick Marsh', 1, 2, [16, 11], [], [20, 13, 8]],
  ['Blanket Bluff', 2, 2, [10], [6, 5, 4, 4], []],
  ['Flicker Cove', 0, 3, [20, 13, 11, 7], [5, 4], []],
  ['Drowsy Dunes', 1, 3, [], [8, 7, 5, 4, 3], [15, 10]],
  ['Pillow Peaks', 2, 3, [], [5, 3], []],
  ['Dozing Downs', 0, 4, [], [], [17]],
  ['Smolder Steppe', 1, 4, [22, 17, 14, 11, 9, 7], [], [28, 21, 16, 12, 10], 1],
];

// Pointy-top hex grid: cell 76.2 wide, rows 66 apart, odd rows shifted half a cell. Tiles drawn at radius 42.
const HEX_R = 42;
const MK_K = 5.1;  // marker radius = MK_K * sqrt(sites), so marker area is proportional to sites
const MK_MIN = 6;  // smallest marker radius
let seq = 0;
const REG = RAW.map(([name, c, r, ...rest]) => ({
  name, out: rest[3], beds: rest.slice(0, 3),
  x: Math.round((40 + c * 76.2 + (r % 2) * 38.1) * 10) / 10, y: 48 + r * 66,
  sites: rest.slice(0, 3).flatMap((a, t) => a.map((b) => ({ t, b, name: `${ADJ[seq % 13]} ${NOUN[seq++ % 11]} ${TYPES[t][1]}` }))),
}));
const DIR = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

let S = null;  // m measure, f type filter (-1 all), sel selected region, hot hovered or focused region, at roving tab stop
let ui = null;
let D = null;  // values from the last draw

function make(svg, tag, props, kids) {
  const e = svg ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
  for (const k in props || {}) {
    const v = props[k];
    if (v == null || v === false) continue;
    if (k === 'text') e.textContent = v;
    else e.setAttribute(k, v);
  }
  kids.flat(Infinity).forEach((c) => c != null && c !== false && e.append(c));
  return e;
}
const h = (tag, props, ...kids) => make(0, tag, props, kids);
const s = (tag, props, ...kids) => make(1, tag, props, kids);

const f1 = (v) => Math.round(v * 10) / 10;
const num = (v) => v.toLocaleString('en-US');
const sum = (a) => a.reduce((x, y) => x + y, 0);
const pct = (a, b) => (b ? (a / b * 100).toFixed(1) : '0.0') + '%';
const unit = (v, m = S.m) => `${num(v)} ${MEAS[m][v === 1 ? 1 : 2]}`;
const on = (t) => S.f < 0 || S.f === t;
const fname = () => (S.f < 0 ? 'All types' : TYPES[S.f][0]);
const val = (r, t, m) => (m ? sum(r.beds[t]) : r.beds[t].length);
const tot = (t, m, rs) => sum(rs.map((r) => val(r, t, m)));
const split = (p) => p.map((v, t) => (v ? `${TYPES[t][0]} ${num(v)}` : '')).filter(Boolean).join(', ');
const sw = (t) => h('i', { class: 'fp-sw', style: `--c:${TYPES[t][2]}` });
const say = (m) => { ui.live.textContent = m; };

// R1 + R4. Marker area = sites; wedge angle = share of sites, so wedge area = share of marker area.
function marker(o, tab) {
  const { r, i, c, n, rad } = o;
  const cx = r.x, cy = r.y + (r.out ? 0 : 16);
  const at = (a) => `${f1(cx + rad * Math.cos(a))} ${f1(cy + rad * Math.sin(a))}`;
  let a0 = -Math.PI / 2;
  const wedges = c.map((v, t) => {
    if (!v) return null;
    if (v === n) return s('circle', { cx, cy, r: f1(rad), fill: TYPES[t][2] });
    const a1 = a0 + (v / n) * 2 * Math.PI;
    const d = `M${cx} ${cy}L${at(a0)}A${f1(rad)} ${f1(rad)} 0 ${v / n > 0.5 ? 1 : 0} 1 ${at(a1)}Z`;
    a0 = a1;
    return s('path', { d, fill: TYPES[t][2] });
  });
  return s('g', { class: 'fp-mk', role: 'button', tabindex: i === tab ? 0 : -1, 'data-k': 'm' + i, 'data-i': i,
    'aria-pressed': String(S.sel === i), 'aria-label': `${r.name} marker: ${unit(n, 0)}. ${split(c)}.` },
    s('circle', { cx, cy, r: f1(rad + 2.5), fill: DARK }), wedges,
    s('circle', { class: 'fp-ring', cx, cy, r: f1(rad + 4) }),
    s('circle', { cx, cy, r: 22, fill: 'transparent' }));
}

// R: the in-flow strip above the map. Hover or focus wins, then the selection, then all regions.
function read() {
  const i = S.hot >= 0 ? S.hot : S.sel;
  ui.read.replaceChildren(
    h('b', { text: i < 0 ? 'All regions' : REG[i].name }),
    h('span', { text: unit(i < 0 ? D.T : D.V[i]) }),
    h('span', { text: `Filter: ${fname()}` }));
}

// D: detail for the selected region, or the totals when nothing is selected.
function detail() {
  const i = S.sel, r = REG[i], rs = i < 0 ? REG : [r], v = i < 0 ? D.T : D.V[i];
  const list = i < 0 ? [] : r.sites.filter((x) => on(x.t));
  ui.det.replaceChildren(
    h('h4', { text: i < 0 ? 'All regions' : r.name }),
    h('p', { class: 'fp-big', text: unit(v) }),
    h('p', { class: 'fp-dim', text: i < 0 ? `${REG.length} regions. Filter: ${fname()}.`
      : `${pct(v, D.T)} of all ${unit(D.T)}. Rank ${D.rank[i]} of ${REG.length}. Filter: ${fname()}.` }),
    h('h5', { text: 'By site type' }),
    h('ul', { class: 'fp-list' }, TYPES.map((ty, t) => h('li', null,
      h('span', null, sw(t), ty[0]), h('span', { text: `${unit(tot(t, 0, rs), 0)}, ${unit(tot(t, 1, rs), 1)}` })))),
    h('h5', { text: i < 0 ? 'Sites' : `Sites shown (${list.length})` }),
    i < 0 ? h('p', { class: 'fp-dim', text: 'Select a region on the map or in the ranking to list its sites.' })
      : list.length ? h('ul', { class: 'fp-list' }, list.map((x) => h('li', null,
        h('span', null, sw(x.t), x.name), h('span', { text: unit(x.b, 1) }))))
        : h('p', { class: 'fp-dim', text: `No ${fname().toLowerCase()} in this region.` }));
}

// W: type split for the selection or for all regions, in the active measure. Not filtered: it is the split itself.
function donut() {
  const rs = S.sel < 0 ? REG : [REG[S.sel]];
  const v = TYPES.map((_, t) => tot(t, S.m, rs)), T = sum(v), C = 2 * Math.PI * 38;
  let off = 0;
  const arcs = v.map((x, t) => {
    if (!x) return null;
    const len = x / T * C;
    const c = s('circle', { cx: 60, cy: 60, r: 38, fill: 'none', stroke: TYPES[t][2], 'stroke-width': 16,
      'stroke-dasharray': `${f1(x < T ? len - 2 : len)} ${f1(C)}`, 'stroke-dashoffset': f1(-off), transform: 'rotate(-90 60 60)' });
    off += len;
    return c;
  });
  ui.donH.textContent = `Split by site type: ${S.sel < 0 ? 'all regions' : REG[S.sel].name}`;
  ui.don.replaceChildren(
    s('svg', { viewBox: '0 0 120 120', 'aria-hidden': 'true' }, arcs, s('text', { x: 60, y: 65, text: num(T) })),
    h('ul', { class: 'fp-list' }, TYPES.map((ty, t) => h('li', null,
      h('span', null, sw(t), ty[0]), h('span', { text: `${unit(v[t])}, ${pct(v[t], T)}` })))));
}

// One render for everything that depends on measure, filter or selection (R2).
function draw(focus) {
  const live = document.activeElement;
  const keep = focus || (live && ui.root.contains(live) && live.dataset.k);
  const P = REG.map((r) => TYPES.map((_, t) => (on(t) ? val(r, t, S.m) : 0)));
  const V = P.map(sum), T = sum(V), max = Math.max(...V, 1);
  const q = max / 5, step = q <= 5 ? Math.ceil(q) : Math.ceil(q / 5) * 5;
  const cls = (v) => (v ? Math.min(4, Math.ceil(v / step) - 1) : -1);
  const order = REG.map((_, i) => i).sort((a, b) => V[b] - V[a] || a - b);
  const rank = [];
  order.forEach((i, k) => { rank[i] = k + 1; });
  D = { V, T, rank };

  ui.tm.forEach((b, m) => b.setAttribute('aria-pressed', String(S.m === m)));
  ui.tf.forEach((b, k) => b.setAttribute('aria-pressed', String(S.f === k - 1)));

  // M: shade the tiles.
  REG.forEach((r, i) => {
    const c = cls(V[i]), hx = ui.hex[i];
    hx.setAttribute('class', c < 0 ? 'fp-hex z' : 'fp-hex');
    hx.setAttribute('fill', c < 0 ? 'none' : RAMP[c]);
    hx.setAttribute('tabindex', i === S.at ? 0 : -1);
    hx.setAttribute('aria-pressed', String(S.sel === i));
    hx.setAttribute('aria-label', `${r.name}: ${unit(V[i])}, rank ${rank[i]} of ${REG.length}. Filter: ${fname()}.`);
    if (!r.out) ui.lab[i].setAttribute('class', c < 0 ? 'fp-lab z' : 'fp-lab');
  });

  // Markers always count sites. Largest first, so the smallest is drawn last and sits on top (R4).
  const mks = REG.map((r, i) => {
    const c = TYPES.map((_, t) => (on(t) ? r.beds[t].length : 0)), n = sum(c);
    return { r, i, c, n, rad: Math.max(MK_MIN, MK_K * Math.sqrt(n)) };
  }).filter((o) => o.n).sort((a, b) => b.rad - a.rad || a.i - b.i);
  const tab = mks.some((o) => o.i === S.at) ? S.at : mks.length ? mks[0].i : -1;
  ui.mk.replaceChildren(...mks.map((o) => marker(o, tab)));

  // G: ramp legend with numeric breaks.
  ui.leg.replaceChildren(
    h('span', { text: `${MEAS[S.m][0]} per region:` }),
    h('span', null, h('i', { class: 'z' }), '0'),
    RAMP.map((c, k) => h('span', null, h('i', { style: `--c:${c}` }),
      step === 1 ? num(k + 1) : `${num(k * step + 1)} to ${num((k + 1) * step)}`)));

  // L: ranked ladder. Bar segments follow TYPES order and colors, the same as the wedges.
  ui.ladH.textContent = `Regions ranked by ${MEAS[S.m][0].toLowerCase()} (${fname().toLowerCase()})`;
  ui.lad.replaceChildren(...order.map((i) => h('li', null,
    h('button', { type: 'button', class: 'fp-row', 'data-k': 'l' + i, 'data-i': i, 'aria-pressed': String(S.sel === i),
      'aria-label': `${rank[i]}. ${REG[i].name}: ${unit(V[i])}${V[i] ? `. ${split(P[i])}` : ''}.` },
      h('span', { class: 'fp-rk', text: rank[i] }), h('span', { text: REG[i].name }), h('b', { text: num(V[i]) }),
      h('span', { class: 'fp-bar' }, P[i].map((v, t) => v > 0 && h('i', { style: `--c:${TYPES[t][2]};width:${f1(v / max * 100)}%` })))))));

  read();
  detail();
  donut();
  const to = keep && ui.root.querySelector(`[data-k="${keep}"]`);
  if (to) to.focus();
}

function select(i) {
  S.sel = S.sel === i ? -1 : i;
  S.at = i;
  draw();
  say(S.sel < 0 ? 'Selection cleared. Showing all regions.'
    : `Selected ${REG[i].name}: ${unit(D.V[i])}, rank ${D.rank[i]} of ${REG.length}. Detail and split updated.`);
}

function onClick(e) {
  const t = e.target.closest('[data-i],[data-m],[data-f]');
  if (!t) return;
  const d = t.dataset;
  if (d.i) { select(+d.i); return; }
  if (d.m) {
    S.m = +d.m;
    draw();
    say(`Shading by ${MEAS[S.m][0].toLowerCase()}. Map, ranking, detail and split updated.`);
  } else {
    S.f = +d.f;
    draw();
    say(`Showing ${fname().toLowerCase()}: ${unit(D.T)} in ${D.V.filter(Boolean).length} of ${REG.length} regions.`);
  }
}

// Map keys: arrows move to the nearest tile (or marker) in that direction, Enter or Space selects.
function onKey(e) {
  const t = e.target.closest('[data-i]');
  if (!t) return;
  const i = +t.dataset.i, kind = t.dataset.k[0], d = DIR[e.key];
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(i); return; }
  if (!d) return;
  e.preventDefault();
  let best = -1, score = 1e9;
  REG.forEach((r, j) => {
    const dx = r.x - REG[i].x, dy = r.y - REG[i].y;
    const along = dx * d[0] + dy * d[1], off = Math.abs(dx * d[1] - dy * d[0]);
    if (j !== i && along > 1 && along + off < score && ui.root.querySelector(`[data-k="${kind}${j}"]`)) { score = along + off; best = j; }
  });
  if (best < 0) return;
  S.at = best;
  draw(kind + best);
}

function onHot(e) {
  const t = e.type === 'pointerover' || e.type === 'focusin' ? e.target.closest('[data-i]') : null;
  S.hot = t ? +t.dataset.i : -1;
  read();
}

const pts = (x, y) => [0, 1, 2, 3, 4, 5].map((k) => {
  const a = Math.PI / 3 * k - Math.PI / 2;
  return `${f1(x + HEX_R * Math.cos(a))},${f1(y + HEX_R * Math.sin(a))}`;
}).join(' ');

export function mount(host) {
  S = { m: 0, f: -1, sel: -1, hot: -1, at: 0 };
  ui = { hex: [], lab: [] };
  host.textContent = '';

  const all = (m) => sum(TYPES.map((_, t) => tot(t, m, REG)));
  const kpi = (label, big, small) => h('div', { class: 'fp-kpi' }, h('small', null, label), h('b', { text: big }), small && h('span', { class: 'fp-dim', text: small }));
  ui.tm = MEAS.map((x, m) => h('button', { type: 'button', class: 'fp-tog', 'data-m': m, text: x[0] }));
  ui.tf = [h('button', { type: 'button', class: 'fp-tog', 'data-f': -1, text: 'All types' })]
    .concat(TYPES.map((x, t) => h('button', { type: 'button', class: 'fp-tog', 'data-f': t }, sw(t), x[0])));

  // M: static map parts. Tiles, labels and leader lines are built once; shading and markers change in draw().
  const hexes = REG.map((r, i) => (ui.hex[i] = s('polygon', { points: pts(r.x, r.y), role: 'button', 'data-k': 'r' + i, 'data-i': i })));
  const labs = REG.map((r, i) => {
    const w = r.name.split(' '), x = r.out ? r.x + 64 : r.x, y = r.out ? r.y + 3 : r.y - 13;
    return (ui.lab[i] = s('text', { class: r.out ? 'fp-lab o' : 'fp-lab', 'aria-hidden': 'true' },
      s('tspan', { x, y: y - 6, text: w[0] }), s('tspan', { x, y: y + 6, text: w[1] })));
  });
  const leads = REG.filter((r) => r.out).map((r) => s('line', { class: 'fp-lead', x1: r.x + 33, y1: r.y, x2: r.x + 60, y2: r.y }));
  ui.mk = s('g');
  const map = s('svg', { class: 'fp-map', viewBox: '0 0 272 360', role: 'group',
    'aria-label': `Map of ${REG.length} pretend regions. Arrow keys move between regions or markers. Enter selects.` },
    hexes, labs, leads, ui.mk);
  map.addEventListener('keydown', onKey);
  ['pointerover', 'pointerout', 'focusin', 'focusout'].forEach((ev) => map.addEventListener(ev, onHot));

  ui.read = h('p', { class: 'fp-read' });
  ui.leg = h('p', { class: 'fp-leg' });
  ui.det = h('section', { class: 'fp-det', 'aria-label': 'Region detail' });
  ui.live = h('p', { class: 'fp-live', role: 'status', 'aria-live': 'polite', text: 'Pick a region on the map or in the ranking. Change the shading or the site type above.' });
  ui.ladH = h('h4');
  ui.lad = h('ol', { class: 'fp-lad' });
  ui.donH = h('h4');
  ui.don = h('div', { class: 'fp-don' });

  ui.root = h('div', { class: 'fp' },
    h('div', { class: 'fp-head' },
      h('p', { class: 'mock', text: 'SAMPLE / MOCK DATA' }),
      h('p', { class: 'fp-title', text: 'Footprint map' }),
      h('p', { class: 'fp-dim', text: `${CO} (pretend company)` })),
    // H: headline stats with the color key.
    h('div', { class: 'fp-kpis' },
      kpi('Total sites', num(all(0))), kpi('Total dragon beds', num(all(1))),
      TYPES.map((x, t) => kpi([sw(t), x[0]], num(tot(t, 0, REG)), `sites, ${unit(tot(t, 1, REG), 1)}`))),
    // T + R2: measure toggle and the one type filter.
    h('div', { class: 'fp-ctl' },
      h('div', { class: 'fp-seg', role: 'group', 'aria-label': 'Shade the map by' }, h('span', { text: 'Shade by' }), ui.tm),
      h('div', { class: 'fp-seg', role: 'group', 'aria-label': 'Site type filter' }, h('span', { text: 'Site type' }), ui.tf)),
    ui.live,
    h('div', { class: 'fp-main' },
      h('div', { class: 'fp-col' }, ui.read, map, ui.leg,
        h('p', { class: 'fp-dim', text: 'Marker size shows sites. Wedges show site types. Dashed tiles have none.' })),
      ui.det),
    h('div', { class: 'fp-main' },
      h('section', { class: 'fp-col', 'aria-label': 'Ranking' }, ui.ladH, ui.lad),
      h('section', { class: 'fp-col', 'aria-label': 'Type split' }, ui.donH, ui.don)));
  ui.root.addEventListener('click', onClick);
  host.append(ui.root);
  draw();
}

export function unmount() { ui = null; S = null; D = null; }
