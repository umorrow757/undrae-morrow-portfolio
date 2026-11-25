// S9: four dashboard tabs on one pretend company (Smolder & Snooze), built from ./kit.js.
// Invented data; totals agree across tabs. No storage, no network, no links.
import { kpiStrip, statusBoard, progressBars, ticker, graph } from './kit.js';

const TONES = { Published: 'ok', Scheduled: 'info', 'In review': 'warn', Draft: 'info', 'On track': 'ok', Testing: 'warn',
  Blocked: 'stop', Full: 'ok', Hiring: 'warn', 'Open seats': 'info', Over: 'stop', Under: 'ok', 'On budget': 'ok' };
const MON = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
const TABS = [
  ['Content pipeline', {
    kpi: [['In the pipeline', 6], ['In review', 2], ['Published this month', 8], ['Avg days to publish', 6]],
    board: ['Pipeline', [['Nap time tips, part 3 (sample)', 'In review'], ['Snack-time safety video (sample)', 'In review'],
      ['Meet the keepers (sample)', 'Draft'], ['Mitten care guide (sample)', 'Draft'], ['Hoard counting 101 (sample)', 'Scheduled', 'Fri'],
      ['Lullaby list (sample)', 'Draft']]],
    bars: ['Published vs. monthly goal', [['Posts', 5, 8], ['Videos', 2, 4], ['Guides', 1, 2]]], // 5 + 2 + 1 = 8 published
    tick: ['Nap time tips, part 2 passed 1,000 reads (sample).', 'Snack-time safety video is with the reviewer.',
      'Two of the three drafts still need a title.'],
    graph: ['Published per week', [['Wk 1', 2], ['Wk 2', 3], ['Wk 3', 1], ['Wk 4', 2]]] }],
  ['App and game building', {
    kpi: [['Builds active', 3], ['Tasks done', '42 of 60'], ['Open bugs', 7], ['Releases this quarter', 2]],
    board: ['Builds', [['Hoard Counter app (sample)', 'On track', '2 open bugs'], ['Ember Dash game (sample)', 'Testing', '4 open bugs'],
      ['Nap Timer (sample)', 'Blocked', '1 open bug: waiting on art']]], // 2 + 4 + 1 = 7
    bars: ['Tasks done per build', [['Hoard Counter', 18, 24], ['Ember Dash', 15, 22], ['Nap Timer', 9, 14]]], // 42 of 60
    tick: ['Hoard Counter now counts past 999 coins.', 'Ember Dash level 3 is in testing.',
      'Nap Timer is waiting on its alarm art.', 'Release 2 shipped Monday.'],
    graph: ['Tasks done per week', [['Wk 1', 8], ['Wk 2', 11], ['Wk 3', 9], ['Wk 4', 14]]] }],
  ['Business', {
    kpi: [['Dragons enrolled', 64], ['Keepers on staff', 9], ['Open roles', 3], ['Waitlist', 12]],
    board: ['Lairs', [['Mount Singe Lair', 'Full', '30 dragons, 4 keepers, 1 open role'],
      ['Ember Hollow Nursery', 'Hiring', '22 dragons, 3 keepers, 1 open role'],
      ['Soot Lake Annex', 'Open seats', '12 dragons, 2 keepers, 1 open role']]], // 64 / 9 / 3
    bars: ['Seats filled', [['Mount Singe Lair', 30, 30], ['Ember Hollow Nursery', 22, 24], ['Soot Lake Annex', 12, 20]]],
    tick: ['Ember Hollow has 2 candidates in interviews for its open role.', 'Soot Lake has 8 open seats.',
      'The waitlist is 12 dragons long.', 'Mount Singe is full.'],
    graph: ['Dragons enrolled by month', MON.map((m, i) => [m, [48, 52, 57, 61, 64][i]]), 'line'] }],
  ['Finance', {
    // Pretend company money only: 64 dragons x $650 = $41,600.
    kpi: [['Revenue, Nov', '$41,600'], ['Costs, Nov', '$33,900'], ['Margin, Nov', '$7,700'], ['Tuition per dragon', '$650 a month']],
    board: ['Cost lines, Nov', [['Keeper pay', 'Under', '$21,000 of $22,000'], ['Marshmallows', 'Over', '$4,800 of $4,000'],
      ['Fireproofing', 'Under', '$5,100 of $6,000'], ['Cave rent', 'On budget', '$3,000 of $3,000']]],
    bars: ['Costs vs. budget, Nov', [['Keeper pay', 21000, 22000], ['Marshmallows', 4800, 4000], ['Fireproofing', 5100, 6000],
      ['Cave rent', 3000, 3000]], '$'], // 33,900 of 35,000
    tick: ['November revenue: $41,600 from 64 dragons.', 'Marshmallows ran $800 over budget.',
      'Revenue is up $1,950 from October.', 'Fireproofing came in $900 under.'],
    graph: ['Revenue by month', MON.map((m, i) => [m, [48, 52, 57, 61, 64][i] * 650]), 'bar', '$'] }],
];

let off = [];
let tabs = [];
let panel = null;
let live = null;

function el(tag, props, ...kids) {
  const e = document.createElement(tag);
  for (const k in props) e.setAttribute(k, props[k]);
  e.append(...kids);
  return e;
}

function show(i, focus) {
  off.forEach((f) => f());
  off = [];
  tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
  const [name, d] = TABS[i];
  panel.setAttribute('aria-labelledby', tabs[i].id);
  const a = el('div', { class: 'dk-col' }), b = el('div', { class: 'dk-col' });
  panel.replaceChildren();
  off.push(kpiStrip(panel, { items: d.kpi }));
  panel.append(a, b);
  off.push(
    statusBoard(a, { title: d.board[0], rows: d.board[1], tones: TONES }),
    progressBars(a, { title: d.bars[0], rows: d.bars[1], prefix: d.bars[2] }),
    ticker(b, { title: 'Latest', items: d.tick }),
    graph(b, { title: d.graph[0], points: d.graph[1], kind: d.graph[2], prefix: d.graph[3] }));
  live.textContent = `${name} tab. Sample data.`;
  if (focus) tabs[i].focus();
}

export function mount(host) {
  unmount();
  host.textContent = '';
  live = el('p', { class: 'dk-live', role: 'status', 'aria-live': 'polite' });
  const list = el('div', { class: 'dk-tabs', role: 'tablist', 'aria-label': 'Dashboard examples' });
  panel = el('div', { class: 'dk-panel', role: 'tabpanel', id: 'dk-panel', tabindex: '0' });
  tabs = TABS.map(([name], i) => {
    const t = el('button', { type: 'button', role: 'tab', id: 'dk-t' + i, 'aria-controls': 'dk-panel', class: 'tog' }, name);
    t.addEventListener('click', () => show(i));
    t.addEventListener('keydown', (e) => {
      const n = TABS.length, k = { ArrowRight: i + 1, ArrowLeft: i - 1 + n, Home: 0, End: n - 1 }[e.key];
      if (k === undefined) return;
      e.preventDefault();
      show(k % n, true);
    });
    list.append(t);
    return t;
  });
  host.append(el('div', { class: 'dk' }, el('p', { class: 'mock' }, 'SAMPLE / MOCK DATA'), list, live, panel));
  show(0);
}

export function unmount() {
  off.forEach((f) => f());
  off = [];
  tabs = [];
  panel = null;
  live = null;
}
