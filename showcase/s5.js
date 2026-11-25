// S5: Sample role page. Nine sections for one open role, written from scratch from a description of the format.
// Pretend world shared with S1 (dragon daycare). Every role, site, name, figure, award and date is invented.
// No storage, no network, no links. Nothing animates: sections open and close in one cut.

const CO = 'Smolder & Snooze Dragon Daycare';
const ROLE = 'Lair Manager';
const SITE = 'Mount Singe Lair';
const SHOW_BUTTONS = true; // set to false to remove every sample button and its note
const NOTE = 'Sample button. Nothing happens on this page.';

// Pay and perk inputs, in cents. Every figure on the page is computed from these, so the working always adds up.
const LOW = 11111;   // $111.11 an hour
const HIGH = 12345;  // $123.45 an hour
const HRS = 40;      // hours a week
const WKS = 52;      // weeks a year
const POD = 25000;   // pretend monthly cost of a fireproof nap pod
const OFF = 40;      // keeper discount, percent
const SAND = 321;    // value of one lightly singed sandwich
const SHIFTS = 5;    // shifts a week

const usd = (c) => '$' + (c / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const week = (c) => c * HRS;
const year = (c) => week(c) * WKS;
const podM = POD * OFF / 100;
const podY = podM * 12;
const sandW = SAND * SHIFTS;
const sandY = sandW * WKS;
const total = (c) => year(c) + podY + sandY;

let ui = null;

function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  for (const k in props || {}) {
    const v = props[k];
    if (v == null || v === false) continue;
    if (k === 'text') e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  kids.flat(Infinity).forEach((c) => c != null && c !== false && e.append(c));
  return e;
}
const p = (text) => h('p', { text });
const h5 = (text) => h('h5', { text });
const ul = (items, cls) => h('ul', { class: cls }, items.map((t) => h('li', { text: t })));
const facts = (rows) => h('dl', { class: 'cp-facts' }, rows.map(([k, v]) => h('div', null, h('dt', { text: k }), h('dd', { text: v }))));

// 3b: inert sample buttons. Each row has its own polite live note beside it. No link, no form, no navigation.
function cta(labels) {
  if (!SHOW_BUTTONS) return null;
  const note = h('span', { class: 'cp-note', role: 'status', 'aria-live': 'polite' });
  return h('div', { class: 'cp-cta' },
    labels.map((t) => h('button', { type: 'button', class: 'cp-btn', text: t, onclick: () => { note.textContent = NOTE; } })), note);
}

const pay = (label, c) => h('li', null, h('b', { text: label }),
  ` ${usd(c)} an hour × ${HRS} hours = ${usd(week(c))} a week. ${usd(week(c))} × ${WKS} weeks = ${usd(year(c))} a year.`);
const sumLine = (label, c) => h('li', null, h('b', { text: label }),
  ` ${usd(year(c))} pay + ${usd(podY)} nap pod discount + ${usd(sandY)} sandwiches = ${usd(total(c))} a year.`);

// The nine sections, in order: heading, then a function that builds the body.
const SECTIONS = [
  [`Hero: ${ROLE}`, () => [
    h('p', { class: 'cp-name', text: `${ROLE}, ${SITE}` }),
    h('p', { class: 'cp-role', text: `${CO} (pretend employer)` }),
    h('p', { class: 'cp-pay' }, h('b', { text: `${usd(LOW)} to ${usd(HIGH)} an hour` }),
      h('span', { text: `${usd(year(LOW))} to ${usd(year(HIGH))} a year at ${HRS} hours a week. Sample dollars. The math is in Pay and Benefits.` })),
    facts([['Schedule', 'Full time, dawn roar shift'], ['Your team', '9 keepers'], ['In your care', '64 dragons, hatchling to elder'], ['Reports to', 'Regional Flame Director']]),
    h('div', { class: 'cp-slot' },
      h('span', { class: 'cp-play', 'aria-hidden': 'true' }),
      p('Team video slot. On a real page, a short video from the team plays here. This sample has no video.')),
    cta(['Apply (sample)', 'Schedule a chat (sample)'])]],

  ['The Role', () => [
    p(`You run ${SITE} day to day: 64 dragons, 9 keepers and one nap schedule that has to work.`),
    p('You hire and train the keepers, keep the lair calm and fire-safe, and take the first call when a hatchling will not settle.'),
    p('You own the lair budget, the marshmallow supply and the safety record. If you have led a team through a busy day and still knew everyone\'s name at the end of it, you can do this job.')]],

  ['Why This Team', () => [
    ul(['Keepers stay. The average keeper here has been on the team for 6 winters.',
      'You get a real hand-off: two weeks beside the outgoing manager, who is retiring to a quieter volcano.',
      'Decisions are made at the lair, not three caves away.',
      'Nobody here has lost an eyebrow since the last sample day.'])]],

  ['The Community', () => [
    h5('The site'),
    p(`${SITE} sits on the warm side of a pretend mountain. It has 64 nap pods, 2 flame-proof play yards, 1 hoard vault and a marshmallow pantry.`),
    h5('The operation you would lead'),
    facts([['Keepers', '9, across three shifts'], ['Shifts', 'Dawn roar, midday nap, midnight hoard watch'], ['Family drop-offs', 'About 40 a day'], ['Loudest hour', 'Just before nap time']])]],

  ['Pay and Benefits', () => [
    h5('Pay, annualized'),
    h('ul', { class: 'cp-math' }, pay('Low end:', LOW), pay('High end:', HIGH)),
    h5('Keeper discount on a nap pod'),
    h('ul', { class: 'cp-math' }, h('li', { text: `${OFF}% off a fireproof nap pod for your own dragon. Pretend monthly cost: ${usd(POD)}. ${OFF}% of ${usd(POD)} = ${usd(podM)} a month. ${usd(podM)} × 12 months = ${usd(podY)} a year.` })),
    h5('One lightly singed sandwich per shift'),
    h('ul', { class: 'cp-math' }, h('li', { text: `Valued at ${usd(SAND)} each. ${usd(SAND)} × ${SHIFTS} shifts = ${usd(sandW)} a week. ${usd(sandW)} × ${WKS} weeks = ${usd(sandY)} a year.` })),
    h5('Total value'),
    h('ul', { class: 'cp-math' }, sumLine('Low end:', LOW), sumLine('High end:', HIGH)),
    h5('Also included'),
    ul(['Fireproof mittens, two pairs a year', '15 days of paid nap time', 'Hazard marshmallows on volcano days'])]],

  ['Where This Role Can Lead', () => [
    h('ol', { class: 'cp-ladder' },
      [['Senior Keeper', 'Where most lair managers start.'], [`${ROLE} (this role)`, 'One lair, one team, one nap schedule.'],
        ['Regional Flame Director', 'Six to eight lairs. Usually after 3 winters.'], ['Vice President of Naps', 'Every lair on the mountain range.']]
        .map(([t, d], i) => h('li', i === 1 ? { class: 'on' } : null, h('b', { text: t }), h('span', { text: d }))))]],

  ['About the Company', () => [
    h5('Mission'), p('Every dragon rested. Every eyebrow intact.'),
    h5('Scale'), p('13 regions, 80 sites and 835 dragon beds, all pretend.'),
    h5('Rankings'),
    ul(['Number 1 Place to Nap, Guild of Sleepy Reptiles, three winters running',
      'Golden Bucket for Fire Safety, Royal Society of Dampeners',
      'Top 10 Hoards to Work Beside, The Goblin Ledger']),
    h5('Timeline'),
    ul(['Year 1: opens in one borrowed cave.', 'Year 4: the first hoard vault.', 'Year 9: the 50th site.', 'Today: 80 sites.']),
    h5('Values'), p('Calm first. Count the hoard twice. Share the marshmallows.')]],

  ['FAQ', () => [
    ['What is the schedule?', 'Dawn roar shift, five days a week, 40 hours. One weekend in four you cover hoard watch.'],
    ['When is payday?', 'Every other Friday, in sample dollars. The sandwich is handed over each shift.'],
    ['What training do I get?', 'Two weeks beside the outgoing manager, then a flame-safety course with a certificate and a commemorative bucket.'],
    ['How do people grow here?', 'Most lair managers were keepers first. The next step is in Where This Role Can Lead.'],
    ['How does the nap pod discount work?', 'It starts on day one, covers one pod, and is for your own dragon only. Borrowed dragons do not count.'],
    ['Do I need my own fireproof gear?', 'No. Mittens are issued on day one.'],
  ].map(([q, a]) => [h5(q), p(a)])],

  ['Next Steps', () => [
    h('ol', { class: 'cp-steps' },
      ['Apply. On this sample page the button does nothing.', 'A 20 minute chat with the recruiter.',
        'A lair visit: meet the keepers and at least one dragon.', 'Offer and start date, usually within two moons.'].map((t) => h('li', { text: t }))),
    p('Your recruiter: Pat Placeholder, Chief Talent Wrangler (sample)'),
    cta(['Schedule a chat (sample)'])]],
];

function setOpen(i, open) {
  const x = ui[i];
  x.btn.setAttribute('aria-expanded', String(open));
  x.panel.hidden = !open;
}

export function mount(host) {
  host.textContent = '';
  ui = [];
  const secs = SECTIONS.map(([title, body], i) => {
    const btn = h('button', { type: 'button', class: 'cp-tog', id: 'cp-h' + i, 'aria-controls': 'cp-p' + i, text: title,
      onclick: () => setOpen(i, btn.getAttribute('aria-expanded') !== 'true') });
    const panel = h('div', { class: 'cp-panel', id: 'cp-p' + i, role: 'region', 'aria-labelledby': 'cp-h' + i }, body());
    ui.push({ btn, panel });
    return h('section', { class: 'cp-sec' }, h('h4', null, btn), panel);
  });
  // In-frame table of contents: opens the section and moves focus to its heading button. No URL change.
  const toc = h('nav', { class: 'cp-toc', 'aria-label': 'Sections of this role page' },
    SECTIONS.map(([title], i) => h('button', { type: 'button', class: 'cp-jump', text: title, onclick: () => { setOpen(i, true); ui[i].btn.focus(); } })));
  SECTIONS.forEach((_, i) => setOpen(i, i < 2)); // Hero and The Role start open
  host.append(h('div', { class: 'cp' }, h('p', { class: 'mock', text: 'SAMPLE / MOCK DATA' }), toc, secs));
}

export function unmount() { ui = null; }
