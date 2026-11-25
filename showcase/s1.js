// S1: Solution Command Center sample. Structure mirrors the real tool; every name, place,
// number and pay rate is invented (pretend industry: dragon daycare).
// No storage, no network. State lives in memory; Reset sample restores the first screen.
// Data rule: nothing animates. Every change lands in one cut.

const SAMPLE_DAY = Date.UTC(2026, 10, 24); // the one fixed sample day; every date is an offset in days from it
const DAY = 864e5;
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CO = 'Smolder & Snooze Dragon Daycare';
const FED = 'Fed by a sourcing tracker worksheet he built with live data connections to the team\'s recruiting systems, and by his own outreach templates for text, email, and messaging.';
const STAGES = ['Sourced', 'Screening', 'Qualified', 'Interview Process Completed', 'No Show', 'Needs More Info'];
const GROUPS = [['same', 'Same-day'], ['hm', 'Hiring Manager Follow-up'], ['fb', 'Interview Feedback'], ['cand', 'Candidate Follow-up']];
const CHANNELS = ['Text', 'Email', 'Job board message', 'LinkedIn'];
const FUNNEL = ['New', 'Recruiter reviewed', 'Manager review', 'Selected to interview', 'Scheduling', 'First interview', 'Second interview', 'Offer', 'Hired', 'Declined'];
const VIEWS = [['today', 'Today', 'to contact'], ['cands', 'Candidates', 'active'], ['reqs', 'Reqs', 'open'], ['log', 'Log', 'changes'], ['more', 'More', '']];
const DISP = ['Withdrew: prefers griffins.', 'Not a fit: flammable hobbies.', 'Position filled.', 'Unreachable after 3 follow-ups.'];
const UNI = ['Are you comfortable near open flame, closed flame and surprise flame?', 'Which shifts can you cover: dawn roar, midday nap or midnight hoard watch?', 'How soon could you start, in moons?'];
const PRIOR = ['Tell me about your last lair: how many dragons, and how large?', 'Why did you leave, and was anything on fire at the time?'];

const REQS = [
  { id: 'R-0042', pos: 'Hatchling Nap Coordinator', loc: 'Ember Hollow Nursery', hm: 'Bog Thimblesnort', status: 'Open', tracker: 'Sourcer Engaged', open: 404,
    pay: '3 gold coins an hour, plus one lightly singed sandwich', funnel: [777, 404, 99, 42, 13, 11, 7, 3, 1, 88], offer: 'No', ident: 'Yes',
    q: ['How many hatchlings can you hum to sleep at once?', 'A hatchling sneezes fire at nap time. Walk me through your next 10 seconds.'] },
  { id: 'R-0077', pos: 'Senior Flame Dampener', loc: 'Mount Singe Lair', hm: 'Mumble Ashpocket', status: 'Open', tracker: 'Offer Generated', open: 1001,
    pay: '12 shiny buttons a fortnight, hazard marshmallows included', funnel: [512, 256, 64, 32, 16, 8, 4, 2, 0, 128], offer: 'Yes', ident: 'Yes',
    q: ['Which do you reach for first: the bucket, the blanket or the stern look?', 'Describe the largest sneeze you have personally dampened.'] },
  { id: 'R-0113', pos: 'Night Shift Hoard Auditor', loc: 'Soot Lake Annex', hm: 'Petunia Cinderwick', status: 'Open', tracker: 'Offer Accepted', open: 9,
    pay: '1 percent of nothing, paid weekly in riddles', funnel: [999, 333, 111, 33, 11, 9, 6, 1, 1, 222], offer: 'Accepted', ident: 'Yes',
    q: ['A goblet is missing and the dragon is awake. How do you word the report?', 'Can you count past one thousand without touching anything shiny?'] },
];

const TPL = {
  Text: [
    ['Quick puff check', 'Hi {n}, sourcing desk at {co}. Still keen on the {r} role? Reply YES, or send one small puff of smoke.'],
    ['Interview nudge', 'Hi {n}, your {r} interview is not booked yet. Which suits you: dawn roar or midday nap?']],
  Email: [
    ['Warm welcome scroll', 'Subject: Your {r} application, lightly toasted. Hello {n}, thank you for applying to {co}. Two quick screening questions follow. No fireproof trousers are needed to answer.'],
    ['Feedback chaser', 'Subject: After your {r} interview. Hello {n}, the keepers are still comparing notes and marshmallows. You will hear from me by the next sample day.']],
  'Job board message': [
    ['Saw your profile', 'Hello {n}, your profile mentions calm nerves and short sleeves. Both suit our {r} opening at {co}. Open to a quick chat?'],
    ['Screening follow-up', 'Hello {n}, thank you for answering the screening questions. One more: how do you feel about glitter in a hoard?']],
  LinkedIn: [
    ['Friendly first note', 'Hi {n}, I source for {co}. Your background looks like a fit for {r}. May I send the details?'],
    ['Gentle second knock', 'Hi {n}, following up on the {r} role. The dragons asked about you. Well, one did.']],
};

let S = null;
let root = null;

const fmt = (off) => {
  const d = new Date(SAMPLE_DAY + off * DAY);
  return `${DOW[d.getUTCDay()]}, ${MON[d.getUTCMonth()]} ${d.getUTCDate()}`;
};

function seed() {
  return {
    view: 'today', filter: 'all', req: null, cand: null, back: { view: 'cands', req: null }, mb: null, draft: '', msg: '', seq: 2,
    cands: [
      { id: 'c1', name: 'Pim Wobblethatch', stage: 1, req: 'R-0042', last: -1, next: 0, fu: 1, src: 'Job board', grade: 'A+ (laminated)', inAts: 'Yes', quest: 'Yes', pref: 'Job board message', sourced: -6,
        ats: 'New. Questionnaire captured.', note: 'Answered every screening question. Asks whether lullabies are required.',
        answered: [['Comfortable near flame?', 'Yes. Earlier reply: "I was raised next to a toaster."'], ['Shifts?', 'Midday nap only. From the questionnaire.']], notes: [] },
      { id: 'c2', name: 'Brisket Toastington', stage: 2, req: 'R-0077', last: -5, next: -2, fu: 2, src: 'Referral from a griffin', grade: 'A', inAts: 'Yes', quest: 'Yes', pref: 'Email', sourced: -14,
        ats: 'Manager review.', note: 'Submitted to the hiring manager. Waiting on review.',
        answered: [['Last lair?', 'Resume lists 40 dragons and one very large goose.']], notes: [[-5, 'Submitted to hiring manager with resume and screening answers.']] },
      { id: 'c3', name: 'Fizzle Underbrook', stage: 3, req: 'R-0077', last: -3, next: -1, fu: 2, src: 'LinkedIn', grade: 'B+', inAts: 'Yes', quest: 'Yes', pref: 'Text', sourced: -21,
        ats: 'Second interview complete. Feedback pending.', note: 'Both interviews done. Keeper feedback not in yet.',
        answered: [['Start date?', 'Two moons. From first interview notes.'], ['Why did you leave?', 'Earlier reply: "Creative differences with a volcano."']], notes: [[-3, 'Second interview went well. Only one eyebrow lost.']] },
      { id: 'c4', name: 'Glorp Nettlewhisk', stage: 5, req: 'R-0113', last: -2, next: 0, fu: 3, src: 'Job board', grade: 'B', inAts: 'Yes', quest: 'Partly', pref: 'Text', sourced: -10,
        ats: 'Recruiter reviewed.', note: 'Still missing proof of fireproof mittens.', answered: [], notes: [] },
      { id: 'c5', name: 'Tansy Emberquill', stage: 0, req: 'R-0042', last: 0, next: 0, fu: 1, src: 'LinkedIn', grade: 'Not graded yet', inAts: 'No', quest: 'No', pref: 'LinkedIn', sourced: -1,
        ats: 'Not in ATS yet.', note: 'Replied to first outreach. Screening questions go out next.', answered: [], notes: [] },
      { id: 'c6', name: 'Dobbin Scorchmitten', stage: 4, req: 'R-0113', last: -4, next: 3, fu: 2, src: 'Hiring fair (cave 3)', grade: 'C', inAts: 'Yes', quest: 'Yes', pref: 'Call', sourced: -18,
        ats: `Disqualified: missed two interviews, said a dragon ate the calendar. ${fmt(-3)}, 2:15 PM.`, note: 'No show twice. One last check-in planned.',
        answered: [['Comfortable near flame?', 'Yes, from the questionnaire. Less so near calendars.']], notes: [] },
      { id: 'c7', name: 'Wilhelmina Crumbsnatch', stage: 2, req: 'R-0113', last: -1, next: 1, fu: 1, src: 'Job board', grade: 'A', inAts: 'Yes', quest: 'Yes', pref: 'Text', sourced: -9,
        ats: 'Selected to interview.', note: 'Needs to pick an interview slot.',
        answered: [['Shifts?', 'Midnight hoard watch preferred. Resume says "nocturnal by choice."']], notes: [] },
    ],
    queue: [
      { id: 'q1', g: 'same', c: 'c1', since: 0, fu: 1, due: 0, ch: ['Job board message'], last: ['Job board message', 'job board inbox'],
        text: 'Answered every screening question overnight. Asks if nap duty includes lullabies. Owes a same-day reply.' },
      { id: 'q2', g: 'same', c: 'c5', since: 0, fu: 1, due: 0, ch: ['LinkedIn'], last: ['LinkedIn', 'chat messages'],
        text: 'New reply to first outreach: interested, wants pay in coins, not buttons. Send screening questions today.' },
      { id: 'q3', g: 'hm', c: 'c2', since: -5, fu: 2, due: -2, ch: ['Email', 'Call'], last: ['Email', 'sent email'],
        text: 'Submitted to Mumble Ashpocket 5 days ago. No review yet. Last exchange: "Busy, lair on fire, back soon."' },
      { id: 'q4', g: 'fb', c: 'c3', since: -3, fu: 2, due: -1, ch: ['Email', 'Text'], last: ['Text', 'chat messages'],
        text: 'Second interview done. Keeper feedback is not in. Candidate has asked twice how it went.' },
      { id: 'q5', g: 'cand', c: 'c4', since: -8, fu: 3, due: 0, ch: ['Text', 'Email', 'Call'], last: ['Text', 'chat messages'],
        text: 'Missing proof of fireproof mittens. Asked twice. Last reply: "They are in the wash."' },
      { id: 'q6', g: 'cand', c: 'c7', since: -1, fu: 1, due: 1, ch: ['Text'], last: ['Call', 'ATS note'],
        text: 'Selected to interview. Needs to pick a slot: dawn roar or midnight hoard watch.' },
    ],
    log: [
      { n: 2, day: -1, kind: 'Note', who: 'Fizzle Underbrook', text: 'Second interview went well. Only one eyebrow lost.' },
      { n: 1, day: -1, kind: 'Stage move', who: 'Wilhelmina Crumbsnatch', text: 'Screening to Qualified.' },
    ],
  };
}

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

const cand = (id) => S.cands.find((c) => c.id === id);
const req = (id) => REQS.find((r) => r.id === id);
const active = () => S.cands.filter((c) => !c.disp);
const say = (m) => { S.msg = m; };
const kv = (k, v) => h('div', null, h('dt', { text: k }), h('dd', null, v));
const badge = (i) => h('span', { class: `scc-badge s${i}`, text: STAGES[i] });
const head = (text) => h('h4', { class: 'scc-h', tabindex: -1, text });
const fill = (t, n, r) => t.replace(/\{n\}/g, n).replace(/\{r\}/g, r).replace(/\{co\}/g, CO);

function addLog(kind, who, text) { S.log.unshift({ n: ++S.seq, day: 0, kind, who, text }); }

// A button runs fn, then re-renders. fn may return a selector to focus; '' focuses the view heading;
// no return value keeps focus on the same button.
function btn(label, key, fn, extra) {
  return h('button', Object.assign({ type: 'button', 'data-k': key, text: label,
    onclick: () => { const to = fn(); render(to === undefined ? `[data-k="${key}"]` : to); } }, extra));
}

function go(view) {
  Object.assign(S, { view, req: null, cand: null, mb: null, msg: '' });
  root.body.scrollTop = 0;
  return '';
}

function openCand(id, ch) {
  S.back = { view: S.view, req: S.req };
  Object.assign(S, { view: 'cands', cand: id, req: null, mb: ch === undefined ? null : { ch, t: null }, msg: '', draft: '' });
  root.body.scrollTop = 0;
  return ch === undefined ? '' : '.scc-mb h5';
}

function goBack() {
  Object.assign(S, { view: S.back.view, req: S.back.req, cand: null, mb: null, msg: '' });
  root.body.scrollTop = 0;
  return '';
}

function markSent(q) {
  const c = cand(q.c);
  S.queue = S.queue.filter((x) => x !== q);
  Object.assign(c, { last: 0, fu: q.fu, next: 2 });
  addLog('Follow-up sent', c.name, `Follow-up ${q.fu} marked sent. ${GROUPS.find((g) => g[0] === q.g)[1]}. ${q.ch.join(', ')}.`);
  say(`Marked sent: follow-up ${q.fu} for ${c.name}. Logged ${fmt(0)}. ${S.queue.length} left to contact today.`);
  return '[data-k^="ms-"]';
}

function touch(c, kind, text) {
  c.last = 0;
  c.fu += 1;
  addLog(kind, c.name, text);
  say(`${text} Logged for ${c.name}, ${fmt(0)}.`);
}

function card(q) {
  const c = cand(q.c), r = req(c.req), late = q.due < 0;
  return h('li', { class: 'scc-card' },
    h('p', { class: 'scc-top' }, h('b', { text: c.name }), ` · ${r.pos} · ${r.loc}`),
    h('p', { text: q.text }),
    h('dl', { class: 'scc-grid' },
      kv('Channels used', q.ch.join(', ')),
      kv('Days waiting', String(-q.since)),
      kv('Follow-up', `Follow-up ${q.fu}`),
      kv('Due', [fmt(q.due), late && h('span', { class: 'scc-late', text: ` Past due by ${-q.due} day${q.due === -1 ? '' : 's'}` })]),
      kv('Last touch', `${q.last[0]} (source: ${q.last[1]})`)),
    h('div', { class: 'scc-row' },
      btn('Mark sent', 'ms-' + q.id, () => markSent(q), { 'aria-label': `Mark sent: ${c.name}, follow-up ${q.fu}` }),
      btn('Message builder', 'mb-' + q.id, () => openCand(c.id, null), { 'aria-label': `Message builder for ${c.name}` }),
      btn('Open candidate', 'oc-' + q.id, () => openCand(c.id), { 'aria-label': `Open candidate ${c.name}` })));
}

function vToday() {
  return [head('Need to contact today'),
    !S.queue.length && h('p', { text: 'Queue clear. Nobody left to contact today.' }),
    GROUPS.map(([k, name]) => {
      const items = S.queue.filter((q) => q.g === k);
      return [h('h5', { text: `${name} (${items.length})` }),
        items.length ? h('ul', { class: 'scc-list' }, items.map(card)) : h('p', { class: 'scc-dim', text: 'Nothing waiting.' })];
    })];
}

function vCands() {
  const list = active().filter((c) => S.filter === 'all' || c.req === S.filter);
  return [head('Active candidates'),
    h('div', { class: 'scc-row', role: 'group', 'aria-label': 'Filter by requisition' },
      [['all', 'All reqs']].concat(REQS.map((r) => [r.id, `${r.id} ${r.pos}`])).map(([k, label]) =>
        btn(label, 'f-' + k, () => { S.filter = k; S.msg = ''; }, { 'aria-pressed': String(S.filter === k) }))),
    h('p', { class: 'scc-dim', text: `${list.length} shown. Open a name for the candidate detail.` }),
    list.length ? h('ul', { class: 'scc-list' }, list.map((c) => {
      const r = req(c.req);
      return h('li', { class: 'scc-card' },
        h('p', { class: 'scc-top' }, btn(c.name, 'o-' + c.id, () => openCand(c.id), { class: 'scc-link', 'aria-label': `Open candidate ${c.name}` }), badge(c.stage)),
        h('p', { text: `${r.id} ${r.pos} · ${r.loc}` }),
        h('dl', { class: 'scc-grid' }, kv('Last contacted', fmt(c.last)), kv('Next follow-up due', fmt(c.next)), kv('ATS status', c.ats)),
        h('p', { text: c.note }));
    })) : h('p', { text: 'No active candidates on this req.' })];
}

function vCand() {
  const c = cand(S.cand), r = req(c.req), mb = S.mb, first = c.name.split(' ')[0];
  const stageSel = h('select', { id: 'scc-stage' }, STAGES.map((s, i) => h('option', { value: i, text: s })));
  stageSel.value = String(c.stage);
  const dispSel = h('select', { id: 'scc-disp' }, DISP.map((s) => h('option', { text: s })));
  const dispTxt = h('input', { id: 'scc-dispd', type: 'text', maxlength: 120 });
  const note = h('textarea', { id: 'scc-note', rows: 2, maxlength: 280, oninput: (e) => { S.draft = e.target.value; } });
  note.value = S.draft;
  const qs = (title, list) => [h('h6', { text: title }), h('ol', null, list.map((q) => h('li', { text: q })))];
  const openMb = (ch) => { S.mb = { ch, t: null }; S.msg = ''; return '.scc-mb h5'; };

  return [h('p', null, btn('← Back', 'back', goBack)),
    h('h4', { class: 'scc-h', tabindex: -1 }, c.name, ' ', badge(c.stage)),
    h('dl', { class: 'scc-grid' },
      kv('Contact', `Preferred channel: ${c.pref}. No numbers or addresses in this sample.`),
      kv('Requisition', `${r.id} ${r.pos} · ${r.loc}`),
      kv('Stage in tracker', STAGES[c.stage]), kv('ATS status', c.ats), kv('Last activity', fmt(c.last)),
      kv('In ATS', c.inAts), kv('Questionnaire captured', c.quest), kv('Resume grade', c.grade), kv('Source', c.src),
      kv('Sourced on', fmt(c.sourced)), kv('Hiring manager', r.hm), kv('Last contacted', fmt(c.last)),
      kv('Follow-up count', String(c.fu)), kv('Next follow-up due', fmt(c.next))),

    h('div', { class: 'scc-row', role: 'group', 'aria-label': 'Actions' },
      btn('Log in ATS/tracker', 'a-log', () => { addLog('ATS/tracker', c.name, 'Logged in ATS and tracker.'); say(`Logged in ATS and tracker for ${c.name}.`); }),
      btn('Leave voicemail', 'a-vm', () => touch(c, 'Outreach', 'Call: voicemail left.')),
      btn('Send text', 'a-tx', () => openMb('Text')),
      btn('Send email', 'a-em', () => openMb('Email')),
      btn('Message builder', 'a-mb', () => openMb(null)),
      btn('Screening', 'a-sc', () => '#scc-scr')),

    mb && h('section', { class: 'scc-mb scc-card', 'aria-label': 'Message builder' },
      h('h5', { tabindex: -1, text: 'Message builder' }),
      h('p', { text: '1. Choose a channel.' }),
      h('div', { class: 'scc-row', role: 'group', 'aria-label': 'Channel' }, CHANNELS.map((ch) =>
        btn(ch, 'ch-' + ch, () => { S.mb = { ch, t: null }; }, { 'aria-pressed': String(mb.ch === ch) }))),
      mb.ch && [h('p', { text: `2. Choose a ${mb.ch} template.` }),
        h('div', { class: 'scc-row', role: 'group', 'aria-label': 'Template' }, TPL[mb.ch].map((t, i) =>
          btn(t[0], 'tp-' + i, () => { S.mb.t = i; }, { 'aria-pressed': String(mb.t === i) })))],
      mb.ch && mb.t != null && [h('p', { text: '3. Check the wording, then send.' }),
        h('p', { class: 'scc-pre', text: fill(TPL[mb.ch][mb.t][1], first, r.pos) }),
        h('p', { class: 'scc-dim', text: 'Sample wording. Nothing leaves this page.' })],
      h('div', { class: 'scc-row' },
        mb.ch && mb.t != null && btn('Send', 'mb-send', () => {
          touch(c, 'Message sent', `${mb.ch}: template "${TPL[mb.ch][mb.t][0]}" sent (sample only).`);
          S.mb = null;
          return '[data-k="a-mb"]';
        }),
        btn('Close builder', 'mb-x', () => { S.mb = null; return '[data-k="a-mb"]'; }))),

    h('h5', { text: 'Notes' }),
    h('label', { for: 'scc-note', text: 'Add a note (writes to the change log)' }), note,
    h('div', { class: 'scc-row' }, btn('Add note', 'n-add', () => {
      const t = S.draft.trim();
      if (!t) { say('Type a note first.'); return '#scc-note'; }
      c.notes.unshift([0, t]);
      addLog('Note', c.name, t);
      S.draft = '';
      say(`Note added for ${c.name} and written to the change log.`);
      return '#scc-note';
    })),
    c.notes.length ? h('ul', { class: 'scc-list' }, c.notes.map((n) => h('li', { class: 'scc-card', text: `${fmt(n[0])} · ${n[1]}` })))
      : h('p', { class: 'scc-dim', text: 'No notes yet.' }),

    h('h5', { text: 'Move Stage' }),
    h('label', { for: 'scc-stage', text: 'New stage' }), stageSel,
    h('div', { class: 'scc-row' }, btn('Record stage move', 'st-rec', () => {
      const to = Number(stageSel.value);
      if (to === c.stage) { say(`${c.name} is already in ${STAGES[to]}.`); return '#scc-stage'; }
      addLog('Stage move', c.name, `${STAGES[c.stage]} to ${STAGES[to]}.`);
      say(`Stage recorded: ${c.name} moved from ${STAGES[c.stage]} to ${STAGES[to]}. Logged.`);
      c.stage = to;
      return '#scc-stage';
    })),

    h('h5', { text: 'Disposition' }),
    h('label', { for: 'scc-disp', text: 'Reason' }), dispSel,
    h('label', { for: 'scc-dispd', text: 'Details (optional)' }), dispTxt,
    h('p', { class: 'scc-dim', text: 'Recorded on this page only. In the real tool the ATS update is routed as a change request.' }),
    h('div', { class: 'scc-row' }, btn('Record disposition', 'dp-rec', () => {
      const d = dispTxt.value.trim();
      c.disp = dispSel.value;
      S.queue = S.queue.filter((q) => q.c !== c.id);
      addLog('Disposition', c.name, c.disp + (d ? ` Details: ${d}` : ''));
      goBack();
      say(`Disposition recorded for ${c.name}: ${c.disp} Removed from active candidates. Logged.`);
      return '';
    })),

    h('h5', { id: 'scc-scr', tabindex: -1, text: 'Screening Questions To Ask' }),
    h('p', { class: 'scc-dim', text: `Template for ${r.pos}.` }),
    qs('Universal questions', UNI), qs('Prior-employer detail', PRIOR), qs('Role-specific technical questions', r.q),
    h('h6', { text: 'Already answered (resume or earlier replies)' }),
    c.answered.length ? c.answered.map((a) => h('details', null, h('summary', { text: a[0] }), h('p', { text: a[1] })))
      : h('p', { class: 'scc-dim', text: 'Nothing answered yet.' })];
}

function vReqs() {
  return [head('Requisitions'),
    h('ul', { class: 'scc-list' }, REQS.map((r) => h('li', { class: 'scc-card' },
      h('p', { class: 'scc-top' }, btn(`${r.id} · ${r.loc}`, 'r-' + r.id, () => { S.req = r.id; S.msg = ''; root.body.scrollTop = 0; return ''; },
        { class: 'scc-link', 'aria-label': `${r.id} · ${r.loc}: open req hub` })),
      h('p', { text: r.pos }),
      h('dl', { class: 'scc-grid' }, kv('Hiring manager', r.hm), kv('Req status', r.status), kv('Tracker status', r.tracker),
        kv('Days open', String(r.open)), kv('Pay rate', r.pay)))))];
}

function vHub() {
  const r = req(S.req), mine = S.queue.filter((q) => cand(q.c).req === r.id);
  return [h('p', null, btn('← All reqs', 'back', () => { S.req = null; S.msg = ''; root.body.scrollTop = 0; return ''; })),
    head(`${r.id} · ${r.pos}`),
    h('dl', { class: 'scc-grid' }, kv('Location', r.loc), kv('Position', r.pos), kv('Hiring manager', r.hm), kv('Req status', r.status),
      kv('Tracker status', r.tracker), kv('Days open', String(r.open)),
      kv('Active sourced candidates', String(active().filter((c) => c.req === r.id).length)),
      kv('Pay rate', r.pay), kv('Offer flag', r.offer), kv('Identified candidate', r.ident)),
    h('h5', { text: 'ATS funnel' }),
    h('dl', { class: 'scc-grid' }, FUNNEL.map((n, i) => kv(n, String(r.funnel[i]))), kv('Total', String(r.funnel.reduce((a, b) => a + b, 0)))),
    h('h5', { text: `Need to contact on this req (${mine.length})` }),
    mine.length ? h('ul', { class: 'scc-list' }, mine.map(card)) : h('p', { class: 'scc-dim', text: 'Nothing waiting on this req.' })];
}

function vLog() {
  return [head('Change log'),
    h('p', { class: 'scc-dim', text: `${S.log.length} entries, newest first.` }),
    h('ul', { class: 'scc-list' }, S.log.map((e) => h('li', { class: 'scc-card' },
      h('p', null, h('b', { text: `#${e.n} · ${fmt(e.day)} · ${e.kind}` })),
      h('p', { text: `${e.who}: ${e.text}` }))))];
}

function vMore() {
  return [head('More'),
    h('h5', { text: 'About this sample' }),
    h('p', { text: `A working sample of the command center's structure. Every name, place, number and pay rate is invented: ${CO} is a pretend employer in a pretend industry.` }),
    h('p', { text: 'Nothing here is stored or sent. Changes live in memory until you reset the sample or leave the page.' }),
    h('h5', { text: 'How it is fed' }),
    h('p', { text: FED }),
    h('div', { class: 'scc-row' }, btn('Reset sample', 'reset', () => {
      S = seed();
      root.body.scrollTop = 0;
      say('Sample reset to the first screen.');
      return '';
    }))];
}

function render(to) {
  const n = { today: S.queue.length, cands: active().length, reqs: REQS.filter((r) => r.status === 'Open').length, log: S.log.length };
  root.nav.forEach((x) => {
    if (x.k === S.view) x.b.setAttribute('aria-current', 'page'); else x.b.removeAttribute('aria-current');
    if (x.ct) {
      x.ct.textContent = String(n[x.k]);
      x.b.setAttribute('aria-label', `${x.name}: ${n[x.k]} ${x.unit}`);
    }
  });
  root.live.textContent = S.msg;
  const v = S.view === 'today' ? vToday() : S.view === 'cands' ? (S.cand ? vCand() : vCands())
    : S.view === 'reqs' ? (S.req ? vHub() : vReqs()) : S.view === 'log' ? vLog() : vMore();
  root.body.replaceChildren(h('div', { class: 'scc-view' }, v));
  if (to === false) return;
  const t = (to && root.body.querySelector(to)) || root.body.querySelector('.scc-h');
  if (t) t.focus();
}

const CSS = `
.scc{--b:#070B14;--p:#0F172A;--a:#6366F1;--t:#F1F5F9;display:flex;flex-direction:column;height:clamp(30rem,80vh,44rem);background:var(--b);color:var(--t);border:1px solid var(--a);border-radius:12px;font-size:.95rem;line-height:1.45;text-align:left}
.scc *{box-sizing:border-box}
.scc h4,.scc h5,.scc h6,.scc p,.scc ul,.scc dl,.scc dd{margin:0;padding:0}
.scc ul{list-style:none}
.scc ol{margin:0;padding-left:1.4rem}
.scc h4{font-size:1.15rem}
.scc h5{font-size:1rem;margin-top:.5rem}
.scc h6{font-size:.9rem}
.scc-head,.scc-ban,.scc-live{padding:.4rem .75rem;background:var(--p)}
.scc-head{display:flex;flex-wrap:wrap;gap:.2rem .75rem;align-items:baseline;border-radius:11px 11px 0 0}
.scc-title{font-weight:700}
.scc-mock{font-weight:700;font-size:.8rem;letter-spacing:.06em}
.scc-ban{font-size:.8rem;border-top:1px solid var(--a);border-bottom:1px solid var(--a)}
.scc-live{min-height:2.2rem;font-weight:600}
.scc-body{flex:1;min-height:0;overflow:auto;padding:.75rem}
.scc-view,.scc-list{display:grid;gap:.6rem}
.scc-card{display:grid;gap:.4rem;padding:.65rem;background:var(--p);border:1px solid var(--a);border-radius:10px}
.scc-top{display:flex;flex-wrap:wrap;gap:.4rem;align-items:center}
.scc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(8.5rem,1fr));gap:.4rem}
.scc-grid>div{padding:.35rem .5rem;background:var(--b);border:1px solid var(--a);border-radius:8px}
.scc dt{font-size:.72rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
.scc dd{overflow-wrap:anywhere}
.scc-row{display:flex;flex-wrap:wrap;gap:.4rem}
.scc button,.scc select,.scc textarea,.scc input{font:inherit;color:var(--t);background:var(--b);border:1px solid var(--a);border-radius:8px;min-height:2.75rem;padding:.4rem .8rem;max-width:100%}
.scc button{cursor:pointer}
.scc select,.scc textarea,.scc input{width:100%}
.scc label{font-weight:600}
.scc :focus-visible{outline:3px solid var(--t);outline-offset:-3px}
.scc [aria-pressed=true],.scc [aria-current]{font-weight:700;box-shadow:inset 0 -4px 0 var(--t)}
.scc-link{font-weight:700;text-decoration:underline}
.scc-badge{display:inline-block;padding:.1rem .55rem;background:var(--b);border:1px solid currentColor;border-radius:999px;font-size:.78rem;font-weight:700}
.scc .s0{color:#93C5FD}
.scc .s1{color:#FCD34D}
.scc .s2{color:#86EFAC}
.scc .s3{color:#C4B5FD}
.scc .s4{color:#FCA5A5}
.scc .s5{color:#FDBA74}
.scc-late{font-weight:700;text-decoration:underline}
.scc-dim{font-size:.85rem}
.scc-pre{padding:.5rem .6rem;background:var(--b);border-left:4px solid var(--a);border-radius:4px}
.scc details{padding:.4rem .6rem;background:var(--p);border:1px solid var(--a);border-radius:8px}
.scc summary{cursor:pointer;font-weight:600;min-height:1.6rem}
.scc-nav{display:grid;grid-template-columns:repeat(5,1fr);gap:.25rem;padding:.4rem;background:var(--p);border-top:1px solid var(--a);border-radius:0 0 11px 11px}
.scc-nav button{display:flex;flex-direction:column;align-items:center;gap:.1rem;padding:.3rem .1rem;font-size:.72rem;overflow-wrap:anywhere}
.scc-ct{min-width:1.6rem;padding:0 .3rem;background:var(--p);border:1px solid var(--a);border-radius:999px;font-weight:700;text-align:center}
`;

/* ===== S1 daily loop: two pretend day files; edits ride over. No storage or network. */
const DQ = [['hi', 'First hello'], ['fu', 'Follow-up due'], ['nz', 'Nudge the sleepy']];
const DST = ['New egg', 'Warming up', 'Chat booked', 'Mitten check', 'Gone dormant'];
const DCH = ['Text', 'Email', 'Job board', 'Professional network'];
const DNEXT = { hi: ['fu', 1], fu: ['nz', 2], nz: ['nz', 3] }; // [queue booked, days later]
const DWHO = {
  a: 'Briar R.|Hatchling Hummer', b: 'Barnaby K.|Smoke Sniffer', c: 'Ivy M.|Nap Cave Attendant',
  d: 'Corwin P.|Scale Polisher', e: 'Della F.|Snack Hoard Clerk', f: 'Ezra L.|Wing Fluffer',
  g: 'Fern O.|Night Hoard Counter', h: 'Gus W.|Ember Sweeper', i: 'Hollis B.|Lullaby Lead',
  j: 'Ione S.|Marshmallow Steward', k: 'Jasper N.|Cave Echo Tester', l: 'Kit A.|Puddle Patroller',
  m: 'Lark D.|Egg Turner', n: 'Milo H.|Blanket Folder', o: 'Nell V.|Flame Dampener',
  p: 'Otto C.|Bucket Brigadier', q: 'Pippa G.|Yawn Monitor', r: 'Quincy E.|Hoard Duster',
};
// Day files: queue -> id+stage, top row first. Day 2 drops m, n.
const DFILES = [
  { hi: 'a0 b0 c0 d1 e0', fu: 'f1 g2 h1 i3 j1', nz: 'k4 l4 m3 n4' },
  { hi: 'o0 p0 q0 r1', fu: 'a1 b1 c2 d1 e1 f2', nz: 'g4 h3 i4 j4 k4 l4' },
];
const DKINDS = ['Sent', 'Stage edits', 'Files'];
let D = null;

const dseed = () => ({ file: 0, today: 0, edits: {}, sent: {}, ticks: {}, booked: {}, log: [], msg: '', copy: '' });
const dwho = (id) => DWHO[id].split('|');
const dq = (q) => DQ.find((x) => x[0] === q)[1];
const dfile = (n) => DQ.map(([q]) => [q, DFILES[n][q].split(' ').map((s) => [s[0], +s[1]])]);
const dgroups = () => DKINDS.map((k) => [k, D.log.filter((e) => e[0] === k).map((e) => e[1])]).filter((g) => g[1].length);
const ddigest = () => [`Daily loop digest, ${fmt(D.file)} (sample)`]
  .concat(dgroups().flatMap(([k, es]) => [`${k} (${es.length})`].concat(es.map((e) => '- ' + e)))).join('\n');

function dqueues() {
  const out = {}, st = {};
  dfile(0).concat(dfile(D.file)).forEach(([, rows]) => rows.forEach(([id, s]) => { st[id] = s; }));
  DQ.forEach(([q]) => { out[q] = []; });
  Object.keys(D.booked).forEach((id) => { const [q, due] = D.booked[id]; if (due === D.file && !D.sent[id]) out[q].push([id, true]); });
  dfile(D.file).forEach(([q, rows]) => rows.forEach(([id]) => { if (!D.booked[id] && !D.sent[id]) out[q].push([id, false]); }));
  return [out, st];
}

function dsend(q, id) {
  const nm = dwho(id)[0], ch = D.ticks[id] || [];
  if (D.today !== D.file) { D.msg = 'Stale file. Load the next day\'s file first.'; return; }
  if (!ch.length) { D.msg = `Tick a channel for ${nm} first.`; return; }
  const [nq, n] = DNEXT[q], due = D.file + n;
  D.sent[id] = true;
  D.booked[id] = [nq, due];
  D.log.push(['Sent', `${nm}: ${dq(q)} by ${ch.join(' + ')}. ${dq(nq)} booked for ${fmt(due)}.`]);
  D.msg = `Sent: ${nm}. Logged; ${dq(nq)} booked for ${fmt(due)}.`;
  return [`#dl-q-${q} ~ ol select`, `#dl-q-${q}`];
}

function dnext() {
  if (D.file) { D.msg = 'Two sample days only. Reset to start over.'; return; }
  if (D.today === D.file) { D.today = 1; D.msg = `${fmt(1)}: the file is still ${fmt(0)}'s, so it is STALE. Press again to load it.`; return; }
  const kept = Object.keys(D.edits).length;
  Object.assign(D, { file: 1, sent: {}, ticks: {}, copy: '',
    log: [['Files', `${fmt(1)} file loaded. Edits kept: ${kept}.`]],
    msg: `${fmt(1)} file loaded: FRESH. Edits kept: ${kept}.` });
}

function dcopy() {
  const t = ddigest();
  const fail = () => {
    if (!D) return;
    Object.assign(D, { copy: t, msg: 'Copy did not work. Digest selected below.' });
    drender('#dl-dg');
    const a = D.body.querySelector('#dl-dg');
    if (a) a.select();
  };
  D.copy = '';
  try { navigator.clipboard.writeText(t).then(() => { if (D) { D.msg = 'Digest copied.'; drender('[data-k="cp"]'); } }, fail); } catch (e) { fail(); }
  return false;
}

function drender(to) {
  if (!D) return;
  const [qs, st] = dqueues(), stale = D.today !== D.file;
  const stageOf = (id) => (id in D.edits ? D.edits[id] : st[id]);
  const mine = (id) => id in D.edits && h('span', { class: 'dl-tag', text: 'your edit' });
  const b = (label, k, fn, x) => h('button', Object.assign({ type: 'button', class: 'ghost', 'data-k': k, text: label,
    onclick: () => { const r = fn(); if (r !== false) drender(r === undefined ? `[data-k="${k}"]` : r); } }, x));
  const row = (q) => ([id, booked], i) => {
    const [nm, role] = dwho(id), s = stageOf(id);
    const top = h('p', null, h('b', { text: `${i + 1}. ${nm}` }), ` · ${role}`, booked && h('span', { class: 'dl-tag', text: 'booked by you' }));
    if (i) return h('li', { class: 'dl-row' }, top, h('p', { class: 'dl-dim' }, `Stage: ${DST[s]}`, mine(id)));
    const ticks = D.ticks[id] || [];
    const sel = h('select', { id: 'dl-st-' + id, onchange: (e) => {
      const v = +e.target.value;
      D.edits[id] = v;
      D.log.push(['Stage edits', `${nm}: ${DST[s]} to ${DST[v]}.`]);
      D.msg = `${nm}: ${DST[v]}. Your edit rides over the next file.`;
      drender('#dl-st-' + id);
    } }, DST.map((x, k) => h('option', { value: k, text: x })));
    sel.value = String(s);
    return h('li', { class: 'dl-row dl-top' }, top,
      h('label', { for: 'dl-st-' + id }, 'Stage', mine(id)), sel,
      h('div', { class: 'dl-ch', role: 'group', 'aria-label': `Channels used for ${nm}` }, DCH.map((c) => b(c, `c-${id}-${c}`, () => {
        D.ticks[id] = ticks.includes(c) ? ticks.filter((x) => x !== c) : ticks.concat(c);
      }, { class: 'tog', 'aria-pressed': String(ticks.includes(c)) }))),
      b('Mark sent', 'ms-' + q, () => dsend(q, id), { 'aria-label': `Mark sent: ${nm}` }));
  };
  const up = Object.keys(D.booked).filter((id) => D.booked[id][1] > D.file).sort((x, y) => D.booked[x][1] - D.booked[y][1]);
  const box = (id, title, ...kids) => h('section', { class: 'dl-box', 'aria-labelledby': id }, h('h5', { id, tabindex: -1, text: title }), kids);
  D.live.textContent = D.msg;
  D.body.replaceChildren(
    h('div', { class: 'dl-bar' },
      h('span', { class: 'dl-badge' + (stale ? ' stale' : ''), text: stale ? 'STALE' : 'FRESH' }),
      h('span', { text: `Data as of ${fmt(D.file)}. ${stale ? `Today is ${fmt(D.today)}: not valid for today.` : 'Valid for today.'}` })),
    h('div', { class: 'dl-bar' },
      b('Next day\'s file (sample)', 'nx', dnext, { 'aria-disabled': String(D.file === 1) }),
      b('Reset loop', 'rs', () => { Object.assign(D, dseed(), { msg: 'Loop reset.' }); })),
    h('div', { class: 'dl-qs' }, DQ.map(([q, name]) => box('dl-q-' + q, `${name} (${qs[q].length})`,
      qs[q].length ? h('ol', null, qs[q].map(row(q))) : h('p', { class: 'dl-dim', text: 'Queue clear.' })))),
    box('dl-up', `Booked for later (${up.length})`, up.length
      ? h('ul', null, up.map((id) => h('li', { text: `${fmt(D.booked[id][1])} · ${dq(D.booked[id][0])} · ${dwho(id)[0]}` })))
      : h('p', { class: 'dl-dim', text: 'Nothing booked yet.' })),
    box('dl-log', `Change log, ${fmt(D.file)} (${D.log.length})`,
      dgroups().map(([k, es]) => [h('b', { text: `${k} (${es.length})` }), h('ul', null, es.map((e) => h('li', { text: e })))]),
      h('p', null, b('Copy digest', 'cp', dcopy)),
      D.copy && [h('label', { for: 'dl-dg', text: 'Digest' }), h('textarea', { id: 'dl-dg', rows: 6, readonly: '', text: D.copy })]));
  D.msg = '';
  const t = [].concat(to || []).map((s) => D.body.querySelector(s)).find(Boolean);
  if (t) t.focus();
}

function dmount(host) {
  D = dseed();
  D.live = h('p', { class: 'dl-live', role: 'status', 'aria-live': 'polite' });
  D.body = h('div', { class: 'dl-body' });
  host.append(h('section', { class: 'dl', 'aria-labelledby': 'dl-h' },
    h('h4', { id: 'dl-h', text: 'The daily loop (sample)' }),
    h('p', { class: 'dl-dim', text: 'Work each queue from the top: tick channels, mark sent, fix a wrong stage. Then load the next day\'s file.' }),
    D.live, D.body));
  drender();
}

export function mount(host) {
  S = seed();
  host.textContent = '';
  host.append(h('style', { text: CSS })); // in the host, not document.head
  const nav = h('nav', { class: 'scc-nav', 'aria-label': 'Command center sections' });
  root = { nav: VIEWS.map(([k, name, unit]) => {
    const ct = unit ? h('span', { class: 'scc-ct' }) : null;
    const b = h('button', { type: 'button', onclick: () => render(go(k)) }, h('span', { text: name }), ct);
    nav.append(b);
    return { k, name, unit, b, ct };
  }) };
  root.live = h('p', { class: 'scc-live', role: 'status', 'aria-live': 'polite' });
  root.body = h('div', { class: 'scc-body', tabindex: 0, role: 'region', 'aria-label': 'Command center view' });
  host.append(h('div', { class: 'scc' },
    h('div', { class: 'scc-head' },
      h('p', { class: 'mock scc-mock', text: 'SAMPLE / MOCK DATA' }),
      h('p', { class: 'scc-title', text: 'Solution Command Center' }),
      h('p', { class: 'scc-dim', text: `${CO} (pretend employer)` })),
    h('p', { class: 'scc-ban', text: `SAMPLE / MOCK DATA. Sample data. Refreshed daily at 6:00 AM. As of ${fmt(0)}, valid for that day.` }),
    root.live, root.body, nav));
  render(false);
  dmount(host);
}

export function unmount() { root = null; S = null; D = null; }
