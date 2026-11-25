// S10: Submittal slate sample. A one-page candidate slate a hiring manager can read in a minute and answer
// in one tap. Pattern only: everything is pretend. The data block below is copied verbatim from
// examples/slate.html (hash A, 11,309 B), so the page and this item always show the same slate.
// No storage, no network. One same-origin link. "Your call" buttons are inert. Nothing animates.

/* ===== SLATE DATA: START =====
   The one source for everything shown on the slate. Batch B (s10) reuses this block as is.
   Every name, place, role and credential is invented. No contact values. No pay figures.
   months = length of the stint; bar width = months / longest stint. */
const SLATE = {
  caption: 'An example of what TwoMorrows HR could do for a business.',
  mock: 'SAMPLE / MOCK DATA',
  masthead: 'Candidate slate',
  eyebrow: 'Smolder & Snooze Dragon Daycare · pretend employer',
  code: 'EQ-07',
  name: 'Ember Q.',
  chips: [['Role', 'Lead Nap Cave Attendant (sample)'], ['Site', 'Mount Singe Lair (pretend)'], ['Status', 'Sample']],
  writeup: 'Ember has spent more than eight years keeping small, loud and now and then flammable creatures calm, fed and asleep on schedule. Runs a nap room from a written checklist, hands off every shift in writing, and has trained new attendants along the way. Ready to lead a crew.',
  strengths: [
    ['Calm when it counts', 'settled a twelve-hatchling nap room after a surprise sneeze of fire, with no blankets singed.'],
    ['Routines that stick', 'wrote the nap cave checklist the last crew still uses.'],
    ['Teaches as the work goes', 'trained four new attendants, and all four stayed on.'],
  ],
  facts: [
    ['Experience', '8 yrs 6 mos in creature care'],
    ['Earliest start', 'Two moons after an offer'],
    ['Shifts', 'Midday nap or dawn roar'],
    ['Credential', 'Fireproof Mitten Safety, Level 2 (pretend)'],
  ],
  roles: [
    { role: 'Nap Cave Attendant', place: 'Soot Lake Annex', months: 42, why: 'Ready to lead a crew, and no lead roles were open there.' },
    { role: 'Hatchling Feeder', place: 'Cinder Creek Creche', months: 28, why: 'Wanted full-time hours. The creche offered part-time only.' },
    { role: 'Egg Turner', place: 'Warm Ledge Hatchery', months: 21, why: 'A seasonal post that ended when hatching season did.' },
    { role: 'Weekend Smoke Watcher', place: 'Puff Hill Stables', months: 11, why: 'A weekend job while training. Left for a full-time post.' },
  ],
  pay: 'Aligned with the posted range.',
  calls: ['Love them', 'Like them', 'Not a fit', 'Feedback'],
  callIdle: 'Sample only. Nothing is sent.',
  recruiter: { name: 'Pat Placeholder', title: 'Chief Talent Wrangler (sample)', note: 'Contact details are left out of this sample.' },
};
/* ===== SLATE DATA: END ===== */

const PAGE = 'examples/slate.html';
let offs = [];

function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  for (const k in props || {}) if (props[k] != null) (k === 'text' ? (e.textContent = props[k]) : e.setAttribute(k, props[k]));
  kids.flat(Infinity).forEach((c) => c != null && c !== false && e.append(c));
  return e;
}

// 42 -> "3 yrs 6 mos"
const dur = (m) => {
  const y = Math.floor(m / 12), r = m % 12;
  return [y && `${y} ${y === 1 ? 'yr' : 'yrs'}`, r && `${r} ${r === 1 ? 'mo' : 'mos'}`].filter(Boolean).join(' ');
};

const blk = (id, title, ...kids) => h('section', { class: 'st-blk', 'aria-labelledby': id }, h('h5', { id, text: title }), kids);

export function mount(host) {
  unmount();
  const D = SLATE, longest = Math.max(...D.roles.map((r) => r.months));
  const note = h('p', { class: 'st-say', role: 'status', 'aria-live': 'polite', text: D.callIdle });
  const calls = D.calls.map((c) => {
    const b = h('button', { type: 'button', class: 'ghost', text: c });
    const on = () => { note.textContent = `Sample: would send '${D.code} - ${c}'`; };
    b.addEventListener('click', on);
    offs.push(() => b.removeEventListener('click', on));
    return b;
  });
  host.textContent = '';
  host.append(h('div', { class: 'st' },
    h('header', { class: 'st-mast' },
      h('p', { class: 'st-k', text: `${D.masthead} \u00B7 ${D.code}` }),
      h('h4', { text: D.name }),
      h('p', { class: 'st-dim', text: D.eyebrow }),
      h('ul', { class: 'st-chips' }, D.chips.map((c) => h('li', { text: `${c[0]}: ${c[1]}` })))),
    h('div', { class: 'st-two' },
      blk('st-w', 'Write-up', h('p', { text: D.writeup })),
      blk('st-s', 'Strengths', h('ul', { class: 'st-str' }, D.strengths.map((s) => h('li', null, h('b', { text: `${s[0]}: ` }), s[1]))))),
    blk('st-f', 'At a glance', h('dl', { class: 'st-facts' }, D.facts.map((f) => h('div', null, h('dt', { text: f[0] }), h('dd', { text: f[1] }))))),
    blk('st-t', 'Past roles, most recent first', h('ul', { class: 'st-time' }, D.roles.map((r) => {
      // Bar width = this stint / the longest stint; the duration is also in text.
      const w = Math.round(r.months / longest * 1000) / 10;
      return h('li', null,
        h('p', null, h('b', { text: r.role }), h('span', { class: 'st-dim', text: ` \u00B7 ${r.place}` })),
        h('span', { class: 'st-track', 'aria-hidden': 'true' }, h('i', { style: `width:${w}%` })),
        h('p', { class: 'st-dur', text: dur(r.months) }));
    }))),
    blk('st-q', 'Why they moved on', h('dl', { class: 'st-qa' }, D.roles.map((r) => h('div', null, h('dt', { text: r.place }), h('dd', { text: r.why }))))),
    h('p', { class: 'st-pay' }, h('b', { text: 'Pay: ' }), D.pay),
    blk('st-c', 'Your call', h('div', { class: 'st-call', role: 'group', 'aria-labelledby': 'st-c' }, calls), note),
    h('p', { class: 'st-rec' }, h('b', { text: D.recruiter.name }), `, ${D.recruiter.title}. `, h('span', { class: 'st-dim', text: D.recruiter.note })),
    h('p', null, h('a', { class: 'textlink', href: PAGE, text: 'Open the full page to print or save as PDF' }))));
}

export function unmount() {
  offs.forEach((f) => f());
  offs = [];
}
